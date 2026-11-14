import { headers } from 'next/headers';
import { z } from 'zod';
import Stripe from 'stripe';
import { prisma } from '@/server/db';
import { getAuthSession, roleOf } from '@/server/auth';
import { audit } from '@/server/audit';
import { jsonError, jsonOk } from '@/server/logger';
import { originAllowed } from '@/server/http-guard';
import { saveSettings, smtpSettings, stripeSettings, type SettingKey } from '@/server/settings';
import { sendTransactionalEmail, smtpTestHtml, verifySmtp } from '@/server/mail';

const optional = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((v) => (v ? v : undefined));

const stripeKeys = (mode: 'test' | 'live') =>
  z.object({
    secretKey: optional.refine((v) => !v || new RegExp(`^(sk|rk)_${mode}_`).test(v), {
      message: `Secret key must start with sk_${mode}_ or rk_${mode}_`,
    }),
    publishableKey: optional.refine((v) => !v || v.startsWith(`pk_${mode}_`), {
      message: `Publishable key must start with pk_${mode}_`,
    }),
    webhookSecret: optional.refine((v) => !v || v.startsWith('whsec_'), {
      message: 'Webhook secret must start with whsec_',
    }),
  });

const schema = z.discriminatedUnion('group', [
  z.object({
    group: z.literal('stripe'),
    mode: z.enum(['test', 'live']),
    test: stripeKeys('test'),
    live: stripeKeys('live'),
    clear: z.array(z.string()).default([]),
  }),
  z.object({
    group: z.literal('smtp'),
    host: optional,
    port: z.coerce.number().int().min(1).max(65535),
    secure: z.boolean(),
    user: optional,
    pass: optional,
    from: optional,
    clear: z.array(z.string()).default([]),
  }),
  z.object({ group: z.literal('stripe-test'), mode: z.enum(['test', 'live']) }),
  z.object({ group: z.literal('stripe-test-charge'), amountPence: z.number().int().min(100).max(100_000_00), description: z.string().max(200).optional() }),
  z.object({ group: z.literal('smtp-test') }),
]);

const CLEARABLE = new Set<string>([
  'stripe.test.secretKey',
  'stripe.test.webhookSecret',
  'stripe.live.secretKey',
  'stripe.live.webhookSecret',
  'smtp.pass',
]);

export async function POST(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await getAuthSession(await headers());
  if (!session || roleOf(session) !== 'ADMIN') {
    return jsonError('Only an administrator can change integrations.', 403);
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Invalid settings.', 400);
  }
  const input = parsed.data;
  const userId = session.user.id;

  if (input.group === 'stripe') {
    const current = await stripeSettings();
    const changes: Partial<Record<SettingKey, string | null>> = { 'stripe.mode': input.mode };
    for (const mode of ['test', 'live'] as const) {
      const keys = input[mode];
      if (keys.secretKey) changes[`stripe.${mode}.secretKey`] = keys.secretKey;
      if (keys.webhookSecret) changes[`stripe.${mode}.webhookSecret`] = keys.webhookSecret;
      changes[`stripe.${mode}.publishableKey`] = keys.publishableKey ?? null;
    }
    for (const key of input.clear) {
      if (CLEARABLE.has(key) && key.startsWith('stripe.')) changes[key as SettingKey] = null;
    }
    const liveSecret =
      changes['stripe.live.secretKey'] === null
        ? undefined
        : changes['stripe.live.secretKey'] || current.live.secretKey;
    if (input.mode === 'live' && !liveSecret) {
      return jsonError('Add a live secret key before switching to live mode.', 400);
    }
    await saveSettings(changes, userId);
    await audit({
      userId,
      action: 'settings.stripe',
      entity: 'AppSetting',
      meta: { mode: input.mode, changed: Object.keys(changes) },
    });
    return jsonOk({ saved: true });
  }

  if (input.group === 'smtp') {
    const changes: Partial<Record<SettingKey, string | null>> = {
      'smtp.host': input.host ?? null,
      'smtp.port': String(input.port),
      'smtp.secure': String(input.secure),
      'smtp.user': input.user ?? null,
      'smtp.from': input.from ?? null,
    };
    if (input.pass) changes['smtp.pass'] = input.pass;
    if (input.clear.includes('smtp.pass')) changes['smtp.pass'] = null;
    await saveSettings(changes, userId);
    await audit({
      userId,
      action: 'settings.smtp',
      entity: 'AppSetting',
      meta: { host: input.host, port: input.port, changed: Object.keys(changes) },
    });
    return jsonOk({ saved: true });
  }

  if (input.group === 'stripe-test-charge') {
    const settings = await stripeSettings();
    const key = settings.test.secretKey;
    if (!key) return jsonError('No test secret key saved. Add your Stripe test keys first.', 400);
    try {
      const stripe = new Stripe(key);
      // Create a PaymentIntent in test mode — this charges the built-in Stripe test funds,
      // producing a real payment record visible in the Stripe test dashboard and in the overview card.
      const pi = await stripe.paymentIntents.create({
        amount: input.amountPence,
        currency: 'gbp',
        payment_method: 'pm_card_visa', // Stripe built-in test card
        payment_method_types: ['card'],
        confirm: true,
        description: input.description || 'Admin test charge (NEVIE Academy)',
        metadata: { kind: 'academy_test_charge', adminId: session.user.id },
        off_session: true,
      });
      // Record the sale in NvAcademyPayment so it shows in the Overview card
      await prisma.nvAcademyPayment.create({
        data: {
          programmeId: 'test',
          amountPence: input.amountPence,
          currency: 'gbp',
          stripeSessionId: pi.id,
          stripePaymentId: pi.id,
          isTest: true,
        },
      });
      await audit({ userId: session.user.id, action: 'stripe.test_charge', entity: 'Payment', entityId: pi.id });
      return jsonOk({ ok: true, paymentIntentId: pi.id, message: `Test charge of £${(input.amountPence / 100).toFixed(2)} succeeded (${pi.id}).` });
    } catch (error) {
      return jsonError(error instanceof Error ? error.message : 'Test charge failed.', 400);
    }
  }

  if (input.group === 'stripe-test') {
    const key = (await stripeSettings())[input.mode].secretKey;
    if (!key) return jsonError(`No ${input.mode} secret key saved.`, 400);
    try {
      const account = await new Stripe(key).accounts.retrieve();
      return jsonOk({
        ok: true,
        message: `Connected to ${account.settings?.dashboard?.display_name || account.id} (${input.mode} mode).`,
      });
    } catch (error) {
      return jsonError(error instanceof Error ? error.message : 'Stripe rejected the key.', 400);
    }
  }

  try {
    await verifySmtp(await smtpSettings());
    await sendTransactionalEmail({
      to: session.user.email,
      subject: 'NEVIE-GLOBAL UK SMTP test',
      html: smtpTestHtml(),
      text: 'SMTP delivery from the NEVIE-GLOBAL UK support mailbox is working.',
    });
    return jsonOk({ ok: true, message: `Test email sent to ${session.user.email}.` });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'SMTP test failed.', 400);
  }
}

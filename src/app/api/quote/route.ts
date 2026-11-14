import { headers } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { getAuthSession } from '@/server/auth';
import { jsonError, jsonOk } from '@/server/logger';
import { clientKey, rateLimit } from '@/server/rate-limit';
import { honeypotTriggered, originAllowed, verifyTurnstile } from '@/server/http-guard';
import { enquiryReceivedHtml, escapeHtml, formNotifyEmails, formNotifyHtml, sendTransactionalEmail } from '@/server/mail';
import { savePrivateUpload } from '@/server/uploads';
import { audit } from '@/server/audit';

const optional = (max: number) => z.string().trim().max(max).optional().default('');

const quoteSchema = z.object({
  kind: z.enum(['quote', 'call', 'chat', 'waitlist', 'demo']).default('quote'),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  company: optional(160),
  phone: optional(40),
  country: optional(80),
  industry: optional(80),
  businessSize: optional(40),
  budget: optional(40),
  timeline: optional(40),
  service: optional(80),
  site: optional(200),
  details: z.string().trim().min(10).max(6000),
  contact: optional(40),
  meeting: optional(40),
  plan: optional(40),
  privacy: z.literal('true'),
  website: z.string().optional(),
  captchaToken: z.string().optional(),
});

export async function POST(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  if (!request.headers.get('content-type')?.includes('multipart/form-data')) {
    return jsonError('Form data required.', 415);
  }
  const limited = await rateLimit(clientKey(request, 'quote'), 30, 10 * 60_000);
  if (!limited.ok) return jsonError('Too many requests. Try again later.', 429);
  const length = Number(request.headers.get('content-length') || 0);
  if (length > 11_000_000) return jsonError('Request is too large.', 413);

  const form = await request.formData();
  const fields = Object.fromEntries(
    Array.from(form.entries()).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );
  const parsed = quoteSchema.safeParse(fields);
  if (!parsed.success) return jsonError('Please check the highlighted fields.', 400);
  const data = parsed.data;
  if (honeypotTriggered(data.website)) return jsonOk({ received: true });
  const ip = clientKey(request, 'ip').slice(3);
  if (!(await verifyTurnstile(data.captchaToken, ip))) return jsonError('Captcha verification failed.', 400);

  let fileKey: string | null = null;
  try {
    const file = form.get('file');
    fileKey = await savePrivateUpload(file instanceof File ? file : null, 'quotes', 10_000_000);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Upload failed.', 400);
  }

  const session = await getAuthSession(await headers());
  const { kind, name, email, company, details, ...extra } = data;
  const rest = Object.fromEntries(
    Object.entries(extra).filter(([key]) => !['website', 'captchaToken', 'privacy'].includes(key)),
  );
  const lead = await prisma.lead.create({
    data: {
      userId: session?.user.id,
      name,
      email,
      company: company || null,
      message: details,
      source: kind,
      details: { ...rest, consentAt: new Date().toISOString() },
      fileKey,
    },
  });
  await audit({ userId: session?.user.id, action: 'lead.create', entity: 'Lead', entityId: lead.id, ip });
  const { notifyUser } = await import('@/server/notify');
  await notifyUser({
    userId: session?.user.id,
    title: 'Quote received',
    body: `We have your ${kind} request and will review it.`,
    href: '/dashboard/quotes',
  });

  try {
    await sendTransactionalEmail({
      to: email,
      subject: 'We received your NEVIE-GLOBAL UK request',
      html: enquiryReceivedHtml(name),
      text: 'We have received your request.',
      replyTo: 'contact@nevie-global.com',
    });
    const ops = formNotifyEmails();
    if (ops.length) {
      const rows = Object.entries(rest)
        .filter(([, value]) => value)
        .map(([key, value]) => `<p style="margin:0 0 8px;"><strong>${escapeHtml(key)}</strong>: ${escapeHtml(String(value))}</p>`)
        .join('');
      await sendTransactionalEmail({
        to: ops,
        subject: `New ${kind} request from ${name}`,
        html: formNotifyHtml({
          name,
          email,
          kind: `${kind} request`,
          rowsHtml: `${rows}${company ? `<p style="margin:0 0 8px;"><strong>Company</strong>: ${escapeHtml(company)}</p>` : ''}${fileKey ? '<p style="margin:0 0 8px;">An attachment is stored on the lead record.</p>' : ''}`,
          message: details,
        }),
        text: details,
        replyTo: email,
      });
    }
  } catch {
    /* Lead is stored even if email delivery is down. */
  }
  return jsonOk({ received: true, id: lead.id });
}

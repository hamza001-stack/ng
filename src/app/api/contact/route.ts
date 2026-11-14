import { headers } from 'next/headers';
import { contactSchema } from '@/lib/validation';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { getAuthSession } from '@/server/auth';
import { jsonError, jsonOk } from '@/server/logger';
import { clientKey, rateLimit } from '@/server/rate-limit';
import { honeypotTriggered, originAllowed, verifyTurnstile } from '@/server/http-guard';
import { enquiryReceivedHtml, escapeHtml, formNotifyEmails, formNotifyHtml, sendTransactionalEmail } from '@/server/mail';
import { audit } from '@/server/audit';

const schema = contactSchema.extend({
  website: z.string().optional(),
  captchaToken: z.string().optional(),
});

export async function POST(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return jsonError('JSON required.', 415);
  }
  const limited = await rateLimit(clientKey(request, 'contact'), 30, 10 * 60_000);
  if (!limited.ok) return jsonError('Too many requests. Try again later.', 429);
  const raw = await request.text();
  if (raw.length > 12000) return jsonError('Request is too large.', 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return jsonError('Invalid request.', 400);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError('Please check the form fields.', 400);
  if (honeypotTriggered(parsed.data.website)) return jsonOk({ received: true });
  const ip = clientKey(request, 'ip').slice(3);
  const captcha = await verifyTurnstile(parsed.data.captchaToken, ip);
  if (!captcha) return jsonError('Captcha verification failed.', 400);

  const session = await getAuthSession(await headers());
  const lead = await prisma.lead.create({
    data: {
      userId: session?.user.id,
      name: parsed.data.name,
      email: parsed.data.email,
      company: parsed.data.company || null,
      message: parsed.data.message,
      source: 'contact',
      details: {
        phone: parsed.data.phone || null,
        interest: parsed.data.interest || null,
      },
    },
  });
  await audit({
    userId: session?.user.id,
    action: 'lead.create',
    entity: 'Lead',
    entityId: lead.id,
    ip,
  });
  try {
    await sendTransactionalEmail({
      to: parsed.data.email,
      subject: 'We received your NEVIE-GLOBAL UK enquiry',
      html: enquiryReceivedHtml(parsed.data.name),
      text: 'We have received your enquiry.',
      replyTo: 'contact@nevie-global.com',
    });
    const ops = formNotifyEmails();
    if (ops.length) {
      const rows = [
        parsed.data.phone ? `<p style="margin:0 0 8px;"><strong>Phone</strong>: ${escapeHtml(parsed.data.phone)}</p>` : '',
        parsed.data.interest ? `<p style="margin:0 0 8px;"><strong>Interest</strong>: ${escapeHtml(parsed.data.interest)}</p>` : '',
        parsed.data.company ? `<p style="margin:0 0 8px;"><strong>Company</strong>: ${escapeHtml(parsed.data.company)}</p>` : '',
      ].join('');
      await sendTransactionalEmail({
        to: ops,
        subject: `New enquiry from ${parsed.data.name}`,
        html: formNotifyHtml({
          name: parsed.data.name,
          email: parsed.data.email,
          kind: 'Contact enquiry',
          rowsHtml: rows,
          message: parsed.data.message,
        }),
        text: parsed.data.message,
        replyTo: parsed.data.email,
      });
    }
  } catch {
    /* Lead is stored even if email delivery is down. */
  }
  return jsonOk({ received: true, id: lead.id });
}

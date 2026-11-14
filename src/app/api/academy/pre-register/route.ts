import { randomBytes } from 'node:crypto';
import { prisma } from '@/server/db';
import { jsonError, jsonOk, log } from '@/server/logger';
import { clientKey, rateLimit } from '@/server/rate-limit';
import { honeypotTriggered, originAllowed } from '@/server/http-guard';
import { preRegistrationSchema } from '@/lib/validation';
import { CONSENT_TEXT, fmtDate } from '@/lib/academy-defaults';
import { getProgramme } from '@/server/academy';
import { academyConfirmationEmail, escapeHtml, formNotifyEmails, sendTransactionalEmail } from '@/server/mail';

export const dynamic = 'force-dynamic';

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function newRef() {
  const bytes = randomBytes(6);
  return 'NV-' + Array.from(bytes, (b: number) => ALPHABET[b % ALPHABET.length]).join('');
}

export async function POST(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const limited = await rateLimit(clientKey(request, 'academy-prereg'), 12, 10 * 60_000);
  if (!limited.ok) return jsonError('Too many requests. Try again later.', 429);
  const raw = await request.text();
  if (raw.length > 8000) return jsonError('Request is too large.', 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return jsonError('Invalid request.', 400);
  }
  const parsed = preRegistrationSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || 'Please check the form fields.', 400);
  if (honeypotTriggered(parsed.data.website)) return jsonOk({ received: true });

  const { name, phone, programmeId, sessionId, experience, message } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  const programme = await getProgramme(programmeId);
  if (!programme) return jsonError('Please choose a programme.', 400);
  const session = sessionId ? programme.sessions.find((s) => s.id === sessionId) : undefined;
  if (sessionId && !session) return jsonError('That start date is no longer available.', 400);

  let ref = '';
  let position = 0;
  try {
    const existing = await prisma.nvAcademyPreRegistration.findUnique({
      where: { email_courseId: { email, courseId: programme.id } },
    });
    const data = {
      name,
      phone: phone || null,
      sessionId: session?.id ?? null,
      experience: experience || null,
      message: message || null,
      consent: true,
      consentAt: new Date(),
      consentText: CONSENT_TEXT,
    };
    let row;
    if (existing) {
      row = await prisma.nvAcademyPreRegistration.update({ where: { id: existing.id }, data });
    } else {
      for (let attempt = 0; attempt < 4 && !row; attempt++) {
        try {
          row = await prisma.nvAcademyPreRegistration.create({
            data: { ...data, email, courseId: programme.id, ref: newRef() },
          });
        } catch (error) {
          if (attempt === 3) throw error; // ref collision is vanishingly rare; retry
        }
      }
    }
    if (!row) throw new Error('create failed');
    ref = row.ref ?? '';
    position = await prisma.nvAcademyPreRegistration.count({
      where: { courseId: programme.id, createdAt: { lte: row.createdAt } },
    });

    // Emails are best-effort: a mail outage must never lose the pre-registration.
    const when = session ? `${fmtDate(session.startsOn)} · ${session.days}` : undefined;
    try {
      const mail = academyConfirmationEmail({ name, ref, programme: programme.title, startDate: when, position });
      const sent = await sendTransactionalEmail({ to: email, ...mail });
      if (!sent.skipped) await prisma.nvAcademyPreRegistration.update({ where: { id: row.id }, data: { emailSentAt: new Date() } });
    } catch (error) {
      log('warn', 'academy_confirmation_failed', { ref, error: error instanceof Error ? error.message : String(error) });
    }
    try {
      await sendTransactionalEmail({
        to: formNotifyEmails(),
        replyTo: email,
        subject: `New Academy pre-registration ${ref}: ${programme.title}`,
        html: `<p><b>${escapeHtml(name)}</b> (${escapeHtml(email)}) joined the waiting list for <b>${escapeHtml(programme.title)}</b> (#${position}).</p>`,
        text: `${name} (${email}) joined the waiting list for ${programme.title} (#${position}). Ref ${ref}.`,
      });
    } catch {
      /* staff notification is optional */
    }
  } catch (error) {
    log('error', 'academy_prereg_failed', { error: error instanceof Error ? error.message : String(error) });
    return jsonError('Pre-registration is unavailable right now. Please try again later.', 503);
  }
  return jsonOk({ received: true, ref, position, programme: programme.title });
}

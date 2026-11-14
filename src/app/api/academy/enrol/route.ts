import { prisma } from '@/server/db';
import { jsonError, jsonOk, log } from '@/server/logger';
import { clientKey, rateLimit } from '@/server/rate-limit';
import { honeypotTriggered, originAllowed } from '@/server/http-guard';
import { enrolmentSchema } from '@/lib/validation';
import { CONSENT_TEXT, fmtDate } from '@/lib/academy-defaults';
import { getProgramme } from '@/server/academy';
import { newReference } from '@/server/academy-ref';
import { academyEnrolmentEmail, escapeHtml, formNotifyEmails, sendTransactionalEmail } from '@/server/mail';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const limited = await rateLimit(clientKey(request, 'academy-enrol'), 10, 10 * 60_000);
  if (!limited.ok) return jsonError('Too many requests. Try again later.', 429);
  const raw = await request.text();
  if (raw.length > 8000) return jsonError('Request is too large.', 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return jsonError('Invalid request.', 400);
  }
  const parsed = enrolmentSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || 'Please check the form fields.', 400);
  if (honeypotTriggered(parsed.data.website)) return jsonOk({ received: true });

  const { name, phone, programmeId, sessionId, goal } = parsed.data;
  const email = parsed.data.email.toLowerCase();
  const programme = await getProgramme(programmeId);
  if (!programme) return jsonError('Please choose a programme.', 400);
  const session = programme.sessions.find((s) => s.id === sessionId);
  if (!session) return jsonError('That start date is no longer available.', 400);

  try {
    const open = await prisma.nvAcademyEnrolment.findFirst({
      where: { email, programmeId: programme.id, status: { notIn: ['DECLINED', 'CANCELLED'] } },
      select: { id: true },
    });
    if (open) {
      return jsonError('You already have an application for this programme. Check your confirmation email, or contact us.', 409);
    }
    const now = new Date();
    let row;
    for (let attempt = 0; attempt < 4 && !row; attempt++) {
      try {
        row = await prisma.nvAcademyEnrolment.create({
          data: {
            ref: newReference('EN'),
            name,
            email,
            phone: phone || null,
            programmeId: programme.id,
            sessionId: session.id,
            goal: goal || null,
            consent: true,
            consentAt: now,
            consentText: CONSENT_TEXT,
            history: [{ status: 'REQUESTED', at: now.toISOString(), by: 'applicant' }],
          },
        });
      } catch (error) {
        if (attempt === 3) throw error;
      }
    }
    if (!row) throw new Error('create failed');

    const when = `${fmtDate(session.startsOn)} · ${session.days}`;
    try {
      await sendTransactionalEmail({
        to: email,
        ...academyEnrolmentEmail({ status: 'REQUESTED', name, ref: row.ref, programme: programme.title, startDate: when }),
      });
    } catch (error) {
      log('warn', 'academy_enrolment_email_failed', { ref: row.ref, error: error instanceof Error ? error.message : String(error) });
    }
    try {
      await sendTransactionalEmail({
        to: formNotifyEmails(),
        replyTo: email,
        subject: `New Academy enrolment request ${row.ref}: ${programme.title}`,
        html: `<p><b>${escapeHtml(name)}</b> (${escapeHtml(email)}) requested a place on <b>${escapeHtml(programme.title)}</b>, ${escapeHtml(when)}. Review it in Admin → Academy → Enrolments.</p>`,
        text: `${name} (${email}) requested a place on ${programme.title}, ${when}. Ref ${row.ref}.`,
      });
    } catch {
      /* optional */
    }
    return jsonOk({ received: true, ref: row.ref, programme: programme.title });
  } catch (error) {
    log('error', 'academy_enrol_failed', { error: error instanceof Error ? error.message : String(error) });
    return jsonError('Enrolment is unavailable right now. Please try again later.', 503);
  }
}

import { prisma } from '@/server/db';
import { jsonError, jsonOk } from '@/server/logger';
import { clientKey, rateLimit } from '@/server/rate-limit';
import { originAllowed } from '@/server/http-guard';
import { enrolmentLookupSchema } from '@/lib/validation';
import { ENROLMENT_LABELS, fmtDate, type EnrolmentStatus } from '@/lib/academy-defaults';
import { getProgramme } from '@/server/academy';

export const dynamic = 'force-dynamic';

type Entry = { status: string; at: string };

/** Applicant status check: reference + email. Never returns staff notes. */
export async function POST(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const limited = await rateLimit(clientKey(request, 'academy-status'), 15, 10 * 60_000);
  if (!limited.ok) return jsonError('Too many requests. Try again later.', 429);
  const parsed = enrolmentLookupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Enter your reference and the email you applied with.', 400);
  let row;
  try {
    row = await prisma.nvAcademyEnrolment.findUnique({ where: { ref: parsed.data.ref } });
  } catch {
    return jsonError('Status check is unavailable right now.', 503);
  }
  if (!row || row.email !== parsed.data.email.toLowerCase()) {
    return jsonError('No application found for that reference and email.', 404);
  }
  const programme = await getProgramme(row.programmeId);
  const session = programme?.sessions.find((s) => s.id === row.sessionId);
  const history = (Array.isArray(row.history) ? (row.history as unknown as Entry[]) : []).map((h) => ({
    status: ENROLMENT_LABELS[h.status as EnrolmentStatus] ?? h.status,
    at: String(h.at).slice(0, 10),
  }));
  return jsonOk({
    ref: row.ref,
    status: row.status,
    label: ENROLMENT_LABELS[row.status as EnrolmentStatus] ?? row.status,
    programme: programme?.title ?? row.programmeId,
    start: session ? `${fmtDate(session.startsOn)} · ${session.days}` : '',
    updated: row.updatedAt.toISOString().slice(0, 10),
    history,
  });
}

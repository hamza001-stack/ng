import { headers } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { requireStaff } from '@/server/staff';
import { audit } from '@/server/audit';
import { jsonError, jsonOk, log } from '@/server/logger';
import { originAllowed } from '@/server/http-guard';
import { ENROLMENT_STATUSES, SEAT_HOLDING, fmtDate, type EnrolmentStatus } from '@/lib/academy-defaults';
import { getProgramme } from '@/server/academy';
import { academyEnrolmentEmail, sendTransactionalEmail } from '@/server/mail';
import { createEnrolmentCheckout } from '@/server/academy-payment';

type Entry = { status: string; at: string; by: string; note?: string };

const holds = (status: string) => SEAT_HOLDING.includes(status as EnrolmentStatus);

export async function PATCH(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const parsed = z
    .object({
      id: z.string().min(1),
      status: z.enum(ENROLMENT_STATUSES),
      staffNote: z.string().trim().max(2000).optional(),
      message: z.string().trim().max(1000).optional(), // shown to the applicant in the email
      notify: z.boolean().default(true),
    })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid update.', 400);
  const { id, status, staffNote, message, notify } = parsed.data;

  let result: { before: string; changed: boolean; row: NonNullable<Awaited<ReturnType<typeof prisma.nvAcademyEnrolment.findUnique>>> };
  try {
    result = await prisma.$transaction(async (tx) => {
      const row = await tx.nvAcademyEnrolment.findUnique({ where: { id } });
      if (!row) throw new Error('Request not found.');
      const before = row.status;
      const changed = before !== status;
      if (changed && row.sessionId) {
        if (holds(status) && !holds(before)) {
          const s = await tx.nvAcademySession.findUnique({ where: { id: row.sessionId } });
          if (!s) throw new Error('The chosen session no longer exists.');
          if (s.taken >= s.seats) throw new Error('No seats left in this session. Choose “On the waiting list” or add seats first.');
          await tx.nvAcademySession.update({ where: { id: s.id }, data: { taken: { increment: 1 } } });
        } else if (!holds(status) && holds(before)) {
          await tx.nvAcademySession.updateMany({ where: { id: row.sessionId, taken: { gt: 0 } }, data: { taken: { decrement: 1 } } });
        }
      }
      const history = Array.isArray(row.history) ? (row.history as unknown as Entry[]) : [];
      const next = changed
        ? [...history, { status, at: new Date().toISOString(), by: session.user.email ?? session.user.id, ...(message ? { note: message } : {}) }]
        : history;
      const updated = await tx.nvAcademyEnrolment.update({
        where: { id },
        data: {
          status,
          staffNote: staffNote ?? row.staffNote,
          history: next,
          ...(changed ? { decidedBy: session.user.id, decidedAt: new Date() } : {}),
        },
      });
      if (changed && holds(status)) {
        await tx.nvAcademyPreRegistration.updateMany({
          where: { email: row.email, courseId: row.programmeId },
          data: { status: 'ENROLLED' },
        });
      }
      return { before, changed, row: updated };
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Update failed.', 400);
  }

  await audit({
    userId: session.user.id,
    action: 'academy.enrolment.status',
    entity: 'AcademyEnrolment',
    entityId: id,
    meta: { from: result.before, to: status },
  });

  let emailed = false;
  if (notify && result.changed) {
    try {
      const programme = await getProgramme(result.row.programmeId);
      const s = programme?.sessions.find((x) => x.id === result.row.sessionId);
      // Approval = send the Stripe "Pay now" link (test or live, whichever mode is active).
      let payUrl: string | undefined;
      let amount: string | undefined;
      if (status === 'APPROVED') {
        try {
          const checkout = await createEnrolmentCheckout(result.row.id);
          if (checkout?.url) {
            payUrl = checkout.url;
            amount = `£${(checkout.amountPence / 100).toLocaleString('en-GB')}${checkout.mode === 'test' ? ' (TEST MODE: no real charge)' : ''}`;
          }
        } catch (error) {
          log('warn', 'academy_checkout_failed', { ref: result.row.ref, error: error instanceof Error ? error.message : String(error) });
        }
      }
      const sent = await sendTransactionalEmail({
        to: result.row.email,
        ...academyEnrolmentEmail({
          status,
          name: result.row.name,
          ref: result.row.ref,
          programme: programme?.title ?? result.row.programmeId,
          startDate: s ? `${fmtDate(s.startsOn)} · ${s.days}` : undefined,
          message,
          payUrl,
          amount,
        }),
      });
      emailed = !sent.skipped;
    } catch (error) {
      log('warn', 'academy_status_email_failed', { ref: result.row.ref, error: error instanceof Error ? error.message : String(error) });
    }
  }
  return jsonOk({ updated: true, emailed });
}

export async function DELETE(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const parsed = z.object({ id: z.string().min(1) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid request.', 400);
  const row = await prisma.nvAcademyEnrolment.findUnique({ where: { id: parsed.data.id } });
  if (row?.sessionId && holds(row.status)) {
    await prisma.nvAcademySession.updateMany({ where: { id: row.sessionId, taken: { gt: 0 } }, data: { taken: { decrement: 1 } } });
  }
  await prisma.nvAcademyEnrolment.deleteMany({ where: { id: parsed.data.id } });
  await audit({ userId: session.user.id, action: 'academy.enrolment.delete', entity: 'AcademyEnrolment', entityId: parsed.data.id });
  return jsonOk({ deleted: true });
}

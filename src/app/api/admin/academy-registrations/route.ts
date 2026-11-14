import { headers } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { requireStaff } from '@/server/staff';
import { audit } from '@/server/audit';
import { jsonError, jsonOk, log } from '@/server/logger';
import { originAllowed } from '@/server/http-guard';
import { newReference } from '@/server/academy-ref';
import { CONSENT_TEXT } from '@/lib/academy-defaults';
import { academyEnrolmentEmail, sendTransactionalEmail } from '@/server/mail';
import { getProgramme } from '@/server/academy';

const REGISTRATION_STATUSES = ['NEW', 'CONTACTED', 'ENROLLED', 'CANCELLED'] as const;

export async function PATCH(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const parsed = z
    .object({
      id: z.string().min(1),
      status: z.enum(REGISTRATION_STATUSES),
      sessionId: z.string().optional(),
    })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid update.', 400);
  const { id, status, sessionId } = parsed.data;

  // Load the pre-registration row
  const reg = await prisma.nvAcademyPreRegistration.findUnique({ where: { id } });
  if (!reg) return jsonError('Pre-registration not found.', 404);

  // Update the pre-registration status
  await prisma.nvAcademyPreRegistration.update({ where: { id }, data: { status } });

  await audit({
    userId: session.user.id,
    action: 'academy.registration.status',
    entity: 'AcademyPreRegistration',
    entityId: id,
    meta: { status },
  });

  // When admin sets ENROLLED: auto-create an enrolment record (if one doesn't exist yet)
  // so the person moves to the Enrolments tab and gets an approval + pay-link email.
  let enrolmentRef: string | null = null;
  if (status === 'ENROLLED') {
    const existing = await prisma.nvAcademyEnrolment.findFirst({
      where: { email: reg.email, programmeId: reg.courseId, status: { notIn: ['DECLINED', 'CANCELLED'] } },
    });
    if (!existing) {
      const now = new Date();
      let ref = '';
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          ref = newReference('EN');
          await prisma.nvAcademyEnrolment.create({
            data: {
              ref,
              name: reg.name,
              email: reg.email,
              phone: reg.phone,
              programmeId: reg.courseId,
              sessionId: sessionId ?? reg.sessionId ?? undefined,
              consent: reg.consent,
              consentAt: reg.consentAt ?? now,
              consentText: CONSENT_TEXT,
              status: 'APPROVED',
              decidedBy: session.user.id,
              decidedAt: now,
              history: [
                { status: 'REQUESTED', at: reg.createdAt.toISOString(), by: 'pre-registration' },
                { status: 'APPROVED', at: now.toISOString(), by: session.user.email ?? session.user.id, note: 'Auto-approved from waiting list' },
              ],
            },
          });
          enrolmentRef = ref;
          break;
        } catch {
          if (attempt === 3) {
            log('error', 'academy_waiting_enrol_failed', { regId: id });
          }
        }
      }

      // Send approval + payment link email
      if (enrolmentRef) {
        try {
          const programme = await getProgramme(reg.courseId);
          if (programme) {
            // Create Stripe checkout link if Stripe is configured
            let payUrl: string | undefined;
            let amount: string | undefined;
            try {
              const { createEnrolmentCheckout } = await import('@/server/academy-payment');
              const enrolRow = await prisma.nvAcademyEnrolment.findUnique({ where: { ref: enrolmentRef } });
              if (enrolRow) {
                const checkout = await createEnrolmentCheckout(enrolRow.id);
                if (checkout?.url) {
                  payUrl = checkout.url;
                  amount = `£${(checkout.amountPence / 100).toLocaleString('en-GB')}${checkout.mode === 'test' ? ' (TEST MODE)' : ''}`;
                }
              }
            } catch (err) {
              log('warn', 'academy_waiting_checkout_failed', { ref: enrolmentRef, error: String(err) });
            }

            await sendTransactionalEmail({
              to: reg.email,
              ...academyEnrolmentEmail({
                status: 'APPROVED',
                name: reg.name,
                ref: enrolmentRef,
                programme: programme.title,
                payUrl,
                amount,
              }),
            });
          }
        } catch (err) {
          log('warn', 'academy_waiting_email_failed', { ref: enrolmentRef, error: String(err) });
        }
      }
    }
  }

  return jsonOk({ updated: true, enrolmentRef });
}

export async function DELETE(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const parsed = z.object({ id: z.string().min(1) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid request.', 400);
  await prisma.nvAcademyPreRegistration.deleteMany({ where: { id: parsed.data.id } });
  await audit({ userId: session.user.id, action: 'academy.registration.delete', entity: 'AcademyPreRegistration', entityId: parsed.data.id });
  return jsonOk({ deleted: true });
}

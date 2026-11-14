import 'server-only';
import { prisma } from '@/server/db';
import { activeStripeKeys, getStripe } from '@/server/stripe';
import { getProgramme } from '@/server/academy';
import { publicSiteUrl } from '@/lib/site';

/**
 * Creates (or reuses) a Stripe Checkout session for an approved enrolment.
 * Uses whichever mode is active in Admin > Settings (test or live), so going live
 * later only means switching the mode and adding the live keys: no code change.
 * Returns null when Stripe is not configured, so approval still works without it.
 */
export async function createEnrolmentCheckout(enrolmentId: string) {
  const { secretKey, mode } = await activeStripeKeys();
  if (!secretKey) return null;
  const row = await prisma.nvAcademyEnrolment.findUnique({ where: { id: enrolmentId } });
  if (!row || row.paymentStatus === 'PAID') return null;
  const programme = await getProgramme(row.programmeId);
  if (!programme || programme.price <= 0) return null;

  const amountPence = Math.round(programme.price * 100);
  const stripe = await getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: row.email,
    client_reference_id: row.ref,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'gbp',
          unit_amount: amountPence,
          product_data: { name: `NEVIE Academy: ${programme.title}`, description: `Reference ${row.ref}` },
        },
      },
    ],
    metadata: { enrolmentId: row.id, ref: row.ref, programmeId: row.programmeId, kind: 'academy' },
    success_url: `${publicSiteUrl()}/academy/status?paid=1&ref=${encodeURIComponent(row.ref)}`,
    cancel_url: `${publicSiteUrl()}/academy/status?cancelled=1&ref=${encodeURIComponent(row.ref)}`,
    expires_at: Math.floor(Date.now() / 1000) + 23 * 3600,
  });

  await prisma.nvAcademyEnrolment.update({
    where: { id: row.id },
    data: {
      paymentStatus: 'PENDING',
      amountPence,
      currency: 'gbp',
      stripeSessionId: session.id,
      paymentIsTest: mode === 'test',
    },
  });
  return { url: session.url, amountPence, mode };
}

export async function academySales() {
  const rows = await prisma.nvAcademyPayment.findMany({ orderBy: { paidAt: 'desc' }, take: 2000 });
  const sum = (test: boolean) => rows.filter((r) => r.isTest === test).reduce((n, r) => n + r.amountPence, 0);
  const count = (test: boolean) => rows.filter((r) => r.isTest === test).length;
  return {
    livePence: sum(false),
    liveCount: count(false),
    testPence: sum(true),
    testCount: count(true),
  };
}

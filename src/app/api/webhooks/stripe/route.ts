import { prisma } from '@/server/db';
import { getStripe, stripeWebhookSecret } from '@/server/stripe';
import { log } from '@/server/logger';
import { audit } from '@/server/audit';
import { sendTransactionalEmail, orderEmailHtml } from '@/server/mail';
import { money } from '@/lib/utils';
import { academyEnrolmentEmail } from '@/server/mail';
import { getProgramme } from '@/server/academy';
import { fmtDate } from '@/lib/academy-defaults';

export async function POST(request: Request) {
  const secret = await stripeWebhookSecret();
  if (!secret) {
    return new Response('Webhook secret missing', { status: 503 });
  }
  const signature = request.headers.get('stripe-signature');
  if (!signature) return new Response('Missing signature', { status: 400 });
  const raw = await request.text();
  let event;
  try {
    event = (await getStripe()).webhooks.constructEvent(raw, signature, secret);
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    const enrolmentId = session.metadata?.kind === 'academy' ? session.metadata?.enrolmentId : undefined;
    if (enrolmentId) {
      const paymentId =
        typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
      const row = await prisma.nvAcademyEnrolment.findUnique({ where: { id: enrolmentId } });
      if (row && row.paymentStatus !== 'PAID' && session.payment_status === 'paid') {
        const now = new Date();
        const history = Array.isArray(row.history) ? (row.history as unknown[]) : [];
        await prisma.$transaction(async (tx) => {
          // Seat was already taken at approval; ENROLLED also holds a seat, so no double count.
          await tx.nvAcademyEnrolment.update({
            where: { id: row.id },
            data: {
              status: 'ENROLLED',
              paymentStatus: 'PAID',
              stripePaymentId: paymentId,
              paidAt: now,
              history: [...history, { status: 'ENROLLED', at: now.toISOString(), by: 'stripe', note: 'Payment received' }],
            },
          });
          await tx.nvAcademyPayment.upsert({
            where: { stripeSessionId: session.id },
            update: {},
            create: {
              enrolmentId: row.id,
              programmeId: row.programmeId,
              amountPence: session.amount_total ?? row.amountPence ?? 0,
              currency: session.currency ?? 'gbp',
              stripeSessionId: session.id,
              stripePaymentId: paymentId,
              isTest: !event.livemode,
              paidAt: now,
            },
          });
          await tx.nvAcademyPreRegistration.updateMany({
            where: { email: row.email, courseId: row.programmeId },
            data: { status: 'ENROLLED' },
          });
        });
        await audit({ action: 'academy.enrolment.paid', entity: 'AcademyEnrolment', entityId: row.id });
        try {
          const programme = await getProgramme(row.programmeId);
          const s = programme?.sessions.find((x) => x.id === row.sessionId);
          await sendTransactionalEmail({
            to: row.email,
            ...academyEnrolmentEmail({
              status: 'ENROLLED',
              name: row.name,
              ref: row.ref,
              programme: programme?.title ?? row.programmeId,
              startDate: s ? `${fmtDate(s.startsOn)} · ${s.days}` : undefined,
            }),
          });
        } catch (error) {
          log('error', 'academy_paid_email_failed', { ref: row.ref, detail: error instanceof Error ? error.message : 'unknown' });
        }
      }
    } else if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (order && order.status === 'PENDING') {
        await prisma.$transaction(async (tx) => {
          for (const item of order.items) {
            const updated = await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });
            if (updated.stock < 0) throw new Error('stock_conflict');
          }
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: 'PAID',
              stripePaymentId:
                typeof session.payment_intent === 'string'
                  ? session.payment_intent
                  : session.payment_intent?.id,
            },
          });
          if (order.userId) {
            const userCart = await tx.cart.findFirst({ where: { userId: order.userId } });
            if (userCart) await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
          }
        });
        await audit({
          action: 'order.paid',
          entity: 'Order',
          entityId: order.id,
          userId: order.userId,
        });
        const { notifyUser } = await import('@/server/notify');
        await notifyUser({
          userId: order.userId,
          title: 'Payment received',
          body: `Order ${order.id.slice(0, 8).toUpperCase()} is paid.`,
          href: `/dashboard/orders/${order.id}`,
        });
        try {
          await sendTransactionalEmail({
            to: order.email,
            subject: `Order confirmed ${order.id.slice(0, 8).toUpperCase()}`,
            html: orderEmailHtml(order.id, money(order.totalPence / 100)),
            text: `Order ${order.id} confirmed. Total ${money(order.totalPence / 100)}.`,
          });
        } catch (error) {
          log('error', 'order_email_failed', {
            orderId: order.id,
            detail: error instanceof Error ? error.message : 'unknown',
          });
        }
      }
    }
  }

  if (
    event.type === 'charge.refunded' ||
    event.type === 'charge.refund.updated'
  ) {
    const charge = event.data.object as { payment_intent?: string; amount_refunded?: number; amount?: number };
    if (charge.payment_intent) {
      const order = await prisma.order.findFirst({
        where: { stripePaymentId: charge.payment_intent },
      });
      if (order) {
        const refunded = charge.amount_refunded ?? 0;
        const amount = charge.amount ?? order.totalPence;
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: refunded >= amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
          },
        });
      }
    }
  }

  return new Response('ok');
}

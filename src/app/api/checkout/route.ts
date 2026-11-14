import { headers } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { getAuthSession } from '@/server/auth';
import { getOrCreateCart, mergeGuestCart } from '@/server/cart';
import { applyVat, getStripe, shippingPence, stripeEnabled } from '@/server/stripe';
import { jsonError, jsonOk } from '@/server/logger';
import { originAllowed } from '@/server/http-guard';
import { clientKey, rateLimit } from '@/server/rate-limit';
import { publicSiteUrl } from '@/lib/site';
import { audit } from '@/server/audit';

const bodySchema = z.object({
  coupon: z.string().max(40).optional(),
  name: z.string().trim().min(2).max(120),
  email: z.email(),
  phone: z.string().trim().max(40).optional(),
  line1: z.string().trim().min(3).max(120),
  line2: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2).max(80),
  postcode: z.string().trim().min(3).max(16),
  country: z.string().trim().min(2).max(80),
});

export async function POST(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  if (!(await stripeEnabled())) {
    return jsonError('Checkout is not available until Stripe is configured.', 503);
  }
  const limited = await rateLimit(clientKey(request, 'checkout'), 20, 60_000);
  if (!limited.ok) return jsonError('Too many requests.', 429);
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return jsonError('Invalid checkout request.', 400);

  const session = await getAuthSession(await headers());
  const cart = session?.user.id
    ? await mergeGuestCart(session.user.id)
    : await getOrCreateCart(null);
  const full = await prisma.cart.findUniqueOrThrow({
    where: { id: cart.id },
    include: { items: { include: { product: true } }, coupon: true },
  });
  if (!full.items.length) return jsonError('Your bag is empty.', 400);

  for (const item of full.items) {
    if (item.quantity > item.product.stock) {
      return jsonError(`${item.product.name} does not have enough stock.`, 409);
    }
  }

  let coupon = full.coupon;
  if (parsed.data.coupon) {
    coupon = await prisma.coupon.findFirst({
      where: {
        code: parsed.data.coupon.toUpperCase(),
        active: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
    if (!coupon) return jsonError('This coupon is not valid.', 400);
    await prisma.cart.update({
      where: { id: full.id },
      data: { couponId: coupon.id },
    });
  }

  const subtotal = full.items.reduce(
    (sum, item) => sum + item.product.pricePence * item.quantity,
    0,
  );
  const discount = coupon ? Math.round((subtotal * coupon.percent) / 100) : 0;
  const net = Math.max(0, subtotal - discount);
  const shipping = shippingPence();
  const vat = applyVat(net + shipping);
  const total = net + shipping + vat;
  const email = parsed.data.email || session?.user.email;
  if (!email) return jsonError('Enter an email to checkout.', 400);

  const order = await prisma.order.create({
    data: {
      userId: session?.user.id,
      email,
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      line1: parsed.data.line1,
      line2: parsed.data.line2 || null,
      city: parsed.data.city,
      postcode: parsed.data.postcode,
      country: parsed.data.country,
      status: 'PENDING',
      subtotalPence: subtotal,
      discountPence: discount,
      shippingPence: shipping,
      vatPence: vat,
      totalPence: total,
      couponId: coupon?.id,
      items: {
        create: full.items.map((item) => ({
          productId: item.productId,
          name: item.product.name,
          quantity: item.quantity,
          unitPence: item.product.pricePence,
        })),
      },
    },
  });

  const factor = subtotal > 0 ? net / subtotal : 1;
  const stripe = await getStripe();
  const productLines = full.items
    .map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: 'gbp' as const,
        unit_amount: Math.max(0, Math.round(item.product.pricePence * factor)),
        product_data: { name: item.product.name },
      },
    }))
    .filter((line) => line.price_data.unit_amount > 0);
  const extraLines = [
    ...(shipping
      ? [
          {
            quantity: 1,
            price_data: {
              currency: 'gbp' as const,
              unit_amount: shipping,
              product_data: { name: 'Shipping' },
            },
          },
        ]
      : []),
    ...(vat
      ? [
          {
            quantity: 1,
            price_data: {
              currency: 'gbp' as const,
              unit_amount: vat,
              product_data: { name: 'VAT' },
            },
          },
        ]
      : []),
  ];
  const checkout = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: email,
    success_url: `${publicSiteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${publicSiteUrl()}/checkout/cancel`,
    metadata: {
      orderId: order.id,
      name: parsed.data.name,
      phone: parsed.data.phone || '',
      line1: parsed.data.line1,
      city: parsed.data.city,
      postcode: parsed.data.postcode,
      country: parsed.data.country,
    },
    line_items: [...productLines, ...extraLines],
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: checkout.id },
  });
  await audit({
    userId: session?.user.id,
    action: 'checkout.start',
    entity: 'Order',
    entityId: order.id,
  });
  const { notifyUser } = await import('@/server/notify');
  await notifyUser({
    userId: session?.user.id,
    title: 'Order placed',
    body: `Order ${order.id.slice(0, 8).toUpperCase()} is waiting for payment.`,
    href: `/dashboard/orders/${order.id}`,
  });
  if (!checkout.url) return jsonError('Unable to start Stripe Checkout.', 502);
  return jsonOk({ url: checkout.url, orderId: order.id });
}

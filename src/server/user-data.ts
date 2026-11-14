import 'server-only';
import { prisma } from './db';
import { quoteLabel } from '@/lib/order-status';

export type CustomerOrderRow = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  payment: string;
  shipping: string;
  items: { productId: string; name: string; quantity: number; unit: number }[];
  name: string | null;
  email: string;
};

export async function customerOrders(userId: string, email: string) {
  const rows = await prisma.order.findMany({
    where: { OR: [{ userId }, { email }] },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: 80,
  });
  return rows.map((order) => ({
    id: order.id,
    status: order.status,
    total: order.totalPence / 100,
    createdAt: order.createdAt.toISOString(),
    payment: order.status,
    shipping: order.status,
    items: order.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      unit: item.unitPence / 100,
    })),
    name: order.name,
    email: order.email,
    phone: order.phone,
    line1: order.line1,
    line2: order.line2,
    city: order.city,
    postcode: order.postcode,
    country: order.country,
    subtotal: order.subtotalPence / 100,
    vat: order.vatPence / 100,
    shippingPence: order.shippingPence / 100,
    discount: order.discountPence / 100,
    stripePaymentId: order.stripePaymentId,
    updatedAt: order.updatedAt.toISOString(),
  }));
}

export async function customerOrder(userId: string, email: string, id: string) {
  const orders = await customerOrders(userId, email);
  return orders.find((order) => order.id === id) || null;
}

export async function customerQuotes(userId: string, email: string) {
  const rows = await prisma.lead.findMany({
    where: { OR: [{ userId }, { email }] },
    orderBy: { createdAt: 'desc' },
    take: 80,
  });
  return rows.map((lead) => ({
    id: lead.id,
    status: lead.status,
    statusLabel: quoteLabel(lead.status),
    source: lead.source,
    company: lead.company,
    message: lead.message,
    notes: lead.notes,
    hasFile: Boolean(lead.fileKey),
    createdAt: lead.createdAt.toISOString(),
  }));
}

export async function customerWishlist(userId: string) {
  const rows = await prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: { include: { category: true } } },
    orderBy: { id: 'desc' },
  });
  return rows.map((row) => ({
    id: row.product.id,
    name: row.product.name,
    price: row.product.pricePence / 100,
    category: row.product.category.name,
    slug: row.product.slug,
    imageUrl: row.product.imageUrl,
    stock: row.product.stock,
    published: row.product.published,
  }));
}

export async function customerNotifications(userId: string) {
  return prisma.userNotification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 80,
  });
}

export async function customerHome(userId: string, email: string, name: string, image: string | null) {
  const [orders, quotes, wishlist, notifications, newsletter] = await Promise.all([
    customerOrders(userId, email),
    customerQuotes(userId, email),
    customerWishlist(userId),
    customerNotifications(userId),
    prisma.newsletterSubscriber.findUnique({ where: { email } }),
  ]);

  const active = orders.filter((order) =>
    !['FULFILLED', 'CANCELLED', 'REFUNDED', 'FAILED'].includes(order.status),
  );
  const latest = orders[0];
  const profileChecks = [
    Boolean(name?.trim()),
    Boolean(email),
    Boolean(image),
    Boolean(latest?.phone),
    Boolean(latest?.line1 && latest?.city && latest?.postcode),
  ];
  const profileCompletion = Math.round((profileChecks.filter(Boolean).length / profileChecks.length) * 100);

  return {
    orders,
    quotes,
    wishlist,
    notifications: notifications.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.body,
      href: item.href,
      read: item.read,
      createdAt: item.createdAt.toISOString(),
    })),
    newsletter: Boolean(newsletter),
    profileCompletion,
    address: latest
      ? {
          name: latest.name,
          phone: latest.phone,
          line1: latest.line1,
          line2: latest.line2,
          city: latest.city,
          postcode: latest.postcode,
          country: latest.country,
        }
      : null,
    unread: notifications.filter((item) => !item.read).length,
    activeCount: active.length,
  };
}

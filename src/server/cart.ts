import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from './db';
import type { Product } from '@prisma/client';

const COOKIE = 'nevie_guest_cart';

function secret() {
  const value = process.env.BETTER_AUTH_SECRET;
  if (!value) throw new Error('BETTER_AUTH_SECRET is required for cart cookies');
  return value;
}

function sign(value: string) {
  const hmac = createHmac('sha256', secret()).update(value).digest('hex');
  return `${value}.${hmac}`;
}

function readSigned(raw: string | undefined) {
  if (!raw) return null;
  const split = raw.lastIndexOf('.');
  if (split < 1) return null;
  const value = raw.slice(0, split);
  const hmac = raw.slice(split + 1);
  const expected = createHmac('sha256', secret()).update(value).digest('hex');
  const a = Buffer.from(hmac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return value;
}

export async function guestKeyFromCookies() {
  const jar = await cookies();
  return readSigned(jar.get(COOKIE)?.value);
}

export async function persistGuestKey(guestKey: string) {
  const jar = await cookies();
  jar.set(COOKIE, sign(guestKey), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearGuestKey() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getOrCreateCart(userId?: string | null) {
  if (userId) {
    const existing = await prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });
    if (existing) return existing;
    return prisma.cart.create({ data: { userId }, include: { items: true } });
  }
  let guestKey = await guestKeyFromCookies();
  if (guestKey) {
    const existing = await prisma.cart.findUnique({
      where: { guestKey },
      include: { items: true },
    });
    if (existing) return existing;
  }
  guestKey = crypto.randomUUID();
  const cart = await prisma.cart.create({
    data: { guestKey },
    include: { items: true },
  });
  await persistGuestKey(guestKey);
  return cart;
}

export async function mergeGuestCart(userId: string) {
  const guestKey = await guestKeyFromCookies();
  const userCart = await getOrCreateCart(userId);
  if (!guestKey) return userCart;
  const guestCart = await prisma.cart.findUnique({
    where: { guestKey },
    include: { items: true },
  });
  if (!guestCart || guestCart.id === userCart.id) {
    await clearGuestKey();
    return userCart;
  }
  for (const item of guestCart.items) {
    const match = userCart.items.find((row) => row.productId === item.productId);
    if (match) {
      await prisma.cartItem.update({
        where: { id: match.id },
        data: { quantity: Math.min(99, match.quantity + item.quantity) },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: item.productId,
          quantity: item.quantity,
        },
      });
    }
  }
  await prisma.cart.delete({ where: { id: guestCart.id } });
  await clearGuestKey();
  return getOrCreateCart(userId);
}

export function moneyFromPence(pence: number) {
  return pence / 100;
}

export function lineTotal(product: Pick<Product, 'pricePence'>, quantity: number) {
  return product.pricePence * quantity;
}

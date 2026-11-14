import 'server-only';
import type { Role } from '@prisma/client';
import { redirect } from 'next/navigation';
import { getAuthSession, roleOf } from './auth';
import { prisma } from './db';

async function rejectSuspended(userId: string) {
  try {
    const row = await prisma.user.findUnique({
      where: { id: userId },
      select: { suspended: true },
    });
    if (row?.suspended) redirect('/sign-in');
  } catch {
    // Column may not exist until the next database push.
  }
}

const rank: Record<Role, number> = {
  CUSTOMER: 1,
  STAFF: 2,
  MANAGER: 3,
  ADMIN: 4,
  SUPER_ADMIN: 5,
};

export function can(role: Role | null, minimum: Role) {
  if (!role) return false;
  return rank[role] >= rank[minimum];
}

export function isOperator(role: Role | null) {
  return can(role, 'STAFF');
}

export async function requireSession(headers: Headers) {
  const session = await getAuthSession(headers);
  if (!session) redirect('/sign-in');
  await rejectSuspended(session.user.id);
  return session;
}

/** Staff or above. Console pages render nothing without it. */
export async function consoleAccess(headers: Headers) {
  const session = await getAuthSession(headers);
  const role = roleOf(session);
  if (!session || !isOperator(role)) return null;
  try {
    const row = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { suspended: true },
    });
    if (row?.suspended) return null;
  } catch {
    // Column may not exist until the next database push.
  }
  return { session, role: role as Role };
}

export async function requireRole(headers: Headers, minimum: Role) {
  const session = await requireSession(headers);
  const role = roleOf(session);
  if (!can(role, minimum)) redirect('/dashboard');
  return { session, role: role as Role };
}

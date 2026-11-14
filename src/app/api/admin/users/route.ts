import { headers } from 'next/headers';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '@/server/db';
import { auth, getAuthSession, roleOf } from '@/server/auth';
import { can } from '@/server/rbac';
import { audit } from '@/server/audit';
import { jsonError, jsonOk } from '@/server/logger';
import { originAllowed } from '@/server/http-guard';
import { publicSiteUrl } from '@/lib/site';

const schema = z.object({
  id: z.string().min(1),
  role: z.enum(['CUSTOMER', 'STAFF', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']).optional(),
  action: z.enum(['suspend', 'unsuspend', 'resetPassword', 'revokeSessions']).optional(),
});

export async function PATCH(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await getAuthSession(await headers());
  const actor = roleOf(session);
  if (!can(actor, 'MANAGER')) return jsonError('Forbidden.', 403);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid user update.', 400);

  const target = await prisma.user.findUnique({
    where: { id: parsed.data.id },
    select: { id: true, email: true, role: true, name: true },
  });
  if (!target) return jsonError('User not found.', 404);
  if (target.id === session?.user.id && parsed.data.action === 'suspend') {
    return jsonError('You cannot suspend your own account.', 409);
  }

  if (parsed.data.action === 'resetPassword') {
    const api = auth.api as {
      requestPasswordReset?: (args: { body: { email: string; redirectTo: string } }) => Promise<unknown>;
      forgetPassword?: (args: { body: { email: string; redirectTo: string } }) => Promise<unknown>;
    };
    const body = { email: target.email, redirectTo: `${publicSiteUrl()}/reset-password` };
    if (api.requestPasswordReset) await api.requestPasswordReset({ body });
    else if (api.forgetPassword) await api.forgetPassword({ body });
    else {
      await fetch(`${publicSiteUrl()}/api/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
    }
    await audit({
      userId: session?.user.id,
      action: 'user.resetPassword',
      entity: 'User',
      entityId: target.id,
    });
    return jsonOk({ updated: true });
  }

  if (parsed.data.action === 'revokeSessions' || parsed.data.action === 'suspend') {
    await prisma.session.deleteMany({ where: { userId: target.id } });
  }
  if (parsed.data.action === 'suspend' || parsed.data.action === 'unsuspend') {
    try {
      await prisma.user.update({
        where: { id: target.id },
        data: { suspended: parsed.data.action === 'suspend' },
      });
    } catch {
      if (parsed.data.action !== 'suspend') throw new Error('Unable to restore this account yet.');
    }
    await audit({
      userId: session?.user.id,
      action: parsed.data.action === 'suspend' ? 'user.suspend' : 'user.unsuspend',
      entity: 'User',
      entityId: target.id,
    });
    return jsonOk({ updated: true });
  }
  if (parsed.data.action === 'revokeSessions') {
    await audit({
      userId: session?.user.id,
      action: 'user.revokeSessions',
      entity: 'User',
      entityId: target.id,
    });
    return jsonOk({ updated: true });
  }

  if (!parsed.data.role) return jsonError('Invalid user update.', 400);
  if (parsed.data.role === 'SUPER_ADMIN' && actor !== 'SUPER_ADMIN') {
    return jsonError('Only a super administrator can grant that role.', 403);
  }
  if (parsed.data.role === 'ADMIN' && !can(actor, 'ADMIN')) {
    return jsonError('Only an administrator can grant that role.', 403);
  }
  if (parsed.data.role === 'MANAGER' && !can(actor, 'ADMIN')) {
    return jsonError('Only an administrator can grant manager access.', 403);
  }
  if (
    parsed.data.id === session?.user.id &&
    !can(parsed.data.role as Role, 'ADMIN') &&
    can(actor, 'ADMIN')
  ) {
    const operators = await prisma.user.count({
      where: { role: { in: [Role.ADMIN, Role.SUPER_ADMIN] } },
    });
    if (operators <= 1) return jsonError('The last administrator cannot be demoted.', 409);
  }
  await prisma.user.update({
    where: { id: parsed.data.id },
    data: { role: parsed.data.role },
  });
  await audit({
    userId: session?.user.id,
    action: 'user.role',
    entity: 'User',
    entityId: parsed.data.id,
    meta: { role: parsed.data.role },
  });
  return jsonOk({ updated: true });
}

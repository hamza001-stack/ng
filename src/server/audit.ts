import 'server-only';
import { prisma } from './db';
import { log } from './logger';

export async function audit(input: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string;
  ip?: string | null;
  meta?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId || undefined,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        ip: input.ip,
        meta: input.meta ? JSON.parse(JSON.stringify(input.meta)) : undefined,
      },
    });
  } catch (error) {
    log('error', 'audit_write_failed', {
      action: input.action,
      detail: error instanceof Error ? error.message : 'unknown',
    });
  }
}

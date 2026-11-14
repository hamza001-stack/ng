import { headers } from 'next/headers';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { getAuthSession, roleOf } from '@/server/auth';
import { can } from '@/server/rbac';
import { audit } from '@/server/audit';
import { jsonError, jsonOk } from '@/server/logger';
import { originAllowed } from '@/server/http-guard';
import { plans as defaultPlans } from '@/lib/editorial';

const planIds = new Set<string>(defaultPlans.map((plan) => plan.id));

const saveSchema = z.object({
  id: z.string().refine((id) => planIds.has(id), 'Unknown plan.'),
  name: z.string().trim().min(2).max(60),
  tagline: z.string().trim().min(2).max(160),
  price: z.string().trim().min(1).max(60),
  priceNote: z.string().trim().min(1).max(100),
  points: z.array(z.string().trim().min(1).max(120)).max(10),
  cta: z.string().trim().min(2).max(60),
  featured: z.boolean(),
});

// Prices are commercial content: managers and above only.
async function manager() {
  const session = await getAuthSession(await headers());
  return can(roleOf(session), 'MANAGER') ? session : null;
}

export async function PUT(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await manager();
  if (!session) return jsonError('Forbidden. Pricing needs a manager role.', 403);
  const parsed = saveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Check the plan fields.', 400);
  const { id, ...data } = parsed.data;
  await prisma.nvPricingPlan.upsert({
    where: { id },
    create: { id, ...data, updatedBy: session.user.id },
    update: { ...data, updatedBy: session.user.id },
  });
  revalidateTag('pricing');
  await audit({ userId: session.user.id, action: 'pricing.save', entity: 'PricingPlan', entityId: id });
  return jsonOk({ saved: true });
}

export async function DELETE(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await manager();
  if (!session) return jsonError('Forbidden. Pricing needs a manager role.', 403);
  const parsed = z.object({ id: z.string().min(1) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid plan.', 400);
  await prisma.nvPricingPlan.deleteMany({ where: { id: parsed.data.id } });
  revalidateTag('pricing');
  await audit({ userId: session.user.id, action: 'pricing.reset', entity: 'PricingPlan', entityId: parsed.data.id });
  return jsonOk({ reset: true });
}

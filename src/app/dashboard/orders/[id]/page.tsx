import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { UserOrderDetail } from '@/features/workspace/user-views';
import { customerOrder } from '@/server/user-data';
import { requireSession } from '@/server/rbac';

export default async function CustomerOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession(await headers());
  const { id } = await params;
  const order = await customerOrder(session.user.id, session.user.email, id);
  if (!order) notFound();
  return <UserOrderDetail order={order} />;
}

import { UserHome } from '@/features/workspace/user-views';
import { customerHome } from '@/server/user-data';
import { requireSession } from '@/server/rbac';
import { headers } from 'next/headers';

export default async function DashboardHomePage() {
  const session = await requireSession(await headers());
  const data = await customerHome(
    session.user.id,
    session.user.email,
    session.user.name,
    session.user.image ?? null,
  );
  return (
    <UserHome
      name={session.user.name}
      orderCount={data.orders.length}
      activeCount={data.activeCount}
      quoteCount={data.quotes.length}
      wishlistCount={data.wishlist.length}
      unread={data.unread}
      profileCompletion={data.profileCompletion}
      recentOrders={data.orders}
    />
  );
}

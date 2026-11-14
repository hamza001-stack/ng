import { notFound } from 'next/navigation';
import { userSections } from '@/lib/workspace-ia';
import {
  UserDownloads,
  UserNotifications,
  UserOrders,
  UserProfile,
  UserQuotes,
  UserSettings,
  UserSupport,
  UserWishlist,
} from '@/features/workspace/user-views';
import { customerHome } from '@/server/user-data';
import { requireSession } from '@/server/rbac';
import { headers } from 'next/headers';

export function generateStaticParams() {
  return userSections.map((section) => ({ section }));
}

export default async function DashboardSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!userSections.includes(section)) notFound();
  const session = await requireSession(await headers());
  const data = await customerHome(
    session.user.id,
    session.user.email,
    session.user.name,
    session.user.image ?? null,
  );

  if (section === 'orders') {
    return <UserOrders rows={data.orders} />;
  }
  if (section === 'wishlist') {
    return <UserWishlist items={data.wishlist} />;
  }
  if (section === 'quotes') {
    return <UserQuotes rows={data.quotes} />;
  }
  if (section === 'notifications') {
    return <UserNotifications items={data.notifications} />;
  }
  if (section === 'support') {
    return <UserSupport tickets={data.quotes} />;
  }
  if (section === 'downloads') {
    return <UserDownloads invoices={data.orders} />;
  }
  if (section === 'profile') {
    return (
      <UserProfile
        name={session.user.name}
        email={session.user.email}
        image={session.user.image ?? null}
        address={data.address}
      />
    );
  }
  if (section === 'settings') {
    return <UserSettings newsletter={data.newsletter} />;
  }
  notFound();
}

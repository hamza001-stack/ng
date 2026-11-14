import { Inter } from 'next/font/google';
import '@/app/workspace.css';
import { WorkspaceShell } from '@/features/workspace/shell';
import { metadata as makeMetadata } from '@/lib/seo';
import { roleOf } from '@/server/auth';
import { requireSession } from '@/server/rbac';
import { customerNotifications } from '@/server/user-data';
import { headers } from 'next/headers';

const adminSans = Inter({ subsets: ['latin'] });

export const metadata = makeMetadata(
  'Account',
  'Your NEVIE-GLOBAL UK account for orders, quotes and billing.',
  '/dashboard',
  true,
);

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession(await headers());
  const notes = await customerNotifications(session.user.id);
  return (
    <WorkspaceShell
      variant="user"
      name={session.user.name}
      email={session.user.email}
      role={roleOf(session) || 'CUSTOMER'}
      className={adminSans.className}
      activity={notes.slice(0, 8).map((item) => ({
        id: item.id,
        action: item.title,
        entity: item.read ? 'Read' : 'Unread',
        actor: '',
        createdAt: item.createdAt.toISOString(),
      }))}
    >
      {children}
    </WorkspaceShell>
  );
}

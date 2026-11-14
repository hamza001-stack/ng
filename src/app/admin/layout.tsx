import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import '@/app/workspace.css';
import { WorkspaceShell } from '@/features/workspace/shell';
import { StaffSignIn } from '@/features/workspace/staff-access';
import type { Metadata } from 'next';
import { adminBase } from '@/lib/admin-path';
import { getAuthSession, roleOf } from '@/server/auth';
import { can } from '@/server/rbac';
import { adminActivity } from '@/server/admin-data';

const adminSans = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Console',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const base = adminBase();
  if (!base) notFound();
  const session = await getAuthSession(await headers());
  if (!session) {
    return (
      <div className={`console-root ${adminSans.className}`}>
        <StaffSignIn />
      </div>
    );
  }
  const role = roleOf(session);
  if (!can(role, 'STAFF')) notFound();
  const activity = await adminActivity();
  return (
    <div className="console-root">
      <WorkspaceShell
        variant="admin"
        name={session.user.name}
        email={session.user.email}
        role={role ?? 'STAFF'}
        activity={activity}
        adminBase={base}
        className={adminSans.className}
      >
        {children}
      </WorkspaceShell>
    </div>
  );
}

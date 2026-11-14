import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { can, consoleAccess } from '@/server/rbac';
import { adminAcademy } from '@/server/admin-data';
import { AcademyAdmin, type AcademyTab } from './admin';

const tabs: AcademyTab[] = ['overview', 'programmes', 'sessions', 'waiting', 'enrolments'];

/** Shared by /admin/academy and /admin/academy/[tab]. */
export async function AcademyAdminPage({ tab }: { tab: string }) {
  if (!tabs.includes(tab as AcademyTab)) notFound();
  const access = await consoleAccess(await headers());
  if (!access) return null;
  const data = await adminAcademy();
  return <AcademyAdmin tab={tab as AcademyTab} canEditPrices={can(access.role, 'MANAGER')} {...data} />;
}

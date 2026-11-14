import { AdminHome } from '@/features/workspace/admin-home';
import { adminDashboard } from '@/server/admin-data';
import { adminBase } from '@/lib/admin-path';
import { consoleAccess } from '@/server/rbac';
import { headers } from 'next/headers';

export default async function AdminHomePage() {
  if (!(await consoleAccess(await headers()))) return null;
  const data = await adminDashboard();
  return <AdminHome data={data} adminBase={adminBase() || '/admin'} />;
}

import { headers } from 'next/headers';
import { getAuthSession, roleOf } from '@/server/auth';
import { can } from '@/server/rbac';
import { adminBase } from '@/lib/admin-path';

export async function GET() {
  const session = await getAuthSession(await headers());
  const base = adminBase();
  if (!base || !can(roleOf(session), 'STAFF')) {
    return new Response('Not found', { status: 404 });
  }
  return new Response(null, {
    status: 302,
    headers: { Location: base, 'Cache-Control': 'private, no-store' },
  });
}

import 'server-only';
import { getAuthSession, roleOf } from './auth';
import { can } from './rbac';

export async function requireStaff(headers: Headers) {
  const session = await getAuthSession(headers);
  if (!can(roleOf(session), 'STAFF')) return null;
  return session;
}

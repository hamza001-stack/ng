import { headers } from 'next/headers';
import { getAuthSession, roleOf } from '@/server/auth';
import { jsonOk } from '@/server/logger';

export async function GET() {
  const session = await getAuthSession(await headers());
  if (!session) return jsonOk({ user: null });
  return jsonOk({
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: roleOf(session),
    },
  });
}

import { prisma } from '@/server/db';
import { jsonError, jsonOk } from '@/server/logger';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return jsonOk({
      status: 'ok',
      time: new Date().toISOString(),
    });
  } catch {
    return jsonError('Database unavailable.', 503);
  }
}

import { headers } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { getAuthSession } from '@/server/auth';
import { jsonOk, jsonError } from '@/server/logger';
import { originAllowed } from '@/server/http-guard';

const schema = z.object({ choice: z.enum(['accepted', 'essential']) });

export async function POST(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid consent choice.', 400);
  const session = await getAuthSession(await headers());
  await prisma.cookieConsent.create({
    data: {
      userId: session?.user.id,
      choice: parsed.data.choice,
    },
  });
  return jsonOk({ stored: true });
}

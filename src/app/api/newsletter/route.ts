import { z } from 'zod';
import { prisma } from '@/server/db';
import { jsonError, jsonOk } from '@/server/logger';
import { clientKey, rateLimit } from '@/server/rate-limit';
import { honeypotTriggered, originAllowed, verifyTurnstile } from '@/server/http-guard';
import { newsletterSchema } from '@/lib/validation';

const schema = newsletterSchema.extend({
  website: z.string().optional(),
  captchaToken: z.string().optional(),
});

export async function POST(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const limited = await rateLimit(clientKey(request, 'newsletter'), 20, 10 * 60_000);
  if (!limited.ok) return jsonError('Too many requests. Try again later.', 429);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Please check the form fields.', 400);
  if (honeypotTriggered(parsed.data.website)) return jsonOk({ received: true });
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!(await verifyTurnstile(parsed.data.captchaToken, ip))) {
    return jsonError('Captcha verification failed.', 400);
  }
  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: { consent: true },
    create: { email: parsed.data.email, consent: true },
  });
  return jsonOk({ received: true });
}

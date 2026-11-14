import 'server-only';
import { prisma } from './db';

export async function notifyUser(input: {
  userId?: string | null;
  title: string;
  body: string;
  href?: string | null;
}) {
  if (!input.userId) return;
  await prisma.userNotification.create({
    data: {
      userId: input.userId,
      title: input.title,
      body: input.body,
      href: input.href || null,
    },
  });
}

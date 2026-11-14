import { PrismaClient, Role } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

const prisma = new PrismaClient();
const production = process.env.NODE_ENV === 'production';
if (production && (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required to create the production admin');
}
const email = process.env.ADMIN_EMAIL || 'admin@nevie.local';
const password = process.env.ADMIN_PASSWORD || 'ChangeThisAdmin12';

const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  baseURL: process.env.BETTER_AUTH_URL || 'http://127.0.0.1:3100',
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 12,
  },
  user: {
    additionalFields: {
      role: { type: 'string', required: false, defaultValue: 'CUSTOMER', input: false },
    },
  },
});

async function main() {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const result = await auth.api.signUpEmail({
      body: { email, password, name: 'Platform Admin' },
    });
    if (!result) throw new Error('Admin signup failed');
  }
  const admin = await prisma.user.update({
    where: { email },
    data: { role: Role.ADMIN, emailVerified: true, twoFactorEnabled: false },
  });
  await prisma.twoFactor.deleteMany({ where: { userId: admin.id } });
  if (existing?.twoFactorEnabled) {
    await prisma.session.deleteMany({ where: { userId: admin.id } });
  }
  console.log(`Admin ready: ${email}`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

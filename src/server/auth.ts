import 'server-only';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { twoFactor } from 'better-auth/plugins';
import { prisma } from './db';
import { publicSiteUrl } from '@/lib/site';
import { sendTransactionalEmail, resetPasswordHtml, verifyEmailHtml } from './mail';
import { log } from './logger';
import type { Role } from '@prisma/client';

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  baseURL: process.env.BETTER_AUTH_URL || publicSiteUrl(),
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [publicSiteUrl()],
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'CUSTOMER',
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
    minPasswordLength: 12,
    sendResetPassword: async ({ user, url }) => {
      await sendTransactionalEmail({
        to: user.email,
        subject: 'Reset your NEVIE-GLOBAL UK password',
        html: resetPasswordHtml(user.name, url),
        text: `Reset your password: ${url}`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await sendTransactionalEmail({
          to: user.email,
          subject: 'Confirm your NEVIE-GLOBAL UK account',
          html: verifyEmailHtml(user.name, url),
          text: `Confirm your account: ${url}`,
        });
      } catch (error) {
        log('error', 'verification_email_failed', {
          detail: error instanceof Error ? error.message : 'unknown',
        });
        throw error;
      }
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
    defaultCookieAttributes: {
      sameSite: 'lax',
      httpOnly: true,
    },
  },
  plugins: [
    twoFactor({
      issuer: 'NEVIE-GLOBAL UK',
      backupCodeOptions: { amount: 10, length: 10 },
    }),
    nextCookies(),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;

const ROLES: Role[] = ['CUSTOMER', 'STAFF', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'];

export function roleOf(session: AuthSession | null): Role | null {
  if (!session?.user) return null;
  const role = (session.user as { role?: string }).role;
  return ROLES.includes(role as Role) ? (role as Role) : 'CUSTOMER';
}

export async function getAuthSession(headers: Headers) {
  return auth.api.getSession({ headers });
}

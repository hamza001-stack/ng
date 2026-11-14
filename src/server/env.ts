import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined))
  .pipe(z.string().url().optional());

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  BETTER_AUTH_URL: z.string().url(),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url()
    .refine(
      (url) => !url.includes('chatgpt.site'),
      'NEXT_PUBLIC_SITE_URL must be the real production or local origin',
    ),
  REDIS_URL: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  SMTP_SECURE: z.enum(['true', 'false']).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  FORM_NOTIFY_EMAILS: z.string().optional(),
  REQUIRE_EMAIL_VERIFICATION: z.enum(['true', 'false']).optional(),
  ADMIN_PATH: z
    .string()
    .regex(/^[A-Za-z0-9_-]{12,64}$/, 'ADMIN_PATH must be 12-64 letters, digits, - or _')
    .optional(),
  SETTINGS_ENCRYPTION_KEY: z.string().min(32).optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  SENTRY_DSN: optionalUrl,
  VAT_RATE_BPS: z.coerce.number().int().min(0).max(10000).default(2000),
  SHIPPING_PENCE: z.coerce.number().int().min(0).default(0),
  LEGAL_COMPANY_NAME: z.string().default('NEVIE-GLOBAL UK'),
  LEGAL_COMPANY_NUMBER: z.string().optional(),
  LEGAL_VAT_NUMBER: z.string().optional(),
  LEGAL_REGISTERED_OFFICE: z.string().optional(),
  LEGAL_ICO_NUMBER: z.string().optional(),
  LEGAL_CONTACT_EMAIL: z.string().email().default('contact@nevie-global.com'),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(12).optional(),
});

export type Env = z.infer<typeof schema>;

function readEnv(): Env {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment: ${issues}`);
  }
  return parsed.data;
}

let cached: Env | undefined;

export function env(): Env {
  if (!cached) cached = readEnv();
  return cached;
}

export function publicSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.BETTER_AUTH_URL ||
    'http://127.0.0.1:3100'
  ).replace(/\/$/, '');
}

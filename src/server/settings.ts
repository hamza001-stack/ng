import 'server-only';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { prisma } from './db';

export type StripeMode = 'test' | 'live';

export type StripeKeys = {
  secretKey?: string;
  publishableKey?: string;
  webhookSecret?: string;
};

export type StripeSettings = {
  mode: StripeMode;
  test: StripeKeys;
  live: StripeKeys;
};

export type SmtpSettings = {
  host?: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from?: string;
};

const SECRET_KEYS = new Set([
  'stripe.test.secretKey',
  'stripe.test.webhookSecret',
  'stripe.live.secretKey',
  'stripe.live.webhookSecret',
  'smtp.pass',
]);

export const SETTING_KEYS = [
  'stripe.mode',
  'stripe.test.secretKey',
  'stripe.test.publishableKey',
  'stripe.test.webhookSecret',
  'stripe.live.secretKey',
  'stripe.live.publishableKey',
  'stripe.live.webhookSecret',
  'smtp.host',
  'smtp.port',
  'smtp.secure',
  'smtp.user',
  'smtp.pass',
  'smtp.from',
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

function encryptionKey() {
  const material = process.env.SETTINGS_ENCRYPTION_KEY || process.env.BETTER_AUTH_SECRET;
  if (!material) throw new Error('SETTINGS_ENCRYPTION_KEY or BETTER_AUTH_SECRET is required');
  return createHash('sha256').update(`nevie-settings:${material}`).digest();
}

function encrypt(plain: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const body = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64'), cipher.getAuthTag().toString('base64'), body.toString('base64')].join(':');
}

function decrypt(stored: string) {
  const [version, iv, tag, body] = stored.split(':');
  if (version !== 'v1' || !iv || !tag || !body) throw new Error('Unreadable setting');
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(body, 'base64')), decipher.final()]).toString('utf8');
}

type Store = Partial<Record<SettingKey, string>>;

let cache: { at: number; values: Store } | undefined;
const TTL_MS = 30_000;

async function readStore(): Promise<Store> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.values;
  const rows = await prisma.appSetting.findMany();
  const values: Store = {};
  for (const row of rows) {
    if (!(SETTING_KEYS as readonly string[]).includes(row.key)) continue;
    try {
      values[row.key as SettingKey] = row.secret ? decrypt(row.value) : row.value;
    } catch {
      // A value encrypted with a previous key is treated as unset.
    }
  }
  cache = { at: Date.now(), values };
  return values;
}

export function invalidateSettings() {
  cache = undefined;
}

export async function saveSettings(
  changes: Partial<Record<SettingKey, string | null>>,
  updatedBy: string,
) {
  const ops = Object.entries(changes).map(([key, value]) => {
    if (value === null || value === '') {
      return prisma.appSetting.deleteMany({ where: { key } });
    }
    const secret = SECRET_KEYS.has(key);
    const stored = secret ? encrypt(value as string) : (value as string);
    return prisma.appSetting.upsert({
      where: { key },
      create: { key, value: stored, secret, updatedBy },
      update: { value: stored, secret, updatedBy },
    });
  });
  await prisma.$transaction(ops);
  invalidateSettings();
}

function modeOfKey(key: string | undefined): StripeMode | undefined {
  if (!key) return undefined;
  if (key.startsWith('sk_live_') || key.startsWith('rk_live_')) return 'live';
  if (key.startsWith('sk_test_') || key.startsWith('rk_test_')) return 'test';
  return undefined;
}

export async function stripeSettings(): Promise<StripeSettings> {
  const s = await readStore();
  const envSecret = process.env.STRIPE_SECRET_KEY || undefined;
  const envMode = modeOfKey(envSecret);
  const envKeys: StripeKeys = {
    secretKey: envSecret,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || undefined,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || undefined,
  };
  const pick = (mode: StripeMode): StripeKeys => {
    const fallback = envMode === mode ? envKeys : {};
    return {
      secretKey: s[`stripe.${mode}.secretKey`] || fallback.secretKey,
      publishableKey: s[`stripe.${mode}.publishableKey`] || fallback.publishableKey,
      webhookSecret: s[`stripe.${mode}.webhookSecret`] || fallback.webhookSecret,
    };
  };
  const mode: StripeMode = s['stripe.mode'] === 'live' ? 'live' : s['stripe.mode'] === 'test' ? 'test' : envMode ?? 'test';
  return { mode, test: pick('test'), live: pick('live') };
}

export async function smtpSettings(): Promise<SmtpSettings> {
  const s = await readStore();
  const port = Number(s['smtp.port'] || process.env.SMTP_PORT || 587);
  const secureRaw = s['smtp.secure'] ?? process.env.SMTP_SECURE;
  return {
    host: s['smtp.host'] || process.env.SMTP_HOST || undefined,
    port: Number.isFinite(port) ? port : 587,
    secure: secureRaw ? secureRaw === 'true' : port === 465,
    user: s['smtp.user'] || process.env.SMTP_USER || undefined,
    pass: s['smtp.pass'] || process.env.SMTP_PASS || undefined,
    from: s['smtp.from'] || process.env.EMAIL_FROM || undefined,
  };
}

export function maskSecret(value: string | undefined) {
  if (!value) return null;
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}

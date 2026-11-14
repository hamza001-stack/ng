import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const railway = process.platform === 'win32' ? 'railway.cmd' : 'railway';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((line) => /^[A-Z0-9_]+=/.test(line))
    .map((line) => {
      const i = line.indexOf('=');
      return [line.slice(0, i), line.slice(i + 1)];
    }),
);

const adminPath = 'console-' + randomBytes(12).toString('base64url');
const authSecret = randomBytes(36).toString('base64url');
const adminPassword = randomBytes(18).toString('base64url');
const adminEmail = 'admin@nevie.global';

const vars = {
  DATABASE_URL: '${{Postgres.DATABASE_URL}}',
  REDIS_URL: '${{Redis.REDIS_URL}}',
  BETTER_AUTH_SECRET: authSecret,
  SETTINGS_ENCRYPTION_KEY: authSecret,
  ADMIN_PATH: adminPath,
  ADMIN_EMAIL: adminEmail,
  ADMIN_PASSWORD: adminPassword,
  EMAIL_FROM: env.EMAIL_FROM || 'NEVIE-GLOBAL UK <support.uk@nevie-global.com>',
  LEGAL_COMPANY_NAME: 'NEVIE-GLOBAL UK',
  LEGAL_CONTACT_EMAIL: env.LEGAL_CONTACT_EMAIL || 'contact@nevie-global.com',
  FORM_NOTIFY_EMAILS: env.FORM_NOTIFY_EMAILS || 'contact@nevie-global.com,emmanuel.varinot@nevie-global.com',
  VAT_RATE_BPS: env.VAT_RATE_BPS || '2000',
  SHIPPING_PENCE: env.SHIPPING_PENCE || '0',
  REQUIRE_EMAIL_VERIFICATION: 'false',
  NEXT_PUBLIC_STATIC_PREVIEW: 'false',
  NIXPACKS_NODE_VERSION: '22',
  NODE_ENV: 'production',
};

if (env.STRIPE_SECRET_KEY) vars.STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;
if (env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  vars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}

function setVar(key, value) {
  const result = spawnSync(railway, ['variable', 'set', key, '--stdin', '--skip-deploys', '--service', 'web'], {
    input: value,
    encoding: 'utf8',
    shell: true,
  });
  if (result.status !== 0) {
    throw new Error(`Failed to set ${key}: ${(result.stderr || result.stdout || '').slice(0, 200)}`);
  }
}

for (const [key, value] of Object.entries(vars)) {
  setVar(key, value);
}

writeFileSync(
  '.railway-admin.txt',
  [`ADMIN_PATH=${adminPath}`, `ADMIN_EMAIL=${adminEmail}`, `ADMIN_PASSWORD=${adminPassword}`].join('\n') + '\n',
);
console.log('Railway web variables set.');

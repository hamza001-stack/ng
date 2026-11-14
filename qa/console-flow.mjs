import { chromium } from 'playwright';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
);
const base = 'http://127.0.0.1:3100';
const secretPath = `/${env.ADMIN_PATH}`;

function base32(input) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const ch of input.replace(/=+$/, '').toUpperCase()) bits += alphabet.indexOf(ch).toString(2).padStart(5, '0');
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

function totp(secret) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const mac = createHmac('sha1', base32(secret)).update(counter).digest();
  const offset = mac[mac.length - 1] & 0xf;
  const code = (mac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return String(code).padStart(6, '0');
}

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const shot = (name) => page.screenshot({ path: `qa/console-${name}.png`, fullPage: false });

const direct = await page.goto(`${base}/admin`);
console.log('/admin status', direct.status());

await page.goto(`${base}${secretPath}`);
await page.waitForSelector('.console-gate-card');
await shot('1-signin');
await page.fill('input[name=email]', env.ADMIN_EMAIL);
await page.fill('input[name=password]', env.ADMIN_PASSWORD);
await page.click('button[type=submit]');

await page.waitForSelector('text=Set up two-step verification', { timeout: 60000 });
await shot('2-setup');
await page.fill('input[name=password]', env.ADMIN_PASSWORD);
await page.click('button[type=submit]');
await page.waitForSelector('.console-qr img');
const manual = await page.locator('.console-qr code').innerText();
await shot('3-qr');
await page.fill('input[name=code]', totp(manual));
await page.click('button[type=submit]');
await page.waitForSelector('.ws-root', { timeout: 60000 });
console.log('enrolled; console url', page.url().replace(env.ADMIN_PATH, '<secret>'));

const blocked = await page.request.get(`${base}/api/admin/stats`);
console.log('api with 2fa session', blocked.status());
if (await page.locator('.cookie-essential').count()) await page.click('.cookie-essential');
await page.click('.ws-signout');
await page.waitForURL(`${base}/`);
await page.goto(`${base}${secretPath}`);
await page.waitForSelector('.console-gate-card');
await page.fill('input[name=email]', env.ADMIN_EMAIL);
await page.fill('input[name=password]', env.ADMIN_PASSWORD);
await page.click('button[type=submit]');
await page.waitForSelector('text=Two-step verification');
await page.fill('input[name=code]', '000000');
await page.click('button[type=submit]');
await page.waitForSelector('.ws-error');
console.log('wrong code:', await page.locator('.ws-error').innerText());
await page.fill('input[name=code]', totp(manual));
await shot('4-code');
await page.click('button[type=submit]');
await page.waitForSelector('.ws-root', { timeout: 60000 });
await shot('5-console');

await page.goto(`${base}${secretPath}/settings`);
await page.waitForSelector('text=Payments · Stripe');
await page.click('button:has-text("Test test keys")');
await page.waitForSelector('.ws-settings-note', { timeout: 30000 });
console.log('stripe test:', await page.locator('.ws-settings-note').first().innerText());
await page.fill('#test-sk', env.STRIPE_SECRET_KEY);
const editing = page.locator('select').filter({ hasText: 'Test keys' });
await editing.selectOption('live');
await page.fill('#live-pk', 'pk_test_wrong_mode');
await page.click('button:has-text("Save Stripe settings")');
await page.waitForSelector('.ws-settings-note.warn');
console.log('wrong-mode key:', await page.locator('.ws-settings-note.warn').first().innerText());
await page.fill('#live-pk', '');
await editing.selectOption('test');
await page.click('button:has-text("Save Stripe settings")');
await page.waitForSelector('text=/Saved. Checkout now uses test mode/');
console.log('saved test key via admin');
await page.screenshot({ path: 'qa/console-6-settings.png', fullPage: true });

const links = await page.$$eval('.ws-nav a', (as) => as.map((a) => a.getAttribute('href')));
console.log('nav uses secret base:', links.every((h) => h.startsWith(secretPath)), links.length);
await browser.close();

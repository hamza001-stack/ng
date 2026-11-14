import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(process.cwd());
const TEMP = path.join(process.env.TEMP || process.env.TMP || '', 'nevie-home.html');
const BRAND = path.join(ROOT, 'public', 'brand');
const PRODUCTS = path.join(ROOT, 'public', 'products');
const PUBLIC = path.join(ROOT, 'public');

const JEWELLERY = {
  'bague-aura': 'a0bc75431860b7d84573738e8fa02fe4.png',
  'bague-signet': 'b2be7f468c0e3b18248c171a7c33efe2.png',
  'bague-origin': 'ea162e8550bc0b6339af4a7fbeadb007.png',
  'bracelet-link': '84975dd597e99e6c67994e75c3bb8bd7.png',
  'bracelet-core': 'a26933c5538512f56d9b4df300b8479c.png',
  'bracelet-weave': '18d3ff299d25e0e911bb5feadf5c26f1.png',
};

const CDN = 'https://horizons-cdn.hostinger.com/ae4f66bd-908f-4eb8-a8f9-b2d0d8cfc89e/';

const LOGO_CANDIDATES = [
  'https://nevie-global.com/wp-content/uploads/2026/05/nevie-global11-scaled.jpg',
  'https://nevie-global.com/logo.png',
  'https://nevie-global.com/assets/og-branding-preview.jpg',
];

async function get(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 800) return null;
  const type = res.headers.get('content-type') || '';
  if (type.includes('text/html')) return null;
  return buf;
}

function extractUrls(html) {
  const urls = new Set();
  for (const match of html.matchAll(/(?:src|href|content)="([^"]+\.(?:png|jpe?g|webp|svg)[^"]*)"/gi)) {
    urls.add(match[1].replace(/&amp;/g, '&'));
  }
  return [...urls];
}

async function writeVariants(buf, id) {
  await sharp(buf).resize(1200).webp({ quality: 88 }).toFile(path.join(PRODUCTS, `${id}.webp`));
  await sharp(buf).resize(768).webp({ quality: 86 }).toFile(path.join(PRODUCTS, `${id}-detail.webp`));
  await sharp(buf).resize(240).webp({ quality: 82 }).toFile(path.join(PRODUCTS, `${id}-thumb.webp`));
}

async function main() {
  fs.mkdirSync(BRAND, { recursive: true });
  fs.mkdirSync(PRODUCTS, { recursive: true });

  let html = '';
  if (fs.existsSync(TEMP)) html = fs.readFileSync(TEMP, 'utf8');
  else {
    const res = await fetch('https://nevie-global.com/');
    html = await res.text();
  }
  const pageUrls = extractUrls(html);
  const logoLike = pageUrls.filter((u) => /logo|branding|og-|custom-logo|site-icon|nevie-global11/i.test(u));
  console.log('logo-like urls', logoLike.slice(0, 20));

  let logoBuf = null;
  let logoFrom = '';
  for (const url of [...logoLike, ...LOGO_CANDIDATES]) {
    const abs = url.startsWith('http') ? url : `https://nevie-global.com${url.startsWith('/') ? '' : '/'}${url}`;
    const buf = await get(abs);
    if (buf) {
      logoBuf = buf;
      logoFrom = abs;
      console.log('logo ok', abs, buf.length);
      break;
    }
    console.log('logo miss', abs);
  }
  if (!logoBuf) throw new Error('Official logo could not be downloaded');

  fs.writeFileSync(path.join(BRAND, 'official-source.bin'), logoBuf);
  await sharp(logoBuf).rotate().webp({ quality: 92 }).toFile(path.join(BRAND, 'logo.webp'));
  await sharp(logoBuf).rotate().png().toFile(path.join(BRAND, 'logo.png'));
  const icon = await sharp(logoBuf).rotate().resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  fs.writeFileSync(path.join(PUBLIC, 'icon.png'), icon);
  fs.writeFileSync(path.join(PUBLIC, 'apple-touch-icon.png'), icon);
  const ogBuf = (await get('https://nevie-global.com/assets/og-branding-preview.jpg')) || logoBuf;
  await sharp(ogBuf).rotate().resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 88 }).toFile(path.join(BRAND, 'og.jpg'));
  await sharp(ogBuf).rotate().resize(1200, 630, { fit: 'cover' }).webp({ quality: 88 }).toFile(path.join(BRAND, 'og.webp'));
  console.log('brand written from', logoFrom);

  for (const [id, file] of Object.entries(JEWELLERY)) {
    const buf = await get(CDN + file);
    if (!buf) {
      console.log('jewellery miss', id);
      continue;
    }
    await writeVariants(buf, id);
    console.log('jewellery', id, buf.length);
  }

  const founderHints = pageUrls.filter((u) => /fondateur|founder|coffret|carte|badge/i.test(u));
  console.log('founder image hints', founderHints.slice(0, 15));
  let founderBuf = null;
  for (const url of founderHints) {
    const abs = url.startsWith('http') ? url : `https://nevie-global.com${url.startsWith('/') ? '' : '/'}${url}`;
    const buf = await get(abs);
    if (buf) {
      founderBuf = buf;
      console.log('founder art', abs, buf.length);
      break;
    }
  }
  if (!founderBuf) founderBuf = logoBuf;
  await writeVariants(founderBuf, 'founder-card');
  await writeVariants(founderBuf, 'founder-box');

  fs.writeFileSync(
    path.join(PRODUCTS, 'SOURCES.md'),
    `# Product sources

Jewellery photographs: Hostinger CDN paths used by https://nevie-global.com/ (verified 28 Sep 2026).
Founder images: official page asset when present, otherwise the official brand mark.
Logo: ${logoFrom}
`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

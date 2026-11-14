import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const dir = path.join(process.cwd(), 'public', 'categories');
const originals = {
  crm: await readFile(path.join(dir, 'crm.webp')),
  saas: await readFile(path.join(dir, 'saas.webp')),
  academy: await readFile(path.join(dir, 'academy.webp')),
};

function wash(w, h, fill) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="100%" height="100%" fill="${fill}"/>
  </svg>`);
}

function vignette(w, h, gold = false) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <radialGradient id="v" cx="48%" cy="38%" r="78%">
        <stop offset="0%" stop-color="${gold ? '#FFD47A' : '#00A9FF'}" stop-opacity="0.22"/>
        <stop offset="42%" stop-color="#071018" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.62"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#v)"/>
  </svg>`);
}

async function render(input, dest, fill, gold = false) {
  const image = sharp(input);
  const { width = 1200, height = 800 } = await image.metadata();
  const out = await sharp(input)
    .modulate({ brightness: 0.78, saturation: 0.92 })
    .composite([
      { input: wash(width, height, fill), blend: 'multiply' },
      { input: wash(width, height, fill), blend: 'soft-light' },
      { input: vignette(width, height, gold), blend: 'overlay' },
    ])
    .webp({ quality: 90 })
    .toBuffer();
  await writeFile(path.join(dir, dest), out);
  console.log('wrote', dest);
}

await render(originals.crm, 'crm.webp', '#00A9FF');
await render(originals.saas, 'saas.webp', '#0096E6');
await render(originals.academy, 'academy.webp', '#1BB4FF', true);
await render(originals.crm, 'knowledge-agent.webp', '#0088D6');
await render(originals.saas, 'workflow-studio.webp', '#00A9FF', true);
await render(originals.crm, 'customer-hub.webp', '#33BBFF');
await render(originals.saas, 'business-tools.webp', '#0077C2');

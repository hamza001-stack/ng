import 'server-only';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const root = () => path.join(process.cwd(), 'public', 'uploads');

/** Thrown when the host has a read-only / ephemeral filesystem (Netlify, Vercel, other serverless hosts). */
export class StorageUnavailableError extends Error {
  constructor() {
    super(
      'File uploads are not available on this host (read-only filesystem). Use an external URL instead, or leave the file field empty.',
    );
    this.name = 'StorageUnavailableError';
  }
}

async function writeSafely(dir: string, name: string, data: Buffer) {
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), data);
  } catch {
    throw new StorageUnavailableError();
  }
}

const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const fileTypes = new Set([
  ...imageTypes,
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

function extFor(type: string, fallback: string) {
  if (type === 'image/jpeg') return '.jpg';
  if (type === 'image/png') return '.png';
  if (type === 'image/webp') return '.webp';
  if (type === 'application/pdf') return '.pdf';
  if (type.includes('zip')) return '.zip';
  if (type.includes('wordprocessing')) return '.docx';
  return fallback;
}

export async function saveUpload(
  file: File | null,
  folder: string,
  options: { imagesOnly?: boolean; maxBytes: number },
) {
  if (!file || file.size === 0) return null;
  if (file.size > options.maxBytes) throw new Error('File is too large.');
  const allowed = options.imagesOnly ? imageTypes : fileTypes;
  if (!allowed.has(file.type)) throw new Error('This file type is not allowed.');
  const dir = path.join(root(), folder);
  const name = `${randomUUID()}${extFor(file.type, path.extname(file.name) || '.bin')}`;
  await writeSafely(dir, name, Buffer.from(await file.arrayBuffer()));
  return `/uploads/${folder}/${name}`;
}

export const privateRoot = () => path.join(process.cwd(), 'storage', 'private');

export async function savePrivateUpload(file: File | null, folder: string, maxBytes: number) {
  if (!file || file.size === 0) return null;
  if (file.size > maxBytes) throw new Error('File is too large.');
  if (!fileTypes.has(file.type)) throw new Error('This file type is not allowed.');
  const dir = path.join(privateRoot(), folder);
  const name = `${randomUUID()}${extFor(file.type, '.bin')}`;
  await writeSafely(dir, name, Buffer.from(await file.arrayBuffer()));
  return `${folder}/${name}`;
}

export async function saveProductImages(id: string, file: File | null) {
  if (!file || file.size === 0) return;
  if (file.size > 6_000_000) throw new Error('Image is too large (max 6MB).');
  if (!imageTypes.has(file.type)) throw new Error('Use a JPG, PNG or WebP image.');
  const sharp = (await import('sharp')).default;
  const buffer = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), 'public', 'products');
  try {
    await mkdir(dir, { recursive: true });
    const image = sharp(buffer);
    await image.clone().webp({ quality: 82 }).toFile(path.join(dir, `${id}.webp`));
    await image.clone().webp({ quality: 82 }).toFile(path.join(dir, `${id}-detail.webp`));
    await image
      .clone()
      .resize(176, 176, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(path.join(dir, `${id}-thumb.webp`));
  } catch {
    throw new StorageUnavailableError();
  }
}

export function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
  return slug || `item-${Date.now().toString(36)}`;
}

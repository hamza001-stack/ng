import { headers } from 'next/headers';
import { readFile } from 'fs/promises';
import path from 'path';
import { prisma } from '@/server/db';
import { requireStaff } from '@/server/staff';
import { jsonError } from '@/server/logger';
import { privateRoot } from '@/server/uploads';

const types: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export async function GET(request: Request) {
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return jsonError('Missing lead id.', 400);
  const lead = await prisma.lead.findUnique({ where: { id }, select: { fileKey: true } });
  if (!lead?.fileKey) return jsonError('No attachment.', 404);
  const root = privateRoot();
  const target = path.resolve(root, lead.fileKey);
  if (!target.startsWith(root + path.sep)) return jsonError('Invalid path.', 400);
  try {
    const buffer = await readFile(target);
    const ext = path.extname(target).toLowerCase();
    return new Response(buffer, {
      headers: {
        'Content-Type': types[ext] || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="quote-${id}${ext}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    return jsonError('Attachment missing on disk.', 404);
  }
}

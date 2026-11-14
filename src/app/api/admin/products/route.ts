import { headers } from 'next/headers';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/server/db';
import { requireStaff } from '@/server/staff';
import { audit } from '@/server/audit';
import { jsonError, jsonOk } from '@/server/logger';
import { originAllowed } from '@/server/http-guard';
import { saveProductImages, slugify } from '@/server/uploads';

export async function POST(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const form = await request.formData();
  const name = String(form.get('name') || '').trim();
  const description = String(form.get('description') || '').trim();
  const categoryName = String(form.get('category') || '').trim();
  const price = Number(form.get('price'));
  const stock = Number(form.get('stock') || 0);
  const tag = String(form.get('tag') || '').trim();
  const features = String(form.get('features') || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  if (name.length < 2 || description.length < 8 || !categoryName || !Number.isFinite(price) || price < 0) {
    return jsonError('Check name, description, category and price.', 400);
  }
  let id = slugify(name);
  if (await prisma.product.findUnique({ where: { id } })) {
    id = `${id}-${Date.now().toString(36)}`;
  }
  const category = await prisma.category.upsert({
    where: { slug: slugify(categoryName) },
    update: { name: categoryName },
    create: { slug: slugify(categoryName), name: categoryName },
  });
  const image = form.get('image');
  let imageUrl: string | null = null;
  if (image instanceof File) {
    try {
      await saveProductImages(id, image);
      imageUrl = `/products/${id}.webp`;
    } catch (error) {
      return jsonError(error instanceof Error ? error.message : 'Image failed.', 400);
    }
  }
  await prisma.product.create({
    data: {
      id,
      slug: id,
      name,
      description,
      categoryId: category.id,
      pricePence: Math.round(price * 100),
      stock: Number.isInteger(stock) ? Math.max(0, stock) : 0,
      tag: tag || null,
      features: features.length ? features : [description.slice(0, 80)],
      published: form.get('published') === 'on',
      imageUrl,
    },
  });
  revalidateTag('products');
  await audit({
    userId: session.user.id,
    action: 'product.create',
    entity: 'Product',
    entityId: id,
  });
  return jsonOk({ id });
}

const patchSchema = z.object({
  id: z.string().min(1),
  stock: z.number().int().min(0).max(100000).optional(),
  published: z.boolean().optional(),
  action: z.enum(['duplicate', 'archive']).optional(),
});

export async function PATCH(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid product update.', 400);

  if (parsed.data.action === 'duplicate') {
    const source = await prisma.product.findUnique({ where: { id: parsed.data.id } });
    if (!source) return jsonError('Product not found.', 404);
    const id = `${source.id}-${Date.now().toString(36)}`;
    await prisma.product.create({
      data: {
        id,
        slug: id,
        name: `${source.name} copy`,
        description: source.description,
        categoryId: source.categoryId,
        pricePence: source.pricePence,
        compareAtPence: source.compareAtPence,
        currency: source.currency,
        stock: source.stock,
        published: false,
        tag: source.tag,
        features: source.features,
        imageUrl: source.imageUrl,
      },
    });
    revalidateTag('products');
    await audit({
      userId: session.user.id,
      action: 'product.duplicate',
      entity: 'Product',
      entityId: id,
      meta: { from: source.id },
    });
    return jsonOk({ id });
  }

  await prisma.product.update({
    where: { id: parsed.data.id },
    data: {
      ...(parsed.data.action === 'archive' ? { published: false } : {}),
      ...(parsed.data.stock !== undefined ? { stock: parsed.data.stock } : {}),
      ...(parsed.data.published !== undefined ? { published: parsed.data.published } : {}),
    },
  });
  revalidateTag('products');
  await audit({
    userId: session.user.id,
    action: parsed.data.action === 'archive' ? 'product.archive' : 'product.update',
    entity: 'Product',
    entityId: parsed.data.id,
    meta: parsed.data,
  });
  return jsonOk({ updated: true });
}

export async function DELETE(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const parsed = z.object({ id: z.string().min(1) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid product id.', 400);
  await prisma.product.delete({ where: { id: parsed.data.id } });
  revalidateTag('products');
  await audit({
    userId: session.user.id,
    action: 'product.delete',
    entity: 'Product',
    entityId: parsed.data.id,
  });
  return jsonOk({ deleted: true });
}

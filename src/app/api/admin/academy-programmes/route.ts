
import { headers } from 'next/headers';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

import { prisma } from '@/server/db';
import { getAuthSession, roleOf } from '@/server/auth';
import { can } from '@/server/rbac';
import { audit } from '@/server/audit';
import { jsonError, jsonOk } from '@/server/logger';
import { originAllowed } from '@/server/http-guard';

/* ───────── Shared validation ───────── */

const idSchema = z
  .string()
  .regex(
    /^[a-z0-9-]{2,40}$/,
    'Use 2–40 lowercase letters, numbers or dashes for the URL id.',
  );

const syllabusSchema = z
  .array(
    z.object({
      title: z.string().trim().min(1).max(160),
      body: z.string().trim().max(500),
    }),
  )
  .max(60);

const outcomesSchema = z
  .array(z.string().trim().min(1).max(200))
  .max(20);

/* ───────── English programme validation ───────── */

/**
 * English content is stored in the existing Prisma columns.
 * The optional locale defaults to EN so the existing admin editor
 * continues working until its language tabs are implemented.
 */
const englishSchema = z.object({
  locale: z.literal('en').default('en'),
  isNew: z.boolean(),
  id: idSchema,
  cat: z.string().trim().min(1).max(40),
  theme: z.enum(['ai', 'code', 'auto']),
  title: z.string().trim().min(2).max(120),
  level: z.string().trim().min(1).max(40),
  price: z.number().int().min(0).max(1_000_000),
  intro: z.boolean(),
  introCourseId: z.string().trim().max(80).optional(),
  lessons: z.number().int().min(1).max(500),
  hours: z.string().trim().min(1).max(40),
  weeks: z.string().trim().min(1).max(40),
  promise: z.string().trim().max(240),
  blurb: z.string().trim().max(1200),
  outcomes: outcomesSchema,
  syllabus: syllabusSchema,
  seoTitle: z.string().trim().max(160).optional(),
  seoDescription: z.string().trim().max(320).optional(),
  published: z.boolean(),
});

/* ───────── French translation validation ───────── */

/**
 * French content is stored inside translations.fr.
 * It does not update the English programme columns.
 */
const frenchSchema = z.object({
  locale: z.literal('fr'),
  isNew: z.boolean(),
  id: idSchema,

  title: z.string().trim().min(2).max(120),
  level: z.string().trim().min(1).max(40),

  // Null means no French-specific price has been configured.
  price: z.number().int().min(0).max(1_000_000).nullable(),

  hours: z.string().trim().max(40),
  weeks: z.string().trim().max(40),
  promise: z.string().trim().max(240),
  blurb: z.string().trim().max(1200),
  outcomes: outcomesSchema,
  syllabus: syllabusSchema,
  seoTitle: z.string().trim().max(160).optional(),
  seoDescription: z.string().trim().max(320).optional(),
});

/* ───────── Authorization ───────── */

// Programmes carry the prices, so managers and above only.
async function manager() {
  const session = await getAuthSession(await headers());
  return can(roleOf(session), 'MANAGER') ? session : null;
}

/* ───────── Save programme ───────── */

export async function PUT(request: Request) {
  if (!originAllowed(request)) {
    return jsonError('Request origin not allowed.', 403);
  }

  const session = await manager();

  if (!session) {
    return jsonError(
      'Forbidden. Programmes and prices need a manager role.',
      403,
    );
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonError('Invalid programme data.', 400);
  }

  const locale = (body as Record<string, unknown>).locale ?? 'en';

  /* ───────── Save French translation ───────── */

  if (locale === 'fr') {
    const parsed = frenchSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(
        parsed.error.issues[0]?.message || 'Check the French programme fields.',
        400,
      );
    }

    const {
      isNew,
      id,
      title,
      level,
      price,
      hours,
      weeks,
      promise,
      blurb,
      outcomes,
      syllabus,
      seoTitle,
      seoDescription,
    } = parsed.data;

    // A programme must exist in English before adding its translation.
    if (isNew) {
      return jsonError(
        'Create the English programme first, then add its French translation.',
        400,
      );
    }

    const existing = await prisma.nvAcademyProgramme.findUnique({
      where: { id },
      select: { id: true, translations: true },
    });

    if (!existing) {
      return jsonError('Programme not found. Save its English version first.', 404);
    }

    // Preserve other translation keys already stored in the JSON column.
    const currentTranslations =
      existing.translations &&
      typeof existing.translations === 'object' &&
      !Array.isArray(existing.translations)
        ? (existing.translations as Record<string, unknown>)
        : {};

    const frenchTranslation = {
      title,
      level,
      price,
      hours,
      weeks,
      promise,
      blurb,
      outcomes,
      syllabus,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
    };

    const updatedTranslations = {
      ...currentTranslations,
      fr: frenchTranslation,
    } as Prisma.InputJsonValue;

    await prisma.nvAcademyProgramme.update({
      where: { id },
      data: {
        translations: updatedTranslations,
      },
    });

    revalidateTag('academy');

    await audit({
      userId: session.user.id,
      action: 'academy.programme.translation.update',
      entity: 'AcademyProgramme',
      entityId: id,
    });

    return jsonOk({
      saved: true,
      locale: 'fr',
    });
  }

  /* ───────── Save English programme ───────── */

  if (locale !== 'en') {
    return jsonError('Unsupported programme language.', 400);
  }

  const parsed = englishSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(
      parsed.error.issues[0]?.message || 'Check the programme fields.',
      400,
    );
  }

  const {
    isNew,
    id,
    introCourseId,
    seoTitle,
    seoDescription,
    locale: _locale,
    ...rest
  } = parsed.data;

  const data = {
    ...rest,
    introCourseId: introCourseId || null,
    seoTitle: seoTitle || null,
    seoDescription: seoDescription || null,
  };

  if (isNew) {
    if (await prisma.nvAcademyProgramme.findUnique({ where: { id } })) {
      return jsonError(
        'A programme with that URL id already exists.',
        409,
      );
    }

    const last = await prisma.nvAcademyProgramme.aggregate({
      _max: { sortOrder: true },
    });

    await prisma.nvAcademyProgramme.create({
      data: {
        id,
        ...data,
        sortOrder: (last._max.sortOrder ?? -1) + 1,
      },
    });
  } else {
    const existing = await prisma.nvAcademyProgramme.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return jsonError('Programme not found.', 404);
    }

    await prisma.nvAcademyProgramme.update({
      where: { id },
      data,
    });
  }

  revalidateTag('academy');

  await audit({
    userId: session.user.id,
    action: isNew
      ? 'academy.programme.create'
      : 'academy.programme.update',
    entity: 'AcademyProgramme',
    entityId: id,
  });

  return jsonOk({
    saved: true,
    locale: 'en',
  });
}

/* ───────── Delete programme ───────── */

export async function DELETE(request: Request) {
  if (!originAllowed(request)) {
    return jsonError('Request origin not allowed.', 403);
  }

  const session = await manager();

  if (!session) {
    return jsonError(
      'Forbidden. Programmes and prices need a manager role.',
      403,
    );
  }

  const parsed = z
    .object({ id: z.string().min(1) })
    .safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return jsonError('Invalid programme.', 400);
  }

  await prisma.nvAcademyProgramme.deleteMany({
    where: { id: parsed.data.id },
  });

  revalidateTag('academy');

  await audit({
    userId: session.user.id,
    action: 'academy.programme.delete',
    entity: 'AcademyProgramme',
    entityId: parsed.data.id,
  });

  return jsonOk({ deleted: true });
}

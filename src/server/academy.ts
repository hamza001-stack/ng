import 'server-only';
import { unstable_cache } from 'next/cache';
import { prisma } from './db';
import {
  defaultProgrammes,
  type AcademyTheme,
  type AcademyLocale,
  type AcademyCurrency,
  type Programme,
  type ProgrammeTranslation,
} from '@/lib/academy-defaults';

type SyllabusRow = { title: string; body: string };

function toSyllabus(value: unknown): SyllabusRow[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((row) => {
      const r = row as Partial<SyllabusRow>;
      return {
        title: String(r?.title ?? ''),
        body: String(r?.body ?? ''),
      };
    })
    .filter((row) => row.title);
}

/** Safely read the French translation object stored in Prisma JSON. */
function getFrenchTranslation(value: unknown): ProgrammeTranslation {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const translations = value as Record<string, unknown>;
  const fr = translations.fr;

  if (!fr || typeof fr !== 'object' || Array.isArray(fr)) {
    return {};
  }

  return fr as ProgrammeTranslation;
}

/** Published programmes, translated according to the requested locale. */
async function loadProgrammes(locale: AcademyLocale): Promise<Programme[]> {
  const currency: AcademyCurrency = locale === 'fr' ? 'EUR' : 'GBP';

  try {
    const rows = await prisma.nvAcademyProgramme.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      include: {
        sessions: {
          where: { published: true },
          orderBy: { startsOn: 'asc' },
        },
      },
    });

    // An empty database table means there are no programmes.
    // Do not silently show starter data in that case.
    return rows.map((row) => {
      const fr = locale === 'fr'
        ? getFrenchTranslation(row.translations)
        : {};

      return {
        id: row.id,
        cat: row.cat,
        theme: (
          ['ai', 'code', 'auto'].includes(row.theme)
            ? row.theme
            : 'ai'
        ) as AcademyTheme,

        // French fields fall back individually to their English equivalents.
        title: fr.title || row.title,
        level: fr.level || row.level,
        price: typeof fr.price === 'number' ? fr.price : row.price,
        currency,

        intro: row.intro,
        introCourseId: row.introCourseId,
        lessons: row.lessons,

        hours: fr.hours || row.hours,
        weeks: fr.weeks || row.weeks,
        promise: fr.promise || row.promise,
        blurb: fr.blurb || row.blurb,

        outcomes: Array.isArray(fr.outcomes) && fr.outcomes.length
          ? fr.outcomes
          : row.outcomes,

        syllabus: Array.isArray(fr.syllabus) && fr.syllabus.length
          ? toSyllabus(fr.syllabus)
          : toSyllabus(row.syllabus),

        seoTitle: fr.seoTitle || row.seoTitle,
        seoDescription: fr.seoDescription || row.seoDescription,

        sessions: row.sessions.map((s) => ({
          id: s.id,
          startsOn: s.startsOn.toISOString().slice(0, 10),
          days: s.days,
          time: s.time,
          mode: s.mode,
          seats: s.seats,
          taken: s.taken,
        })),
      };
    });
  } catch {
    // Only use starter data if the database is unavailable or its tables are missing.
    // French starter content falls back to English until French translations are added.
    return defaultProgrammes.map((programme) => ({
      ...programme,
      currency,
    }));
  }
}

/**
 * The locale is an argument to unstable_cache, so EN and FR have separate
 * cached results. Both are refreshed when the academy tag is revalidated.
 */
const getCachedProgrammes = unstable_cache(
  async (locale: AcademyLocale) => loadProgrammes(locale),
  ['academy-programmes'],
  {
    revalidate: 60,
    tags: ['academy'],
  },
);

export async function getProgrammes(
  locale: AcademyLocale = 'en',
): Promise<Programme[]> {
  return getCachedProgrammes(locale);
}

/** Number of people on each programme's waiting list. */
export async function getWaitingCounts(): Promise<Record<string, number>> {
  try {
    const rows = await prisma.nvAcademyPreRegistration.groupBy({
      by: ['courseId'],
      _count: { _all: true },
    });

    return Object.fromEntries(
      rows.map((row) => [row.courseId, row._count._all]),
    );
  } catch {
    return {};
  }
}

export async function getProgramme(
  id: string,
  locale: AcademyLocale = 'en',
): Promise<Programme | null> {
  return (await getProgrammes(locale)).find((p) => p.id === id) ?? null;
}
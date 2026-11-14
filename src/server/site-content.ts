import 'server-only';
import { unstable_cache } from 'next/cache';
import { prisma } from './db';
import { courses as staticCourses } from '@/lib/catalogue';
import { plans as staticPlans, type Plan } from '@/lib/editorial';
import { metadata as makeMetadata } from '@/lib/seo';

/* ───────────── Editable page content (SitePage table) ───────────── */

export type SitePageContent = {
  key: string;
  title: string | null;
  description: string | null;
  html: string;
  published: boolean;
};

async function loadSitePages(): Promise<SitePageContent[]> {
  try {
    const rows = await prisma.nvSitePage.findMany();
    return rows.map((row) => ({
      key: row.key,
      title: row.title,
      description: row.description,
      html: row.html,
      published: row.published,
    }));
  } catch {
    return []; // table not created yet, or database unreachable: fall back to code defaults
  }
}

export const cachedSitePages = unstable_cache(loadSitePages, ['site-pages'], {
  revalidate: 60,
  tags: ['site-pages'],
});

export async function getSitePage(key: string) {
  const pages = await cachedSitePages();
  return pages.find((page) => page.key === key && page.published) ?? null;
}

/** Metadata for a page: admin overrides win, otherwise the code defaults. */
export async function getPageMetadata(
  key: string,
  fallback: { title: string; description: string },
  path: string,
  privatePage = false,
) {
  const page = await getSitePage(key);
  return makeMetadata(
    page?.title?.trim() || fallback.title,
    page?.description?.trim() || fallback.description,
    path,
    privatePage,
  );
}

/* ───────────── Pricing plans (PricingPlan table) ───────────── */

/** Static plans from code, overlaid with any admin edits (matched by plan id). */
export async function loadPlans(): Promise<Plan[]> {
  try {
    const rows = await prisma.nvPricingPlan.findMany();
    const byId = new Map(rows.map((row) => [row.id, row]));
    return staticPlans.map((plan) => {
      const row = byId.get(plan.id);
      if (!row) return plan;
      return {
        ...plan,
        name: row.name,
        tagline: row.tagline,
        price: row.price,
        priceNote: row.priceNote,
        points: row.points,
        cta: row.cta,
        featured: row.featured || undefined,
      };
    });
  } catch {
    return staticPlans;
  }
}

export const cachedPlans = unstable_cache(loadPlans, ['pricing-plans'], {
  revalidate: 60,
  tags: ['pricing'],
});

/* ───────────── Academy courses (CmsCourse / CmsLesson) ───────────── */

export type AcademyCourse = {
  id: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  description: string;
  lessons: { title: string; body: string }[];
};

const fromStatic = (): AcademyCourse[] =>
  staticCourses.map((course) => ({ ...course, lessons: course.lessons.map((lesson) => ({ ...lesson })) }));

async function loadCourses(): Promise<AcademyCourse[]> {
  try {
    const rows = await prisma.cmsCourse.findMany({
      where: { published: true },
      include: { lessons: { orderBy: { index: 'asc' } } },
      orderBy: { title: 'asc' },
    });
    if (rows.length) {
      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        category: row.category,
        level: row.level,
        duration: row.duration,
        description: row.description,
        lessons: row.lessons.map((lesson) => ({ title: lesson.title, body: lesson.body })),
      }));
    }
  } catch {
    // fall through to the built-in catalogue
  }
  return fromStatic();
}

export const cachedCourses = unstable_cache(loadCourses, ['academy-courses'], {
  revalidate: 60,
  tags: ['academy-courses'],
});

export async function getAcademyCourse(id: string) {
  const all = await cachedCourses();
  return all.find((course) => course.id === id) ?? null;
}

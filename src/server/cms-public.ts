import 'server-only';
import { unstable_cache } from 'next/cache';
import { prisma } from './db';

export async function listPublishedCaseStudies() {
  try {
    return await prisma.caseStudy.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch {
    return [];
  }
}

export const cachedCaseStudies = unstable_cache(
  listPublishedCaseStudies,
  ['published-case-studies'],
  { revalidate: 60, tags: ['case-studies'] },
);

const publicProjectFields = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  goal: true,
  phase: true,
  progress: true,
  category: true,
  technologies: true,
  features: true,
  coverUrl: true,
  teamSize: true,
  eta: true,
  updatedAt: true,
} as const;

export async function listPublicProjects() {
  try {
    return await prisma.deliveryProject.findMany({
      where: { isPublic: true },
      orderBy: { updatedAt: 'desc' },
      select: publicProjectFields,
    });
  } catch {
    return [];
  }
}

export type PublicProject = Awaited<ReturnType<typeof listPublicProjects>>[number];

export async function getPublicProject(slug: string) {
  try {
    return await prisma.deliveryProject.findFirst({
      where: { isPublic: true, OR: [{ slug }, { id: slug }] },
      select: publicProjectFields,
    });
  } catch {
    return null;
  }
}

export const cachedPublicProjects = unstable_cache(
  listPublicProjects,
  ['published-delivery-projects'],
  { revalidate: 60, tags: ['projects'] },
);

export async function getPublishedCaseStudy(slug: string) {
  try {
    return await prisma.caseStudy.findFirst({
      where: { slug, published: true },
    });
  } catch {
    return null;
  }
}

export async function listPublishedArticles() {
  try {
    return await prisma.cmsArticle.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch {
    return [];
  }
}

export const cachedArticles = unstable_cache(
  listPublishedArticles,
  ['published-articles'],
  { revalidate: 60, tags: ['articles'] },
);

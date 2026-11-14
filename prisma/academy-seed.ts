/**
 * Inserts the starter programmes + sessions once. Create-only: anything that already
 * exists (including edits made in Admin → Academy) is never overwritten.
 */
import { PrismaClient } from '@prisma/client';
import { defaultProgrammes } from '../src/lib/academy-defaults';

const prisma = new PrismaClient();

async function main() {
  for (const [order, p] of defaultProgrammes.entries()) {
    if (await prisma.nvAcademyProgramme.findUnique({ where: { id: p.id } })) continue;
    await prisma.nvAcademyProgramme.create({
      data: {
        id: p.id, cat: p.cat, theme: p.theme, title: p.title, level: p.level, price: p.price,
        intro: p.intro, introCourseId: p.introCourseId, lessons: p.lessons, hours: p.hours,
        weeks: p.weeks, promise: p.promise, blurb: p.blurb, outcomes: p.outcomes,
        syllabus: p.syllabus, sortOrder: order,
        sessions: {
          create: p.sessions.map((s) => ({
            id: s.id, startsOn: new Date(s.startsOn + 'T00:00:00Z'), days: s.days, time: s.time,
            mode: s.mode, seats: s.seats, taken: s.taken,
          })),
        },
      },
    });
  }
}

main().finally(() => prisma.$disconnect());

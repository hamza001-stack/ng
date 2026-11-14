/**
 * One-time idempotent patches for column-level changes that db-sync cannot apply
 * (db-sync only adds columns/tables, never alters existing ones).
 * Each patch checks the current state before running so it is safe to run many times.
 * Run via: npx tsx prisma/patches.ts
 * db-sync runs this automatically before seeding when present.
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  // Patch 1: make nv_academy_payment.enrolmentId nullable (test charges have no enrolment)
  const col = await prisma.$queryRaw<{ is_nullable: string }[]>`
    SELECT is_nullable FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'nv_academy_payment'
      AND column_name  = 'enrolmentId'
    LIMIT 1
  `;
  if (col.length && col[0].is_nullable === 'NO') {
    await prisma.$executeRaw`ALTER TABLE nv_academy_payment ALTER COLUMN "enrolmentId" DROP NOT NULL`;
    console.log('[patches] nv_academy_payment.enrolmentId is now nullable.');
  } else {
    console.log('[patches] nv_academy_payment.enrolmentId already nullable — skipped.');
  }
}

run()
  .catch((e) => { console.error('[patches] Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());

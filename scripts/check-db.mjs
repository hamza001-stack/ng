// Lists the Academy tables/columns and row counts. Run:  node scripts/check-db.mjs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
try {
  const tables = await prisma.$queryRawUnsafe(
    "select table_name from information_schema.tables where table_schema='public' order by table_name",
  );
  console.log('\nTables in the database (' + tables.length + '):');
  for (const t of tables) console.log('  - ' + t.table_name);

  for (const name of ['nv_academy_programme', 'nv_academy_session', 'nv_academy_pre_registration', 'nv_academy_enrolment', 'nv_site_page', 'nv_pricing_plan']) {
    const cols = await prisma.$queryRawUnsafe(
      `select column_name from information_schema.columns where table_schema='public' and table_name='${name}' order by ordinal_position`,
    );
    if (!cols.length) {
      console.log(`\n[MISSING] ${name}  -> run: npx prisma generate  then  npm run db:sync`);
      continue;
    }
    const count = await prisma.$queryRawUnsafe(`select count(*)::int as n from "${name}"`);
    console.log(`\n[OK] ${name}: ${count[0].n} rows`);
    console.log('     columns: ' + cols.map((c) => c.column_name).join(', '));
  }
} catch (error) {
  console.error('\nCould not read the database:', error instanceof Error ? error.message : error);
} finally {
  await prisma.$disconnect();
}

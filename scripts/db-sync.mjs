#!/usr/bin/env node
/**
 * ADDITIVE table sync from prisma/schema.prisma.
 *
 * It only ever CREATES our own tables (physical names start with "nv_") and adds
 * columns/indexes to them. It never drops, renames or alters anything else, so it
 * is safe to run against a database that already holds other tables (e.g. the
 * client's existing database): those stay exactly as they are.
 *
 * To add a table: add a model to prisma/schema.prisma with  @@map("nv_<name>")
 * (physical names must start with nv_), then build/start. See docs/EXTENDING.md.
 *
 *   node scripts/db-sync.mjs             -> push schema (fail the process on error)
 *   node scripts/db-sync.mjs --build     -> push schema, but only warn if the DB is unreachable
 *   node scripts/db-sync.mjs --seed      -> push schema, then run the idempotent seed scripts
 *
 * Works the same for local Postgres, Railway and Supabase. Adding a model to
 * prisma/schema.prisma is all that is needed: the next build/start creates it.
 *
 * Connection strings
 *   DATABASE_URL  used by the running app (may be a pooled URL).
 *   DIRECT_URL    optional. Used only here, for schema changes. Supabase: use the
 *                 direct (port 5432) or session-pooler URL, because the
 *                 transaction pooler (port 6543 / pgbouncer) cannot run DDL.
 *
 * Safety: nothing is ever dropped or altered outside nv_ tables. Differences on other
 * tables are reported and left alone. Changing/removing an nv_ column is a manual job.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

// Node does not read .env files by itself (Next.js and Prisma do, this script runs before them).
// Load .env.local then .env without overriding variables that are already set (Railway etc.).
for (const file of ['.env.local', '.env']) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m || m[1] in process.env) continue;
    let value = m[2];
    if (/^(["']).*\1$/.test(value)) value = value.slice(1, -1);
    else value = value.replace(/\s+#.*$/, '');
    process.env[m[1]] = value;
  }
}

const args = new Set(process.argv.slice(2));
const buildMode = args.has('--build');
const seed = args.has('--seed');
const strict = !buildMode || process.env.DB_SYNC_STRICT === '1';

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  console.warn('[db-sync] DATABASE_URL is not set; skipping table sync.');
  process.exit(strict ? 1 : 0);
}

const isSupabase = /supabase\.(co|com)/i.test(url);
const env = { ...process.env, DATABASE_URL: url };
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

function run(cmd, cmdArgs, options = {}) {
  const result = spawnSync(cmd, cmdArgs, {
    stdio: options.input ? ['pipe', 'inherit', 'inherit'] : 'inherit',
    env,
    shell: process.platform === 'win32',
    ...options,
  });
  return result.status === 0;
}

function fail(message) {
  console.error(`[db-sync] ${message}`);
  process.exit(strict ? 1 : 0);
}

console.log(`[db-sync] Comparing prisma/schema.prisma with ${isSupabase ? 'Supabase' : 'the database'} (additive only)…`);

const diff = spawnSync(
  npx,
  ['prisma', 'migrate', 'diff', '--from-schema-datasource', 'prisma/schema.prisma', '--to-schema-datamodel', 'prisma/schema.prisma', '--script'],
  { env, encoding: 'utf8', shell: process.platform === 'win32' },
);
if (diff.status !== 0) {
  console.error(diff.stderr || diff.stdout);
  fail('Could not compare the schema with the database.');
}

// Split the generated SQL into statements and keep ONLY additive ones on nv_ tables.
const statements = diff.stdout
  .split('\n')
  .filter((line) => !line.trim().startsWith('--'))
  .join('\n')
  .split(/;\s*(?:\n|$)/)
  .map((stmt) => stmt.trim())
  .filter(Boolean);
const additive = /^(CREATE TABLE|CREATE (UNIQUE )?INDEX|ALTER TABLE\s+"[^"]+"\s+ADD (COLUMN|CONSTRAINT))/i;
const apply = [];
const skipped = [];
for (const stmt of statements) {
  if (additive.test(stmt) && /"nv_[a-z0-9_]+"/i.test(stmt) && !/\bDROP\b/i.test(stmt)) apply.push(stmt);
  else skipped.push(stmt);
}
if (apply.length) {
  console.log(`[db-sync] Applying ${apply.length} change(s) to nv_ tables.`);
  if (!run(npx, ['prisma', 'db', 'execute', '--stdin', '--schema', 'prisma/schema.prisma'], { input: apply.map((x) => x + ';').join('\n') })) {
    fail('Could not create the nv_ tables.');
  }
} else {
  console.log('[db-sync] nv_ tables are up to date.');
}
if (skipped.length) {
  console.log(`[db-sync] Left ${skipped.length} other difference(s) untouched (existing tables are never modified).`);
}

// Supabase exposes every public table through its REST API. Enable row level security
// on OUR tables only (Prisma connects as the owner, which bypasses RLS).
if (isSupabase || process.env.DB_SYNC_ENABLE_RLS === '1') {
  const sql = `DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'nv\\_%' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;`;
  if (run(npx, ['prisma', 'db', 'execute', '--stdin', '--schema', 'prisma/schema.prisma'], { input: sql })) {
    console.log('[db-sync] Row level security enabled on nv_ tables.');
  } else {
    console.warn('[db-sync] Could not enable row level security on nv_ tables. Enable it in the Supabase dashboard.');
  }
}

// Run one-time column patches before seeding
if (seed && existsSync('prisma/patches.ts')) {
  console.log('[db-sync] Running prisma/patches.ts');
  run(npx, ['tsx', 'prisma/patches.ts']);
}

if (seed) {
  for (const file of ['prisma/seed.ts', 'prisma/content.ts', 'prisma/academy-seed.ts', 'prisma/create-admin.ts']) {
    console.log(`[db-sync] Running ${file}`);
    if (!run(npx, ['tsx', file])) fail(`${file} failed.`);
  }
}

console.log('[db-sync] Done.');

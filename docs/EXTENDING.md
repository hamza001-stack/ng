# Extending the platform

## 1. Add a new database table (auto-created on build / start)

1. Open `prisma/schema.prisma` and add a `model` (see `NvSitePage` / `NvAcademyPreRegistration` as examples). Give it `@@map("nv_<name>")`: the sync only creates tables whose physical name starts with `nv_`, so it can never touch tables that already exist in the database (for example the client's).
2. Commit and push. That is all.

`npm run build` and `npm start` both run `scripts/db-sync.mjs`, which runs `prisma db push`
against `DATABASE_URL` (or `DIRECT_URL` when set). New models become tables, new fields become
columns. `db push` never drops data by itself; if a change would lose data it stops with an error.

- Locally: `npm run db:sync` (push + seed + admin user).
- Build servers without database access (e.g. Docker builds): the build step only warns; the
  table sync then happens on `npm start`. Set `DB_SYNC_STRICT=1` to make the build fail instead.
- Use the new table from server code: `import { prisma } from '@/server/db'` then `prisma.yourModel.findMany()`.
  Wrap reads of *public* pages in `try/catch` and fall back to defaults (see `src/server/site-content.ts`)
  so the site still renders if the table is not there yet.

### Supabase

Supabase is plain Postgres, so nothing in the code changes.

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Supabase pooled URL (Transaction pooler, port 6543) with `?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | Supabase **direct** (port 5432) or **session pooler** URL. Only used by `db-sync` for table changes; the transaction pooler cannot run DDL. |

When the URL contains `supabase.co/.com`, `db-sync` also enables Row Level Security on every public
table. Supabase exposes `public` tables over its REST API; with RLS on and no policies the anon key
cannot read them, while this app (which connects as the table owner through Prisma) is unaffected.
Set `DB_SYNC_ENABLE_RLS=1` to do the same on other hosts.

## 2. Edit page HTML, SEO and pricing (admin)

Admin console → **Pages & pricing** (`/admin/pages`, or your `ADMIN_PATH`).

- **Page content & SEO**: pick a page, set an SEO title/description override and add HTML. The HTML
  is shown at the top of that page and is sanitised when rendered (`src/lib/sanitize-html.ts`).
  Staff and above can edit. "Reset to default" deletes the override.
- **Pricing plans**: edit name, price, note, bullet points, button label and the "recommended" flag
  of the four plans on `/pricing`. Managers and above only. Defaults live in `src/lib/editorial.ts`.
  The comparison table below the plans stays defined in code.
- Product prices are edited in **Products** (`/admin/marketplace`) as before.

Make another page editable: add it to `src/lib/site-pages.ts`, then on that page call
`getPageMetadata(key, fallback, path)` in `generateMetadata` and render `<SitePageHtml pageKey="key" />`.
Everything served by `src/app/[slug]/page.tsx` already does this.

## 3. Academy

| URL | File |
| --- | --- |
| `/academy` (Overview tab) | `src/app/academy/page.tsx` |
| `/academy/courses` (Courses tab) | `src/app/academy/courses/page.tsx` |
| `/academy/pre-registration` (Pre-registration tab) | `src/app/academy/pre-registration/page.tsx` |
| `/academy/<course-id>` (one course + lessons) | `src/app/academy/[id]/page.tsx` |

Tab labels and links: `academyTabs` in `src/features/academy.tsx`. To add a tab, add a line there and
create `src/app/academy/<name>/page.tsx` (course ids `courses` and `pre-registration` are reserved).

Courses come from the `CmsCourse` / `CmsLesson` tables, falling back to `src/lib/catalogue.ts` when
the tables are empty or unreachable. A course inserted in the database has its own page immediately.
Seed data is create-only: redeploys never overwrite edits.

Pre-registrations are stored in `NvAcademyPreRegistration` (unique per email + programme) and listed,
with a status you can change, in Admin → Academy.

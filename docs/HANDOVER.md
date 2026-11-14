# NEVIE-GLOBAL UK — frontend handover

## 1. Folder structure

See the architecture map in README.md. App Router server pages compose feature-specific client islands. Shared data, validation and metadata live outside page components. `components/ui/button.tsx` uses Radix Slot and class-variance-authority with shadcn conventions. Global CSS defines the black/gold/electric-blue design tokens and responsive rules. Next.js middleware provides language and private-route robot headers; application authorization must be implemented at the service boundary when identity is connected.

## 2. Route map

Public: `/`, `/about`, `/services`, `/solutions`, `/industries`, `/ai`, `/ai-agents`, `/voice-ai`, `/private-llm`, `/automation`, `/crm`, `/erp`, `/saas`, `/api-development`, `/software-development`, `/mobile-app-development`, `/web-development`, `/cloud`, `/cyber-security`, `/consulting`, `/blockchain`, `/academy`, `/marketplace`, `/products`, `/pricing`, `/portfolio`, `/case-studies`, `/resources`, `/documentation`, `/blog`, `/support`, `/faq`, `/contact`, `/partners`, `/investors`.

Account/commerce previews (noindex): `/cart`, `/checkout`, `/orders`, `/dashboard`, `/my-account`, `/downloads`, `/certificates`, `/wishlist`, `/invoices`, `/settings`.

Legal: `/privacy`, `/cookies`, `/terms`, `/legal`.

Details: `/marketplace/[id]` (4 products), `/academy/[id]` (courses from the CmsCourse table; see docs/EXTENDING.md), `/blog/[id]` (3 editorial articles). Unknown paths return the custom 404.

Machine endpoints: `/robots.txt`, `/sitemap.xml`, `/image-sitemap.xml`, `/manifest.webmanifest`, `/rss.xml`. Server integrations: POST `/api/contact`, POST `/api/newsletter`.

## 3. Components created

Header with responsive navigation and cart count; Footer; PageHead; InfoCards; Button primitive; Providers (TanStack Query and validated local preview state); JsonLd; BreadcrumbSchema; Marketplace (search, category, sort, wishlist); ProductActions; Cart and checkout review; Academy catalogue; dynamically imported CoursePlayer; Account navigation, profile preview and settings; ContactForm; Newsletter; EnquiryEmail; loading skeleton; route error boundary; custom 404.

## 4. SEO checklist

Implemented: Metadata API, title template, descriptions, canonical URLs, en-GB and x-default alternatives, OpenGraph, Twitter metadata, Organization, Product, Course, Article, FAQ and Breadcrumb JSON-LD, robots, sitemap, image sitemap, manifest, RSS, semantic headings and internal links. Private preview routes excluded from sitemap and marked noindex. JSON-LD escapes `<` to prevent script injection.

Deliberate limits: English UK is the only published locale; no fictional translated routes. No fabricated Product offers, ratings or testimonials in structured data. Rich-result eligibility is not guaranteed. Production domain, final legal entity, editorial approval and Search Console setup remain release tasks. The social card uses official logo artwork rather than an invented brand graphic.

## 5. Performance & accessibility checklist

Implemented: Server Components first; route splitting; dynamic course-player import; Suspense; self-hosted Poppins; WebP assets; next/image AVIF/WebP negotiation on the Node runtime; reserved image layout; lazy loading for non-priority images; prioritized hero; optimized icon imports; reduced-motion support; keyboard focus, skip link, labels and semantic navigation; responsive layouts across narrow/mobile/tablet/desktop breakpoints.

Lighthouse targets (desktop 95+, mobile 90+) have NOT been measured and are not claimed. The exact requested viewport set and 200% zoom need browser QA before commercial release. Automated lint/type/build checks do not establish WCAG conformance. The static hosting preview uses preoptimized images because the Next image service is not available there.

## 6. Remaining backend APIs

- Identity: sign-in, session, logout, account recovery and email verification; server-side authorization on every private record.
- Profile/preferences: read/update profile, consent records and account deletion/export.
- Catalogue: products, categories, versioned prices, tax treatment, licences and availability.
- Commerce: server-authoritative cart validation, checkout sessions, verified payment webhooks, orders, refunds and invoices.
- Fulfilment: entitlement checks, expiring signed download URLs, versioned assets and audit records.
- Reviews: verified-purchase eligibility, moderation and pagination.
- Academy: course/lesson content, enrolment, progress, assessments and signed/verifiable certificates.
- Forms: authenticated CRM intake and newsletter double-opt-in delivery, distributed rate limiting, abuse prevention and monitoring.
- Content: approved case studies, testimonials, partner brand permissions, blog CMS and UK legal documents.
- Support: authenticated ticket creation, attachments, status and service ownership.

## 7. Marketplace integration plan

1. Replace catalogue constants with typed server repository adapters and validated response schemas. Preserve stable slugs and add pagination/cache invalidation.
2. Connect identity and migrate the device-local bag/wishlist only after consent. Scope every query to the authenticated user.
3. Create checkout sessions server-side using current product prices and taxes. Never accept client totals. Use idempotency keys.
4. Verify payment webhook signatures; handle retries, out-of-order events and refunds. Create orders and entitlements transactionally.
5. Issue short-lived download links only after entitlement checks. Generate invoices from authoritative order records.
6. Enable verified reviews, monitoring and purchase/refund/fulfilment end-to-end tests before turning on payment controls.

## 8. Academy integration plan

1. Move courses and lessons to a versioned CMS/LMS repository with publish controls.
2. Connect authentication and enrolment authorization. Keep paid content and media URLs behind server checks.
3. Persist idempotent progress events per user/course/version. Reconcile optional preview progress explicitly.
4. Add accessible video/transcripts where approved lesson media exists; the current courses are text introductions.
5. Add assessments with server-side completion rules. Issue certificates only after verified completion; include a revocable verification URL.
6. Add instructor/content operations, enrolment support, audit trails and cross-device progress tests.

## 9. Production readiness assessment

Provisional frontend engineering assessment: **75/100** (judgement, not a measured benchmark).

The frontend has the requested route foundation and useful preview interactions. It is not ready for commercial transactions: backend identity, payments, fulfilment and LMS services are absent; catalogue products/prices are illustrative; final UK legal/business content and browser performance/accessibility QA remain open. Do not interpret successful compilation as commercial launch approval.

The Node deployment is the production architecture and supports middleware, image optimization and form API adapters. An optional owner-only static preview omits server APIs and middleware and explicitly keeps submissions and purchasing unavailable. Use the Node deployment with reviewed environment variables for a real launch.

## Verification evidence

See `docs/VALIDATION.md` for command outcomes and HTTP smoke-test results. Evidence is recorded after checks finish, without invented Lighthouse scores.

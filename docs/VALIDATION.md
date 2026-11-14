# Validation — 8 September 2026

- `npm install`: completed. Next.js 15.5.25 installed; lockfile retained.
- `npm run lint`: passed with zero warnings after configuration cleanup.
- `npm run typecheck`: passed.
- `npm run test`: 3 tests passed (contact validation, newsletter consent, catalogue/route integrity).
- `npm run build`: passed; 68 generated pages/endpoints. Separate `.next-dev` output prevents development/production build interference.
- `npx tsx tests/smoke.ts`: passed against `next start` on port 3001. All 63 public/preview/detail/metadata routes returned 200. Unknown route returned 404. Invalid contact input returned 400, cross-origin input 403, and a valid submission without a configured backend 503. Private dashboard metadata contains noindex and it is excluded from the sitemap.
- `npm audit`: zero reported vulnerabilities after compatible PostCSS and sharp overrides. Keep reviewing overrides when upgrading Next.js.

## Build output

Homepage first-load JavaScript: 162 kB. Shared baseline: 103 kB. Generic top-level route bundle: 209 kB. Academy detail: 107 kB. Product detail: 131 kB. These are Next.js build estimates, not network or Lighthouse measurements.

Official hero WebP: 67,060 bytes. Official logo WebP: 28,306 bytes. Self-hosted fonts avoid runtime Google Fonts requests.

## Limitations

Lighthouse, browser interaction, exact viewport and assistive-technology QA have not been performed. No production-ready score is inferred from build success. Payment, authenticated records, fulfilment, newsletter delivery and verified certificates have not been integration-tested because their services are not connected.

Next-intl emits a non-fatal webpack build-cache analysis warning. The build succeeds. Next.js logs an internal NoFallbackError while handling an unknown generated route; the HTTP smoke check confirms the response is 404.

## Deployment modes

The default build is the full Next.js Node runtime with middleware and POST adapters. `scripts-preview.ps1` creates an optional static preview for private Sites hosting, with preoptimized images and disabled server submissions. Static hosting does not execute middleware or API handlers.

Static preview export: passed. Next.js explicitly warns that API routes and middleware are disabled in this deployment mode; this is intentional and disclosed in the interface and handover.

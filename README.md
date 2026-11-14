# NEVIE-GLOBAL UK

A new Next.js 15 commercial frontend. Built independently from the France platform. The reference website was used only to identify official brand artwork; no source HTML, CSS or JavaScript was reused.

## Run

Requires Node.js 22.9+ or Node.js 24 and npm.

```sh
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
npm start
```

Copy `.env.example` to `.env.local` when connecting services. Never commit secrets.

## Architecture

- `src/app/`: App Router layouts, public pages, detail routes, API handlers and metadata endpoints.
- `src/components/`: shared header/footer, providers, page heading and shadcn-style UI primitives.
- `src/features/`: marketplace, academy, account and form client islands.
- `src/lib/`: typed catalogue, routing, validation, submissions, SEO and utility contracts.
- `src/i18n/`: next-intl request configuration, currently British English only.
- `src/emails/`: React Email enquiry acknowledgement template.
- `public/brand/`: official local brand artwork, optimized as WebP.
- `tests/`: validation and catalogue integrity tests.
- `docs/`: handover, API integration and asset provenance.

Server Components own page composition and metadata. Client islands own browser interactions. The static catalogue is deliberately separate from presentation so a typed service layer can replace it. TanStack Query owns submission mutations and is configured for future remote reads. Preview state uses a versioned localStorage key and validates loaded data. It is not an authenticated account store.

## Current operating mode

The marketplace is an illustrative catalogue, with device-local bag and wishlist. Prices are not commercial offers. Checkout does not charge or create orders. Academy lessons are readable and progress persists locally; certificates are not issued. Profile edits are page-local previews. No client claims, reviews, testimonials or partner endorsements have been fabricated.

Contact/newsletter handlers validate input and fail closed with HTTP 503 until configured. The production deployment must connect authenticated upstream services, distributed abuse prevention and email delivery before enabling submissions. React Email rendering/sending belongs in that integration.

See `docs/HANDOVER.md` for the requested route map, checklists, API gaps and launch assessment.

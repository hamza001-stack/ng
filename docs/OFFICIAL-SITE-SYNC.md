# Official site synchronization — 28 September 2026

Primary source: https://nevie-global.com/ (WordPress / Astra, French, EUR).
This repository is the **UK commercial platform** (English, GBP). Published facts were copied. Unpublished facts were not invented.

## Updated items

- Contact email default: `contact@nevie-global.com` (legal.ts, env, .env.example, Railway helper, SMTP hint, Organization JSON-LD).
- Social profiles wired in footer, contact page, Organization `sameAs`, Open Graph Twitter site `@GlobalNevi52586`: Instagram, X, LinkedIn, mailto.
- Official logo from `wp-content/uploads/2026/05/nevie-global11-scaled.jpg` → `/brand/logo.webp`, `/brand/logo.png`, `/icon.png`, `/apple-touch-icon.png`. Recreated globe wordmark SVG removed from UI.
- Official OG artwork → `/brand/og.jpg` (used for Open Graph / Twitter cards).
- Jewellery product photos re-imported from the Hostinger CDN used by the official site.
- Coffret Fondateur compare-at **279 EUR** (shown beside **189 EUR** on the homepage) stored as `compareAtPrice` / `compareAtPence`.
- Contact form now includes optional phone and offer-of-interest (fields published on `/contact/`).
- About page uses the English founder story published on `/founder-about/` (Emmanuel & Elisa).
- Legal pages cite Mentions légales and Politique de confidentialité; they do not paste unpublished CGV.
- Admin Settings shows the published contact/social facts.
- Request-a-quote copy includes the published email.

## New items imported

- `src/lib/company.ts` — single source of published business facts.
- Brand files: `logo.webp`, `logo.png`, `og.jpg`, `og.webp`, `public/icon.png`.
- Jewellery webp set (Aura, Signet, Origin, Link, Core, Weave) plus founder images (see TBC).

## Missing information (not on the official site)

| Item | Status |
| --- | --- |
| Facebook / TikTok / YouTube / Pinterest / Telegram / Discord / WhatsApp / GitHub | Icon or nothing; **no profile URL** |
| Phone | No `tel:` listing. `+33 6 12 34 56 78` is a form placeholder, not a published line |
| Google Maps / UK office / opening hours | Paris LAT/LONG graphic only — **not a postal address** |
| UK company number, VAT, ICO, registered office | Not published |
| SAS FR SIREN / share capital / French registered office for NEVIE | Mentions légales names “SAS FR” only |
| CGV / cookies page / shipping / returns / warranty | **404** or absent (`/politique-des-cookies`, CGV URLs) |
| Dedicated Carte/Coffret product photography on the homepage HTML | Not found as separate assets; founder SKUs currently use the official brand mark |
| Sales vs support vs contact mailboxes | Only `contact@nevie-global.com` |

## To Be Confirmed

- **Carte Fondateur price:** homepage card **1€**; contact form dropdown **129€**. Catalogue keeps **1** (homepage offer).
- **Coffret 189€ vs 279€:** treated as sale vs compare-at. Confirm with operations.
- **Currency:** official site EUR; this UK platform remains GBP. No invented conversion.
- **Language:** official `fr_FR`; this platform remains `en-GB`.
- **Smart Glasses™ (NV-GLASSES / OPTX.01)** and SERIES-H/D/P robots: published as Coming Soon / R&D — **not added as buyable SKUs**.
- **LEGAL_CONTACT_EMAIL / EMAIL_FROM** on Railway if they still say `hello@nevie.global`.
- Dispatch windows, materials, sizes, connected features (already TBC in product specs).
- Whether the UK entity is distinct from the SAS FR named on Mentions légales.

## Manual review required

- Do not paste French Mentions légales / RGPD as if they were UK consumer terms.
- Official nav (Accueil, About, Vision, Avatars, Technologie, Produits, Contact) is a smaller WordPress site. This UK platform keeps Marketplace, Academy, Services, legal UK pages.
- Cookie banner on the FR site is “continue = accept”. UK banner stays PECR choice (essential vs optional).
- Founder product images should be replaced when dedicated photos are published.
- Leftover unused files in `public/brand` (`brain.webp`, `source-logo.webp`, `original-logo.jpg`) and old digital-product webps in `public/products/` (cloud-console, customer-hub, …) are not in the current 8-SKU catalogue.

## Section scores

| Area | Result |
| --- | --- |
| Logo | **Updated** — official mark; globe wordmark removed from UI |
| Colors | **No Changes** — no named hex system on the FR site; UK tokens (blue `#00a9ff`, gold, black, white) unchanged |
| Typography | **No Changes** — FR site is Astra/Elementor; UK keeps Orbitron + Roboto Condensed |
| Products | **Updated** — 8 SKUs aligned; compare-at on Coffret; glasses/robots not SKUs |
| Images | **Updated** (jewellery); founder shots **TBC** |
| Categories | **Updated** — Founder access + Connected jewellery (no new unpublished categories) |
| Marketplace | **Updated** — images + Coffret compare-at |
| Navigation | **Partial** — UK IA retained; official socials/contact synced |
| SEO | **Updated** — OG image, Twitter site, Organization sameAs + email |
| Pages | **Updated** — About, Contact, Legal suite, Footer, Quote |
| Remaining manual | Railway env email; Companies House; founder photography; Carte 1 vs 129 |

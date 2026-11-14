import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TBC = 'To Be Confirmed';
const INTERNAL = 'NEVIE-GLOBAL (internal)';
const shots = '/case-studies/nevie-platform';

const platformStudy = {
  slug: 'nevie-global-uk-platform',
  title: 'Building the NEVIE-GLOBAL UK commerce and services platform',
  summary:
    'How we designed and built our own UK platform: a GBP marketplace with Stripe Checkout, the NEVIE Academy, service pages with quote capture, and an admin console for CRM, CMS and delivery.',
  coverUrl: `${shots}/storefront.jpg`,
  client: INTERNAL,
  industry: 'Technology & connected products',
  country: 'United Kingdom',
  services: ['Website', 'E-commerce', 'CRM', 'Automation', 'Academy'],
  technologies: [
    'Next.js 15',
    'React 19',
    'TypeScript',
    'Tailwind CSS 4',
    'PostgreSQL',
    'Prisma',
    'Redis',
    'Better Auth',
    'Stripe Checkout',
    'SMTP (Nodemailer)',
    'Playwright',
  ],
  results: [
    '8 products on sale in GBP through Stripe Checkout',
    '2 Academy courses and 3 articles published from the CMS',
    'Quote, call, demo and waiting-list requests stored as CRM leads',
    `Commercial performance metrics: ${TBC}`,
  ],
  duration: TBC,
  year: 2026,
  published: true,
  body: `NEVIE-GLOBAL needed a UK home for its ecosystem: founder access, connected jewellery, learning and technology services, presented as one premium brand. This case study documents that build. It is our own product, so every figure below comes from the running platform; commercial results are marked To Be Confirmed until they are measured.

## Challenge

The ecosystem spans very different offers — a £1 digital founder card, physical jewellery sold on pre-order, free learning and bespoke services. Each needed its own buying journey without the site feeling like four separate products. The UK platform also had to price in GBP, handle UK VAT, respect UK GDPR and keep the original French product names.

## Objectives

- One storefront for founder access and connected jewellery, paid through Stripe Checkout
- Service pages that turn interest into a qualified, stored enquiry
- A learning space (NEVIE Academy) that shares the same account
- An admin console so the team can run products, content, leads and delivery without developers
- No invented figures anywhere: unconfirmed details are shown as To Be Confirmed

## Architecture

The platform is a single Next.js 15 application using the App Router and React Server Components. PostgreSQL (through Prisma) is the system of record for products, orders, leads, content and projects. Redis backs rate limiting and short-lived state. Public pages read through tagged caches, so publishing in the admin refreshes only the pages affected.

## UI/UX

The interface follows the NEVIE-GLOBAL identity: deep navy and electric blue with gold accents, in light and dark themes. Motion is used sparingly for reveals and progress, and it switches off for visitors who prefer reduced motion. Every page was checked at desktop and mobile widths for layout and horizontal overflow.

## Backend

Server routes validate every input with schemas before it reaches the database. Quote requests accept structured project details and an optional brief; attachments are stored privately and are only downloadable by staff. Transactional email is sent over SMTP, configured from the admin console. Staff access sits behind a private console URL and mandatory two-step verification.

## Security

Staff areas are protected by role checks on every request. Public forms combine rate limiting, a honeypot field and optional Turnstile verification. Card data never touches the server: payment happens on Stripe Checkout.

## Testing

Type checking and linting run on every change, with automated tests and a CI workflow. Browser checks with Playwright capture each key page at desktop and mobile sizes and submit the quote form end to end.

## SEO

Each page has its own title, description and canonical URL, with structured data for products, services, FAQs and breadcrumbs. English (UK) is the published locale; a French version is ${TBC}.

## Screenshots

![Storefront — the NEVIE-GLOBAL home page](${shots}/storefront.jpg)

![Marketplace — founder access and connected jewellery in GBP](${shots}/marketplace.jpg)

![Product page — Bague Aura, sold on pre-order](${shots}/product.jpg)

![NEVIE Academy — introductory courses](${shots}/academy.jpg)

![Pricing — engagement plans and quote request](${shots}/pricing.jpg)

## Results

The platform is running with its full catalogue, learning space, service pages and admin console in place. Traffic, conversion and revenue figures are ${TBC} and will be added once they have been measured over a meaningful period.

## Lessons Learned

- Mark unconfirmed information clearly instead of filling gaps; it builds more trust than placeholder numbers.
- Keep one source of truth: products and content come from the database, not from copies in the code.
- Private by default: client projects only appear publicly when someone explicitly publishes them.`,
};

const clientTemplate = {
  slug: 'template-client-case-study',
  title: 'Template — client case study (not published)',
  summary: 'Internal template. Duplicate the structure for a client once they have approved publication.',
  coverUrl: null,
  client: null,
  industry: null,
  country: 'United Kingdom',
  services: [],
  technologies: [],
  results: [],
  duration: null,
  year: null,
  published: false,
  body: `Internal template — keep unpublished. Replace every line marked ${TBC} with details approved by the client.

## Challenge

Client situation and problem: ${TBC}.

## Objectives

Agreed goals and success measures: ${TBC}.

## Discovery

What we learned in the workshop: ${TBC}.

## Architecture

Systems, data flows and hosting: ${TBC}.

## Development

What was built, and in which increments: ${TBC}.

## Security

Data handling and access controls: ${TBC}.

## Testing

How quality was verified: ${TBC}.

## Results

Measured outcomes approved by the client (no estimates): ${TBC}.

## Lessons Learned

${TBC}.`,
};

const projects = [
  {
    slug: 'nevie-marketplace',
    title: 'NEVIE Marketplace',
    summary:
      'The UK storefront for founder access and connected jewellery, with GBP pricing, UK VAT and secure payment through Stripe Checkout.',
    goal: 'Let UK customers discover and buy NEVIE products in one premium, trustworthy journey.',
    phase: 'RELEASED',
    progress: 100,
    category: 'E-commerce',
    technologies: ['Next.js', 'PostgreSQL', 'Stripe Checkout', 'SMTP'],
    features: [
      '8 products across Founder access and Connected jewellery',
      'Category browsing, search, wishlist and comparison',
      'Stripe Checkout in GBP with UK VAT',
      'Order confirmation emails',
      'Stock managed from the admin console',
    ],
    coverUrl: `${shots}/marketplace.jpg`,
  },
  {
    slug: 'nevie-academy',
    title: 'NEVIE Academy',
    summary:
      'Practical courses on AI and automation for business teams, published and managed from the platform CMS.',
    goal: 'Help clients build confidence with AI and automation before they commission work.',
    phase: 'RELEASED',
    progress: 100,
    category: 'Academy',
    technologies: ['Next.js', 'PostgreSQL', 'CMS'],
    features: [
      'Two courses live: “Practical AI for business” and “Automation foundations”',
      'Lesson-by-lesson navigation with in-session progress',
      'Courses managed from the admin CMS',
      `Verified certificates: ${TBC}`,
      `Saved progress across devices: ${TBC}`,
    ],
    coverUrl: `${shots}/academy.jpg`,
  },
  {
    slug: 'founder-access',
    title: 'Founder Access',
    summary:
      'Carte Fondateur (£1) and Coffret Fondateur (£189): the entry points to the NEVIE-GLOBAL ecosystem, available to buy now.',
    goal: 'Give early supporters priority access to the NEVIE-GLOBAL technology ecosystem.',
    phase: 'RELEASED',
    progress: 100,
    category: 'Marketplace',
    technologies: ['Stripe Checkout', 'PostgreSQL'],
    features: [
      'Carte Fondateur — digital priority access credentials',
      'Coffret Fondateur — complete physical and digital founder set',
      `Detailed founder benefits: ${TBC}`,
      `Coffret dispatch window: ${TBC}`,
    ],
    coverUrl: '/products/founder-box.webp',
  },
  {
    slug: 'connected-jewellery',
    title: 'Connected Jewellery',
    summary:
      'Three rings and three bracelets, open for pre-order in GBP. Dispatch, materials, sizing and connected features are To Be Confirmed.',
    goal: 'Bring the NEVIE-GLOBAL ecosystem into wearable form.',
    phase: 'TBC',
    progress: null,
    category: 'Marketplace',
    technologies: ['Stripe Checkout'],
    features: [
      'Rings: Bague Aura (£149), Bague Signet (£179), Bague Origin (£229)',
      'Bracelets: Bracelet Link (£129), Bracelet Core (£169), Bracelet Weave (£229)',
      'Presentation case included with every piece',
      `Dispatch window: ${TBC}`,
      `Materials and sizing: ${TBC}`,
      `Connected features and companion app: ${TBC}`,
    ],
    coverUrl: '/products/bague-aura.webp',
  },
];

async function main() {
  for (const study of [platformStudy, clientTemplate]) {
    await prisma.caseStudy.upsert({ where: { slug: study.slug }, create: study, update: study });
  }
  for (const project of projects) {
    const data = { ...project, client: INTERNAL, isPublic: true, status: project.phase === 'RELEASED' ? 'DONE' : 'DOING' } as const;
    await prisma.deliveryProject.upsert({ where: { slug: project.slug }, create: data, update: data });
  }
  console.log('content ready:', await prisma.caseStudy.count(), 'case studies,', await prisma.deliveryProject.count(), 'projects');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

export const PROJECT_PHASES = [
  'PLANNING',
  'RESEARCH',
  'DESIGN',
  'DEVELOPMENT',
  'TESTING',
  'REVIEW',
  'READY',
  'RELEASED',
  'MAINTENANCE',
] as const;

export type ProjectPhase = (typeof PROJECT_PHASES)[number];

export const phaseLabel: Record<ProjectPhase, string> = {
  PLANNING: 'Planning',
  RESEARCH: 'Research',
  DESIGN: 'Design',
  DEVELOPMENT: 'Development',
  TESTING: 'Testing',
  REVIEW: 'Review',
  READY: 'Ready',
  RELEASED: 'Released',
  MAINTENANCE: 'Maintenance',
};

export const TBC = 'To Be Confirmed';

export function toPhase(value: string | null | undefined): ProjectPhase {
  return (PROJECT_PHASES as readonly string[]).includes(value || '') ? (value as ProjectPhase) : 'PLANNING';
}

export type PublicPhase = ProjectPhase | 'TBC';

export function toPublicPhase(value: string | null | undefined): PublicPhase {
  return value === 'TBC' ? 'TBC' : toPhase(value);
}

export function publicPhaseLabel(value: PublicPhase) {
  return value === 'TBC' ? `Status ${TBC.toLowerCase()}` : phaseLabel[value];
}

export const deliveryStages = [
  { phase: 'PLANNING', copy: 'Goals, owners and the first release are agreed.' },
  { phase: 'RESEARCH', copy: 'Users, data and existing systems are mapped.' },
  { phase: 'DESIGN', copy: 'Flows, wireframes and interface are reviewed.' },
  { phase: 'DEVELOPMENT', copy: 'Features are built behind review gates.' },
  { phase: 'TESTING', copy: 'Automated and manual checks before release.' },
  { phase: 'RELEASED', copy: 'Shipped to production with monitoring.' },
  { phase: 'MAINTENANCE', copy: 'Fixes, updates and measured improvements.' },
] as const satisfies readonly { phase: ProjectPhase; copy: string }[];

export const CASE_STUDY_SECTIONS = [
  'Challenge',
  'Objectives',
  'Discovery',
  'Research',
  'Architecture',
  'Wireframes',
  'UI/UX',
  'Development',
  'Backend',
  'Infrastructure',
  'Security',
  'Testing',
  'Deployment',
  'Performance',
  'SEO',
  'Analytics',
  'Screenshots',
  'Before/After',
  'Results',
  'Lessons Learned',
] as const;

export type StudySection = { id: string; title: string; body: string };

export function parseStudyBody(body: string): { intro: string; sections: StudySection[] } {
  const parts = body.split(/^##\s+/m);
  const intro = parts.shift()?.trim() || '';
  const sections = parts
    .map((part) => {
      const [first, ...rest] = part.split('\n');
      const title = first.trim();
      return {
        id: title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
        title,
        body: rest.join('\n').trim(),
      };
    })
    .filter((section) => section.title && section.body);
  return { intro, sections };
}

export function readingMinutes(text: string) {
  return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 220));
}

export const pricingPrinciples = [
  {
    title: 'Transparent',
    copy: 'Every proposal itemises scope, milestones and what is excluded before anything is signed.',
  },
  {
    title: 'Scalable',
    copy: 'Start with a narrow first release and extend it in funded phases as results come in.',
  },
  {
    title: 'Custom',
    copy: 'Figures follow your systems, data and approval process — not a generic package.',
  },
  {
    title: 'Enterprise',
    copy: 'Security reviews, procurement paperwork and named contacts for larger organisations.',
  },
];

export type Plan = {
  id: 'discover' | 'build' | 'evolve' | 'enterprise';
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  points: string[];
  cta: string;
  featured?: boolean;
};

export const plans: Plan[] = [
  {
    id: 'discover',
    name: 'Discover',
    tagline: 'Clarify the problem and a practical plan.',
    price: TBC,
    priceNote: 'Discovery fee',
    points: ['Outcome workshop', 'Current-system review', 'Written roadmap and estimate'],
    cta: 'Request discovery',
  },
  {
    id: 'build',
    name: 'Build',
    tagline: 'Design, build and launch a defined release.',
    price: TBC,
    priceNote: 'Build fee — set per proposal',
    points: ['Fixed delivery scope', 'Design, build and QA', 'Launch, handover and docs'],
    cta: 'Discuss a build',
    featured: true,
  },
  {
    id: 'evolve',
    name: 'Evolve',
    tagline: 'Ongoing product and operations work.',
    price: TBC,
    priceNote: 'Monthly retainer',
    points: ['Reserved delivery capacity', 'Support and maintenance', 'Measured improvements'],
    cta: 'Talk about retainers',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Multi-team programmes with governance.',
    price: TBC,
    priceNote: 'Enterprise agreement',
    points: ['Security and compliance review', 'Named delivery lead', 'SLA-backed support'],
    cta: 'Contact enterprise team',
  },
];

type Cell = boolean | string;

export const comparisonRows: { feature: string; values: [Cell, Cell, Cell, Cell] }[] = [
  { feature: 'Pages', values: ['Audit', 'As scoped', 'Ongoing', 'As scoped'] },
  { feature: 'CMS', values: ['Review', true, true, true] },
  { feature: 'SEO', values: ['Audit', true, true, true] },
  { feature: 'Animations', values: [false, true, true, true] },
  { feature: 'Forms', values: [false, true, true, true] },
  { feature: 'Operations workspace', values: [false, 'Optional', true, true] },
  { feature: 'CRM', values: ['Review', 'Optional', 'Optional', true] },
  { feature: 'Automation', values: ['Mapping', 'Optional', true, true] },
  { feature: 'AI features', values: ['Assessment', 'Optional', 'Optional', true] },
  { feature: 'Support', values: ['Email', 'Launch window', 'Retainer', 'SLA'] },
  { feature: 'Hosting', values: [false, 'Setup', 'Managed', 'Managed'] },
  { feature: 'Training', values: [false, 'Handover', true, true] },
  { feature: 'Documentation', values: ['Roadmap', true, true, true] },
  { feature: 'API access', values: [false, 'Optional', true, true] },
  { feature: 'Integrations', values: ['Mapping', 'As scoped', true, true] },
  { feature: 'Deployment', values: [false, true, true, true] },
  { feature: 'Testing', values: [false, true, true, true] },
  { feature: 'Maintenance', values: [false, false, true, true] },
  { feature: 'Security review', values: ['Checklist', 'Baseline', 'Baseline', 'Full review'] },
  { feature: 'Performance', values: ['Audit', 'Budgeted', 'Monitored', 'Monitored'] },
];

export type Service = {
  slug: string;
  name: string;
  image: string;
  description: string;
  startingPrice: string | null;
  timeline: string | null;
  related: string[];
  page?: string;
};

export const services: Service[] = [
  {
    slug: 'website',
    name: 'Website',
    page: 'web-development',
    image: '/showcase/web-development.webp',
    description: 'Fast, accessible marketing sites with a CMS your team can run.',
    startingPrice: null,
    timeline: null,
    related: ['seo', 'hosting', 'maintenance'],
  },
  {
    slug: 'ecommerce',
    name: 'E-commerce',
    image: '/showcase/ecommerce.webp',
    description: 'Stores with UK VAT, payments, fulfilment and customer accounts.',
    startingPrice: null,
    timeline: null,
    related: ['seo', 'automation', 'inventory'],
  },
  {
    slug: 'crm',
    name: 'CRM',
    page: 'crm',
    image: '/showcase/crm.webp',
    description: 'Pipelines, contacts and reporting shaped around how you sell.',
    startingPrice: null,
    timeline: null,
    related: ['automation', 'ai', 'saas'],
  },
  {
    slug: 'automation',
    name: 'Automation',
    page: 'automation',
    image: '/showcase/workflow-studio.webp',
    description: 'Workflows that remove manual hand-offs between your tools.',
    startingPrice: null,
    timeline: null,
    related: ['crm', 'ai', 'custom-software'],
  },
  {
    slug: 'ai',
    name: 'AI',
    page: 'ai',
    image: '/showcase/ai-agents.webp',
    description: 'Assistants and agents with human review built into the flow.',
    startingPrice: null,
    timeline: null,
    related: ['rag', 'automation', 'crm'],
  },
  {
    slug: 'rag',
    name: 'RAG',
    page: 'private-llm',
    image: '/showcase/knowledge-agent.webp',
    description: 'Answers grounded in your own documents, with sources cited.',
    startingPrice: null,
    timeline: null,
    related: ['ai', 'saas', 'academy'],
  },
  {
    slug: 'saas',
    name: 'SaaS',
    page: 'saas',
    image: '/showcase/saas.webp',
    description: 'Multi-tenant products with billing, roles and an admin console.',
    startingPrice: null,
    timeline: null,
    related: ['hosting', 'ai', 'mobile'],
  },
  {
    slug: 'marketplace',
    name: 'Marketplace',
    image: '/showcase/customer-hub.webp',
    description: 'Two-sided platforms with listings, payouts and moderation.',
    startingPrice: null,
    timeline: null,
    related: ['ecommerce', 'saas', 'automation'],
  },
  {
    slug: 'academy',
    name: 'Academy',
    image: '/showcase/academy.webp',
    description: 'Course platforms with lessons, progress tracking and payments.',
    startingPrice: null,
    timeline: null,
    related: ['rag', 'saas', 'ecommerce'],
  },
  {
    slug: 'inventory',
    name: 'Inventory',
    image: '/showcase/cloud.webp',
    description: 'Stock, locations and purchasing in one reliable record.',
    startingPrice: null,
    timeline: null,
    related: ['erp', 'ecommerce', 'automation'],
  },
  {
    slug: 'erp',
    name: 'ERP',
    page: 'erp',
    image: '/showcase/erp.webp',
    description: 'Finance, operations and reporting joined up across teams.',
    startingPrice: null,
    timeline: null,
    related: ['inventory', 'crm', 'custom-software'],
  },
  {
    slug: 'mobile',
    name: 'Mobile',
    page: 'mobile-app-development',
    image: '/showcase/mobile-apps.webp',
    description: 'iOS and Android apps that share an API with your web product.',
    startingPrice: null,
    timeline: null,
    related: ['saas', 'custom-software', 'hosting'],
  },
  {
    slug: 'custom-software',
    name: 'Custom Software',
    page: 'software-development',
    image: '/showcase/api.webp',
    description: 'Internal tools and APIs where off-the-shelf software falls short.',
    startingPrice: null,
    timeline: null,
    related: ['automation', 'erp', 'ai'],
  },
];

export const supportServices: Record<string, { name: string; description: string; href: string }> = {
  seo: { name: 'SEO', description: 'Technical SEO, schema and content structure.', href: '/services' },
  hosting: { name: 'Hosting', description: 'Managed deployment, backups and monitoring.', href: '/services' },
  maintenance: { name: 'Maintenance', description: 'Updates, fixes and security patches.', href: '/services' },
};

export function relatedServices(slugs: string[]) {
  return slugs
    .map((slug) => {
      const service = services.find((item) => item.slug === slug);
      if (service) return { name: service.name, description: service.description, href: `/pricing#service-${slug}` };
      return supportServices[slug] || null;
    })
    .filter((item): item is { name: string; description: string; href: string } => Boolean(item));
}

export function relatedForLabels(labels: string[]) {
  const matched = labels
    .map((label) => services.find((item) => item.name.toLowerCase() === label.trim().toLowerCase()))
    .filter((item): item is Service => Boolean(item));
  const slugs = Array.from(new Set(matched.flatMap((item) => item.related)));
  return relatedServices(slugs.length ? slugs : ['website', 'crm', 'automation']).slice(0, 3);
}

export const processSteps = [
  { title: 'Discovery', copy: 'We learn the goal, the users and what already exists.' },
  { title: 'Planning', copy: 'Scope, risks and the first release are written down.' },
  { title: 'Proposal', copy: 'You receive a fixed scope, milestones and a figure.' },
  { title: 'Development', copy: 'Work ships in reviewed increments you can try.' },
  { title: 'Testing', copy: 'Automated checks, accessibility and acceptance testing.' },
  { title: 'Launch', copy: 'Production release with monitoring and rollback.' },
  { title: 'Support', copy: 'A support window, then an optional retainer.' },
];

export const pricingFaqs = [
  {
    q: 'Why are there no fixed prices on the plans?',
    a: 'Service work depends on your systems, data and approvals, so each figure is written into a proposal after discovery. Published plan prices are To Be Confirmed.',
  },
  {
    q: 'What does Discover include?',
    a: 'An outcome workshop, a review of your current tools and data, and a written roadmap with an estimate for the first release.',
  },
  {
    q: 'Can Discover be credited against a build?',
    a: 'Crediting policy: To Be Confirmed. Ask during your discovery call and any agreement will be written into the proposal.',
  },
  {
    q: 'How are build payments structured?',
    a: 'Builds are split into milestones. Each milestone has deliverables you can review before the next payment is due.',
  },
  {
    q: 'What happens if the scope changes mid-project?',
    a: 'Changes are captured as a written change request with the effect on cost and timeline before any extra work starts.',
  },
  {
    q: 'Do you work with small businesses?',
    a: 'Yes. A narrow first release is often the right starting point for smaller teams and keeps the investment proportionate.',
  },
  {
    q: 'Do you work with enterprises?',
    a: 'Yes. The Enterprise plan is designed for security questionnaires, procurement paperwork and a named delivery lead. SLA levels are To Be Confirmed.',
  },
  {
    q: 'Are prices shown including VAT?',
    a: 'Marketplace prices follow the UK VAT treatment configured at checkout. Service proposals state whether VAT applies to your organisation.',
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'Marketplace purchases are paid by card through Stripe Checkout in GBP. Payment methods for service invoices: To Be Confirmed.',
  },
  {
    q: 'Who owns the code and content?',
    a: 'Ownership is set out in each proposal; licensed products follow their licence. Standard IP assignment terms: To Be Confirmed.',
  },
  {
    q: 'Do you provide hosting?',
    a: 'Hosting can be set up in your own cloud account so you keep access to your data. A managed hosting offer and its pricing are To Be Confirmed.',
  },
  {
    q: 'What support is included after launch?',
    a: 'Each proposal states the launch support window; its standard length is To Be Confirmed. Longer support runs under the Evolve retainer.',
  },
  {
    q: 'Can you take over an existing project?',
    a: 'Yes, after a short technical review of the codebase, hosting and documentation so the risks are clear up front.',
  },
  {
    q: 'How do AI and RAG projects handle our data?',
    a: 'Data handling, retention and model providers are agreed in writing. Sensitive workflows keep a human approval step.',
  },
  {
    q: 'Do you sign NDAs?',
    a: 'Please do not share confidential material before an NDA is in place. The standard NEVIE-GLOBAL NDA is To Be Confirmed; you can attach your own to a quote request.',
  },
  {
    q: 'How quickly will I get a response to a quote request?',
    a: 'Quote requests are stored immediately and reviewed by the team. You receive an email confirmation as soon as it is submitted.',
  },
  {
    q: 'Can I buy a marketplace product and have it customised?',
    a: 'Yes. Buy the product from the marketplace and request a quote for the customisation you need.',
  },
  {
    q: 'What is your refund policy?',
    a: 'Marketplace refunds follow the published refunds and returns policies (14 days for unused physical goods). Service refund terms follow the proposal.',
  },
  {
    q: 'Do you offer training for our team?',
    a: 'Handover training is part of every build. The NEVIE Academy also publishes introductory courses. Additional training packages: To Be Confirmed.',
  },
  {
    q: 'Where is the team based?',
    a: 'This is the NEVIE-GLOBAL UK commercial platform, serving UK clients in English with GBP pricing. Registered office and on-site availability: To Be Confirmed.',
  },
  {
    q: 'Do you meet accessibility and GDPR requirements?',
    a: 'Accessibility and UK GDPR are considered from the first workshop. The contractual accessibility level (for example WCAG 2.2 AA) is To Be Confirmed per project.',
  },
  {
    q: 'How do I get started?',
    a: 'Send a quote request or book a discovery call. We will confirm what we need from you and propose a first step.',
  },
];

export type RoadmapItem = {
  name: string;
  copy: string;
  image: string;
  status: 'live' | 'roadmap';
  href?: string;
  note?: string;
};

const scopeTbc = `Scope, pricing and release date: ${TBC}.`;

export const roadmap: RoadmapItem[] = [
  {
    name: 'NEVIE Marketplace',
    copy: 'Founder access and connected jewellery, paid securely through Stripe Checkout in GBP.',
    image: '/products/bracelet-weave.webp',
    status: 'live',
    href: '/marketplace',
  },
  {
    name: 'NEVIE Academy',
    copy: 'Self-paced courses on practical AI and automation, lesson by lesson.',
    image: '/showcase/academy.webp',
    status: 'live',
    href: '/academy',
  },
  {
    name: 'Knowledge Agent',
    copy: 'Answers grounded in your own documents (retrieval-augmented generation), with sources shown.',
    image: '/categories/knowledge-agent.webp',
    status: 'roadmap',
    note: scopeTbc,
  },
  {
    name: 'Workflow Studio',
    copy: 'Business automations that connect everyday tools, with human approval where it matters.',
    image: '/categories/workflow-studio.webp',
    status: 'roadmap',
    note: scopeTbc,
  },
  {
    name: 'Customer Hub',
    copy: 'A single customer record and pipeline for UK SMEs, linked to orders and support.',
    image: '/categories/customer-hub.webp',
    status: 'roadmap',
    note: scopeTbc,
  },
  {
    name: 'NEVIE SaaS Starter',
    copy: 'Accounts, roles, billing and admin as a foundation for new software products.',
    image: '/showcase/saas.webp',
    status: 'roadmap',
    note: scopeTbc,
  },
  {
    name: 'NEVIE Mobile',
    copy: 'Companion apps for the NEVIE account and connected jewellery.',
    image: '/showcase/mobile-apps.webp',
    status: 'roadmap',
    note: `Platforms, features and release date: ${TBC}.`,
  },
  {
    name: 'Avatar Factory',
    copy: 'Product in the NEVIE-GLOBAL ecosystem.',
    image: '/showcase/ai-agents.webp',
    status: 'roadmap',
    note: `Product description: ${TBC}.`,
  },
  {
    name: 'NCV',
    copy: 'Product in the NEVIE-GLOBAL ecosystem.',
    image: '/showcase/erp.webp',
    status: 'roadmap',
    note: `Product description: ${TBC}.`,
  },
];

export const quoteOptions = {
  businessSize: ['Just me', '2–10', '11–50', '51–250', '251–1,000', '1,000+'],
  budget: ['Under £5k', '£5k–£15k', '£15k–£50k', '£50k–£150k', '£150k+', 'Not sure yet'],
  timeline: ['As soon as possible', '1–3 months', '3–6 months', '6+ months', 'Flexible'],
  contact: ['Email', 'Phone', 'Video call', 'WhatsApp'],
  meeting: ['Morning (9–12)', 'Afternoon (12–5)', 'Evening (5–7)', 'Any time'],
};

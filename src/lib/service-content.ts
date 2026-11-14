import { TBC } from './editorial';

export type ServiceFaq = { q: string; a: string };

export type ServiceContent = {
  slug: string;
  name: string;
  eyebrow: string;
  headline: string;
  accent: string;
  intro: string;
  image: string;
  outcomes: { title: string; copy: string }[];
  features: string[];
  deliverables: string[];
  useCases: string[];
  faqs: ServiceFaq[];
  related: string[];
  universe?: { name: string; copy: string; href?: string; status: 'live' | 'roadmap' };
  course?: { title: string; href: string };
  keywords: string[];
};

export const serviceCommercials = {
  startingPrice: TBC,
  timeline: TBC,
  engagement: 'Discover → Build → Evolve',
  note: 'Figures are written into a proposal after discovery. Published starting prices and typical timelines are To Be Confirmed.',
};

const commonFaqs = (name: string): ServiceFaq[] => [
  {
    q: `How much does ${name} work cost?`,
    a: `Published starting prices are ${TBC}. Every engagement begins with discovery, and the fee for the first release is written into a proposal before any build work starts.`,
  },
  {
    q: 'How long does a typical project take?',
    a: `Typical timelines are ${TBC}. The proposal sets milestones for your scope, and each milestone has deliverables you review before the next one begins.`,
  },
];

const knowledgeAgent = {
  name: 'Knowledge Agent',
  copy: 'The NEVIE product universe for answers grounded in your own documents.',
  status: 'roadmap' as const,
};
const workflowStudio = {
  name: 'Workflow Studio',
  copy: 'The NEVIE product universe for business automation with human approval.',
  status: 'roadmap' as const,
};
const customerHub = {
  name: 'Customer Hub',
  copy: 'The NEVIE product universe for customer records, pipeline and service.',
  status: 'roadmap' as const,
};
const practicalAi = { title: 'Practical AI for business', href: '/academy/practical-ai' };
const automationCourse = { title: 'Automation foundations', href: '/academy/automation-foundations' };

export const serviceContent: Record<string, ServiceContent> = {
  ai: {
    slug: 'ai',
    name: 'Artificial Intelligence',
    eyebrow: 'AI services',
    headline: 'Practical AI,',
    accent: 'built around your business.',
    intro:
      'We help UK organisations find the tasks where AI is genuinely useful, then design, build and evaluate a governed first release with human review in the loop.',
    image: '/showcase/ai-agents.webp',
    outcomes: [
      { title: 'A clear use case', copy: 'One recurring task with a measurable input, output and owner — not a vague assistant.' },
      { title: 'Governed data', copy: 'Sources, permissions and retention agreed in writing before any model is connected.' },
      { title: 'Measured results', copy: 'A baseline and evaluation set so you can decide to improve, expand or stop.' },
    ],
    features: [
      'Opportunity mapping workshop',
      'Model and provider selection',
      'Prompt and retrieval design',
      'Evaluation sets and quality thresholds',
      'Human approval and escalation steps',
      'Usage, cost and quality monitoring',
    ],
    deliverables: ['Use-case brief and success measures', 'Data and risk assessment', 'Working pilot', 'Evaluation report', 'Handover documentation'],
    useCases: ['Drafting and summarising documents', 'Routing enquiries to the right team', 'Extracting data from forms', 'Internal knowledge search'],
    faqs: [
      {
        q: 'Will our data be used to train public models?',
        a: 'Providers and settings are chosen so your data is not used for training where that option exists, and the choice is recorded in the data assessment.',
      },
      {
        q: 'Do we need a large dataset to start?',
        a: 'No. Most first releases use documents and records you already have. Discovery confirms what is available and what quality checks it needs.',
      },
    ],
    related: ['ai-agents', 'private-llm', 'automation'],
    universe: knowledgeAgent,
    course: practicalAi,
    keywords: ['AI consultancy UK', 'business AI', 'AI pilot', 'responsible AI', 'generative AI UK'],
  },
  'ai-agents': {
    slug: 'ai-agents',
    name: 'AI Agents',
    eyebrow: 'AI agents',
    headline: 'Digital teammates',
    accent: 'with human oversight.',
    intro:
      'Agents that connect your knowledge and tools to complete multi-step work — drafting, checking and handing off — while a person approves the actions that matter.',
    image: '/categories/workflow-studio.webp',
    outcomes: [
      { title: 'Less manual hand-off', copy: 'Routine steps between systems are completed by the agent and logged.' },
      { title: 'Controlled actions', copy: 'Every tool the agent can use has explicit permissions and limits.' },
      { title: 'Traceable decisions', copy: 'Inputs, sources and actions are recorded for review and audit.' },
    ],
    features: [
      'Tool and API connections',
      'Role-based permissions per action',
      'Approval queues for sensitive steps',
      'Conversation and action logs',
      'Fallback to a person on low confidence',
      'Evaluation against real task examples',
    ],
    deliverables: ['Agent design and task map', 'Permission model', 'Working agent in a staging environment', 'Evaluation results', 'Runbook for operators'],
    useCases: ['Customer enquiry triage', 'Order and booking follow-ups', 'Report preparation', 'Internal IT and HR requests'],
    faqs: [
      {
        q: 'Can an agent act without approval?',
        a: 'Only for actions you agree are low-risk and reversible. Anything else goes to an approval queue.',
      },
      {
        q: 'Which systems can an agent connect to?',
        a: 'Systems with a documented API or export. Integration requirements are confirmed during discovery.',
      },
    ],
    related: ['ai', 'automation', 'voice-ai'],
    universe: workflowStudio,
    course: practicalAi,
    keywords: ['AI agents UK', 'agentic AI', 'AI automation', 'autonomous agents business'],
  },
  'voice-ai': {
    slug: 'voice-ai',
    name: 'Voice AI',
    eyebrow: 'Voice AI',
    headline: 'Natural conversations',
    accent: 'for service and scheduling.',
    intro:
      'Voice assistants that answer common questions, take bookings and pass calls to your team with the context already captured.',
    image: '/showcase/customer-hub.webp',
    outcomes: [
      { title: 'Calls answered', copy: 'Routine questions and bookings are handled outside office hours.' },
      { title: 'Warm hand-offs', copy: 'Callers reach a person with a summary instead of starting again.' },
      { title: 'Clear consent', copy: 'Recording and data-handling notices agreed before launch.' },
    ],
    features: [
      'Speech recognition and natural voices',
      'Booking and calendar integration',
      'Call summaries into your CRM',
      'Escalation to a person',
      'Call recording controls and notices',
      'Script and response review tools',
    ],
    deliverables: ['Call-flow design', 'Voice and script guidelines', 'Integrated voice pilot', 'Test call report', 'Operator guide'],
    useCases: ['Appointment booking', 'Order status enquiries', 'Out-of-hours reception', 'Lead qualification'],
    faqs: [
      {
        q: 'Which telephony providers are supported?',
        a: `The supported telephony providers are ${TBC}; compatibility with your current setup is checked during discovery.`,
      },
      {
        q: 'Which languages are available?',
        a: `English (UK) is the starting point. Availability of further languages, including French, is ${TBC}.`,
      },
    ],
    related: ['ai-agents', 'crm', 'ai'],
    universe: customerHub,
    keywords: ['voice AI UK', 'AI receptionist', 'voice assistant business', 'conversational AI'],
  },
  'private-llm': {
    slug: 'private-llm',
    name: 'Private LLM',
    eyebrow: 'Private language models',
    headline: 'Your knowledge,',
    accent: 'kept in your environment.',
    intro:
      'Governed language models and retrieval (RAG) deployed where your data already lives, so teams get cited answers from approved documents only.',
    image: '/categories/knowledge-agent.webp',
    outcomes: [
      { title: 'Cited answers', copy: 'Responses link back to the approved source documents.' },
      { title: 'Access respected', copy: 'Users only retrieve content they are already permitted to see.' },
      { title: 'Data stays put', copy: 'Hosting options keep processing inside the environment you choose.' },
    ],
    features: [
      'Document ingestion and chunking',
      'Retrieval-augmented generation (RAG)',
      'Source citations in every answer',
      'Permission-aware search',
      'Hosting in your cloud or on-premises',
      'Answer quality evaluation',
    ],
    deliverables: ['Knowledge source inventory', 'Architecture and hosting decision', 'Working knowledge assistant', 'Evaluation report', 'Operations and content guide'],
    useCases: ['Policy and procedure search', 'Technical documentation assistant', 'Sales and bid knowledge', 'Customer support knowledge base'],
    faqs: [
      {
        q: 'Can it run fully on our own infrastructure?',
        a: 'That is one of the hosting options assessed in discovery, alongside private cloud deployments. The choice depends on your data and budget.',
      },
      {
        q: 'How do you stop it inventing answers?',
        a: 'Answers are grounded in retrieved sources, cite them, and say so when the sources do not contain an answer. Quality is measured on an agreed test set.',
      },
    ],
    related: ['ai', 'cloud', 'cyber-security'],
    universe: knowledgeAgent,
    course: practicalAi,
    keywords: ['private LLM UK', 'RAG development', 'enterprise knowledge assistant', 'secure AI'],
  },
  automation: {
    slug: 'automation',
    name: 'Automation',
    eyebrow: 'Business automation',
    headline: 'Remove repetitive work',
    accent: 'from everyday operations.',
    intro:
      'We map a workflow end to end, remove the steps that should not exist, then automate the rest with validation, retries and a clear owner for every failure.',
    image: '/categories/workflow-studio.webp',
    outcomes: [
      { title: 'Fewer manual steps', copy: 'Data moves between systems without re-keying.' },
      { title: 'Reliable runs', copy: 'Idempotent operations, bounded retries and alerts to the right person.' },
      { title: 'A baseline to beat', copy: 'Time and error rates measured before and after.' },
    ],
    features: [
      'Workflow mapping and simplification',
      'System-to-system integrations',
      'Validation and duplicate handling',
      'Human approval steps',
      'Failure alerts and recovery',
      'Run history and reporting',
    ],
    deliverables: ['Process map (current and future)', 'Data contracts between systems', 'Automated workflows', 'Monitoring and alerting', 'Owner runbook'],
    useCases: ['Order to invoice', 'Lead capture to CRM', 'Onboarding checklists', 'Scheduled reporting'],
    faqs: [
      {
        q: 'Which automation platform do you use?',
        a: 'The platform follows your systems and budget — from native integrations to custom services. It is recommended in the discovery roadmap.',
      },
      {
        q: 'What happens when an automation fails?',
        a: 'It retries within set limits, then alerts the named owner with enough context to recover. A manual fallback is documented.',
      },
    ],
    related: ['ai-agents', 'crm', 'api-development'],
    universe: workflowStudio,
    course: automationCourse,
    keywords: ['business automation UK', 'workflow automation', 'process automation', 'systems integration'],
  },
  crm: {
    slug: 'crm',
    name: 'CRM',
    eyebrow: 'Customer relationship management',
    headline: 'One clear view',
    accent: 'of every customer.',
    intro:
      'Pipelines, contacts, service and reporting shaped around how your team actually sells — configured on a proven platform or built where you need something specific.',
    image: '/showcase/crm.webp',
    outcomes: [
      { title: 'A single record', copy: 'Contacts, deals, orders and conversations in one place.' },
      { title: 'A pipeline you trust', copy: 'Stages and required fields that match your real sales process.' },
      { title: 'Reporting that helps', copy: 'Dashboards built on the questions leadership actually asks.' },
    ],
    features: [
      'Pipeline and stage design',
      'Contact and company records',
      'Web form and lead capture',
      'Email and task automation',
      'Role-based access',
      'Dashboards and exports',
    ],
    deliverables: ['Sales process map', 'CRM configuration or build', 'Data migration plan and import', 'Team training', 'Operations documentation'],
    useCases: ['Sales pipeline for SMEs', 'Service and account management', 'Partner and supplier tracking', 'Quote and proposal tracking'],
    faqs: [
      {
        q: 'Can you migrate our existing contacts?',
        a: 'Yes — data is cleaned, de-duplicated and mapped before import, with a test migration first.',
      },
      {
        q: 'Do you build custom CRMs or configure existing ones?',
        a: 'Both. Discovery compares configuring an established platform with building a focused custom record, and recommends one.',
      },
    ],
    related: ['automation', 'erp', 'voice-ai'],
    universe: customerHub,
    keywords: ['CRM development UK', 'CRM implementation', 'sales pipeline', 'custom CRM'],
  },
  erp: {
    slug: 'erp',
    name: 'ERP',
    eyebrow: 'Enterprise resource planning',
    headline: 'Connected operations',
    accent: 'across finance and delivery.',
    intro:
      'We join finance, inventory, purchasing and delivery so each team works from the same numbers — integrating what you have before replacing anything.',
    image: '/showcase/erp.webp',
    outcomes: [
      { title: 'One version of the numbers', copy: 'Stock, orders and finance reconcile automatically.' },
      { title: 'Visible operations', copy: 'Live status of purchasing, fulfilment and invoicing.' },
      { title: 'Phased change', copy: 'Modules introduced in stages to limit disruption.' },
    ],
    features: [
      'Inventory and multi-location stock',
      'Purchasing and supplier records',
      'Order and fulfilment tracking',
      'Accounting integration',
      'Operational dashboards',
      'Audit trails and permissions',
    ],
    deliverables: ['Operations and data audit', 'Target architecture', 'Integrated modules', 'Migration and cut-over plan', 'Training and documentation'],
    useCases: ['Stock across shop and warehouse', 'Purchase-to-pay', 'Job and project costing', 'Multi-channel order management'],
    faqs: [
      {
        q: 'Do we have to replace our accounting software?',
        a: 'Not usually. Integrating your existing accounting package is assessed first.',
      },
      {
        q: 'How do you avoid a risky big-bang launch?',
        a: 'Modules go live in phases with parallel running where needed, and a rollback plan for each cut-over.',
      },
    ],
    related: ['crm', 'automation', 'cloud'],
    keywords: ['ERP development UK', 'inventory management system', 'operations software', 'ERP integration'],
  },
  saas: {
    slug: 'saas',
    name: 'SaaS',
    eyebrow: 'SaaS product development',
    headline: 'A focused product',
    accent: 'on a foundation built to grow.',
    intro:
      'From first release to paying customers: accounts, roles, billing and an admin console, built so you can add features without rebuilding the base.',
    image: '/showcase/saas.webp',
    outcomes: [
      { title: 'A launchable first release', copy: 'The smallest product that proves value to paying users.' },
      { title: 'Billing that works', copy: 'Subscriptions, invoices and VAT handled through Stripe.' },
      { title: 'Room to scale', copy: 'Tenancy, roles and observability designed in from day one.' },
    ],
    features: [
      'Authentication and team accounts',
      'Role-based access control',
      'Subscription billing with Stripe',
      'Operations and support console',
      'Transactional email',
      'Analytics and audit logs',
    ],
    deliverables: ['Product scope and first-release plan', 'UX and interface design', 'Production application', 'Infrastructure and CI/CD', 'Technical documentation'],
    useCases: ['B2B workflow tools', 'Client portals', 'Booking and scheduling products', 'Vertical software for a niche'],
    faqs: [
      {
        q: 'Who owns the code?',
        a: `Ownership is set out in the proposal. Standard IP assignment terms are ${TBC}.`,
      },
      {
        q: 'Which stack do you use?',
        a: 'Typically TypeScript, Next.js and PostgreSQL — the same stack this platform runs on — unless your team needs something else.',
      },
    ],
    related: ['web-development', 'cloud', 'api-development'],
    keywords: ['SaaS development UK', 'MVP development', 'software product', 'Next.js development'],
  },
  'api-development': {
    slug: 'api-development',
    name: 'API Development',
    eyebrow: 'APIs and integrations',
    headline: 'Reliable integrations',
    accent: 'with explicit contracts.',
    intro:
      'Documented, versioned APIs and integrations that behave predictably under load and tell you clearly when something goes wrong.',
    image: '/showcase/api.webp',
    outcomes: [
      { title: 'Clear contracts', copy: 'Schemas and error formats agreed before implementation.' },
      { title: 'Safe change', copy: 'Versioning and deprecation paths for consumers.' },
      { title: 'Observable behaviour', copy: 'Logs, metrics and alerts on every endpoint.' },
    ],
    features: [
      'REST and webhook design',
      'OpenAPI documentation',
      'Authentication and rate limiting',
      'Input validation',
      'Idempotency for critical operations',
      'Monitoring and alerting',
    ],
    deliverables: ['API specification', 'Implemented and tested endpoints', 'Developer documentation', 'Security review checklist', 'Monitoring dashboards'],
    useCases: ['Partner and supplier integrations', 'Mobile app back ends', 'Payment and order webhooks', 'Data exchange between legacy systems'],
    faqs: [
      {
        q: 'Can you integrate with a system that has no API?',
        a: 'Often, through exports, secure file transfer or a small adapter service. Discovery confirms the safest option.',
      },
      {
        q: 'Do you document the APIs you build?',
        a: 'Yes. Every API ships with a specification and developer guide.',
      },
    ],
    related: ['software-development', 'automation', 'cyber-security'],
    keywords: ['API development UK', 'systems integration', 'REST API', 'webhooks'],
  },
  'software-development': {
    slug: 'software-development',
    name: 'Custom Software',
    eyebrow: 'Custom software development',
    headline: 'Software shaped',
    accent: 'around your operations.',
    intro:
      'Internal tools and business applications for the places where off-the-shelf software falls short — designed with the people who will use them every day.',
    image: '/categories/business-tools.webp',
    outcomes: [
      { title: 'Fits the work', copy: 'Screens and rules follow your real process, not a generic template.' },
      { title: 'Maintainable', copy: 'Tested code, documentation and a clean handover.' },
      { title: 'Yours to run', copy: 'Hosted in an account you control, with access for your team.' },
    ],
    features: [
      'User research and workflow mapping',
      'Interface design and prototypes',
      'Web application development',
      'Automated testing',
      'Accessible, responsive UI',
      'Deployment and monitoring',
    ],
    deliverables: ['Requirements and scope', 'Designs and prototype', 'Production software', 'Test suite', 'Handover documentation'],
    useCases: ['Operations dashboards', 'Quoting and estimating tools', 'Field service apps', 'Approval workflows'],
    faqs: [
      {
        q: 'Can you take over software someone else built?',
        a: 'Yes, after a short technical review of the codebase, hosting and documentation so the risks are clear up front.',
      },
      {
        q: 'How do we see progress?',
        a: 'Work ships in reviewed increments to a staging environment you can try at each milestone.',
      },
    ],
    related: ['web-development', 'api-development', 'consulting'],
    keywords: ['custom software development UK', 'bespoke software', 'internal tools', 'business applications'],
  },
  'mobile-app-development': {
    slug: 'mobile-app-development',
    name: 'Mobile Apps',
    eyebrow: 'Mobile app development',
    headline: 'Thoughtful mobile experiences',
    accent: 'for customers and field teams.',
    intro:
      'iOS and Android apps that share a secure API with your web product, designed for real conditions — one hand, poor signal and busy days.',
    image: '/showcase/mobile-apps.webp',
    outcomes: [
      { title: 'One codebase where sensible', copy: 'Cross-platform delivery when it does not compromise the experience.' },
      { title: 'Works offline', copy: 'Key tasks keep working with poor connectivity where required.' },
      { title: 'Store ready', copy: 'Submission, review guidance and release management.' },
    ],
    features: [
      'iOS and Android delivery',
      'Shared API with web',
      'Push notifications',
      'Offline-first data where needed',
      'Accessibility on mobile',
      'App store submission',
    ],
    deliverables: ['Mobile UX design', 'App builds for testing', 'Store listings and submission', 'Crash and usage monitoring', 'Release process'],
    useCases: ['Customer account apps', 'Field inspection and job apps', 'Loyalty and membership', 'Companion apps for connected products'],
    faqs: [
      {
        q: 'Native or cross-platform?',
        a: 'Recommended in discovery based on the features you need, device access and your team’s ability to maintain it.',
      },
      {
        q: 'Is there a NEVIE mobile app?',
        a: `A NEVIE companion app is on the roadmap. Platforms, features and release date are ${TBC}.`,
      },
    ],
    related: ['web-development', 'api-development', 'saas'],
    keywords: ['mobile app development UK', 'iOS app', 'Android app', 'cross-platform app'],
  },
  'web-development': {
    slug: 'web-development',
    name: 'Web Apps',
    eyebrow: 'Web development',
    headline: 'Fast, accessible experiences',
    accent: 'that earn confidence.',
    intro:
      'Marketing sites, e-commerce and web applications with a CMS your team can run, strong technical SEO and performance budgets from the first sprint.',
    image: '/showcase/web-development.webp',
    outcomes: [
      { title: 'Fast by default', copy: 'Performance budgets and image optimisation built in.' },
      { title: 'Found in search', copy: 'Technical SEO, structured data and clean metadata.' },
      { title: 'Easy to update', copy: 'A CMS and admin your team can use without developers.' },
    ],
    features: [
      'Responsive design system',
      'CMS and content workflows',
      'Technical SEO and schema',
      'E-commerce with Stripe and UK VAT',
      'Accessible components',
      'Analytics and consent',
    ],
    deliverables: ['Sitemap and content plan', 'Design system and pages', 'CMS set-up', 'SEO and performance report', 'Launch and handover'],
    useCases: ['Company and brand sites', 'Online shops', 'Client portals', 'Product and booking sites'],
    faqs: [
      {
        q: 'Can we edit the site ourselves?',
        a: 'Yes. Content is managed through a CMS or admin panel, with training at handover.',
      },
      {
        q: 'Do you handle hosting?',
        a: `Hosting can be set up in your own account. A managed hosting offer is ${TBC}.`,
      },
    ],
    related: ['saas', 'cloud', 'software-development'],
    keywords: ['web development UK', 'Next.js agency', 'e-commerce development', 'website design UK'],
  },
  cloud: {
    slug: 'cloud',
    name: 'Cloud',
    eyebrow: 'Cloud infrastructure',
    headline: 'Resilient infrastructure',
    accent: 'with clear ownership.',
    intro:
      'Cloud environments that are reproducible, monitored and costed — with backups you have actually tested and access you can audit.',
    image: '/showcase/cloud.webp',
    outcomes: [
      { title: 'Reproducible', copy: 'Infrastructure defined as code and version-controlled.' },
      { title: 'Recoverable', copy: 'Backups and restore procedures tested, not assumed.' },
      { title: 'Cost visible', copy: 'Budgets, tagging and alerts on spend.' },
    ],
    features: [
      'Infrastructure as code',
      'CI/CD pipelines',
      'Containers and managed databases',
      'Backups and disaster recovery',
      'Monitoring and alerting',
      'Cost reporting',
    ],
    deliverables: ['Infrastructure review', 'Target architecture', 'Provisioned environments', 'Recovery runbook', 'Cost and access report'],
    useCases: ['Migration from a single server', 'Staging and production environments', 'Database hardening', 'Deployment automation'],
    faqs: [
      {
        q: 'Which cloud providers do you work with?',
        a: 'The provider follows your existing contracts and requirements; it is confirmed in discovery.',
      },
      {
        q: 'Can you run our infrastructure for us?',
        a: `Ongoing operations can be covered by the Evolve retainer. A separate managed hosting offer is ${TBC}.`,
      },
    ],
    related: ['cyber-security', 'saas', 'private-llm'],
    keywords: ['cloud consultancy UK', 'DevOps', 'infrastructure as code', 'cloud migration'],
  },
  'cyber-security': {
    slug: 'cyber-security',
    name: 'Cyber Security',
    eyebrow: 'Security by design',
    headline: 'Security considered',
    accent: 'from architecture to operations.',
    intro:
      'Practical security for the software we build and the systems it touches: threat modelling, secure defaults, dependency hygiene and incident readiness.',
    image: '/showcase/cyber-security.webp',
    outcomes: [
      { title: 'Known risks', copy: 'Threats and mitigations written down and owned.' },
      { title: 'Secure defaults', copy: 'Authentication, secrets and headers configured properly.' },
      { title: 'Ready to respond', copy: 'Logging and an incident plan before you need one.' },
    ],
    features: [
      'Threat modelling',
      'Secure authentication and sessions',
      'Secrets and key management',
      'Dependency and vulnerability scanning',
      'Security headers and rate limiting',
      'Incident response planning',
    ],
    deliverables: ['Threat model', 'Security review findings', 'Remediation plan', 'Hardened configuration', 'Incident runbook'],
    useCases: ['Pre-launch security review', 'Supplier security questionnaires', 'Hardening an existing app', 'UK GDPR data-flow mapping'],
    faqs: [
      {
        q: 'Do you provide penetration testing?',
        a: `Independent penetration testing arrangements are ${TBC}. We prepare the scope and fix the findings.`,
      },
      {
        q: 'Do you hold security certifications?',
        a: `Company certifications (for example Cyber Essentials) are ${TBC}.`,
      },
    ],
    related: ['cloud', 'api-development', 'private-llm'],
    keywords: ['cyber security UK', 'secure software development', 'security review', 'UK GDPR'],
  },
  consulting: {
    slug: 'consulting',
    name: 'Consulting',
    eyebrow: 'Technology consulting',
    headline: 'A clear technical direction',
    accent: 'before your next investment.',
    intro:
      'Independent advice on what to build, buy or leave alone — grounded in your goals, your systems and a realistic view of cost and risk.',
    image: '/categories/business-tools.webp',
    outcomes: [
      { title: 'A decision you can defend', copy: 'Options compared on cost, risk and time to value.' },
      { title: 'A practical roadmap', copy: 'Phased steps with owners and success measures.' },
      { title: 'Lower risk', copy: 'Problems found on paper rather than in production.' },
    ],
    features: [
      'Stakeholder workshops',
      'Systems and data review',
      'Build-versus-buy analysis',
      'Architecture recommendations',
      'Supplier and tender support',
      'Roadmap and budget planning',
    ],
    deliverables: ['Current-state assessment', 'Options appraisal', 'Recommended architecture', 'Phased roadmap', 'Executive summary'],
    useCases: ['Digital transformation planning', 'AI readiness assessment', 'Replacing legacy systems', 'Technical due diligence'],
    faqs: [
      {
        q: 'Is consulting the same as the Discover plan?',
        a: 'Discover is the standard entry point; consulting can go further, for example supporting a tender or a board decision.',
      },
      {
        q: 'Are you tied to particular vendors?',
        a: `Recommendations are based on fit. Any formal partner relationships are ${TBC} and will be disclosed.`,
      },
    ],
    related: ['ai', 'software-development', 'erp'],
    keywords: ['technology consulting UK', 'digital transformation', 'IT strategy', 'AI readiness'],
  },
  blockchain: {
    slug: 'blockchain',
    name: 'Blockchain',
    eyebrow: 'Distributed ledgers',
    headline: 'Trust and traceability,',
    accent: 'where a ledger fits.',
    intro:
      'An honest assessment of whether a shared ledger solves your problem — and if it does, a governed design that respects privacy and integrates with your systems.',
    image: '/showcase/api.webp',
    outcomes: [
      { title: 'The right tool', copy: 'A clear answer on whether a ledger beats a conventional database.' },
      { title: 'Governance first', copy: 'Participants, permissions and data rules agreed up front.' },
      { title: 'Integrated', copy: 'Ledger events connected to your existing systems.' },
    ],
    features: [
      'Use-case suitability assessment',
      'Permissioned ledger design',
      'Smart contract review',
      'Privacy and UK GDPR analysis',
      'System integration',
      'Audit and traceability reporting',
    ],
    deliverables: ['Suitability assessment', 'Governance model', 'Proof of concept (if suitable)', 'Integration design', 'Recommendation report'],
    useCases: ['Supply-chain provenance', 'Certificates and credentials', 'Multi-party record keeping', 'Asset traceability'],
    faqs: [
      {
        q: 'Do you issue tokens or cryptocurrencies?',
        a: 'Token and cryptocurrency services are not offered through this website, and no investment offer is made here. The work covers traceability and record keeping.',
      },
      {
        q: 'Is blockchain used in NEVIE products?',
        a: `Any use of a ledger in NEVIE products is ${TBC}.`,
      },
    ],
    related: ['api-development', 'cyber-security', 'consulting'],
    keywords: ['blockchain consultancy UK', 'distributed ledger', 'traceability', 'smart contracts'],
  },
};

export function serviceFaqs(content: ServiceContent) {
  return [...content.faqs, ...commonFaqs(content.name)];
}

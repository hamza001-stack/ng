
/**
 * Types + starter data for the Academy (programmes, prices, start dates).
 * Live data comes from the AcademyProgramme / AcademySession tables
 * (Admin → Academy). These defaults are (a) inserted once by
 * prisma/academy-seed.ts and (b) used as a fallback if the DB is empty/unreachable.
 */

export const CURRENCY = 'GBP' as const;

export type AcademyCurrency = 'GBP' | 'EUR';
export type AcademyLocale = 'en' | 'fr';

export type ProgrammeTranslation = {
  title?: string;
  level?: string;
  price?: number;
  hours?: string;
  weeks?: string;
  promise?: string;
  blurb?: string;
  outcomes?: string[];
  syllabus?: { title: string; body: string }[];
  seoTitle?: string | null;
  seoDescription?: string | null;
};
export type AcademyTheme = 'ai' | 'code' | 'auto';

export const academyThemes: { id: AcademyTheme; label: string }[] = [
  { id: 'ai', label: 'AI (blue network)' },
  { id: 'code', label: 'Code (editor window)' },
  { id: 'auto', label: 'Automation (workflow)' },
];

export type ProgrammeSession = {
  id: string;
  /** ISO date, YYYY-MM-DD */
  startsOn: string;
  days: string;
  time: string;
  mode: string;
  seats: number;
  taken: number;
};

export type Programme = {
  id: string;
  cat: string;
  theme: AcademyTheme;
  title: string;
  level: string;
  price: number;
  intro: boolean;
  introCourseId: string | null;
  lessons: number;
  hours: string;
  weeks: string;
  promise: string;
  blurb: string;
  outcomes: string[];
  syllabus: { title: string; body: string }[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  sessions: ProgrammeSession[];
  currency?: AcademyCurrency;
};

const syl = (rows: [string, string][]) =>
  rows.map(([title, body]) => ({ title, body }));

export const defaultProgrammes: Programme[] = [
  {
    id: 'ai',
    cat: 'AI',
    theme: 'ai',
    title: 'Practical AI for business',
    level: 'Beginner',
    price: 249,
    intro: true,
    introCourseId: 'practical-ai',
    lessons: 8,
    hours: '12 hrs',
    weeks: '4 weeks',
    promise: 'Use AI at work with confidence and launch a first pilot.',
    blurb: 'Learn where AI saves time and money, write prompts that work, and plan a responsible first pilot.',
    outcomes: [
      'Spot where AI saves real time and money in your business',
      'Write prompts that give consistent, usable results',
      'Evaluate tools for cost, risk and data privacy',
      'Plan and present a responsible first AI pilot',
    ],
    syllabus: syl([
      ['Understanding AI', 'What modern AI can and cannot do, in plain language.'],
      ['Finding opportunities', 'Map your processes and rank them by value and effort.'],
      ['Prompting that works', 'Structure, context and examples for dependable output.'],
      ['Choosing tools', 'Compare options on quality, cost and privacy.'],
      ['Data and privacy', 'What to share, what to protect and how to stay compliant.'],
      ['Designing a pilot', 'Scope a small, measurable first project.'],
      ['Measuring results', 'Define success metrics and track the outcome.'],
      ['Capstone', 'Present your pilot plan for feedback.'],
    ]),
    sessions: [
      {
        id: 'ai-1',
        startsOn: '2027-01-12',
        days: 'Tue & Thu',
        time: '18:00–20:00 GMT',
        mode: 'Live online',
        seats: 20,
        taken: 14,
      },
      {
        id: 'ai-2',
        startsOn: '2027-02-09',
        days: 'Tue & Thu',
        time: '18:00–20:00 GMT',
        mode: 'Live online',
        seats: 20,
        taken: 6,
      },
      {
        id: 'ai-3',
        startsOn: '2027-03-13',
        days: 'Saturdays',
        time: '10:00–14:00 GMT',
        mode: 'Live online',
        seats: 20,
        taken: 20,
      },
    ],
  },
  {
    id: 'code',
    cat: 'Programming',
    theme: 'code',
    title: 'Full-stack web development',
    level: 'Intermediate',
    price: 399,
    intro: false,
    introCourseId: null,
    lessons: 12,
    hours: '36 hrs',
    weeks: '8 weeks',
    promise: 'Build and launch a real web app from scratch.',
    blurb: 'Build and deploy real web applications with HTML, CSS, JavaScript, Node.js and a database.',
    outcomes: [
      'Build responsive front-ends with modern HTML, CSS and JavaScript',
      'Create APIs and server logic with Node.js',
      'Store and query data in a database',
      'Deploy a finished project with Git and a live URL',
    ],
    syllabus: syl([
      ['Web foundations', 'HTML, CSS and how the browser works.'],
      ['Modern JavaScript', 'Functions, modules, async code and the DOM.'],
      ['Responsive layout', 'Flexbox, grid and mobile-first design.'],
      ['Working with Git', 'Branches, commits and collaboration on GitHub.'],
      ['Node.js basics', 'Servers, routing and middleware.'],
      ['Building an API', 'REST design, validation and error handling.'],
      ['Databases', 'Modelling data and writing queries.'],
      ['Authentication', 'Sign-in, sessions and securing your app.'],
      ['Front-end meets back-end', 'Connect the interface to your API.'],
      ['Testing and quality', 'Catch bugs before your users do.'],
      ['Deployment', 'Ship to a live environment.'],
      ['Capstone project', 'Build, present and review a full application.'],
    ]),
    sessions: [
      {
        id: 'code-1',
        startsOn: '2027-01-19',
        days: 'Mon, Wed & Fri',
        time: '19:00–21:00 GMT',
        mode: 'Live online',
        seats: 16,
        taken: 12,
      },
      {
        id: 'code-2',
        startsOn: '2027-03-16',
        days: 'Mon, Wed & Fri',
        time: '19:00–21:00 GMT',
        mode: 'Live online',
        seats: 16,
        taken: 3,
      },
    ],
  },
  {
    id: 'auto',
    cat: 'Automation',
    theme: 'auto',
    title: 'Automation foundations',
    level: 'Beginner',
    price: 199,
    intro: true,
    introCourseId: 'automation-foundations',
    lessons: 6,
    hours: '10 hrs',
    weeks: '3 weeks',
    promise: 'Automate repetitive work, no heavy coding needed.',
    blurb: 'Map a workflow, connect its steps and handle failures deliberately, with no-code and low-code tools.',
    outcomes: [
      'Map any repetitive workflow step by step',
      'Connect apps with no-code and low-code tools',
      'Handle errors, retries and edge cases',
      'Document and hand over an automation your team can run',
    ],
    syllabus: syl([
      ['Thinking in workflows', 'Triggers, actions and data flow.'],
      ['Mapping a process', 'Draw the current process before automating it.'],
      ['Connecting apps', 'Use webhooks and integrations.'],
      ['Handling failures', 'Alerts, retries and fallbacks.'],
      ['Testing safely', 'Run changes without risking live data.'],
      ['Handover', 'Document and maintain your automation.'],
    ]),
    sessions: [
      {
        id: 'auto-1',
        startsOn: '2027-01-26',
        days: 'Tue & Thu',
        time: '17:30–19:30 GMT',
        mode: 'Live online',
        seats: 25,
        taken: 9,
      },
      {
        id: 'auto-2',
        startsOn: '2027-02-23',
        days: 'Tue & Thu',
        time: '17:30–19:30 GMT',
        mode: 'Live online',
        seats: 25,
        taken: 23,
      },
    ],
  },
];

export const academyFaq: [string, string][] = [
  [
    'Who are these programmes for?',
    'Anyone ready to learn practical skills. AI and Automation need no technical background; Full-stack web development suits learners comfortable with basic computing.',
  ],
  [
    'Do I pay when I pre-register?',
    'No. Pre-registering is free and adds you to the waiting list for your chosen programme. We confirm your place and payment details before the start date.',
  ],
  [
    'Is there a free introduction?',
    'Yes. The AI and Automation programmes each include a free introductory lesson.',
  ],
  [
    'Will I get a certificate?',
    'Verified certificates will be available with eligible assessed programmes at launch.',
  ],
  [
    'Can I change to another start date?',
    'Yes. Tell us before the start date and we will move you if there is space.',
  ],
  [
    'How is my data used?',
    'Only to manage your registration and contact you about the programme. Your consent is recorded and you can withdraw it at any time.',
  ],
];

/* ───────── small shared helpers (safe in client + server) ───────── */

/**
 * Formats a whole-unit programme price.
 * Existing money(price) calls remain GBP by default.
 * French programme pages can call money(price, 'EUR').
 */
export const money = (
  amount: number,
  currency: AcademyCurrency = CURRENCY,
) =>
  new Intl.NumberFormat(
    currency === 'EUR' ? 'fr-FR' : 'en-GB',
    {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    },
  ).format(amount);

export const seatsLeft = (
  s: Pick<ProgrammeSession, 'seats' | 'taken'>,
) => Math.max(0, s.seats - s.taken);

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

export const nextSession = (p: Programme) =>
  p.sessions.find((s) => seatsLeft(s) > 0) ?? p.sessions[0];

/** Wording shown next to the consent box; exact text is stored with each pre-registration. */
export const CONSENT_TEXT =
  'I agree that NEVIE-GLOBAL UK may store my details and email me about this programme, start dates and my place on the waiting list. This is not a purchase and I can ask to be removed at any time.';

export const EXPERIENCE_LEVELS = [
  'Complete beginner',
  'Some experience',
  'Working with it already',
];

export const ENROLMENT_STATUSES = [
  'REQUESTED',
  'UNDER_REVIEW',
  'APPROVED',
  'WAITLISTED',
  'DECLINED',
  'ENROLLED',
  'CANCELLED',
] as const;

export type EnrolmentStatus = (typeof ENROLMENT_STATUSES)[number];

export const ENROLMENT_LABELS: Record<EnrolmentStatus, string> = {
  REQUESTED: 'Request received',
  UNDER_REVIEW: 'Under review',
  APPROVED: 'Approved',
  WAITLISTED: 'On the waiting list',
  DECLINED: 'Not accepted',
  ENROLLED: 'Enrolled',
  CANCELLED: 'Cancelled',
};

/** Statuses that occupy one seat in the chosen session. */
export const SEAT_HOLDING: EnrolmentStatus[] = ['APPROVED', 'ENROLLED'];

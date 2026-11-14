export const services = [
  [
    'ai',
    'Artificial Intelligence',
    'Turn your knowledge into a competitive advantage. Private, practical AI built around your business.',
  ],
  [
    'ai-agents',
    'AI Agents',
    'Purpose-built digital teammates that connect knowledge, tools and human oversight.',
  ],
  [
    'voice-ai',
    'Voice AI',
    'Natural conversations for service, scheduling and customer support.',
  ],
  [
    'private-llm',
    'Private LLM',
    'Keep your knowledge in your environment with governed language models.',
  ],
  [
    'automation',
    'Automation',
    'Connect your systems and remove repetitive work from everyday operations.',
  ],
  [
    'crm',
    'CRM',
    'Bring customer relationships, pipeline and service into one clear view.',
  ],
  [
    'erp',
    'ERP',
    'Connected operations across finance, inventory and delivery.',
  ],
  [
    'saas',
    'SaaS',
    'Build a focused software product with a foundation designed to grow.',
  ],
  [
    'api-development',
    'API Development',
    'Reliable integrations with explicit contracts and observable behaviour.',
  ],
  [
    'software-development',
    'Custom Software',
    'Software shaped around your operations, people and ambitions.',
  ],
  [
    'mobile-app-development',
    'Mobile Apps',
    'Thoughtful mobile experiences for customers and field teams.',
  ],
  [
    'web-development',
    'Web Apps',
    'Fast, accessible digital experiences that earn customer confidence.',
  ],
  [
    'cloud',
    'Cloud',
    'Resilient infrastructure with clear ownership and cost visibility.',
  ],
  [
    'cyber-security',
    'Cyber Security',
    'Security considered across architecture, implementation and operations.',
  ],
  [
    'consulting',
    'Consulting',
    'A clear technical direction before you make your next investment.',
  ],
] as const;
export const products = [
  { id: 'founder-card', name: 'Carte Fondateur', category: 'Founder access', price: 1, description: 'Priority access credentials for the NEVIE-GLOBAL technology ecosystem.', tag: 'SYSTEM ACCESS', features: ['Priority access activation', 'Global ecosystem credentials', 'Digital access product'] },
  { id: 'founder-box', name: 'Coffret Fondateur', category: 'Founder access', price: 189, compareAtPrice: 279, description: 'Complete physical and digital deployment set with architecture keys and system allocations.', tag: 'COMPLETE EXPERIENCE', features: ['Physical and digital set', 'Architecture keys', 'System allocations'] },
  { id: 'bague-aura', name: 'Bague Aura', category: 'Connected jewellery', price: 149, description: 'Elite alloy architecture with a mirror-polished finish and personal-space connection.', tag: 'PRE-ORDER', features: ['Elite alloy architecture', 'Mirror-polished finish', 'Presentation case included'] },
  { id: 'bague-signet', name: 'Bague Signet', category: 'Connected jewellery', price: 179, description: 'A precision satin-finished seal with a connection to the central register.', tag: 'PRE-ORDER', features: ['Solid seal architecture', 'Precision satin finish', 'Presentation case included'] },
  { id: 'bague-origin', name: 'Bague Origin', category: 'Connected jewellery', price: 229, description: 'A structured-core ring with anti-oxidation treatment and central-node connection.', tag: 'PRE-ORDER', features: ['Structured core architecture', 'Anti-oxidation treatment', 'Presentation case included'] },
  { id: 'bracelet-link', name: 'Bracelet Link', category: 'Connected jewellery', price: 129, description: 'An articulated linked bracelet with a secure systemic clasp.', tag: 'PRE-ORDER', features: ['Articulated linkage', 'High-clarity polished finish', 'Presentation case included'] },
  { id: 'bracelet-core', name: 'Bracelet Core', category: 'Connected jewellery', price: 169, description: 'Rigid-core link construction with a lustrous treatment and integrated clasp.', tag: 'PRE-ORDER', features: ['Rigid core structure', 'Lustrous treatment', 'Integrated invisible clasp'] },
  { id: 'bracelet-weave', name: 'Bracelet Weave', category: 'Connected jewellery', price: 229, description: 'A woven bracelet with shadow-and-light contrast and a double-security clasp.', tag: 'PRE-ORDER', features: ['Woven linkage', 'Contrast finish', 'Double-security clasp'] },
];
export const courses = [
  {
    id: 'practical-ai',
    title: 'Practical AI for business',
    category: 'AI',
    level: 'Beginner',
    duration: '35 min',
    description:
      'Learn to identify useful AI opportunities and design a responsible first pilot.',
    lessons: [
      {
        title: 'Find a useful problem',
        body: 'Start with a recurring task with a clear input and a measurable output. Map how it works today. Identify the time spent, common failure points and the people responsible for reviewing the result. Choose a narrow pilot before expanding to the whole organisation.',
      },
      {
        title: 'Understand your data',
        body: 'List the information the task needs. Identify its owner, sensitivity, retention rules and permitted uses. Keep personal or confidential information out of unapproved tools. Agree how source quality will be checked before connecting any model.',
      },
      {
        title: 'Design human oversight',
        body: 'Decide which actions need approval and which can be reversed. Make uncertainty visible. Give users a clear way to stop the workflow and escalate to a person. A useful pilot should reduce work without hiding responsibility.',
      },
      {
        title: 'Measure your pilot',
        body: 'Define a baseline and evaluate the same representative examples before and after your pilot. Track task quality, completion time and review effort. Record failures and decide whether to improve, expand or stop.',
      },
    ],
  },
  {
    id: 'automation-foundations',
    title: 'Automation foundations',
    category: 'Automation',
    level: 'Beginner',
    duration: '25 min',
    description:
      'Map a workflow, connect its steps and handle failures deliberately.',
    lessons: [
      {
        title: 'Map the workflow',
        body: 'Write down the trigger, inputs, decisions and outputs. Assign an owner to every step. Remove unnecessary steps before automating them.',
      },
      {
        title: 'Build reliable connections',
        body: 'Define the data contract between systems. Validate required fields and plan for duplicates. Use idempotency keys when an operation must only happen once.',
      },
      {
        title: 'Plan for failures',
        body: 'Set bounded retries, alert the responsible person and preserve enough context to recover. Test timeouts and invalid inputs before enabling the workflow.',
      },
    ],
  },
];
export const articles = [
  {
    id: 'building-with-private-ai',
    title: 'What to consider before building with private AI',
    category: 'AI & STRATEGY',
    description:
      'Data ownership, evaluation and human oversight belong in the first conversation.',
    body: 'A private AI project starts with the information it is permitted to use. Document ownership, access controls and retention requirements before selecting a model. Build an evaluation set from representative tasks, agree what acceptable quality means, and make escalation to a person part of the product. A smaller, well-defined use case is easier to evaluate than an assistant expected to answer every question.',
  },
  {
    id: 'automation-first-steps',
    title: 'Your first automation should be a small one',
    category: 'OPERATIONS',
    description:
      'Find a repeatable task, establish a baseline and measure what changes.',
    body: 'Choose a task with clear boundaries and an owner. Map the manual process and understand exceptions before adding integrations. Measure the time spent and the errors that occur today. A pilot should demonstrate an improvement against that baseline while retaining a practical manual fallback.',
  },
  {
    id: 'software-that-scales',
    title: 'Build for the next stage of your business',
    category: 'ENGINEERING',
    description: 'Clear boundaries and observable systems make change easier.',
    body: 'Scalability is not only about traffic. It includes the ability to change a workflow, onboard a team and diagnose a failure. Define domain boundaries, document service contracts and make system behaviour observable. Add complexity when there is evidence it solves a real constraint.',
  },
];
export const routeNames = [
  'About',
  'Services',
  'Solutions',
  'Industries',
  'AI',
  'AI Agents',
  'Automation',
  'Software Development',
  'Mobile App Development',
  'Web Development',
  'Cloud',
  'Blockchain',
  'Academy',
  'Marketplace',
  'Products',
  'Pricing',
  'Portfolio',
  'Case Studies',
  'Resources',
  'Documentation',
  'Blog',
  'Support',
  'FAQ',
  'Contact',
  'Partners',
  'Investors',
  'Cart',
  'Checkout',
  'Orders',
  'Dashboard',
  'My Account',
  'Downloads',
  'Certificates',
  'Privacy',
  'Cookies',
  'Terms',
  'Legal',
  'Wishlist',
  'Invoices',
  'Settings',
  'Subscriptions',
];
export const slugify = (value: string) =>
  value.toLowerCase().replaceAll(' ', '-');
export const routes = [
  ...new Set([...routeNames.map(slugify), ...services.map((s) => s[0])]),
];
export const privateRoutes = [
  'cart',
  'checkout',
  'orders',
  'dashboard',
  'my-account',
  'downloads',
  'certificates',
  'wishlist',
  'invoices',
  'settings',
  'subscriptions',
];
export const faqs = [
  [
    'What does NEVIE-GLOBAL UK focus on?',
    'The UK platform brings together commercial technology services, digital product discovery and practical learning.',
  ],
  [
    'Can you work with our existing systems?',
    'Integration requirements are assessed during discovery, including your current applications, data access and operational constraints.',
  ],
  [
    'Can I purchase products here today?',
    'Yes. Checkout uses Stripe. UK VAT is added at the configured rate. You receive an email when payment succeeds.',
  ],
  [
    'How do academy certificates work?',
    'Preview lessons save progress on this device. Verified certificates require an account, assessment and the connected learning service.',
  ],
];

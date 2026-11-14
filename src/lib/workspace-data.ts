export const gbp = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value);

export const previewUser = {
  name: 'Amira Khan',
  role: 'Operations Director',
  company: 'Northline Commerce Ltd',
  email: 'amira.khan@northline.example',
  location: 'Manchester, UK',
  plan: 'NEVIE Connected',
};

export const kpis = {
  user: [
    { label: 'Active projects', value: '4', hint: '2 in delivery' },
    { label: 'Open requests', value: '3', hint: '1 proposal ready' },
    { label: 'This month', value: gbp(4280), hint: 'Retainers + digital' },
    { label: 'Support SLA', value: '99%', hint: 'Within 4 hours' },
  ],
  admin: [
    { label: 'Revenue (30d)', value: gbp(186400), hint: '+12.4% vs prior' },
    { label: 'Orders', value: '248', hint: '61 digital · 39 services' },
    { label: 'Qualified leads', value: '94', hint: '32% conversion' },
    { label: 'Live projects', value: '27', hint: '8 at risk' },
  ],
};

export const activity = [
  { time: '12 min', title: 'Proposal sent', detail: 'Knowledge Agent discovery for Northline' },
  { time: '1 h', title: 'Milestone approved', detail: 'CRM Customer Hub — data model signed off' },
  { time: '3 h', title: 'Invoice paid', detail: 'INV-1048 · Monthly AI services' },
  { time: 'Yesterday', title: 'Course progress', detail: 'Practical AI for business · lesson 3' },
];

export const notifications = [
  { title: 'Discovery call confirmed', detail: 'Thursday 10:00 BST with delivery lead', tone: 'gold' as const },
  { title: 'File ready', detail: 'Architecture pack uploaded to Project Atlas', tone: 'blue' as const },
  { title: 'Payment received', detail: gbp(1890) + ' · subscription renews 21 Oct', tone: 'blue' as const },
];

export const savedServices = ['Knowledge Agent', 'Workflow Studio', 'Cyber Security', 'Cloud'];
export const savedProducts = ['Coffret Fondateur', 'Bague Aura', 'Carte Fondateur'];

export const orders = [
  { id: 'NV-2041', type: 'Physical', item: 'Bague Aura', status: 'In transit', amount: 890, updated: '21 Sep' },
  { id: 'NV-2038', type: 'Digital', item: 'Coffret Fondateur access', status: 'Delivered', amount: 189, updated: '18 Sep' },
  { id: 'NV-2033', type: 'Service', item: 'CRM discovery sprint', status: 'In progress', amount: 6400, updated: '16 Sep' },
  { id: 'NV-2029', type: 'Digital', item: 'Academy seat · AI for business', status: 'Active', amount: 240, updated: '12 Sep' },
];

export const projects = [
  {
    id: 'atlas',
    name: 'Project Atlas',
    type: 'CRM',
    progress: 68,
    status: 'Delivery',
    team: ['JK', 'RL', 'NS'],
    next: 'UAT scripts',
    updated: 'Today',
  },
  {
    id: 'harbor',
    name: 'Harbor Mobile',
    type: 'Mobile Apps',
    progress: 41,
    status: 'Build',
    team: ['AM', 'VT'],
    next: 'iOS beta',
    updated: 'Yesterday',
  },
  {
    id: 'lumen',
    name: 'Lumen Agents',
    type: 'AI Agents',
    progress: 22,
    status: 'Discovery',
    team: ['JK', 'EW'],
    next: 'Knowledge map',
    updated: '2 days ago',
  },
  {
    id: 'forge',
    name: 'Forge Automation',
    type: 'Automation',
    progress: 81,
    status: 'QA',
    team: ['RL', 'NS', 'AM'],
    next: 'Go-live checklist',
    updated: 'Today',
  },
];

export const milestones = [
  { title: 'Discovery signed', date: '4 Aug', done: true },
  { title: 'Architecture approved', date: '22 Aug', done: true },
  { title: 'UAT window', date: '28 Sep', done: false },
  { title: 'Production cutover', date: '12 Oct', done: false },
];

export const projectFiles = [
  { name: 'Northline-CRM-architecture.pdf', size: '2.4 MB', kind: 'PDF' },
  { name: 'Data-model-v3.xlsx', size: '840 KB', kind: 'Workbook' },
  { name: 'UAT-script.md', size: '28 KB', kind: 'Doc' },
];

export const messages = [
  { from: 'Jordan K.', role: 'Delivery lead', body: 'Architecture pack is in Files. Please confirm the opportunity stages.' },
  { from: 'You', role: 'Client', body: 'Stages look right. Can we keep “Nurture” as a hidden stage?' },
  { from: 'Nia S.', role: 'Engineer', body: 'Yes — we will map it without showing it on the board.' },
];

export const leadRequests = [
  { id: 'LR-118', kind: 'Quote', subject: 'ERP foundations for two warehouses', status: 'In review', owner: 'Sales' },
  { id: 'LR-121', kind: 'Consultation', subject: 'Knowledge Agent for support desk', status: 'Scheduled', owner: 'Solutions' },
  { id: 'LR-124', kind: 'Discovery', subject: 'SaaS product workspace', status: 'Proposal ready', owner: 'Product' },
];

export const opportunities = [
  { name: 'Customer Hub expansion', stage: 'Proposal', value: 18000, close: 'Oct 2026' },
  { name: 'Academy seats × 40', stage: 'Negotiation', value: 9600, close: 'Oct 2026' },
  { name: 'Workflow Studio phase 2', stage: 'Qualified', value: 24000, close: 'Nov 2026' },
];

export const subscriptions = [
  { name: 'Hosting · Connected Cloud', cycle: 'Monthly', amount: 420, status: 'Active' },
  { name: 'Maintenance retainer', cycle: 'Monthly', amount: 1800, status: 'Active' },
  { name: 'SEO programme', cycle: 'Quarterly', amount: 3600, status: 'Renewing' },
  { name: 'AI services · Knowledge Agent', cycle: 'Monthly', amount: 1890, status: 'Active' },
];

export const invoices = [
  { id: 'INV-1048', label: 'AI services September', amount: 1890, status: 'Paid', date: '12 Sep' },
  { id: 'INV-1042', label: 'CRM discovery sprint', amount: 6400, status: 'Paid', date: '2 Sep' },
  { id: 'INV-1039', label: 'Hosting + maintenance', amount: 2220, status: 'Due 28 Sep', date: '21 Sep' },
];

export const tickets = [
  { id: 'T-441', topic: 'SSO timeout on academy', status: 'Open', channel: 'Portal' },
  { id: 'T-438', topic: 'Invoice VAT line', status: 'Waiting', channel: 'Email' },
  { id: 'T-429', topic: 'API key rotation', status: 'Resolved', channel: 'Chat' },
];

export const downloads = [
  { name: 'Master services agreement', kind: 'Contract', date: '4 Aug' },
  { name: 'INV-1048.pdf', kind: 'Invoice', date: '12 Sep' },
  { name: 'Atlas architecture pack', kind: 'Deliverable', date: '21 Sep' },
  { name: 'Practical AI certificate (preview)', kind: 'Certificate', date: '—' },
];

export const revenueSeries = [42, 48, 45, 61, 58, 72, 69, 81, 76, 88, 92, 86];
export const trafficSources = [
  { label: 'Direct', value: 34 },
  { label: 'Organic', value: 29 },
  { label: 'Partner', value: 18 },
  { label: 'Paid', value: 12 },
  { label: 'Referral', value: 7 },
];

export const countries = [
  ['United Kingdom', '54%'],
  ['United Arab Emirates', '16%'],
  ['France', '11%'],
  ['Germany', '8%'],
  ['United States', '6%'],
];

export const pipeline = [
  { stage: 'New', items: 18, value: 92000 },
  { stage: 'Qualified', items: 11, value: 148000 },
  { stage: 'Proposal', items: 7, value: 121000 },
  { stage: 'Negotiation', items: 4, value: 86000 },
  { stage: 'Won', items: 9, value: 204000 },
];

export const adminLeads = [
  { company: 'Northline Commerce', owner: 'Elena V.', score: 86, source: 'Website' },
  { company: 'Harbour Legal', owner: 'James K.', score: 74, source: 'Partner' },
  { company: 'Volt Retail', owner: 'Amira S.', score: 69, source: 'Academy' },
];

export const tasks = [
  { col: 'Backlog', title: 'ERP inventory mapping', owner: 'NS' },
  { col: 'Doing', title: 'Agent evaluation harness', owner: 'EW' },
  { col: 'Review', title: 'Checkout preview hardening', owner: 'AM' },
  { col: 'Done', title: 'Brand overlay pass', owner: 'RL' },
];

export const cmsPages = ['Home', 'Marketplace', 'Services', 'Academy', 'Contact'];
export const blogDrafts = ['Connected operations', 'Practical AI for operators', 'Why discovery first'];
export const catalogueAdmin = [
  { sku: 'BAGUE-AURA', stock: 14, status: 'Live' },
  { sku: 'BRACELET-LINK', stock: 9, status: 'Live' },
  { sku: 'COFFRET', stock: 22, status: 'Live' },
];
export const academyAdmin = [
  { course: 'Practical AI for business', students: 128, certs: 41 },
  { course: 'Automation foundations', students: 86, certs: 19 },
];
export const roles = [
  { role: 'Owner', users: 2, access: 'Full platform' },
  { role: 'Operator', users: 7, access: 'CRM, projects, finance' },
  { role: 'Editor', users: 4, access: 'CMS and academy' },
  { role: 'Viewer', users: 11, access: 'Read-only analytics' },
];
export const audit = [
  { who: 'elena.v', action: 'Updated pipeline stage', at: '21 Sep 02:14' },
  { who: 'system', action: 'Issued INV-1048', at: '12 Sep 09:02' },
  { who: 'jordan.k', action: 'Rotated API key (workspace)', at: '9 Sep 18:41' },
];

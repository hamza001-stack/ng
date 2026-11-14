export type WorkspaceRole = 'user' | 'admin';

export type NavIcon =
  | 'home'
  | 'orders'
  | 'wishlist'
  | 'quotes'
  | 'notifications'
  | 'support'
  | 'downloads'
  | 'profile'
  | 'settings'
  | 'overview'
  | 'analytics'
  | 'crm'
  | 'finance'
  | 'marketplace'
  | 'cms'
  | 'academy'
  | 'projects'
  | 'users'
  | 'automation'
  | 'library';

export type NavItem = {
  href: string;
  label: string;
  section: string;
  description: string;
  icon: NavIcon;
  group: string;
  shortcut?: string;
  /** Collapsible sub-items shown under this item in the sidebar. */
  children?: { href: string; label: string }[];
};

export const userNav: NavItem[] = [
  { href: '/dashboard', label: 'Home', section: 'home', description: 'Orders, saved items and shortcuts', icon: 'home', group: 'Account', shortcut: 'G H' },
  { href: '/dashboard/orders', label: 'Orders', section: 'orders', description: 'History, invoices and tracking', icon: 'orders', group: 'Commerce' },
  { href: '/dashboard/wishlist', label: 'Wishlist', section: 'wishlist', description: 'Saved products', icon: 'wishlist', group: 'Commerce' },
  { href: '/dashboard/quotes', label: 'Quotes', section: 'quotes', description: 'Submitted quotations', icon: 'quotes', group: 'Commerce' },
  { href: '/dashboard/notifications', label: 'Notifications', section: 'notifications', description: 'Order and quote updates', icon: 'notifications', group: 'Account' },
  { href: '/dashboard/support', label: 'Support', section: 'support', description: 'Help and open requests', icon: 'support', group: 'Account' },
  { href: '/dashboard/downloads', label: 'Downloads', section: 'downloads', description: 'Invoices and documents', icon: 'downloads', group: 'Account' },
  { href: '/dashboard/profile', label: 'Profile', section: 'profile', description: 'Details, addresses and security', icon: 'profile', group: 'Account' },
  { href: '/dashboard/settings', label: 'Settings', section: 'settings', description: 'Theme, language and privacy', icon: 'settings', group: 'Account' },
];

export const adminNav: NavItem[] = [
  { href: '/admin', label: 'Home', section: 'overview', description: 'Live KPIs and activity', icon: 'overview', group: 'Operate', shortcut: 'G O' },
  { href: '/admin/finance', label: 'Orders', section: 'finance', description: 'Fulfilment, refunds and invoices', icon: 'finance', group: 'Commerce' },
  { href: '/admin/marketplace', label: 'Products', section: 'marketplace', description: 'Catalogue, inventory and coupons', icon: 'marketplace', group: 'Commerce' },
  { href: '/admin/users', label: 'Customers', section: 'users', description: 'Accounts, roles and audit', icon: 'users', group: 'Commerce' },
  { href: '/admin/crm', label: 'CRM', section: 'crm', description: 'Leads, pipeline and quotes', icon: 'crm', group: 'Revenue', shortcut: 'G C' },
  { href: '/admin/analytics', label: 'Analytics', section: 'analytics', description: 'Revenue, orders and conversion', icon: 'analytics', group: 'Revenue', shortcut: 'G A' },
  { href: '/admin/cms', label: 'CMS', section: 'cms', description: 'Pages, articles and media', icon: 'cms', group: 'Content' },
  { href: '/admin/pages', label: 'Pages & pricing', section: 'pages', description: 'SEO, page HTML and plan prices', icon: 'cms', group: 'Content' },
  { href: '/admin/academy', label: 'Academy', section: 'academy', description: 'Programmes, prices, dates, waiting lists and enrolments', icon: 'academy', group: 'Content',
    children: [
      { href: '/admin/academy', label: 'Overview' },
      { href: '/admin/academy/programmes', label: 'Programmes & pricing' },
      { href: '/admin/academy/sessions', label: 'Sessions & dates' },
      { href: '/admin/academy/waiting', label: 'Waiting lists' },
      { href: '/admin/academy/enrolments', label: 'Enrolments' },
    ] },
  { href: '/admin/projects', label: 'Projects', section: 'projects', description: 'Delivery board and files', icon: 'projects', group: 'Content' },
  { href: '/admin/settings', label: 'Settings', section: 'settings', description: 'Roles, payments, email and security', icon: 'settings', group: 'Platform' },
];

export const userSections = userNav.map((item) => item.section).filter((s) => s !== 'home');
export const adminSections = adminNav.map((item) => item.section).filter((s) => s !== 'overview');

import {
  Bell,
  BookOpen,
  Boxes,
  FolderKanban,
  Heart,
  Home,
  LayoutDashboard,
  Library,
  LifeBuoy,
  LineChart,
  Newspaper,
  Package,
  Receipt,
  Settings,
  ShoppingBag,
  Sparkles,
  Ticket,
  UserRound,
  Users,
} from 'lucide-react';
import type { NavIcon } from '@/lib/workspace-ia';

const icons = {
  home: Home,
  orders: ShoppingBag,
  wishlist: Heart,
  quotes: Ticket,
  notifications: Bell,
  support: LifeBuoy,
  downloads: Package,
  profile: UserRound,
  settings: Settings,
  overview: LayoutDashboard,
  analytics: LineChart,
  crm: Users,
  finance: Receipt,
  cms: Newspaper,
  marketplace: Boxes,
  academy: BookOpen,
  library: Library,
  users: Users,
  projects: FolderKanban,
  automation: Sparkles,
};

export function NavGlyph({ icon, size = 16 }: { icon: NavIcon; size?: number }) {
  const Icon = icons[icon] ?? Home;
  return <Icon size={size} aria-hidden />;
}

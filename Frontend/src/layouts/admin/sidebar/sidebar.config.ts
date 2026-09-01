import {
  Home,
  BookOpen,
  Book,
  Video,
  FileText,
  Newspaper,
  Briefcase,
  ShoppingCart,
  Ticket,
  ArrowLeftRight,
  UserPlus,
  Users,
  MapPin,
  Layers,
  Sparkles,
  PanelBottom,
  Menu as MenuIcon,
  PanelsTopLeft,
  Share2,
  HelpCircle,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  route: string;
  permission?: string;
  badge?: 'dot' | number;
}

export interface SidebarGroup {
  id: string;
  label: string;
  items: SidebarItem[];
}

export const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Home,
        route: '/admin/dashboard',
      },
    ],
  },
  {
    id: 'content',
    label: 'Content',
    items: [
      {
        id: 'manage-courses',
        label: 'Manage courses',
        icon: BookOpen,
        route: '/admin/courses',
        badge: 'dot',
      },
      {
        id: 'free-courses',
        label: 'Free courses',
        icon: Book,
        route: '/admin/free-courses',
      },
      {
        id: 'live-classes',
        label: 'Live classes',
        icon: Video,
        route: '/admin/live-classes',
      },
      {
        id: 'manage-blogs',
        label: 'Manage blogs',
        icon: FileText,
        route: '/admin/blogs',
      },
      {
        id: 'manage-news',
        label: 'Manage news',
        icon: Newspaper,
        route: '/admin/news',
      },
      {
        id: 'manage-careers',
        label: 'Manage careers',
        icon: Briefcase,
        route: '/admin/careers',
      },
    ],
  },
  {
    id: 'commerce',
    label: 'Commerce',
    items: [
      {
        id: 'manage-order',
        label: 'Manage order',
        icon: ShoppingCart,
        route: '/admin/orders',
      },
      {
        id: 'manage-coupon',
        label: 'Manage coupon',
        icon: Ticket,
        route: '/admin/coupons',
      },
      {
        id: 'withdraw-payment',
        label: 'Withdraw payment',
        icon: ArrowLeftRight,
        route: '/admin/withdrawals',
      },
    ],
  },
  {
    id: 'users',
    label: 'Users',
    items: [
      {
        id: 'instructor-requests',
        label: 'Instructor requests',
        icon: UserPlus,
        route: '/admin/instructor-requests',
      },
      {
        id: 'manage-users',
        label: 'Manage users',
        icon: Users,
        route: '/admin/users',
      },
      {
        id: 'locations',
        label: 'Locations',
        icon: MapPin,
        route: '/admin/locations',
      },
    ],
  },
  {
    id: 'site-contents',
    label: 'Site Contents',
    items: [
      {
        id: 'sections',
        label: 'Sections',
        icon: Layers,
        route: '/admin/sections',
      },
      {
        id: 'brands',
        label: 'Brands',
        icon: Sparkles,
        route: '/admin/brands',
      },
      {
        id: 'footer-setting',
        label: 'Footer setting',
        icon: PanelBottom,
        route: '/admin/footer-settings',
      },
      {
        id: 'menu-builder',
        label: 'Menu builder',
        icon: MenuIcon,
        route: '/admin/menu-builder',
      },
      {
        id: 'page-builder',
        label: 'Page builder',
        icon: PanelsTopLeft,
        route: '/admin/page-builder',
      },
      {
        id: 'social-links',
        label: 'Social links',
        icon: Share2,
        route: '/admin/social-links',
      },
      {
        id: 'faqs',
        label: 'FAQs',
        icon: HelpCircle,
        route: '/admin/faqs',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        route: '/admin/settings',
      },
    ],
  },
];

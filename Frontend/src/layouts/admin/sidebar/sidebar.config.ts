import {
  Home,
  BookOpen,
  Book,
  FileText,
  Newspaper,
  Briefcase,
  ShoppingCart,
  Ticket,
  ArrowLeftRight,
  UserPlus,
  Users,
  LibraryBig, 
  NotebookText, 
  FileCheck, 
  Sigma, 
  ListTodo,
  Database,
  MapPin,
  Layers,
  Sparkles,
  Radio,
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
  children?: SidebarItem[]; 
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
        label: 'Manage Courses',
        icon: BookOpen,
        route: '/admin/courses',
        // badge: 'dot',
        children: [
          { id: 'all-courses', label: 'All Courses', icon: BookOpen, route: '/admin/courses/all-courses' },
          { id: 'course-classes', label: 'Classes', icon: BookOpen, route: '/admin/courses/classes' },
          { id: 'course-subjects', label: 'Subjects', icon: BookOpen, route: '/admin/courses/subjects' },
          { id: 'course-medium', label: 'Medium', icon: BookOpen, route: '/admin/courses/medium' },
        ],
      },
      {
        id: 'free-courses',
        label: 'Free Courses',
        icon: Book,
        route: '/admin/free-courses',
        children: [
          { id: 'all-free-courses', label: 'All Courses', icon: Book, route: '/admin/free-courses/all-free-courses' },
          { id: 'free-course-classes', label: 'Classes', icon: Book, route: '/admin/free-courses/classes' },
          { id: 'free-course-subjects', label: 'Subjects', icon: Book, route: '/admin/free-courses/subjects' },
          { id: 'free-course-subjects', label: 'Medium', icon: Book, route: '/admin/free-courses/medium' },
        ],
      },
      {
        id: 'live-classes',
        label: 'Live Classes',
        icon: Radio,
        route: '/admin/live-classes',
        children: [
          { id: 'live-classes', label: 'Live Classes', icon: Radio, route: '/admin/live-classes' },
          { id: 'calender-views', label: 'Calendar Views', icon: Radio, route: '/admin/live-classes/calendar-views' },
          { id: 'attendance', label: 'Attendance', icon: Radio, route: '/admin/live-classes/attendance' },
          { id: 'recordings', label: 'Recordings', icon: Radio, route: '/admin/live-classes/recordings' },
        ],
      },
      {
          id: 'study-materials',
          label: 'Study Materials',
          icon: LibraryBig,
          route: '/admin/study-materials',
          children: [
            { id: 'study-materials', label: 'Study Materials', icon: NotebookText, route: '/admin/study-materials' },
            { id: 'notes', label: 'Notes', icon: FileCheck, route: '/admin/study-materials/notes' },
            { id: 'practice-questions', label: 'Practice Questions', icon: FileCheck, route: '/admin/study-materials/practice-questions' },
            { id: 'formula-sheets', label: 'Formula Sheets', icon: Sigma, route: '/admin/study-materials/formula-sheets' },
            { id: 'mcq', label: 'Mcq', icon: ListTodo, route: '/admin/study-materials/mcq' },
            { id: 'important-questions', label: 'Important Questions', icon: Sparkles, route: '/admin/study-materials/important-questions' },
            { id: 'sample-papers', label: 'Sample Papers', icon: FileText, route: '/admin/study-materials/sample-papers' },
            { id: 'test-series', label: 'Test Series', icon: Layers, route: '/admin/study-materials/test-series' },
            { id: 'complete-question-bank', label: 'Complete Question Bank', icon: Database, route: '/admin/study-materials/complete-question-bank' },
          ],
        },
      {
        id: 'manage-blogs',
        label: 'Blogs',
        icon: FileText,
        route: '/admin/blogs',
        children: [
          { id: 'all-posts', label: 'All Posts', icon: FileText, route: '/admin/blogs/all-posts' },
          { id: 'blog-categories', label: 'Categories', icon: FileText, route: '/admin/blogs/categories' },
        ],
      },
      {
        id: 'manage-news',
        label: 'News',
        icon: Newspaper,
        route: '/admin/news',
        children: [
          { id: 'latest-news', label: 'Latest News', icon: Newspaper, route: '/admin/news/latest-news' },
          { id: 'press-releases', label: 'Press Releases', icon: Newspaper, route: '/admin/news/press-releases' },
        ],
      },
      {
        id: 'manage-careers',
        label: 'Careers',
        icon: Briefcase,
        route: '/admin/careers',
        children: [
          { id: 'job-listings', label: 'Job Listings', icon: Briefcase, route: '/admin/careers/job-listings' },
          { id: 'applications', label: 'Applications', icon: Briefcase, route: '/admin/careers/applications' },
        ],
      },
    ],
  },
  {
    id: 'commerce',
    label: 'Commerce',
    items: [
      {
        id: 'manage-order',
        label: 'Manage Order',
        icon: ShoppingCart,
        route: '/admin/orders',
      },
      {
        id: 'manage-coupon',
        label: 'Manage Coupon',
        icon: Ticket,
        route: '/admin/coupons',
      },
      {
        id: 'withdraw-payment',
        label: 'Withdraw Payment',
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
        label: 'Instructor Requests',
        icon: UserPlus,
        route: '/admin/instructor-requests',
      },
      {
        id: 'manage-users',
        label: 'Manage Users',
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
        label: 'Footer Setting',
        icon: PanelBottom,
        route: '/admin/footer-settings',
      },
      {
        id: 'menu-builder',
        label: 'Menu Builder',
        icon: MenuIcon,
        route: '/admin/menu-builder',
      },
      {
        id: 'page-builder',
        label: 'Page Builder',
        icon: PanelsTopLeft,
        route: '/admin/page-builder',
      },
      {
        id: 'social-links',
        label: 'Social Links',
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

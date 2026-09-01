import React from 'react';
import {
  GraduationCap,
  BookOpen,
  Video,
  FileText,
  Newspaper,
  Briefcase,
  ShoppingCart,
  Ticket,
  type LucideIcon,
} from 'lucide-react';
import { useUIStore } from '../../../../store/ui.store';

interface QuickActionItem {
  id: string;
  label: string;
  
  icon: LucideIcon;
  iconColor: string;
  route: string;
}

const quickActions: QuickActionItem[] = [
  {
    id: 'create-course',
    label: 'Create Course',
    icon: GraduationCap,
    iconColor: 'text-[#2451D9] dark:text-[#60A5FA]',
    route: '/admin/courses/create',
  },
  {
    id: 'create-free-course',
    label: 'Create Free Course',
    icon: BookOpen,
    iconColor: 'text-[#16A34A] dark:text-[#4ADE80]',
    route: '/admin/free-courses/create',
  },
  {
    id: 'schedule-live',
    label: 'Schedule Live Class',
    icon: Video,
    iconColor: 'text-[#D97706] dark:text-[#FBBF24]',
    route: '/admin/live-classes/create',
  },
  {
    id: 'add-blog',
    label: 'Add Blog',
    icon: FileText,
    iconColor: 'text-[#7C3AED] dark:text-[#C084FC]',
    route: '/admin/blogs/create',
  },
  {
    id: 'add-news',
    label: 'Add News',
    icon: Newspaper,
    iconColor: 'text-[#2563EB] dark:text-[#60A5FA]',
    route: '/admin/news/create',
  },
  {
    id: 'add-career',
    label: 'Add Career',
    icon: Briefcase,
    iconColor: 'text-[#0D9488] dark:text-[#2DD4BF]',
    route: '/admin/careers/create',
  },
  {
    id: 'view-orders',
    label: 'View Orders',
    icon: ShoppingCart,
    iconColor: 'text-[#F59E0B] dark:text-[#FBBF24]',
    route: '/admin/orders',
  },
  {
    id: 'add-coupon',
    label: 'Add Coupon',
    icon: Ticket,
    iconColor: 'text-[#DC5B3E] dark:text-[#F87171]',
    route: '/admin/coupons/create',
  },
];

interface QuickActionsBarProps {
  onActionClick?: (actionId: string, route: string) => void;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ onActionClick }) => {
  const { setCurrentRoute } = useUIStore();

  const handleClick = (e: React.MouseEvent, action: QuickActionItem) => {
    e.preventDefault();
    setCurrentRoute(action.route);
    if (onActionClick) {
      onActionClick(action.id, action.route);
    }
  };

  return (
    <div className="mt-2 mb-2">
      <h3 className="text-base font-bold text-[#12141C] dark:text-white tracking-tight mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              onClick={(e) => handleClick(e, action)}
              className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 px-3.5 py-3 bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-xl text-xs font-bold text-[#12141C] dark:text-gray-200 hover:border-[#2451D9] dark:hover:border-[#3B82F6] hover:text-[#2451D9] dark:hover:text-[#60A5FA] hover:shadow-[0_2px_10px_rgba(36,81,217,0.06)] dark:hover:shadow-[0_2px_10px_rgba(59,130,246,0.15)] active:scale-[0.98] transition-all select-none group text-center sm:text-left"
            >
              <Icon
                className={`w-4 h-4 ${action.iconColor} flex-shrink-0 transition-transform group-hover:scale-110`}
              />
              <span className="leading-tight truncate">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsBar;

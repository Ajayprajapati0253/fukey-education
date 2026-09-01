import React from 'react';
import {
  CheckCircle2,
  UserPlus,
  ShoppingCart,
  FileText,
  IndianRupee,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import type { RecentActivityItem } from '../types/dashboard.types';
import { useUIStore } from '../../../../store/ui.store';

interface RecentActivityFeedProps {
  activities?: RecentActivityItem[];
  isLoading?: boolean;
}

const activityConfig: Record<
  RecentActivityItem['type'],
  { icon: LucideIcon; iconBg: string; iconColor: string }
> = {
  approved: {
    icon: CheckCircle2,
    iconBg: 'bg-[#E7F7ED] dark:bg-[#16A34A]/20',
    iconColor: 'text-[#16A34A] dark:text-[#4ADE80]',
  },
  instructor_request: {
    icon: UserPlus,
    iconBg: 'bg-[#EAF0FE] dark:bg-[#2451D9]/20',
    iconColor: 'text-[#2451D9] dark:text-[#60A5FA]',
  },
  order: {
    icon: ShoppingCart,
    iconBg: 'bg-[#FDF3E0] dark:bg-[#D97706]/20',
    iconColor: 'text-[#D97706] dark:text-[#FBBF24]',
  },
  blog: {
    icon: FileText,
    iconBg: 'bg-[#F1EAFE] dark:bg-[#7C3AED]/20',
    iconColor: 'text-[#7C3AED] dark:text-[#C084FC]',
  },
  student: {
    icon: UserPlus,
    iconBg: 'bg-[#EAF0FE] dark:bg-[#2451D9]/20',
    iconColor: 'text-[#2451D9] dark:text-[#60A5FA]',
  },
  payment: {
    icon: IndianRupee,
    iconBg: 'bg-[#E7F7ED] dark:bg-[#16A34A]/20',
    iconColor: 'text-[#16A34A] dark:text-[#4ADE80]',
  },
};

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities = [],
  isLoading = false,
}) => {
  const { setCurrentRoute } = useUIStore();

  return (
    <div className="bg-white dark:bg-[#1E293B] p-5 sm:p-6 rounded-2xl border border-[#E6E8EE] dark:border-[#334155] flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-[#12141C] dark:text-white tracking-tight">Recent Activity</h3>
        <a
          href="/admin/activity"
          onClick={(e) => {
            e.preventDefault();
            setCurrentRoute('/admin/activity');
          }}
          className="text-xs font-semibold text-[#2451D9] dark:text-[#60A5FA] hover:underline flex items-center gap-1"
        >
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Feed List */}
      {isLoading ? (
        <div className="space-y-4 flex-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800" />
              <div className="flex-1 h-3.5 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#9DA2AF] dark:text-gray-400">
          No recent activity logged.
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          {activities.map((item) => {
            const config = activityConfig[item.type] || activityConfig.approved;
            const Icon = config.icon;

            return (
              <div key={item.id} className="flex items-start gap-3 group">
                <div
                  className={`w-8 h-8 rounded-xl ${config.iconBg} ${config.iconColor} flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform group-hover:scale-105`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 flex items-start justify-between gap-2 min-w-0">
                  <p className="text-xs font-medium text-[#12141C] dark:text-gray-200 group-hover:text-[#2451D9] dark:group-hover:text-[#60A5FA] transition-colors leading-snug">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-[#9DA2AF] dark:text-gray-400 whitespace-nowrap font-medium flex-shrink-0 pt-0.5">
                    {item.occurredAt}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivityFeed;

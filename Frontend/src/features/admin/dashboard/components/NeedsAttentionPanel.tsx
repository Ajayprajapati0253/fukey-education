import React from 'react';
import {
  Tag,
  Package,
  UserPlus,
  Mail,
  AlertTriangle,
  Video,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import type { NeedsAttentionItem } from '../types/dashboard.types';
import { useUIStore } from '../../../../store/ui.store';

interface NeedsAttentionPanelProps {
  items?: NeedsAttentionItem[];
  isLoading?: boolean;
}

const iconMap: Record<NeedsAttentionItem['iconType'], LucideIcon> = {
  course: Tag,
  order: Package,
  instructor: UserPlus,
  message: Mail,
  payment: AlertTriangle,
  live: Video,
};

const styleMap: Record<
  NeedsAttentionItem['severity'],
  { iconBg: string; iconColor: string; badgeBg: string; badgeColor: string }
> = {
  warning: {
    iconBg: 'bg-[#FDF3E0] dark:bg-[#D97706]/20',
    iconColor: 'text-[#D97706] dark:text-[#FBBF24]',
    badgeBg: 'bg-[#FDF3E0] dark:bg-[#D97706]/20',
    badgeColor: 'text-[#D97706] dark:text-[#FBBF24]',
  },
  danger: {
    iconBg: 'bg-[#FCEAE4] dark:bg-[#DC5B3E]/20',
    iconColor: 'text-[#DC5B3E] dark:text-[#F87171]',
    badgeBg: 'bg-[#FDF3E0] dark:bg-[#D97706]/20',
    badgeColor: 'text-[#D97706] dark:text-[#FBBF24]',
  },
  brand: {
    iconBg: 'bg-[#EAF0FE] dark:bg-[#2451D9]/20',
    iconColor: 'text-[#2451D9] dark:text-[#60A5FA]',
    badgeBg: 'bg-[#EAF0FE] dark:bg-[#2451D9]/20',
    badgeColor: 'text-[#2451D9] dark:text-[#60A5FA]',
  },
  accent: {
    iconBg: 'bg-[#F1EAFE] dark:bg-[#7C3AED]/20',
    iconColor: 'text-[#7C3AED] dark:text-[#C084FC]',
    badgeBg: 'bg-[#F1EAFE] dark:bg-[#7C3AED]/20',
    badgeColor: 'text-[#7C3AED] dark:text-[#C084FC]',
  },
  teal: {
    iconBg: 'bg-[#E4F5F3] dark:bg-[#0D9488]/20',
    iconColor: 'text-[#0D9488] dark:text-[#2DD4BF]',
    badgeBg: 'bg-[#E7F7ED] dark:bg-[#16A34A]/20',
    badgeColor: 'text-[#16A34A] dark:text-[#4ADE80]',
  },
  success: {
    iconBg: 'bg-[#E7F7ED] dark:bg-[#16A34A]/20',
    iconColor: 'text-[#16A34A] dark:text-[#4ADE80]',
    badgeBg: 'bg-[#E7F7ED] dark:bg-[#16A34A]/20',
    badgeColor: 'text-[#16A34A] dark:text-[#4ADE80]',
  },
};

export const NeedsAttentionPanel: React.FC<NeedsAttentionPanelProps> = ({
  items = [],
  isLoading = false,
}) => {
  const { setCurrentRoute } = useUIStore();

  return (
    <div className="bg-white dark:bg-[#1E293B] p-5 sm:p-6 rounded-2xl border border-border-subtle dark:border-[#334155] flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-ink dark:text-white tracking-tight">Needs Attention</h3>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-xs text-ink-mute dark:text-gray-400">
          No pending items requiring attention.
        </div>
      ) : (
        <ul className="space-y-3.5 flex-1">
          {items.map((item) => {
            const Icon = iconMap[item.iconType] || Tag;
            const style = styleMap[item.severity] || styleMap.brand;

            return (
              <li key={item.key}>
                <a
                  href={item.route}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentRoute(item.route);
                  }}
                  className="flex items-center justify-between group py-0.5 rounded-xl transition-colors select-none"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`w-8 h-8 rounded-xl ${style.iconBg} ${style.iconColor} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-ink dark:text-gray-200 group-hover:text-brand dark:group-hover:text-[#60A5FA] transition-colors truncate">
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full tabular-nums ${style.badgeBg} ${style.badgeColor}`}
                    >
                      {item.count}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-brand dark:group-hover:text-[#60A5FA] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default NeedsAttentionPanel;

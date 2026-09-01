import React from 'react';
import { ChevronRight, Clock, ArrowRight } from 'lucide-react';
import { Avatar } from '../../../../components/ui/Avatar';
import { Badge } from '../../../../components/ui/Badge';
import type { UpcomingLiveClass } from '../types/dashboard.types';
import { useUIStore } from '../../../../store/ui.store';

interface UpcomingLiveClassesPanelProps {
  classes?: UpcomingLiveClass[];
  isLoading?: boolean;
}

export const UpcomingLiveClassesPanel: React.FC<UpcomingLiveClassesPanelProps> = ({
  classes = [],
  isLoading = false,
}) => {
  const { setCurrentRoute } = useUIStore();

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentRoute('/admin/live-classes');
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] p-5 sm:p-6 rounded-2xl border border-[#E6E8EE] dark:border-[#334155] flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-[#12141C] dark:text-white tracking-tight">Upcoming Live Classes</h3>
        <a
          href="/admin/live-classes"
          onClick={handleNavigate}
          className="text-xs font-semibold text-[#2451D9] dark:text-[#60A5FA] hover:underline flex items-center gap-1"
        >
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Class List */}
      {isLoading ? (
        <div className="space-y-4 flex-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#9DA2AF] dark:text-gray-400">
          No live classes scheduled for today.
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          {classes.map((cls) => (
            <div key={cls.id} className="flex items-start gap-3 group">
              <Avatar
                src={cls.instructorAvatarUrl}
                name={cls.instructorName}
                size="md"
                shape="rounded"
                className="group-hover:ring-2 group-hover:ring-[#2451D9]/20 transition-all"
              />

              <div className="flex-1 min-w-0 pr-1">
                <p className="text-xs font-bold text-[#12141C] dark:text-white truncate leading-tight group-hover:text-[#2451D9] dark:group-hover:text-[#60A5FA] transition-colors">
                  {cls.title}
                </p>
                <p className="text-[11px] font-medium text-[#686E7D] dark:text-[#94A3B8] truncate mt-0.5">
                  {cls.instructorName}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                {cls.status === 'live' ? (
                  <Badge variant="live" size="xs" dot>
                    Live
                  </Badge>
                ) : (
                  <span className="inline-block text-[10px] font-semibold text-[#2451D9] dark:text-[#60A5FA] bg-[#EAF0FE] dark:bg-[#2451D9]/20 px-2 py-0.5 rounded-full mb-1">
                    Upcoming
                  </span>
                )}
                <p className="text-[10px] text-[#686E7D] dark:text-[#94A3B8] font-medium whitespace-nowrap flex items-center justify-end gap-1 mt-0.5">
                  <Clock className="w-2.5 h-2.5 text-[#9DA2AF] dark:text-gray-500" />
                  {cls.timeDisplay}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Link */}
      <a
        href="/admin/live-classes"
        onClick={handleNavigate}
        className="mt-4 pt-3.5 border-t border-[#F1F3F8] dark:border-gray-800 text-xs font-semibold text-[#2451D9] dark:text-[#60A5FA] hover:text-[#1E44B8] dark:hover:text-[#93C5FD] flex items-center justify-between group transition-colors select-none"
      >
        <span>View all live classes</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </a>
    </div>
  );
};

export default UpcomingLiveClassesPanel;

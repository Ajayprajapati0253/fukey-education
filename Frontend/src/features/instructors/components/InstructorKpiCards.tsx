import { Users, UserCheck, Clock, Video, PauseCircle, TrendingUp, TrendingDown } from 'lucide-react';
import type { InstructorKpiData } from '../types/instructor';

interface InstructorKpiCardsProps {
  kpi: InstructorKpiData;
  activeStatusFilter?: string;
  onSelectStatusFilter?: (status: string) => void;
}

export function InstructorKpiCards({
  kpi,
  activeStatusFilter,
  onSelectStatusFilter,
}: InstructorKpiCardsProps) {
  const cards = [
    {
      id: 'total',
      label: 'Total Instructors',
      value: kpi.totalInstructors,
      growth: kpi.totalGrowth,
      filterValue: 'All Status',
      icon: Users,
      iconBg: 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/15 dark:text-blue-400',
    },
    {
      id: 'active',
      label: 'Active Instructors',
      value: kpi.activeInstructors,
      growth: kpi.activeGrowth,
      filterValue: 'Active',
      icon: UserCheck,
      iconBg: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400',
    },
    {
      id: 'pending',
      label: 'Pending Verification',
      value: kpi.pendingVerification,
      growth: kpi.pendingGrowth,
      filterValue: 'Pending',
      icon: Clock,
      iconBg: 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/15 dark:text-amber-400',
    },
    {
      id: 'teaching',
      label: 'Currently Teaching',
      value: kpi.currentlyTeaching,
      growth: kpi.teachingGrowth,
      filterValue: 'Online',
      icon: Video,
      iconBg: 'bg-purple-500/10 text-purple-500 dark:bg-purple-500/15 dark:text-purple-400',
    },
    {
      id: 'inactive',
      label: 'Inactive / Suspended',
      value: kpi.inactiveSuspended,
      growth: kpi.inactiveGrowth,
      filterValue: 'Inactive',
      icon: PauseCircle,
      iconBg: 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/15 dark:text-rose-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isPositive = card.growth >= 0;
        const isSelected = activeStatusFilter === card.filterValue;

        return (
          <div
            key={card.id}
            onClick={() => onSelectStatusFilter && onSelectStatusFilter(card.filterValue)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              isSelected
                ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-500 ring-2 ring-blue-500/20'
                : 'bg-white dark:bg-[#111c34] border-slate-200/80 dark:border-[#1e2c4c] hover:border-blue-400/50 dark:hover:border-blue-500/40 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                  {card.label}
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white leading-tight mt-0.5">
                  {card.value}
                </div>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#1e2c4c]/60 flex items-center gap-1.5 text-[11px] font-medium">
              {isPositive ? (
                <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-semibold gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>↑ {card.growth}%</span>
                </span>
              ) : (
                <span className="inline-flex items-center text-rose-600 dark:text-rose-400 font-semibold gap-0.5">
                  <TrendingDown className="w-3 h-3" />
                  <span>↓ {Math.abs(card.growth)}%</span>
                </span>
              )}
              <span className="text-slate-400 dark:text-slate-500">vs last month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

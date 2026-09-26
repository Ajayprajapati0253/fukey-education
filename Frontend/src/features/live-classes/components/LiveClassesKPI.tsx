import React from 'react';
import { Video, Play, Clock, CheckCircle2, CalendarX, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPIData {
  total: number;
  live: number;
  upcoming: number;
  completed: number;
  cancelled: number;
}

interface LiveClassesKPIProps {
  counts: KPIData;
  onFilterStatus?: (status: string) => void;
  activeStatusFilter?: string;
}

export const LiveClassesKPI: React.FC<LiveClassesKPIProps> = ({
  counts,
  onFilterStatus,
  activeStatusFilter
}) => {
  const cards = [
    {
      id: 'total',
      statusFilter: 'All Status',
      title: 'Total Live Classes',
      value: counts.total,
      changeText: '12.5% vs last month',
      isPositive: true,
      icon: Video,
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
      accentColor: '#9333ea', // purple-600
      sparklinePoints: '0,28 15,24 30,26 45,18 60,20 75,12 90,16 105,8 120,12 135,5 150,10',
    },
    {
      id: 'live',
      statusFilter: 'Live',
      title: 'Live Now',
      value: counts.live,
      changeText: '50% vs yesterday',
      isPositive: true,
      icon: Play,
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
      accentColor: '#10b981', // emerald-500
      sparklinePoints: '0,25 20,24 40,20 60,22 80,14 100,16 120,8 140,11 150,5',
    },
    {
      id: 'upcoming',
      statusFilter: 'Upcoming',
      title: 'Upcoming',
      value: counts.upcoming,
      changeText: '8.6% vs yesterday',
      isPositive: true,
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
      accentColor: '#f59e0b', // amber-500
      sparklinePoints: '0,22 18,25 36,20 54,15 72,18 90,22 108,12 126,16 150,14',
    },
    {
      id: 'completed',
      statusFilter: 'Completed',
      title: 'Completed',
      value: counts.completed,
      changeText: '10.3% vs last month',
      isPositive: true,
      icon: CheckCircle2,
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
      accentColor: '#3b82f6', // blue-500
      sparklinePoints: '0,26 15,22 30,24 45,15 60,20 75,16 90,18 105,12 120,15 135,8 150,12',
    },
    {
      id: 'cancelled',
      statusFilter: 'Cancelled',
      title: 'Cancelled',
      value: counts.cancelled,
      changeText: '20% vs last month',
      isPositive: false,
      icon: CalendarX,
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
      accentColor: '#f43f5e', // rose-500
      sparklinePoints: '0,14 20,18 40,15 60,12 80,20 100,22 120,18 140,24 150,26',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeStatusFilter === card.statusFilter;

        return (
          <div
            key={card.id}
            onClick={() => onFilterStatus?.(card.statusFilter)}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-white dark:bg-[#1E293B] p-4 transition-all duration-200 cursor-pointer ${
              isSelected
                ? 'shadow-md'
                : 'border-slate-200/90 dark:border-[#334155] shadow-2xs hover:border-slate-300 dark:hover:border-[#334155] hover:shadow-xs'
            }`}
            style={
              isSelected
                ? {
                    borderColor: card.accentColor,
                    boxShadow: `0 0 0 1px ${card.accentColor}33`, // subtle ring in the card's own color
                  }
                : undefined
            }
          >
            <div>
              {/* Icon & Title Row */}
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl p-2.5 shadow-2xs ${card.iconBg}`}>
                  <Icon className="h-5 w-5 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-gray-400">
                    {card.title}
                  </span>
                  <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-gray-100 leading-tight">
                    {card.value}
                  </div>
                </div>
              </div>

              {/* Trend Indicator */}
              <div className="mt-2.5 flex items-center gap-1 text-[11px] font-medium">
                {card.isPositive ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                )}
                <span className={card.isPositive ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400 font-semibold'}>
                  {card.changeText.split(' ')[0]}
                </span>
                <span className="text-slate-400 dark:text-gray-500">
                  {card.changeText.substring(card.changeText.indexOf(' '))}
                </span>
              </div>
            </div>

            {/* Sparkline Wave Chart at Bottom */}
            <div className="mt-3 h-8 w-full pt-1">
              <svg className="h-full w-full overflow-visible" viewBox="0 0 150 32" preserveAspectRatio="none">
                <path
                  d={`M ${card.sparklinePoints}`}
                  fill="none"
                  stroke={card.accentColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300 group-hover:stroke-[2.5]"
                />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
};
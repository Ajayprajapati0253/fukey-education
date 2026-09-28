import React from 'react';
import { Users, GraduationCap, Clock, UserPlus, ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import type { KpiFilterKey } from '../types';

interface StudentStatsGridProps {
  totalStudents?: number;
  activeStudents?: number;
  expiredStudents?: number;
  newEnrollments?: number;
  selectedKpi: KpiFilterKey;
  onSelectKpi: (kpi: KpiFilterKey) => void;
  className?: string;
}

type KpiKey = 'total' | 'active' | 'expired' | 'new';

const CARDS: {
  key: KpiKey;
  label: string;
  icon: React.ElementType;
  trend: string;
  up: boolean;
  iconBox: string;
  trendColor: string;
}[] = [
  {
    key: 'total',
    label: 'Total Students',
    icon: Users,
    trend: '12%',
    up: true,
    iconBox: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
    trendColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    key: 'active',
    label: 'Active Students',
    icon: GraduationCap,
    trend: '11%',
    up: true,
    iconBox: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    trendColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'expired',
    label: 'Expired Access',
    icon: Clock,
    trend: '8%',
    up: false,
    iconBox: 'bg-rose-50 text-rose-500 dark:bg-rose-500/15 dark:text-rose-400',
    trendColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    key: 'new',
    label: 'New Enrollments',
    icon: UserPlus,
    trend: '25%',
    up: true,
    iconBox: 'bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400',
    trendColor: 'text-teal-600 dark:text-teal-400',
  },
];

export const StudentStatsGrid: React.FC<StudentStatsGridProps> = ({
  totalStudents = 10,
  activeStudents = 6,
  expiredStudents = 1,
  newEnrollments = 3,
  selectedKpi,
  onSelectKpi,
  className = '',
}) => {
  const values: Record<KpiKey, number> = {
    total: totalStudents,
    active: activeStudents,
    expired: expiredStudents,
    new: newEnrollments,
  };

  const handleCardClick = (key: KpiKey) => onSelectKpi(selectedKpi === key ? null : key);

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {CARDS.map((c) => {
        const Icon = c.icon;
        const isActive = selectedKpi === c.key;
        return (
          <Card
            key={c.key}
            padding="none"
            hoverable
            onClick={() => handleCardClick(c.key)}
            role="button"
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick(c.key);
              }
            }}
            className={`p-4 flex items-center gap-4 cursor-pointer select-none transition-all duration-150 rounded-2xl ${
              isActive ? '!border-blue-500 ring-2 ring-blue-500/30' : ''
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.iconBox}`}>
              <Icon className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-[#64748b] dark:text-slate-400 leading-tight">
                {c.label}
              </div>
              <div className="text-3xl font-bold text-[#0f172a] dark:text-white tracking-tight leading-tight mt-0.5">
                {values[c.key]}
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold mt-0.5 ${c.trendColor}`}>
                {c.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                <span>{c.trend} vs last month</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default StudentStatsGrid;
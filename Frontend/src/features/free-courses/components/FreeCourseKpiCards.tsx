import React from 'react';
import { GraduationCap, CheckCircle2, Clock, XCircle, Archive } from 'lucide-react';
import type { FreeCourseKPIs } from '../types/free-course.types';

interface FreeCourseKpiCardsProps {
  kpis: FreeCourseKPIs;
  currentStatusFilter: string;
  onSelectStatus: (status: string) => void;
}

export const FreeCourseKpiCards: React.FC<FreeCourseKpiCardsProps> = ({
  kpis,
  currentStatusFilter,
  onSelectStatus,
}) => {
  const pct = (n: number) =>
    kpis.totalCourses ? ((n / kpis.totalCourses) * 100).toFixed(1) : '0.0';

  const cards = [
    {
      id: 'total',
      filterValue: 'All',
      title: 'Total Free Courses',
      value: kpis.totalCourses,
      subtitle: `${kpis.totalEnrollments.toLocaleString()} Total Enrollments`,
      subtitleColor: 'text-[#2451D9] dark:text-blue-400',
      icon: <GraduationCap className="w-5 h-5 text-[#2451D9] dark:text-blue-400" />,
      iconBg: 'bg-[#EAF0FE] border border-[#2451D9]/20 dark:bg-blue-500/10 dark:border-blue-500/20',
      isActive: currentStatusFilter === 'All',
    },
    {
      id: 'published',
      filterValue: 'Published',
      title: 'Published',
      value: kpis.publishedCount,
      subtitle: `${pct(kpis.publishedCount)}% of total`,
      subtitleColor: 'text-[#16A34A] dark:text-emerald-400',
      icon: <CheckCircle2 className="w-5 h-5 text-[#16A34A] dark:text-emerald-400" />,
      iconBg: 'bg-[#E7F7ED] border border-[#16A34A]/20 dark:bg-emerald-500/10 dark:border-emerald-500/20',
      isActive: currentStatusFilter === 'Published',
    },
    {
      id: 'pending',
      filterValue: 'Pending',
      title: 'Pending Review',
      value: kpis.pendingReviewCount,
      subtitle: `${pct(kpis.pendingReviewCount)}% of total`,
      subtitleColor: 'text-[#D97706] dark:text-amber-400',
      icon: <Clock className="w-5 h-5 text-[#D97706] dark:text-amber-400" />,
      iconBg: 'bg-[#FDF3E0] border border-[#D97706]/20 dark:bg-amber-500/10 dark:border-amber-500/20',
      isActive: currentStatusFilter === 'Pending',
    },
    {
      id: 'draft',
      filterValue: 'Draft',
      title: 'Draft',
      value: kpis.draftCount,
      subtitle: `${pct(kpis.draftCount)}% of total`,
      subtitleColor: 'text-[#DC5B3E] dark:text-rose-400',
      icon: <XCircle className="w-5 h-5 text-[#DC5B3E] dark:text-rose-400" />,
      iconBg: 'bg-[#FCEAE4] border border-[#DC5B3E]/20 dark:bg-rose-500/10 dark:border-rose-500/20',
      isActive: currentStatusFilter === 'Draft',
    },
    {
      id: 'archived',
      filterValue: 'Archived',
      title: 'Archived',
      value: kpis.archivedCount,
      subtitle: `${pct(kpis.archivedCount)}% of total`,
      subtitleColor: 'text-cyan-600 dark:text-cyan-400',
      icon: <Archive className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
      iconBg: 'bg-cyan-50 border border-cyan-200 dark:bg-cyan-500/10 dark:border-cyan-500/20',
      isActive: currentStatusFilter === 'Archived',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
      {cards.map((card) => (
        <button
          key={card.id}
          onClick={() => {
            if (card.id === 'pending') {
              onSelectStatus(card.isActive ? 'All' : card.filterValue);
            } else {
              onSelectStatus(card.isActive && card.filterValue !== 'All' ? 'All' : card.filterValue);
            }
          }}
          className={`text-left rounded-2xl p-4 transition-all duration-200 cursor-pointer flex items-center gap-3.5 relative overflow-hidden group ${
            card.isActive
              ? 'bg-[#EAF0FE] dark:bg-[#111e3b] border-2 border-[#2451D9] dark:border-blue-500 shadow-lg shadow-blue-500/15'
              : 'bg-white dark:bg-[#1E293B] hover:bg-[#F6F7FA] dark:hover:bg-[#131f38] border border-[#E6E8EE] dark:border-[#334155] shadow-sm dark:shadow-md'
          }`}
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
            {card.icon}
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-semibold text-[#686E7D] dark:text-slate-400 uppercase tracking-wider block truncate">
              {card.title}
            </span>
            <div className="text-2xl font-extrabold text-[#12141C] dark:text-white tracking-tight my-0.5">
              {card.value}
            </div>
            <span className={`text-[11px] font-medium block truncate ${card.subtitleColor}`}>
              {card.subtitle}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};
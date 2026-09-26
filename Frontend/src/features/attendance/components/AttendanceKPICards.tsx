import React from 'react';
import type { KPIStats } from '../types';
import { User, Check, X, BarChart3, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

interface AttendanceKPICardsProps {
  stats: KPIStats;
}

export const AttendanceKPICards: React.FC<AttendanceKPICardsProps> = ({ stats }) => {
  return (
    <div id="attendance-kpi-cards" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {/* Card 1: Total Teachers */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-xl p-3.5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:border-[#D1D5DB] dark:hover:border-[#475569] transition">
        <div className="flex items-start justify-between">
          <div className="w-8 h-8 rounded-lg bg-[#EAF0FE] dark:bg-[#2451D9]/20 text-[#2451D9] dark:text-[#60A5FA] flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-[#16A34A] dark:text-[#4ADE80] flex items-center gap-0.5">
            <ArrowUp className="w-3 h-3 stroke-[2.5]" />
            {Math.abs(stats.totalTeachersTrend)}%
          </span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div>
            <p className="text-[11px] text-[#686E7D] dark:text-[#94A3B8]">Total Teachers</p>
            <p className="text-2xl font-bold text-[#12141C] dark:text-white mt-0.5">{stats.totalTeachers}</p>
          </div>
          {/* Mini Sparkline Blue */}
          <svg className="w-20 h-6 text-[#2451D9] dark:text-blue-500 stroke-current fill-none stroke-[2]" viewBox="0 0 100 30">
            <path d="M0,25 Q15,20 30,22 T60,12 T85,14 T100,5" />
          </svg>
        </div>
      </div>

      {/* Card 2: Present Today */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-xl p-3.5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:border-[#D1D5DB] dark:hover:border-[#475569] transition">
        <div className="flex items-start justify-between">
          <div className="w-8 h-8 rounded-lg bg-[#E7F7ED] dark:bg-[#16A34A]/20 text-[#16A34A] dark:text-[#4ADE80] flex items-center justify-center">
            <Check className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-semibold text-[#16A34A] dark:text-[#4ADE80] flex items-center gap-0.5">
            <ArrowUp className="w-3 h-3 stroke-[2.5]" />
            {Math.abs(stats.presentTodayTrend)}%
          </span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div>
            <p className="text-[11px] text-[#686E7D] dark:text-[#94A3B8]">Total Classes</p>
            <p className="text-2xl font-bold text-[#12141C] dark:text-white mt-0.5">{stats.presentToday}</p>
          </div>
          {/* Mini Sparkline Green */}
          <svg className="w-20 h-6 text-[#16A34A] dark:text-emerald-400 stroke-current fill-none stroke-[2]" viewBox="0 0 100 30">
            <path d="M0,22 Q20,24 35,18 T70,8 T85,15 T100,5" />
          </svg>
        </div>
      </div>

      {/* Card 3: Absent Today */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-xl p-3.5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:border-[#D1D5DB] dark:hover:border-[#475569] transition">
        <div className="flex items-start justify-between">
          <div className="w-8 h-8 rounded-lg bg-[#FCEAE4] dark:bg-[#DC5B3E]/20 text-[#DC5B3E] dark:text-[#F87171] flex items-center justify-center">
            <X className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-semibold text-[#DC5B3E] dark:text-[#F87171] flex items-center gap-0.5">
            <ArrowDown className="w-3 h-3 stroke-[2.5]" />
            {Math.abs(stats.absentTodayTrend)}%
          </span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div>
            <p className="text-[11px] text-[#686E7D] dark:text-[#94A3B8]">Pending Classes </p>
            <p className="text-2xl font-bold text-[#12141C] dark:text-white mt-0.5">{stats.absentToday}</p>
          </div>
          {/* Mini Sparkline Red */}
          <svg className="w-20 h-6 text-[#DC5B3E] dark:text-rose-500 stroke-current fill-none stroke-[2]" viewBox="0 0 100 30">
            <path d="M0,15 Q25,28 50,18 T75,25 T100,10" />
          </svg>
        </div>
      </div>

      {/* Card 4: Attendance Rate */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-xl p-3.5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:border-[#D1D5DB] dark:hover:border-[#475569] transition">
        <div className="flex items-start justify-between">
          <div className="w-8 h-8 rounded-lg bg-[#EAF0FE] dark:bg-[#2451D9]/20 text-[#2451D9] dark:text-[#60A5FA] flex items-center justify-center">
            <BarChart3 className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-semibold text-[#16A34A] dark:text-[#4ADE80] flex items-center gap-0.5">
            <ArrowUp className="w-3 h-3 stroke-[2.5]" />
            {Math.abs(stats.attendanceRateTrend)}%
          </span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div>
            <p className="text-[11px] text-[#686E7D] dark:text-[#94A3B8]">Completed Classes</p>
            <p className="text-2xl font-bold text-[#12141C] dark:text-white mt-0.5">{stats.attendanceRate}%</p>
          </div>
          {/* Mini Sparkline Cyan */}
          <svg className="w-20 h-6 text-sky-500 dark:text-sky-400 stroke-current fill-none stroke-[2]" viewBox="0 0 100 30">
            <path d="M0,25 Q30,18 45,22 T75,10 T100,5" />
          </svg>
        </div>
      </div>

      {/* Card 5: Classes Missed */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-xl p-3.5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:border-[#D1D5DB] dark:hover:border-[#475569] transition">
        <div className="flex items-start justify-between">
          <div className="w-8 h-8 rounded-lg bg-[#FDF3E0] dark:bg-[#D97706]/20 text-[#D97706] dark:text-[#FBBF24] flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-semibold text-[#DC5B3E] dark:text-[#F87171] flex items-center gap-0.5">
            <ArrowDown className="w-3 h-3 stroke-[2.5]" />
            {Math.abs(stats.classesMissedTrend)}%
          </span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div>
            <p className="text-[11px] text-[#686E7D] dark:text-[#94A3B8]">Classes Missed</p>
            <p className="text-2xl font-bold text-[#12141C] dark:text-white mt-0.5">{stats.classesMissed}</p>
          </div>
          {/* Mini Sparkline Amber */}
          <svg className="w-20 h-6 text-[#D97706] dark:text-amber-400 stroke-current fill-none stroke-[2]" viewBox="0 0 100 30">
            <path d="M0,22 Q20,18 40,25 T60,15 T80,24 T100,10" />
          </svg>
        </div>
      </div>
    </div>
  );
};
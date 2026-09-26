import React from 'react';
import { Radio, CalendarClock, CheckCircle2, XCircle, Layers, BellRing } from 'lucide-react';
import type { CalendarWeeklyKPISummary } from '../types/calendar-live-class.types';

interface CalendarLiveClassesKPIProps {
  summary: CalendarWeeklyKPISummary;
  onFilterByStatus?: (status: 'all' | 'live' | 'scheduled' | 'completed' | 'cancelled') => void;
}

export const CalendarLiveClassesKPI: React.FC<CalendarLiveClassesKPIProps> = ({ summary, onFilterByStatus }) => {
  return (
    <div id="weekly-summary-kpi-container" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Weekly Summary</h3>
        <span className="text-[11px] font-medium text-gray-400 dark:text-gray-400 bg-gray-100 dark:bg-[#334155] px-2 py-0.5 rounded-full">
          Current View
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div
          id="kpi-total-classes"
          onClick={() => onFilterByStatus?.('all')}
          className="bg-blue-50/60 dark:bg-blue-500/10 hover:bg-blue-50/90 dark:hover:bg-blue-500/15 border border-blue-100 dark:border-blue-500/20 rounded-xl p-3 transition cursor-pointer hover:shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
            <span>Total Classes</span>
            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">
              <Layers className="w-3 h-3" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-950 dark:text-blue-300 group-hover:scale-105 transition-transform origin-left">
            {summary.totalClasses}
          </div>
        </div>

        <div
          id="kpi-calender-views"
          onClick={() => onFilterByStatus?.('live')}
          className="bg-emerald-50/60 dark:bg-emerald-500/10 hover:bg-emerald-50/90 dark:hover:bg-emerald-500/15 border border-emerald-100 dark:border-emerald-500/20 rounded-xl p-3 transition cursor-pointer hover:shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-medium mb-1">
            <span>Live Classes</span>
            <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">
              <Radio className="w-3 h-3 animate-pulse" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-950 dark:text-emerald-300 group-hover:scale-105 transition-transform origin-left">
            {summary.liveClasses}
          </div>
        </div>

        <div
          id="kpi-scheduled-classes"
          onClick={() => onFilterByStatus?.('scheduled')}
          className="bg-purple-50/60 dark:bg-purple-500/10 hover:bg-purple-50/90 dark:hover:bg-purple-500/15 border border-purple-100 dark:border-purple-500/20 rounded-xl p-3 transition cursor-pointer hover:shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-purple-700 dark:text-purple-400 font-medium mb-1">
            <span>Scheduled Classes</span>
            <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 flex items-center justify-center text-[10px] font-bold">
              <CalendarClock className="w-3 h-3" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-950 dark:text-purple-300 group-hover:scale-105 transition-transform origin-left">
            {summary.scheduledClasses}
          </div>
        </div>

        <div
          id="kpi-completed-classes"
          onClick={() => onFilterByStatus?.('completed')}
          className="bg-amber-50/60 dark:bg-amber-500/10 hover:bg-amber-50/90 dark:hover:bg-amber-500/15 border border-amber-100 dark:border-amber-500/20 rounded-xl p-3 transition cursor-pointer hover:shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">
            <span>Completed Classes</span>
            <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-950 dark:text-amber-300 group-hover:scale-105 transition-transform origin-left">
            {summary.completedClasses}
          </div>
        </div>
      </div>

      <div
        id="kpi-cancelled-classes"
        onClick={() => onFilterByStatus?.('cancelled')}
        className="bg-rose-50/60 dark:bg-rose-500/10 hover:bg-rose-50/90 dark:hover:bg-rose-500/15 border border-rose-100 dark:border-rose-500/20 rounded-xl p-3 transition cursor-pointer hover:shadow-xs group flex items-center justify-between"
      >
        <div>
          <span className="text-xs text-rose-700 dark:text-rose-400 font-medium block mb-0.5">Cancelled Classes</span>
          <div className="text-2xl font-bold text-rose-950 dark:text-rose-300 group-hover:scale-105 transition-transform origin-left">
            {summary.cancelledClasses}
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <XCircle className="w-4 h-4" />
        </div>
      </div>

      <div className="bg-indigo-50/70 dark:bg-indigo-500/10 border border-indigo-100/90 dark:border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-950 dark:text-indigo-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <BellRing className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold block text-indigo-900 dark:text-indigo-200">Auto-Reminders Active</span>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400">Dispatched today: {summary.remindersSentToday} alerts</span>
          </div>
        </div>
        <span className="bg-white/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-semibold px-2 py-0.5 rounded-full text-[11px]">
          {summary.upcomingRemindersCount} Queued
        </span>
      </div>
    </div>
  );
};
import React from 'react';
import { Search, ChevronDown, RotateCcw, Filter } from 'lucide-react';
import type { CalendarLiveClassesFilterState, CalendarClassStatus } from '../types/calendar-live-class.types';
import { CALENDAR_INITIAL_TEACHERS } from '../data/CalendarInitialLiveClasses';
import { CalendarRangePicker } from './CalendarRangePicker';

interface CalendarLiveClassesFiltersProps {
  filters: CalendarLiveClassesFilterState;
  onFilterChange: (newFilters: CalendarLiveClassesFilterState) => void;
  onResetFilters: () => void;
  onSyncDates?: () => void;
}

export const CalendarLiveClassesFilters: React.FC<CalendarLiveClassesFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  onSyncDates,
}) => {
  return (
    <div
      id="calender-views-filters-container"
      className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200/80 dark:border-[#334155] p-3 shadow-xs flex flex-wrap items-center gap-2.5 transition-all"
    >
      <div className="relative flex-1 min-w-[200px] sm:min-w-[240px]">
        <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          id="filter-search-input"
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
          placeholder="Search classes / teachers"
          className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50/70 dark:bg-[#0F172A] border border-gray-200 dark:border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      <div className="relative min-w-[140px] sm:min-w-[150px]">
        <select
          id="filter-teacher-select"
          value={filters.teacherId}
          onChange={(e) => onFilterChange({ ...filters, teacherId: e.target.value })}
          className="w-full appearance-none bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#334155] rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 dark:text-gray-200 font-medium hover:border-gray-300 dark:hover:border-[#3f4f68] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
        >
          <option value="all">All Teachers</option>
          {CALENDAR_INITIAL_TEACHERS.map((teacher) => (
            <option key={teacher.id} value={teacher.name}>
              {teacher.name} ({teacher.subject})
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      <div className="relative min-w-[130px] sm:min-w-[140px]">
        <select
          id="filter-course-select"
          value={filters.courseId}
          onChange={(e) => onFilterChange({ ...filters, courseId: e.target.value })}
          className="w-full appearance-none bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#334155] rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 dark:text-gray-200 font-medium hover:border-gray-300 dark:hover:border-[#3f4f68] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
        >
          <option value="all">All Courses</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
          <option value="Chemistry">Chemistry</option>
          <option value="Biology">Biology</option>
          <option value="English">English</option>
        </select>
        <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      <div className="relative min-w-[120px] sm:min-w-[130px]">
        <select
          id="filter-status-select"
          value={filters.status}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value as 'all' | CalendarClassStatus })}
          className="w-full appearance-none bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#334155] rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 dark:text-gray-200 font-medium hover:border-gray-300 dark:hover:border-[#3f4f68] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="live">● Live</option>
          <option value="scheduled">● Scheduled</option>
          <option value="completed">● Completed</option>
          <option value="cancelled">● Cancelled</option>
        </select>
        <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      <CalendarRangePicker
        startDate={filters.dateRange?.start || '2026-08-01'}
        endDate={filters.dateRange?.end || '2026-08-31'}
        onChange={(start, end) => {
          onFilterChange({
            ...filters,
            dateRange: { start, end },
          });
        }}
        onReset={
          onSyncDates
            ? onSyncDates
            : () => {
                onFilterChange({
                  ...filters,
                  dateRange: { start: '2026-08-01', end: '2026-08-31' },
                });
              }
        }
      />

      <div className="flex items-center gap-2 ml-auto">
        <button
          id="filter-submit-btn"
          type="button"
          onClick={() => {}}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-lg shadow-xs transition hover:shadow cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5" />
          Filter
        </button>

        <button
          id="filter-clear-btn"
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-[#334155] hover:bg-gray-200 dark:hover:bg-[#3f4f68] text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-medium px-3.5 py-2 rounded-lg transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          Reset
        </button>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Search, Calendar, ChevronDown, RotateCcw, Filter } from 'lucide-react';
import type { FilterState } from '../types/live-class.types';
import { INSTRUCTORS, CATEGORIES, COURSES, PLATFORMS, STATUSES } from '../data/InitialLiveClasses';

interface LiveClassesFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  totalFilteredCount: number;
}

export const LiveClassesFilters: React.FC<LiveClassesFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const orderOptions = [
    { label: 'Order by: Newest First', value: 'newest' },
    { label: 'Order by: Oldest First', value: 'oldest' },
    { label: 'Order by: Most Students', value: 'students_desc' },
    { label: 'Order by: Duration (High to Low)', value: 'duration_desc' },
  ];

  const selectClasses =
    'h-10 w-full appearance-none rounded-lg border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] px-3.5 pr-8 text-xs text-slate-700 dark:text-gray-300 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer';

  return (
    <div className="rounded-xl border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#1E293B] p-4 sm:p-5 shadow-2xs">
      <div className="space-y-3.5">
        {/* Row 1: Search, Date Range, Platform, Instructor */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="Search live class title, instructor..."
              className="h-10 w-full rounded-lg border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] pl-3.5 pr-9 text-xs text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500 pointer-events-none" />
          </div>

          {/* Date Range Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex h-10 w-full items-center justify-between rounded-lg border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] px-3.5 text-xs text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-[#0F172A]/70 transition-colors"
            >
              <span className={filters.dateRange ? 'font-medium text-slate-900 dark:text-gray-100' : 'text-slate-500 dark:text-gray-400'}>
                {filters.dateRange || 'Date range'}
              </span>
              <Calendar className="h-4 w-4 text-slate-400 dark:text-gray-500" />
            </button>

            {showDatePicker && (
              <div className="absolute left-0 top-11 z-40 w-64 rounded-xl border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#1E293B] p-3 shadow-xl animate-in fade-in zoom-in-95">
                <div className="mb-2 text-xs font-bold text-slate-900 dark:text-gray-100">Select Date Range</div>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onFilterChange({ dateRange: '' });
                      setShowDatePicker(false);
                    }}
                    className="w-full text-left rounded-md px-2 py-1 text-xs text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#0F172A]"
                  >
                    All Dates
                  </button>
                  <button
                    onClick={() => {
                      onFilterChange({ dateRange: 'Today (Aug 11, 2026)' });
                      setShowDatePicker(false);
                    }}
                    className="w-full text-left rounded-md px-2 py-1 text-xs text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#0F172A]"
                  >
                    Today (Aug 11, 2026)
                  </button>
                  <button
                    onClick={() => {
                      onFilterChange({ dateRange: 'This Week (Aug 10 - 16)' });
                      setShowDatePicker(false);
                    }}
                    className="w-full text-left rounded-md px-2 py-1 text-xs text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#0F172A]"
                  >
                    This Week (Aug 10 - 16, 2026)
                  </button>
                  <button
                    onClick={() => {
                      onFilterChange({ dateRange: 'Aug 2026' });
                      setShowDatePicker(false);
                    }}
                    className="w-full text-left rounded-md px-2 py-1 text-xs text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#0F172A]"
                  >
                    Month of August 2026
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Platform Dropdown */}
          <div className="relative">
            <select
              value={filters.platform}
              onChange={(e) => onFilterChange({ platform: e.target.value })}
              className={selectClasses}
            >
              {PLATFORMS.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500 pointer-events-none" />
          </div>

          {/* Instructor Dropdown */}
          <div className="relative">
            <select
              value={filters.instructor}
              onChange={(e) => onFilterChange({ instructor: e.target.value })}
              className={selectClasses}
            >
              <option value="All Instructors">All Instructors</option>
              {INSTRUCTORS.map((instructor) => (
                <option key={instructor.id} value={instructor.name}>
                  {instructor.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Row 2: Status, Category, Course, Order By — equal-width, no action buttons here */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              className={selectClasses}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500 pointer-events-none" />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={filters.category}
              onChange={(e) => onFilterChange({ category: e.target.value })}
              className={selectClasses}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500 pointer-events-none" />
          </div>

          {/* Course Dropdown */}
          <div className="relative">
            <select
              value={filters.course}
              onChange={(e) => onFilterChange({ course: e.target.value })}
              className={selectClasses}
            >
              {COURSES.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500 pointer-events-none" />
          </div>

          {/* Order By Dropdown */}
          <div className="relative">
            <select
              value={filters.orderBy}
              onChange={(e) => onFilterChange({ orderBy: e.target.value })}
              className={selectClasses}
            >
              {orderOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Row 3: Reset & Filter — own row, right-aligned */}
        <div className="flex items-center gap-3 pt-1 justify-end">
          <button
            type="button"
            onClick={onReset}
            className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] px-4 text-xs font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-2xs cursor-pointer"
            title="Reset all filters"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500 dark:text-gray-400" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Filter</span>
          </button>
        </div>
      </div>
    </div>
  );
};
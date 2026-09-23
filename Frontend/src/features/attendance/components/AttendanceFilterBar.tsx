import React, { useState } from 'react';
import { Search, Calendar, ChevronDown, RotateCcw, Filter } from 'lucide-react';
import type { AttendanceFilterState } from '../types';

interface AttendanceFilterBarProps {
  filters: AttendanceFilterState;
  onFilterChange: (field: keyof AttendanceFilterState, value: string) => void;
  onReset: () => void;
  onApplyFilter: () => void;
}

const CLASS_OPTIONS = ['Class / Course: All Classes', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

const SUBJECT_OPTIONS = [
  'Subject: All Subjects',
  'English',
  'Maths',
  'Physics',
  'Science',
  'Chemistry',
  'Biology',
  'Hindi',
  'Social Science',
];

const STATUS_OPTIONS = ['All', 'Present', 'Absent'];

const REASON_OPTIONS = [
  'All Reasons',
  'Completed 45 min',
  'Completed 40+ min',
  'Below 40 min',
  'Did not join',
  'Class cancelled',
];

const INSTRUCTOR_OPTIONS = [
  'All Instructors',
  'Rahul Singh',
  'Yash Sharma',
  'Pooja Singh',
  'Amit Kumar',
  'Neha Verma',
  'Sandeep Yadav',
  'Priya Patel',
  'Vikash Kumar',
  'Anjali Sharma',
];

export const AttendanceFilterBar: React.FC<AttendanceFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  onApplyFilter,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const selectClasses =
    'h-10 w-full appearance-none rounded-lg border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] px-3.5 pr-8 text-xs text-slate-700 dark:text-gray-300 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer';

  return (
    <div id="attendance-filter-panel" className="rounded-xl border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#1E293B] p-4 sm:p-5 shadow-2xs">
      <div className="space-y-3.5">
        {/* Row 1: Search, Date Range, Class/Course, Subject */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Input */}
          <div className="relative">
            <input
              id="search-teacher-input"
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange('searchQuery', e.target.value)}
              placeholder="Search teacher by name..."
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
              <span className={filters.dateRange ? 'font-medium text-slate-900 dark:text-gray-100 truncate' : 'text-slate-500 dark:text-gray-400'}>
                {filters.dateRange || 'Date range'}
              </span>
              <Calendar className="h-4 w-4 text-slate-400 dark:text-gray-500 shrink-0" />
            </button>

            {showDatePicker && (
              <div className="absolute left-0 top-11 z-40 w-64 rounded-xl border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#1E293B] p-3 shadow-xl animate-in fade-in zoom-in-95">
                <div className="mb-2 text-xs font-bold text-slate-900 dark:text-gray-100">Select Date Range</div>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onFilterChange('dateRange', '');
                      setShowDatePicker(false);
                    }}
                    className="w-full text-left rounded-md px-2 py-1 text-xs text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#0F172A]"
                  >
                    All Dates
                  </button>
                  <button
                    onClick={() => {
                      onFilterChange('dateRange', 'Today (22 Sep, 2026)');
                      setShowDatePicker(false);
                    }}
                    className="w-full text-left rounded-md px-2 py-1 text-xs text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#0F172A]"
                  >
                    Today (22 Sep, 2026)
                  </button>
                  <button
                    onClick={() => {
                      onFilterChange('dateRange', 'This Week (21 - 27 Sep)');
                      setShowDatePicker(false);
                    }}
                    className="w-full text-left rounded-md px-2 py-1 text-xs text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#0F172A]"
                  >
                    This Week (21 - 27 Sep, 2026)
                  </button>
                  <button
                    onClick={() => {
                      onFilterChange('dateRange', '01 Sep 2026 - 30 Sep 2026');
                      setShowDatePicker(false);
                    }}
                    className="w-full text-left rounded-md px-2 py-1 text-xs text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#0F172A]"
                  >
                    Month of September 2026
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Class / Course Dropdown */}
          <div className="relative">
            <select
              id="filter-class-course"
              value={filters.classCourse}
              onChange={(e) => onFilterChange('classCourse', e.target.value)}
              className={selectClasses}
            >
              {CLASS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500 pointer-events-none" />
          </div>

          {/* Subject Dropdown */}
          <div className="relative">
            <select
              id="filter-subject"
              value={filters.subject}
              onChange={(e) => onFilterChange('subject', e.target.value)}
              className={selectClasses}
            >
              {SUBJECT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Row 2: Status, Reason, Instructor — equal-width, no action buttons here */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Status Dropdown */}
          <div className="relative">
            <select
              id="filter-status"
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className={selectClasses}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === 'All' ? 'Attendance Status: All' : status}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500 pointer-events-none" />
          </div>

          {/* Reason Dropdown */}
          <div className="relative">
            <select
              id="filter-reason"
              value={filters.reason}
              onChange={(e) => onFilterChange('reason', e.target.value)}
              className={selectClasses}
            >
              {REASON_OPTIONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500 pointer-events-none" />
          </div>

          {/* Instructor Dropdown */}
          <div className="relative">
            <select
              id="filter-instructor"
              value={filters.instructor}
              onChange={(e) => onFilterChange('instructor', e.target.value)}
              className={selectClasses}
            >
              {INSTRUCTOR_OPTIONS.map((instructor) => (
                <option key={instructor} value={instructor}>
                  {instructor}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Row 3: Reset & Filter — own row, right-aligned */}
        <div className="flex items-center gap-3 pt-1 justify-end">
          <button
            id="reset-filters-btn"
            type="button"
            onClick={onReset}
            className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] px-4 text-xs font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-2xs cursor-pointer"
            title="Reset all filters"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500 dark:text-gray-400" />
            <span>Reset</span>
          </button>

          <button
            id="apply-filter-btn"
            type="button"
            onClick={onApplyFilter}
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
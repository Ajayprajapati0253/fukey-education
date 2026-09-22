import React from 'react';
import { Search, Calendar, Info, RotateCcw, Filter } from 'lucide-react';
import { Dropdown } from '../../../components/ui/Dropdown';
import {
  CATEGORIES, INSTRUCTORS, LEVELS, LANGUAGES, STATUSES,
  APPROVAL_STATUSES, COURSE_TYPES, ORDER_OPTIONS,
} from '../data/InitialCourses';
import type { CourseFilterState } from '../types/course.types';

interface CourseFiltersProps {
  filters: CourseFilterState;
  setFilters: React.Dispatch<React.SetStateAction<CourseFilterState>>;
  onReset: () => void;
  onApplyFilter: () => void;
  filteredCount: number;
}

const toOptions = (values: string[]) => values.map((v) => ({ value: v, label: v }));

export const CourseFilters: React.FC<CourseFiltersProps> = ({
  filters, setFilters, onReset, onApplyFilter,
}) => {
  const handleChange = (field: keyof CourseFilterState, value: string | number) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#e2e8f0] dark:border-[#334155] p-4 sm:p-5 mb-6 shadow-2xs">
      {/* Row 1: Search, Date, Category, Instructor */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="relative">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search course title, ID..."
            className="w-full pl-3 pr-10 py-2 bg-white dark:bg-[#0F172A] border border-[#e2e8f0] dark:border-[#334155] rounded-lg text-sm text-[#0f172a] dark:text-gray-100 focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] placeholder-slate-400 dark:placeholder-gray-500 outline-hidden transition-all"
          />
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative">
          <input
            type="date"
            value={filters.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full pl-3 pr-10 py-2 bg-white dark:bg-[#0F172A] border border-[#e2e8f0] dark:border-[#334155] rounded-lg text-sm text-[#0f172a] dark:text-gray-100 focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] outline-hidden transition-all [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
          <Calendar className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <Dropdown size="lg" options={toOptions(CATEGORIES)} value={filters.category} onChange={(v) => handleChange('category', v)} className="w-full" />
        <Dropdown size="lg" options={toOptions(INSTRUCTORS)} value={filters.instructor} onChange={(v) => handleChange('instructor', v)} className="w-full" />
      </div>

      {/* Row 2: Level, Language, Status, Approval Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
        <Dropdown size="lg" options={toOptions(LEVELS)} value={filters.level} onChange={(v) => handleChange('level', v)} className="w-full" />
        <Dropdown size="lg" options={toOptions(LANGUAGES)} value={filters.language} onChange={(v) => handleChange('language', v)} className="w-full" />
        <Dropdown size="lg" options={toOptions(STATUSES)} value={filters.status} onChange={(v) => handleChange('status', v)} className="w-full" />
        <Dropdown size="lg" options={toOptions(APPROVAL_STATUSES)} value={filters.approvalStatus} onChange={(v) => handleChange('approvalStatus', v)} className="w-full" />
      </div>

      {/* Row 3: Course Type, Order By, Per Page, Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
        <Dropdown
          size="lg"
          icon={<Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
          options={toOptions(COURSE_TYPES)}
          value={filters.courseType}
          onChange={(v) => handleChange('courseType', v)}
          className="w-full"
        />

        <Dropdown
          size="lg"
          options={ORDER_OPTIONS}
          value={filters.orderBy}
          onChange={(v) => handleChange('orderBy', v)}
          className="w-full"
        />

        <div className="flex items-center border border-[#e2e8f0] dark:border-[#334155] rounded-lg bg-white dark:bg-[#0F172A] overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-[#3b82f6] w-full">
          <span className="pl-3 text-sm text-[#64748b] dark:text-gray-400 whitespace-nowrap">Per Page</span>
          <select
              value={filters.perPage}
              onChange={(e) => handleChange('perPage', Number(e.target.value))}
              className="w-full pl-2 pr-3 py-2 bg-white dark:bg-[#0F172A] border-none text-sm text-slate-700 dark:text-gray-200 outline-hidden cursor-pointer"
            >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n} className="bg-white dark:bg-[#0F172A] text-slate-700 dark:text-gray-200">
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 justify-end w-full">
          <button
            onClick={onReset}
            className="px-4 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /><span>Reset</span>
          </button>
          <button
            onClick={onApplyFilter}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 dark:bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>
    </div>
  );
};
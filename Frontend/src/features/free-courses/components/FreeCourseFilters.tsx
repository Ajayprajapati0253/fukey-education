import React, { useState } from 'react';
import { Search, Calendar, RotateCcw, ChevronDown, Info } from 'lucide-react';
import type { FreeCourseFiltersState } from '../types/free-course.types';

interface FreeCourseFiltersProps {
  filters: FreeCourseFiltersState;
  onFilterChange: (filters: Partial<FreeCourseFiltersState>) => void;
  onReset: () => void;
  availableSubjects: string[];
  availableInstructors: { id: string; name: string }[];
}

const fieldCls =
  'w-full bg-white dark:bg-[#0B0F19] border border-[#e2e8f0] dark:border-[#374151] rounded-xl text-xs text-[#0f172a] dark:text-gray-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#3b82f6] transition-colors';
const selectCls = `${fieldCls} px-3.5 py-2.5 pr-8 appearance-none cursor-pointer`;
const inputCls = `${fieldCls} pl-3.5 pr-10 py-2.5`;
const chevronCls = 'w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none';

export const FreeCourseFilters: React.FC<FreeCourseFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  availableSubjects,
  availableInstructors,
}) => {
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [localDate, setLocalDate] = useState(filters.dateRange);

  const handleApply = () => {
    onFilterChange({
      search: localSearch,
      dateRange: localDate,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  const handleResetAll = () => {
    setLocalSearch('');
    setLocalDate('');
    onReset();
  };

  const isAnyFilterActive =
    filters.search.trim().length > 0 ||
    localSearch.trim().length > 0 ||
    filters.dateRange.trim().length > 0 ||
    localDate.trim().length > 0 ||
    filters.targetClass !== 'All' ||
    filters.subject !== 'All' ||
    filters.instructorId !== 'All' ||
    filters.language !== 'All' ||
    filters.status !== 'All' ||
    filters.approvalStatus !== 'All' ||
    filters.courseType !== 'All' ||
    filters.sortBy !== 'newest';

  return (
    <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-2xl p-4 lg:p-5 shadow-sm dark:shadow-lg space-y-3.5 mb-6">
      {/* Row 1: Search, Date, Target Class, Instructor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search free course title, ID..."
            className={inputCls}
          />
          <button
            type="button"
            onClick={handleApply}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-[#12141C] dark:hover:text-white transition-colors cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={localDate}
            onChange={(e) => setLocalDate(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="dd-mm-yyyy"
            className={inputCls}
          />
          <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={filters.targetClass}
            onChange={(e) => onFilterChange({ targetClass: e.target.value })}
            className={selectCls}
          >
            <option value="All">All Classes (9th - 12th)</option>
            <option value="Class 9">Class 9th</option>
            <option value="Class 10">Class 10th</option>
            <option value="Class 11">Class 11th</option>
            <option value="Class 12">Class 12th</option>
          </select>
          <ChevronDown className={chevronCls} />
        </div>

        <div className="relative">
          <select
            value={filters.instructorId}
            onChange={(e) => onFilterChange({ instructorId: e.target.value })}
            className={selectCls}
          >
            <option value="All">All Instructors</option>
            {availableInstructors.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </select>
          <ChevronDown className={chevronCls} />
        </div>
      </div>

      {/* Row 2: Subject, Language, Status, Approval Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <select
            value={filters.subject}
            onChange={(e) => onFilterChange({ subject: e.target.value })}
            className={selectCls}
          >
            <option value="All">All Subjects</option>
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
          <ChevronDown className={chevronCls} />
        </div>

        <div className="relative">
          <select
            value={filters.language}
            onChange={(e) => onFilterChange({ language: e.target.value })}
            className={selectCls}
          >
            <option value="All">All Languages</option>
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
            <option value="Hinglish">Hinglish</option>
            <option value="Urdu">Urdu</option>
          </select>
          <ChevronDown className={chevronCls} />
        </div>

        <div className="relative">
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className={selectCls}
          >
            <option value="All">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
          <ChevronDown className={chevronCls} />
        </div>

        <div className="relative">
          <select
            value={filters.approvalStatus}
            onChange={(e) => onFilterChange({ approvalStatus: e.target.value })}
            className={selectCls}
          >
            <option value="All">All Approval Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending Review</option>
          </select>
          <ChevronDown className={chevronCls} />
        </div>
      </div>

      {/* Row 3: Course Type, Order By, Per Page, Reset */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        <div className="relative lg:col-span-3">
          <div className="relative flex items-center">
            <Info className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <select
              value={filters.courseType}
              onChange={(e) => onFilterChange({ courseType: e.target.value })}
              className={`${fieldCls} pl-8 pr-8 py-2.5 appearance-none cursor-pointer`}
            >
              <option value="All">Course Type: All Types</option>
              <option value="Foundation">Foundation</option>
              <option value="Crash Course">Crash Course</option>
              <option value="Board Prep">Board Prep</option>
              <option value="Concept Revision">Concept Revision</option>
              <option value="Full Syllabus">Full Syllabus</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
          </div>
        </div>

        <div className="relative lg:col-span-3">
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as FreeCourseFiltersState['sortBy'] })}
            className={selectCls}
          >
            <option value="newest">Order By: Newest First</option>
            <option value="oldest">Order By: Oldest First</option>
            <option value="title_asc">Title: A to Z</option>
            <option value="title_desc">Title: Z to A</option>
            <option value="enrollments_desc">Most Enrolled</option>
          </select>
          <ChevronDown className={chevronCls} />
        </div>

        <div className="relative lg:col-span-2">
          <select
            value={filters.perPage}
            onChange={(e) => onFilterChange({ perPage: Number(e.target.value) })}
            className={selectCls}
          >
            <option value={10}>Per Page 10</option>
            <option value={25}>Per Page 25</option>
            <option value={50}>Per Page 50</option>
            <option value={100}>Per Page 100</option>
          </select>
          <ChevronDown className={chevronCls} />
        </div>

        <div className="flex items-center gap-2 lg:col-span-4 justify-end">
          <button
            type="button"
            onClick={handleResetAll}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              isAnyFilterActive
                ? 'bg-rose-50 border border-rose-300 text-rose-600 hover:bg-rose-100 dark:bg-rose-600/20 dark:border-rose-500/60 dark:text-rose-300 dark:hover:bg-rose-600/30 font-bold shadow-md dark:shadow-rose-950/40'
                : 'border border-[#E6E8EE] dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#12141C] dark:hover:text-white'
            }`}
          >
            <RotateCcw
              className={`w-3.5 h-3.5 ${isAnyFilterActive ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400'}`}
            />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
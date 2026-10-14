import { useState, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { Search, RotateCcw, Calendar, Filter } from 'lucide-react';
import type { InstructorFilterParams } from '../types/instructor';
import { DEFAULT_FILTERS } from '../hooks/useInstructors';

interface InstructorFiltersProps {
  filters: InstructorFilterParams;
  onApplyFilters: (newFilters: InstructorFilterParams) => void;
  onResetFilters: () => void;
}

export function InstructorFilters({
  filters,
  onApplyFilters,
  onResetFilters,
}: InstructorFiltersProps) {
  // Local draft state for filters - only applied when user clicks "Filter"
  const [draftFilters, setDraftFilters] = useState<InstructorFilterParams>(filters);

  // Sync draft state if external filters change (e.g. from KPI cards or reset)
  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const handleChange = (key: keyof InstructorFilterParams, value: string) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(draftFilters);
  };

  const handleReset = () => {
    setDraftFilters(DEFAULT_FILTERS);
    onResetFilters();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  const classOptions = ['All Classes', '9th', '10th', '11th', '12th'];
  const mediumOptions = ['All Mediums', 'Hindi & English Both', 'Hindi Medium', 'English Medium'];
  const statusOptions = ['All Status', 'Active', 'Inactive', 'Pending', 'Suspended'];
  const verificationOptions = ['All Verification', 'Verified', 'Unverified', 'Pending'];
  const subjectOptions = [
    'All Subjects',
    'Physics',
    'Chemistry',
    'Mathematics',
    'Biology',
    'English',
    'Hindi',
    'Science',
    'Computer Science',
    'History',
    'Economics',
  ];
  const courseOptions = [
    'All Courses',
    'Class 10 Mathematics (Hindi & English Medium)',
    'Class 12 Advanced Physics (Bilingual)',
    'Class 11 Physics Foundation (Hindi & English)',
    'Class 12 Chemistry Organic & Inorganic (Hindi & English)',
    'Class 9 Science Complete (Hindi & English Medium)',
    'Class 10 English Literature & Grammar (Hindi & English)',
    'Class 11-12 Python for Computer Science (Hindi & English)',
    'Class 12 Biology Genetics & Ecology (Hindi & English)',
    'Class 10 Hindi Vyakaran & Sahitya (Hindi & English Medium)',
  ];
  const teachingTypeOptions = ['All Types', 'Online', 'Offline', 'Hybrid'];
  const sortByOptions = [
    { value: 'newest', label: 'Newest Joined' },
    { value: 'oldest', label: 'Oldest Joined' },
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'students_desc', label: 'Most Students' },
    { value: 'attendance_desc', label: 'Highest Attendance' },
  ];

  return (
    <div className="bg-white dark:bg-[#111c34] border border-slate-200/80 dark:border-[#1e2c4c] rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Row 1: Search + Class (9th-12th) + Medium (Hindi & English Both) + Subject + Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-3 sm:gap-3.5">
        {/* Search */}
        <div className="lg:col-span-4">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Search Instructor
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={draftFilters.searchQuery}
              onChange={(e) => handleChange('searchQuery', e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by name, email, phone, subject..."
              className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg pl-9 pr-3 py-2 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Class Level (9th to 12th) */}
        <div className="lg:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Class (9th - 12th)
          </label>
          <select
            value={draftFilters.classLevel}
            onChange={(e) => handleChange('classLevel', e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all cursor-pointer font-medium"
          >
            {classOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-white dark:bg-[#111c34]">
                {opt === 'All Classes' ? 'All Classes (9-12)' : `Class ${opt}`}
              </option>
            ))}
          </select>
        </div>

        {/* Medium (Hindi & English Both) */}
        <div className="lg:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Teaching Medium
          </label>
          <select
            value={draftFilters.medium}
            onChange={(e) => handleChange('medium', e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all cursor-pointer font-medium"
          >
            {mediumOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-white dark:bg-[#111c34]">
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div className="lg:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Subject
          </label>
          <select
            value={draftFilters.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all cursor-pointer"
          >
            {subjectOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-white dark:bg-[#111c34]">
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="lg:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Status
          </label>
          <select
            value={draftFilters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all cursor-pointer"
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-white dark:bg-[#111c34]">
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Verification + Course + Teaching Type + Joined Date + Sort By */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-3 sm:gap-3.5 items-end">
        {/* Verification */}
        <div className="lg:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Verification
          </label>
          <select
            value={draftFilters.verification}
            onChange={(e) => handleChange('verification', e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all cursor-pointer"
          >
            {verificationOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-white dark:bg-[#111c34]">
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Course */}
        <div className="lg:col-span-3">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Course / Batch
          </label>
          <select
            value={draftFilters.course}
            onChange={(e) => handleChange('course', e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all cursor-pointer"
          >
            {courseOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-white dark:bg-[#111c34]">
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Teaching Type */}
        <div className="lg:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Teaching Type
          </label>
          <select
            value={draftFilters.teachingType}
            onChange={(e) => handleChange('teachingType', e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all cursor-pointer"
          >
            {teachingTypeOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-white dark:bg-[#111c34]">
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Joined Date */}
        <div className="lg:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Joined Date
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Select date"
              value={draftFilters.joinedDateRange}
              onChange={(e) => handleChange('joinedDateRange', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg pl-3 pr-8 py-2 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
            />
            <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Sort By */}
        <div className="lg:col-span-3">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Sort By
          </label>
          <select
            value={draftFilters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all cursor-pointer"
          >
            {sortByOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#111c34]">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bottom Action Bar: Reset & Filter Buttons Side-by-Side at Bottom */}
      <div className="pt-3 border-t border-slate-100 dark:border-[#1e2c4c] flex items-center justify-end gap-2.5">
        {/* Reset Button */}
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
          title="Reset all filters to default"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset</span>
        </button>

        {/* Filter Button */}
        <button
          type="button"
          onClick={handleApply}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-all shadow-sm shadow-blue-600/30 cursor-pointer"
          title="Apply selected filters"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filter</span>
        </button>
      </div>
    </div>
  );
}

import React from 'react';
import {
  Search,
  RotateCcw,
  LayoutGrid,
  LayoutList,
  ListOrdered,
  ChevronDown,
  ArrowUpDown,
} from 'lucide-react';
import type { DifficultyLevel, MaterialFilterState, MaterialStatus, MaterialType } from '../types';

interface FilterBarProps {
  filters: MaterialFilterState;
  onFilterChange: (updates: Partial<MaterialFilterState>) => void;
  onResetFilters: () => void;
  availableSubjects: string[];
  availableGrades: string[];
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  onOpenReorder: () => void;
  totalFiltered: number;
  activeCategoryLabel?: string;
}

const SELECT =
  'w-full text-xs bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] hover:border-slate-300 dark:hover:border-slate-500 text-slate-800 dark:text-gray-200 font-medium rounded-xl px-3.5 py-2 pr-8 appearance-none focus:outline-none focus:bg-white dark:focus:bg-[#0F172A] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-all';
const CHEVRON =
  'w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none';

export const StudyMaterialsFilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableSubjects,
  availableGrades,
  viewMode,
  onViewModeChange,
  onOpenReorder,
  totalFiltered,
  activeCategoryLabel,
}) => {
  const isFiltered = Boolean(
    filters.searchQuery ||
      (filters.type && filters.type !== 'all') ||
      filters.subject !== 'All' ||
      filters.grade !== 'All' ||
      filters.status !== 'all' ||
      filters.difficulty !== 'All' ||
      filters.showArchived ||
      filters.sortBy !== 'order'
  );

  return (
    <div className="space-y-3 mb-4">
      {/* Study Filters Card */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        {/* Search */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title, chapter, subject, author, tags..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-16 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-800 dark:text-gray-100 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#0F172A] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-2xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white px-1.5 py-0.5 rounded cursor-pointer transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1 border-t border-slate-100 dark:border-[#334155]/60">
          {/* Type */}
          <div>
            {activeCategoryLabel ? (
              <div className="flex items-center justify-between w-full bg-blue-50 dark:bg-brand/20 border border-blue-200 dark:border-brand/40 text-blue-700 dark:text-[#60A5FA] text-xs font-bold rounded-xl px-3.5 py-2 shadow-2xs">
                <span className="truncate">{activeCategoryLabel}</span>
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
              </div>
            ) : (
              <div className="relative">
                <select
                  value={filters.type || 'all'}
                  onChange={(e) => onFilterChange({ type: e.target.value as MaterialType | 'all' })}
                  className={SELECT}
                >
                  <option value="all">All Study Materials</option>
                  <option value="notes">Notes</option>
                  <option value="practice-questions">Practice Questions</option>
                  <option value="formula-sheets">Formula Sheets</option>
                  <option value="mcq">MCQ Bank</option>
                  <option value="important-questions">Important Questions</option>
                  <option value="sample-papers">Sample Papers</option>
                  <option value="test-series">Test Series</option>
                  <option value="question-bank">Question Bank</option>
                </select>
                <ChevronDown className={CHEVRON} />
              </div>
            )}
          </div>

          {/* Subject */}
          <div>
            <div className="relative">
              <select
                value={filters.subject}
                onChange={(e) => onFilterChange({ subject: e.target.value })}
                className={SELECT}
              >
                <option value="All">All Subjects</option>
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
              <ChevronDown className={CHEVRON} />
            </div>
          </div>

          {/* Grade */}
          <div>
            <div className="relative">
              <select
                value={filters.grade}
                onChange={(e) => onFilterChange({ grade: e.target.value })}
                className={SELECT}
              >
                <option value="All">All Grades/Classes</option>
                <option value="Class 9th">Class 9th</option>
                <option value="Class 10th">Class 10th</option>
                <option value="Class 11th">Class 11th</option>
                <option value="Class 12th">Class 12th</option>
                {availableGrades
                  .filter((g) => !['Class 9th', 'Class 10th', 'Class 11th', 'Class 12th'].includes(g))
                  .map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
              </select>
              <ChevronDown className={CHEVRON} />
            </div>
          </div>

          {/* Status */}
          <div>
            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) => onFilterChange({ status: e.target.value as MaterialStatus | 'all' })}
                className={SELECT}
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <ChevronDown className={CHEVRON} />
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <div className="relative">
              <select
                value={filters.difficulty}
                onChange={(e) => onFilterChange({ difficulty: e.target.value as DifficultyLevel })}
                className={SELECT}
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <ChevronDown className={CHEVRON} />
            </div>
          </div>

          {/* Sort By */}
          <div>
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => onFilterChange({ sortBy: e.target.value as MaterialFilterState['sortBy'] })}
                className={SELECT}
              >
                <option value="order">Display Sequence</option>
                <option value="title">Title (A-Z)</option>
                <option value="updatedAt">Last Updated</option>
                <option value="createdAt">Date Created</option>
                <option value="downloads">Total Downloads</option>
                <option value="views">Total Views</option>
              </select>
              <ChevronDown className={CHEVRON} />
            </div>
          </div>
        </div>

        {/* Bottom Controls Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-[#334155]/60 text-xs text-slate-600 dark:text-gray-400">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters.showArchived}
                onChange={(e) => onFilterChange({ showArchived: e.target.checked })}
                className="rounded border-slate-300 dark:border-slate-600 dark:bg-[#0F172A] text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
              />
              <span className="font-medium text-slate-700 dark:text-gray-300">Include Archived</span>
            </label>

            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>

            <button
              type="button"
              onClick={() => onFilterChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-slate-50 dark:bg-[#0F172A] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-[#334155] rounded-lg transition-colors cursor-pointer shadow-2xs"
              title={filters.sortOrder === 'asc' ? 'Switch to Descending' : 'Switch to Ascending'}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 dark:text-gray-400" />
              <span>{filters.sortOrder === 'asc' ? 'Ascending (▲)' : 'Descending (▼)'}</span>
            </button>
          </div>

          <div className="self-end sm:self-auto">
            {isFiltered ? (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-300 hover:text-rose-700 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 rounded-xl transition-all cursor-pointer shadow-2xs"
                title="Reset all active filters"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                <span>Reset Filters</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-[#334155] rounded-xl opacity-60 cursor-not-allowed"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>No Filters Active</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 pt-0.5">
        <div className="text-xs text-slate-500 dark:text-gray-400 font-medium">
          Showing{' '}
          <strong className="text-slate-900 dark:text-gray-100 font-bold">{totalFiltered}</strong> study material
          {totalFiltered === 1 ? '' : 's'}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={onOpenReorder}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-gray-300 bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-[#334155] rounded-xl transition-colors cursor-pointer shadow-2xs"
            title="Reorder display sequence for students"
          >
            <ListOrdered className="w-4 h-4 text-blue-600 dark:text-[#60A5FA]" />
            <span>Reorder Sequence</span>
          </button>

          <div className="flex items-center border border-slate-200 dark:border-[#334155] rounded-xl p-0.5 bg-white dark:bg-[#0F172A] shadow-2xs">
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-blue-50 dark:bg-brand/20 shadow-2xs text-blue-600 dark:text-[#60A5FA]'
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-blue-50 dark:bg-brand/20 shadow-2xs text-blue-600 dark:text-[#60A5FA]'
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
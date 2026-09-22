import React from 'react';
import { Search, RotateCcw, Filter as FilterIcon, X } from 'lucide-react';
import { Dropdown } from '../../../components/ui/Dropdown';
import { AUTHORS, CATEGORIES } from '../data/InitialPosts';
import type { PostFilterOptions } from '../types/post.types';

interface FilterSectionProps {
  filters: PostFilterOptions;
  onChangeFilter: <K extends keyof PostFilterOptions>(key: K, value: PostFilterOptions[K]) => void;
  onResetFilters: () => void;
  onApplyFilters: () => void;
  activeFiltersCount: number;
}

const LANGUAGE_OPTIONS = [
  { value: 'all', label: 'Select Language' },
  { value: 'HI', label: 'Hindi (HI)' },
  { value: 'EN', label: 'English (EN)' },
];

const HOMEPAGE_OPTIONS = [
  { value: 'all', label: 'Show Homepage' },
  { value: 'true', label: 'Yes (Shown on Homepage)' },
  { value: 'false', label: 'No (Hidden)' },
];

const POPULAR_OPTIONS = [
  { value: 'all', label: 'Select Popular' },
  { value: 'true', label: 'Popular Only (Starred)' },
  { value: 'false', label: 'Regular Posts' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Select Status' },
  { value: 'Published', label: 'Published' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Scheduled', label: 'Scheduled' },
  { value: 'Archived', label: 'Archived' },
];

const ORDER_OPTIONS = [
  { value: 'newest', label: 'Order By: Newest First' },
  { value: 'oldest', label: 'Order By: Oldest First' },
  { value: 'title-asc', label: 'Order By: Title (A - Z)' },
  { value: 'title-desc', label: 'Order By: Title (Z - A)' },
  { value: 'popular', label: 'Order By: Most Popular' },
  { value: 'views', label: 'Order By: Most Views' },
];

export const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  onChangeFilter,
  onResetFilters,
  onApplyFilters,
  activeFiltersCount,
}) => {
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...CATEGORIES.map((c) => ({ value: c, label: c })),
  ];
  const authorOptions = [
    { value: 'all', label: 'Author / Writer' },
    ...AUTHORS.map((a) => ({ value: a.name, label: a.name })),
  ];
  const perPageOptions = [5, 10, 20, 50].map((n) => ({ value: String(n), label: `Per Page: ${n}` }));

  return (
    <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-slate-200 dark:border-[#334155] shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Row 1 */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChangeFilter('searchQuery', e.target.value)}
            placeholder="Search posts by title..."
            className="w-full pl-9 pr-8 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-lg text-[13.5px] text-slate-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChangeFilter('searchQuery', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="relative">
          <input
            type="date"
            value={filters.dateRange}
            onChange={(e) => onChangeFilter('dateRange', e.target.value)}
            placeholder="Select date range"
            className="w-full pl-3 pr-8 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-lg text-[13.5px] text-slate-700 dark:text-gray-200 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <Dropdown
          size="lg"
          options={LANGUAGE_OPTIONS}
          value={filters.language}
          onChange={(v) => onChangeFilter('language', v)}
          className="w-full"
        />
        <Dropdown
          size="lg"
          options={HOMEPAGE_OPTIONS}
          value={filters.showHomepage}
          onChange={(v) => onChangeFilter('showHomepage', v)}
          className="w-full"
        />

        {/* Row 2 */}
        <Dropdown
          size="lg"
          options={POPULAR_OPTIONS}
          value={filters.isPopular}
          onChange={(v) => onChangeFilter('isPopular', v)}
          className="w-full"
        />
        <Dropdown
          size="lg"
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(v) => onChangeFilter('status', v)}
          className="w-full"
        />
        <Dropdown
          size="lg"
          options={categoryOptions}
          value={filters.category}
          onChange={(v) => onChangeFilter('category', v)}
          className="w-full"
        />
        <Dropdown
          size="lg"
          options={authorOptions}
          value={filters.author}
          onChange={(v) => onChangeFilter('author', v)}
          className="w-full"
        />

        {/* Row 3 */}
        <Dropdown
          size="lg"
          options={ORDER_OPTIONS}
          value={filters.orderBy}
          onChange={(v) => onChangeFilter('orderBy', v as PostFilterOptions['orderBy'])}
          className="w-full"
        />
        <Dropdown
          size="lg"
          options={perPageOptions}
          value={String(filters.perPage)}
          onChange={(v) => onChangeFilter('perPage', Number(v))}
          className="w-full"
        />

        <button
          onClick={onResetFilters}
          className="w-full px-4 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset</span>
        </button>
        <button
          onClick={onApplyFilters}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <FilterIcon className="w-3.5 h-3.5" />
          <span>Filter</span>
        </button>
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 mt-3.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            {activeFiltersCount} active {activeFiltersCount === 1 ? 'filter' : 'filters'}
          </span>
        </div>
      )}
    </div>
  );
};
import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { CourseReviewFilters as Filters } from '../types/course-review.types';

interface Props {
  filters: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
}

export const CourseReviewFilters: React.FC<Props> = ({
  filters,
  onChange,
  onReset,
}) => {
  return (
    <div className="bg-white dark:bg-[#1E293B] border border-border-subtle rounded-xl p-4">
      <div className="flex flex-col xl:flex-row xl:items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-ink-soft mb-1.5">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) =>
                onChange({ ...filters, keyword: e.target.value })
              }
              placeholder="Search by course title..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border-subtle bg-white dark:bg-[#0F172A] text-sm text-ink dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>

        <div className="w-full xl:w-44">
          <label className="block text-xs font-semibold text-ink-soft mb-1.5">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              onChange({ ...filters, status: e.target.value })
            }
            className="w-full px-3 py-2.5 rounded-lg border border-border-subtle bg-white dark:bg-[#0F172A] text-sm text-ink dark:text-gray-100"
          >
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="w-full xl:w-44">
          <label className="block text-xs font-semibold text-ink-soft mb-1.5">
            Order
          </label>
          <select
            value={filters.orderBy}
            onChange={(e) =>
              onChange({ ...filters, orderBy: e.target.value })
            }
            className="w-full px-3 py-2.5 rounded-lg border border-border-subtle bg-white dark:bg-[#0F172A] text-sm text-ink dark:text-gray-100"
          >
            <option value="0">Newest</option>
            <option value="1">Oldest</option>
          </select>
        </div>

        <div className="w-full xl:w-36">
          <label className="block text-xs font-semibold text-ink-soft mb-1.5">
            Per Page
          </label>
          <select
            value={filters.parPage}
            onChange={(e) =>
              onChange({
                ...filters,
                parPage:
                  e.target.value === 'all'
                    ? 'all'
                    : Number(e.target.value),
              })
            }
            className="w-full px-3 py-2.5 rounded-lg border border-border-subtle bg-white dark:bg-[#0F172A] text-sm text-ink dark:text-gray-100"
          >
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value="all">All</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border-subtle text-sm font-semibold text-ink dark:text-gray-100 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { Search, X } from 'lucide-react';

interface Props {
  search: string;
  status: string;
  trending: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTrendingChange: (value: string) => void;
  onClear: () => void;
}

const FreeCourseCategoryFilters: React.FC<Props> = ({
  search,
  status,
  trending,
  onSearchChange,
  onStatusChange,
  onTrendingChange,
  onClear,
}) => {
  const hasFilters =
    search.trim() !== '' ||
    status !== '' ||
    trending !== '';

  return (
    <div className="rounded-xl border border-border-subtle bg-white p-4 dark:bg-[#1E293B]">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:items-end">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white">
            Search
          </label>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                onSearchChange(e.target.value)
              }
              placeholder="Search category..."
              className="w-full rounded-lg border border-border-subtle bg-white py-2.5 pl-10 pr-4 text-sm text-ink outline-none focus:border-brand dark:bg-[#0F172A] dark:text-white"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white">
            Status
          </label>

          <select
            value={status}
            onChange={(e) =>
              onStatusChange(e.target.value)
            }
            className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand dark:bg-[#0F172A] dark:text-white"
          >
            <option value="">
              All Status
            </option>
            <option value="true">
              Active
            </option>
            <option value="false">
              Inactive
            </option>
          </select>
        </div>

        {/* Trending */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white">
            Trending
          </label>

          <select
            value={trending}
            onChange={(e) =>
              onTrendingChange(e.target.value)
            }
            className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand dark:bg-[#0F172A] dark:text-white"
          >
            <option value="">
              All
            </option>
            <option value="true">
              Trending
            </option>
            <option value="false">
              Not Trending
            </option>
          </select>
        </div>
      </div>

      {hasFilters && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-2 rounded-lg border border-border-subtle px-4 py-2.5 text-sm font-medium text-ink dark:text-white"
          >
            <X size={16} />
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default FreeCourseCategoryFilters;
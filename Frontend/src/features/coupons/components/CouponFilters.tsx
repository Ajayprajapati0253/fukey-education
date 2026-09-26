import React from 'react';
import { Search, X } from 'lucide-react';

interface CouponFiltersProps {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClear: () => void;
}

const CouponFilters: React.FC<CouponFiltersProps> = ({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onClear,
}) => {
  const hasFilters = search !== '' || status !== '';

  return (
    <div className="rounded-xl border border-border-subtle bg-white p-4 dark:bg-[#1E293B]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        {/* Search */}
        <div className="flex-1">
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
              placeholder="Search coupon code..."
              className="w-full rounded-lg border border-border-subtle bg-white py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-brand dark:bg-[#0F172A] dark:text-white"
            />
          </div>
        </div>

        {/* Status */}
        <div className="w-full lg:w-48">
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
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-lg border border-border-subtle px-4 text-sm font-medium text-ink transition hover:bg-gray-50 dark:text-white dark:hover:bg-slate-700"
          >
            <X size={16} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default CouponFilters;
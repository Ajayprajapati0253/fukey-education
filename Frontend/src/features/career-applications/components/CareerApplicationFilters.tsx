import React from 'react';
import {
  Search,
  Briefcase,
  ChevronDown,
} from 'lucide-react';

import type { Career } from '../api/career-application.api';

interface CareerApplicationFiltersProps {
  careers: Career[];
  selectedCareer: string;
  search: string;
  status: string;
  statusOptions: string[];

  loadingCareers: boolean;

  onCareerChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

const formatStatus = (value: string) => {
  if (!value) {
    return '—';
  }

  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const CareerApplicationFilters: React.FC<
  CareerApplicationFiltersProps
> = ({
  careers,
  selectedCareer,
  search,
  status,
  statusOptions,
  loadingCareers,
  onCareerChange,
  onSearchChange,
  onStatusChange,
}) => {
  return (
    <div className="border-b border-border-subtle p-4 dark:border-slate-700 sm:p-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

        {/* Career */}
        <div className="relative">
          <Briefcase
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <select
            value={selectedCareer}
            onChange={(event) =>
              onCareerChange(event.target.value)
            }
            disabled={
              loadingCareers ||
              careers.length === 0
            }
            className="h-11 w-full appearance-none rounded-xl border border-border-subtle bg-white pl-10 pr-10 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-600 dark:bg-[#0F172A] dark:text-white dark:disabled:bg-slate-800"
          >
            <option value="">
              {loadingCareers
                ? 'Loading careers...'
                : careers.length === 0
                  ? 'No careers found'
                  : 'Select Career'}
            </option>

            {careers.map((career) => (
              <option
                key={career.id}
                value={String(career.id)}
              >
                {career.title}
              </option>
            ))}
          </select>

          <ChevronDown
            size={17}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            disabled={!selectedCareer}
            placeholder="Search applicants..."
            className="h-11 w-full rounded-xl border border-border-subtle bg-white pl-10 pr-4 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-600 dark:bg-[#0F172A] dark:text-white dark:disabled:bg-slate-800"
          />
        </div>

        {/* Status */}
        <div className="relative">
          <select
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value)
            }
            disabled={
              !selectedCareer ||
              statusOptions.length === 0
            }
            className="h-11 w-full appearance-none rounded-xl border border-border-subtle bg-white px-4 pr-10 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-600 dark:bg-[#0F172A] dark:text-white dark:disabled:bg-slate-800"
          >
            <option value="all">
              All Status
            </option>

            {statusOptions.map((statusValue) => (
              <option
                key={statusValue}
                value={statusValue}
              >
                {formatStatus(statusValue)}
              </option>
            ))}
          </select>

          <ChevronDown
            size={17}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>
    </div>
  );
};

export default CareerApplicationFilters;
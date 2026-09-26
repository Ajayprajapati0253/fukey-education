import React from 'react';

import {
  Search,
  ChevronDown,
  X,
} from 'lucide-react';

interface CareerFiltersProps {
  search: string;

  department: string;

  location: string;

  employmentType: string;

  status: string;

  orderBy: number;

  departments: string[];

  locations: string[];

  onSearchChange: (
    value: string,
  ) => void;

  onDepartmentChange: (
    value: string,
  ) => void;

  onLocationChange: (
    value: string,
  ) => void;

  onEmploymentTypeChange: (
    value: string,
  ) => void;

  onStatusChange: (
    value: string,
  ) => void;

  onOrderChange: (
    value: number,
  ) => void;

  onClear: () => void;
}

const CareerFilters: React.FC<
  CareerFiltersProps
> = ({
  search,
  department,
  location,
  employmentType,
  status,
  orderBy,
  departments,
  locations,
  onSearchChange,
  onDepartmentChange,
  onLocationChange,
  onEmploymentTypeChange,
  onStatusChange,
  onOrderChange,
  onClear,
}) => {
  const hasFilters =
    search.trim() !== '' ||
    department !== '' ||
    location !== '' ||
    employmentType !== '' ||
    status !== '';

  return (
    <div className="border-b border-border-subtle p-4 dark:border-slate-700 sm:p-5">

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">

        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              onSearchChange(
                event.target.value,
              )
            }
            placeholder="Search job title..."
            className="h-11 w-full rounded-xl border border-border-subtle bg-white pl-10 pr-4 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/10 dark:border-slate-600 dark:bg-[#0F172A] dark:text-white"
          />
        </div>

        {/* Department */}
        <SelectField
          value={department}
          onChange={onDepartmentChange}
          placeholder="All Departments"
          options={departments}
        />

        {/* Location */}
        <SelectField
          value={location}
          onChange={onLocationChange}
          placeholder="All Locations"
          options={locations}
        />

        {/* Employment Type */}
        <SelectField
          value={employmentType}
          onChange={onEmploymentTypeChange}
          placeholder="All Employment Types"
          options={[
            'Full Time',
            'Part Time',
            'Internship',
            'Contract',
          ]}
        />

        {/* Status */}
        <SelectField
          value={status}
          onChange={onStatusChange}
          placeholder="All Status"
          options={[
            'draft',
            'published',
            'closed',
          ]}
          formatOption={(value) =>
            value.charAt(0).toUpperCase() +
            value.slice(1)
          }
        />

        {/* Sort */}
        <div className="relative">
          <select
            value={orderBy}
            onChange={(event) =>
              onOrderChange(
                Number(
                  event.target.value,
                ),
              )
            }
            className="h-11 w-full appearance-none rounded-xl border border-border-subtle bg-white px-4 pr-10 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 dark:border-slate-600 dark:bg-[#0F172A] dark:text-white"
          >
            <option value={2}>
              Newest First
            </option>

            <option value={1}>
              Oldest First
            </option>
          </select>

          <ChevronDown
            size={17}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border-subtle bg-white px-4 text-sm font-medium text-ink transition hover:bg-slate-50 dark:border-slate-600 dark:bg-[#0F172A] dark:text-white dark:hover:bg-slate-700"
          >
            <X size={16} />

            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

interface SelectFieldProps {
  value: string;

  onChange: (
    value: string,
  ) => void;

  placeholder: string;

  options: string[];

  formatOption?: (
    value: string,
  ) => string;
}

const SelectField: React.FC<
  SelectFieldProps
> = ({
  value,
  onChange,
  placeholder,
  options,
  formatOption,
}) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="h-11 w-full appearance-none rounded-xl border border-border-subtle bg-white px-4 pr-10 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 dark:border-slate-600 dark:bg-[#0F172A] dark:text-white"
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {formatOption
              ? formatOption(option)
              : option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={17}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
};

export default CareerFilters;
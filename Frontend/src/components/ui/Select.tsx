import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode;
  options?: SelectOption[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ icon, options, className = '', children, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <select
          ref={ref}
          className={`w-full appearance-none bg-white dark:bg-[#0F172A] border border-[#e2e8f0] dark:border-[#334155] text-[#0f172a] dark:text-gray-100 text-sm rounded-lg transition-all outline-hidden focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${
            icon ? 'pl-10' : 'pl-3.5'
          } pr-9 py-2.5 cursor-pointer ${error ? 'border-rose-500' : ''} ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
        {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
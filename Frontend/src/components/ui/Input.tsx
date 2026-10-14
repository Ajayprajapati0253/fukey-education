import React, { forwardRef } from 'react';

const fieldBase =
  'w-full bg-white dark:bg-[#0B0F19] border border-[#e2e8f0] dark:border-[#374151] text-[#0f172a] dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 text-sm rounded-lg transition-all outline-hidden focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed';

function FieldLabel({ label, requiredBadge }: { label: string; requiredBadge?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
      {label}
      {requiredBadge && <span className="text-rose-500"> *</span>}
    </label>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  requiredBadge?: boolean;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, requiredBadge, icon, rightElement, className = '', error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <FieldLabel label={label} requiredBadge={requiredBadge} />}
        <div className="relative w-full">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`${fieldBase} ${icon ? 'pl-10' : 'pl-3.5'} ${rightElement ? 'pr-10' : 'pr-3.5'} py-2.5 ${
              error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''
            } ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">{rightElement}</div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  requiredBadge?: boolean;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, requiredBadge, className = '', error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <FieldLabel label={label} requiredBadge={requiredBadge} />}
        <textarea
          ref={ref}
          className={`${fieldBase} px-3.5 py-2.5 ${
            error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export default Input;
import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'warning';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, variant = 'primary', size = 'md', isLoading = false, fullWidth = false, disabled, className = '', ...props },
    ref
  ) => {
    const variantStyles: Record<ButtonVariant, string> = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xs',
      secondary:
        'bg-[#EAF0FE] text-[#2451D9] hover:bg-[#DCE6FD] dark:bg-[#2451D9]/20 dark:text-[#60A5FA] dark:hover:bg-[#2451D9]/30',
      outline:
        'bg-white dark:bg-[#0F172A] border border-[#e2e8f0] dark:border-[#334155] text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50',
      ghost:
        'bg-transparent text-[#64748b] dark:text-gray-400 hover:text-[#0f172a] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800',
      danger: 'bg-[#DC5B3E] text-white hover:bg-[#C24B30] shadow-2xs',
      warning: 'bg-[#D97706] text-white hover:bg-[#B8650A] shadow-2xs',
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
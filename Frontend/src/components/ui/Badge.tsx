import React from 'react';

export type BadgeVariant =
  | 'brand'
  | 'warning'
  | 'danger'
  | 'success'
  | 'accent'
  | 'teal'
  | 'neutral'
  | 'live';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'xs' | 'sm' | 'md';
  pill?: boolean;
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  pill = true,
  dot = false,
  className = '',
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    brand: 'bg-[#EAF0FE] text-[#2451D9] dark:bg-[#2451D9]/20 dark:text-[#60A5FA]',
    warning: 'bg-[#FDF3E0] text-[#D97706] dark:bg-[#D97706]/20 dark:text-[#FBBF24]',
    danger: 'bg-[#FCEAE4] text-[#DC5B3E] dark:bg-[#DC5B3E]/20 dark:text-[#F87171]',
    success: 'bg-[#E7F7ED] text-[#16A34A] dark:bg-[#16A34A]/20 dark:text-[#4ADE80]',
    accent: 'bg-[#F1EAFE] text-[#7C3AED] dark:bg-[#7C3AED]/20 dark:text-[#C084FC]',
    teal: 'bg-[#E4F5F3] text-[#0D9488] dark:bg-[#0D9488]/20 dark:text-[#2DD4BF]',
    neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300',
    live: 'bg-[#E7F7ED] text-[#16A34A] dark:bg-[#16A34A]/20 dark:text-[#4ADE80] font-semibold',
  };

  const dotColors: Record<BadgeVariant, string> = {
    brand: 'bg-[#2451D9]',
    warning: 'bg-[#D97706]',
    danger: 'bg-[#DC5B3E]',
    success: 'bg-[#16A34A]',
    accent: 'bg-[#7C3AED]',
    teal: 'bg-[#0D9488]',
    neutral: 'bg-gray-500',
    live: 'bg-[#16A34A] animate-pulse',
  };

  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 leading-tight',
    sm: 'text-xs px-2 py-0.5 leading-normal',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium whitespace-nowrap select-none ${
        pill ? 'rounded-full' : 'rounded-md'
      } ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};

export default Badge;

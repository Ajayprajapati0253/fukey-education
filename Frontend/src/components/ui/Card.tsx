import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  padding = 'md',
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={`bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] text-[#12141C] dark:text-gray-100 rounded-2xl ${paddingClasses[padding]} transition-all duration-200 ${
        hoverable ? 'hover:border-[#D1D5DB] dark:hover:border-gray-600 hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

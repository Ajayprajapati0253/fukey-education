import React from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
}

interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
  size = 'sm',
}: TabsProps<T>) {
  const sizeStyles = {
    sm: 'text-xs py-1 px-2.5',
    md: 'text-sm py-1.5 px-3.5',
  };

  return (
    <div className={`inline-flex items-center p-1 bg-[#F1F3F8] dark:bg-[#111827] rounded-xl border border-[#E6E8EE] dark:border-[#334155] ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`font-semibold rounded-lg transition-all duration-150 select-none ${sizeStyles[size]} ${
              isActive
                ? 'bg-[#2451D9] text-white shadow-[0_1px_3px_rgba(36,81,217,0.3)]'
                : 'text-[#686E7D] dark:text-[#94A3B8] hover:text-[#12141C] dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#1E293B]'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
  
export default Tabs;

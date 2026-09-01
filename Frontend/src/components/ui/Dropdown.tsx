import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps<T extends string = string> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  icon?: React.ReactNode;
  variant?: 'outline' | 'ghost' | 'primary';
  className?: string;
}

export function Dropdown<T extends string = string>({
  options,
  value,
  onChange,
  icon,
  variant = 'outline',
  className = '',
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const variantStyles = {
    outline: 'bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] text-[#12141C] dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/60',
    ghost: 'bg-transparent text-[#686E7D] dark:text-gray-400 hover:text-[#12141C] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800',
    primary: 'bg-[#2451D9] text-white hover:bg-[#1E44B8]',
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 ${variantStyles[variant]}`}
      >
        {icon || selectedOption?.icon}
        <span>{selectedOption?.label || value}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.18)] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2 transition-colors ${
                opt.value === value
                  ? 'bg-[#EAF0FE] dark:bg-[#2451D9]/20 text-[#2451D9] dark:text-[#60A5FA] font-bold'
                  : 'text-[#12141C] dark:text-gray-200 hover:bg-[#F6F7FA] dark:hover:bg-gray-700/50'
              }`}
            >
              {opt.icon}
              <span className="flex-1">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dropdown;

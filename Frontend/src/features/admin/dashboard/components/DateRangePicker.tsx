import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown, Check } from 'lucide-react';

interface DateRangePickerProps {
  currentRangeLabel?: string;
  onRangeChange?: (preset: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  currentRangeLabel = 'Oct 1 - Oct 31, 2023',
  onRangeChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('This Month (Oct 2023)');
  const [displayLabel, setDisplayLabel] = useState(currentRangeLabel);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const presets = [
    { label: 'Today', range: 'Oct 31, 2023' },
    { label: 'This Week', range: 'Oct 25 - Oct 31, 2023' },
    { label: 'This Month (Oct 2023)', range: 'Oct 1 - Oct 31, 2023' },
    { label: 'Last 30 Days', range: 'Oct 2 - Oct 31, 2023' },
    { label: 'Last Quarter (Q3)', range: 'Jul 1 - Sep 30, 2023' },
    { label: 'Year to Date (2023)', range: 'Jan 1 - Oct 31, 2023' },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (preset: { label: string; range: string }) => {
    setSelectedPreset(preset.label);
    setDisplayLabel(preset.range);
    setIsOpen(false);
    if (onRangeChange) {
      onRangeChange(preset.label);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-xl text-xs font-semibold text-[#12141C] dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 transition-colors shadow-xs"
      >
        <CalendarIcon className="w-3.5 h-3.5 text-[#686E7D] dark:text-[#94A3B8]" />
        <span>{displayLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.15)] p-2 z-50 animate-in fade-in zoom-in-95">
          <div className="px-3 py-1.5 text-[11px] font-bold text-[#9DA2AF] dark:text-gray-400 uppercase tracking-wider">
            Select Date Range
          </div>
          <div className="space-y-0.5 mt-1">
            {presets.map((preset) => {
              const isSelected = selectedPreset === preset.label;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleSelect(preset)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-[#EAF0FE] dark:bg-[#2451D9]/20 text-[#2451D9] dark:text-[#60A5FA] font-bold'
                      : 'text-[#12141C] dark:text-gray-200 hover:bg-[#F6F7FA] dark:hover:bg-gray-800'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{preset.label}</p>
                    <p className="text-[10px] text-[#686E7D] dark:text-gray-400">{preset.range}</p>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#2451D9] dark:text-[#60A5FA]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown, Check, X } from 'lucide-react';

interface DateRangePickerProps {
  currentRangeLabel?: string;
  onRangeChange?: (preset: string, customRange?: { start: Date; end: Date }) => void;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const formatShort = (d: Date) => `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

const formatRange = (start: Date, end: Date) => {
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();
  if (start.getTime() === end.getTime()) return formatShort(start);
  if (sameMonth) return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${end.getFullYear()}`;
  if (sameYear) return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()} - ${MONTH_NAMES[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
  return `${formatShort(start)} - ${formatShort(end)}`;
};

const addDays = (d: Date, days: number) => {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + days);
  return nd;
};

const startOfQuarter = (d: Date) => {
  const q = Math.floor(d.getMonth() / 3);
  return new Date(d.getFullYear(), q * 3 - 3, 1);
};
const endOfQuarter = (d: Date) => {
  const q = Math.floor(d.getMonth() / 3);
  return new Date(d.getFullYear(), q * 3, 0);
};

// Format a Date as YYYY-MM-DD for <input type="date">
const toInputValue = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getPresets = () => {
  const today = new Date();
  const weekStart = addDays(today, -today.getDay());
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const last30Start = addDays(today, -29);
  const qStart = startOfQuarter(today);
  const qEnd = endOfQuarter(today);
  const yearStart = new Date(today.getFullYear(), 0, 1);

  return [
    { label: 'Today', range: formatShort(today) },
    { label: 'This Week', range: formatRange(weekStart, today) },
    { label: `This Month (${MONTH_NAMES[today.getMonth()]} ${today.getFullYear()})`, range: formatRange(monthStart, monthEnd) },
    { label: 'Last 30 Days', range: formatRange(last30Start, today) },
    { label: `Last Quarter (Q${Math.floor(qStart.getMonth() / 3) + 1})`, range: formatRange(qStart, qEnd) },
    { label: `Year to Date (${today.getFullYear()})`, range: formatRange(yearStart, today) },
  ];
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  currentRangeLabel,
  onRangeChange,
}) => {
  const presets = getPresets();
  const today = new Date();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(presets[2].label);
  const [displayLabel, setDisplayLabel] = useState(currentRangeLabel ?? presets[2].range);
  const [isMobile, setIsMobile] = useState(false);

  // Custom range state
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStart, setCustomStart] = useState(toInputValue(addDays(today, -6)));
  const [customEnd, setCustomEnd] = useState(toInputValue(today));

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCustomPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeAll = () => {
    setIsOpen(false);
    setShowCustomPicker(false);
  };

  const handleSelect = (preset: { label: string; range: string }) => {
    setSelectedPreset(preset.label);
    setDisplayLabel(preset.range);
    closeAll();
    if (onRangeChange) {
      onRangeChange(preset.label);
    }
  };

  const handleOpenCustom = () => {
    setShowCustomPicker(true);
  };

  const handleApplyCustom = () => {
    if (!customStart || !customEnd) return;
    const start = new Date(customStart);
    const end = new Date(customEnd);
    if (start.getTime() > end.getTime()) return;

    const label = 'Custom Range';
    const range = formatRange(start, end);
    setSelectedPreset(label);
    setDisplayLabel(range);
    closeAll();
    if (onRangeChange) {
      onRangeChange(label, { start, end });
    }
  };

  const dropdownContent = (
    <>
      <div className="flex items-center justify-between px-3 py-1.5">
        <span className="text-[11px] font-bold text-[#9DA2AF] dark:text-gray-400 uppercase tracking-wider">
          Select Date Range
        </span>
        {isMobile && (
          <button
            type="button"
            onClick={closeAll}
            className="p-1 rounded-lg hover:bg-[#F6F7FA] dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-[#686E7D] dark:text-gray-400" />
          </button>
        )}
      </div>

      {!showCustomPicker ? (
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

          {/* Custom range trigger */}
          <button
            type="button"
            onClick={handleOpenCustom}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
              selectedPreset === 'Custom Range'
                ? 'bg-[#EAF0FE] dark:bg-[#2451D9]/20 text-[#2451D9] dark:text-[#60A5FA] font-bold'
                : 'text-[#12141C] dark:text-gray-200 hover:bg-[#F6F7FA] dark:hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {/* <CalendarIcon className="w-3.5 h-3.5 text-[#686E7D] dark:text-[#94A3B8]" /> */}
              <div>
                <p className="font-semibold">Custom Range</p>
                <p className="text-[10px] text-[#686E7D] dark:text-gray-400">
                  {selectedPreset === 'Custom Range' ? displayLabel : 'Pick a start & end date'}
                </p>
              </div>
            </div>
            {selectedPreset === 'Custom Range' && (
              <Check className="w-3.5 h-3.5 text-[#2451D9] dark:text-[#60A5FA]" />
            )}
          </button>
        </div>
      ) : (
        <div className="mt-1 px-1 pb-1 space-y-3">
          <button
            type="button"
            onClick={() => setShowCustomPicker(false)}
            className="text-[11px] font-semibold text-[#2451D9] dark:text-[#60A5FA] px-2"
          >
            ← Back
          </button>

          <div className="px-2 space-y-2">
            <label className="block text-[11px] font-semibold text-[#686E7D] dark:text-gray-400">
              Start date
              <div className="mt-1 flex items-center gap-2 border border-[#E6E8EE] dark:border-[#334155] rounded-xl px-3 py-2">
                <CalendarIcon className="w-3.5 h-3.5 text-[#686E7D] dark:text-[#94A3B8] shrink-0" />
                <input
                  type="date"
                  value={customStart}
                  max={customEnd}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#12141C] dark:text-gray-100 outline-none"
                />
              </div>
            </label>

            <label className="block text-[11px] font-semibold text-[#686E7D] dark:text-gray-400">
              End date
              <div className="mt-1 flex items-center gap-2 border border-[#E6E8EE] dark:border-[#334155] rounded-xl px-3 py-2">
                <CalendarIcon className="w-3.5 h-3.5 text-[#686E7D] dark:text-[#94A3B8] shrink-0" />
                <input
                  type="date"
                  value={customEnd}
                  min={customStart}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#12141C] dark:text-gray-100 outline-none"
                />
              </div>
            </label>
          </div>

          <button
            type="button"
            onClick={handleApplyCustom}
            className="w-full py-2 rounded-xl text-xs font-bold bg-[#2451D9] text-white hover:bg-[#1e42b8] transition-colors"
          >
            Apply
          </button>
        </div>
      )}
    </>
  );

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

      {isOpen && isMobile && (
        // Mobile / tablet: centered modal with backdrop
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xs bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.25)] p-2 animate-in fade-in zoom-in-95 max-h-[80vh] overflow-y-auto">
            {dropdownContent}
          </div>
        </div>
      )}

      {isOpen && !isMobile && (
        // Desktop: anchored dropdown
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.15)] p-2 z-50 animate-in fade-in zoom-in-95">
          {dropdownContent}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
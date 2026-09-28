import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

interface DatePickerPopoverProps {
  value: string;
  onChange: (dateStr: string) => void;
  placeholder?: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

const SELECT_CLS =
  'bg-white dark:bg-[#0F172A] border border-[#e2e8f0] dark:border-[#334155] text-[#0f172a] dark:text-gray-100 text-xs font-semibold rounded-lg px-2 py-1 cursor-pointer outline-hidden focus:border-[#3b82f6]';
const NAV_CLS =
  'p-1 rounded-lg text-slate-500 dark:text-gray-400 hover:text-[#0f172a] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer';

export const DatePickerPopover: React.FC<DatePickerPopoverProps> = ({ value, onChange, placeholder = 'Joined Date' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parseInitialDate = () => {
    if (value) {
      const parts = value.split(' ');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const monthIndex = MONTHS.indexOf(parts[1]);
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && monthIndex !== -1 && !isNaN(year)) return { day, month: monthIndex, year };
      } else if (parts.length === 2) {
        const monthIndex = MONTHS.indexOf(parts[0]);
        const year = parseInt(parts[1], 10);
        if (monthIndex !== -1 && !isNaN(year)) return { day: null, month: monthIndex, year };
      }
    }
    return { day: null, month: 5, year: 2026 };
  };

  const initial = parseInitialDate();
  const [viewMonth, setViewMonth] = useState<number>(initial.month);
  const [viewYear, setViewYear] = useState<number>(initial.year);
  const [selectedDay, setSelectedDay] = useState<number | null>(initial.day);

  useEffect(() => {
    const parsed = parseInitialDate();
    setViewMonth(parsed.month);
    setViewYear(parsed.year);
    setSelectedDay(parsed.day);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((p) => p - 1);
    } else setViewMonth((p) => p - 1);
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((p) => p + 1);
    } else setViewMonth((p) => p + 1);
  };

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    onChange(`${dayStr} ${MONTHS[viewMonth]} ${viewYear}`);
    setIsOpen(false);
  };

  const handleSelectEntireMonth = () => {
    setSelectedDay(null);
    onChange(`${MONTHS[viewMonth]} ${viewYear}`);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDay(null);
    onChange('');
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const prevMonthDaysCount = new Date(viewYear, viewMonth, 0).getDate();
  const prevMonthDays: number[] = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) prevMonthDays.push(prevMonthDaysCount - i);
  const currentMonthDays: number[] = [];
  for (let i = 1; i <= daysInMonth; i++) currentMonthDays.push(i);
  const totalSlots = prevMonthDays.length + currentMonthDays.length;
  const nextMonthDaysCount = totalSlots % 7 === 0 ? 0 : 7 - (totalSlots % 7);
  const nextMonthDays: number[] = [];
  for (let i = 1; i <= nextMonthDaysCount; i++) nextMonthDays.push(i);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-[#0F172A] border rounded-lg text-xs font-medium transition-all cursor-pointer ${
          isOpen || value
            ? 'border-[#3b82f6] text-blue-600 dark:text-blue-300 ring-2 ring-blue-500/20'
            : 'border-[#e2e8f0] dark:border-[#334155] text-[#64748b] dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }`}
        title="Open Calendar Date Picker"
      >
        <div className="flex items-center gap-2 truncate">
          <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate">{value ? value : placeholder}</span>
        </div>
        {value && (
          <span
            onClick={handleClear}
            className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-[#0f172a] dark:hover:text-white transition-colors shrink-0 ml-1"
            title="Clear date"
          >
            <X className="w-3 h-3" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 sm:right-auto sm:left-0 mt-2 z-50 w-72 bg-white dark:bg-[#1E293B] border border-[#e2e8f0] dark:border-[#334155] rounded-2xl shadow-xl p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between gap-1 pb-3 border-b border-[#e2e8f0] dark:border-[#334155] mb-3">
            <button type="button" onClick={handlePrevMonth} className={NAV_CLS} title="Previous Month">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5">
              <select value={viewMonth} onChange={(e) => setViewMonth(Number(e.target.value))} className={SELECT_CLS}>
                {FULL_MONTHS.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>
              <select value={viewYear} onChange={(e) => setViewYear(Number(e.target.value))} className={SELECT_CLS}>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button type="button" onClick={handleNextMonth} className={NAV_CLS} title="Next Month">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-[#64748b] dark:text-gray-400 mb-2">
            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {prevMonthDays.map((day, i) => (
              <div key={`prev-${i}`} className="h-7 flex items-center justify-center text-[11px] text-slate-300 dark:text-gray-600 select-none">
                {day}
              </div>
            ))}

            {currentMonthDays.map((day) => {
              const isSelected =
                selectedDay === day &&
                MONTHS[viewMonth] === (value.split(' ')[1] || '') &&
                viewYear === parseInt(value.split(' ')[2] || '0', 10);
              return (
                <button
                  type="button"
                  key={`cur-${day}`}
                  onClick={() => handleSelectDay(day)}
                  className={`h-7 flex items-center justify-center text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#3b82f6] text-white font-bold shadow-2xs'
                      : 'text-[#0f172a] dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {day}
                </button>
              );
            })}

            {nextMonthDays.map((day, i) => (
              <div key={`next-${i}`} className="h-7 flex items-center justify-center text-[11px] text-slate-300 dark:text-gray-600 select-none">
                {day}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#e2e8f0] dark:border-[#334155] text-[11px]">
            <button
              type="button"
              onClick={handleSelectEntireMonth}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1 cursor-pointer"
              title="Filter by entire selected month"
            >
              <Check className="w-3 h-3" />
              All of {MONTHS[viewMonth]} {viewYear}
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setViewMonth(now.getMonth());
                setViewYear(now.getFullYear());
                handleSelectDay(now.getDate());
              }}
              className="text-[#64748b] dark:text-gray-400 hover:text-[#0f172a] dark:hover:text-gray-200 hover:underline cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePickerPopover;
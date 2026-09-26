import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, Check, X, RotateCcw } from 'lucide-react';

interface CalendarRangePickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  onChange: (start: string, end: string) => void;
  onReset?: () => void;
}

export const CalendarRangePicker: React.FC<CalendarRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  onReset,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Month currently viewed in the calendar popup (default to startDate or Aug 2026)
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (startDate) {
      const [y, m] = startDate.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m)) return new Date(y, m - 1, 1);
    }
    return new Date(2026, 7, 1); // August 2026 default
  });

  const [tempStart, setTempStart] = useState<string>(startDate || '2026-08-01');
  const [tempEnd, setTempEnd] = useState<string>(endDate || '2026-08-31');
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Sync temp dates when props change
  useEffect(() => {
    if (startDate) setTempStart(startDate);
    if (endDate) setTempEnd(endDate);
  }, [startDate, endDate]);

  // Click outside listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Format label for button
  const formatRangeLabel = (start: string, end: string): string => {
    if (!start && !end) return 'Select Date Range';
    try {
      const [sy, sm, sd] = start.split('-').map(Number);
      const [ey, em, ed] = (end || start).split('-').map(Number);

      const d1 = new Date(sy, sm - 1, sd);
      const d2 = new Date(ey, em - 1, ed);

      const m1 = d1.toLocaleString('en-US', { month: 'short' });
      const m2 = d2.toLocaleString('en-US', { month: 'short' });

      if (sy === ey) {
        if (sm === em) {
          return `${m1} ${sd} – ${m1} ${ed}, ${sy}`;
        }
        return `${m1} ${sd} – ${m2} ${ed}, ${sy}`;
      }
      return `${m1} ${sd}, ${sy} – ${m2} ${ed}, ${ey}`;
    } catch {
      return `${start} – ${end}`;
    }
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  // Calendar math for viewDate
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 0-indexed
  const monthName = viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // First day of month (0 = Sunday, 1 = Monday, ...)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Days in previous month
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Construct day cells
  const calendarCells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Prev month padding
  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const prevM = month === 0 ? 12 : month;
    const prevY = month === 0 ? year - 1 : year;
    const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    calendarCells.push({ dateStr, dayNum, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ dateStr, dayNum: d, isCurrentMonth: true });
  }

  // Next month padding to fill grid to multiple of 7
  const remainingCells = 42 - calendarCells.length;
  for (let d = 1; d <= remainingCells && calendarCells.length < 35; d++) {
    const nextM = month === 11 ? 1 : month + 2;
    const nextY = month === 11 ? year + 1 : year;
    const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  const handleDateClick = (dateStr: string) => {
    if (!tempStart || (tempStart && tempEnd)) {
      // Start a new range
      setTempStart(dateStr);
      setTempEnd('');
    } else if (tempStart && !tempEnd) {
      if (dateStr < tempStart) {
        setTempEnd(tempStart);
        setTempStart(dateStr);
      } else {
        setTempEnd(dateStr);
      }
    }
  };

  const handleApply = () => {
    const finalStart = tempStart || '2026-08-01';
    const finalEnd = tempEnd || tempStart || '2026-08-31';
    onChange(finalStart, finalEnd);
    setIsOpen(false);
  };

  const handleQuickPreset = (start: string, end: string, viewYear: number, viewMonth: number) => {
    setTempStart(start);
    setTempEnd(end);
    setViewDate(new Date(viewYear, viewMonth, 1));
  };

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      {/* Clickable Date Range Pill Trigger Button */}
      <button
        id="clickable-date-range-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#0F172A] hover:bg-gray-100/90 dark:hover:bg-[#1a2740] active:bg-gray-200 dark:active:bg-[#26344a] border border-gray-200/90 dark:border-[#334155] rounded-lg px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-700 dark:text-gray-200 transition cursor-pointer font-medium select-none shadow-2xs hover:border-gray-300 dark:hover:border-[#475569]"
        title="Click to select custom calendar dates or presets"
      >
        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <span className="whitespace-nowrap font-medium text-gray-800 dark:text-gray-200">
          {formatRangeLabel(startDate, endDate)}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
          }`}
        />
      </button>

      {/* Quick Reset Button */}
      {onReset && (
        <button
          id="filter-refresh-date-btn"
          type="button"
          onClick={onReset}
          title="Reset to default range"
          className="ml-1 p-1 hover:bg-gray-100 dark:hover:bg-[#334155] rounded text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Interactive Calendar Popover Dropdown */}
      {isOpen && (
        <div
          id="calendar-popup-modal"
          className="absolute left-0 top-full mt-2 z-50 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-[#334155] rounded-2xl shadow-2xl p-4 w-[310px] sm:w-[350px] animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header & Presets */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#334155]">
            <span className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Select Date Range
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Presets Chips */}
          <div className="flex flex-wrap gap-1.5 py-2.5 border-b border-gray-100 dark:border-[#334155]">
            <button
              type="button"
              onClick={() => handleQuickPreset('2026-08-01', '2026-08-31', 2026, 7)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                tempStart === '2026-08-01' && tempEnd === '2026-08-31'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-gray-100 dark:bg-[#334155] hover:bg-gray-200 dark:hover:bg-[#3f4f68] text-gray-700 dark:text-gray-200'
              }`}
            >
              Aug 2026
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('2026-09-01', '2026-09-30', 2026, 8)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                tempStart === '2026-09-01' && tempEnd === '2026-09-30'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-gray-100 dark:bg-[#334155] hover:bg-gray-200 dark:hover:bg-[#3f4f68] text-gray-700 dark:text-gray-200'
              }`}
            >
              Sep 2026
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('2026-08-01', '2026-09-30', 2026, 7)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                tempStart === '2026-08-01' && tempEnd === '2026-09-30'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-gray-100 dark:bg-[#334155] hover:bg-gray-200 dark:hover:bg-[#3f4f68] text-gray-700 dark:text-gray-200'
              }`}
            >
              Aug – Sep
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('2026-09-17', '2026-09-17', 2026, 8)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                tempStart === '2026-09-17' && tempEnd === '2026-09-17'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-gray-100 dark:bg-[#334155] hover:bg-gray-200 dark:hover:bg-[#3f4f68] text-gray-700 dark:text-gray-200'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('2026-09-14', '2026-09-20', 2026, 8)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                tempStart === '2026-09-14' && tempEnd === '2026-09-20'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-gray-100 dark:bg-[#334155] hover:bg-gray-200 dark:hover:bg-[#3f4f68] text-gray-700 dark:text-gray-200'
              }`}
            >
              This Week
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between py-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#334155] text-gray-600 dark:text-gray-300 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{monthName}</span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#334155] text-gray-600 dark:text-gray-300 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels (Mon - Sun) */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-gray-400 dark:text-gray-500 py-1">
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
            <span>Su</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center py-1">
            {calendarCells.map((cell, idx) => {
              const isStart = cell.dateStr === tempStart;
              const isEnd = cell.dateStr === tempEnd;
              const isBetween =
                tempStart &&
                tempEnd &&
                cell.dateStr > tempStart &&
                cell.dateStr < tempEnd;
              const isHoveredRange =
                tempStart &&
                !tempEnd &&
                hoverDate &&
                cell.dateStr > tempStart &&
                cell.dateStr <= hoverDate;

              return (
                <button
                  key={`${cell.dateStr}-${idx}`}
                  type="button"
                  onClick={() => handleDateClick(cell.dateStr)}
                  onMouseEnter={() => setHoverDate(cell.dateStr)}
                  onMouseLeave={() => setHoverDate(null)}
                  className={`h-7 w-full flex items-center justify-center text-xs font-medium transition cursor-pointer rounded-md ${
                    isStart || isEnd
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : isBetween || isHoveredRange
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold'
                      : cell.isCurrentMonth
                      ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#334155]'
                      : 'text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-[#0F172A]'
                  } ${cell.dateStr === '2026-09-17' && !isStart && !isEnd ? 'ring-1 ring-blue-400 dark:ring-blue-500/60 font-bold' : ''}`}
                >
                  {cell.dayNum}
                </button>
              );
            })}
          </div>

          {/* Direct Start/End Date Inputs */}
          <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-[#334155] flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-[10px] text-gray-400 dark:text-gray-500 font-medium mb-0.5">Start Date</label>
              <input
                type="date"
                value={tempStart}
                onChange={(e) => setTempStart(e.target.value)}
                className="w-full text-[11px] p-1.5 border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] text-gray-400 dark:text-gray-500 font-medium mb-0.5">End Date</label>
              <input
                type="date"
                value={tempEnd}
                onChange={(e) => setTempEnd(e.target.value)}
                className="w-full text-[11px] p-1.5 border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-[#334155] flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setTempStart('2026-08-01');
                setTempEnd('2026-08-31');
                setViewDate(new Date(2026, 7, 1));
              }}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium px-2 py-1 rounded transition"
            >
              Reset
            </button>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#334155] font-medium px-2.5 py-1.5 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition"
              >
                <Check className="w-3.5 h-3.5" />
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Radio,
  ExternalLink,
  Plus,
} from 'lucide-react';

import type { LiveClass } from '../types/live-class.types';

interface CalendarViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: LiveClass[];
  onSelectClass: (liveClass: LiveClass) => void;
  onCreateNew: () => void;
}

export const CalendarViewModal: React.FC<
  CalendarViewModalProps
> = ({
  isOpen,
  onClose,
  classes,
  onSelectClass,
  onCreateNew,
}) => {
  /*
   * ---------------------------------------------------------
   * Calendar state
   * ---------------------------------------------------------
   */

  const today = useMemo(() => new Date(), []);

  const [currentYear, setCurrentYear] = useState(
    today.getFullYear(),
  );

  const [currentMonth, setCurrentMonth] = useState(
    today.getMonth(),
  );

  const [selectedDay, setSelectedDay] = useState<number | null>(
    today.getDate(),
  );

  /*
   * ---------------------------------------------------------
   * Reset calendar to today's date when modal opens
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!isOpen) return;

    const now = new Date();

    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDay(now.getDate());
  }, [isOpen]);

  if (!isOpen) return null;

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  /*
   * ---------------------------------------------------------
   * Month information
   * ---------------------------------------------------------
   */

  const daysInMonth = new Date(
    currentYear,
    currentMonth + 1,
    0,
  ).getDate();

  const firstDayOfWeek = new Date(
    currentYear,
    currentMonth,
    1,
  ).getDay();

  /*
   * ---------------------------------------------------------
   * Navigation
   * ---------------------------------------------------------
   */

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((year) => year - 1);
    } else {
      setCurrentMonth((month) => month - 1);
    }

    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((year) => year + 1);
    } else {
      setCurrentMonth((month) => month + 1);
    }

    setSelectedDay(null);
  };

  const handleToday = () => {
    const now = new Date();

    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDay(now.getDate());
  };

  /*
   * ---------------------------------------------------------
   * Convert class date into a real Date
   *
   * The backend-generated recurring instances use
   * isoDateTime when available.
   *
   * startTime is kept as fallback for existing records.
   * ---------------------------------------------------------
   */

  const getClassDate = (
    liveClass: LiveClass,
  ): Date | null => {
    if (liveClass.isoDateTime) {
      const date = new Date(
        liveClass.isoDateTime,
      );

      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }

    if (liveClass.startTime) {
      /*
       * Try normal date parsing first.
       */
      const parsed = new Date(
        liveClass.startTime,
      );

      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }

      /*
       * Fallback for formats such as:
       * "Sep 29, 2026 06:30 PM"
       */
      const fallback = new Date(
        liveClass.startTime,
      );

      if (!Number.isNaN(fallback.getTime())) {
        return fallback;
      }
    }

    return null;
  };

  /*
   * ---------------------------------------------------------
   * Classes for selected calendar day
   * ---------------------------------------------------------
   */

  const classesForDay = (
    day: number,
  ): LiveClass[] => {
    return classes.filter((liveClass) => {
      const classDate =
        getClassDate(liveClass);

      if (!classDate) {
        return false;
      }

      return (
        classDate.getFullYear() ===
          currentYear &&
        classDate.getMonth() ===
          currentMonth &&
        classDate.getDate() === day
      );
    });
  };

  const selectedDayClasses =
    selectedDay !== null
      ? classesForDay(selectedDay)
      : [];

  /*
   * ---------------------------------------------------------
   * Classes in current month
   * ---------------------------------------------------------
   */

  const currentMonthClasses = classes.filter(
    (liveClass) => {
      const classDate =
        getClassDate(liveClass);

      if (!classDate) {
        return false;
      }

      return (
        classDate.getFullYear() ===
          currentYear &&
        classDate.getMonth() ===
          currentMonth
      );
    },
  );

  /*
   * ---------------------------------------------------------
   * Is this actually today?
   * ---------------------------------------------------------
   */

  const isToday = (
    day: number,
  ) => {
    const now = new Date();

    return (
      day === now.getDate() &&
      currentMonth === now.getMonth() &&
      currentYear === now.getFullYear()
    );
  };

  /*
   * ---------------------------------------------------------
   * Class time
   * ---------------------------------------------------------
   */

  const getClassTime = (
    liveClass: LiveClass,
  ) => {
    const date =
      getClassDate(liveClass);

    if (!date) {
      return liveClass.startTime || '--';
    }

    return date.toLocaleTimeString(
      'en-IN',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl my-6 animate-in fade-in zoom-in-95">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CalendarIcon className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Live Classes Schedule Calendar
              </h2>

              <p className="text-xs text-slate-500">
                Visualize live broadcasts, recurring series, and room bookings.
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={onCreateNew}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Schedule Class</span>
            </button>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-200/80">

          <div className="flex items-center gap-2">

            <h3 className="text-sm font-extrabold text-slate-900 ml-1">
              {monthNames[currentMonth]} {currentYear}
            </h3>

            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
              {currentMonthClasses.length} Classes Active
            </span>

          </div>

          <div className="flex items-center gap-1.5">

            <button
              onClick={handleToday}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Today
            </button>

            <button
              onClick={handlePrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              onClick={handleNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

          </div>
        </div>

        {/* Calendar Grid & Sidebar */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Calendar */}
          <div className="lg:col-span-8 rounded-xl border border-slate-200 overflow-hidden">

            {/* Days */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-[11px] font-bold text-slate-600 py-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-white text-xs">

              {/* Empty cells */}
              {Array.from({
                length: firstDayOfWeek,
              }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="min-h-[72px] bg-slate-50/40 p-1.5 text-slate-300"
                />
              ))}

              {/* Actual days */}
              {Array.from({
                length: daysInMonth,
              }).map((_, index) => {
                const dayNum =
                  index + 1;

                const isSelected =
                  selectedDay ===
                  dayNum;

                const dayClasses =
                  classesForDay(
                    dayNum,
                  );

                const hasLive =
                  dayClasses.some(
                    (c) =>
                      c.status ===
                      'Live',
                  );

                return (
                  <div
                    key={`day-${dayNum}`}
                    onClick={() =>
                      setSelectedDay(
                        dayNum,
                      )
                    }
                    className={`min-h-[72px] p-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/50 ring-2 ring-blue-500/30 inset-ring'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >

                    <div className="flex items-center justify-between">

                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                          isToday(dayNum)
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : isSelected
                              ? 'bg-blue-200 text-blue-900'
                              : 'text-slate-700'
                        }`}
                      >
                        {dayNum}
                      </span>

                      {hasLive && (
                        <span
                          className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"
                          title="Live Now"
                        />
                      )}

                    </div>

                    {/* Class pills */}
                    <div className="mt-1 space-y-1">

                      {dayClasses
                        .slice(0, 2)
                        .map((cls) => (
                          <div
                            key={cls.id}
                            onClick={(event) => {
                              event.stopPropagation();
                              onSelectClass(
                                cls,
                              );
                            }}
                            className={`truncate rounded px-1 py-0.5 text-[9px] font-semibold transition-transform hover:scale-102 ${
                              cls.status ===
                              'Live'
                                ? 'bg-emerald-100 text-emerald-800'
                                : cls.status ===
                                    'Upcoming'
                                  ? 'bg-blue-100 text-blue-800'
                                  : cls.status ===
                                      'Completed'
                                    ? 'bg-slate-100 text-slate-700'
                                    : 'bg-rose-100 text-rose-700'
                            }`}
                            title={`${getClassTime(cls)} - ${cls.title}`}
                          >
                            {cls.title}
                          </div>
                        ))}

                      {dayClasses.length >
                        2 && (
                        <div className="text-[9px] font-bold text-slate-400 pl-0.5">
                          +
                          {dayClasses.length -
                            2}{' '}
                          more
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Day */}
          <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between">

            <div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">

                <span className="text-xs font-bold text-slate-800">
                  {selectedDay
                    ? `${monthNames[currentMonth]} ${selectedDay}, ${currentYear}`
                    : 'Select a day'}
                </span>

                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {selectedDayClasses.length}{' '}
                  {selectedDayClasses.length ===
                  1
                    ? 'class'
                    : 'classes'}
                </span>

              </div>

              <div className="mt-3 space-y-3 max-h-80 overflow-y-auto pr-1">

                {selectedDayClasses.length ===
                0 ? (
                  <div className="py-8 text-center text-slate-400">

                    <Clock className="mx-auto h-6 w-6 text-slate-300 mb-1" />

                    <p className="text-xs">
                      No classes scheduled for this date.
                    </p>

                  </div>
                ) : (
                  selectedDayClasses.map(
                    (cls) => (
                      <div
                        key={cls.id}
                        onClick={() =>
                          onSelectClass(
                            cls,
                          )
                        }
                        className="group rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs hover:border-blue-400 transition-all cursor-pointer"
                      >

                        <div className="flex items-center justify-between text-[10px] font-bold">

                          <span className="text-blue-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />

                            {getClassTime(
                              cls,
                            )}{' '}
                            ({cls.duration}m)
                          </span>

                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] ${
                              cls.status ===
                              'Live'
                                ? 'bg-emerald-100 text-emerald-700'
                                : cls.status ===
                                    'Upcoming'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {cls.status}
                          </span>

                        </div>

                        <div className="mt-1.5 font-bold text-xs text-slate-900 group-hover:text-blue-600 line-clamp-2">
                          {cls.title}
                        </div>

                        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500">

                          <span className="truncate max-w-[120px]">
                            {cls.instructor.name}
                          </span>

                          <span className="font-semibold text-slate-700">
                            {cls.platform}
                          </span>

                        </div>

                      </div>
                    ),
                  )
                )}

              </div>
            </div>

            <button
              onClick={onCreateNew}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/50 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>
                Add Class for This Date
              </span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};
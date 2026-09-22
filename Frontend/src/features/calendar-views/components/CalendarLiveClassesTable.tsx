import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Repeat,
  Radio,
  Clock,
  CheckCircle2,
  XCircle,
  Video,
  Play,
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarClock,
  List as ListIcon,
  Grid as GridIcon,
  Bell,
  MoreVertical,
  User,
  Users,
  ExternalLink,
} from 'lucide-react';
import type { CalendarLiveClass, CalendarViewMode, CalendarClassStatus } from '../types/calendar-live-class.types';

interface CalendarLiveClassesTableProps {
  classes: CalendarLiveClass[];
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  selectedDate: string;
  todayDateStr?: string;
  weekDays: {
    date: string;
    dayName: string;
    dayNum: number;
    monthName: string;
    isToday: boolean;
    fullDate: Date;
  }[];
  weekRangeLabel: string;
  currentTime: Date;
  onPrevPeriod: () => void;
  onNextPeriod: () => void;
  onGoToToday: () => void;
  onSelectDate: (date: string) => void;
  onViewDetails: (item: CalendarLiveClass) => void;
  onJoinLive: (item: CalendarLiveClass) => void;
  onViewRecording: (item: CalendarLiveClass) => void;
  onEditClass: (item: CalendarLiveClass) => void;
  onTriggerReminder: (item: CalendarLiveClass) => void;
  onOpenCreateModal: () => void;
}

const TIME_SLOTS = [
  { label: '3:00 PM', hour24: 15 },
  { label: '4:00 PM', hour24: 16 },
  { label: '5:00 PM', hour24: 17 },
  { label: '6:00 PM', hour24: 18 },
  { label: '7:00 PM', hour24: 19 },
  { label: '8:00 PM', hour24: 20 },
];

export const CalendarLiveClassesTable: React.FC<CalendarLiveClassesTableProps> = ({
  classes,
  viewMode,
  onViewModeChange,
  selectedDate,
  todayDateStr: propTodayDateStr,
  weekDays,
  weekRangeLabel,
  currentTime,
  onPrevPeriod,
  onNextPeriod,
  onGoToToday,
  onSelectDate,
  onViewDetails,
  onJoinLive,
  onViewRecording,
  onEditClass,
  onTriggerReminder,
  onOpenCreateModal,
}) => {
  const todayDateStr = React.useMemo(() => {
    if (propTodayDateStr) return propTodayDateStr;
    const now = currentTime || new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [propTodayDateStr, currentTime]);

  const formatDisplayDate = (dateStr: string, options?: Intl.DateTimeFormatOptions) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('en-US', options || {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const str = timeStr.trim();
    const match12 = str.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
    if (match12) {
      let hours = parseInt(match12[1], 10);
      const minutes = match12[2] ? parseInt(match12[2], 10) : 0;
      const meridian = match12[3].toUpperCase();
      if (meridian === 'PM' && hours < 12) hours += 12;
      if (meridian === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    }
    const match24 = str.match(/^(\d{1,2}):(\d{2})/);
    if (match24) {
      const hours = parseInt(match24[1], 10);
      const minutes = parseInt(match24[2], 10);
      return hours * 60 + minutes;
    }
    return 0;
  };

  const parseDateToTimestamp = (dateStr: string): number => {
    if (!dateStr) return 0;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m - 1, d).getTime();
      }
    }
    const t = new Date(dateStr).getTime();
    return isNaN(t) ? 0 : t;
  };

  const dayClasses = React.useMemo(() => {
    return classes
      .filter((c) => c.date === selectedDate)
      .sort((a, b) => {
        const timeA = parseTimeToMinutes(a.startTime);
        const timeB = parseTimeToMinutes(b.startTime);
        return timeA - timeB;
      });
  }, [classes, selectedDate]);

  // Day Detail Modal state - opens when a date is clicked in Month view
  const [dayDetailDate, setDayDetailDate] = React.useState<string | null>(null);

  const dayDetailClasses = React.useMemo(() => {
    if (!dayDetailDate) return [];
    return classes
      .filter((c) => c.date === dayDetailDate)
      .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));
  }, [classes, dayDetailDate]);

  const groupedListClasses = React.useMemo(() => {
    const sorted = [...classes].sort((a, b) => {
      const dateA = a.date || '';
      const dateB = b.date || '';
      if (dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }
      return parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime);
    });

    const groupsMap = new Map<string, CalendarLiveClass[]>();
    for (const item of sorted) {
      const d = item.date;
      if (!groupsMap.has(d)) {
        groupsMap.set(d, []);
      }
      groupsMap.get(d)!.push(item);
    }

    return Array.from(groupsMap.entries()).map(([dateStr, items]) => {
      const [year, month, day] = dateStr.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      const label = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })
        : dateStr;

      return {
        date: dateStr,
        label,
        items,
      };
    });
  }, [classes]);

  const getTeacherInitials = (name: string) => {
    if (!name) return 'T';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const getTeacherAvatarBg = (name: string) => {
    if (name.includes('Rahul')) return 'bg-amber-500';
    if (name.includes('Amit')) return 'bg-purple-600';
    if (name.includes('Neha')) return 'bg-fuchsia-500';
    if (name.includes('Ankit')) return 'bg-sky-500';
    if (name.includes('Pooja')) return 'bg-indigo-500';
    const colors = ['bg-amber-500', 'bg-purple-600', 'bg-fuchsia-500', 'bg-sky-500', 'bg-indigo-500', 'bg-teal-500', 'bg-rose-500'];
    const code = (name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0);
    return colors[code % colors.length];
  };

  const getSubjectIndicatorColor = (subject: string) => {
    switch (subject) {
      case 'Mathematics':
        return 'bg-emerald-500';
      case 'English':
        return 'bg-blue-500';
      case 'Chemistry':
        return 'bg-purple-500';
      case 'Physics':
        return 'bg-cyan-500';
      case 'Biology':
        return 'bg-rose-500';
      default:
        return 'bg-indigo-500';
    }
  };

  const renderStatusBadge = (status: CalendarClassStatus) => {
    switch (status) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Scheduled
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Cancelled
          </span>
        );
    }
  };

  const findClassAt = (date: string, hour24: number): CalendarLiveClass | undefined => {
    return classes.find((c) => {
      if (c.date !== date) return false;
      const startMinutes = parseTimeToMinutes(c.startTime);
      const slotStart = hour24 * 60;
      const slotEnd = (hour24 + 1) * 60;
      return startMinutes >= slotStart && startMinutes < slotEnd;
    });
  };

  const getSubjectCardStyles = (item: CalendarLiveClass) => {
    switch (item.title) {
      case 'Mathematics':
        return {
          cardBg: 'bg-emerald-50/60 hover:bg-emerald-50 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/15 border-emerald-200/90 dark:border-emerald-500/30 text-emerald-950 dark:text-emerald-200',
          titleColor: 'text-emerald-800 dark:text-emerald-300',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
        };
      case 'Physics':
        return {
          cardBg: 'bg-sky-50/60 hover:bg-sky-50 dark:bg-sky-500/10 dark:hover:bg-sky-500/15 border-sky-200/90 dark:border-sky-500/30 text-sky-950 dark:text-sky-200',
          titleColor: 'text-sky-800 dark:text-sky-300',
          iconColor: 'text-sky-600 dark:text-sky-400',
        };
      case 'Chemistry':
        return {
          cardBg: 'bg-amber-50/60 hover:bg-amber-50 dark:bg-amber-500/10 dark:hover:bg-amber-500/15 border-amber-200/90 dark:border-amber-500/30 text-amber-950 dark:text-amber-200',
          titleColor: 'text-amber-800 dark:text-amber-300',
          iconColor: 'text-amber-600 dark:text-amber-400',
        };
      case 'Biology':
        return {
          cardBg: 'bg-teal-50/60 hover:bg-teal-50 dark:bg-teal-500/10 dark:hover:bg-teal-500/15 border-teal-200/90 dark:border-teal-500/30 text-teal-950 dark:text-teal-200',
          titleColor: 'text-teal-800 dark:text-teal-300',
          iconColor: 'text-teal-600 dark:text-teal-400',
        };
      case 'English':
        return {
          cardBg: 'bg-rose-50/60 hover:bg-rose-50 dark:bg-rose-500/10 dark:hover:bg-rose-500/15 border-rose-200/90 dark:border-rose-500/30 text-rose-950 dark:text-rose-200',
          titleColor: 'text-rose-800 dark:text-rose-300',
          iconColor: 'text-rose-600 dark:text-rose-400',
        };
      default:
        return {
          cardBg: 'bg-indigo-50/60 hover:bg-indigo-50 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/15 border-indigo-200/90 dark:border-indigo-500/30 text-indigo-950 dark:text-indigo-200',
          titleColor: 'text-indigo-800 dark:text-indigo-300',
          iconColor: 'text-indigo-600 dark:text-indigo-400',
        };
    }
  };

  return (
    <div id="calender-views-table-wrapper" className="space-y-4">
      {/* View Switcher & Navigation Header */}
      <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] shadow-xs p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center p-1 bg-gray-100/90 dark:bg-[#0F172A] rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400">
          <button
            id="view-tab-day"
            type="button"
            onClick={() => {
              onViewModeChange('day');
              onGoToToday();
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-150 cursor-pointer hover:scale-110 active:scale-95 ${
              viewMode === 'day' ? 'bg-blue-600 text-white shadow-xs' : 'hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Today
          </button>

          <button
            id="view-tab-week"
            type="button"
            onClick={() => onViewModeChange('week')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-150 cursor-pointer hover:scale-110 active:scale-95 ${
              viewMode === 'week' ? 'bg-blue-600 text-white shadow-xs' : 'hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Week
          </button>

          <button
            id="view-tab-month"
            type="button"
            onClick={() => onViewModeChange('month')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-150 cursor-pointer hover:scale-110 active:scale-95 ${
              viewMode === 'month' ? 'bg-blue-600 text-white shadow-xs' : 'hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            Month
          </button>

          <button
            id="view-tab-list"
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-150 cursor-pointer hover:scale-110 active:scale-95 ${
              viewMode === 'list' ? 'bg-blue-600 text-white shadow-xs' : 'hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <ListIcon className="w-3.5 h-3.5" />
            List
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="date-prev-btn"
            type="button"
            onClick={onPrevPeriod}
            className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#334155] flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#334155] transition cursor-pointer"
            title="Previous Period"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-3 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200 select-none">
            {viewMode === 'day' ? (
              <span>{formatDisplayDate(selectedDate, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            ) : viewMode === 'month' ? (
              <span>{formatDisplayDate(selectedDate, { month: 'long', year: 'numeric' })}</span>
            ) : (
              <span>{weekRangeLabel}</span>
            )}
          </div>

          <button
            id="date-next-btn"
            type="button"
            onClick={onNextPeriod}
            className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#334155] flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#334155] transition cursor-pointer"
            title="Next Period"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* <button
            id="date-today-btn"
            type="button"
            onClick={onGoToToday}
            className="ml-1 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#334155] rounded-lg hover:bg-gray-50 dark:hover:bg-[#334155] transition cursor-pointer shadow-2xs"
          >
            Today
          </button> */}
        </div>
      </div>

      {viewMode !== 'list' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] shadow-xs overflow-hidden">

      {viewMode === 'week' && (
        <div className="overflow-x-auto">
          <div className="min-w-[840px]">
            <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-gray-200 dark:border-[#334155] bg-gray-50/60 dark:bg-[#0F172A] text-xs">
              <div className="p-3 border-r border-gray-200 dark:border-[#334155] font-medium text-gray-400 dark:text-gray-500 text-center">
                Time
              </div>
              {weekDays.map((w) => (
                <div
                  key={w.date}
                  onClick={() => onSelectDate(w.date)}
                  className={`p-3 text-center border-r border-gray-200 dark:border-[#334155] last:border-r-0 cursor-pointer transition hover:bg-blue-50/40 dark:hover:bg-blue-500/10 ${
                    w.date === selectedDate ? 'bg-blue-50/30 dark:bg-blue-500/10' : ''
                  }`}
                >
                  <div
                    className={`font-medium mb-1 ${
                      w.isToday || w.date === selectedDate ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {w.dayName}
                  </div>
                  <div
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                      w.isToday
                        ? 'bg-blue-600 text-white shadow-xs'
                        : w.date === selectedDate
                        ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-extrabold'
                        : 'text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {w.dayNum}
                  </div>
                </div>
              ))}
            </div>

            <div className="divide-y divide-gray-100 dark:divide-[#334155]">
              {TIME_SLOTS.map((slot) => (
                <div
                  key={slot.label}
                  className="grid grid-cols-[80px_repeat(7,1fr)] min-h-[92px] group"
                >
                  <div className="p-2 border-r border-gray-200 dark:border-[#334155] text-xs font-medium text-gray-500 dark:text-gray-400 text-center flex items-start justify-center pt-3 bg-gray-50/30 dark:bg-[#0F172A]/40">
                    {slot.label}
                  </div>

                  {weekDays.map((w) => {
                    const classItem = findClassAt(w.date, slot.hour24);
                    return (
                      <div
                        key={w.date}
                        className={`p-1.5 border-r border-gray-100 dark:border-[#334155] last:border-r-0 relative transition flex flex-col justify-center ${
                          w.date === selectedDate ? 'bg-blue-50/10 dark:bg-blue-500/5' : ''
                        }`}
                      >
                        {classItem ? (
                          (() => {
                            const styles = getSubjectCardStyles(classItem);
                            return (
                              <div
                                id={`class-card-${classItem.id}`}
                                onClick={() => onViewDetails(classItem)}
                                className={`h-full min-h-[80px] p-2 rounded-xl border ${styles.cardBg} transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-lg hover:scale-[1.03] hover:z-20 relative flex flex-col justify-between group/card origin-center`}
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <span className={`text-xs font-bold ${styles.titleColor} truncate`}>
                                    {classItem.title}
                                  </span>
                                  {classItem.isRecurring && (
                                    <span
                                      title="Recurring class"
                                      className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
                                    >
                                      <Repeat className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                                    </span>
                                  )}
                                </div>

                                <div className="text-[11px] text-gray-600 dark:text-gray-400 truncate mt-0.5">
                                  {classItem.teacherName}
                                </div>

                                <div className="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">
                                  {classItem.formattedTimeRange}
                                </div>

                                <div className="flex items-center justify-end mt-1">
                                  {renderStatusBadge(classItem.status)}
                                </div>

                                <div className="absolute inset-0 bg-white/95 dark:bg-[#1E293B]/97 backdrop-blur-xs rounded-xl p-2 opacity-0 scale-95 group-hover/card:opacity-100 group-hover/card:scale-100 transition-all duration-200 origin-center flex flex-col justify-center gap-1.5 shadow-md">
                                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-800 dark:text-gray-100">
                                    <span className="truncate">{classItem.title}</span>
                                    <span className="text-[9px] text-gray-500 dark:text-gray-400">{classItem.formattedTimeRange}</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1 mt-1">
                                    {classItem.status === 'live' ? (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onJoinLive(classItem);
                                        }}
                                        className="col-span-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold flex items-center justify-center gap-1 shadow-xs"
                                      >
                                        <Video className="w-3 h-3" />
                                        Join Live Room
                                      </button>
                                    ) : classItem.status === 'completed' ? (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onViewRecording(classItem);
                                        }}
                                        className="col-span-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[10px] font-bold flex items-center justify-center gap-1 shadow-xs"
                                      >
                                        <Play className="w-3 h-3" />
                                        View Recording
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onTriggerReminder(classItem);
                                        }}
                                        className="col-span-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[10px] font-bold flex items-center justify-center gap-1 shadow-xs"
                                      >
                                        <Bell className="w-3 h-3" />
                                        Send Reminders
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onViewDetails(classItem);
                                      }}
                                      className="py-1 bg-gray-100 dark:bg-[#334155] hover:bg-gray-200 dark:hover:bg-[#3f4f68] text-gray-700 dark:text-gray-200 rounded-md text-[10px] font-medium"
                                    >
                                      Details
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditClass(classItem);
                                      }}
                                      className="py-1 bg-gray-100 dark:bg-[#334155] hover:bg-gray-200 dark:hover:bg-[#3f4f68] text-gray-700 dark:text-gray-200 rounded-md text-[10px] font-medium"
                                    >
                                      Edit
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="h-full min-h-[80px] rounded-lg border border-dashed border-gray-100 dark:border-[#334155] hover:border-gray-300 dark:hover:border-[#475569] hover:bg-gray-50/50 dark:hover:bg-[#0F172A]/50 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">+ Free Slot</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-gray-100 dark:border-[#334155] bg-gray-50/40 dark:bg-[#0F172A]/40 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Repeat className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                <span>Recurring class</span>
              </div>
              <div className="text-[11px] text-gray-400 dark:text-gray-500">
                Click on any session card to view details, join virtual classroom, or blast participant alerts.
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'day' && (
        <div id="day-view-container" className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-[#334155] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                  Schedule for {formatDisplayDate(selectedDate)}
                </h3>
                {selectedDate === todayDateStr && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 tracking-wide">
                    TODAY
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Showing {dayClasses.length} {dayClasses.length === 1 ? 'class session' : 'class sessions'} for this day matching active filters.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>Current Time: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          </div>

          {dayClasses.length === 0 ? (
            <div className="py-12 px-4 text-center border-2 border-dashed border-gray-200 dark:border-[#334155] rounded-xl bg-gray-50/50 dark:bg-[#0F172A]/50">
              <CalendarIcon className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">No Live Classes Scheduled</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
                There are no classes scheduled for {formatDisplayDate(selectedDate)} matching your current filter selection.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayClasses.map((item) => {
                const styles = getSubjectCardStyles(item);
                return (
                  <div
                    key={item.id}
                    id={`day-class-card-${item.id}`}
                    onClick={() => onViewDetails(item)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-200/90 dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xs transition cursor-pointer group"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="shrink-0 w-24 text-center py-2 px-2.5 rounded-lg bg-gray-50 dark:bg-[#0F172A] border border-gray-200/80 dark:border-[#334155] group-hover:border-blue-200 dark:group-hover:border-blue-500/30 group-hover:bg-blue-50/30 dark:group-hover:bg-blue-500/10 transition">
                        <div className="text-xs font-bold text-gray-900 dark:text-gray-100">{item.formattedTimeRange.split(' - ')[0] || item.startTime}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-500 font-medium">to {item.formattedTimeRange.split(' - ')[1] || item.endTime}</div>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`font-bold text-sm ${styles.titleColor}`}>{item.title}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">• {item.courseName}</span>
                          {renderStatusBadge(item.status)}
                          {item.isRecurring && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 dark:text-gray-500 font-medium" title="Recurring class">
                              <Repeat className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                              <span>Recurring</span>
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                            <span>Teacher: <strong className="text-gray-800 dark:text-gray-200">{item.teacherName}</strong></span>
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">Room: <strong className="text-gray-700 dark:text-gray-300">{item.roomName}</strong></span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                            <span>Enrolled: <strong>{item.currentEnrollment}/{item.maxParticipants}</strong></span>
                          </span>
                          <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                            <Bell className="w-3 h-3 text-indigo-400 dark:text-indigo-400" />
                            <span>Auto-reminders {item.automatedReminders?.enabled ? 'Active' : 'Off'} ({item.automatedReminders?.autoSentCount || 0} sent)</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0" onClick={(e) => e.stopPropagation()}>
                      {item.status === 'live' && (
                        <button
                          type="button"
                          onClick={() => onJoinLive(item)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Join Live
                        </button>
                      )}
                      {item.status === 'completed' && (
                        <button
                          type="button"
                          onClick={() => onViewRecording(item)}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Watch
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onTriggerReminder(item)}
                        className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-xs font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        Remind
                      </button>
                      <button
                        type="button"
                        onClick={() => onViewDetails(item)}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-[#334155] text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#3f4f68] text-xs font-medium rounded-lg transition cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditClass(item)}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-[#334155] text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#3f4f68] text-xs font-medium rounded-lg transition cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {viewMode === 'month' && (
        <div className="p-4">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, idx) => {
              const dayNumber = idx - 2;
              const isValidDay = dayNumber >= 1 && dayNumber <= 31;
              const dateStr = `2026-08-${String(dayNumber).padStart(2, '0')}`;
              const dayClasses = classes.filter((c) => c.date === dateStr);
              const isSelected = dateStr === selectedDate;
              const isToday = dayNumber === 20;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (isValidDay) {
                      onSelectDate(dateStr);
                      setDayDetailDate(dateStr);
                    }
                  }}
                  className={`group relative min-h-[90px] rounded-xl border transition-all duration-200 cursor-pointer origin-center ${
                    !isValidDay
                      ? 'bg-gray-50/40 dark:bg-[#0F172A]/40 border-gray-100 dark:border-[#334155] opacity-40 cursor-default'
                      : isSelected
                      ? 'border-blue-400 dark:border-blue-500/50 bg-blue-50/30 dark:bg-blue-500/10 hover:scale-[1.03] hover:shadow-lg hover:z-20'
                      : 'border-gray-200 dark:border-[#334155] hover:border-blue-300 dark:hover:border-blue-500/50 hover:scale-[1.03] hover:shadow-lg hover:z-20'
                  }`}
                >
                  {/* Base compact cell (always visible, normal grid size) */}
                  <div className="p-1.5 h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                          isToday ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {isValidDay ? dayNumber : ''}
                      </span>
                      {dayClasses.length > 0 && (
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">{dayClasses.length} cls</span>
                      )}
                    </div>

                    <div className="space-y-1 mt-1">
                      {dayClasses.slice(0, 2).map((item) => (
                        <div
                          key={item.id}
                          className={`text-[9px] px-1.5 py-0.5 rounded font-medium truncate ${
                            item.status === 'live'
                              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                              : item.status === 'completed'
                              ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300'
                              : item.status === 'cancelled'
                              ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300'
                              : 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300'
                          }`}
                        >
                          {item.title}
                        </div>
                      ))}
                      {dayClasses.length > 2 && (
                        <div className="text-[9px] text-gray-400 dark:text-gray-500 text-right">+{dayClasses.length - 2} more</div>
                      )}
                    </div>
                  </div>

                  {/* Hover overlay: anchored to the same top-left position as the cell, expands downward to show ALL classes */}
                  {isValidDay && dayClasses.length > 0 && (
                    <div
                      className="absolute top-0 left-0 right-0 z-30 flex flex-col p-2 rounded-xl border border-blue-200 dark:border-blue-500/40 bg-white dark:bg-[#1E293B] shadow-xl opacity-0 scale-95 pointer-events-none origin-top transition-all duration-200 ease-out group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto"
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                            isToday ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {dayNumber}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">{dayClasses.length} cls</span>
                      </div>

                      <div className="space-y-1 max-h-40 overflow-y-auto pr-0.5">
                        {dayClasses.map((item) => (
                          <div
                            key={item.id}
                            className={`text-[9px] px-1.5 py-1 rounded-md font-medium truncate ${
                              item.status === 'live'
                                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                                : item.status === 'completed'
                                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300'
                                : item.status === 'cancelled'
                                ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300'
                                : 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300'
                            }`}
                          >
                            {item.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hover overlay for empty dates - anchored to the same cell position with a "no classes" message */}
                  {isValidDay && dayClasses.length === 0 && (
                    <div
                      className="absolute top-0 left-0 right-0 z-30 flex flex-col items-center justify-center gap-0.5 p-2.5 rounded-xl border border-dashed border-blue-300 dark:border-blue-500/50 bg-white dark:bg-[#1E293B] shadow-xl opacity-0 scale-95 pointer-events-none origin-top transition-all duration-200 ease-out group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto"
                      style={{ minHeight: '90px' }}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mb-1 ${
                          isToday ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {dayNumber}
                      </span>
                      <CalendarIcon className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                      <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 text-center leading-tight">
                        No classes on this date
                      </p>
                      <p className="text-[9px] text-blue-500 dark:text-blue-400 font-bold">
                        Click to schedule one
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )}

  {viewMode === 'list' && (
    <div id="list-view-container" className="space-y-4">
      {groupedListClasses.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#334155] flex items-center justify-center mx-auto mb-3 text-gray-400 dark:text-gray-500">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">No scheduled classes</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No classes match your current filters or date range.</p>
        </div>
      ) : (
        groupedListClasses.map((group) => (
          <div
            key={group.date}
            id={`list-day-group-${group.date}`}
            className="rounded-xl border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] overflow-hidden shadow-2xs"
          >
            <div className="px-4 py-2.5 border-b border-gray-200/80 dark:border-[#334155] text-sm font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-[#1E293B]">
              <span>{group.label}</span>
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                ({group.items.length} {group.items.length === 1 ? 'class' : 'classes'})
              </span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-[#334155]">
              {group.items.map((c) => (
                <button
                  key={c.id}
                  id={`list-item-${c.id}`}
                  type="button"
                  onClick={() => onViewDetails(c)}
                  className="w-full relative flex items-center gap-3 px-4 py-3 text-left border border-transparent hover:bg-gray-50/70 dark:hover:bg-[#26344a]/70 hover:border-blue-200 dark:hover:border-blue-500/30 hover:shadow-md hover:scale-[1.015] hover:z-10 transition-all duration-150 origin-center rounded-lg cursor-pointer group"
                >
                  <span className={`h-8 w-1.5 rounded-full shrink-0 ${getSubjectIndicatorColor(c.title)}`} />

                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0 ${getTeacherAvatarBg(
                      c.teacherName
                    )}`}
                  >
                    {getTeacherInitials(c.teacherName)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {c.title}
                      </span>
                      {c.isRecurring && (
                        <Repeat className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" title="Recurring class" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {c.teacherName} · {c.topics?.[0] || c.courseName || c.description}
                    </div>
                  </div>

                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 hidden sm:block whitespace-nowrap">
                    {c.formattedTimeRange.replace('-', '–')}
                  </div>

                  <div className="shrink-0">
                    {renderStatusBadge(c.status)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )}

  {/* Day Detail Modal - opens on clicking any date in Month view */}
  {dayDetailDate && (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={() => setDayDetailDate(null)}
    >
      <div
        className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 dark:border-[#334155] p-5 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-[#334155]">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {formatDisplayDate(dayDetailDate)}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {dayDetailClasses.length} {dayDetailClasses.length === 1 ? 'class' : 'classes'} scheduled
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDayDetailDate(null)}
            className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-[#334155] flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>

        {dayDetailClasses.length === 0 ? (
          <div className="py-10 text-center">
            <CalendarIcon className="w-9 h-9 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              No video on this date
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
              Is date par koi class schedule nahi hai.
            </p>
            <button
              type="button"
              onClick={() => {
                setDayDetailDate(null);
                onSelectDate(dayDetailDate);
                onOpenCreateModal();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              + Create new class
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {dayDetailClasses.map((item) => {
              const styles = getSubjectCardStyles(item);
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setDayDetailDate(null);
                    onViewDetails(item);
                  }}
                  className={`p-3 rounded-xl border ${styles.cardBg} cursor-pointer transition-all duration-150 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-bold ${styles.titleColor}`}>{item.title}</span>
                    {renderStatusBadge(item.status)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {item.teacherName} · {item.formattedTimeRange}
                  </div>
                </div>
              );
            })}

            <div className="flex justify-end mt-3">
              <button
                type="button"
                onClick={() => {
                  setDayDetailDate(null);
                  onSelectDate(dayDetailDate);
                  onOpenCreateModal();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 shadow-2xs hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-500 dark:hover:text-white dark:hover:border-blue-400 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
              >
                <span className="text-sm leading-none">+</span>
                Add another class on this date
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )}
</div>
);
};
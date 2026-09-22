import React, { useState, useMemo } from 'react';
import {
  Bell,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  Send,
} from 'lucide-react';
import { useCalendarLiveClasses } from '../hooks/useCalendarLiveClasses';
import { CalendarLiveClassesFilters } from '../components/CalendarLiveClassesFilters';
import { CalendarLiveClassesKPI } from '../components/CalendarLiveClassesKPI';
import { CalendarLiveClassesTable } from '../components/CalendarLiveClassesTable';
import { CalendarCreateLiveClassModal } from '../components/CalendarCreateLiveClassModal';
import { CalendarEditLiveClassModal } from '../components/CalendarEditLiveClassModal';
import { CalendarClassDetailsModal } from '../components/CalendarClassDetailsModal';
import { CalendarJoinLiveModal } from '../components/CalendarJoinLiveModal';
import { CalendarViewRecordingModal } from '../components/CalendarViewRecordingModal';

export const CalendarViewsPage: React.FC = () => {
  const {
    classes,
    filteredClasses,
    loading,
    currentTime,
    todayDateStr,
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
    filters,
    setFilters,
    weeklyKPIs,
    weekDays,
    weekRangeLabel,
    reminderLogs,
    toastMessage,
    // Modals
    createModalOpen,
    setCreateModalOpen,
    editModalItem,
    setEditModalItem,
    detailsModalItem,
    setDetailsModalItem,
    joinModalItem,
    setJoinModalItem,
    recordingModalItem,
    setRecordingModalItem,
    // Actions
    handlePrevPeriod,
    handleNextPeriod,
    handleGoToToday,
    handleCreateClass,
    handleUpdateClass,
    handleDeleteClass,
    handleTriggerRemindersNow,
    handleResetData,
    handleExport,
    showToast,
  } = useCalendarLiveClasses();

  // Mini Calendar current month state (defaults to current month and year)
  const [miniCalMonth, setMiniCalMonth] = useState(() => new Date().getMonth());
  const [miniCalYear, setMiniCalYear] = useState(() => new Date().getFullYear());

  const miniCalDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  // Dynamically compute calendar days for any month/year
  const miniCalGrid = useMemo(() => {
    const firstDayOfMonth = new Date(miniCalYear, miniCalMonth, 1);
    const lastDayOfMonth = new Date(miniCalYear, miniCalMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Day of week: 0=Sun, 1=Mon... Monday is idx 0
    const startDay = firstDayOfMonth.getDay();
    const startOffset = startDay === 0 ? 6 : startDay - 1;

    const prevMonthLastDay = new Date(miniCalYear, miniCalMonth, 0).getDate();
    const cells: { num: number; inMonth: boolean; dateStr: string }[] = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      cells.push({ num: prevMonthLastDay - i, inMonth: false, dateStr: '' });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(miniCalMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      cells.push({ num: d, inMonth: true, dateStr: `${miniCalYear}-${mStr}-${dStr}` });
    }
    const remaining = 42 - cells.length;
    for (let n = 1; n <= remaining; n++) {
      cells.push({ num: n, inMonth: false, dateStr: '' });
    }
    return cells;
  }, [miniCalYear, miniCalMonth]);

  return (
    <div className="space-y-5">
      {/* Toast Notification Pop-in */}
      {toastMessage && (
        <div
          id="system-toast-banner"
          className="fixed bottom-5 right-5 z-50 max-w-md bg-white dark:bg-[#1E293B] border border-gray-200/90 dark:border-[#334155] shadow-xl rounded-xl p-3.5 flex items-start gap-3 animate-slideUp transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">{toastMessage.title}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      {/* Header Row: Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Calendar Views</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage and view all scheduled classes of teachers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            id="header-export-btn"
            onClick={() => handleExport('csv')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-[#334155] rounded-xl hover:bg-gray-50 dark:hover:bg-[#26344a] shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            Export
          </button>

          <button
            type="button"
            id="header-schedule-class-btn"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs hover:shadow transition"
          >
            <Plus className="w-4 h-4" />
            Schedule Class
          </button>
        </div>
      </div>

      {/* Real-time Automated Reminders Status Banner */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-blue-950 text-white p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm border border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300">
            <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs">Live Clock &amp; Automated Reminders Engine:</span>
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider">
                Running
              </span>
            </div>
            <p className="text-[11px] text-blue-200">
              Current Actual Time: <span className="font-mono font-bold text-white">{currentTime.toLocaleTimeString()}</span> ({currentTime.toLocaleDateString()}). Automated reminders fire for enrolled students before start time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetData}
            className="px-2.5 py-1 text-[11px] bg-white/10 hover:bg-white/20 text-blue-100 rounded-lg font-medium transition"
          >
            Restore 24 Aug Classes
          </button>
          <button
            type="button"
            onClick={() => {
              if (classes[0]) {
                handleTriggerRemindersNow(classes[0]);
              }
            }}
            className="px-3 py-1 text-[11px] bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs transition"
          >
            <Send className="w-3 h-3" />
            Test Reminder Blast
          </button>
        </div>
      </div>

      {/* TWO-COLUMN GRID: MAIN TIMETABLE + RIGHT SIDEBAR (MINI CALENDAR & SUMMARY) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">
        {/* Left Area: Filters & Timetable */}
        <div className="space-y-4">
          {/* Filters Component */}
          <CalendarLiveClassesFilters
            filters={filters}
            onFilterChange={(newFilters) => {
              setFilters(newFilters);
              if (newFilters.dateRange?.start && newFilters.dateRange.start !== filters.dateRange?.start) {
                setSelectedDate(newFilters.dateRange.start);
              }
            }}
            onResetFilters={() => {
              setFilters({
                searchQuery: '',
                teacherId: 'all',
                courseId: 'all',
                status: 'all',
                dateRange: { start: '2026-08-01', end: '2026-08-31' },
              });
              showToast('Filters Cleared', 'Displaying all scheduled courses and instructors', 'info');
            }}
            onSyncDates={handleGoToToday}
          />

          {/* Main Timetable Component */}
          <CalendarLiveClassesTable
            classes={filteredClasses}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            selectedDate={selectedDate}
            todayDateStr={todayDateStr}
            weekDays={weekDays}
            weekRangeLabel={weekRangeLabel}
            currentTime={currentTime}
            onPrevPeriod={handlePrevPeriod}
            onNextPeriod={handleNextPeriod}
            onGoToToday={handleGoToToday}
            onSelectDate={setSelectedDate}
            onViewDetails={setDetailsModalItem}
            onJoinLive={setJoinModalItem}
            onViewRecording={setRecordingModalItem}
            onEditClass={setEditModalItem}
            onTriggerReminder={handleTriggerRemindersNow}
          />
        </div>

        {/* Right Area: Mini Calendar, Status Legend & Weekly Summary */}
        <div className="space-y-4">
          {/* Mini Calendar Widget */}
          <div
            id="mini-calendar-widget"
            className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200/90 dark:border-[#334155] p-4 shadow-xs"
          >
            <div className="flex items-center justify-between mb-3 text-xs">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Mini Calendar</h3>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200 mb-2 px-1">
              <button
                type="button"
                onClick={() => {
                  if (miniCalMonth === 0) {
                    setMiniCalMonth(11);
                    setMiniCalYear(miniCalYear - 1);
                  } else {
                    setMiniCalMonth(miniCalMonth - 1);
                  }
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-[#334155] rounded text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span>{new Date(miniCalYear, miniCalMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>

              <button
                type="button"
                onClick={() => {
                  if (miniCalMonth === 11) {
                    setMiniCalMonth(0);
                    setMiniCalYear(miniCalYear + 1);
                  } else {
                    setMiniCalMonth(miniCalMonth + 1);
                  }
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-[#334155] rounded text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-gray-400 dark:text-gray-500 mb-1">
              {miniCalDays.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Date Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
              {miniCalGrid.map((item, idx) => {
                const isSelected = item.inMonth && item.dateStr === selectedDate;
                const isToday = item.inMonth && item.dateStr === todayDateStr;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (item.inMonth && item.dateStr) {
                        setSelectedDate(item.dateStr);
                      }
                    }}
                    className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center transition text-[11px] cursor-pointer ${
                      !item.inMonth
                        ? 'text-gray-300 dark:text-gray-600 pointer-events-none'
                        : isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : isToday
                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-500/20'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#334155]'
                    }`}
                  >
                    {item.num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Legend Widget */}
          <div
            id="status-legend-widget"
            className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200/90 dark:border-[#334155] p-4 shadow-xs space-y-3"
          >
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-xs">Status Legend</h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0 animate-pulse" />
                <div>
                  <span className="font-bold text-gray-800 dark:text-gray-200 block text-[11px]">Live</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">Class is currently in progress</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0" />
                <div>
                  <span className="font-bold text-gray-800 dark:text-gray-200 block text-[11px]">Scheduled</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">Class is scheduled</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                <div>
                  <span className="font-bold text-gray-800 dark:text-gray-200 block text-[11px]">Completed</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">Class has been completed</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
                <div>
                  <span className="font-bold text-gray-800 dark:text-gray-200 block text-[11px]">Cancelled</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">Class has been cancelled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Summary KPIs */}
          <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200/90 dark:border-[#334155] p-4 shadow-xs">
            <CalendarLiveClassesKPI
              summary={weeklyKPIs}
              onFilterByStatus={(st) => setFilters({ ...filters, status: st })}
            />
          </div>
        </div>
      </div>

      {/* ALL MODALS */}
      <CalendarCreateLiveClassModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateClass}
      />

      <CalendarEditLiveClassModal
        item={editModalItem}
        onClose={() => setEditModalItem(null)}
        onUpdate={handleUpdateClass}
        onDelete={handleDeleteClass}
      />

      <CalendarClassDetailsModal
        item={detailsModalItem}
        onClose={() => setDetailsModalItem(null)}
        onJoinLive={setJoinModalItem}
        onViewRecording={setRecordingModalItem}
        onEditClass={(item) => {
          setDetailsModalItem(null);
          setEditModalItem(item);
        }}
        onTriggerReminders={handleTriggerRemindersNow}
      />

      <CalendarJoinLiveModal
        item={joinModalItem}
        onClose={() => setJoinModalItem(null)}
      />

      <CalendarViewRecordingModal
        item={recordingModalItem}
        onClose={() => setRecordingModalItem(null)}
      />
    </div>
  );
};
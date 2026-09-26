import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, Video, Bell } from 'lucide-react';
import type { CalendarLiveClass } from '../types/calendar-live-class.types';

interface CalendarViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: CalendarLiveClass[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onViewClassDetails: (item: CalendarLiveClass) => void;
  onOpenCreateModal: () => void;
}

export const CalendarViewModal: React.FC<CalendarViewModalProps> = ({
  isOpen,
  onClose,
  classes,
  selectedDate,
  onSelectDate,
  onViewClassDetails,
  onOpenCreateModal,
}) => {
  const [currentMonth, setCurrentMonth] = useState(7); // August (0-indexed: 7)
  const [currentYear, setCurrentYear] = useState(2026);

  if (!isOpen) return null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Build calendar matrix
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // Sunday=0, Monday=1
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  // Adjust so Monday is 0
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const totalCells = Math.ceil((daysInMonth + startOffset) / 7) * 7;

  return (
    <div
      id="calendar-view-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="calendar-view-modal-card"
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-gray-100 p-6 flex flex-col max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Interactive Master Calendar</h2>
              <p className="text-xs text-gray-500">Explore all academic live sessions, exam revisions, and scheduled batches.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Schedule Class
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center justify-between my-4">
          <h3 className="font-bold text-gray-800 text-base">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="font-semibold text-gray-400 py-2">
              {day}
            </div>
          ))}

          {Array.from({ length: totalCells }).map((_, idx) => {
            const dayNum = idx - startOffset + 1;
            const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayClasses = isCurrentMonth ? classes.filter((c) => c.date === dateStr) : [];
            const isToday = isCurrentMonth && currentMonth === 7 && dayNum === 20;

            return (
              <div
                key={idx}
                onClick={() => {
                  if (isCurrentMonth) {
                    onSelectDate(dateStr);
                    onClose();
                  }
                }}
                className={`min-h-[85px] p-1.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  !isCurrentMonth
                    ? 'border-transparent text-gray-300 bg-gray-50/20'
                    : isToday
                    ? 'border-blue-500 bg-blue-50/30 cursor-pointer shadow-xs'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                      isToday ? 'bg-blue-600 text-white' : 'text-gray-700'
                    }`}
                  >
                    {isCurrentMonth ? dayNum : ''}
                  </span>
                  {dayClasses.length > 0 && (
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 rounded">
                      {dayClasses.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1 mt-1">
                  {dayClasses.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewClassDetails(item);
                        onClose();
                      }}
                      className={`text-[9px] px-1.5 py-0.5 rounded font-medium truncate flex items-center justify-between ${
                        item.status === 'live'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'completed'
                          ? 'bg-amber-100 text-amber-800'
                          : item.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      <span className="truncate">{item.title}</span>
                    </div>
                  ))}
                  {dayClasses.length > 2 && (
                    <div className="text-[9px] text-gray-400 text-center font-medium">
                      +{dayClasses.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
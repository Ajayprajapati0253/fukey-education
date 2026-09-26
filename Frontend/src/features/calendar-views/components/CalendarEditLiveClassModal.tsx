import React, { useState, useEffect } from 'react';
import type { X, Trash2, Calendar, Clock, Bell, User, CheckCircle2 } from 'lucide-react';
import type { CalendarLiveClass, CalendarClassStatus, CalendarSubjectType } from '../types/calendar-live-class.types';
import type { INITIAL_TEACHERS } from '../data/CalendarInitialLiveClasses';

interface CalendarEditLiveClassModalProps {
  item: CalendarLiveClass | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<CalendarLiveClass>) => void;
  onDelete: (id: string) => void;
}

export const CalendarEditLiveClassModal: React.FC<CalendarEditLiveClassModalProps> = ({
  item,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [title, setTitle] = useState<CalendarSubjectType>('Mathematics');
  const [courseName, setCourseName] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState<CalendarClassStatus>('scheduled');
  const [roomName, setRoomName] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setCourseName(item.courseName);
      setTeacherId(item.teacherId);
      setDate(item.date);
      setStartTime(item.startTime);
      setEndTime(item.endTime);
      setStatus(item.status);
      setRoomName(item.roomName);
      setIsRecurring(item.isRecurring);
      setReminderEnabled(item.automatedReminders?.enabled ?? true);
    }
  }, [item]);

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = INITIAL_TEACHERS.find((t) => t.id === teacherId) || INITIAL_TEACHERS[0];

    const formatTime12 = (t24: string) => {
      const [h, m] = t24.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${m < 10 ? '0' + m : m} ${ampm}`;
    };

    onUpdate(item.id, {
      title,
      courseName,
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherAvatar: teacher.avatar,
      date,
      startTime,
      endTime,
      formattedTimeRange: `${formatTime12(startTime)} - ${formatTime12(endTime)}`,
      status,
      roomName,
      isRecurring,
      automatedReminders: {
        ...item.automatedReminders,
        enabled: reminderEnabled,
      },
    });
  };

  return (
    <div
      id="edit-live-class-modal-overlay"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="edit-live-class-modal-card"
        className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Scheduled Class</h2>
            <p className="text-xs text-gray-500">Update session timing, status, teacher, or reminder rules.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Subject</label>
              <select
                value={title}
                onChange={(e) => setTitle(e.target.value as CalendarSubjectType)}
                className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs text-gray-800 font-medium"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CalendarClassStatus)}
                className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs font-semibold text-gray-800"
              >
                <option value="scheduled">● Scheduled</option>
                <option value="live">● Live</option>
                <option value="completed">● Completed</option>
                <option value="cancelled">● Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Course Name</label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Teacher</label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs text-gray-800 font-medium"
              >
                {INITIAL_TEACHERS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.subject})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Start Time (24h)</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">End Time (24h)</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
              <input
                id="edit-rec-cb"
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded text-blue-600 w-4 h-4"
              />
              <label htmlFor="edit-rec-cb" className="font-semibold text-gray-700 cursor-pointer">
                Recurring Weekly
              </label>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-lg">
              <input
                id="edit-reminder-cb"
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="rounded text-indigo-600 w-4 h-4"
              />
              <label htmlFor="edit-reminder-cb" className="font-semibold text-indigo-900 cursor-pointer">
                Automated Reminders Enabled
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
                  onDelete(item.id);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Class
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
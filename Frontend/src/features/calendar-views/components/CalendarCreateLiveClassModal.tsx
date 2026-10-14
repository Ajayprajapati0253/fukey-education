import React, { useState } from 'react';
import { X, Bell } from 'lucide-react';
import type { CalendarLiveClass, CalendarSubjectType } from '../types/calendar-live-class.types';
import { CALENDAR_INITIAL_TEACHERS } from '../data/CalendarInitialLiveClasses';

interface CalendarCreateLiveClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (classData: Partial<CalendarLiveClass>) => void;
}

// Shared theme-aware classes (same palette as the rest of the admin panel)
const labelCls = 'block font-semibold text-gray-700 dark:text-gray-300 mb-1';
const inputCls =
  'w-full border border-gray-200 dark:border-[#334155] rounded-lg p-2.5 bg-white dark:bg-[#0F172A] text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:[color-scheme:dark]';
const chipCls =
  'inline-flex items-center gap-1.5 bg-white dark:bg-[#0F172A] border border-indigo-200 dark:border-indigo-500/30 text-gray-700 dark:text-gray-200 px-2.5 py-1 rounded-md cursor-pointer hover:bg-indigo-50/40 dark:hover:bg-indigo-500/10';

export const CalendarCreateLiveClassModal: React.FC<CalendarCreateLiveClassModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState<CalendarSubjectType>('Mathematics');
  const [courseName, setCourseName] = useState('');
  const [teacherId, setTeacherId] = useState(CALENDAR_INITIAL_TEACHERS[0].id);
  const [date, setDate] = useState('2026-08-20');
  const [startTime, setStartTime] = useState('15:00');
  const [endTime, setEndTime] = useState('16:00');
  const [roomName, setRoomName] = useState('Virtual Studio Hall A');
  const [meetLink] = useState('https://meet.fukey.edu/live-session');
  const [maxParticipants] = useState(50);
  const [isRecurring, setIsRecurring] = useState(true);
  const [recurringPattern] = useState<'weekly' | 'daily'>('weekly');
  const [description, setDescription] = useState('');

  // Automated reminders state
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminder15m, setReminder15m] = useState(true);
  const [reminder1h, setReminder1h] = useState(true);
  const [reminder24h, setReminder24h] = useState(false);
  const [channelEmail, setChannelEmail] = useState(true);
  const [channelWhatsApp, setChannelWhatsApp] = useState(true);
  const [channelSMS, setChannelSMS] = useState(true);
  const [messageTemplate, setMessageTemplate] = useState(
    'Hi {{name}}, your live {{title}} class starts at {{time}}. Join room: {{link}}'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = CALENDAR_INITIAL_TEACHERS.find((t) => t.id === teacherId) || CALENDAR_INITIAL_TEACHERS[0];

    const formatTime12 = (t24: string) => {
      const [h, m] = t24.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${m < 10 ? '0' + m : m} ${ampm}`;
    };

    const formattedTimeRange = `${formatTime12(startTime)} - ${formatTime12(endTime)}`;

    const offsets: number[] = [];
    if (reminder15m) offsets.push(15);
    if (reminder1h) offsets.push(60);
    if (reminder24h) offsets.push(1440);

    const channels: ('email' | 'sms' | 'whatsapp')[] = [];
    if (channelEmail) channels.push('email');
    if (channelWhatsApp) channels.push('whatsapp');
    if (channelSMS) channels.push('sms');

    onSubmit({
      title,
      courseName: courseName || `${title} Advanced Masterclass`,
      courseId: `c-${title.toLowerCase()}-${Date.now().toString(36)}`,
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherAvatar: teacher.avatar,
      date,
      startTime,
      endTime,
      formattedTimeRange,
      durationMinutes: 60,
      status: 'scheduled',
      isRecurring,
      recurringPattern,
      roomName,
      meetLink,
      maxParticipants,
      currentEnrollment: 0,
      description: description || `Live interactive ${title} lecture covering core syllabus and problem solving.`,
      automatedReminders: {
        enabled: reminderEnabled,
        offsetsMinutes: offsets,
        channels: channels.length ? channels : ['email'],
        customMessageTemplate: messageTemplate,
        autoSentCount: 0,
      },
    });
  };

  return (
    <div
      id="create-live-class-modal-overlay"
      className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="create-live-class-modal-card"
        className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 dark:border-[#334155] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#334155]">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Schedule New Live Class</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Configure class details, teacher assignment, and automated reminder broadcasts.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-[#334155] flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Subject & Course */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Subject</label>
              <select
                value={title}
                onChange={(e) => setTitle(e.target.value as CalendarSubjectType)}
                className={`${inputCls} font-medium`}
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Course / Batch Title</label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. Grade 12 Calculus & Vectors Masterclass"
                className={inputCls}
                required
              />
            </div>
          </div>

          {/* Teacher & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Assigned Teacher</label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className={`${inputCls} font-medium`}
              >
                {CALENDAR_INITIAL_TEACHERS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.subject})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} required />
            </div>
          </div>

          {/* Start & End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Start Time (24h)</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls} required />
            </div>

            <div>
              <label className={labelCls}>End Time (24h)</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputCls} required />
            </div>
          </div>

          {/* Recurrence & Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#0F172A] rounded-xl border border-gray-200 dark:border-[#334155]">
              <input
                id="is-recurring-cb"
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="is-recurring-cb" className="text-gray-800 dark:text-gray-100 font-semibold cursor-pointer">
                Recurring Weekly Class
              </label>
            </div>

            <div>
              <label className={labelCls}>Classroom / Hall Name</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Main Hall A"
                className={inputCls}
              />
            </div>
          </div>

          {/* Automated reminders */}
          <div className="p-4 bg-indigo-50/70 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold text-gray-900 dark:text-gray-100 text-xs">Automated Participant Reminders</span>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 dark:bg-[#334155] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 relative"></div>
              </label>
            </div>

            {reminderEnabled && (
              <div className="space-y-3 pt-2 border-t border-indigo-100/70 dark:border-indigo-500/20 text-[11px]">
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">Schedule Triggers</span>
                  <div className="flex flex-wrap gap-2">
                    <label className={chipCls}>
                      <input type="checkbox" checked={reminder15m} onChange={(e) => setReminder15m(e.target.checked)} className="rounded text-indigo-600" />
                      <span>15 Minutes Before</span>
                    </label>
                    <label className={chipCls}>
                      <input type="checkbox" checked={reminder1h} onChange={(e) => setReminder1h(e.target.checked)} className="rounded text-indigo-600" />
                      <span>1 Hour Before</span>
                    </label>
                    <label className={chipCls}>
                      <input type="checkbox" checked={reminder24h} onChange={(e) => setReminder24h(e.target.checked)} className="rounded text-indigo-600" />
                      <span>24 Hours Before</span>
                    </label>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">Delivery Channels</span>
                  <div className="flex flex-wrap gap-2">
                    <label className={chipCls}>
                      <input type="checkbox" checked={channelEmail} onChange={(e) => setChannelEmail(e.target.checked)} className="rounded text-indigo-600" />
                      <span>Email Digest</span>
                    </label>
                    <label className={chipCls}>
                      <input type="checkbox" checked={channelWhatsApp} onChange={(e) => setChannelWhatsApp(e.target.checked)} className="rounded text-indigo-600" />
                      <span>WhatsApp Alert</span>
                    </label>
                    <label className={chipCls}>
                      <input type="checkbox" checked={channelSMS} onChange={(e) => setChannelSMS(e.target.checked)} className="rounded text-indigo-600" />
                      <span>SMS Text</span>
                    </label>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">Message Template</span>
                  <input
                    type="text"
                    value={messageTemplate}
                    onChange={(e) => setMessageTemplate(e.target.value)}
                    className="w-full bg-white dark:bg-[#0F172A] border border-indigo-200 dark:border-indigo-500/30 rounded-lg p-2 text-[11px] text-gray-800 dark:text-gray-100"
                  />
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 block">
                    Supported tags: <code>{'{{name}}'}</code>, <code>{'{{title}}'}</code>, <code>{'{{time}}'}</code>, <code>{'{{link}}'}</code>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Syllabus / Topics Summary</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the concepts, question sets, or laboratory demonstrations planned..."
              className={inputCls}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#334155]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#334155] rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
            >
              Schedule Live Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
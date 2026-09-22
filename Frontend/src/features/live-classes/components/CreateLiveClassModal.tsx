import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Video,
  User,
  BookOpen,
  Layers,
  Repeat,
  Link,
  Users,
  CheckCircle2,
  FileText
} from 'lucide-react';
import type { LiveClass, PlatformType } from '../types/live-class.types';
import { INSTRUCTORS, COURSES, CATEGORIES } from '../data/InitialLiveClasses';

interface CreateLiveClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newClass: Omit<LiveClass, 'id' | 'index'>) => void;
  initialType?: 'one-time' | 'recurring';
}

export const CreateLiveClassModal: React.FC<CreateLiveClassModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialType = 'one-time'
}) => {
  const [classType, setClassType] = useState<'one-time' | 'recurring'>(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Science');
  const [course, setCourse] = useState('Class 11 Science');
  const [instructorId, setInstructorId] = useState(INSTRUCTORS[0].id);
  const [platform, setPlatform] = useState<PlatformType>('YouTube');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [date, setDate] = useState('2026-08-15');
  const [time, setTime] = useState('16:00');
  const [duration, setDuration] = useState('60');
  const [capacity, setCapacity] = useState('250');
  const [description, setDescription] = useState('');

  // Recurring options
  const [recurrenceFreq, setRecurrenceFreq] = useState<'daily' | 'weekly' | 'weekdays' | 'custom'>('weekly');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [startDate, setStartDate] = useState('2026-08-15');
  const [endDate, setEndDate] = useState('2026-10-15');

  if (!isOpen) return null;

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedInstructor = INSTRUCTORS.find((i) => i.id === instructorId) || INSTRUCTORS[0];

    // Format Start Time
    const parsedDate = new Date(`${date}T${time}`);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedStartTime = `${monthNames[parsedDate.getMonth()]} ${parsedDate.getDate()}, ${parsedDate.getFullYear()} ${time}`;

    const defaultMeetingUrl = platform === 'Jitsi'
      ? `https://meet.jit.si/fukey-live-${Date.now()}`
      : `https://youtube.com/live/fukey-live-${Date.now()}`;

    const newClassData: Omit<LiveClass, 'id' | 'index'> = {
      title: title.trim(),
      category,
      course,
      instructor: selectedInstructor,
      platform,
      meetingUrl: meetingUrl.trim() || defaultMeetingUrl,
      startTime: formattedStartTime,
      isoDateTime: `${date}T${time}:00`,
      duration: parseInt(duration, 10) || 60,
      status: 'Upcoming',
      students: 0,
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80',
      description: description.trim() || 'Interactive live session on Fukey Education platform.',
      maxCapacity: parseInt(capacity, 10) || 300,
      ...(classType === 'recurring' && {
        recurring: {
          isRecurring: true,
          frequency: recurrenceFreq,
          days: selectedDays,
          startDate,
          endDate,
        },
      }),
    };

    onSave(newClassData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Create New Live Class
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Schedule interactive sessions or setup recurring weekly lectures.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Class Type Selector Tabs */}
        <div className="mt-4 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setClassType('one-time')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
              classType === 'one-time'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>One-time Class</span>
          </button>
          <button
            type="button"
            onClick={() => setClassType('recurring')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
              classType === 'recurring'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Repeat className="h-4 w-4" />
            <span>Recurring Class</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Class Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Physics - Laws of Motion & Friction Mastery"
              className="h-9.5 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Course & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Course
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="h-9.5 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {COURSES.filter((c) => c !== 'All Courses').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subject / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-9.5 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {CATEGORIES.filter((cat) => cat !== 'All Categories').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Instructor & Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assigned Instructor
              </label>
              <select
                value={instructorId}
                onChange={(e) => setInstructorId(e.target.value)}
                className="h-9.5 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {INSTRUCTORS.map((ins) => (
                  <option key={ins.id} value={ins.id}>
                    {ins.name} ({ins.specialty?.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Streaming Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PlatformType)}
                className="h-9.5 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="YouTube">YouTube Live</option>
                <option value="Jitsi">Jitsi Meet (Fukey Live)</option>
              </select>
            </div>
          </div>

          {/* Meeting URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Meeting URL or Broadcast Stream Link
            </label>
            <div className="relative">
              <input
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://meet.jit.si/... or https://youtube.com/live/..."
                className="h-9.5 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          {/* Date, Time & Duration for One-Time vs Recurring */}
          {classType === 'one-time' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Class Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-9.5 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-9.5 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Duration (mins)
                </label>
                <input
                  type="number"
                  min="15"
                  max="300"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="h-9.5 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            /* Recurring Schedule Configuration */
            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <Repeat className="h-4 w-4 text-blue-600" />
                <span>Recurring Schedule Setup</span>
              </div>

              {/* Days of Week selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                  Select Days of Week
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {weekDays.map((d) => {
                    const isSelected = selectedDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDay(d)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start Date, End Date, Time & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Class Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="300"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Class Description & Learning Objectives
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline what students will master during this session..."
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Student Notification Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="notify"
              defaultChecked
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="notify" className="text-xs text-slate-600 cursor-pointer">
              Automatically notify all enrolled students via SMS and email alerts.
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              {classType === 'recurring' ? 'Schedule Recurring Series' : 'Publish Live Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

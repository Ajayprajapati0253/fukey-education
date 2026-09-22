import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Video,
  User,
  Link,
  Users,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import type { LiveClass, PlatformType, ClassStatus } from '../types/live-class.types';
import { INSTRUCTORS, COURSES, CATEGORIES } from '../data/InitialLiveClasses';

interface EditLiveClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveClass: LiveClass | null;
  onSave: (updated: LiveClass) => void;
  onDelete: (id: string) => void;
}

export const EditLiveClassModal: React.FC<EditLiveClassModalProps> = ({
  isOpen,
  onClose,
  liveClass,
  onSave,
  onDelete
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [course, setCourse] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [platform, setPlatform] = useState<PlatformType>('YouTube');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [status, setStatus] = useState<ClassStatus>('Upcoming');
  const [students, setStudents] = useState('0');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (liveClass) {
      setTitle(liveClass.title);
      setCategory(liveClass.category);
      setCourse(liveClass.course);
      setInstructorId(liveClass.instructor.id);
      setPlatform(liveClass.platform);
      setMeetingUrl(liveClass.meetingUrl);
      setStartTime(liveClass.startTime);
      setDuration(liveClass.duration.toString());
      setStatus(liveClass.status);
      setStudents(liveClass.students.toString());
      setDescription(liveClass.description || '');
    }
  }, [liveClass]);

  if (!isOpen || !liveClass) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selInstructor = INSTRUCTORS.find((i) => i.id === instructorId) || liveClass.instructor;

    const updated: LiveClass = {
      ...liveClass,
      title: title.trim(),
      category,
      course,
      instructor: selInstructor,
      platform,
      meetingUrl: meetingUrl.trim(),
      startTime: startTime.trim(),
      duration: parseInt(duration, 10) || 60,
      status,
      students: parseInt(students, 10) || 0,
      description: description.trim()
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl my-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Edit Live Class
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update scheduling, assigned teacher, streaming provider, or status.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Class Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9.5 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Course
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="h-9.5 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700"
              >
                {COURSES.filter((c) => c !== 'All Courses').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-9.5 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700"
              >
                {CATEGORIES.filter((cat) => cat !== 'All Categories').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Instructor
              </label>
              <select
                value={instructorId}
                onChange={(e) => setInstructorId(e.target.value)}
                className="h-9.5 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700"
              >
                {INSTRUCTORS.map((ins) => (
                  <option key={ins.id} value={ins.id}>{ins.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PlatformType)}
                className="h-9.5 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700"
              >
                <option value="YouTube">YouTube</option>
                <option value="Jitsi">Jitsi Meet</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Meeting URL
            </label>
            <input
              type="text"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              className="h-9.5 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Start Time
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-9.5 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Duration (mins)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="h-9.5 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ClassStatus)}
                className="h-9.5 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700"
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Live">Live</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to delete this live class?')) {
                  onDelete(liveClass.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Class</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700"
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

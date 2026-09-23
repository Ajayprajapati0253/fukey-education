import React, { useEffect, useState } from 'react';
import type { AttendanceEditModalData, DayCellStatus, EditableAttendanceSession } from '../types';
import { X, Pencil, CheckCircle2, XCircle, MinusCircle, Trash2 } from 'lucide-react';

interface AttendanceEditModalProps {
  isOpen: boolean;
  modalData: AttendanceEditModalData | null;
  onClose: () => void;
  onSave: (updated: EditableAttendanceSession, originalSessionId?: string) => void;
  onRequestDelete: () => void;
}

const STATUS_OPTIONS: { value: DayCellStatus; label: string; icon: React.ReactNode; activeClasses: string }[] = [
  {
    value: 'Present',
    label: 'Present',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    activeClasses: 'bg-[#E7F7ED] dark:bg-emerald-500/15 border-[#16A34A] text-[#16A34A] dark:text-emerald-400',
  },
  {
    value: 'Absent',
    label: 'Absent',
    icon: <XCircle className="w-3.5 h-3.5" />,
    activeClasses: 'bg-[#FCEAE4] dark:bg-rose-500/15 border-[#DC5B3E] text-[#DC5B3E] dark:text-rose-400',
  },
  {
    value: 'NoClass',
    label: 'No Class',
    icon: <MinusCircle className="w-3.5 h-3.5" />,
    activeClasses: 'bg-gray-100 dark:bg-slate-700/60 border-gray-400 text-[#686E7D] dark:text-slate-300',
  },
];

export const AttendanceEditModal: React.FC<AttendanceEditModalProps> = ({
  isOpen,
  modalData,
  onClose,
  onSave,
  onRequestDelete,
}) => {
  const [form, setForm] = useState<EditableAttendanceSession | null>(null);

  useEffect(() => {
    if (modalData) setForm({ ...modalData.data });
  }, [modalData]);

  if (!isOpen || !modalData || !form) return null;

  const { teacher, originalSessionId } = modalData;

  const update = <K extends keyof EditableAttendanceSession>(key: K, value: EditableAttendanceSession[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleTimeChange = (field: 'joinedTime' | 'leftTime', value: string) => {
    setForm((prev) => {
      if (!prev) return prev;
      const next: EditableAttendanceSession = { ...prev, [field]: value || undefined };
      if (next.joinedTime && next.leftTime) {
        const [jh, jm] = next.joinedTime.split(':').map(Number);
        const [lh, lm] = next.leftTime.split(':').map(Number);
        const diff = lh * 60 + lm - (jh * 60 + jm);
        if (diff > 0) next.durationMinutes = diff;
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    onSave(form, originalSessionId);
  };

  const inputClasses =
    'w-full h-9 rounded-lg border border-[#E6E8EE] dark:border-[#1b2b4d] bg-[#F6F7FA] dark:bg-[#101b33] px-3 text-xs text-[#12141C] dark:text-slate-200 focus:outline-none focus:border-[#2451D9] dark:focus:border-blue-500 [color-scheme:light] dark:[color-scheme:dark]';
  const labelClasses = 'block text-[11px] font-semibold text-[#686E7D] dark:text-slate-400 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.18)] dark:shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E6E8EE] dark:border-[#172749] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAF0FE] dark:bg-blue-600/20 text-[#2451D9] dark:text-blue-400 flex items-center justify-center">
              <Pencil className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#12141C] dark:text-white">Edit Attendance</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#686E7D] dark:text-slate-400 hover:text-[#12141C] dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#142038] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form id="edit-attendance-form" onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Teacher + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClasses}>Teacher</label>
              <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-[#E6E8EE] dark:border-[#1b2b4d] bg-[#F6F7FA] dark:bg-[#101b33]">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 border ${teacher.avatarColor}`}
                >
                  {teacher.initials}
                </div>
                <span className="text-xs font-semibold text-[#12141C] dark:text-white truncate">{teacher.name}</span>
                <span className="text-[10px] font-mono text-[#9DA2AF] dark:text-slate-500 ml-auto">{teacher.id}</span>
              </div>
            </div>
            <div>
              <label className={labelClasses}>Date</label>
              <input
                type="date"
                value={form.isoDate}
                onChange={(e) => update('isoDate', e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          {/* Class / Subject */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClasses}>Class / Course</label>
              <input
                type="text"
                value={form.classCourse}
                onChange={(e) => update('classCourse', e.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => update('subject', e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          {/* Chapter */}
          <div>
            <label className={labelClasses}>Chapter</label>
            <input
              type="text"
              value={form.chapter}
              onChange={(e) => update('chapter', e.target.value)}
              className={inputClasses}
            />
          </div>

          {/* Scheduled Time */}
          <div>
            <label className={labelClasses}>Scheduled Time</label>
            <input
              type="time"
              value={form.scheduledTime}
              onChange={(e) => update('scheduledTime', e.target.value)}
              className={inputClasses}
            />
          </div>

          {/* Joined / Left / Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClasses}>Joined At</label>
              <input
                type="time"
                value={form.joinedTime || ''}
                onChange={(e) => handleTimeChange('joinedTime', e.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>Left At</label>
              <input
                type="time"
                value={form.leftTime || ''}
                onChange={(e) => handleTimeChange('leftTime', e.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>Duration</label>
              <input
                type="number"
                min={0}
                value={form.durationMinutes}
                onChange={(e) => update('durationMinutes', Number(e.target.value))}
                className={inputClasses}
              />
            </div>
          </div>

          {/* Attendance Status */}
          <div>
            <label className={labelClasses}>Attendance Status</label>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const isActive = form.status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update('status', opt.value)}
                    className={`inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border text-xs font-semibold transition ${
                      isActive
                        ? opt.activeClasses
                        : 'bg-white dark:bg-[#101b33] border-[#E6E8EE] dark:border-[#1b2b4d] text-[#686E7D] dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-[#152342]'
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className={labelClasses}>Reason (Optional)</label>
            <textarea
              rows={2}
              value={form.reason}
              onChange={(e) => update('reason', e.target.value)}
              placeholder="Enter reason..."
              className="w-full rounded-lg border border-[#E6E8EE] dark:border-[#1b2b4d] bg-[#F6F7FA] dark:bg-[#101b33] px-3 py-2 text-xs text-[#12141C] dark:text-slate-200 focus:outline-none focus:border-[#2451D9] dark:focus:border-blue-500 resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#E6E8EE] dark:border-[#172749] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onRequestDelete}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#F5CFC0] dark:border-rose-500/30 bg-[#FCEAE4] dark:bg-rose-500/10 text-xs font-semibold text-[#DC5B3E] dark:text-rose-400 hover:bg-[#f9ddd0] dark:hover:bg-rose-500/20 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Attendance
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-[#E6E8EE] dark:border-[#1b2b4d] bg-[#F6F7FA] dark:bg-[#101b33] text-xs font-medium text-[#686E7D] dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#152342] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-attendance-form"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#2451D9] hover:bg-[#1e43b8] text-xs font-semibold text-white shadow-md shadow-[#2451D9]/30 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
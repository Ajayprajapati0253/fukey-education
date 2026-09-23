import React, { useState } from 'react';
import type { AttendanceSettings } from '../types';
import { X, Settings, Check } from 'lucide-react';

interface AttendanceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AttendanceSettings;
  onSave: (settings: AttendanceSettings) => void;
}

export const AttendanceSettingsModal: React.FC<AttendanceSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [minDuration, setMinDuration] = useState(settings.minDurationMinutes);
  const [gracePeriod, setGracePeriod] = useState(settings.gracePeriodMinutes);
  const [autoCancellation, setAutoCancellation] = useState(settings.autoMarkCancellation);
  const [autoNoShow, setAutoNoShow] = useState(settings.autoMarkNoShow);
  const [notifications, setNotifications] = useState(settings.notificationsEnabled);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      minDurationMinutes: minDuration,
      gracePeriodMinutes: gracePeriod,
      autoMarkCancellation: autoCancellation,
      autoMarkNoShow: autoNoShow,
      notificationsEnabled: notifications,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-2xl w-full max-w-md overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.18)] dark:shadow-2xl">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#E6E8EE] dark:border-[#172749] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAF0FE] dark:bg-blue-600/20 text-[#2451D9] dark:text-blue-400 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#12141C] dark:text-white">Attendance Calculation Rules</h3>
              <p className="text-[11px] text-[#686E7D] dark:text-slate-400">Configure thresholds for automated status evaluation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#686E7D] dark:text-slate-400 hover:text-[#12141C] dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#142038] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#12141C] dark:text-slate-200 mb-1">
              Minimum Attendance Duration (Minutes)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={20}
                max={60}
                step={5}
                value={minDuration}
                onChange={(e) => setMinDuration(Number(e.target.value))}
                className="flex-1 accent-[#2451D9] h-1.5 bg-gray-200 dark:bg-[#172749] rounded-lg cursor-pointer"
              />
              <span className="w-16 px-2 py-1 rounded bg-[#F6F7FA] dark:bg-[#101b33] border border-[#E6E8EE] dark:border-[#1b2b4d] text-center font-mono text-xs font-bold text-[#2451D9] dark:text-blue-400">
                {minDuration} min
              </span>
            </div>
            <p className="text-[10px] text-[#686E7D] dark:text-slate-400 mt-1">
              Teachers must spend at least {minDuration} minutes in live session to be tagged Present.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#12141C] dark:text-slate-200 mb-1">
              Grace Period Allowed
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={15}
                value={gracePeriod}
                onChange={(e) => setGracePeriod(Number(e.target.value))}
                className="w-24 bg-[#F6F7FA] dark:bg-[#101b33] border border-[#E6E8EE] dark:border-[#1b2b4d] text-xs rounded-lg px-3 py-1.5 text-[#12141C] dark:text-slate-200 focus:outline-none focus:border-[#2451D9] dark:focus:border-blue-500"
              />
              <span className="text-xs text-[#686E7D] dark:text-slate-400">minutes from scheduled start</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#E6E8EE] dark:border-[#172749]">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#12141C]/80 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={autoCancellation}
                onChange={(e) => setAutoCancellation(e.target.checked)}
                className="rounded border-[#E6E8EE] dark:border-[#1b2b4d] bg-[#F6F7FA] dark:bg-[#101b33] text-[#2451D9] focus:ring-0"
              />
              <span>Mark Absent automatically when class is cancelled</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#12141C]/80 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={autoNoShow}
                onChange={(e) => setAutoNoShow(e.target.checked)}
                className="rounded border-[#E6E8EE] dark:border-[#1b2b4d] bg-[#F6F7FA] dark:bg-[#101b33] text-[#2451D9] focus:ring-0"
              />
              <span>Mark Absent with reason &quot;Did not join&quot; on no-show</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#12141C]/80 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="rounded border-[#E6E8EE] dark:border-[#1b2b4d] bg-[#F6F7FA] dark:bg-[#101b33] text-[#2451D9] focus:ring-0"
              />
              <span>Send instant alert notifications to faculty on low attendance</span>
            </label>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-3 border-t border-[#E6E8EE] dark:border-[#172749] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-[#E6E8EE] dark:border-[#1b2b4d] bg-[#F6F7FA] dark:bg-[#101b33] text-xs font-medium text-[#686E7D] dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#152342] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#2451D9] hover:bg-[#1e43b8] text-xs font-semibold text-white shadow-md shadow-[#2451D9]/30 transition"
            >
              <Check className="w-3.5 h-3.5" />
              Save & Apply Rules
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
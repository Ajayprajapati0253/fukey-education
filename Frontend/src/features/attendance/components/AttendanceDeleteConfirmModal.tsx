import React from 'react';
import type { AttendanceDeleteModalData } from '../types';
import { X, Trash2 } from 'lucide-react';

interface AttendanceDeleteConfirmModalProps {
  isOpen: boolean;
  modalData: AttendanceDeleteModalData | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export const AttendanceDeleteConfirmModal: React.FC<AttendanceDeleteConfirmModalProps> = ({
  isOpen,
  modalData,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen || !modalData) return null;

  const dateLabel = modalData.isoDate
    ? new Date(modalData.isoDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-2xl w-full max-w-sm overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.18)] dark:shadow-2xl">
        <div className="px-5 py-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FCEAE4] dark:bg-rose-500/15 text-[#DC5B3E] dark:text-rose-400 flex items-center justify-center shrink-0">
              <Trash2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#12141C] dark:text-white">Delete Attendance?</h3>
              <p className="text-xs text-[#686E7D] dark:text-slate-400 mt-1">
                Are you sure you want to delete this attendance record for{' '}
                <span className="font-semibold text-[#12141C] dark:text-slate-200">{modalData.teacherName}</span>
                {dateLabel ? (
                  <>
                    {' '}
                    on <span className="font-semibold text-[#12141C] dark:text-slate-200">{dateLabel}</span>
                  </>
                ) : null}
                ?
              </p>
              <p className="text-[11px] text-[#DC5B3E] dark:text-rose-400 mt-1.5 font-medium">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-[#686E7D] dark:text-slate-400 hover:text-[#12141C] dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#142038] transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 border-t border-[#E6E8EE] dark:border-[#172749] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-lg border border-[#E6E8EE] dark:border-[#1b2b4d] bg-[#F6F7FA] dark:bg-[#101b33] text-xs font-medium text-[#686E7D] dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#152342] transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#DC5B3E] hover:bg-[#c44b30] text-xs font-semibold text-white shadow-md shadow-[#DC5B3E]/30 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import type { CourseReview } from '../types/course-review.types';

interface Props {
  review: CourseReview | null;
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (status: boolean) => Promise<void> | void;
}

export const EditCourseReviewModal: React.FC<Props> = ({
  review,
  isOpen,
  isSaving,
  onClose,
  onSave,
}) => {
  const [status, setStatus] = useState(true);

  useEffect(() => {
    if (review) {
      setStatus(Boolean(review.status));
    }
  }, [review]);

  if (!isOpen || !review) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-[#1E293B] border border-border-subtle shadow-2xl">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink dark:text-gray-100">
              Update Review
            </h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Change the review publication status.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Course
            </p>
            <p className="mt-1 text-sm font-semibold text-ink dark:text-gray-100">
              {review.course?.title ?? '—'}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Student
            </p>
            <p className="mt-1 text-sm text-ink dark:text-gray-100">
              {review.user?.name ?? '—'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-1.5">
              Status
            </label>
            <select
              value={status ? 'true' : 'false'}
              onChange={(e) => setStatus(e.target.value === 'true')}
              className="w-full px-3 py-2.5 rounded-lg border border-border-subtle bg-white dark:bg-[#0F172A] text-sm text-ink dark:text-gray-100"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border-subtle flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg border border-border-subtle text-sm font-semibold text-ink dark:text-gray-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onSave(status)}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import type { CourseReview } from '../types/course-review.types';

interface Props {
  reviews: CourseReview[];
  onEdit: (review: CourseReview) => void;
  onDelete: (review: CourseReview) => void;
}

export const CourseReviewTable: React.FC<Props> = ({
  reviews,
  onEdit,
  onDelete,
}) => {
  if (!reviews.length) {
    return (
      <div className="bg-white dark:bg-[#1E293B] border border-border-subtle rounded-xl p-10 text-center">
        <p className="text-sm font-semibold text-ink dark:text-gray-100">
          No course reviews found.
        </p>
        <p className="text-xs text-ink-soft mt-1">
          Try changing the search or status filter.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1E293B] border border-border-subtle rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px]">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-border-subtle">
            <tr>
              {['#', 'Course', 'Student', 'Status', 'Created', 'Actions'].map(
                (heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-ink-soft"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-border-subtle">
            {reviews.map((review, index) => (
              <tr
                key={review.id}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
              >
                <td className="px-4 py-3 text-sm text-ink-soft">
                  {index + 1}
                </td>

                <td className="px-4 py-3">
                  <p className="max-w-[320px] truncate text-sm font-semibold text-ink dark:text-gray-100">
                    {review.course?.title ?? '—'}
                  </p>
                </td>

                <td className="px-4 py-3 text-sm text-ink dark:text-gray-100">
                  {review.user?.name ?? '—'}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      review.status
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {review.status ? 'Active' : 'Inactive'}
                  </span>
                </td>

                <td className="px-4 py-3 text-sm text-ink-soft">
                  {review.created_at
                    ? new Date(review.created_at).toLocaleDateString()
                    : '—'}
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      title="Edit status"
                      onClick={() => onEdit(review)}
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      title="Delete review"
                      onClick={() => onDelete(review)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

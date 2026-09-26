import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import type {
  CourseSubCategory,
  CreateCourseSubCategoryData,
} from '../types/course-sub-category.types';

interface CourseSubCategoryModalProps {
  isOpen: boolean;
  subCategory: CourseSubCategory | null;
  parentCategoryName?: string;
  onClose: () => void;
  onSubmit: (data: CreateCourseSubCategoryData) => Promise<void>;
}

export const CourseSubCategoryModal: React.FC<
  CourseSubCategoryModalProps
> = ({
  isOpen,
  subCategory,
  parentCategoryName,
  onClose,
  onSubmit,
}) => {
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = Boolean(subCategory);

  useEffect(() => {
    if (!isOpen) return;

    setSlug(subCategory?.slug ?? '');
    setStatus(subCategory?.status ?? true);
  }, [isOpen, subCategory]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!isEdit && !slug.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);

      await onSubmit({
        slug: slug.trim(),
        status,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1E293B] shadow-2xl border border-border-subtle dark:border-[#334155]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle dark:border-[#334155]">
          <div>
            <h2 className="text-lg font-bold text-ink dark:text-white">
              {isEdit
                ? 'Edit Sub Category'
                : 'Add Sub Category'}
            </h2>

            <p className="text-xs text-ink-soft dark:text-[#94A3B8] mt-1">
              {isEdit
                ? 'Update sub category status.'
                : 'Create a child category under the selected category.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-soft hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            {/* Parent */}
            <div>
              <label className="block text-xs font-bold text-ink dark:text-white mb-2">
                Parent Category
              </label>

              <div className="h-10 flex items-center px-3 rounded-xl border border-border-subtle dark:border-[#334155] bg-slate-50 dark:bg-[#0F172A] text-sm text-ink dark:text-white">
                {parentCategoryName || 'Selected Category'}
              </div>
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-bold text-ink dark:text-white mb-2">
                Sub Category / Subject
              </label>

              <input
                type="text"
                value={slug}
                disabled={isEdit}
                onChange={(event) =>
                  setSlug(event.target.value)
                }
                placeholder="e.g. physics"
                maxLength={255}
                className="w-full h-10 px-3 rounded-xl border border-border-subtle dark:border-[#334155] bg-white dark:bg-[#0F172A] text-sm text-ink dark:text-white outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
              />

              {isEdit && (
                <p className="text-[11px] text-ink-soft dark:text-[#94A3B8] mt-1.5">
                  Sub category name cannot be changed because the
                  current update API only accepts status.
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-ink dark:text-white mb-2">
                Status
              </label>

              <button
                type="button"
                onClick={() => setStatus((prev) => !prev)}
                className="flex items-center gap-3"
              >
                <span
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    status
                      ? 'bg-brand'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      status
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </span>

                <span className="text-sm font-medium text-ink dark:text-white">
                  {status ? 'Active' : 'Inactive'}
                </span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-subtle dark:border-[#334155]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-ink-soft dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                (!isEdit && !slug.trim())
              }
              className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-[#1E44B8] disabled:opacity-50"
            >
              {isSubmitting
                ? 'Saving...'
                : isEdit
                  ? 'Update Sub Category'
                  : 'Create Sub Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseSubCategoryModal;
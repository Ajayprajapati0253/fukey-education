import React, { useEffect, useState } from 'react';
import {
  ImagePlus,
  Loader2,
  X,
} from 'lucide-react';

import type {
  Category,
  CreateCategoryData,
} from '../types/category.types';

interface CategoryModalProps {
  isOpen: boolean;
  category?: Category | null;
  onClose: () => void;
  onSubmit: (
    data: CreateCategoryData,
  ) => Promise<void>;
}

export const CategoryModal: React.FC<
  CategoryModalProps
> = ({
  isOpen,
  category,
  onClose,
  onSubmit,
}) => {
  const isEdit = Boolean(category);

  const [slug, setSlug] = useState('');
  const [order, setOrder] = useState('');
  const [parentId, setParentId] =
    useState('');
  const [icon, setIcon] = useState('');
  const [showAtTrending, setShowAtTrending] =
    useState(false);
  const [status, setStatus] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (category) {
      setSlug(category.slug ?? '');

      setOrder(
        category.order !== null &&
          category.order !== undefined
          ? String(category.order)
          : '',
      );

      setParentId(
        category.parentId ?? '',
      );

      setIcon(category.icon ?? '');

      setShowAtTrending(
        Boolean(category.showAtTrending),
      );

      setStatus(
        Boolean(category.status),
      );
    } else {
      setSlug('');
      setOrder('');
      setParentId('');
      setIcon('');
      setShowAtTrending(false);
      setStatus(true);
    }

    setError(null);
  }, [isOpen, category]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    const cleanSlug = slug.trim();

    if (!cleanSlug) {
      setError(
        'Category slug is required.',
      );
      return;
    }

    const data: CreateCategoryData = {
      slug: cleanSlug,

      order:
        order.trim() !== ''
          ? Number(order)
          : null,

      icon:
        icon.trim() !== ''
          ? icon.trim()
          : null,

      parent_id:
        parentId.trim() !== ''
          ? Number(parentId)
          : null,

      show_at_trending:
        showAtTrending,

      status,
    };

    if (
      data.order !== null &&
      (Number.isNaN(data.order) ||
        data.order < 0)
    ) {
      setError(
        'Order must be a valid positive number.',
      );
      return;
    }

    if (
      data.parent_id !== null &&
      (Number.isNaN(data.parent_id) ||
        data.parent_id <= 0)
    ) {
      setError(
        'Parent category ID must be valid.',
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(data);
      onClose();
    } catch (err: any) {
      console.error(
        'Category submit error:',
        err,
      );

      const backendMessage =
        err?.response?.data?.message;

      const message =
        Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage ||
            err?.message ||
            'Failed to save category.';

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget &&
          !isSubmitting
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-xl bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-border-subtle dark:border-[#334155] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle dark:border-[#334155]">
          <div>
            <h2 className="text-base font-bold text-ink dark:text-white">
              {isEdit
                ? 'Edit Category'
                : 'Add Category'}
            </h2>

            <p className="text-xs text-ink-soft dark:text-[#94A3B8] mt-0.5">
              {isEdit
                ? 'Update category information.'
                : 'Create a new course category.'}
            </p>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-soft hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-5"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 px-4 py-3 text-xs font-medium text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold text-ink dark:text-white mb-1.5">
              Category Slug
              <span className="text-red-500 ml-1">
                *
              </span>
            </label>

            <input
              type="text"
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value)
              }
              placeholder="e.g. class-9"
              disabled={isSubmitting}
              className="w-full h-10 px-3 rounded-xl border border-border-subtle dark:border-[#334155] bg-white dark:bg-[#0F172A] text-sm text-ink dark:text-white outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:opacity-60"
            />

            <p className="text-[10px] text-ink-soft dark:text-[#94A3B8] mt-1">
              Use a URL-friendly value such as
              class-9 or science.
            </p>
          </div>

          {/* Order + Parent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink dark:text-white mb-1.5">
                Display Order
              </label>

              <input
                type="number"
                min="0"
                value={order}
                onChange={(e) =>
                  setOrder(e.target.value)
                }
                placeholder="e.g. 1"
                disabled={isSubmitting}
                className="w-full h-10 px-3 rounded-xl border border-border-subtle dark:border-[#334155] bg-white dark:bg-[#0F172A] text-sm text-ink dark:text-white outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink dark:text-white mb-1.5">
                Parent Category ID
              </label>

              <input
                type="number"
                min="1"
                value={parentId}
                onChange={(e) =>
                  setParentId(e.target.value)
                }
                placeholder="Optional"
                disabled={isSubmitting}
                className="w-full h-10 px-3 rounded-xl border border-border-subtle dark:border-[#334155] bg-white dark:bg-[#0F172A] text-sm text-ink dark:text-white outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-xs font-bold text-ink dark:text-white mb-1.5">
              Icon URL
            </label>

            <div className="relative">
              <ImagePlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />

              <input
                type="text"
                value={icon}
                onChange={(e) =>
                  setIcon(e.target.value)
                }
                placeholder="https://..."
                disabled={isSubmitting}
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-border-subtle dark:border-[#334155] bg-white dark:bg-[#0F172A] text-sm text-ink dark:text-white outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:opacity-60"
              />
            </div>

            {icon.trim() && (
              <div className="mt-2">
                <img
                  src={icon}
                  alt="Category icon preview"
                  className="w-12 h-12 rounded-xl object-cover border border-border-subtle dark:border-[#334155]"
                  onError={(e) => {
                    e.currentTarget.style.display =
                      'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border-subtle dark:border-[#334155] bg-slate-50/60 dark:bg-[#172033] cursor-pointer">
              <div>
                <p className="text-xs font-bold text-ink dark:text-white">
                  Show at Trending
                </p>

                <p className="text-[10px] text-ink-soft dark:text-[#94A3B8] mt-0.5">
                  Display this category in trending.
                </p>
              </div>

              <input
                type="checkbox"
                checked={showAtTrending}
                onChange={(e) =>
                  setShowAtTrending(
                    e.target.checked,
                  )
                }
                disabled={isSubmitting}
                className="w-4 h-4 accent-brand"
              />
            </label>

            <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border-subtle dark:border-[#334155] bg-slate-50/60 dark:bg-[#172033] cursor-pointer">
              <div>
                <p className="text-xs font-bold text-ink dark:text-white">
                  Active
                </p>

                <p className="text-[10px] text-ink-soft dark:text-[#94A3B8] mt-0.5">
                  Enable this category.
                </p>
              </div>

              <input
                type="checkbox"
                checked={status}
                onChange={(e) =>
                  setStatus(
                    e.target.checked,
                  )
                }
                disabled={isSubmitting}
                className="w-4 h-4 accent-brand"
              />
            </label>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border-subtle dark:border-[#334155] text-xs font-bold text-ink dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-[#1E44B8] disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}

              {isEdit
                ? 'Update Category'
                : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
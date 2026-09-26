import React, {
  useEffect,
  useState,
} from 'react';

import {
  ImagePlus,
  X,
} from 'lucide-react';

import type {
  FreeCourseCategory,
  CreateFreeCourseCategoryPayload,
  UpdateFreeCourseCategoryPayload,
} from '../api/free-course-category.api';

interface Props {
  open: boolean;
  category?: FreeCourseCategory | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (
    data:
      | CreateFreeCourseCategoryPayload
      | UpdateFreeCourseCategoryPayload,
  ) => Promise<void>;
}

const FreeCourseCategoryFormModal: React.FC<Props> =
  ({
    open,
    category,
    loading = false,
    onClose,
    onSubmit,
  }) => {
    const isEdit = Boolean(category);

    const [name, setName] =
      useState('');

    const [slug, setSlug] =
      useState('');

    const [code, setCode] =
      useState('');

    const [status, setStatus] =
      useState(true);

    const [showAtTrending, setShowAtTrending] =
      useState(false);

    const [parentId, setParentId] =
      useState('');

    const [icon, setIcon] =
      useState<File | null>(null);

    const [preview, setPreview] =
      useState<string | null>(null);

    const [error, setError] =
      useState('');

    useEffect(() => {
      if (!open) return;

      setName(category?.name || '');
      setSlug(category?.slug || '');
      setCode(category?.code || '');
      setStatus(category?.status ?? true);
      setShowAtTrending(
        category?.show_at_trending ?? false,
      );
      setParentId(
        category?.parent_id || '',
      );
      setIcon(null);
      setPreview(category?.icon || null);
      setError('');
    }, [open, category]);

    if (!open) return null;

    const handleIconChange = (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const file =
        event.target.files?.[0];

      if (!file) return;

      if (!file.type.startsWith('image/')) {
        setError(
          'Please select a valid image file.',
        );
        return;
      }

      setIcon(file);
      setPreview(
        URL.createObjectURL(file),
      );
      setError('');
    };

    const handleSubmit = async (
      event: React.FormEvent,
    ) => {
      event.preventDefault();

      setError('');

      if (!name.trim()) {
        setError(
          'Category name is required.',
        );
        return;
      }

      if (isEdit) {
        if (!code.trim()) {
          setError('Code is required.');
          return;
        }

        try {
          await onSubmit({
            name: name.trim(),
            code: code.trim(),
            status,
            show_at_trending:
              showAtTrending,
            icon,
          });
        } catch (err: any) {
          setError(
            err?.response?.data?.message ||
              'Failed to update category.',
          );
        }

        return;
      }

      if (!slug.trim()) {
        setError('Slug is required.');
        return;
      }

      try {
        await onSubmit({
          name: name.trim(),
          slug: slug.trim(),
          status,
          show_at_trending:
            showAtTrending,
          parent_id:
            parentId.trim() || undefined,
          icon,
        });
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            'Failed to create category.',
        );
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-[#1E293B]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-ink dark:text-white">
                {isEdit
                  ? 'Edit Free Course Category'
                  : 'Create Free Course Category'}
              </h2>

              <p className="mt-1 text-sm text-ink-soft">
                {isEdit
                  ? 'Update category details.'
                  : 'Add a new free course category.'}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="max-h-[75vh] overflow-y-auto p-6"
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white">
                  Category Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter category name"
                  maxLength={255}
                  className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2.5 text-sm outline-none focus:border-brand dark:bg-[#0F172A] dark:text-white"
                />
              </div>

              {/* Create: Slug */}
              {!isEdit && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white">
                    Slug
                  </label>

                  <input
                    type="text"
                    value={slug}
                    onChange={(e) =>
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(
                            /\s+/g,
                            '-',
                          ),
                      )
                    }
                    placeholder="e.g. class-10"
                    maxLength={255}
                    className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2.5 text-sm outline-none focus:border-brand dark:bg-[#0F172A] dark:text-white"
                  />
                </div>
              )}

              {/* Update: Code */}
              {isEdit && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white">
                    Code
                  </label>

                  <input
                    type="text"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value)
                    }
                    placeholder="Enter code"
                    className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2.5 text-sm outline-none focus:border-brand dark:bg-[#0F172A] dark:text-white"
                  />
                </div>
              )}

              {/* Parent ID - create only */}
              {!isEdit && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white">
                    Parent ID
                    <span className="ml-1 text-xs text-ink-soft">
                      (Optional)
                    </span>
                  </label>

                  <input
                    type="text"
                    value={parentId}
                    onChange={(e) =>
                      setParentId(
                        e.target.value,
                      )
                    }
                    placeholder="Enter parent ID"
                    className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2.5 text-sm outline-none focus:border-brand dark:bg-[#0F172A] dark:text-white"
                  />
                </div>
              )}

              {/* Status */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white">
                  Status
                </label>

                <select
                  value={
                    status
                      ? 'true'
                      : 'false'
                  }
                  onChange={(e) =>
                    setStatus(
                      e.target.value ===
                        'true',
                    )
                  }
                  className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2.5 text-sm outline-none focus:border-brand dark:bg-[#0F172A] dark:text-white"
                >
                  <option value="true">
                    Active
                  </option>
                  <option value="false">
                    Inactive
                  </option>
                </select>
              </div>

              {/* Trending */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white">
                  Show at Trending
                </label>

                <select
                  value={
                    showAtTrending
                      ? 'true'
                      : 'false'
                  }
                  onChange={(e) =>
                    setShowAtTrending(
                      e.target.value ===
                        'true',
                    )
                  }
                  className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2.5 text-sm outline-none focus:border-brand dark:bg-[#0F172A] dark:text-white"
                >
                  <option value="true">
                    Yes
                  </option>
                  <option value="false">
                    No
                  </option>
                </select>
              </div>

              {/* Icon */}
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white">
                  Icon
                </label>

                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border-subtle bg-gray-50 dark:bg-slate-800">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImagePlus
                        size={25}
                        className="text-ink-soft"
                      />
                    )}
                  </div>

                  <label className="cursor-pointer rounded-lg border border-border-subtle px-4 py-2.5 text-sm font-medium text-ink hover:bg-gray-50 dark:text-white dark:hover:bg-slate-700">
                    Choose Image

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handleIconChange
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3 border-t border-border-subtle pt-5">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-lg border border-border-subtle px-5 py-2.5 text-sm font-medium text-ink dark:text-white"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loading
                  ? 'Saving...'
                  : isEdit
                    ? 'Update Category'
                    : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

export default FreeCourseCategoryFormModal;
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import {
  createBlogCategory,
  updateBlogCategory,
} from '../api/blog-category.api';
import type { BlogCategory } from '../api/blog-category.api';

interface Props {
  open: boolean;
  category: BlogCategory | null;
  parentCategories: BlogCategory[];
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

interface FormState {
  slug: string;
  title: string;
  short_description: string;
  lang_code: string;
  parent_id: string;
  position: string;
  status: boolean;
}

const BlogCategoryModal: React.FC<Props> = ({
  open,
  category,
  parentCategories,
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState<FormState>({
    slug: '',
    title: '',
    short_description: '',
    lang_code: '',
    parent_id: '',
    position: '0',
    status: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(category);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (category) {
      const translation = category.translations?.[0];

      setForm({
        slug: category.slug || '',
        title: translation?.title || '',
        short_description:
          translation?.short_description || '',
        lang_code: translation?.lang_code || '',
        parent_id: category.parent_id
          ? String(category.parent_id)
          : '',
        position:
          category.position !== null &&
          category.position !== undefined
            ? String(category.position)
            : '0',
        status: category.status ?? true,
      });
    } else {
      setForm({
        slug: '',
        title: '',
        short_description: '',
        lang_code: '',
        parent_id: '',
        position: '0',
        status: true,
      });
    }

    setErrors({});
  }, [open, category]);

  if (!open) {
    return null;
  }

  const handleChange = (
    field: keyof FormState,
    value: string | boolean,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.slug.trim()) {
      nextErrors.slug = 'Slug is required.';
    } else if (form.slug.trim().length > 255) {
      nextErrors.slug = 'Slug must not exceed 255 characters.';
    }

    const hasLanguage = Boolean(form.lang_code.trim());
    const hasTitle = Boolean(form.title.trim());

    if (hasLanguage !== hasTitle) {
      nextErrors.translation =
        'Language Code and Title must be provided together.';
    }

    if (form.title.trim().length > 255) {
      nextErrors.title =
        'Title must not exceed 255 characters.';
    }

    if (form.short_description.trim().length > 255) {
      nextErrors.short_description =
        'Short description must not exceed 255 characters.';
    }

    if (form.position.trim()) {
      const position = Number(form.position);

      if (!Number.isInteger(position)) {
        nextErrors.position = 'Position must be a whole number.';
      }
    }

    if (
      category &&
      form.parent_id &&
      String(category.id) === String(form.parent_id)
    ) {
      nextErrors.parent_id =
        'A category cannot be its own parent.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);

      const payload: Record<string, unknown> = {
        slug: form.slug.trim(),
        status: form.status,
        position: form.position.trim()
          ? Number(form.position)
          : undefined,
        parent_id: form.parent_id || undefined,
      };

      const hasTranslation =
        form.lang_code.trim() && form.title.trim();

      if (hasTranslation) {
        payload.lang_code = form.lang_code.trim();
        payload.title = form.title.trim();
        payload.short_description =
          form.short_description.trim() || undefined;
      }

      if (isEditing && category) {
        await updateBlogCategory(category.id, payload);
      } else {
        await createBlogCategory(payload);
      }

      await onSuccess();
    } catch (error: any) {
      console.error('Failed to save blog category:', error);

      const message =
        error?.message ||
        error?.response?.data?.message ||
        'Failed to save blog category.';

      setErrors({
        submit: Array.isArray(message)
          ? message.join(', ')
          : message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const availableParents = parentCategories.filter(
    (item) =>
      !category ||
      String(item.id) !== String(category.id),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-[#1E293B]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-ink dark:text-white">
              {isEditing
                ? 'Edit Blog Category'
                : 'Add Blog Category'}
            </h2>

            <p className="mt-1 text-sm text-ink-soft dark:text-slate-400">
              {isEditing
                ? 'Update category information.'
                : 'Create a new blog category.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-6">
            {errors.submit && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30">
                {errors.submit}
              </div>
            )}

            {/* Slug */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white">
                Slug <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={form.slug}
                onChange={(e) =>
                  handleChange('slug', e.target.value)
                }
                placeholder="e.g. education"
                maxLength={255}
                className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />

              {errors.slug && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.slug}
                </p>
              )}
            </div>

            {/* Parent */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white">
                Parent Category
              </label>

              <select
                value={form.parent_id}
                onChange={(e) =>
                  handleChange('parent_id', e.target.value)
                }
                className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                <option value="">No Parent</option>

                {availableParents.map((parent) => (
                  <option
                    key={parent.id}
                    value={parent.id}
                  >
                    {parent.translations?.[0]?.title ||
                      parent.slug}
                  </option>
                ))}
              </select>

              {errors.parent_id && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.parent_id}
                </p>
              )}
            </div>

            {/* Translation */}
            <div className="rounded-xl border border-border-subtle p-4 dark:border-slate-700">
              <h3 className="mb-4 text-sm font-semibold text-ink dark:text-white">
                Translation
              </h3>

              <p className="mb-4 text-xs text-ink-soft dark:text-slate-400">
                Language Code and Title must be entered together.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white">
                    Language Code
                  </label>

                  <input
                    type="text"
                    value={form.lang_code}
                    onChange={(e) =>
                      handleChange(
                        'lang_code',
                        e.target.value,
                      )
                    }
                    placeholder="en"
                    className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white">
                    Title
                  </label>

                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      handleChange('title', e.target.value)
                    }
                    placeholder="Category title"
                    maxLength={255}
                    className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />

                  {errors.title && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.title}
                    </p>
                  )}
                </div>
              </div>

              {errors.translation && (
                <p className="mt-2 text-xs text-red-500">
                  {errors.translation}
                </p>
              )}

              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white">
                  Short Description
                </label>

                <textarea
                  rows={3}
                  value={form.short_description}
                  onChange={(e) =>
                    handleChange(
                      'short_description',
                      e.target.value,
                    )
                  }
                  placeholder="Short description"
                  maxLength={255}
                  className="w-full resize-none rounded-lg border border-border-subtle bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />

                {errors.short_description && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.short_description}
                  </p>
                )}
              </div>
            </div>

            {/* Position + Status */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white">
                  Position
                </label>

                <input
                  type="number"
                  step="1"
                  value={form.position}
                  onChange={(e) =>
                    handleChange(
                      'position',
                      e.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />

                {errors.position && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.position}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white">
                  Status
                </label>

                <button
                  type="button"
                  onClick={() =>
                    handleChange(
                      'status',
                      !form.status,
                    )
                  }
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm ${
                    form.status
                      ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-950/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800'
                  }`}
                >
                  <span>
                    {form.status ? 'Active' : 'Inactive'}
                  </span>

                  <span
                    className={`h-4 w-4 rounded-full ${
                      form.status
                        ? 'bg-green-500'
                        : 'bg-slate-400'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-border-subtle px-6 py-4 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-border-subtle px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-white dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? 'Saving...'
                : isEditing
                  ? 'Update Category'
                  : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogCategoryModal;
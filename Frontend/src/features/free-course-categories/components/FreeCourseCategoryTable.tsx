import React from 'react';
import {
  Edit,
  Trash2,
  FolderOpen,
} from 'lucide-react';

import type {
  FreeCourseCategory,
} from '../api/free-course-category.api';

interface Props {
  categories: FreeCourseCategory[];
  loading: boolean;
  onEdit: (
    category: FreeCourseCategory,
  ) => void;
  onDelete: (
    category: FreeCourseCategory,
  ) => void;
  onStatusChange: (
    category: FreeCourseCategory,
  ) => void;
}

const getIconUrl = (
  icon?: string | null,
) => {
  if (!icon) return null;

  if (
    icon.startsWith('http://') ||
    icon.startsWith('https://')
  ) {
    return icon;
  }

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:3000/api';

  const origin = baseUrl.replace(
    /\/api\/?$/,
    '',
  );

  return `${origin}/${icon.replace(
    /^\/+/,
    '',
  )}`;
};

const FreeCourseCategoryTable: React.FC<Props> = ({
  categories,
  loading,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  if (loading) {
    return (
      <div className="rounded-xl border border-border-subtle bg-white p-5 dark:bg-[#1E293B]">
        <div className="space-y-4">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <div
                key={index}
                className="flex animate-pulse items-center gap-4"
              >
                <div className="h-11 w-11 rounded-lg bg-gray-200 dark:bg-slate-700" />

                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded bg-gray-200 dark:bg-slate-700" />
                  <div className="h-3 w-28 rounded bg-gray-200 dark:bg-slate-700" />
                </div>

                <div className="h-8 w-20 rounded bg-gray-200 dark:bg-slate-700" />
              </div>
            ),
          )}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-border-subtle bg-white px-6 py-16 text-center dark:bg-[#1E293B]">
        <FolderOpen
          size={32}
          className="mx-auto mb-3 text-ink-soft"
        />

        <h3 className="font-semibold text-ink dark:text-white">
          No categories found
        </h3>

        <p className="mt-1 text-sm text-ink-soft">
          No free course categories match
          your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-white dark:bg-[#1E293B]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-border-subtle bg-gray-50 dark:bg-slate-800/60">
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Category
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Slug
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Parent
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Trending
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Status
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => {
              const iconUrl = getIconUrl(
                category.icon,
              );

              return (
                <tr
                  key={category.id}
                  className="border-b border-border-subtle last:border-b-0 hover:bg-gray-50 dark:hover:bg-slate-800/40"
                >
                  {/* Category */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand/10">
                        {iconUrl ? (
                          <img
                            src={iconUrl}
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <FolderOpen
                            size={20}
                            className="text-brand"
                          />
                        )}
                      </div>

                      <div>
                        <p className="font-semibold text-ink dark:text-white">
                          {category.name}
                        </p>

                        <p className="text-xs text-ink-soft">
                          ID: {category.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="px-5 py-4">
                    <span className="text-sm text-ink-soft">
                      {category.slug || '-'}
                    </span>
                  </td>

                  {/* Parent */}
                  <td className="px-5 py-4">
                    <span className="text-sm text-ink-soft">
                      {category.parent_id || '-'}
                    </span>
                  </td>

                  {/* Trending */}
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        category.show_at_trending
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {category.show_at_trending
                        ? 'Trending'
                        : 'No'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        onStatusChange(
                          category,
                        )
                      }
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        category.status
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {category.status
                        ? 'Active'
                        : 'Inactive'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onEdit(category)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-ink-soft hover:border-brand hover:text-brand"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onDelete(category)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/50"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FreeCourseCategoryTable;
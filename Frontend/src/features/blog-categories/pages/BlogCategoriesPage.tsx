import React, { useEffect, useMemo, useState } from 'react';
import {
  Edit,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import {
  getBlogCategories,
  deleteBlogCategory,
  toggleBlogCategoryStatus,
} from '../api/blog-category.api';
import type { BlogCategory } from '../api/blog-category.api';

import BlogCategoryModal from '../components/BlogCategoryModal';

const BlogCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [allCategories, setAllCategories] = useState<BlogCategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<BlogCategory | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);

      const response = await getBlogCategories(page, perPage);

      setCategories(response.data || []);

      setTotal(response.pagination?.total || 0);
      setLastPage(response.pagination?.last_page || 1);
    } catch (error) {
      console.error('Failed to load blog categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllCategories = async () => {
    try {
      const response = await getBlogCategories(1, 1000000);

      setAllCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load parent categories:', error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [page, perPage]);

  useEffect(() => {
    loadAllCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) {
      return categories;
    }

    const keyword = search.toLowerCase().trim();

    return categories.filter((category) => {
      const title =
        category.translations?.[0]?.title?.toLowerCase() || '';

      const slug = category.slug?.toLowerCase() || '';

      return title.includes(keyword) || slug.includes(keyword);
    });
  }, [categories, search]);

  const getCategoryTitle = (category: BlogCategory) => {
    return category.translations?.[0]?.title || category.slug;
  };

  const getParentTitle = (parentId?: string | null) => {
    if (!parentId) {
      return '-';
    }

    const parent = allCategories.find(
      (category) => String(category.id) === String(parentId),
    );

    return parent ? getCategoryTitle(parent) : parentId;
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (category: BlogCategory) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleDelete = async (category: BlogCategory) => {
    const title = getCategoryTitle(category);

    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(category.id);

      await deleteBlogCategory(category.id);

      await Promise.all([
        loadCategories(),
        loadAllCategories(),
      ]);
    } catch (error: any) {
      console.error('Failed to delete category:', error);

      const message =
        error?.message ||
        error?.response?.data?.message ||
        'Failed to delete category.';

      alert(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusToggle = async (category: BlogCategory) => {
    try {
      setActionLoading(category.id);

      await toggleBlogCategoryStatus(category.id);

      await Promise.all([
        loadCategories(),
        loadAllCategories(),
      ]);
    } catch (error) {
      console.error('Failed to update category status:', error);
      alert('Failed to update category status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleModalSuccess = async () => {
    setModalOpen(false);
    setEditingCategory(null);

    await Promise.all([
      loadCategories(),
      loadAllCategories(),
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink dark:text-white">
            Blog Categories
          </h1>

          <p className="mt-1 text-sm text-ink-soft dark:text-slate-400">
            Manage blog categories and their parent relationships.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border-subtle bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-[#1E293B]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search current page..."
              className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-lg border border-border-subtle bg-white px-3 py-2 text-sm text-ink outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            <option value={10}>10 / page</option>
            <option value={15}>15 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border-subtle bg-white shadow-sm dark:border-slate-700 dark:bg-[#1E293B]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="border-b border-border-subtle bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-slate-400">
                  ID
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-slate-400">
                  Category
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-slate-400">
                  Parent
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-slate-400">
                  Language
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-slate-400">
                  Position
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-slate-400">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border-subtle dark:divide-slate-700">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    {Array.from({ length: 7 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-5 py-4">
                        <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-ink-soft dark:text-slate-400"
                  >
                    No blog categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => {
                  const translation = category.translations?.[0];

                  const isActionLoading =
                    actionLoading === category.id;

                  return (
                    <tr
                      key={category.id}
                      className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-5 py-4 text-sm text-ink-soft dark:text-slate-400">
                        #{category.id}
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-ink dark:text-white">
                            {getCategoryTitle(category)}
                          </p>

                          <p className="mt-1 text-xs text-ink-soft dark:text-slate-500">
                            {category.slug}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-ink dark:text-slate-300">
                        {getParentTitle(category.parent_id)}
                      </td>

                      <td className="px-5 py-4 text-sm text-ink-soft dark:text-slate-400">
                        {translation?.lang_code || '-'}
                      </td>

                      <td className="px-5 py-4 text-sm text-ink dark:text-slate-300">
                        {category.position ?? 0}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() =>
                            handleStatusToggle(category)
                          }
                          className="inline-flex items-center gap-2"
                        >
                          {category.status ? (
                            <>
                              <ToggleRight
                                size={28}
                                className="text-green-500"
                              />
                              <span className="text-sm font-medium text-green-600">
                                Active
                              </span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft
                                size={28}
                                className="text-slate-400"
                              />
                              <span className="text-sm font-medium text-slate-500">
                                Inactive
                              </span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(category)}
                            disabled={isActionLoading}
                            title="Edit"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-brand dark:hover:bg-slate-700"
                          >
                            <Edit size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(category)
                            }
                            disabled={isActionLoading}
                            title="Delete"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && lastPage > 1 && (
          <div className="flex items-center justify-between border-t border-border-subtle px-5 py-4 dark:border-slate-700">
            <p className="text-sm text-ink-soft dark:text-slate-400">
              Page {page} of {lastPage} · {total} total
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="rounded-lg border border-border-subtle p-2 text-ink transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-white dark:hover:bg-slate-800"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="min-w-[70px] text-center text-sm text-ink dark:text-white">
                {page} / {lastPage}
              </span>

              <button
                type="button"
                disabled={page >= lastPage}
                onClick={() => setPage((prev) => prev + 1)}
                className="rounded-lg border border-border-subtle p-2 text-ink transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-white dark:hover:bg-slate-800"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <BlogCategoryModal
        open={modalOpen}
        category={editingCategory}
        parentCategories={allCategories}
        onClose={() => {
          setModalOpen(false);
          setEditingCategory(null);
        }}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default BlogCategoriesPage;
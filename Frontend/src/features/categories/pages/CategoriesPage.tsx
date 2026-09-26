import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Loader2,
  Plus,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
import { CategoryModal } from '../components/CategoryModal';

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../api/category.api';

import type {
  Category,
  CategoryFilterState,
} from '../types/category.types';

const DEFAULT_FILTERS: CategoryFilterState = {
  search: '',
  status: 'All Status',
  trending: 'All',
  perPage: 10,
};

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(
    [],
  );

  const [isCategoryModalOpen, setIsCategoryModalOpen] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [filters, setFilters] =
    useState<CategoryFilterState>(
      DEFAULT_FILTERS,
    );

  const [currentPage, setCurrentPage] =
    useState(1);

  const [totalCategories, setTotalCategories] =
    useState(0);

  const [lastPage, setLastPage] =
    useState(1);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  const [toastType, setToastType] =
    useState<'success' | 'error'>(
      'success',
    );

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  /**
   * -----------------------------------------
   * TOAST
   * -----------------------------------------
   */

  const showToast = useCallback(
    (
      message: string,
      type: 'success' | 'error' = 'success',
    ) => {
      setToastMessage(message);
      setToastType(type);

      window.setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    },
    [],
  );

  /**
   * -----------------------------------------
   * LOAD CATEGORIES
   * -----------------------------------------
   */

  const loadCategories =
    useCallback(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await getCategories(
            filters,
            currentPage,
          );

        const apiCategories =
          Array.isArray(response?.data)
            ? response.data
            : [];

        setCategories(apiCategories);

        setTotalCategories(
          Number(
            response?.meta?.total ?? 0,
          ),
        );

        setLastPage(
          Math.max(
            1,
            Number(
              response?.meta?.last_page ?? 1,
            ),
          ),
        );

        setSelectedIds([]);
      } catch (err: any) {
        console.error(
          'Failed to load categories:',
          err,
        );

        const backendMessage =
          err?.response?.data?.message;

        const message =
          Array.isArray(backendMessage)
            ? backendMessage.join(', ')
            : backendMessage ||
              err?.message ||
              'Failed to load categories.';

        setError(message);
        setCategories([]);
        setTotalCategories(0);
        setLastPage(1);
      } finally {
        setIsLoading(false);
      }
    }, [filters, currentPage]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  /**
   * -----------------------------------------
   * CREATE / UPDATE
   * -----------------------------------------
   */

  const handleAddCategory = async (
    data: any,
  ) => {
    await createCategory(data);

    showToast(
      'Category created successfully.',
    );

    setCurrentPage(1);
    await loadCategories();
  };

  const handleEditCategory = async (
    data: any,
  ) => {
    if (!editingCategory) {
      return;
    }

    await updateCategory(
      editingCategory.id,
      data,
    );

    showToast(
      'Category updated successfully.',
    );

    setIsCategoryModalOpen(false);
    setEditingCategory(null);

    await loadCategories();
  };

  /**
   * -----------------------------------------
   * FILTER HANDLERS
   * -----------------------------------------
   */

  const updateFilter = <
    K extends keyof CategoryFilterState,
  >(
    key: K,
    value: CategoryFilterState[K],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));

    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  /**
   * -----------------------------------------
   * DELETE
   * -----------------------------------------
   */

  const handleDelete = async (
    category: Category,
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${category.slug}"?`,
      );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteCategory(category.id);

      showToast(
        `Category "${category.slug}" deleted successfully.`,
      );

      await loadCategories();
    } catch (err: any) {
      console.error(
        'Delete category error:',
        err,
      );

      const backendMessage =
        err?.response?.data?.message;

      const message =
        Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage ||
            err?.message ||
            'Failed to delete category.';

      showToast(
        message,
        'error',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * -----------------------------------------
   * SELECT ALL
   * -----------------------------------------
   */

  const allPageSelected =
    categories.length > 0 &&
    categories.every((category) =>
      selectedIds.includes(category.id),
    );

  const handleToggleSelectAll = () => {
    const pageIds = categories.map(
      (category) => category.id,
    );

    setSelectedIds((prev) =>
      allPageSelected
        ? prev.filter(
            (id) => !pageIds.includes(id),
          )
        : Array.from(
            new Set([
              ...prev,
              ...pageIds,
            ]),
          ),
    );
  };

  const handleToggleSelect = (
    id: string,
  ) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter(
            (item) => item !== id,
          )
        : [...prev, id],
    );
  };

  /**
   * -----------------------------------------
   * PAGINATION
   * -----------------------------------------
   */

  const pageStart =
    totalCategories === 0
      ? 0
      : (currentPage - 1) *
          filters.perPage +
        1;

  const pageEnd = Math.min(
    currentPage * filters.perPage,
    totalCategories,
  );

  const canGoPrevious =
    currentPage > 1;

  const canGoNext =
    currentPage < lastPage;

  const paginationPages =
    useMemo(() => {
      const pages: number[] = [];

      const start = Math.max(
        1,
        currentPage - 2,
      );

      const end = Math.min(
        lastPage,
        currentPage + 2,
      );

      for (
        let page = start;
        page <= end;
        page++
      ) {
        pages.push(page);
      }

      return pages;
    }, [currentPage, lastPage]);

  /**
   * -----------------------------------------
   * RENDER
   * -----------------------------------------
   */

  return (
    <div className="space-y-6 pb-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold">
          {toastType === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-success" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400" />
          )}

          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink dark:text-white tracking-tight">
            Categories
          </h1>

          <p className="text-xs sm:text-sm text-ink-soft dark:text-[#94A3B8] mt-0.5 font-medium">
            Create, manage and organize course categories.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-brand text-white rounded-xl text-xs font-bold hover:bg-[#1E44B8] active:scale-[0.98] transition-all shadow-[0_2px_8px_rgba(36,81,217,0.25)]"
          onClick={() => {
            setEditingCategory(null);
            setIsCategoryModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />

          <span>Add Category</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1E293B] border border-border-subtle dark:border-[#334155] rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft dark:text-[#94A3B8]" />

            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                updateFilter(
                  'search',
                  e.target.value,
                )
              }
              placeholder="Search categories..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-border-subtle dark:border-[#334155] bg-white dark:bg-[#0F172A] text-sm text-ink dark:text-white outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
            />
          </div>

          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) =>
              updateFilter(
                'status',
                e.target.value as CategoryFilterState['status'],
              )
            }
            className="h-10 px-3 rounded-xl border border-border-subtle dark:border-[#334155] bg-white dark:bg-[#0F172A] text-sm text-ink dark:text-white outline-none focus:border-brand"
          >
            <option value="All Status">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>
          </select>

          {/* Trending */}
          <select
            value={filters.trending}
            onChange={(e) =>
              updateFilter(
                'trending',
                e.target.value as CategoryFilterState['trending'],
              )
            }
            className="h-10 px-3 rounded-xl border border-border-subtle dark:border-[#334155] bg-white dark:bg-[#0F172A] text-sm text-ink dark:text-white outline-none focus:border-brand"
          >
            <option value="All">
              All Trending
            </option>

            <option value="Yes">
              Trending
            </option>

            <option value="No">
              Not Trending
            </option>
          </select>

          {/* Per Page */}
          <select
            value={filters.perPage}
            onChange={(e) =>
              updateFilter(
                'perPage',
                Number(e.target.value),
              )
            }
            className="h-10 px-3 rounded-xl border border-border-subtle dark:border-[#334155] bg-white dark:bg-[#0F172A] text-sm text-ink dark:text-white outline-none focus:border-brand"
          >
            <option value={10}>
              10 per page
            </option>

            <option value={25}>
              25 per page
            </option>

            <option value={50}>
              50 per page
            </option>
          </select>
        </div>

        <div className="flex justify-end mt-3">
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-semibold text-brand hover:underline"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-[#1E293B] border border-border-subtle dark:border-[#334155] rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-brand" />

            <span className="text-sm font-medium text-ink-soft dark:text-[#94A3B8]">
              Loading categories...
            </span>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <Search className="w-5 h-5 text-ink-soft" />
            </div>

            <h3 className="text-sm font-bold text-ink dark:text-white">
              No categories found
            </h3>

            <p className="text-xs text-ink-soft dark:text-[#94A3B8] mt-1">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-border-subtle dark:border-[#334155] bg-slate-50/70 dark:bg-[#172033]">
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          allPageSelected
                        }
                        onChange={
                          handleToggleSelectAll
                        }
                        className="w-4 h-4 accent-brand"
                      />
                    </th>

                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-ink-soft dark:text-[#94A3B8]">
                      ID
                    </th>

                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-ink-soft dark:text-[#94A3B8]">
                      Category
                    </th>

                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-ink-soft dark:text-[#94A3B8]">
                      Parent
                    </th>

                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-ink-soft dark:text-[#94A3B8]">
                      Order
                    </th>

                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-ink-soft dark:text-[#94A3B8]">
                      Trending
                    </th>

                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-ink-soft dark:text-[#94A3B8]">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-ink-soft dark:text-[#94A3B8]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map(
                    (category) => (
                      <tr
                        key={category.id}
                        className="border-b border-border-subtle dark:border-[#334155] last:border-b-0 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(
                              category.id,
                            )}
                            onChange={() =>
                              handleToggleSelect(
                                category.id,
                              )
                            }
                            className="w-4 h-4 accent-brand"
                          />
                        </td>

                        <td className="px-4 py-4 text-xs font-semibold text-ink-soft dark:text-[#CBD5E1]">
                          #{category.id}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {category.icon ? (
                              <img
                                src={
                                  category.icon
                                }
                                alt=""
                                className="w-10 h-10 rounded-xl object-cover border border-border-subtle dark:border-[#334155]"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <span className="text-xs font-bold text-ink-soft">
                                  CAT
                                </span>
                              </div>
                            )}

                            <div>
                              <p className="text-sm font-bold text-ink dark:text-white">
                                {category.slug ||
                                  'Untitled'}
                              </p>

                              <p className="text-[11px] text-ink-soft dark:text-[#94A3B8] mt-0.5">
                                /{category.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-xs font-medium text-ink-soft dark:text-[#CBD5E1]">
                          {category.parentName ||
                            category.parentId ||
                            '—'}
                        </td>

                        <td className="px-4 py-4 text-center text-xs font-semibold text-ink dark:text-white">
                          {category.order ??
                            '—'}
                        </td>

                        <td className="px-4 py-4 text-center">
                          {category.showAtTrending ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-ink-soft dark:text-[#94A3B8] text-[10px] font-bold">
                              No
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4 text-center">
                          {category.status ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-[10px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              Inactive
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              title="Edit Category"
                              onClick={() => {
                                setEditingCategory(category);
                                setIsCategoryModalOpen(true);
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-soft hover:text-brand hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              title="Delete Category"
                              disabled={
                                isDeleting
                              }
                              onClick={() =>
                                handleDelete(
                                  category,
                                )
                              }
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-soft hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-4 border-t border-border-subtle dark:border-[#334155]">
              <p className="text-xs text-ink-soft dark:text-[#94A3B8]">
                Showing{' '}
                <span className="font-bold text-ink dark:text-white">
                  {pageStart}
                </span>{' '}
                to{' '}
                <span className="font-bold text-ink dark:text-white">
                  {pageEnd}
                </span>{' '}
                of{' '}
                <span className="font-bold text-ink dark:text-white">
                  {totalCategories}
                </span>{' '}
                categories
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={
                    !canGoPrevious
                  }
                  onClick={() =>
                    setCurrentPage(
                      (prev) =>
                        Math.max(
                          1,
                          prev - 1,
                        ),
                    )
                  }
                  className="w-8 h-8 rounded-lg border border-border-subtle dark:border-[#334155] flex items-center justify-center text-ink-soft hover:text-brand hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {paginationPages.map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() =>
                        setCurrentPage(page)
                      }
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                        page ===
                        currentPage
                          ? 'bg-brand text-white'
                          : 'text-ink-soft hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  disabled={
                    !canGoNext
                  }
                  onClick={() =>
                    setCurrentPage(
                      (prev) =>
                        Math.min(
                          lastPage,
                          prev + 1,
                        ),
                    )
                  }
                  className="w-8 h-8 rounded-lg border border-border-subtle dark:border-[#334155] flex items-center justify-center text-ink-soft hover:text-brand hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <CategoryModal
        isOpen={isCategoryModalOpen}
        category={editingCategory}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={
          editingCategory
            ? handleEditCategory
            : handleAddCategory
        }
      />

    </div>
  );
};

export default CategoriesPage;
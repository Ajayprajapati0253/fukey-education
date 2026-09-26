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

import {
  getCategories,
} from '../../categories/api/category.api';

import {
  getCourseSubCategories,
  createCourseSubCategory,
  updateCourseSubCategory,
  deleteCourseSubCategory,
} from '../api/course-sub-category.api';

import type {
  CourseSubCategory,
  CourseSubCategoryFilterState,
} from '../types/course-sub-category.types';

import { CourseSubCategoryModal } from '../components/CourseSubCategoryModal';

interface ParentCategory {
  id: string;
  slug: string;
  status: boolean;
}

const DEFAULT_FILTERS: CourseSubCategoryFilterState = {
  search: '',
  status: 'All Status',
  perPage: 10,
};

const formatLabel = (value: string) => {
  if (!value) {
    return '';
  }

  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const CourseSubCategoriesPage: React.FC = () => {
  const [subCategories, setSubCategories] = useState<
    CourseSubCategory[]
  >([]);

  const [parentCategories, setParentCategories] = useState<
    ParentCategory[]
  >([]);

  const [selectedParentId, setSelectedParentId] =
    useState<string>('');

  const [isLoadingParents, setIsLoadingParents] =
    useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  const [toastType, setToastType] = useState<
    'success' | 'error'
  >('success');

  const [filters, setFilters] =
    useState<CourseSubCategoryFilterState>(
      DEFAULT_FILTERS,
    );

  const [currentPage, setCurrentPage] = useState(1);

  const [totalSubCategories, setTotalSubCategories] =
    useState(0);

  const [lastPage, setLastPage] = useState(1);

  const [editingSubCategory, setEditingSubCategory] =
    useState<CourseSubCategory | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * ----------------------------------------------------
   * TOAST
   * ----------------------------------------------------
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
   * ----------------------------------------------------
   * LOAD PARENT CATEGORIES
   * ----------------------------------------------------
   */

  const loadParentCategories = useCallback(
    async () => {
      setIsLoadingParents(true);

      try {
        const response = await getCategories(
          {
            search: '',
            status: 'All Status',
            trending: 'All',
            perPage: 100,
          },
          1,
        );

        const categories = Array.isArray(
          response?.data,
        )
          ? response.data
          : [];

        const activeCategories = categories
          .filter(
            (category: any) =>
              category.status === true ||
              category.status === 1,
          )
          .map((category: any) => ({
            id: String(category.id),
            slug: String(category.slug ?? ''),
            status: Boolean(category.status),
          }));

        setParentCategories(activeCategories);

        if (
          activeCategories.length > 0 &&
          !selectedParentId
        ) {
          setSelectedParentId(
            activeCategories[0].id,
          );
        }
      } catch (err: any) {
        console.error(
          'Failed to load parent categories:',
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

        showToast(message, 'error');
      } finally {
        setIsLoadingParents(false);
      }
    },
    [selectedParentId, showToast],
  );

  useEffect(() => {
    loadParentCategories();
  }, [loadParentCategories]);

  /**
   * ----------------------------------------------------
   * LOAD SUB CATEGORIES
   * ----------------------------------------------------
   */

  const loadSubCategories = useCallback(
    async () => {
      if (!selectedParentId) {
        setSubCategories([]);
        setTotalSubCategories(0);
        setLastPage(1);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response =
          await getCourseSubCategories({
            parentId: selectedParentId,
            keyword: filters.search,
            status:
              filters.status === 'All Status'
                ? ''
                : filters.status === 'Active'
                  ? '1'
                  : '0',
            page: currentPage,
            perPage: filters.perPage,
            orderBy: '0',
          });

        const data = Array.isArray(response?.data)
          ? response.data
          : [];

        setSubCategories(data);

        setTotalSubCategories(
          Number(response?.meta?.total ?? 0),
        );

        setLastPage(
          Math.max(
            1,
            Number(response?.meta?.last_page ?? 1),
          ),
        );
      } catch (err: any) {
        console.error(
          'Failed to load sub categories:',
          err,
        );

        const backendMessage =
          err?.response?.data?.message;

        const message =
          Array.isArray(backendMessage)
            ? backendMessage.join(', ')
            : backendMessage ||
              err?.message ||
              'Failed to load sub categories.';

        setError(message);
        setSubCategories([]);
        setTotalSubCategories(0);
        setLastPage(1);
      } finally {
        setIsLoading(false);
      }
    },
    [
      selectedParentId,
      filters,
      currentPage,
    ],
  );

  useEffect(() => {
    loadSubCategories();
  }, [loadSubCategories]);

  /**
   * ----------------------------------------------------
   * CURRENT PARENT
   * ----------------------------------------------------
   */

  const selectedParentCategory = useMemo(
    () =>
      parentCategories.find(
        (category) =>
          category.id === selectedParentId,
      ),
    [parentCategories, selectedParentId],
  );

  /**
   * ----------------------------------------------------
   * FILTERS
   * ----------------------------------------------------
   */

  const updateFilter = <
    K extends keyof CourseSubCategoryFilterState,
  >(
    key: K,
    value: CourseSubCategoryFilterState[K],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));

    setCurrentPage(1);
  };

  const handleParentChange = (
    value: string,
  ) => {
    setSelectedParentId(value);
    setCurrentPage(1);
    setEditingSubCategory(null);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  /**
   * ----------------------------------------------------
   * CREATE
   * ----------------------------------------------------
   */

  const handleAddSubCategory = async (
    data: any,
  ) => {
    if (!selectedParentId) {
      showToast(
        'Please select a parent category first.',
        'error',
      );
      return;
    }

    await createCourseSubCategory(
      selectedParentId,
      data,
    );

    showToast(
      'Sub category created successfully.',
    );

    setIsModalOpen(false);
    setEditingSubCategory(null);
    setCurrentPage(1);

    await loadSubCategories();
  };

  /**
   * ----------------------------------------------------
   * UPDATE
   * ----------------------------------------------------
   */

  const handleEditSubCategory = async (
    data: any,
  ) => {
    if (
      !editingSubCategory ||
      !selectedParentId
    ) {
      return;
    }

    await updateCourseSubCategory(
      selectedParentId,
      editingSubCategory.id,
      {
        status: data.status,
      },
    );

    showToast(
      'Sub category updated successfully.',
    );

    setIsModalOpen(false);
    setEditingSubCategory(null);

    await loadSubCategories();
  };

  /**
   * ----------------------------------------------------
   * DELETE
   * ----------------------------------------------------
   */

  const handleDelete = async (
    subCategory: CourseSubCategory,
  ) => {
    if (!selectedParentId) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${formatLabel(
        subCategory.slug,
      )}"?`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteCourseSubCategory(
        selectedParentId,
        subCategory.id,
      );

      showToast(
        `Sub category "${formatLabel(
          subCategory.slug,
        )}" deleted successfully.`,
      );

      await loadSubCategories();
    } catch (err: any) {
      console.error(
        'Delete sub category error:',
        err,
      );

      const backendMessage =
        err?.response?.data?.message;

      const message =
        Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage ||
            err?.message ||
            'Failed to delete sub category.';

      showToast(message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * ----------------------------------------------------
   * PAGINATION
   * ----------------------------------------------------
   */

  const pageStart =
    totalSubCategories === 0
      ? 0
      : (currentPage - 1) *
          filters.perPage +
        1;

  const pageEnd = Math.min(
    currentPage * filters.perPage,
    totalSubCategories,
  );

  const canGoPrevious = currentPage > 1;

  const canGoNext = currentPage < lastPage;

  const paginationPages = useMemo(() => {
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
   * ----------------------------------------------------
   * RENDER
   * ----------------------------------------------------
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
            Sub Categories
          </h1>

          <p className="text-xs sm:text-sm text-ink-soft dark:text-[#94A3B8] mt-0.5 font-medium">
            Manage child categories / subjects under each parent category.
          </p>
        </div>

        <button
          type="button"
          disabled={!selectedParentId}
          onClick={() => {
            setEditingSubCategory(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-brand text-white rounded-xl text-xs font-bold hover:bg-[#1E44B8] active:scale-[0.98] transition-all shadow-[0_2px_8px_rgba(36,81,217,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />

          <span>Add Sub Category</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1E293B] border border-border-subtle dark:border-[#334155] rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {/* Parent Category */}
          <select
            value={selectedParentId}
            disabled={isLoadingParents}
            onChange={(event) =>
              handleParentChange(
                event.target.value,
              )
            }
            className="h-10 px-3 rounded-xl border border-border-subtle dark:border-[#334155] bg-white dark:bg-[#0F172A] text-sm text-ink dark:text-white outline-none focus:border-brand"
          >
            <option value="">
              {isLoadingParents
                ? 'Loading categories...'
                : 'Select Category'}
            </option>

            {parentCategories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {formatLabel(category.slug)}
                </option>
              ),
            )}
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft dark:text-[#94A3B8]" />

            <input
              type="text"
              value={filters.search}
              onChange={(event) =>
                updateFilter(
                  'search',
                  event.target.value,
                )
              }
              placeholder="Search sub categories..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-border-subtle dark:border-[#334155] bg-white dark:bg-[#0F172A] text-sm text-ink dark:text-white outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
            />
          </div>

          {/* Status */}
          <select
            value={filters.status}
            onChange={(event) =>
              updateFilter(
                'status',
                event.target.value as CourseSubCategoryFilterState['status'],
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

          {/* Per Page */}
          <select
            value={filters.perPage}
            onChange={(event) =>
              updateFilter(
                'perPage',
                Number(event.target.value),
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

        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-ink-soft dark:text-[#94A3B8]">
            Parent:{' '}
            <span className="font-bold text-ink dark:text-white">
              {selectedParentCategory
                ? formatLabel(
                    selectedParentCategory.slug,
                  )
                : 'None selected'}
            </span>
          </p>

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
              Loading sub categories...
            </span>
          </div>
        ) : !selectedParentId ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <Search className="w-5 h-5 text-ink-soft" />
            </div>

            <h3 className="text-sm font-bold text-ink dark:text-white">
              Select a category
            </h3>

            <p className="text-xs text-ink-soft dark:text-[#94A3B8] mt-1">
              Select a parent category to view its sub categories.
            </p>
          </div>
        ) : subCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <Search className="w-5 h-5 text-ink-soft" />
            </div>

            <h3 className="text-sm font-bold text-ink dark:text-white">
              No sub categories found
            </h3>

            <p className="text-xs text-ink-soft dark:text-[#94A3B8] mt-1">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-border-subtle dark:border-[#334155] bg-slate-50/70 dark:bg-[#172033]">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-ink-soft dark:text-[#94A3B8]">
                      ID
                    </th>

                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-ink-soft dark:text-[#94A3B8]">
                      Sub Category
                    </th>

                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-ink-soft dark:text-[#94A3B8]">
                      Parent Category
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
                  {subCategories.map(
                    (subCategory) => (
                      <tr
                        key={subCategory.id}
                        className="border-b border-border-subtle dark:border-[#334155] last:border-b-0 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-4 py-4 text-xs font-semibold text-ink-soft dark:text-[#CBD5E1]">
                          #{subCategory.id}
                        </td>

                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-bold text-ink dark:text-white">
                              {formatLabel(
                                subCategory.slug,
                              )}
                            </p>

                            <p className="text-[11px] text-ink-soft dark:text-[#94A3B8] mt-0.5">
                              /{subCategory.slug}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-xs font-medium text-ink-soft dark:text-[#CBD5E1]">
                          {selectedParentCategory
                            ? formatLabel(
                                selectedParentCategory.slug,
                              )
                            : '—'}
                        </td>

                        <td className="px-4 py-4 text-center">
                          {subCategory.status ? (
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
                              title="Edit Sub Category"
                              onClick={() => {
                                setEditingSubCategory(
                                  subCategory,
                                );

                                setIsModalOpen(true);
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-soft hover:text-brand hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              title="Delete Sub Category"
                              disabled={isDeleting}
                              onClick={() =>
                                handleDelete(
                                  subCategory,
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
                  {totalSubCategories}
                </span>{' '}
                sub categories
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={!canGoPrevious}
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
                        page === currentPage
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
                  disabled={!canGoNext}
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

      {/* Modal */}
      <CourseSubCategoryModal
        isOpen={isModalOpen}
        subCategory={editingSubCategory}
        parentCategoryName={
          selectedParentCategory
            ? formatLabel(
                selectedParentCategory.slug,
              )
            : undefined
        }
        onClose={() => {
          setIsModalOpen(false);
          setEditingSubCategory(null);
        }}
        onSubmit={
          editingSubCategory
            ? handleEditSubCategory
            : handleAddSubCategory
        }
      />
    </div>
  );
};

export default CourseSubCategoriesPage;
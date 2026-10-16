import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Upload,
  Plus,
  Search,
  CheckCircle2,
  Loader2,
  RotateCcw,
} from 'lucide-react';

import { CourseLanguageTable } from '../components/CourseLanguageTable';
import { AddCourseLanguageModal } from '../components/AddCourseLanguageModal';
import { EditCourseLanguageModal } from '../components/EditCourseLanguageModal';

import {
  getCourseLanguages,
  createCourseLanguage,
  updateCourseLanguage,
  deleteCourseLanguage,
  updateCourseLanguageStatus,
} from '../api/course-language.api';

import type {
  CourseLanguage,
  CourseLanguageFilters,
} from '../types/course-language.types';

const DEFAULT_FILTERS: CourseLanguageFilters = {
  search: '',
  status: 'All Status',
  orderBy: 'newest',
  perPage: 15,
};

export const CourseLanguagesPage: React.FC = () => {
  const [filters, setFilters] =
    useState<CourseLanguageFilters>(
      DEFAULT_FILTERS,
    );

  const [currentPage, setCurrentPage] =
    useState(1);

  const [languages, setLanguages] = useState<
    CourseLanguage[]
  >([]);

  const [totalLanguages, setTotalLanguages] =
    useState(0);

  const [lastPage, setLastPage] = useState(1);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  const [selectedIds, setSelectedIds] =
    useState<number[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] =
    useState(false);

  const [isEditModalOpen, setIsEditModalOpen] =
    useState(false);

  const [editingLanguage, setEditingLanguage] =
    useState<CourseLanguage | null>(null);

  const showToast = useCallback(
    (message: string) => {
      setToastMessage(message);

      window.setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    },
    [],
  );

  const loadLanguages = useCallback(
    async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await getCourseLanguages(
            filters,
            currentPage,
          );

        const data = Array.isArray(
          response?.data,
        )
          ? response.data
          : [];

        setLanguages(data);

        setTotalLanguages(
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
          'Failed to load course languages:',
          err,
        );

        const backendMessage =
          err?.response?.data?.message;

        const message = Array.isArray(
          backendMessage,
        )
          ? backendMessage.join(', ')
          : backendMessage ||
            err?.message ||
            'Failed to load course languages.';

        setError(message);
        setLanguages([]);
        setTotalLanguages(0);
        setLastPage(1);
      } finally {
        setIsLoading(false);
      }
    },
    [filters, currentPage],
  );

  useEffect(() => {
    loadLanguages();
  }, [loadLanguages]);

  const handleAddLanguage = async (
    data: {
      name: string;
      status: number;
    },
  ) => {
    setIsSubmitting(true);

    try {
      await createCourseLanguage(data);

      setIsAddModalOpen(false);

      showToast(
        `Language "${data.name}" created successfully.`,
      );

      await loadLanguages();
    } catch (err: any) {
      console.error(
        'Create language error:',
        err,
      );

      const backendMessage =
        err?.response?.data?.message;

      const message = Array.isArray(
        backendMessage,
      )
        ? backendMessage.join(', ')
        : backendMessage ||
          err?.message ||
          'Failed to create language.';

      showToast(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLanguage = async (
    id: number,
    data: {
      name: string;
      status: number;
    },
  ) => {
    setIsSubmitting(true);

    try {
      await updateCourseLanguage(id, data);

      setIsEditModalOpen(false);
      setEditingLanguage(null);

      showToast(
        `Language "${data.name}" updated successfully.`,
      );

      await loadLanguages();
    } catch (err: any) {
      console.error(
        'Update language error:',
        err,
      );

      const backendMessage =
        err?.response?.data?.message;

      const message = Array.isArray(
        backendMessage,
      )
        ? backendMessage.join(', ')
        : backendMessage ||
          err?.message ||
          'Failed to update language.';

      showToast(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLanguage = async (
    id: number,
  ) => {
    const target = languages.find(
      (item) => item.id === id,
    );

    if (
      !window.confirm(
        `Are you sure you want to delete "${target?.name || 'this language'}"?`,
      )
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      await deleteCourseLanguage(id);

      showToast(
        'Course language deleted successfully.',
      );

      await loadLanguages();
    } catch (err: any) {
      console.error(
        'Delete language error:',
        err,
      );

      showToast(
        err?.response?.data?.message ||
          'Failed to delete language.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (
    id: number,
  ) => {
    setIsSubmitting(true);

    try {
      await updateCourseLanguageStatus(id);

      showToast(
        'Language status updated successfully.',
      );

      await loadLanguages();
    } catch (err: any) {
      console.error(
        'Status update error:',
        err,
      );

      showToast(
        err?.response?.data?.message ||
          'Failed to update status.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSelectAll =
    useCallback(() => {
      const pageIds = languages.map(
        (item) => item.id,
      );

      const allSelected =
        pageIds.length > 0 &&
        pageIds.every((id) =>
          selectedIds.includes(id),
        );

      setSelectedIds((prev) =>
        allSelected
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
    }, [languages, selectedIds]);

  const handleToggleSelectRow = (
    id: number,
  ) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter(
            (item) => item !== id,
          )
        : [...prev, id],
    );
  };

  const handleExportCSV = () => {
    if (!languages.length) {
      return;
    }

    const headers = [
      'SN',
      'ID',
      'Language',
      'Status',
      'Created',
    ];

    const rows = languages.map(
      (language, index) => [
        (currentPage - 1) *
            filters.perPage +
          index +
          1,
        language.id,
        `"${String(
          language.name ?? '',
        ).replace(/"/g, '""')}"`,
        language.status === 1 ||
        language.status === true
          ? 'Active'
          : 'Inactive',
        `"${String(
          language.created_at ?? '',
        ).replace(/"/g, '""')}"`,
      ],
    );

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...rows.map((row) =>
          row.join(','),
        ),
      ].join('\n');

    const link =
      document.createElement('a');

    link.href = encodeURI(csvContent);

    link.download = `fukey_course_languages_${Date.now()}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    showToast(
      `Exported ${languages.length} language(s).`,
    );
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);

    showToast(
      'Filters reset to default.',
    );
  };

  return (
    <div className="space-y-6 pb-8">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-success" />

          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink dark:text-white tracking-tight">
            Manage Course Languages
          </h1>

          <p className="text-xs sm:text-sm text-ink-soft dark:text-[#94A3B8] mt-0.5 font-medium">
            Create, manage and organize languages available for courses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={
              isLoading ||
              languages.length === 0
            }
            className="flex items-center gap-2 px-4 py-2 border border-border-subtle dark:border-[#334155] bg-white dark:bg-[#1E293B] rounded-xl text-xs font-bold text-ink dark:text-gray-100 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4 rotate-45" />

            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setIsAddModalOpen(true)
            }
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white rounded-xl text-xs font-bold hover:bg-[#1E44B8] active:scale-[0.98] transition-all shadow-[0_2px_8px_rgba(36,81,217,0.25)] disabled:opacity-50"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />

            <span>Add Language</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1E293B] border border-border-subtle dark:border-[#334155] rounded-2xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft dark:text-[#94A3B8]" />

            <input
              value={filters.search}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  search: e.target.value,
                }));

                setCurrentPage(1);
              }}
              placeholder="Search language..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-subtle dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs text-ink dark:text-white outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
            />
          </div>

          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                status: e.target.value,
              }));

              setCurrentPage(1);
            }}
            className="px-3 py-2.5 rounded-xl border border-border-subtle dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs text-ink dark:text-white outline-none focus:border-brand"
          >
            <option>All Status</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>

          {/* Order */}
          <select
            value={filters.orderBy}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                orderBy: e.target.value,
              }));

              setCurrentPage(1);
            }}
            className="px-3 py-2.5 rounded-xl border border-border-subtle dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs text-ink dark:text-white outline-none focus:border-brand"
          >
            <option value="newest">
              Newest
            </option>

            <option value="oldest">
              Oldest
            </option>

            <option value="name_asc">
              Name A-Z
            </option>

            <option value="name_desc">
              Name Z-A
            </option>
          </select>
        </div>

        <div className="flex justify-end mt-3">
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 text-xs font-bold text-ink-soft dark:text-[#94A3B8] hover:text-brand transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />

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

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1E293B] border border-border-subtle dark:border-[#334155] rounded-2xl p-5">
          <p className="text-xs font-semibold text-ink-soft dark:text-[#94A3B8]">
            Total Languages
          </p>

          <p className="text-2xl font-bold text-ink dark:text-white mt-2">
            {totalLanguages}
          </p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] border border-border-subtle dark:border-[#334155] rounded-2xl p-5">
          <p className="text-xs font-semibold text-ink-soft dark:text-[#94A3B8]">
            Active
          </p>

          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {
              languages.filter(
                (item) =>
                  item.status === 1 ||
                  item.status === true,
              ).length
            }
          </p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] border border-border-subtle dark:border-[#334155] rounded-2xl p-5">
          <p className="text-xs font-semibold text-ink-soft dark:text-[#94A3B8]">
            Inactive
          </p>

          <p className="text-2xl font-bold text-slate-500 mt-2">
            {
              languages.filter(
                (item) =>
                  item.status === 0 ||
                  item.status === false,
              ).length
            }
          </p>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white dark:bg-[#1E293B] border border-border-subtle dark:border-[#334155] rounded-2xl">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-brand" />

              <span className="text-sm font-medium text-ink-soft">
                Loading course languages...
              </span>
            </div>
          </div>
        </div>
      ) : (
        <CourseLanguageTable
          languages={languages}
          selectedIds={selectedIds}
          onToggleSelectAll={
            handleToggleSelectAll
          }
          onToggleSelectRow={
            handleToggleSelectRow
          }
          onEdit={(language) => {
            setEditingLanguage(language);
            setIsEditModalOpen(true);
          }}
          onDelete={handleDeleteLanguage}
          onStatusChange={
            handleStatusChange
          }
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          perPage={filters.perPage}
          totalItems={totalLanguages}
          totalPages={lastPage}
        />
      )}

      {/* Add */}
      <AddCourseLanguageModal
        isOpen={isAddModalOpen}
        isSubmitting={isSubmitting}
        onClose={() =>
          setIsAddModalOpen(false)
        }
        onSubmit={handleAddLanguage}
      />

      {/* Edit */}
      <EditCourseLanguageModal
        language={editingLanguage}
        isOpen={isEditModalOpen}
        isSubmitting={isSubmitting}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingLanguage(null);
        }}
        onSubmit={handleEditLanguage}
      />

      {/* Processing */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          <div className="absolute top-5 right-5 bg-ink text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold">
            <Loader2 className="w-4 h-4 animate-spin" />

            Processing...
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseLanguagesPage;
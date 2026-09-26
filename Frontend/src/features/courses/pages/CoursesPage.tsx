import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Upload,
  Plus,
  ChevronDown,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

import { MetricCards } from '../components/MetricCards';
import { CourseFilters } from '../components/CourseFilters';
import { CourseTable } from '../components/CourseTable';
import { AddCourseModal } from '../components/AddCourseModal';
import { EditCourseModal } from '../components/EditCourseModal';
import { CourseDetailsModal } from '../components/CourseDetailsModal';

import type {
  Course,
  CourseFilterState,
  CourseStatus,
  ApprovalStatus,
} from '../types/course.types';
import {
  getCourses,
  getCourseMetricCounts,
  createCourse,
  updateCourse,
  deleteCourse,
  bulkDeleteCourses,
  mapApiCourse,
} from '../api/course.api';

const DEFAULT_FILTERS: CourseFilterState = {
  search: '',
  date: '',
  category: 'All Categories',
  instructor: 'All Instructors',
  level: 'All Levels',
  language: 'All Languages',
  status: 'All Status',
  approvalStatus: 'All Approval Status',
  courseType: 'Course Type',
  orderBy: 'newest',
  perPage: 10,
};

const PARAM_KEYS: Record<keyof CourseFilterState, string> = {
  search: 'q',
  date: 'date',
  category: 'category',
  instructor: 'instructor',
  level: 'level',
  language: 'language',
  status: 'status',
  approvalStatus: 'approval',
  courseType: 'type',
  orderBy: 'sort',
  perPage: 'perPage',
};

function filtersFromSearchParams(
  params: URLSearchParams,
): CourseFilterState {
  const next = { ...DEFAULT_FILTERS };

  (Object.keys(PARAM_KEYS) as (keyof CourseFilterState)[]).forEach(
    (key) => {
      const raw = params.get(PARAM_KEYS[key]);

      if (raw === null) return;

      if (key === 'perPage') {
        const n = Number(raw);

        if (!Number.isNaN(n) && n > 0) {
          next.perPage = n;
        }
      } else {
        (next[key] as string) = raw;
      }
    },
  );

  return next;
}

function searchParamsFromFilters(
  filters: CourseFilterState,
  page: number,
): URLSearchParams {
  const params = new URLSearchParams();

  (
    Object.keys(PARAM_KEYS) as (keyof CourseFilterState)[]
  ).forEach((key) => {
    const value = filters[key];
    const defaultValue = DEFAULT_FILTERS[key];

    if (value !== defaultValue && value !== '') {
      params.set(PARAM_KEYS[key], String(value));
    }
  });

  if (page > 1) {
    params.set('page', String(page));
  }

  return params;
}

export const CoursesPage: React.FC = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const filters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams],
  );

  const currentPage = useMemo(() => {
    const p = Number(searchParams.get('page'));

    return Number.isFinite(p) && p > 0 ? p : 1;
  }, [searchParams]);

  const [courses, setCourses] = useState<Course[]>([]);

  const [totalCourses, setTotalCourses] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  // Real counts loaded from the API. No demo/static metric values.
  const [metricCounts, setMetricCounts] = useState({
    published: 0,
    pendingReview: 0,
    draft: 0,
    archived: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>(
    [],
  );

  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  const [isAddDropdownOpen, setIsAddDropdownOpen] =
    useState(false);

  const [isAddModalOpen, setIsAddModalOpen] =
    useState(false);

  const [isEditModalOpen, setIsEditModalOpen] =
    useState(false);

  const [isDetailsModalOpen, setIsDetailsModalOpen] =
    useState(false);

  const [viewingCourse, setViewingCourse] =
    useState<Course | null>(null);

  const [editingCourse, setEditingCourse] =
    useState<Course | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);

    window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);
  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getCourses(filters, currentPage);

      const apiCourses = Array.isArray(response?.data)
        ? response.data
        : [];

      setCourses(
        apiCourses.map((course, index) =>
          mapApiCourse(course, index),
        ),
      );

      setTotalCourses(
        Number(response?.meta?.total ?? 0),
      );

      setLastPage(
        Math.max(
          1,
          Number(response?.meta?.last_page ?? 1),
        ),
      );

      setSelectedIds([]);

      try {
        const counts = await getCourseMetricCounts(filters);
        setMetricCounts(counts);
      } catch (err) {
        console.error(
          'Failed to load course metric counts:',
          err,
        );

        setMetricCounts({
          published: 0,
          pendingReview: 0,
          draft: 0,
          archived: 0,
        });
      }
    } catch (err: any) {
      console.error(
        'Failed to load courses:',
        err,
      );

      const message =
        err?.response?.data?.message ??
        err?.message ??
        'Failed to load courses.';

      setError(message);
      setCourses([]);
      setTotalCourses(0);
      setLastPage(1);

      setMetricCounts({
        published: 0,
        pendingReview: 0,
        draft: 0,
        archived: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  /**
   * Filters are now sent to the backend.
   */
  const setFilters = useCallback(
    (
      updater:
        | CourseFilterState
        | ((
            prev: CourseFilterState,
          ) => CourseFilterState),
    ) => {
      const next =
        typeof updater === 'function'
          ? updater(filters)
          : updater;

      setSearchParams(
        searchParamsFromFilters(
          next,
          1,
        ),
        {
          replace: false,
        },
      );
    },
    [
      filters,
      setSearchParams,
    ],
  );

  const setCurrentPage = useCallback(
    (page: number) => {
      const safePage = Math.max(
        1,
        Math.min(page, lastPage || 1),
      );

      setSearchParams(
        searchParamsFromFilters(
          filters,
          safePage,
        ),
        {
          replace: false,
        },
      );
    },
    [
      filters,
      lastPage,
      setSearchParams,
    ],
  );
  /**
   * CREATE
   */
  const handleAddCourse = async (
    data: Omit<
      Course,
      'id' | 'sn' | 'createdDate' | 'createdTime'
    >,
  ) => {
    setIsSubmitting(true);

    try {
      await createCourse({
        ...(data as any),
        instructorId: Number(
          (data as any).instructorId,
        ),
        categoryId: Number(
          (data as any).categoryId,
        ),
      });

      setIsAddModalOpen(false);

      showToast(
        `Course "${data.title}" successfully created!`,
      );

      await loadCourses();
    } catch (err: any) {
      const backendMessage =
        err?.response?.data?.message;

      const message = Array.isArray(backendMessage)
        ? backendMessage.join(', ')
        : backendMessage ||
          err?.message ||
          'Failed to create course.';

      showToast(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * UPDATE
   */
  const handleUpdateCourse = async (
    updated: Course,
  ) => {
    setIsSubmitting(true);

    try {
      await updateCourse(updated);

      setIsEditModalOpen(false);
      setEditingCourse(null);

      showToast(
        `Course "${updated.title}" updated successfully.`,
      );

      await loadCourses();
    } catch (err: any) {
      console.error(
        'Update course error:',
        err,
      );

      const backendMessage =
        err?.response?.data?.message;

      const message = Array.isArray(backendMessage)
        ? backendMessage.join(', ')
        : backendMessage ||
          err?.message ||
          'Failed to update course.';

      showToast(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * DELETE
   */
  const handleDeleteCourse = async (
    id: string,
  ) => {
    const target = courses.find(
      (course) => course.id === id,
    );

    if (
      !window.confirm(
        `Are you sure you want to delete "${
          target?.title || 'this course'
        }"?`,
      )
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      await deleteCourse(id);

      setSelectedIds((prev) =>
        prev.filter(
          (item) => item !== id,
        ),
      );

      showToast(
        'Course removed successfully.',
      );

      await loadCourses();
    } catch (err: any) {
      console.error(
        'Delete course error:',
        err,
      );

      showToast(
        err?.response?.data?.message ??
          'Failed to delete course.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Duplicate is intentionally disabled because
   * backend has no duplicate endpoint.
   */
  const handleDuplicateCourse = (
    course: Course,
  ) => {
    showToast(
      'Duplicate course API is not available yet.',
    );
  };

  /**
   * Backend currently does not expose a dedicated
   * status update endpoint.
   *
   * The existing PATCH endpoint only updates the
   * basic course fields in CourseService.
   */
  const handleChangeStatus = (
    id: string,
    newStatus: CourseStatus,
  ) => {
    showToast(
      `Status update API is not available yet.`,
    );
  };

  const handleChangeApprovalStatus = async (
    id: string,
    newApproval: ApprovalStatus,
  ) => {
    const course = courses.find((item) => item.id === id);

    if (!course) {
      showToast('Course not found.');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateCourse({
        ...course,
        approvalStatus: newApproval,
      });

      setCourses((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                approvalStatus: newApproval,
              }
            : item,
        ),
      );

      showToast(
        `Approval status changed to "${newApproval}".`,
      );

      await loadCourses();
    } catch (err: any) {
      console.error(
        'Approval status update error:',
        err,
      );

      const backendMessage =
        err?.response?.data?.message;

      const message = Array.isArray(backendMessage)
        ? backendMessage.join(', ')
        : backendMessage ||
          err?.message ||
          'Failed to update approval status.';

      showToast(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * SELECT ALL
   *
   * Courses already represent the current API page,
   * so no local slice is required.
   */
  const handleToggleSelectAll = () => {
    const pageIds = courses.map(
      (course) => course.id,
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
  };

  const handleToggleSelectRow = (
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
   * Bulk status API does not currently exist.
   */
  const handleBulkStatusChange = (
    status: CourseStatus,
  ) => {
    showToast(
      'Bulk status API is not available yet.',
    );
  };
  /**
   * Bulk delete
   */
  const handleBulkDelete = async () => {
    if (!selectedIds.length) {
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} selected course(s)?`,
      )
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      await bulkDeleteCourses(selectedIds);

      showToast(
        `Deleted ${selectedIds.length} course(s).`,
      );

      setSelectedIds([]);

      await loadCourses();
    } catch (err: any) {
      console.error(
        'Bulk delete error:',
        err,
      );

      showToast(
        err?.response?.data?.message ??
          'Failed to delete selected courses.',
      );

      await loadCourses();
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * CSV export uses currently loaded API data.
   */
  const handleExportCSV = (
    selectedOnly = false,
  ) => {
    const dataToExport =
      selectedOnly &&
      selectedIds.length > 0
        ? courses.filter(
            (course) =>
              selectedIds.includes(
                course.id,
              ),
          )
        : courses;

    const headers = [
      'SN',
      'ID',
      'Title',
      'Subtitle',
      'Instructor',
      'Category',
      'Level',
      'Students',
      'Price',
      'IsFree',
      'Status',
      'ApprovalStatus',
      'Language',
      'CreatedDate',
      'CreatedTime',
    ];

    const rows =
      dataToExport.map((course) => [
        course.sn,
        `"${course.id}"`,
        `"${String(
          course.title ?? '',
        ).replace(/"/g, '""')}"`,
        `"${String(
          course.subtitle ?? '',
        ).replace(/"/g, '""')}"`,
        `"${String(
          course.instructorName ?? '',
        ).replace(/"/g, '""')}"`,
        `"${String(
          course.category ?? '',
        )}"`,
        `"${String(
          course.level ?? '',
        )}"`,
        course.studentsCount,
        course.price,
        course.isFree
          ? 'TRUE'
          : 'FALSE',
        `"${String(
          course.status ?? '',
        )}"`,
        `"${String(
          course.approvalStatus ?? '',
        )}"`,
        `"${String(
          course.language ?? '',
        )}"`,
        `"${String(
          course.createdDate ?? '',
        )}"`,
        `"${String(
          course.createdTime ?? '',
        )}"`,
      ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...rows.map(
          (row) =>
            row.join(','),
        ),
      ].join('\n');

    const link =
      document.createElement('a');

    link.setAttribute(
      'href',
      encodeURI(csvContent),
    );

    link.setAttribute(
      'download',
      `fukey_courses_export_${Date.now()}.csv`,
    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    showToast(
      `Exported ${dataToExport.length} course(s) to CSV!`,
    );
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);

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

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink dark:text-white tracking-tight">
            Manage Courses
          </h1>

          <p className="text-xs sm:text-sm text-ink-soft dark:text-[#94A3B8] mt-0.5 font-medium">
            Create, manage and organize all courses on your platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              handleExportCSV(false)
            }
            disabled={
              isLoading ||
              courses.length === 0
            }
            className="flex items-center gap-2 px-4 py-2 border border-border-subtle dark:border-[#334155] bg-white dark:bg-[#1E293B] rounded-xl text-xs font-bold text-ink dark:text-gray-100 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4 rotate-45" />

            <span>Export</span>
          </button>

          <div className="relative">
            <button
              onClick={() =>
                setIsAddModalOpen(true)
              }
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white rounded-xl text-xs font-bold hover:bg-[#1E44B8] active:scale-[0.98] transition-all shadow-[0_2px_8px_rgba(36,81,217,0.25)] select-none disabled:opacity-50"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />

              <span>Add Course</span>

              <span
                onClick={(e) => {
                  e.stopPropagation();

                  setIsAddDropdownOpen(
                    (prev) => !prev,
                  );
                }}
                className="p-0.5 hover:bg-white/20 rounded"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    isAddDropdownOpen
                      ? 'rotate-180'
                      : ''
                  }`}
                />
              </span>
            </button>

            {isAddDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1E293B] border border-border-subtle dark:border-[#334155] rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.15)] p-1.5 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    setIsAddDropdownOpen(
                      false,
                    );

                    setIsAddModalOpen(
                      true,
                    );
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-ink dark:text-gray-100 hover:bg-[#EAF0FE] dark:hover:bg-[#2451D9]/20 hover:text-brand rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-brand" />

                  <span>
                    Create Single Course
                  </span>
                </button>

              </div>
            )}
          </div>
        </div>
      </div>

      <CourseFilters
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
        onApplyFilter={() =>
          loadCourses()
        }
        filteredCount={totalCourses}
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <MetricCards
        courses={courses}
        totalCourses={totalCourses}
        publishedCount={
          metricCounts.published
        }
        pendingReviewCount={
          metricCounts.pendingReview
        }
        draftCount={
          metricCounts.draft
        }
        archivedCount={
          metricCounts.archived
        }
        activeStatusFilter={
          filters.status
        }
        onSelectStatusFilter={(
          status,
        ) =>
          setFilters((prev) => ({
            ...prev,
            status,
          }))
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-brand" />

            <span className="text-sm font-medium text-ink-soft">
              Loading courses...
            </span>
          </div>
        </div>
      ) : (
        <CourseTable
          courses={courses}
          selectedIds={selectedIds}
          onToggleSelectAll={
            handleToggleSelectAll
          }
          onToggleSelectRow={
            handleToggleSelectRow
          }
          onViewCourse={(course) => {
            setViewingCourse(course);
            setIsDetailsModalOpen(
              true,
            );
          }}
          onEditCourse={(course) => {
            setEditingCourse(course);
            setIsEditModalOpen(true);
          }}
          onDeleteCourse={
            handleDeleteCourse
          }
          onDuplicateCourse={
            handleDuplicateCourse
          }
          onChangeStatus={
            handleChangeStatus
          }
          onChangeApprovalStatus={
            handleChangeApprovalStatus
          }
          onBulkDelete={
            handleBulkDelete
          }
          onBulkStatusChange={
            handleBulkStatusChange
          }
          onBulkExport={() =>
            handleExportCSV(true)
          }
          currentPage={currentPage}
          setCurrentPage={
            setCurrentPage
          }
          perPage={filters.perPage}
          totalItems={totalCourses}
          totalPages={lastPage}
        />
      )}

      <AddCourseModal
        isOpen={isAddModalOpen}
        onClose={() =>
          setIsAddModalOpen(false)
        }
        onAddCourse={
          handleAddCourse
        }
      />

      <EditCourseModal
        course={editingCourse}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCourse(null);
        }}
        onUpdateCourse={
          handleUpdateCourse
        }
      />

      <CourseDetailsModal
        course={viewingCourse}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setViewingCourse(null);
        }}
        onEdit={(course) => {
          setViewingCourse(null);
          setIsDetailsModalOpen(false);

          setEditingCourse(course);
          setIsEditModalOpen(true);
        }}
      />

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

export default CoursesPage;
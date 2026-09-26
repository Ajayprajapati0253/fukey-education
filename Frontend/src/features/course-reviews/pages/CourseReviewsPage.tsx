import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  RefreshCw,
  Trash2,
  Users,
  X,
} from 'lucide-react';

import {
  deleteCourseReview,
  getCourseReviews,
  updateCourseReview,
} from '../api/course-review.api';

import { CourseReviewFilters } from '../components/CourseReviewFilters';
import { CourseReviewTable } from '../components/CourseReviewTable';
import { EditCourseReviewModal } from '../components/EditCourseReviewModal';

import type {
  CourseReview,
  CourseReviewFilters as Filters,
} from '../types/course-review.types';

const DEFAULT_FILTERS: Filters = {
  keyword: '',
  status: 'all',
  orderBy: '0',
  parPage: 15,
};

const getErrorMessage = (error: any) =>
  Array.isArray(error?.response?.data?.message)
    ? error.response.data.message.join(', ')
    : error?.response?.data?.message ??
      error?.message ??
      'Something went wrong.';

const SkeletonRow = () => (
  <div className="animate-pulse px-4 py-4 border-b border-border-subtle">
    <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
  </div>
);

export const CourseReviewsPage: React.FC = () => {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<CourseReview | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = useCallback(
    (type: 'success' | 'error', message: string) => {
      setToast({ type, message });
      window.setTimeout(() => setToast(null), 3000);
    },
    [],
  );

  const loadReviews = useCallback(
    async (page = 1) => {
      setIsLoading(true);

      try {
        const response = await getCourseReviews(filters, page);

        setReviews(Array.isArray(response?.data) ? response.data : []);
        setMeta(
          response?.meta ?? {
            current_page: page,
            last_page: 1,
            total: 0,
          },
        );
      } catch (error: any) {
        setReviews([]);
        showToast('error', getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    },
    [filters, showToast],
  );

  useEffect(() => {
    loadReviews(1);
  }, [loadReviews]);

  const activeCount = useMemo(
    () => reviews.filter((review) => review.status).length,
    [reviews],
  );

  const inactiveCount = useMemo(
    () => reviews.filter((review) => !review.status).length,
    [reviews],
  );

  const handleFiltersChange = (next: Filters) => {
    setFilters(next);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleSaveStatus = async (status: boolean) => {
    if (!editingReview) return;

    setIsSaving(true);

    try {
      await updateCourseReview(editingReview.id, { status });

      showToast('success', 'Review status updated successfully.');
      setEditingReview(null);
      await loadReviews(meta.current_page);
    } catch (error: any) {
      showToast('error', getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (review: CourseReview) => {
    const confirmed = window.confirm(
      `Delete the review by "${review.user?.name ?? 'this student'}" for "${review.course?.title ?? 'this course'}"?`,
    );

    if (!confirmed) return;

    setProcessingId(review.id);

    try {
      await deleteCourseReview(review.id);
      showToast('success', 'Review deleted successfully.');

      const nextPage =
        reviews.length === 1 && meta.current_page > 1
          ? meta.current_page - 1
          : meta.current_page;

      await loadReviews(nextPage);
    } catch (error: any) {
      showToast('error', getErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed right-5 top-5 z-[70]">
          <div
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 shadow-lg text-sm font-semibold ${
              toast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {toast.message}
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 opacity-60 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-gray-100">
            Manage Course Reviews
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Review, moderate and manage student course reviews.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadReviews(meta.current_page)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border-subtle bg-white dark:bg-[#1E293B] text-sm font-semibold text-ink dark:text-gray-100 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <CourseReviewFilters
        filters={filters}
        onChange={handleFiltersChange}
        onReset={handleReset}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border-subtle bg-white dark:bg-[#1E293B] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
                Total Reviews
              </p>
              <p className="mt-2 text-2xl font-bold text-ink dark:text-gray-100">
                {meta.total}
              </p>
            </div>
            <MessageSquare className="w-5 h-5 text-brand" />
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle bg-white dark:bg-[#1E293B] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
                Active
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {activeCount}
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle bg-white dark:bg-[#1E293B] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
                Inactive
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-500">
                {inactiveCount}
              </p>
            </div>
            <Users className="w-5 h-5 text-slate-500" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl overflow-hidden border border-border-subtle bg-white dark:bg-[#1E293B]">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonRow key={index} />
          ))}
        </div>
      ) : (
        <CourseReviewTable
          reviews={reviews}
          onEdit={setEditingReview}
          onDelete={handleDelete}
        />
      )}

      {!isLoading && meta.last_page > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-ink-soft">
            Page {meta.current_page} of {meta.last_page}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={meta.current_page <= 1}
              onClick={() => loadReviews(meta.current_page - 1)}
              className="px-3 py-2 rounded-lg border border-border-subtle text-sm font-semibold disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => loadReviews(meta.current_page + 1)}
              className="px-3 py-2 rounded-lg border border-border-subtle text-sm font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <EditCourseReviewModal
        review={editingReview}
        isOpen={Boolean(editingReview)}
        isSaving={isSaving}
        onClose={() => {
          if (!isSaving) setEditingReview(null);
        }}
        onSave={handleSaveStatus}
      />

      {processingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20">
          <div className="rounded-xl bg-white dark:bg-[#1E293B] border border-border-subtle px-5 py-4 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink dark:text-gray-100">
              <Trash2 className="w-4 h-4 text-red-500 animate-pulse" />
              Deleting review...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseReviewsPage;

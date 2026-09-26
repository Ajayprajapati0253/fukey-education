import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  FolderOpen,
  Plus,
} from 'lucide-react';

import {
  createFreeCourseCategory,
  deleteFreeCourseCategory,
  getFreeCourseCategories,
  updateFreeCourseCategory,
  updateFreeCourseCategoryStatus,
  type FreeCourseCategory,
  type FreeCourseCategoryPayload,
} from '../api/free-course-category.api';

import FreeCourseCategoryFilters from '../components/FreeCourseCategoryFilters';
import FreeCourseCategoryTable from '../components/FreeCourseCategoryTable';
import FreeCourseCategoryFormModal from '../components/FreeCourseCategoryFormModal';

const FreeCourseCategoriesPage: React.FC =
  () => {
    const [categories, setCategories] =
      useState<FreeCourseCategory[]>([]);

    const [loading, setLoading] =
      useState(true);

    const [saving, setSaving] =
      useState(false);

    const [modalOpen, setModalOpen] =
      useState(false);

    const [selectedCategory, setSelectedCategory] =
      useState<FreeCourseCategory | null>(
        null,
      );

    const [search, setSearch] =
      useState('');

    const [status, setStatus] = useState('');
    const [trending, setTrending] = useState('');

    const [error, setError] =
      useState('');

    const [success, setSuccess] =
      useState('');

    const loadCategories =
      useCallback(async () => {
        try {
          setLoading(true);
          setError('');

          const response =
            await getFreeCourseCategories();

          setCategories(
            Array.isArray(response.data)
              ? response.data
              : [],
          );
        } catch (err: any) {
          console.error(
            'Failed to load free course categories:',
            err,
          );

          setError(
            err?.response?.data?.message ||
              'Failed to load categories.',
          );
        } finally {
          setLoading(false);
        }
      }, []);

    useEffect(() => {
      loadCategories();
    }, [loadCategories]);

    const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return categories.filter((category) => {
        const matchesSearch =
        !keyword ||
        category.name
            .toLowerCase()
            .includes(keyword) ||
        category.slug
            ?.toLowerCase()
            .includes(keyword);

        const matchesStatus =
        !status ||
        String(category.status) === status;

        const matchesTrending =
        !trending ||
        String(category.show_at_trending) ===
            trending;

        return (
        matchesSearch &&
        matchesStatus &&
        matchesTrending
        );
    });
    }, [
    categories,
    search,
    status,
    trending,
    ]);

    const showSuccess = (
      message: string,
    ) => {
      setSuccess(message);

      window.setTimeout(() => {
        setSuccess('');
      }, 3000);
    };

    const handleCreate = () => {
      setSelectedCategory(null);
      setModalOpen(true);
    };

    const handleEdit = (
      category: FreeCourseCategory,
    ) => {
      setSelectedCategory(category);
      setModalOpen(true);
    };

    const handleSubmit = async (
      data: FreeCourseCategoryPayload,
    ) => {
      try {
        setSaving(true);

        if (selectedCategory) {
          const response =
            await updateFreeCourseCategory(
              selectedCategory.id,
              data,
            );

          showSuccess(
            response.message ||
              'Category updated successfully.',
          );
        } else {
          const response =
            await createFreeCourseCategory(
              data,
            );

          showSuccess(
            response.message ||
              'Category created successfully.',
          );
        }

        setModalOpen(false);
        setSelectedCategory(null);

        await loadCategories();
      } catch (err) {
        throw err;
      } finally {
        setSaving(false);
      }
    };

    const handleDelete = async (
      category: FreeCourseCategory,
    ) => {
      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${category.name}"?`,
        );

      if (!confirmed) return;

      try {
        setError('');

        await deleteFreeCourseCategory(
          category.id,
        );

        showSuccess(
          'Category deleted successfully.',
        );

        await loadCategories();
      } catch (err: any) {
        console.error(
          'Failed to delete category:',
          err,
        );

        setError(
          err?.response?.data?.message ||
            'Failed to delete category.',
        );
      }
    };

    const handleStatusChange = async (
      category: FreeCourseCategory,
    ) => {
      try {
        setError('');

        await updateFreeCourseCategoryStatus(
          category.id,
        );

        showSuccess(
          'Category status updated successfully.',
        );

        await loadCategories();
      } catch (err: any) {
        console.error(
          'Failed to update category status:',
          err,
        );

        setError(
          err?.response?.data?.message ||
            'Failed to update category status.',
        );
      }
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FolderOpen
                size={24}
                className="text-brand"
              />

              <h1 className="text-2xl font-bold text-ink dark:text-white">
                Free Course Categories
              </h1>
            </div>

            <p className="mt-1 text-sm text-ink-soft">
              Manage categories for free courses.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>

        {/* Success */}
        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400">
            {success}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Filters */}
        <FreeCourseCategoryFilters
            search={search}
            status={status}
            trending={trending}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onTrendingChange={setTrending}
            onClear={() => {
                setSearch('');
                setStatus('');
                setTrending('');
            }}
            />

        {/* Table */}
        <FreeCourseCategoryTable
          categories={filteredCategories}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={
            handleStatusChange
          }
        />

        {/* Modal */}
        <FreeCourseCategoryFormModal
          open={modalOpen}
          category={selectedCategory}
          loading={saving}
          onClose={() => {
            if (!saving) {
              setModalOpen(false);
              setSelectedCategory(null);
            }
          }}
          onSubmit={handleSubmit}
        />
      </div>
    );
  };

export default FreeCourseCategoriesPage;
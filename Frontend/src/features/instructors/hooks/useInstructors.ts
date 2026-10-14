import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Instructor, InstructorFilterParams, InstructorKpiData, InstructorStatus, VerificationStatus } from '../types/instructor';
import { instructorApi } from '../api/instructorApi';
import { INITIAL_KPI_DATA } from '../data/mockInstructors';

export const DEFAULT_FILTERS: InstructorFilterParams = {
  searchQuery: '',
  status: 'All Status',
  verification: 'All Verification',
  course: 'All Courses',
  subject: 'All Subjects',
  teachingType: 'All Types',
  classLevel: 'All Classes',
  medium: 'All Mediums',
  joinedDateRange: '',
  lastActiveRange: '',
  sortBy: 'newest',
};

export function useInstructors() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [kpi, setKpi] = useState<InstructorKpiData>(INITIAL_KPI_DATA);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<InstructorFilterParams>(DEFAULT_FILTERS);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchInstructors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await instructorApi.getInstructors(filters);
      setInstructors(res.data);
      setTotal(res.total);
      setKpi(res.kpi);
    } catch (err) {
      console.error('Error fetching instructors:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const setFilter = useCallback((key: keyof InstructorFilterParams, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const applyAllFilters = useCallback((newFilters: InstructorFilterParams) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const paginatedInstructors = useMemo(() => {
    const start = (page - 1) * pageSize;
    return instructors.slice(start, start + pageSize);
  }, [instructors, page, pageSize]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    const currentPageIds = paginatedInstructors.map((i) => i.id);
    const allSelected = currentPageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  }, [paginatedInstructors, selectedIds]);

  const deleteInstructor = useCallback(async (id: string) => {
    await instructorApi.deleteInstructor(id);
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    fetchInstructors();
  }, [fetchInstructors]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const bulkUpdateStatus = useCallback(
    async (ids: string[], status: InstructorStatus, reason?: string) => {
      const res = await instructorApi.bulkUpdateStatus(ids, status, reason);
      await fetchInstructors();
      setSelectedIds([]);
      return res;
    },
    [fetchInstructors]
  );

  const bulkUpdateVerification = useCallback(
    async (ids: string[], verification: VerificationStatus) => {
      const res = await instructorApi.bulkUpdateVerification(ids, verification);
      await fetchInstructors();
      setSelectedIds([]);
      return res;
    },
    [fetchInstructors]
  );

  const bulkDeleteInstructors = useCallback(
    async (ids: string[]) => {
      const res = await instructorApi.bulkDeleteInstructors(ids);
      await fetchInstructors();
      setSelectedIds([]);
      return res;
    },
    [fetchInstructors]
  );

  return {
    instructors,
    paginatedInstructors,
    total,
    totalPages,
    page,
    setPage,
    pageSize,
    kpi,
    loading,
    filters,
    setFilter,
    applyAllFilters,
    resetFilters,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    deleteInstructor,
    bulkUpdateStatus,
    bulkUpdateVerification,
    bulkDeleteInstructors,
    refresh: fetchInstructors,
  };
}

export function useInstructorDetail(id: string | undefined) {
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [initialData, setInitialData] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await instructorApi.getInstructorById(id);
      if (data) {
        setInstructor(data);
        setInitialData(JSON.parse(JSON.stringify(data)));
      } else {
        setError('Instructor not found');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load instructor');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const updateField = useCallback(<K extends keyof Instructor>(key: K, value: Instructor[K]) => {
    setInstructor((prev) => (prev ? { ...prev, [key]: value } : null));
  }, []);

  const updateSocialLink = useCallback((platform: keyof Instructor['socialLinks'], value: string) => {
    setInstructor((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [platform]: value,
        },
      };
    });
  }, []);

  const resetForm = useCallback(() => {
    if (initialData) {
      setInstructor(JSON.parse(JSON.stringify(initialData)));
      setSaveSuccess(false);
    }
  }, [initialData]);

  const saveChanges = useCallback(async () => {
    if (!instructor || !id) return false;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await instructorApi.updateInstructor(id, instructor);
      setInstructor(updated);
      setInitialData(JSON.parse(JSON.stringify(updated)));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
      return false;
    } finally {
      setSaving(false);
    }
  }, [id, instructor]);

  return {
    instructor,
    loading,
    saving,
    saveSuccess,
    error,
    updateField,
    updateSocialLink,
    resetForm,
    saveChanges,
    refresh: fetchDetail,
  };
}

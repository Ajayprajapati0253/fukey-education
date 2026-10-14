import { useState, useEffect, useMemo, useCallback } from 'react';
import type { FreeCourse, FreeCourseFiltersState, FreeCourseKPIs } from '../types/free-course.types';
import { freeCoursesApi } from '../api/freeCourses.api';
import { useFreeToast as useToast } from './useFreeToast';

const DEFAULT_FILTERS: FreeCourseFiltersState = {
  search: '',
  dateRange: '',
  targetClass: 'All',
  subject: 'All',
  instructorId: 'All',
  language: 'All',
  status: 'All',
  approvalStatus: 'All',
  courseType: 'All',
  sortBy: 'newest',
  perPage: 10,
};

export const useFreeCourses = () => {
  const { success, error, info } = useToast();
  const [courses, setCourses] = useState<FreeCourse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<FreeCourseFiltersState>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Load courses
  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await freeCoursesApi.getFreeCourses();
      setCourses(data);
    } catch (err: any) {
      error('Failed to load free courses', err?.message);
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Reset page when filters change
  const handleFilterChange = (newFilters: Partial<FreeCourseFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
    info('Filters reset to default');
  };

  // Extract all unique subjects dynamically from all courses
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.primarySubject) set.add(c.primarySubject);
      if (Array.isArray(c.additionalSubjects)) {
        c.additionalSubjects.forEach((sub) => set.add(sub));
      }
    });
    return Array.from(set).sort();
  }, [courses]);

  // Extract all instructors
  const availableInstructors = useMemo(() => {
    const map = new Map<string, string>();
    courses.forEach((c) => {
      if (c.instructor) {
        map.set(c.instructor.id, c.instructor.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [courses]);

  // Scoped courses for KPIs (filters by active criteria except status, so status cards reflect the filtered scope breakdown!)
  const scopedCoursesForKpis = useMemo(() => {
    return courses.filter((course) => {
      // Search
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const titleMatch = course.title.toLowerCase().includes(query);
        const codeMatch = course.courseCode.toLowerCase().includes(query);
        const instructorMatch = course.instructor.name.toLowerCase().includes(query);
        const subjectMatch = course.primarySubject.toLowerCase().includes(query);
        const classMatch = course.targetClass.toLowerCase().includes(query);
        if (!titleMatch && !codeMatch && !instructorMatch && !subjectMatch && !classMatch) {
          return false;
        }
      }

      // Target Class
      if (filters.targetClass !== 'All' && course.targetClass !== filters.targetClass) {
        return false;
      }

      // Subject
      if (filters.subject !== 'All') {
        const hasPrimary = course.primarySubject === filters.subject;
        const hasAdditional = course.additionalSubjects?.includes(filters.subject);
        if (!hasPrimary && !hasAdditional) return false;
      }

      // Instructor
      if (filters.instructorId !== 'All' && course.instructor.id !== filters.instructorId) {
        return false;
      }

      // Language
      if (filters.language !== 'All' && course.language !== filters.language) {
        return false;
      }

      // Approval Status
      if (filters.approvalStatus !== 'All' && course.approvalStatus !== filters.approvalStatus) {
        return false;
      }

      // Course Type
      if (filters.courseType !== 'All' && course.courseType !== filters.courseType) {
        return false;
      }

      return true;
    });
  }, [
    courses,
    filters.search,
    filters.targetClass,
    filters.subject,
    filters.instructorId,
    filters.language,
    filters.approvalStatus,
    filters.courseType,
  ]);

  // Dynamic KPIs calculated from the active filter scope!
  const kpis: FreeCourseKPIs = useMemo(() => {
    return freeCoursesApi.calculateKPIs(scopedCoursesForKpis);
  }, [scopedCoursesForKpis]);

  // Active Scope Label for display
  const activeScopeLabel = useMemo(() => {
    const parts: string[] = [];
    if (filters.targetClass !== 'All') parts.push(filters.targetClass);
    if (filters.subject !== 'All') parts.push(filters.subject);
    if (filters.courseType !== 'All') parts.push(filters.courseType);
    if (filters.language !== 'All') parts.push(filters.language);
    if (filters.instructorId !== 'All') {
      const inst = availableInstructors.find((i) => i.id === filters.instructorId);
      if (inst) parts.push(inst.name);
    }
    if (filters.search.trim()) parts.push(`"${filters.search.trim()}"`);

    if (parts.length === 0) {
      return 'All Free Courses (Classes 9–12)';
    }
    return parts.join(' • ');
  }, [filters, availableInstructors]);

  const isScopeFiltered = useMemo(() => {
    return (
      filters.targetClass !== 'All' ||
      filters.subject !== 'All' ||
      filters.courseType !== 'All' ||
      filters.language !== 'All' ||
      filters.instructorId !== 'All' ||
      filters.search.trim().length > 0
    );
  }, [filters]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // Search
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const titleMatch = course.title.toLowerCase().includes(query);
        const codeMatch = course.courseCode.toLowerCase().includes(query);
        const instructorMatch = course.instructor.name.toLowerCase().includes(query);
        const subjectMatch = course.primarySubject.toLowerCase().includes(query);
        const classMatch = course.targetClass.toLowerCase().includes(query);
        if (!titleMatch && !codeMatch && !instructorMatch && !subjectMatch && !classMatch) {
          return false;
        }
      }

      // Target Class
      if (filters.targetClass !== 'All' && course.targetClass !== filters.targetClass) {
        return false;
      }

      // Subject
      if (filters.subject !== 'All') {
        const hasPrimary = course.primarySubject === filters.subject;
        const hasAdditional = course.additionalSubjects?.includes(filters.subject);
        if (!hasPrimary && !hasAdditional) return false;
      }

      // Instructor
      if (filters.instructorId !== 'All' && course.instructor.id !== filters.instructorId) {
        return false;
      }

      // Language
      if (filters.language !== 'All' && course.language !== filters.language) {
        return false;
      }

      // Status
      if (filters.status !== 'All' && course.status !== filters.status) {
        return false;
      }

      // Approval Status
      if (filters.approvalStatus !== 'All' && course.approvalStatus !== filters.approvalStatus) {
        return false;
      }

      // Course Type
      if (filters.courseType !== 'All' && course.courseType !== filters.courseType) {
        return false;
      }

      // Date Range (simple check if provided)
      if (filters.dateRange.trim()) {
        const [day, month, year] = filters.dateRange.split('-');
        if (day && month && year && !course.createdAt.includes(year)) {
          return false;
        }
      }

      return true;
    });
  }, [courses, filters]);

  // Sorted courses
  const sortedCourses = useMemo(() => {
    const list = [...filteredCourses];
    switch (filters.sortBy) {
      case 'newest':
        return list; // Preserves order
      case 'oldest':
        return list.reverse();
      case 'title_asc':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case 'title_desc':
        return list.sort((a, b) => b.title.localeCompare(a.title));
      case 'enrollments_desc':
        return list.sort((a, b) => (b.enrollmentsCount || 0) - (a.enrollmentsCount || 0));
      default:
        return list;
    }
  }, [filteredCourses, filters.sortBy]);

  // Paginated list
  const totalPages = Math.ceil(sortedCourses.length / filters.perPage) || 1;
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * filters.perPage;
    return sortedCourses.slice(start, start + filters.perPage);
  }, [sortedCourses, currentPage, filters.perPage]);

  // Bulk selection
  const isAllSelected =
    paginatedCourses.length > 0 && paginatedCourses.every((c) => selectedIds.includes(c.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedCourses.some((c) => c.id === id)));
    } else {
      const pageIds = paginatedCourses.map((c) => c.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // CRUD Actions
  const handleCreateCourse = async (courseData: any) => {
    try {
      const created = await freeCoursesApi.createFreeCourse(courseData);
      setCourses((prev) => [created, ...prev]);
      success('Free Course Created', `"${created.title}" has been successfully added.`);
      return created;
    } catch (err: any) {
      error('Create Failed', err?.message);
      throw err;
    }
  };

  const handleUpdateCourse = async (id: string, updates: Partial<FreeCourse>) => {
    try {
      const updated = await freeCoursesApi.updateFreeCourse(id, updates);
      setCourses((prev) => prev.map((c) => (c.id === id ? updated : c)));
      success('Course Updated', `Changes for "${updated.title}" were saved.`);
      return updated;
    } catch (err: any) {
      error('Update Failed', err?.message);
      throw err;
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      const course = courses.find((c) => c.id === id);
      await freeCoursesApi.deleteFreeCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      success('Free Course Deleted', `"${course?.title || id}" was permanently removed.`);
    } catch (err: any) {
      error('Delete Failed', err?.message);
    }
  };

  const handleDuplicateCourse = async (id: string) => {
    try {
      const duplicate = await freeCoursesApi.duplicateFreeCourse(id);
      setCourses((prev) => [duplicate, ...prev]);
      success('Course Duplicated', `Created "${duplicate.title}" in Draft mode.`);
    } catch (err: any) {
      error('Duplicate Failed', err?.message);
    }
  };

  const handleTogglePublish = async (id: string) => {
    const course = courses.find((c) => c.id === id);
    if (!course) return;
    try {
      if (course.status === 'Published') {
        const updated = await freeCoursesApi.unpublishFreeCourse(id);
        setCourses((prev) => prev.map((c) => (c.id === id ? updated : c)));
        info('Course Unpublished', `"${course.title}" moved to Draft.`);
      } else {
        const updated = await freeCoursesApi.publishFreeCourse(id);
        setCourses((prev) => prev.map((c) => (c.id === id ? updated : c)));
        success('Course Published', `"${course.title}" is now Live & Free for students.`);
      }
    } catch (err: any) {
      error('Status Update Failed', err?.message);
    }
  };

  const handleArchiveCourse = async (id: string) => {
    const course = courses.find((c) => c.id === id);
    if (!course) return;
    try {
      const updated = await freeCoursesApi.archiveFreeCourse(id);
      setCourses((prev) => prev.map((c) => (c.id === id ? updated : c)));
      info('Course Archived', `"${course.title}" moved to Archived.`);
    } catch (err: any) {
      error('Archive Failed', err?.message);
    }
  };

  const handleRestoreCourse = async (id: string) => {
    const course = courses.find((c) => c.id === id);
    if (!course) return;
    try {
      const updated = await freeCoursesApi.restoreFreeCourse(id);
      setCourses((prev) => prev.map((c) => (c.id === id ? updated : c)));
      success('Course Restored', `"${course.title}" restored to Published.`);
    } catch (err: any) {
      error('Restore Failed', err?.message);
    }
  };

  // Bulk operations
  const handleBulkPublish = async () => {
    if (!selectedIds.length) return;
    await freeCoursesApi.bulkUpdateStatus(selectedIds, 'Published');
    setCourses((prev) =>
      prev.map((c) => (selectedIds.includes(c.id) ? { ...c, status: 'Published' } : c))
    );
    success('Bulk Published', `${selectedIds.length} courses published.`);
    setSelectedIds([]);
  };

  const handleBulkUnpublish = async () => {
    if (!selectedIds.length) return;
    await freeCoursesApi.bulkUpdateStatus(selectedIds, 'Draft');
    setCourses((prev) =>
      prev.map((c) => (selectedIds.includes(c.id) ? { ...c, status: 'Draft' } : c))
    );
    info('Bulk Unpublished', `${selectedIds.length} courses moved to Draft.`);
    setSelectedIds([]);
  };

  const handleBulkArchive = async () => {
    if (!selectedIds.length) return;
    await freeCoursesApi.bulkUpdateStatus(selectedIds, 'Archived');
    setCourses((prev) =>
      prev.map((c) => (selectedIds.includes(c.id) ? { ...c, status: 'Archived' } : c))
    );
    info('Bulk Archived', `${selectedIds.length} courses archived.`);
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    await freeCoursesApi.bulkDeleteFreeCourses(selectedIds);
    setCourses((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
    success('Bulk Deleted', `${selectedIds.length} courses deleted.`);
    setSelectedIds([]);
  };

  // Export current filtered dataset to CSV
  const handleExportCSV = () => {
    if (!sortedCourses.length) {
      info('No courses available to export');
      return;
    }

    const headers = ['Course ID', 'Course Code', 'Title', 'Class', 'Subject', 'Instructor', 'Enrollments', 'Price', 'Status', 'Created Date'];
    const rows = sortedCourses.map((c) => [
      c.id,
      c.courseCode,
      `"${c.title.replace(/"/g, '""')}"`,
      c.targetClass,
      c.primarySubject,
      `"${c.instructor.name.replace(/"/g, '""')}"`,
      c.enrollmentsCount,
      'FREE (₹0)',
      c.status,
      `"${c.createdAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fukey_Free_Courses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    success('Export Successful', `Exported ${sortedCourses.length} free courses to CSV.`);
  };

  return {
    courses,
    paginatedCourses,
    sortedCourses,
    totalCount: sortedCourses.length,
    isLoading,
    filters,
    handleFilterChange,
    resetFilters,
    availableSubjects,
    availableInstructors,
    kpis,
    activeScopeLabel,
    isScopeFiltered,
    currentPage,
    setCurrentPage,
    totalPages,
    selectedIds,
    clearSelection,
    isAllSelected,
    toggleSelectAll,
    toggleSelectOne,
    handleCreateCourse,
    handleUpdateCourse,
    handleDeleteCourse,
    handleDuplicateCourse,
    handleTogglePublish,
    handleArchiveCourse,
    handleRestoreCourse,
    handleBulkPublish,
    handleBulkUnpublish,
    handleBulkArchive,
    handleBulkDelete,
    handleExportCSV,
    loadCourses,
  };
};

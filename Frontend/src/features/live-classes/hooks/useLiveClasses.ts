import { useMemo, useState } from 'react';
import type { ClassStatus, FilterState, LiveClass } from '../types/live-class.types';
import { INITIAL_CLASSES } from '../data/InitialLiveClasses';

const DEFAULT_FILTERS: FilterState = {
  search: '',
  dateRange: '',
  platform: 'All Platforms',
  instructor: 'All Instructors',
  status: 'All Status',
  category: 'All Categories',
  course: 'All Courses',
  orderBy: 'newest',
};

const PAGE_SIZE = 10;

export const useLiveClasses = () => {
  const [classes, setClasses] = useState<LiveClass[]>(INITIAL_CLASSES);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  const onFilterChange = (partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  // Used by the KPI cards so clicking a card filters the table by that status
  const filterByStatus = (status: string) => {
    onFilterChange({ status: filters.status === status ? 'All Status' : status });
  };

  const filteredClasses = useMemo(() => {
    let result = [...classes];

    const query = filters.search.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.instructor.name.toLowerCase().includes(query)
      );
    }

    if (filters.platform && filters.platform !== 'All Platforms') {
      result = result.filter((c) => c.platform === filters.platform);
    }

    if (filters.instructor && filters.instructor !== 'All Instructors') {
      result = result.filter((c) => c.instructor.name === filters.instructor);
    }

    if (filters.status && filters.status !== 'All Status') {
      result = result.filter((c) => c.status === filters.status);
    }

    if (filters.category && filters.category !== 'All Categories') {
      result = result.filter((c) => c.category === filters.category);
    }

    if (filters.course && filters.course !== 'All Courses') {
      result = result.filter((c) => c.course === filters.course);
    }

    switch (filters.orderBy) {
      case 'oldest':
        result.sort(
          (a, b) => new Date(a.isoDateTime).getTime() - new Date(b.isoDateTime).getTime()
        );
        break;
      case 'students_desc':
        result.sort((a, b) => b.students - a.students);
        break;
      case 'duration_desc':
        result.sort((a, b) => b.duration - a.duration);
        break;
      case 'newest':
      default:
        result.sort(
          (a, b) => new Date(b.isoDateTime).getTime() - new Date(a.isoDateTime).getTime()
        );
        break;
    }

    return result;
  }, [classes, filters]);

  const totalResults = filteredClasses.length;

  const paginatedClasses = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredClasses.slice(start, start + PAGE_SIZE);
  }, [filteredClasses, currentPage]);

  const kpiCounts = useMemo(
    () => ({
      total: classes.length,
      live: classes.filter((c) => c.status === 'Live').length,
      upcoming: classes.filter((c) => c.status === 'Upcoming').length,
      completed: classes.filter((c) => c.status === 'Completed').length,
      cancelled: classes.filter((c) => c.status === 'Cancelled').length,
    }),
    [classes]
  );

  const addClass = (newClass: Omit<LiveClass, 'id' | 'index'>) => {
    setClasses((prev) => {
      const created: LiveClass = {
        ...newClass,
        id: `lc-${Date.now()}`,
        index: prev.length + 1,
      };
      return [created, ...prev];
    });
  };

  const updateClass = (updated: LiveClass) => {
    setClasses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  const changeStatus = (id: string, newStatus: ClassStatus) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
  };

  return {
    classes,
    filteredClasses,
    paginatedClasses,
    totalResults,
    filters,
    onFilterChange,
    resetFilters,
    filterByStatus,
    currentPage,
    setCurrentPage,
    pageSize: PAGE_SIZE,
    kpiCounts,
    addClass,
    updateClass,
    deleteClass,
    changeStatus,
  };
};

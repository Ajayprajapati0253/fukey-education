import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  ClassStatus,
  FilterState,
  LiveClass,
} from '../types/live-class.types';

import {
  createLiveClass,
  deleteLiveClass,
  getLiveClasses,
  getLiveClassesKPI,
  updateLiveClass,
  type CreateLiveClassPayload,
  type LiveClassesKPI,
  type UpdateLiveClassPayload,
} from '../api/live-class.api';

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

const parseLocalDateTime = (value: string) => {
  if (!value) {
    return NaN;
  }

  const normalized = value
    .replace('T', ' ')
    .replace(/\.\d+$/, '');

  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/,
  );

  if (!match) {
    const date = new Date(value);
    return date.getTime();
  }

  const [, year, month, day, hour, minute, second = '0'] = match;

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  ).getTime();
};

const getDisplayStatus = (
  status: boolean,
  startTime: string,
  duration: number,
): ClassStatus => {
  if (!status) {
    return 'Cancelled';
  }

  const start = parseLocalDateTime(startTime);
  const end = start + duration * 60 * 1000;
  const now = Date.now();

  if (now < start) {
    return 'Upcoming';
  }

  if (now < end) {
    return 'Live';
  }

  return 'Completed';
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return '';
  }

  const timestamp = parseLocalDateTime(value);

  if (Number.isNaN(timestamp)) {
    return value;
  }

  const date = new Date(timestamp);

  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const mapApiLiveClassToFrontend = (
  item: any,
  index: number,
): LiveClass => {
  const startTime = item.start_time ?? '';

  const status = getDisplayStatus(
    Boolean(item.status),
    startTime,
    Number(item.duration ?? 0),
  );

  const platform =
    item.platform === 'youtube'
      ? 'YouTube'
      : 'Jitsi';

  return {
    id: String(item.id),
    index,

    title: item.title ?? '',

    category:
      item.category_name
      ?? item.category
      ?? '',

    instructor: {
      id: String(item.instructor_id ?? ''),
      name:
        item.instructor_name
        ?? `Instructor #${item.instructor_id ?? ''}`,
      avatar: item.instructor_avatar ?? '',
      specialty: item.instructor_specialty ?? '',
      email: item.instructor_email ?? '',
    },

    course:
      item.course_name
      ?? item.free_course_name
      ?? (
        item.course_id
          ? `Course #${item.course_id}`
          : item.free_course_id
            ? `Free Course #${item.free_course_id}`
            : ''
      ),

    platform,

    meetingUrl: item.meeting_url ?? '',

    startTime: formatDateTime(startTime),

    isoDateTime: startTime,

    duration: Number(item.duration ?? 0),

    status,

    students: Number(item.students ?? 0),

    thumbnail:
      item.thumbnail
      ?? item.thumbnail_url
      ?? '',

    recurring: item.is_recurring
      ? {
          isRecurring: true,
          frequency: 'custom',
          days: item.recurring_days ?? [],
          startDate: startTime,
          endDate: item.end_date ?? '',
        }
      : undefined,

    description: item.description ?? '',

    recordingUrl:
      item.recording_url
      ?? item.recordingUrl
      ?? undefined,

    maxCapacity:
      item.max_capacity
      ?? undefined,

    materialsUrl:
      item.materials_url
      ?? undefined,

    chatMessages:
      item.chat_messages
      ?? undefined,
  };
};

export const useLiveClasses = () => {
  const [classes, setClasses] =
    useState<LiveClass[]>([]);

  const [filters, setFilters] =
    useState<FilterState>(DEFAULT_FILTERS);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [kpiCounts, setKpiCounts] =
    useState<LiveClassesKPI>({
      total: 0,
      live: 0,
      upcoming: 0,
      completed: 0,
      cancelled: 0,
    });

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        classesResponse,
        kpiResponse,
      ] = await Promise.all([
        getLiveClasses(),
        getLiveClassesKPI(),
      ]);

      const mapped = classesResponse.map(
        (item, index) =>
          mapApiLiveClassToFrontend(
            item,
            index + 1,
          ),
      );

      setClasses(mapped);

      setKpiCounts(kpiResponse);
    } catch (err) {
      console.error(
        'Failed to load live classes:',
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load live classes.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const onFilterChange = (
    partial: Partial<FilterState>,
  ) => {
    setFilters((prev) => ({
      ...prev,
      ...partial,
    }));

    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  const filterByStatus = (status: string) => {
    onFilterChange({
      status:
        filters.status === status
          ? 'All Status'
          : status,
    });
  };

  const filteredClasses = useMemo(() => {
    let result = [...classes];

    const query =
      filters.search.trim().toLowerCase();

    if (query) {
      result = result.filter(
        (c) =>
          c.title
            .toLowerCase()
            .includes(query) ||
          c.instructor.name
            .toLowerCase()
            .includes(query),
      );
    }

    if (
      filters.platform &&
      filters.platform !== 'All Platforms'
    ) {
      result = result.filter(
        (c) =>
          c.platform ===
          filters.platform,
      );
    }

    if (
      filters.instructor &&
      filters.instructor !== 'All Instructors'
    ) {
      result = result.filter(
        (c) =>
          c.instructor.name ===
          filters.instructor,
      );
    }

    if (
      filters.status &&
      filters.status !== 'All Status'
    ) {
      result = result.filter(
        (c) =>
          c.status ===
          filters.status,
      );
    }

    if (
      filters.category &&
      filters.category !== 'All Categories'
    ) {
      result = result.filter(
        (c) =>
          c.category ===
          filters.category,
      );
    }

    if (
      filters.course &&
      filters.course !== 'All Courses'
    ) {
      result = result.filter(
        (c) =>
          c.course ===
          filters.course,
      );
    }

    switch (filters.orderBy) {
      case 'oldest':
        result.sort(
          (a, b) =>
            parseLocalDateTime(a.isoDateTime) -
            parseLocalDateTime(b.isoDateTime),
        );
        break;

      case 'students_desc':
        result.sort(
          (a, b) =>
            b.students -
            a.students,
        );
        break;

      case 'duration_desc':
        result.sort(
          (a, b) =>
            b.duration -
            a.duration,
        );
        break;

      case 'newest':
      default:
        result.sort(
          (a, b) =>
            parseLocalDateTime(b.isoDateTime) -
            parseLocalDateTime(a.isoDateTime),
        );
        break;
    }

    return result;
  }, [classes, filters]);

  const totalResults =
    filteredClasses.length;

  const paginatedClasses = useMemo(() => {
    const start =
      (currentPage - 1) *
      PAGE_SIZE;

    return filteredClasses.slice(
      start,
      start + PAGE_SIZE,
    );
  }, [
    filteredClasses,
    currentPage,
  ]);

  const addClass = async (
    payload: CreateLiveClassPayload,
  ) => {
    await createLiveClass(payload);

    await loadClasses();

    setCurrentPage(1);
  };

  const updateClass = async (
    updatedClass: LiveClass,
  ) => {
    const payload: UpdateLiveClassPayload = {
      title: updatedClass.title,

      instructor: Number(
        updatedClass.instructor.id,
      ),

      start_time:
        updatedClass.isoDateTime,

      duration:
        Number(
          updatedClass.duration,
        ),

      description:
        updatedClass.description
        || undefined,

      status:
        updatedClass.status !==
        'Cancelled',
    };

    await updateLiveClass(
      updatedClass.id,
      payload,
    );

    await loadClasses();
  };

  const deleteClass = async (
    id: string,
  ) => {
    await deleteLiveClass(id);

    await loadClasses();

    if (
      paginatedClasses.length === 1 &&
      currentPage > 1
    ) {
      setCurrentPage((page) =>
        Math.max(1, page - 1),
      );
    }
  };

  const changeStatus = async (
    id: string,
    newStatus: ClassStatus,
  ) => {
    const existing =
      classes.find(
        (c) => c.id === id,
      );

    if (!existing) {
      return;
    }

    const payload: UpdateLiveClassPayload = {
      title: existing.title,

      instructor: Number(
        existing.instructor.id,
      ),

      start_time:
        existing.isoDateTime,

      duration:
        Number(existing.duration),

      description:
        existing.description
        || undefined,

      status:
        newStatus !== 'Cancelled',
    };

    await updateLiveClass(
      id,
      payload,
    );

    await loadClasses();
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

    loading,

    error,

    refresh: loadClasses,
  };
};
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

/* =========================================================
   DATE HELPERS
========================================================= */

const parseLocalDateTime = (value: string) => {
  if (!value) {
    return NaN;
  }

  const normalized = value
    .replace('T', ' ')
    .replace(/\.\d+Z?$/, '')
    .replace(/Z$/, '');

  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/,
  );

  if (!match) {
    const date = new Date(value);
    return date.getTime();
  }

  const [
    ,
    year,
    month,
    day,
    hour,
    minute,
    second = '0',
  ] = match;

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  ).getTime();
};

/*
 * Converts recurring_time returned by Prisma.
 *
 * Backend may return:
 *
 * 16:00:00
 *
 * OR:
 *
 * 1970-01-01T16:00:00.000Z
 */
const parseRecurringTime = (
  value?: string | null,
) => {
  if (!value) {
    return null;
  }

  const timeMatch = value.match(
    /T?(\d{2}):(\d{2})(?::(\d{2}))?/,
  );

  if (timeMatch) {
    return {
      hour: Number(timeMatch[1]),
      minute: Number(timeMatch[2]),
      second: Number(timeMatch[3] ?? 0),
    };
  }

  const simpleMatch = value.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?/,
  );

  if (simpleMatch) {
    return {
      hour: Number(simpleMatch[1]),
      minute: Number(simpleMatch[2]),
      second: Number(simpleMatch[3] ?? 0),
    };
  }

  return null;
};

/* =========================================================
   DAY HELPERS
========================================================= */

const DAY_INDEX: Record<string, number> = {
  sunday: 0,
  sun: 0,

  monday: 1,
  mon: 1,

  tuesday: 2,
  tue: 2,
  tues: 2,

  wednesday: 3,
  wed: 3,

  thursday: 4,
  thu: 4,
  thurs: 4,

  friday: 5,
  fri: 5,

  saturday: 6,
  sat: 6,
};

const getRecurringDayNumbers = (
  days: string[],
): number[] => {
  return days
    .map(
      (day) =>
        DAY_INDEX[
          String(day)
            .trim()
            .toLowerCase()
        ],
    )
    .filter(
      (day): day is number =>
        typeof day === 'number',
    );
};

/* =========================================================
   END DATE
========================================================= */

const getEndOfDay = (
  value: string,
): number => {
  const timestamp = parseLocalDateTime(value);

  if (Number.isNaN(timestamp)) {
    return NaN;
  }

  const date = new Date(timestamp);

  date.setHours(
    23,
    59,
    59,
    999,
  );

  return date.getTime();
};

/* =========================================================
   NEXT RECURRING OCCURRENCE
========================================================= */

const getNextRecurringOccurrence = (
  startTime: string,
  recurringDays: string[],
  recurringTime?: string | null,
  endDate?: string | null,
): number | null => {
  const originalStart =
    parseLocalDateTime(startTime);

  if (Number.isNaN(originalStart)) {
    return null;
  }

  const validDays =
    getRecurringDayNumbers(
      recurringDays,
    );

  if (!validDays.length) {
    return null;
  }

  const parsedTime =
    parseRecurringTime(recurringTime);

  const originalDate =
    new Date(originalStart);

  const hour =
    parsedTime?.hour ??
    originalDate.getHours();

  const minute =
    parsedTime?.minute ??
    originalDate.getMinutes();

  const second =
    parsedTime?.second ??
    originalDate.getSeconds();

  const recurrenceEnd = endDate
    ? getEndOfDay(endDate)
    : null;

  /*
   * Check the next 14 days.
   *
   * This is enough because the maximum gap
   * between weekly recurrence days is 7 days.
   */
  for (
    let offset = 0;
    offset <= 14;
    offset++
  ) {
    const occurrence =
      new Date();

    occurrence.setHours(
      0,
      0,
      0,
      0,
    );

    occurrence.setDate(
      occurrence.getDate() + offset,
    );

    if (
      !validDays.includes(
        occurrence.getDay(),
      )
    ) {
      continue;
    }

    occurrence.setHours(
      hour,
      minute,
      second,
      0,
    );

    const occurrenceTime =
      occurrence.getTime();

    /*
     * Don't create occurrences before
     * the original start date.
     */
    if (
      occurrenceTime <
      originalStart
    ) {
      continue;
    }

    /*
     * Don't create occurrences after
     * recurrence end date.
     */
    if (
      recurrenceEnd !== null &&
      occurrenceTime >
        recurrenceEnd
    ) {
      continue;
    }

    return occurrenceTime;
  }

  return null;
};

/* =========================================================
   DISPLAY STATUS
========================================================= */

const getDisplayStatus = (
  status: boolean,
  startTime: string,
  duration: number,
  isRecurring = false,
  recurringDays: string[] = [],
  recurringTime?: string | null,
  endDate?: string | null,
): ClassStatus => {
  /*
   * Database status=false means cancelled.
   */
  if (!status) {
    return 'Cancelled';
  }

  const now = Date.now();

  /*
   * =====================================================
   * RECURRING CLASS
   * =====================================================
   */
  if (isRecurring) {
    const originalStart =
      parseLocalDateTime(startTime);

    if (
      Number.isNaN(originalStart)
    ) {
      return 'Completed';
    }

    /*
     * If recurrence has expired,
     * the class is completed.
     */
    // if (endDate) {
    //   const recurrenceEnd =
    //     getEndOfDay(endDate);

    //   if (
    //     !Number.isNaN(recurrenceEnd) &&
    //     now > recurrenceEnd
    //   ) {
    //     return 'Completed';
    //   }
    // }

    const validDays =
      getRecurringDayNumbers(
        recurringDays,
      );

    /*
     * If recurring days are invalid,
     * fallback to normal class logic.
     */
    if (!validDays.length) {
      const end =
        originalStart +
        duration * 60 * 1000;

      if (now < originalStart) {
        return 'Upcoming';
      }

      if (now < end) {
        return 'Live';
      }

      return 'Completed';
    }

    const parsedTime =
      parseRecurringTime(
        recurringTime,
      );

    const originalDate =
      new Date(originalStart);

    const hour =
      parsedTime?.hour ??
      originalDate.getHours();

    const minute =
      parsedTime?.minute ??
      originalDate.getMinutes();

    const second =
      parsedTime?.second ??
      originalDate.getSeconds();

    /*
     * Check today's and next 14 days'
     * occurrences.
     */
    for (
      let offset = 0;
      offset <= 14;
      offset++
    ) {
      const occurrence =
        new Date();

      occurrence.setHours(
        0,
        0,
        0,
        0,
      );

      occurrence.setDate(
        occurrence.getDate() +
          offset,
      );

      if (
        !validDays.includes(
          occurrence.getDay(),
        )
      ) {
        continue;
      }

      occurrence.setHours(
        hour,
        minute,
        second,
        0,
      );

      const occurrenceStart =
        occurrence.getTime();

      /*
       * Before original start date
       */
      if (
        occurrenceStart <
        originalStart
      ) {
        continue;
      }

      /*
       * After recurrence end date
       */
      // if (endDate) {
      //   const recurrenceEnd =
      //     getEndOfDay(endDate);

      //   if (
      //     !Number.isNaN(
      //       recurrenceEnd,
      //     ) &&
      //     occurrenceStart >
      //       recurrenceEnd
      //   ) {
      //     continue;
      //   }
      // }

      const occurrenceEnd =
        occurrenceStart +
        duration * 60 * 1000;

      /*
       * Current occurrence is running.
       */
      if (
        now >= occurrenceStart &&
        now < occurrenceEnd
      ) {
        return 'Live';
      }

      /*
       * Next occurrence is upcoming.
       */
      if (
        now < occurrenceStart
      ) {
        return 'Upcoming';
      }
    }

    /*
     * No future occurrence remains.
     */
    return 'Completed';
  }

  /*
   * =====================================================
   * NORMAL ONE-TIME CLASS
   * =====================================================
   */

  const start =
    parseLocalDateTime(startTime);

  if (Number.isNaN(start)) {
    return 'Completed';
  }

  const end =
    start +
    duration * 60 * 1000;

  if (now < start) {
    return 'Upcoming';
  }

  if (now < end) {
    return 'Live';
  }

  return 'Completed';
};

/* =========================================================
   DISPLAY DATE
========================================================= */

const formatDateTime = (
  value?: string | null,
) => {
  if (!value) {
    return '';
  }

  const timestamp =
    parseLocalDateTime(value);

  if (Number.isNaN(timestamp)) {
    return value;
  }

  const date =
    new Date(timestamp);

  return date.toLocaleString(
    'en-US',
    {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
  );
};

/* =========================================================
   MAP API → FRONTEND
========================================================= */

const mapApiLiveClassToFrontend = (
  item: any,
  index: number,
): LiveClass => {
  const startTime =
    item.start_time ?? '';

  const isRecurring =
    Boolean(item.is_recurring);

  const recurringDays =
    Array.isArray(
      item.recurring_days,
    )
      ? item.recurring_days
      : [];

  const recurringTime =
    item.recurring_time ?? null;

  const endDate =
    item.end_date ?? null;

  /*
   * Calculate display status using
   * recurring information.
   */
  const status =
    getDisplayStatus(
      Boolean(item.status),
      startTime,
      Number(item.duration ?? 0),
      isRecurring,
      recurringDays,
      recurringTime,
      endDate,
    );

  /*
   * For recurring classes, use the NEXT
   * occurrence as the display date/time.
   *
   * This is important because original
   * start_time may already be in the past.
   */
  let displayDateTime =
    startTime;

  if (isRecurring) {
    const nextOccurrence =
      getNextRecurringOccurrence(
        startTime,
        recurringDays,
        recurringTime,
        endDate,
      );

    if (nextOccurrence !== null) {
      displayDateTime =
        new Date(
          nextOccurrence,
        ).toISOString();
    }
  }

  const platform =
    item.platform === 'youtube'
      ? 'YouTube'
      : 'Jitsi';

  return {
    id: String(item.id),

    index,

    title:
      item.title ?? '',

    category:
      item.category_name ??
      item.category ??
      '',

    instructor: {
      id: String(
        item.instructor_id ?? '',
      ),

      name:
        item.instructor_name ??
        `Instructor #${
          item.instructor_id ?? ''
        }`,

      avatar:
        item.instructor_avatar ??
        '',

      specialty:
        item.instructor_specialty ??
        '',

      email:
        item.instructor_email ??
        '',
    },

    course:
      item.course_name ??
      item.free_course_name ??
      (
        item.course_id
          ? `Course #${item.course_id}`
          : item.free_course_id
            ? `Free Course #${item.free_course_id}`
            : ''
      ),

    platform,

    meetingUrl:
      item.meeting_url ?? '',

    /*
     * For recurring classes this now
     * displays the next occurrence.
     */
    startTime:
      formatDateTime(
        displayDateTime,
      ),

    /*
     * Keep the calculated occurrence
     * for sorting/editing.
     */
    isoDateTime:
      displayDateTime,

    duration:
      Number(
        item.duration ?? 0,
      ),

    status,

    students:
      Number(
        item.students ?? 0,
      ),

    thumbnail:
      item.thumbnail ??
      item.thumbnail_url ??
      '',

    recurring:
      isRecurring
        ? {
            isRecurring: true,

            frequency: 'custom',

            days: recurringDays,

            startDate:
              startTime,

            endDate:
              endDate ?? '',
          }
        : undefined,

    description:
      item.description ?? '',

    recordingUrl:
      item.recording_url ??
      item.recordingUrl ??
      undefined,

    maxCapacity:
      item.max_capacity ??
      undefined,

    materialsUrl:
      item.materials_url ??
      undefined,

    chatMessages:
      item.chat_messages ??
      undefined,
  };
};

/* =========================================================
   SORT TIMESTAMP
========================================================= */

const getSortTimestamp = (
  liveClass: LiveClass,
) => {
  return parseLocalDateTime(
    liveClass.isoDateTime,
  );
};

/* =========================================================
   HOOK
========================================================= */

export const useLiveClasses = () => {
  const [classes, setClasses] =
    useState<LiveClass[]>([]);

  const [filters, setFilters] =
    useState<FilterState>(
      DEFAULT_FILTERS,
    );

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

  /* =====================================================
     LOAD
  ===================================================== */

  const loadClasses =
    useCallback(async () => {
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

        const mapped =
          classesResponse.map(
            (item, index) =>
              mapApiLiveClassToFrontend(
                item,
                index + 1,
              ),
          );

        setClasses(mapped);

        setKpiCounts(
          kpiResponse,
        );
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

  /* =====================================================
     FILTERS
  ===================================================== */

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
    setFilters(
      DEFAULT_FILTERS,
    );

    setCurrentPage(1);
  };

  const filterByStatus = (
    status: string,
  ) => {
    onFilterChange({
      status:
        filters.status === status
          ? 'All Status'
          : status,
    });
  };

  /* =====================================================
     FILTER + SORT
  ===================================================== */

  const filteredClasses =
    useMemo(() => {
      let result = [
        ...classes,
      ];

      const query =
        filters.search
          .trim()
          .toLowerCase();

      if (query) {
        result =
          result.filter(
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
        filters.platform !==
          'All Platforms'
      ) {
        result =
          result.filter(
            (c) =>
              c.platform ===
              filters.platform,
          );
      }

      if (
        filters.instructor &&
        filters.instructor !==
          'All Instructors'
      ) {
        result =
          result.filter(
            (c) =>
              c.instructor.name ===
              filters.instructor,
          );
      }

      if (
        filters.status &&
        filters.status !==
          'All Status'
      ) {
        result =
          result.filter(
            (c) =>
              c.status ===
              filters.status,
          );
      }

      if (
        filters.category &&
        filters.category !==
          'All Categories'
      ) {
        result =
          result.filter(
            (c) =>
              c.category ===
              filters.category,
          );
      }

      if (
        filters.course &&
        filters.course !==
          'All Courses'
      ) {
        result =
          result.filter(
            (c) =>
              c.course ===
              filters.course,
          );
      }

      /* =================================================
         SORT
      ================================================= */

      switch (filters.orderBy) {
        case 'oldest':
          result.sort(
            (a, b) =>
              getSortTimestamp(a) -
              getSortTimestamp(b),
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
              getSortTimestamp(b) -
              getSortTimestamp(a),
          );
          break;
      }

      return result;
    }, [
      classes,
      filters,
    ]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalResults =
    filteredClasses.length;

  const paginatedClasses =
    useMemo(() => {
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

  /* =====================================================
     CREATE
  ===================================================== */

  const addClass = async (
    payload: CreateLiveClassPayload,
  ) => {
    await createLiveClass(
      payload,
    );

    await loadClasses();

    setCurrentPage(1);
  };

  /* =====================================================
     UPDATE
  ===================================================== */

  const updateClass = async (
    updatedClass: LiveClass,
  ) => {
    const payload:
      UpdateLiveClassPayload = {
      title:
        updatedClass.title,

      instructor:
        Number(
          updatedClass
            .instructor.id,
        ),

      start_time:
        updatedClass
          .isoDateTime,

      duration:
        Number(
          updatedClass.duration,
        ),

      description:
        updatedClass.description ||
        undefined,

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

  /* =====================================================
     DELETE
  ===================================================== */

  const deleteClass = async (
    id: string,
  ) => {
    await deleteLiveClass(
      id,
    );

    await loadClasses();

    if (
      paginatedClasses.length ===
        1 &&
      currentPage > 1
    ) {
      setCurrentPage(
        (page) =>
          Math.max(
            1,
            page - 1,
          ),
      );
    }
  };

  /* =====================================================
     STATUS CHANGE
  ===================================================== */

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

    const payload:
      UpdateLiveClassPayload = {
      title:
        existing.title,

      instructor:
        Number(
          existing
            .instructor.id,
        ),

      start_time:
        existing.isoDateTime,

      duration:
        Number(
          existing.duration,
        ),

      description:
        existing.description ||
        undefined,

      status:
        newStatus !==
        'Cancelled',
    };

    await updateLiveClass(
      id,
      payload,
    );

    await loadClasses();
  };

  /* =====================================================
     RETURN
  ===================================================== */

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

    pageSize:
      PAGE_SIZE,

    kpiCounts,

    addClass,

    updateClass,

    deleteClass,

    changeStatus,

    loading,

    error,

    refresh:
      loadClasses,
  };
};
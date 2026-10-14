import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  CalendarLiveClass,
  CalendarLiveClassesFilterState,
  CalendarViewMode,
  CalendarWeeklyKPISummary,
  CalendarReminderLog,
  CalendarParticipant,
} from '../types/calendar-live-class.types';

import {
  fetchLiveClasses,
  createLiveClassApi,
  updateLiveClassApi,
  deleteLiveClassApi,
  triggerClassRemindersApi,
  fetchReminderLogs,
  resetToInitialClasses,
  exportLiveClassesData,
} from '../api/calendarViews.api';

/* =========================================================
 * DATE HELPERS
 * ======================================================= */

const formatLocalDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${y}-${m}-${day}`;
};

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

const getCurrentMonthRange = () => {
  const now = new Date();

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  );

  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  );

  return {
    start: formatLocalDate(start),
    end: formatLocalDate(end),
  };
};

/* =========================================================
 * TIME PARSING
 * ======================================================= */

const parseTime = (
  value?: string | null,
): { hours: number; minutes: number; seconds: number } | null => {
  if (!value) {
    return null;
  }

  const raw = value.trim();

  /*
   * 24-hour:
   * 18:30
   * 18:30:00
   */
  const twentyFourHour = raw.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (twentyFourHour) {
    return {
      hours: Number(twentyFourHour[1]),
      minutes: Number(twentyFourHour[2]),
      seconds: Number(twentyFourHour[3] ?? 0),
    };
  }

  /*
   * 12-hour:
   * 6:30 PM
   * 06:30 PM
   */
  const twelveHour = raw.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i,
  );

  if (twelveHour) {
    let hours = Number(twelveHour[1]);
    const minutes = Number(twelveHour[2]);
    const seconds = Number(twelveHour[3] ?? 0);
    const meridiem = twelveHour[4].toUpperCase();

    if (meridiem === 'AM' && hours === 12) {
      hours = 0;
    }

    if (meridiem === 'PM' && hours !== 12) {
      hours += 12;
    }

    return {
      hours,
      minutes,
      seconds,
    };
  }

  return null;
};

const getTimeFromClass = (
  item: CalendarLiveClass,
): { hours: number; minutes: number; seconds: number } | null => {
  /*
   * Prefer startTime because calendar records normally contain
   * the actual recurring time there.
   */
  const parsed = parseTime(item.startTime);

  if (parsed) {
    return parsed;
  }

  /*
   * Fallback to formattedDateTime if startTime is not HH:mm.
   */
  const date = new Date(`${item.date}T${item.startTime}`);

  if (!Number.isNaN(date.getTime())) {
    return {
      hours: date.getHours(),
      minutes: date.getMinutes(),
      seconds: date.getSeconds(),
    };
  }

  return null;
};

/* =========================================================
 * OCCURRENCE STATUS
 * ======================================================= */

type CalendarStatus =
  | 'scheduled'
  | 'live'
  | 'completed'
  | 'cancelled';

const getOccurrenceStatus = (
  item: CalendarLiveClass,
  occurrenceDate: string,
  now: Date,
): CalendarStatus => {
  /*
   * status=false / cancelled must always remain cancelled.
   */
  if (item.status === 'cancelled') {
    return 'cancelled';
  }

  const time = getTimeFromClass(item);

  if (!time) {
    return item.status;
  }

  const [year, month, day] = occurrenceDate
    .split('-')
    .map(Number);

  const start = new Date(
    year,
    month - 1,
    day,
    time.hours,
    time.minutes,
    time.seconds,
    0,
  );

  const end = new Date(
    start.getTime() +
      Number(item.duration ?? 0) * 60 * 1000,
  );

  if (now < start) {
    return 'scheduled';
  }

  if (now >= start && now < end) {
    return 'live';
  }

  return 'completed';
};

/* =========================================================
 * FORMATTING
 * ======================================================= */

const formatTimeForDisplay = (
  hours: number,
  minutes: number,
): string => {
  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const formatOccurrenceDateTime = (
  dateString: string,
  item: CalendarLiveClass,
): string => {
  const time = getTimeFromClass(item);

  if (!time) {
    return item.startTime;
  }

  const [year, month, day] = dateString
    .split('-')
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
    time.hours,
    time.minutes,
    time.seconds,
  );

  if (Number.isNaN(date.getTime())) {
    return item.startTime;
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/* =========================================================
 * RECURRING DAY HELPERS
 * ======================================================= */

const DAY_INDEX: Record<string, number> = {
  sun: 0,
  sunday: 0,

  mon: 1,
  monday: 1,

  tue: 2,
  tues: 2,
  tuesday: 2,

  wed: 3,
  wednesday: 3,

  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,

  fri: 5,
  friday: 5,

  sat: 6,
  saturday: 6,
};

const normalizeDay = (value: string): string => {
  return value.trim().toLowerCase();
};

const getRecurringDayIndexes = (
  item: CalendarLiveClass,
): number[] => {
  if (!item.recurring?.isRecurring) {
    return [];
  }

  return item.recurring.days
    .map((day) => DAY_INDEX[normalizeDay(day)])
    .filter(
      (day): day is number =>
        typeof day === 'number',
    );
};

/* =========================================================
 * CREATE RECURRING OCCURRENCE
 * ======================================================= */

const createRecurringOccurrence = (
  item: CalendarLiveClass,
  occurrenceDate: string,
  now: Date,
): CalendarLiveClass => {
  const status = getOccurrenceStatus(
    item,
    occurrenceDate,
    now,
  );

  const time = getTimeFromClass(item);

  let startTime = item.startTime;
  let formattedTimeRange = item.formattedTimeRange;

  if (time) {
    startTime = `${String(time.hours).padStart(2, '0')}:${String(
      time.minutes,
    ).padStart(2, '0')}`;

    const endDate = new Date();

    endDate.setHours(
      time.hours,
      time.minutes,
      0,
      0,
    );

    endDate.setMinutes(
      endDate.getMinutes() +
        Number(item.duration ?? 0),
    );

    formattedTimeRange = `${formatTimeForDisplay(
      time.hours,
      time.minutes,
    )} - ${formatTimeForDisplay(
      endDate.getHours(),
      endDate.getMinutes(),
    )}`;
  }

  /*
   * IMPORTANT:
   *
   * We keep the ORIGINAL id.
   *
   * This means edit/delete will still hit:
   * /admin/live-classes/{original-id}
   *
   * We do NOT change the backend ID.
   */
  return {
    ...item,

    date: occurrenceDate,

    startTime,

    status,

    formattedTimeRange,

    /*
     * Keep recurrence configuration intact.
     */
    recurring: item.recurring
      ? {
          ...item.recurring,
        }
      : undefined,
  };
};

/* =========================================================
 * EXPAND RECURRING CLASSES
 *
 * IMPORTANT:
 * endDate IS INTENTIONALLY IGNORED.
 *
 * User requirement:
 * recurring class continues indefinitely while
 * status !== cancelled.
 * ======================================================= */

const expandRecurringClasses = (
  sourceClasses: CalendarLiveClass[],
  rangeStart: string,
  rangeEnd: string,
  now: Date,
): CalendarLiveClass[] => {
  const result: CalendarLiveClass[] = [];

  const [startYear, startMonth, startDay] =
    rangeStart.split('-').map(Number);

  const [endYear, endMonth, endDay] =
    rangeEnd.split('-').map(Number);

  const startDate = new Date(
    startYear,
    startMonth - 1,
    startDay,
  );

  const endDate = new Date(
    endYear,
    endMonth - 1,
    endDay,
  );

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  for (
    const cursor = new Date(startDate);
    cursor <= endDate;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    const dateString = formatLocalDate(cursor);
    const dayIndex = cursor.getDay();

    for (const item of sourceClasses) {
      /*
       * Cancelled recurring classes should NOT generate
       * occurrences.
       */
      if (item.status === 'cancelled') {
        /*
         * Keep the cancelled parent only when its own
         * original date falls inside the range.
         */
        if (item.date === dateString) {
          result.push(item);
        }

        continue;
      }

      /*
       * Normal one-time class.
       */
      if (!item.recurring?.isRecurring) {
        if (item.date === dateString) {
          result.push(item);
        }

        continue;
      }

      /*
       * Recurring class.
       */
      const recurringDayIndexes =
        getRecurringDayIndexes(item);

      if (
        recurringDayIndexes.length === 0 ||
        !recurringDayIndexes.includes(dayIndex)
      ) {
        continue;
      }

      /*
       * IMPORTANT:
       *
       * We deliberately DO NOT check:
       *
       * item.recurring.endDate
       *
       * Recurring classes continue indefinitely.
       */
      result.push(
        createRecurringOccurrence(
          item,
          dateString,
          now,
        ),
      );
    }
  }

  /*
   * Sort by date + time.
   */
  result.sort((a, b) => {
    const aTime = new Date(
      `${a.date}T${a.startTime}`,
    ).getTime();

    const bTime = new Date(
      `${b.date}T${b.startTime}`,
    ).getTime();

    if (
      Number.isNaN(aTime) ||
      Number.isNaN(bTime)
    ) {
      return a.date.localeCompare(b.date);
    }

    return aTime - bTime;
  });

  return result;
};

/* =========================================================
 * HOOK
 * ======================================================= */

export function useCalendarLiveClasses() {
  const [classes, setClasses] =
    useState<CalendarLiveClass[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [currentTime, setCurrentTime] =
    useState<Date>(new Date());

  const todayDateStr = useMemo(
    () => formatLocalDate(currentTime),
    [currentTime],
  );

  const [selectedDate, setSelectedDate] =
    useState<string>(() =>
      formatLocalDate(new Date()),
    );

  const [
    hasExplicitlyNavigatedAway,
    setHasExplicitlyNavigatedAway,
  ] = useState<boolean>(false);

  const [viewMode, setViewMode] =
    useState<CalendarViewMode>('week');

  const [reminderLogs, setReminderLogs] =
    useState<CalendarReminderLog[]>([]);

  const [toastMessage, setToastMessage] =
    useState<{
      id: string;
      title: string;
      desc: string;
      type?: 'info' | 'success' | 'alert';
    } | null>(null);

  /* =======================================================
   * MODALS
   * ===================================================== */

  const [createModalOpen, setCreateModalOpen] =
    useState(false);

  const [editModalItem, setEditModalItem] =
    useState<CalendarLiveClass | null>(null);

  const [detailsModalItem, setDetailsModalItem] =
    useState<CalendarLiveClass | null>(null);

  const [joinModalItem, setJoinModalItem] =
    useState<CalendarLiveClass | null>(null);

  const [recordingModalItem, setRecordingModalItem] =
    useState<CalendarLiveClass | null>(null);

  const [calendarModalOpen, setCalendarModalOpen] =
    useState(false);

  /* =======================================================
   * FILTERS
   * ===================================================== */

  const [filters, setFilters] =
    useState<CalendarLiveClassesFilterState>(() => ({
      searchQuery: '',
      teacherId: 'all',
      courseId: 'all',
      status: 'all',
      dateRange: getCurrentMonthRange(),
    }));

  /* =======================================================
   * LOAD DATA
   * ===================================================== */

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);

      const data = await fetchLiveClasses();

      setClasses(data);

      const logs =
        await fetchReminderLogs();

      setReminderLogs(logs);
    } catch (error) {
      console.error(
        'Failed to load calendar live classes:',
        error,
      );

      showToast(
        'Failed to load classes',
        'Unable to load live classes.',
        'alert',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  /* =======================================================
   * REAL-TIME CLOCK
   * ===================================================== */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* =======================================================
   * TOAST
   * ===================================================== */

  const showToast = useCallback(
    (
      title: string,
      desc: string,
      type:
        | 'info'
        | 'success'
        | 'alert' = 'success',
    ) => {
      setToastMessage({
        id: `${Date.now()}`,
        title,
        desc,
        type,
      });

      setTimeout(() => {
        setToastMessage((prev) =>
          prev?.title === title
            ? null
            : prev,
        );
      }, 4500);
    },
    [],
  );

  /* =======================================================
   * AUTOMATED REMINDERS
   * ===================================================== */

  useEffect(() => {
    const reminderEngineInterval =
      setInterval(async () => {
        const now = new Date();

        setClasses((prevClasses) => {
          let reminderTriggered = false;

          const updated =
            prevClasses.map((item) => {
              if (
                !item.automatedReminders
                  ?.enabled
              ) {
                return item;
              }

              /*
               * For recurring classes, calculate the
               * actual occurrence date instead of blindly
               * using the parent date.
               */
              let classDate =
                item.date;

              if (
                item.recurring?.isRecurring
              ) {
                const dayIndexes =
                  getRecurringDayIndexes(item);

                if (
                  !dayIndexes.includes(
                    now.getDay(),
                  )
                ) {
                  return item;
                }

                classDate =
                  formatLocalDate(now);
              }

              const time =
                getTimeFromClass(item);

              if (!time) {
                return item;
              }

              const classDateTime =
                new Date(
                  `${classDate}T${String(
                    time.hours,
                  ).padStart(
                    2,
                    '0',
                  )}:${String(
                    time.minutes,
                  ).padStart(
                    2,
                    '0',
                  )}:00`,
                );

              const diffMinutes =
                Math.round(
                  (
                    classDateTime.getTime() -
                    now.getTime()
                  ) /
                    (1000 * 60),
                );

              const shouldFire =
                item.automatedReminders.offsetsMinutes.some(
                  (offset) =>
                    Math.abs(
                      diffMinutes -
                        offset,
                    ) <= 1,
                );

              if (
                shouldFire &&
                !item.automatedReminders
                  .lastRunTimestamp
              ) {
                reminderTriggered =
                  true;

                triggerClassRemindersApi(
                  item,
                  'automated',
                ).then(({ count }) => {
                  showToast(
                    'Automated Reminder Dispatched',
                    `Auto-sent alerts to ${
                      count ||
                      item.participants
                        .length
                    } participants for ${
                      item.title
                    }`,
                    'info',
                  );
                });

                return {
                  ...item,

                  automatedReminders: {
                    ...item.automatedReminders,

                    lastRunTimestamp:
                      now.toISOString(),

                    autoSentCount:
                      (
                        item
                          .automatedReminders
                          .autoSentCount ||
                        0
                      ) +
                      item.participants
                        .length,
                  },
                };
              }

              return item;
            });

          return reminderTriggered
            ? updated
            : prevClasses;
        });
      }, 15000);

    return () =>
      clearInterval(
        reminderEngineInterval,
      );
  }, [showToast]);

  /* =======================================================
   * WEEK DAYS
   * ===================================================== */

  const weekDays = useMemo(() => {
    const [y, m, d] =
      selectedDate
        .split('-')
        .map(Number);

    const base = new Date(
      y,
      m - 1,
      d,
    );

    const day = base.getDay();

    const diffToMonday =
      day === 0
        ? -6
        : 1 - day;

    const monday = new Date(base);

    monday.setDate(
      base.getDate() +
        diffToMonday,
    );

    const days = [];

    for (let i = 0; i < 7; i++) {
      const dObj =
        new Date(monday);

      dObj.setDate(
        monday.getDate() + i,
      );

      const dateStr =
        formatLocalDate(dObj);

      const dayNames = [
        'Sun',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat',
      ];

      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];

      days.push({
        date: dateStr,
        dayName:
          dayNames[dObj.getDay()],
        dayNum: dObj.getDate(),
        monthName:
          monthNames[
            dObj.getMonth()
          ],
        isToday:
          dateStr === todayDateStr,
        fullDate: dObj,
      });
    }

    return days;
  }, [
    selectedDate,
    todayDateStr,
  ]);

  /* =======================================================
   * WEEK RANGE LABEL
   * ===================================================== */

  const weekRangeLabel =
    useMemo(() => {
      if (weekDays.length === 0) {
        return '';
      }

      const first =
        weekDays[0];

      const last =
        weekDays[6];

      const firstYear =
        first.fullDate.getFullYear();

      const lastYear =
        last.fullDate.getFullYear();

      if (
        firstYear === lastYear
      ) {
        return `${first.monthName} ${first.dayNum} – ${last.monthName} ${last.dayNum}, ${firstYear}`;
      }

      return `${first.monthName} ${first.dayNum}, ${firstYear} – ${last.monthName} ${last.dayNum}, ${lastYear}`;
    }, [weekDays]);

  /* =======================================================
   * NAVIGATION
   * ===================================================== */

  const handlePrevPeriod =
    useCallback(() => {
      const [y, m, d] =
        selectedDate
          .split('-')
          .map(Number);

      const dateObj =
        new Date(
          y,
          m - 1,
          d,
        );

      if (
        viewMode === 'day'
      ) {
        dateObj.setDate(
          dateObj.getDate() - 1,
        );
      } else if (
        viewMode === 'month'
      ) {
        dateObj.setMonth(
          dateObj.getMonth() - 1,
        );
      } else {
        dateObj.setDate(
          dateObj.getDate() - 7,
        );
      }

      setSelectedDate(
        formatLocalDate(dateObj),
      );

      setHasExplicitlyNavigatedAway(
        true,
      );
    }, [
      selectedDate,
      viewMode,
    ]);

  const handleNextPeriod =
    useCallback(() => {
      const [y, m, d] =
        selectedDate
          .split('-')
          .map(Number);

      const dateObj =
        new Date(
          y,
          m - 1,
          d,
        );

      if (
        viewMode === 'day'
      ) {
        dateObj.setDate(
          dateObj.getDate() + 1,
        );
      } else if (
        viewMode === 'month'
      ) {
        dateObj.setMonth(
          dateObj.getMonth() + 1,
        );
      } else {
        dateObj.setDate(
          dateObj.getDate() + 7,
        );
      }

      setSelectedDate(
        formatLocalDate(dateObj),
      );

      setHasExplicitlyNavigatedAway(
        true,
      );
    }, [
      selectedDate,
      viewMode,
    ]);

  const handleGoToToday =
    useCallback(() => {
      setSelectedDate(
        todayDateStr,
      );

      setHasExplicitlyNavigatedAway(
        false,
      );

      showToast(
        'Jumped to Today',
        `Displaying schedule for ${todayDateStr}`,
        'info',
      );
    }, [
      todayDateStr,
      showToast,
    ]);

  const handleSelectDate =
    useCallback(
      (date: string) => {
        setSelectedDate(date);

        if (
          date !== todayDateStr
        ) {
          setHasExplicitlyNavigatedAway(
            true,
          );
        }
      },
      [todayDateStr],
    );

  const handleViewModeChange =
    useCallback(
      (mode: CalendarViewMode) => {
        setViewMode(mode);

        if (
          mode === 'day' &&
          !hasExplicitlyNavigatedAway
        ) {
          setSelectedDate(
            todayDateStr,
          );
        }
      },
      [
        hasExplicitlyNavigatedAway,
        todayDateStr,
      ],
    );

  /* =======================================================
   * DISPLAY RANGE
   *
   * This determines which dates should be expanded.
   * ===================================================== */

  const displayRange =
    useMemo(() => {
      if (
        viewMode === 'day'
      ) {
        return {
          start: selectedDate,
          end: selectedDate,
        };
      }

      if (
        viewMode === 'week'
      ) {
        return {
          start:
            weekDays[0]?.date ??
            selectedDate,
          end:
            weekDays[6]?.date ??
            selectedDate,
        };
      }

      if (
        viewMode === 'month'
      ) {
        const [year, month] =
          selectedDate
            .split('-')
            .map(Number);

        const start =
          new Date(
            year,
            month - 1,
            1,
          );

        const end =
          new Date(
            year,
            month,
            0,
          );

        return {
          start:
            formatLocalDate(start),
          end:
            formatLocalDate(end),
        };
      }

      /*
       * List view uses the selected date filter.
       */
      return {
        start:
          filters.dateRange?.start ??
          selectedDate,

        end:
          filters.dateRange?.end ??
          selectedDate,
      };
    }, [
      viewMode,
      selectedDate,
      weekDays,
      filters.dateRange,
    ]);

  /* =======================================================
   * EXPANDED CLASSES
   *
   * THIS IS THE MAIN FIX.
   * ===================================================== */

  const expandedClasses =
    useMemo(() => {
      return expandRecurringClasses(
        classes,
        displayRange.start,
        displayRange.end,
        currentTime,
      );
    }, [
      classes,
      displayRange.start,
      displayRange.end,
      currentTime,
    ]);

  /* =======================================================
   * FILTERED CLASSES
   * ===================================================== */

  const filteredClasses =
    useMemo(() => {
      return expandedClasses.filter(
        (item) => {
          /* ---------------------------------------------
           * Search
           * ------------------------------------------- */

          if (
            filters.searchQuery.trim()
          ) {
            const query =
              filters.searchQuery
                .trim()
                .toLowerCase();

            const matchTitle =
              item.title
                .toLowerCase()
                .includes(query);

            const matchTeacher =
              item.teacherName
                .toLowerCase()
                .includes(query);

            const matchCourse =
              item.courseName
                .toLowerCase()
                .includes(query);

            const matchRoom =
              item.roomName
                .toLowerCase()
                .includes(query);

            if (
              !matchTitle &&
              !matchTeacher &&
              !matchCourse &&
              !matchRoom
            ) {
              return false;
            }
          }

          /* ---------------------------------------------
           * Teacher
           * ------------------------------------------- */

          if (
            filters.teacherId !==
              'all' &&
            item.teacherId !==
              filters.teacherId &&
            item.teacherName !==
              filters.teacherId
          ) {
            return false;
          }

          /* ---------------------------------------------
           * Course
           * ------------------------------------------- */

          if (
            filters.courseId !==
              'all' &&
            item.courseId !==
              filters.courseId &&
            item.title !==
              filters.courseId
          ) {
            return false;
          }

          /* ---------------------------------------------
           * Status
           * ------------------------------------------- */

          if (
            filters.status !==
              'all' &&
            item.status !==
              filters.status
          ) {
            return false;
          }

          /* ---------------------------------------------
           * Date range
           * ------------------------------------------- */

          if (
            filters.dateRange?.start &&
            filters.dateRange?.end
          ) {
            const inRange =
              item.date >=
                filters.dateRange
                  .start &&
              item.date <=
                filters.dateRange.end;

            /*
             * Week / Day / Month views use their own
             * display range.
             *
             * List view strictly follows filter range.
             */
            if (
              viewMode === 'list' &&
              !inRange
            ) {
              return false;
            }
          }

          return true;
        },
      );
    }, [
      expandedClasses,
      filters,
      viewMode,
    ]);

  /* =======================================================
   * WEEKLY KPIs
   *
   * Uses EXPANDED classes, not parent records.
   *
   * Example:
   * Tue recurring class
   * Wed recurring class
   * Thu recurring class
   *
   * Each occurrence is counted separately.
   * ===================================================== */

  const weeklyKPIs:
    CalendarWeeklyKPISummary =
    useMemo(() => {
      const currentWeekDates =
        new Set(
          weekDays.map(
            (w) => w.date,
          ),
        );

      const weekClasses =
        expandedClasses.filter(
          (c) =>
            currentWeekDates.has(
              c.date,
            ),
        );

      const total =
        weekClasses.length;

      const live =
        weekClasses.filter(
          (c) =>
            c.status ===
            'live',
        ).length;

      const scheduled =
        weekClasses.filter(
          (c) =>
            c.status ===
            'scheduled',
        ).length;

      const completed =
        weekClasses.filter(
          (c) =>
            c.status ===
            'completed',
        ).length;

      const cancelled =
        weekClasses.filter(
          (c) =>
            c.status ===
            'cancelled',
        ).length;

      /*
       * Reminder count remains based on actual stored
       * classes because reminder logs are not occurrences.
       */
      const remindersCount =
        classes.reduce(
          (acc, c) =>
            acc +
            (
              c
                .automatedReminders
                ?.autoSentCount ||
              0
            ),
          0,
        );

      const upcomingRemindersCount =
        weekClasses.filter(
          (c) =>
            c.status ===
              'scheduled' &&
            Boolean(
              c
                .automatedReminders
                ?.enabled,
            ),
        ).length;

      return {
        totalClasses: total,

        liveClasses: live,

        scheduledClasses:
          scheduled,

        completedClasses:
          completed,

        cancelledClasses:
          cancelled,

        remindersSentToday:
          remindersCount,

        upcomingRemindersCount:
          upcomingRemindersCount,
      };
    }, [
      expandedClasses,
      weekDays,
      classes,
    ]);

  /* =======================================================
   * CREATE
   * ===================================================== */

  const handleCreateClass =
    async (
      classData: Partial<CalendarLiveClass>,
    ) => {
      try {
        const created =
          await createLiveClassApi(
            classData,
          );

        setClasses((prev) => [
          created,
          ...prev,
        ]);

        showToast(
          'Class Scheduled',
          `Successfully created ${created.title} with ${created.teacherName}`,
        );

        setCreateModalOpen(false);
      } catch (error) {
        console.error(
          'Create live class failed:',
          error,
        );

        showToast(
          'Create Failed',
          'Unable to create live class.',
          'alert',
        );
      }
    };

  /* =======================================================
   * UPDATE
   * ===================================================== */

  const handleUpdateClass =
    async (
      id: string,
      updates: Partial<CalendarLiveClass>,
    ) => {
      try {
        const updated =
          await updateLiveClassApi(
            id,
            updates,
          );

        if (!updated) {
          return;
        }

        setClasses((prev) =>
          prev.map((c) =>
            c.id === id
              ? updated
              : c,
          ),
        );

        showToast(
          'Class Updated',
          `Updated details for ${updated.title}`,
        );

        if (
          detailsModalItem?.id ===
          id
        ) {
          setDetailsModalItem(
            updated,
          );
        }

        setEditModalItem(null);
      } catch (error) {
        console.error(
          'Update live class failed:',
          error,
        );

        showToast(
          'Update Failed',
          'Unable to update live class.',
          'alert',
        );
      }
    };

  /* =======================================================
   * DELETE
   * ===================================================== */

  const handleDeleteClass =
    async (id: string) => {
      try {
        const success =
          await deleteLiveClassApi(
            id,
          );

        if (!success) {
          return;
        }

        setClasses((prev) =>
          prev.filter(
            (c) => c.id !== id,
          ),
        );

        showToast(
          'Class Removed',
          'The class has been removed from schedule',
          'info',
        );

        setDetailsModalItem(
          null,
        );

        setEditModalItem(null);
      } catch (error) {
        console.error(
          'Delete live class failed:',
          error,
        );

        showToast(
          'Delete Failed',
          'Unable to delete live class.',
          'alert',
        );
      }
    };

  /* =======================================================
   * MANUAL REMINDERS
   * ===================================================== */

  const handleTriggerRemindersNow =
    async (
      liveClass: CalendarLiveClass,
      messageOverride?: string,
    ) => {
      try {
        const {
          count,
          logs,
        } =
          await triggerClassRemindersApi(
            liveClass,
            'manual',
            messageOverride,
          );

        setReminderLogs(
          (prev) => [
            ...logs,
            ...prev,
          ],
        );

        showToast(
          'Reminders Sent!',
          `Delivered automated reminders to ${count} enrolled participants via Email, SMS & WhatsApp.`,
          'success',
        );

        const updated =
          await updateLiveClassApi(
            liveClass.id,
            {
              automatedReminders: {
                ...liveClass.automatedReminders,

                autoSentCount:
                  (
                    liveClass
                      .automatedReminders
                      .autoSentCount ||
                    0
                  ) + count,
              },
            },
          );

        if (
          updated &&
          detailsModalItem?.id ===
            liveClass.id
        ) {
          setDetailsModalItem(
            updated,
          );
        }

        /*
         * Keep local base class updated too.
         */
        if (updated) {
          setClasses((prev) =>
            prev.map((c) =>
              c.id ===
              liveClass.id
                ? updated
                : c,
            ),
          );
        }
      } catch (error) {
        console.error(
          'Trigger reminders failed:',
          error,
        );

        showToast(
          'Reminder Failed',
          'Unable to send reminders.',
          'alert',
        );
      }
    };

  /* =======================================================
   * RESET DATA
   * ===================================================== */

  const handleResetData =
    async () => {
      try {
        const initial =
          await resetToInitialClasses();

        setClasses(initial);

        setSelectedDate(
          todayDateStr,
        );

        setHasExplicitlyNavigatedAway(
          false,
        );

        setFilters({
          searchQuery: '',
          teacherId: 'all',
          courseId: 'all',
          status: 'all',
          dateRange:
            getCurrentMonthRange(),
        });

        showToast(
          'Timetable Reset',
          'Restored initial scheduled classes dataset',
          'info',
        );
      } catch (error) {
        console.error(
          'Reset failed:',
          error,
        );

        showToast(
          'Reset Failed',
          'Unable to reset timetable.',
          'alert',
        );
      }
    };

  /* =======================================================
   * EXPORT
   * ===================================================== */

  const handleExport = (
    format:
      | 'csv'
      | 'json' = 'csv',
  ) => {
    exportLiveClassesData(
      filteredClasses,
      format,
    );

    showToast(
      'Export Completed',
      `Exported ${filteredClasses.length} live classes to ${format.toUpperCase()}`,
    );
  };

  /* =======================================================
   * RETURN
   * ===================================================== */

  return {
    classes,

    /*
     * IMPORTANT:
     * filteredClasses now contains expanded recurring
     * occurrences for calendar rendering.
     */
    filteredClasses,

    loading,

    currentTime,

    todayDateStr,

    selectedDate,

    setSelectedDate:
      handleSelectDate,

    hasExplicitlyNavigatedAway,

    viewMode,

    setViewMode:
      handleViewModeChange,

    filters,

    setFilters,

    weeklyKPIs,

    weekDays,

    weekRangeLabel,

    reminderLogs,

    toastMessage,

    /* -----------------------------------------------------
     * Modals
     * --------------------------------------------------- */

    createModalOpen,

    setCreateModalOpen,

    editModalItem,

    setEditModalItem,

    detailsModalItem,

    setDetailsModalItem,

    joinModalItem,

    setJoinModalItem,

    recordingModalItem,

    setRecordingModalItem,

    calendarModalOpen,

    setCalendarModalOpen,

    /* -----------------------------------------------------
     * Actions
     * --------------------------------------------------- */

    handlePrevPeriod,

    handleNextPeriod,

    handleGoToToday,

    handleSelectDate,

    handleViewModeChange,

    handleCreateClass,

    handleUpdateClass,

    handleDeleteClass,

    handleTriggerRemindersNow,

    handleResetData,

    handleExport,

    showToast,
  };
}
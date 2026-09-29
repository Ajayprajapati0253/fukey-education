import type {
  CalendarClassStatus,
  CalendarLiveClass,
  CalendarReminderLog,
} from '../types/calendar-live-class.types';
import { CALENDAR_SUBJECT_COLOR_STYLES } from '../data/CalendarInitialLiveClasses';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const REMINDERS_LOG_KEY = 'fukey_calendar_reminders_log_v1';

/* -------------------------------------------------------------------------- */
/* Auth                                                                       */
/* -------------------------------------------------------------------------- */

const getAuthToken = (): string | null => {
  return (
    localStorage.getItem('admin_token') ||
    sessionStorage.getItem('admin_token') ||
    localStorage.getItem('admin_token') ||
    sessionStorage.getItem('admin_token') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('token')
  );
};

const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();

  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/* -------------------------------------------------------------------------- */
/* Date / Time Helpers                                                        */
/* -------------------------------------------------------------------------- */

/**
 * The current live_classes data is stored in MySQL as a local/business
 * datetime, e.g.:
 *
 * 2026-09-28 16:15:00
 *
 * Do NOT use:
 *
 * new Date('2026-09-28 16:15:00')
 *
 * directly because browser/runtime timezone parsing can shift the time.
 *
 * This function explicitly creates a local Date from the individual
 * date/time components.
 */
const parseLocalDateTime = (value: string | Date): Date => {
  if (value instanceof Date) {
    return value;
  }

  const normalized = String(value).replace(' ', 'T');

  const [datePart, timePart = '00:00:00'] = normalized.split('T');

  const [year, month, day] = datePart.split('-').map(Number);

  const [hours = 0, minutes = 0, secondsPart = '0'] =
    timePart.split(':');

  const seconds = Number(
    String(secondsPart).split('.')[0] || 0,
  );

  return new Date(
    year,
    month - 1,
    day,
    Number(hours) || 0,
    Number(minutes) || 0,
    seconds,
  );
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
};

const formatTime12Hour = (date: Date): string => {
  return date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const calculateClassStatus = (
  startTime: Date,
  durationMinutes: number,
): CalendarClassStatus => {
  const now = new Date();

  const endTime = new Date(
    startTime.getTime() + durationMinutes * 60 * 1000,
  );

  if (now >= startTime && now < endTime) {
    return 'live';
  }

  if (now < startTime) {
    return 'scheduled';
  }

  return 'completed';
};

/* -------------------------------------------------------------------------- */
/* Backend → Calendar Mapper                                                  */
/* -------------------------------------------------------------------------- */

const mapLiveClass = (item: any): CalendarLiveClass => {
  const startTime = parseLocalDateTime(item.start_time);

  const durationMinutes = Number(item.duration || 0);

  const endTime = new Date(
    startTime.getTime() +
      durationMinutes * 60 * 1000,
  );

  const title = item.title || 'Live Class';

  const colorScheme =
    CALENDAR_SUBJECT_COLOR_STYLES[title] ||
    CALENDAR_SUBJECT_COLOR_STYLES.Mathematics;

  return {
    id: String(item.id),

    title,

    courseName: item.course_id
      ? `Course #${item.course_id}`
      : 'Live Class',

    courseId: item.course_id
      ? String(item.course_id)
      : '',

    teacherId: item.instructor_id
      ? String(item.instructor_id)
      : '',

    teacherName: item.instructor_id
      ? `Instructor #${item.instructor_id}`
      : 'Instructor',

    teacherAvatar: undefined,

    date: formatDate(startTime),

    startTime: formatTime(startTime),

    endTime: formatTime(endTime),

    formattedTimeRange:
      `${formatTime12Hour(startTime)} - ${formatTime12Hour(endTime)}`,

    durationMinutes,

    status: calculateClassStatus(
      startTime,
      durationMinutes,
    ),

    isRecurring: Boolean(item.is_recurring),

    recurringPattern:
      item.is_recurring
        ? 'weekly'
        : undefined,

    meetLink:
      item.meeting_url ||
      item.watch_url ||
      item.youtube_watch_url ||
      '',

    roomName:
      item.meeting_id ||
      'Live Classroom',

    description:
      item.description || '',

    topics: [],

    maxParticipants: Number(
      item.max_participants || 0,
    ),

    currentEnrollment: Number(
      item.current_enrollment || 0,
    ),

    participants: [],

    automatedReminders: {
      enabled: false,
      offsetsMinutes: [],
      channels: [],
      customMessageTemplate: '',
      autoSentCount: 0,
    },

    recordingUrl:
      item.recording_url ||
      undefined,

    recordingDuration:
      item.recording_duration ||
      undefined,

    colorScheme,

    createdAt:
      item.created_at ||
      new Date().toISOString(),

    updatedAt:
      item.updated_at ||
      new Date().toISOString(),
  };
};

/* -------------------------------------------------------------------------- */
/* Fetch Live Classes                                                        */
/* -------------------------------------------------------------------------- */

export const fetchLiveClasses = async (): Promise<
  CalendarLiveClass[]
> => {
  const response = await fetch(
    `${API_BASE_URL}/admin/live-classes`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Failed to fetch live classes (${response.status}): ${errorText}`,
    );
  }

  const result = await response.json();

  const data = Array.isArray(result?.data)
    ? result.data
    : [];

  return data.map(mapLiveClass);
};

/* -------------------------------------------------------------------------- */
/* Create Live Class                                                         */
/* -------------------------------------------------------------------------- */

export const createLiveClassApi = async (
  newClassData: Partial<CalendarLiveClass>,
): Promise<CalendarLiveClass> => {
  if (!newClassData.title) {
    throw new Error('Live class title is required.');
  }

  if (!newClassData.date) {
    throw new Error('Live class date is required.');
  }

  if (!newClassData.startTime) {
    throw new Error('Live class start time is required.');
  }

  const startTime = `${newClassData.date}T${newClassData.startTime}:00`;

  const payload = {
    title: newClassData.title,

    instructor:
      newClassData.teacherId || undefined,

    course_id:
      newClassData.courseId || undefined,

    description:
      newClassData.description || undefined,

    start_time: startTime,

    duration:
      newClassData.durationMinutes || 60,

    status:
      newClassData.status || 'scheduled',

    recurring_days:
      newClassData.isRecurring
        ? newClassData.recurringPattern
          ? [newClassData.recurringPattern]
          : []
        : [],

    end_date:
      undefined,

    platform:
      'jitsi',
  };

  const response = await fetch(
    `${API_BASE_URL}/admin/live-classes`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Failed to create live class (${response.status}): ${errorText}`,
    );
  }

  const result = await response.json();

  if (!result?.data) {
    throw new Error(
      'Invalid response received while creating live class.',
    );
  }

  return mapLiveClass(result.data);
};

/* -------------------------------------------------------------------------- */
/* Update Live Class                                                         */
/* -------------------------------------------------------------------------- */

export const updateLiveClassApi = async (
  id: string,
  updates: Partial<CalendarLiveClass>,
): Promise<CalendarLiveClass | null> => {
  const payload: Record<string, unknown> = {};

  if (updates.title !== undefined) {
    payload.title = updates.title;
  }

  if (updates.teacherId !== undefined) {
    payload.instructor = updates.teacherId;
  }

  if (
    updates.date !== undefined &&
    updates.startTime !== undefined
  ) {
    payload.start_time =
      `${updates.date}T${updates.startTime}:00`;
  }

  if (updates.durationMinutes !== undefined) {
    payload.duration =
      updates.durationMinutes;
  }

  if (updates.description !== undefined) {
    payload.description =
      updates.description;
  }

  if (updates.status !== undefined) {
    payload.status =
      updates.status;
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/live-classes/${id}`,
    {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Failed to update live class (${response.status}): ${errorText}`,
    );
  }

  const result = await response.json();

  if (!result?.data) {
    return null;
  }

  return mapLiveClass(result.data);
};

/* -------------------------------------------------------------------------- */
/* Delete Live Class                                                         */
/* -------------------------------------------------------------------------- */

export const deleteLiveClassApi = async (
  id: string,
): Promise<boolean> => {
  const response = await fetch(
    `${API_BASE_URL}/admin/live-classes/${id}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Failed to delete live class (${response.status}): ${errorText}`,
    );
  }

  return true;
};

/* -------------------------------------------------------------------------- */
/* Reset Data                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * The old implementation restored the hardcoded 24-class mock dataset.
 *
 * Real API is now the source of truth, so reset simply reloads the backend.
 */
export const resetToInitialClasses = async (): Promise<
  CalendarLiveClass[]
> => {
  return fetchLiveClasses();
};

/* -------------------------------------------------------------------------- */
/* Reminder Logs                                                             */
/* -------------------------------------------------------------------------- */

export const fetchReminderLogs = async (): Promise<
  CalendarReminderLog[]
> => {
  try {
    const raw = localStorage.getItem(
      REMINDERS_LOG_KEY,
    );

    if (raw) {
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn(
      'Failed to load reminder logs:',
      error,
    );
  }

  return [];
};

/* -------------------------------------------------------------------------- */
/* Record Reminder Log                                                       */
/* -------------------------------------------------------------------------- */

export const recordReminderLog = async (
  log: Omit<
    CalendarReminderLog,
    'id' | 'sentAt'
  >,
): Promise<CalendarReminderLog> => {
  const logs =
    await fetchReminderLogs();

  const newLog: CalendarReminderLog = {
    ...log,

    id:
      `log-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 6)}`,

    sentAt:
      new Date().toISOString(),
  };

  const updatedLogs = [
    newLog,
    ...logs,
  ].slice(0, 100);

  try {
    localStorage.setItem(
      REMINDERS_LOG_KEY,
      JSON.stringify(updatedLogs),
    );
  } catch (error) {
    console.warn(
      'Failed to save reminder log:',
      error,
    );
  }

  return newLog;
};

/* -------------------------------------------------------------------------- */
/* Trigger Reminders                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Reminder functionality is still local because the current backend
 * LiveClassService does not expose a reminder endpoint.
 *
 * This does NOT affect live class loading/status.
 */
export const triggerClassRemindersApi = async (
  liveClass: CalendarLiveClass,
  triggerType: 'automated' | 'manual' = 'manual',
  customMessage?: string,
): Promise<{
  count: number;
  logs: CalendarReminderLog[];
}> => {
  const createdLogs: CalendarReminderLog[] = [];

  const participants =
    liveClass.participants || [];

  for (const participant of participants) {
    if (!participant.reminderSubscribed) {
      continue;
    }

    for (const channel of participant.reminderChannels) {
      const template =
        liveClass.automatedReminders
          ?.customMessageTemplate || '';

      const message =
        customMessage ||
        template
          .replace(
            '{{name}}',
            participant.name,
          )
          .replace(
            '{{time}}',
            liveClass.formattedTimeRange,
          )
          .replace(
            '{{link}}',
            liveClass.meetLink,
          );

      const log =
        await recordReminderLog({
          classId: liveClass.id,
          classTitle: liveClass.title,
          participantId: participant.id,
          participantName:
            participant.name,
          channel,
          triggerType,
          status: 'delivered',
          message,
        });

      createdLogs.push(log);
    }
  }

  return {
    count: createdLogs.length,
    logs: createdLogs,
  };
};

/* -------------------------------------------------------------------------- */
/* Export Live Classes                                                        */
/* -------------------------------------------------------------------------- */

export const exportLiveClassesData = (
  classes: CalendarLiveClass[],
  format: 'csv' | 'json' = 'csv',
) => {
  if (format === 'json') {
    const jsonStr =
      JSON.stringify(
        classes,
        null,
        2,
      );

    const blob = new Blob(
      [jsonStr],
      {
        type: 'application/json',
      },
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;

    link.download =
      `fukey-scheduled-classes-${new Date()
        .toISOString()
        .split('T')[0]}.json`;

    link.click();

    URL.revokeObjectURL(url);

    return;
  }

  const headers = [
    'ID',
    'Title',
    'Course Name',
    'Teacher',
    'Date',
    'Time Range',
    'Status',
    'Recurring',
    'Room',
    'Meet Link',
    'Enrolled',
  ];

  const rows = classes.map((item) => [
    `"${item.id}"`,
    `"${item.title}"`,
    `"${item.courseName.replace(
      /"/g,
      '""',
    )}"`,
    `"${item.teacherName}"`,
    `"${item.date}"`,
    `"${item.formattedTimeRange}"`,
    `"${item.status}"`,
    `"${item.isRecurring ? 'Yes' : 'No'}"`,
    `"${item.roomName}"`,
    `"${item.meetLink}"`,
    `"${item.currentEnrollment}/${item.maxParticipants}"`,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.join(','),
    ),
  ].join('\n');

  const blob = new Blob(
    [csvContent],
    {
      type: 'text/csv;charset=utf-8;',
    },
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement('a');

  link.href = url;

  link.download =
    `fukey-scheduled-classes-${new Date()
      .toISOString()
      .split('T')[0]}.csv`;

  link.click();

  URL.revokeObjectURL(url);
};
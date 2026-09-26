import type { CalendarLiveClass, CalendarReminderLog } from '../types/calendar-live-class.types';
import { CALENDAR_INITIAL_LIVE_CLASSES, CALENDAR_SUBJECT_COLOR_STYLES } from '../data/CalendarInitialLiveClasses';

const STORAGE_KEY = 'fukey_calendar_live_classes_v1';
const REMINDERS_LOG_KEY = 'fukey_calendar_reminders_log_v1';

// Helper to load classes from local storage or fallback to initial data
export const fetchLiveClasses = async (): Promise<CalendarLiveClass[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // If cached data exists but lacks today's classes, merge in the updated initial classes
        const hasToday = parsed.some((c: CalendarLiveClass) => c.date === '2026-09-17');
        if (!hasToday) {
          const newClasses = CALENDAR_INITIAL_LIVE_CLASSES.filter(
            (init) => !parsed.some((p: CalendarLiveClass) => p.id === init.id)
          );
          const merged = [...parsed, ...newClasses];
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch (e) {}
          return merged;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load classes from localStorage, using initial dataset:', err);
  }
  // Save initial dataset to cache
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(CALENDAR_INITIAL_LIVE_CLASSES));
  } catch (e) {
    // Ignore storage quota errors
  }
  return [...CALENDAR_INITIAL_LIVE_CLASSES];
};

// Save classes list
export const saveLiveClasses = async (classes: CalendarLiveClass[]): Promise<boolean> => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
    return true;
  } catch (err) {
    console.error('Failed to save live classes to storage:', err);
    return false;
  }
};

// Reset to original 24 classes matching screenshot
export const resetToInitialClasses = async (): Promise<CalendarLiveClass[]> => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(CALENDAR_INITIAL_LIVE_CLASSES));
  } catch (e) {}
  return [...CALENDAR_INITIAL_LIVE_CLASSES];
};

// Create a new class
export const createLiveClassApi = async (newClassData: Partial<CalendarLiveClass>): Promise<CalendarLiveClass> => {
  const currentClasses = await fetchLiveClasses();
  const id = `class-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const title = (newClassData.title as string) || 'Mathematics';
  const colorScheme = CALENDAR_SUBJECT_COLOR_STYLES[title] || CALENDAR_SUBJECT_COLOR_STYLES.Mathematics;

  const newClass: CalendarLiveClass = {
    id,
    title,
    courseName: newClassData.courseName || `${title} Special Session`,
    courseId: newClassData.courseId || `c-${title.toLowerCase()}`,
    teacherId: newClassData.teacherId || 't-1',
    teacherName: newClassData.teacherName || 'Rahul Sharma',
    teacherAvatar: newClassData.teacherAvatar,
    date: newClassData.date || new Date().toISOString().split('T')[0],
    startTime: newClassData.startTime || '15:00',
    endTime: newClassData.endTime || '16:00',
    formattedTimeRange: newClassData.formattedTimeRange || '3:00 - 4:00 PM',
    durationMinutes: newClassData.durationMinutes || 60,
    status: newClassData.status || 'scheduled',
    isRecurring: !!newClassData.isRecurring,
    recurringPattern: newClassData.recurringPattern || 'weekly',
    meetLink: newClassData.meetLink || `https://meet.fukey.edu/${title.toLowerCase()}-${Date.now().toString(36)}`,
    roomName: newClassData.roomName || 'Virtual Studio 1',
    description: newClassData.description || 'Live interactive classroom session with live whiteboard and Q&A.',
    topics: newClassData.topics || ['Introduction', 'Core Concepts', 'Q&A'],
    maxParticipants: newClassData.maxParticipants || 50,
    currentEnrollment: newClassData.currentEnrollment || 0,
    participants: newClassData.participants || [],
    automatedReminders: newClassData.automatedReminders || {
      enabled: true,
      offsetsMinutes: [15, 60, 1440],
      channels: ['email', 'whatsapp', 'sms'],
      customMessageTemplate: `Hi {{name}}, your class ${title} begins at {{time}}. Link: {{link}}`,
      autoSentCount: 0,
    },
    colorScheme,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newClass, ...currentClasses];
  await saveLiveClasses(updated);
  return newClass;
};

// Update an existing class
export const updateLiveClassApi = async (id: string, updates: Partial<CalendarLiveClass>): Promise<CalendarLiveClass | null> => {
  const currentClasses = await fetchLiveClasses();
  const index = currentClasses.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const existing = currentClasses[index];
  const title = (updates.title || existing.title) as string;
  const colorScheme = CALENDAR_SUBJECT_COLOR_STYLES[title] || existing.colorScheme;

  const updatedClass: CalendarLiveClass = {
    ...existing,
    ...updates,
    colorScheme,
    updatedAt: new Date().toISOString(),
  };

  currentClasses[index] = updatedClass;
  await saveLiveClasses(currentClasses);
  return updatedClass;
};

// Delete a class
export const deleteLiveClassApi = async (id: string): Promise<boolean> => {
  const currentClasses = await fetchLiveClasses();
  const filtered = currentClasses.filter((c) => c.id !== id);
  await saveLiveClasses(filtered);
  return true;
};

// Load reminder logs
export const fetchReminderLogs = async (): Promise<CalendarReminderLog[]> => {
  try {
    const raw = localStorage.getItem(REMINDERS_LOG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
};

// Record reminder log
export const recordReminderLog = async (log: Omit<CalendarReminderLog, 'id' | 'sentAt'>): Promise<CalendarReminderLog> => {
  const logs = await fetchReminderLogs();
  const newLog: CalendarReminderLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    sentAt: new Date().toISOString(),
  };
  const updatedLogs = [newLog, ...logs].slice(0, 100);
  try {
    localStorage.setItem(REMINDERS_LOG_KEY, JSON.stringify(updatedLogs));
  } catch (e) {}
  return newLog;
};

// Trigger manual or automated blast of reminders to all enrolled participants
export const triggerClassRemindersApi = async (
  liveClass: CalendarLiveClass,
  triggerType: 'automated' | 'manual' = 'manual',
  customMessage?: string
): Promise<{ count: number; logs: CalendarReminderLog[] }> => {
  const createdLogs: CalendarReminderLog[] = [];
  const participants = liveClass.participants || [];

  for (const p of participants) {
    if (p.reminderSubscribed) {
      for (const ch of p.reminderChannels) {
        const msg = customMessage ||
          liveClass.automatedReminders.customMessageTemplate
            .replace('{{name}}', p.name)
            .replace('{{time}}', liveClass.formattedTimeRange)
            .replace('{{link}}', liveClass.meetLink);

        const log = await recordReminderLog({
          classId: liveClass.id,
          classTitle: liveClass.title,
          participantId: p.id,
          participantName: p.name,
          channel: ch,
          triggerType,
          status: 'delivered',
          message: msg,
        });
        createdLogs.push(log);
      }
    }
  }

  // Update class automated reminder count
  await updateLiveClassApi(liveClass.id, {
    automatedReminders: {
      ...liveClass.automatedReminders,
      autoSentCount: (liveClass.automatedReminders.autoSentCount || 0) + createdLogs.length,
      lastRunTimestamp: new Date().toISOString(),
    },
    participants: liveClass.participants.map(p => ({
      ...p,
      reminderSent: p.reminderSubscribed ? true : p.reminderSent,
      reminderSentAt: p.reminderSubscribed ? new Date().toISOString() : p.reminderSentAt,
    }))
  });

  return { count: createdLogs.length, logs: createdLogs };
};

// Export helper for CSV and JSON
export const exportLiveClassesData = (classes: CalendarLiveClass[], format: 'csv' | 'json' = 'csv') => {
  if (format === 'json') {
    const jsonStr = JSON.stringify(classes, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fukey-scheduled-classes-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  // CSV
  const headers = ['ID', 'Title', 'Course Name', 'Teacher', 'Date', 'Time Range', 'Status', 'Recurring', 'Room', 'Meet Link', 'Enrolled'];
  const rows = classes.map((c) => [
    `"${c.id}"`,
    `"${c.title}"`,
    `"${c.courseName.replace(/"/g, '""')}"`,
    `"${c.teacherName}"`,
    `"${c.date}"`,
    `"${c.formattedTimeRange}"`,
    `"${c.status}"`,
    `"${c.isRecurring ? 'Yes' : 'No'}"`,
    `"${c.roomName}"`,
    `"${c.meetLink}"`,
    `"${c.currentEnrollment}/${c.maxParticipants}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `fukey-scheduled-classes-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
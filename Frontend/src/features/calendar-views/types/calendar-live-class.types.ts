export type CalendarClassStatus = 'live' | 'scheduled' | 'completed' | 'cancelled';

export type CalendarSubjectType = 'Mathematics' | 'Physics' | 'Chemistry' | 'Biology' | 'English' | string;

export interface CalendarTeacher {
  id: string;
  name: string;
  avatar: string;
  email: string;
  subject: string;
  phone: string;
  rating?: number;
}

export interface CalendarParticipant {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  reminderSubscribed: boolean;
  reminderChannels: ('email' | 'sms' | 'whatsapp')[];
  reminderSent: boolean;
  reminderSentAt?: string;
  attendanceStatus?: 'present' | 'absent' | 'registered';
}

export interface CalendarReminderLog {
  id: string;
  classId: string;
  classTitle: string;
  participantId: string;
  participantName: string;
  channel: 'email' | 'sms' | 'whatsapp';
  sentAt: string;
  triggerType: 'automated' | 'manual';
  status: 'delivered' | 'queued' | 'failed';
  message: string;
}

export interface CalendarAutomatedReminderConfig {
  enabled: boolean;
  offsetsMinutes: number[]; // e.g. [15, 60, 1440]
  channels: ('email' | 'sms' | 'whatsapp')[];
  customMessageTemplate: string;
  lastRunTimestamp?: string;
  autoSentCount: number;
}

export interface CalendarLiveClass {
  id: string;
  title: CalendarSubjectType;
  courseName: string;
  courseId: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm 24-hr or '3:00 PM'
  endTime: string;   // HH:mm 24-hr or '4:00 PM'
  formattedTimeRange: string; // e.g. '3:00 – 4:00 PM'
  durationMinutes: number;
  status: CalendarClassStatus;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'custom';
  meetLink: string;
  roomName: string;
  description: string;
  topics?: string[];
  maxParticipants: number;
  currentEnrollment: number;
  participants: CalendarParticipant[];
  automatedReminders: CalendarAutomatedReminderConfig;
  recordingUrl?: string;
  recordingDuration?: string;
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    cardBorderHover: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CalendarLiveClassesFilterState {
  searchQuery: string;
  teacherId: string;
  courseId: string;
  status: 'all' | CalendarClassStatus;
  dateRange: {
    start: string;
    end: string;
  };
}

export type CalendarViewMode = 'day' | 'week' | 'month' | 'list';

export interface CalendarWeeklyKPISummary {
  totalClasses: number;
  liveClasses: number;
  scheduledClasses: number;
  completedClasses: number;
  cancelledClasses: number;
  remindersSentToday: number;
  upcomingRemindersCount: number;
}
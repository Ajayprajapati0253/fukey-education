export type PlatformType = 'YouTube' | 'Jitsi';

export type ClassStatus = 'Live' | 'Upcoming' | 'Completed' | 'Cancelled';

export interface Instructor {
  id: string;
  name: string;
  avatar: string;
  specialty?: string;
  email?: string;
}

export interface RecurringSchedule {
  isRecurring: boolean;
  frequency: 'daily' | 'weekly' | 'weekdays' | 'custom';
  days: string[]; // ['Mon', 'Wed', 'Fri']
  startDate: string;
  endDate: string;
}

export interface LiveClass {
  id: string;
  index: number;
  title: string;
  category: string;
  instructor: Instructor;
  course: string;
  platform: PlatformType;
  meetingUrl: string;
  startTime: string; // e.g. "Aug 11, 2026 16:30"
  isoDateTime: string; // for calendar & sorting: "2026-08-11T16:30:00"
  duration: number; // in minutes
  status: ClassStatus;
  students: number;
  thumbnail: string;
  recurring?: RecurringSchedule;
  description?: string;
  recordingUrl?: string;
  maxCapacity?: number;
  materialsUrl?: string;
  chatMessages?: Array<{
    id: string;
    sender: string;
    avatar: string;
    text: string;
    time: string;
    isInstructor?: boolean;
  }>;
}

export interface FilterState {
  search: string;
  dateRange: string;
  platform: string;
  instructor: string;
  status: string;
  category: string;
  course: string;
  orderBy: string;
}
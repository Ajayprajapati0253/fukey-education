export type AttendanceStatus = 'Present' | 'Absent';

export interface ClassSession {
  id: string;
  classCourse: string;
  subject: string;
  chapter: string;
  scheduledTime: string;
  joinedTime?: string;
  leftTime?: string;
  durationMinutes: number;
  status: AttendanceStatus;
  reason: string;
}

export interface TeacherAttendanceRecord {
  id: string; // e.g. "TID-001"
  rowNumber: number;
  name: string;
  initials: string;
  avatarColor: string; // CSS or Tailwind color
  avatarUrl?: string;
  classCourse: string; // e.g. "Class 9"
  subject: string; // e.g. "English"
  chapter: string; // e.g. "Creative Writing & Reading Comprehension"
  scheduledTime: string; // e.g. "16:00"
  classDurationMinutes: number; // e.g. 45
  status: AttendanceStatus;
  reason: string; // e.g. "Completed 45 min"

  // Aggregated metrics for detail drawer
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  attendanceRate: number; // percentage, e.g. 75
  classHistory: ClassSession[];
}

export interface KPIStats {
  totalTeachers: number;
  totalTeachersTrend: number;
  presentToday: number;
  presentTodayTrend: number;
  absentToday: number;
  absentTodayTrend: number;
  attendanceRate: number;
  attendanceRateTrend: number;
  classesMissed: number;
  classesMissedTrend: number;
}

export interface AttendanceFilterState {
  searchQuery: string;
  dateRange: string;
  classCourse: string;
  subject: string;
  status: 'All' | 'Present' | 'Absent';
  reason: string;
  instructor: string;
}

export interface AttendanceRule {
  id: string;
  status: AttendanceStatus;
  condition: string;
  threshold: string;
  description: string;
}

export interface AttendanceSettings {
  minDurationMinutes: number;
  gracePeriodMinutes: number;
  autoMarkCancellation: boolean;
  autoMarkNoShow: boolean;
  notificationsEnabled: boolean;
}

/* ------------------------------------------------------------------ */
/*  Monthly calendar-grid view (Attendance > Monthly)                 */
/* ------------------------------------------------------------------ */

export type DayCellStatus = 'Present' | 'Absent' | 'NoClass';

export interface MonthlyGridDay {
  date: number; // day of month, e.g. 1..31
  weekday: string; // "Mon", "Tue", ...
  isoDate: string; // "2026-09-01"
  isFuture: boolean;
}

export interface MonthlyGridTeacherRow {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  statuses: DayCellStatus[]; // same length/order as MonthlyAttendanceGrid.days
}

export interface MonthlyAttendanceGrid {
  days: MonthlyGridDay[];
  teachers: MonthlyGridTeacherRow[];
}

/* ------------------------------------------------------------------ */
/*  Weekly calendar-grid view (Attendance > Weekly)                   */
/* ------------------------------------------------------------------ */
/*
 * Same shape as the Monthly grid, just scoped to 7 days (Mon-Sun) of the
 * currently selected week instead of a full calendar month.
 */

export type WeeklyGridDay = MonthlyGridDay;
export type WeeklyGridTeacherRow = MonthlyGridTeacherRow;
export type WeeklyAttendanceGrid = MonthlyAttendanceGrid;

/**
 * ADD THIS to your existing `features/attendance/types/index.ts`
 * (e.g. right after the WeeklyAttendanceGrid type alias at the bottom).
 * Nothing existing needs to change — this is purely additive.
 */

/* ------------------------------------------------------------------ */
/*  Edit / Delete Attendance (Daily, Weekly & Monthly views)          */
/* ------------------------------------------------------------------ */

/**
 * A generic, editable attendance record used by the shared
 * AttendanceEditModal — whether it originated from a class-wise
 * history row (`classHistory`) or from a calendar day cell
 * (Monthly / Weekly grid).
 */
export interface EditableAttendanceSession {
  teacherId: string;
  isoDate: string; // "2026-08-04"
  classCourse: string;
  subject: string;
  chapter: string;
  scheduledTime: string; // "14:00"
  joinedTime?: string; // "14:03"
  leftTime?: string; // "14:38"
  durationMinutes: number;
  status: DayCellStatus; // 'Present' | 'Absent' | 'NoClass'
  reason: string;
}

/** Internal shape the Edit modal is driven by (set from useAttendance). */
export interface AttendanceEditModalData {
  teacher: TeacherAttendanceRecord;
  data: EditableAttendanceSession;
  /** Present only when editing an existing `classHistory` row. */
  originalSessionId?: string;
}

/** Internal shape the Delete-confirm modal is driven by. */
export interface AttendanceDeleteModalData {
  teacherId: string;
  teacherName: string;
  isoDate?: string; // set when deleting a calendar-day record
  sessionId?: string; // set when deleting a classHistory row
}
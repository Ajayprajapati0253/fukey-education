import type {
  TeacherAttendanceRecord,
  KPIStats,
  AttendanceRule,
  AttendanceSettings,
  MonthlyAttendanceGrid,
  MonthlyGridDay,
  MonthlyGridTeacherRow,
  WeeklyAttendanceGrid,
  DayCellStatus,
} from '../types';

export const INITIAL_KPI_STATS: KPIStats = {
  totalTeachers: 12,
  totalTeachersTrend: 2,
  presentToday: 10,
  presentTodayTrend: 11,
  absentToday: 2,
  absentTodayTrend: -33,
  attendanceRate: 83.3,
  attendanceRateTrend: 5,
  classesMissed: 6,
  classesMissedTrend: -25,
};

export const ATTENDANCE_RULES: AttendanceRule[] = [
  {
    id: 'rule-present',
    status: 'Present',
    condition: 'Teacher completed 40 minutes or more of the scheduled class.',
    threshold: '40 min',
    description: 'Minimum required active session time with students.',
  },
  {
    id: 'rule-absent',
    status: 'Absent',
    condition: 'Teacher completed less than 40 minutes, did not join, or the class was cancelled.',
    threshold: '< 40 min',
    description: 'Automatic absent tag triggered by attendance automation engine.',
  },
];

export const DEFAULT_ATTENDANCE_SETTINGS: AttendanceSettings = {
  minDurationMinutes: 40,
  gracePeriodMinutes: 5,
  autoMarkCancellation: true,
  autoMarkNoShow: true,
  notificationsEnabled: true,
};

export const INITIAL_TEACHER_RECORDS: TeacherAttendanceRecord[] = [
  {
    id: 'TID-001',
    rowNumber: 1,
    name: 'Rahul Singh',
    initials: 'RS',
    avatarColor: 'bg-[#EAF0FE] text-[#2451D9] border-[#C7D7FB] dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    classCourse: 'Class 9',
    subject: 'English',
    chapter: 'Creative Writing & Reading Comprehension',
    scheduledTime: '16:00',
    classDurationMinutes: 45,
    status: 'Present',
    reason: 'Completed 45 min',
    totalClasses: 8,
    presentClasses: 6,
    absentClasses: 2,
    attendanceRate: 75,
    classHistory: [
      {
        id: 'cls-1',
        classCourse: 'Class 9',
        subject: 'English',
        chapter: 'Creative Writing & Reading',
        scheduledTime: '16:00',
        joinedTime: '16:02',
        leftTime: '16:47',
        durationMinutes: 45,
        status: 'Present',
        reason: 'Completed 45 min',
      },
      {
        id: 'cls-2',
        classCourse: 'Class 10',
        subject: 'English',
        chapter: 'Grammar',
        scheduledTime: '14:00',
        joinedTime: '14:03',
        leftTime: '14:38',
        durationMinutes: 35,
        status: 'Absent',
        reason: 'Below 40 min',
      },
      {
        id: 'cls-3',
        classCourse: 'Class 11',
        subject: 'English',
        chapter: 'Poetry',
        scheduledTime: '12:00',
        joinedTime: '12:05',
        leftTime: '12:48',
        durationMinutes: 43,
        status: 'Present',
        reason: 'Completed 40+ min',
      },
      {
        id: 'cls-4',
        classCourse: 'Class 12',
        subject: 'English',
        chapter: 'Essay Writing',
        scheduledTime: '10:00',
        durationMinutes: 0,
        status: 'Absent',
        reason: 'Did not join',
      },
    ],
  },
  {
    id: 'TID-002',
    rowNumber: 2,
    name: 'Yash Sharma',
    initials: 'YS',
    avatarColor: 'bg-[#F1EAFE] text-[#7C3AED] border-[#DCC9FB] dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30',
    classCourse: 'Class 11',
    subject: 'Maths',
    chapter: 'Quadratic Equations',
    scheduledTime: '16:00',
    classDurationMinutes: 32,
    status: 'Absent',
    reason: 'Below 40 min',
    totalClasses: 10,
    presentClasses: 7,
    absentClasses: 3,
    attendanceRate: 70,
    classHistory: [
      {
        id: 'ys-1',
        classCourse: 'Class 11',
        subject: 'Maths',
        chapter: 'Quadratic Equations',
        scheduledTime: '16:00',
        joinedTime: '16:05',
        leftTime: '16:37',
        durationMinutes: 32,
        status: 'Absent',
        reason: 'Below 40 min',
      },
      {
        id: 'ys-2',
        classCourse: 'Class 11',
        subject: 'Maths',
        chapter: 'Complex Numbers',
        scheduledTime: '11:00',
        joinedTime: '11:00',
        leftTime: '11:46',
        durationMinutes: 46,
        status: 'Present',
        reason: 'Completed 45 min',
      },
    ],
  },
//   {
//     id: 'TID-002',
//     rowNumber: 3,
//     name: 'Yash Sharma',
//     initials: 'YS',
//     avatarColor: 'bg-[#F1EAFE] text-[#7C3AED] border-[#DCC9FB] dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30',
//     classCourse: 'Class 12',
//     subject: 'Physics',
//     chapter: 'Current Electricity',
//     scheduledTime: '18:00',
//     classDurationMinutes: 0,
//     status: 'Absent',
//     reason: 'Did not join',
//     totalClasses: 10,
//     presentClasses: 7,
//     absentClasses: 3,
//     attendanceRate: 70,
//     classHistory: [
//       {
//         id: 'ys-3',
//         classCourse: 'Class 12',
//         subject: 'Physics',
//         chapter: 'Current Electricity',
//         scheduledTime: '18:00',
//         durationMinutes: 0,
//         status: 'Absent',
//         reason: 'Did not join',
//       },
//     ],
//   },
  {
    id: 'TID-003',
    rowNumber: 4,
    name: 'Pooja Singh',
    initials: 'PS',
    avatarColor: 'bg-pink-100 text-pink-600 border-pink-200 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/30',
    classCourse: 'Class 10',
    subject: 'Science',
    chapter: 'Chemical Reactions',
    scheduledTime: '17:00',
    classDurationMinutes: 0,
    status: 'Absent',
    reason: 'Class cancelled',
    totalClasses: 6,
    presentClasses: 5,
    absentClasses: 1,
    attendanceRate: 83.3,
    classHistory: [
      {
        id: 'ps-1',
        classCourse: 'Class 10',
        subject: 'Science',
        chapter: 'Chemical Reactions',
        scheduledTime: '17:00',
        durationMinutes: 0,
        status: 'Absent',
        reason: 'Class cancelled',
      },
      {
        id: 'ps-2',
        classCourse: 'Class 10',
        subject: 'Science',
        chapter: 'Acids, Bases & Salts',
        scheduledTime: '10:00',
        joinedTime: '09:59',
        leftTime: '10:48',
        durationMinutes: 49,
        status: 'Present',
        reason: 'Completed 45 min',
      },
    ],
  },
  {
    id: 'TID-004',
    rowNumber: 5,
    name: 'Amit Kumar',
    initials: 'AK',
    avatarColor: 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30',
    classCourse: 'Class 11',
    subject: 'Chemistry',
    chapter: 'Organic Chemistry',
    scheduledTime: '15:00',
    classDurationMinutes: 48,
    status: 'Present',
    reason: 'Completed 40+ min',
    totalClasses: 9,
    presentClasses: 8,
    absentClasses: 1,
    attendanceRate: 88.9,
    classHistory: [
      {
        id: 'ak-1',
        classCourse: 'Class 11',
        subject: 'Chemistry',
        chapter: 'Organic Chemistry',
        scheduledTime: '15:00',
        joinedTime: '15:01',
        leftTime: '15:49',
        durationMinutes: 48,
        status: 'Present',
        reason: 'Completed 40+ min',
      },
      {
        id: 'ak-2',
        classCourse: 'Class 12',
        subject: 'Chemistry',
        chapter: 'Solid State',
        scheduledTime: '12:00',
        joinedTime: '12:02',
        leftTime: '12:45',
        durationMinutes: 43,
        status: 'Present',
        reason: 'Completed 40+ min',
      },
    ],
  },
  {
    id: 'TID-005',
    rowNumber: 6,
    name: 'Neha Verma',
    initials: 'NV',
    avatarColor: 'bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30',
    classCourse: 'Class 9',
    subject: 'Hindi',
    chapter: 'Kavya Sahitya',
    scheduledTime: '14:00',
    classDurationMinutes: 37,
    status: 'Absent',
    reason: 'Below 40 min',
    totalClasses: 8,
    presentClasses: 6,
    absentClasses: 2,
    attendanceRate: 75,
    classHistory: [
      {
        id: 'nv-1',
        classCourse: 'Class 9',
        subject: 'Hindi',
        chapter: 'Kavya Sahitya',
        scheduledTime: '14:00',
        joinedTime: '14:04',
        leftTime: '14:41',
        durationMinutes: 37,
        status: 'Absent',
        reason: 'Below 40 min',
      },
    ],
  },
  {
    id: 'TID-006',
    rowNumber: 7,
    name: 'Sandeep Yadav',
    initials: 'SY',
    avatarColor: 'bg-cyan-100 text-cyan-600 border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30',
    classCourse: 'Class 12',
    subject: 'Biology',
    chapter: 'Human Reproduction',
    scheduledTime: '13:00',
    classDurationMinutes: 42,
    status: 'Present',
    reason: 'Completed 40+ min',
    totalClasses: 7,
    presentClasses: 7,
    absentClasses: 0,
    attendanceRate: 100,
    classHistory: [
      {
        id: 'sy-1',
        classCourse: 'Class 12',
        subject: 'Biology',
        chapter: 'Human Reproduction',
        scheduledTime: '13:00',
        joinedTime: '13:01',
        leftTime: '13:43',
        durationMinutes: 42,
        status: 'Present',
        reason: 'Completed 40+ min',
      },
    ],
  },
  {
    id: 'TID-007',
    rowNumber: 8,
    name: 'Priya Patel',
    initials: 'PP',
    avatarColor: 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
    classCourse: 'Class 10',
    subject: 'Maths',
    chapter: 'Linear Equations',
    scheduledTime: '12:00',
    classDurationMinutes: 50,
    status: 'Present',
    reason: 'Completed 40+ min',
    totalClasses: 11,
    presentClasses: 10,
    absentClasses: 1,
    attendanceRate: 90.9,
    classHistory: [
      {
        id: 'pp-1',
        classCourse: 'Class 10',
        subject: 'Maths',
        chapter: 'Linear Equations',
        scheduledTime: '12:00',
        joinedTime: '12:00',
        leftTime: '12:50',
        durationMinutes: 50,
        status: 'Present',
        reason: 'Completed 40+ min',
      },
    ],
  },
  {
    id: 'TID-008',
    rowNumber: 9,
    name: 'Vikash Kumar',
    initials: 'VK',
    avatarColor: 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
    classCourse: 'Class 9',
    subject: 'Social Science',
    chapter: 'The Rise of Nationalism',
    scheduledTime: '11:00',
    classDurationMinutes: 0,
    status: 'Absent',
    reason: 'Did not join',
    totalClasses: 7,
    presentClasses: 4,
    absentClasses: 3,
    attendanceRate: 57.1,
    classHistory: [
      {
        id: 'vk-1',
        classCourse: 'Class 9',
        subject: 'Social Science',
        chapter: 'The Rise of Nationalism',
        scheduledTime: '11:00',
        durationMinutes: 0,
        status: 'Absent',
        reason: 'Did not join',
      },
    ],
  },
  {
    id: 'TID-009',
    rowNumber: 10,
    name: 'Anjali Sharma',
    initials: 'AS',
    avatarColor: 'bg-fuchsia-100 text-fuchsia-600 border-fuchsia-200 dark:bg-fuchsia-500/20 dark:text-fuchsia-300 dark:border-fuchsia-500/30',
    classCourse: 'Class 11',
    subject: 'English',
    chapter: 'Poetry',
    scheduledTime: '10:00',
    classDurationMinutes: 36,
    status: 'Absent',
    reason: 'Below 40 min',
    totalClasses: 8,
    presentClasses: 6,
    absentClasses: 2,
    attendanceRate: 75,
    classHistory: [
      {
        id: 'as-1',
        classCourse: 'Class 11',
        subject: 'English',
        chapter: 'Poetry',
        scheduledTime: '10:00',
        joinedTime: '10:02',
        leftTime: '10:38',
        durationMinutes: 36,
        status: 'Absent',
        reason: 'Below 40 min',
      },
    ],
  },
  {
    id: 'TID-010',
    rowNumber: 11,
    name: 'Rajesh Gupta',
    initials: 'RG',
    avatarColor: 'bg-teal-100 text-teal-600 border-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30',
    classCourse: 'Class 10',
    subject: 'English',
    chapter: 'First Flight Prose Analysis',
    scheduledTime: '09:00',
    classDurationMinutes: 46,
    status: 'Present',
    reason: 'Completed 45 min',
    totalClasses: 9,
    presentClasses: 8,
    absentClasses: 1,
    attendanceRate: 88.9,
    classHistory: [
      {
        id: 'rg-1',
        classCourse: 'Class 10',
        subject: 'English',
        chapter: 'First Flight Prose Analysis',
        scheduledTime: '09:00',
        joinedTime: '09:01',
        leftTime: '09:47',
        durationMinutes: 46,
        status: 'Present',
        reason: 'Completed 45 min',
      },
    ],
  },
  {
    id: 'TID-011',
    rowNumber: 12,
    name: 'Meera Iyer',
    initials: 'MI',
    avatarColor: 'bg-sky-100 text-sky-600 border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30',
    classCourse: 'Class 12',
    subject: 'Chemistry',
    chapter: 'Electrochemistry & Solutions',
    scheduledTime: '11:30',
    classDurationMinutes: 44,
    status: 'Present',
    reason: 'Completed 40+ min',
    totalClasses: 12,
    presentClasses: 11,
    absentClasses: 1,
    attendanceRate: 91.7,
    classHistory: [
      {
        id: 'mi-1',
        classCourse: 'Class 12',
        subject: 'Chemistry',
        chapter: 'Electrochemistry & Solutions',
        scheduledTime: '11:30',
        joinedTime: '11:31',
        leftTime: '12:15',
        durationMinutes: 44,
        status: 'Present',
        reason: 'Completed 40+ min',
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Calendar-grid generators (Monthly + Weekly)                       */
/* ------------------------------------------------------------------ */
/*
 * There is no day-by-day attendance log in the underlying data model
 * yet (classHistory only stores a handful of recent sessions, with no
 * date). Until a real per-day attendance table exists on the backend,
 * this deterministically derives a Present / Absent / No-Class value
 * for every teacher x day cell so the Monthly/Weekly grid views have
 * stable, realistic-looking data (same teacher + same day always
 * produces the same result — it will not "flicker" between renders).
 *
 * Replace the body of these functions with real API calls once daily
 * attendance records are available on the backend.
 */

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildTeacherStatusesForDates(
  teacher: TeacherAttendanceRecord,
  dates: Date[],
  todayMidnight: Date
): DayCellStatus[] {
  // Each teacher gets one stable "weekly off" day derived from their id.
  const weeklyOffDay = hashString(teacher.id) % 7;

  return dates.map((dateObj) => {
    if (dateObj.getTime() > todayMidnight.getTime()) return 'NoClass';
    if (dateObj.getDay() === weeklyOffDay) return 'NoClass';

    const seed = hashString(`${teacher.id}-${toIsoDate(dateObj)}`);
    if (seed % 6 === 0) return 'Absent';
    return 'Present';
  });
}

function uniqueTeacherRecords(records: TeacherAttendanceRecord[]): TeacherAttendanceRecord[] {
  const seenIds = new Set<string>();
  return records.filter((record) => {
    if (seenIds.has(record.id)) return false;
    seenIds.add(record.id);
    return true;
  });
}

export function generateMonthlyAttendanceGrid(
  records: TeacherAttendanceRecord[],
  year: number,
  month: number, // 0-indexed, like Date.getMonth()
  today: Date = new Date()
): MonthlyAttendanceGrid {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const dateObjs: Date[] = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

  const days: MonthlyGridDay[] = dateObjs.map((dateObj) => ({
    date: dateObj.getDate(),
    weekday: WEEKDAY_NAMES[dateObj.getDay()],
    isoDate: toIsoDate(dateObj),
    isFuture: dateObj.getTime() > todayMidnight.getTime(),
  }));

  const uniqueTeachers = uniqueTeacherRecords(records);

  const teachers: MonthlyGridTeacherRow[] = uniqueTeachers.map((teacher) => ({
    id: teacher.id,
    name: teacher.name,
    initials: teacher.initials,
    avatarColor: teacher.avatarColor,
    statuses: buildTeacherStatusesForDates(teacher, dateObjs, todayMidnight),
  }));

  return { days, teachers };
}

/**
 * Builds a 7-day (Mon-Sun) attendance grid for the week containing
 * `weekStart`. Pass the Monday of the target week — the same value the
 * Daily/Weekly period navigation in `useAttendance` already computes.
 */
export function generateWeeklyAttendanceGrid(
  records: TeacherAttendanceRecord[],
  weekStart: Date,
  today: Date = new Date()
): WeeklyAttendanceGrid {
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const dateObjs: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const days: MonthlyGridDay[] = dateObjs.map((dateObj) => ({
    date: dateObj.getDate(),
    weekday: WEEKDAY_NAMES[dateObj.getDay()],
    isoDate: toIsoDate(dateObj),
    isFuture: dateObj.getTime() > todayMidnight.getTime(),
  }));

  const uniqueTeachers = uniqueTeacherRecords(records);

  const teachers: MonthlyGridTeacherRow[] = uniqueTeachers.map((teacher) => ({
    id: teacher.id,
    name: teacher.name,
    initials: teacher.initials,
    avatarColor: teacher.avatarColor,
    statuses: buildTeacherStatusesForDates(teacher, dateObjs, todayMidnight),
  }));

  return { days, teachers };
}
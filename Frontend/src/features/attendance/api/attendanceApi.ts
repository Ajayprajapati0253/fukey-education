import type {
  TeacherAttendanceRecord,
  KPIStats,
  AttendanceFilterState,
  AttendanceSettings
} from '../types';
import {
  INITIAL_TEACHER_RECORDS,
  INITIAL_KPI_STATS,
  DEFAULT_ATTENDANCE_SETTINGS
} from '../data/attendanceData';

let currentRecords = [...INITIAL_TEACHER_RECORDS];
let currentSettings = { ...DEFAULT_ATTENDANCE_SETTINGS };

export const attendanceApi = {
  async getRecords(filters?: Partial<AttendanceFilterState>): Promise<{
    records: TeacherAttendanceRecord[];
    total: number;
    kpiStats: KPIStats;
  }> {
    // Simulate lightweight network delay for realistic responsiveness
    await new Promise((resolve) => setTimeout(resolve, 60));

    let filtered = [...currentRecords];

    if (filters) {
      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        const query = filters.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (r) =>
            r.name.toLowerCase().includes(query) ||
            r.subject.toLowerCase().includes(query) ||
            r.chapter.toLowerCase().includes(query) ||
            r.classCourse.toLowerCase().includes(query)
        );
      }

      if (filters.classCourse && filters.classCourse !== 'All Classes' && filters.classCourse !== 'Class / Course: All Classes') {
        filtered = filtered.filter((r) => r.classCourse === filters.classCourse);
      }

      if (filters.subject && filters.subject !== 'All Subjects' && filters.subject !== 'Subject: All Subjects') {
        filtered = filtered.filter((r) => r.subject.toLowerCase() === filters.subject!.toLowerCase());
      }

      if (filters.status && filters.status !== 'All') {
        filtered = filtered.filter((r) => r.status === filters.status);
      }

      if (filters.reason && filters.reason !== 'All Reasons') {
        filtered = filtered.filter((r) => r.reason.toLowerCase() === filters.reason!.toLowerCase());
      }

      if (filters.instructor && filters.instructor !== 'All Instructors') {
        filtered = filtered.filter((r) => r.name.toLowerCase() === filters.instructor!.toLowerCase());
      }
    }

    // Dynamic KPI recalculation based on records
    const presentCount = filtered.filter((r) => r.status === 'Present').length;
    const absentCount = filtered.filter((r) => r.status === 'Absent').length;
    const rate = filtered.length > 0 ? ((presentCount / filtered.length) * 100).toFixed(1) : '0';

    const kpiStats: KPIStats = {
      ...INITIAL_KPI_STATS,
      totalTeachers: 12,
      presentToday: presentCount,
      absentToday: absentCount,
      attendanceRate: parseFloat(rate),
      classesMissed: absentCount * 3, // simulated calculation
    };

    return {
      records: filtered,
      total: filtered.length,
      kpiStats,
    };
  },

  async getTeacherById(id: string): Promise<TeacherAttendanceRecord | null> {
    await new Promise((resolve) => setTimeout(resolve, 40));
    return currentRecords.find((r) => r.id === id) || null;
  },

  async getSettings(): Promise<AttendanceSettings> {
    await new Promise((resolve) => setTimeout(resolve, 30));
    return { ...currentSettings };
  },

  async updateSettings(newSettings: AttendanceSettings): Promise<AttendanceSettings> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    currentSettings = { ...newSettings };

    // Recalculate status based on new threshold
    currentRecords = currentRecords.map((record) => {
      const isPresent = record.classDurationMinutes >= newSettings.minDurationMinutes;
      return {
        ...record,
        status: isPresent ? 'Present' : 'Absent',
        reason:
          record.classDurationMinutes === 0
            ? record.reason.includes('cancelled')
              ? 'Class cancelled'
              : 'Did not join'
            : isPresent
            ? `Completed ${newSettings.minDurationMinutes}+ min`
            : `Below ${newSettings.minDurationMinutes} min`,
      };
    });

    return { ...currentSettings };
  },

  async exportReport(format: 'csv' | 'json', records: TeacherAttendanceRecord[]): Promise<string> {
    if (format === 'json') {
      return JSON.stringify(records, null, 2);
    }

    // CSV generation
    const headers = ['#', 'Teacher ID', 'Teacher Name', 'Class', 'Subject', 'Chapter', 'Scheduled Time', 'Duration (min)', 'Status', 'Reason'];
    const rows = records.map((r, idx) => [
      idx + 1,
      r.id,
      `"${r.name}"`,
      r.classCourse,
      r.subject,
      `"${r.chapter}"`,
      r.scheduledTime,
      r.classDurationMinutes,
      r.status,
      `"${r.reason}"`,
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  },
};
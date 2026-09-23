import type {
  TeacherAttendanceRecord,
  DayCellStatus,
  EditableAttendanceSession,
  MonthlyAttendanceGrid,
} from '../types';

/*
 * There is no per-day attendance log on the backend yet (see the note
 * in `attendanceData.ts`). When the user clicks a calendar cell we need
 * *some* plausible, stable set of default values (chapter, joined/left
 * time, duration, reason) to pre-fill the Edit Attendance modal with.
 * This deterministically derives those defaults from the teacher + date,
 * exactly the same way `generateMonthlyAttendanceGrid` derives the
 * Present/Absent/NoClass status shown in the cell.
 *
 * Replace with a real "get attendance session by teacher+date" API call
 * once one exists on the backend.
 */

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function buildEditableSessionForDay(
  teacher: TeacherAttendanceRecord,
  isoDate: string,
  status?: DayCellStatus
): EditableAttendanceSession {
  const resolvedStatus: DayCellStatus = status ?? (teacher.status as DayCellStatus);
  const seed = hashString(`${teacher.id}-${isoDate}`);
  const scheduledTime = teacher.scheduledTime || '10:00';
  const [schedH, schedM] = scheduledTime.split(':').map(Number);

  let joinedTime: string | undefined;
  let leftTime: string | undefined;
  let durationMinutes = 0;
  let reason = teacher.reason;

  if (resolvedStatus === 'Present') {
    durationMinutes = 40 + (seed % 15); // 40-54 min
    const joinOffset = seed % 3; // 0-2 min late
    const joinTotal = schedH * 60 + schedM + joinOffset;
    joinedTime = `${pad(Math.floor(joinTotal / 60))}:${pad(joinTotal % 60)}`;
    const leaveTotal = joinTotal + durationMinutes;
    leftTime = `${pad(Math.floor(leaveTotal / 60))}:${pad(leaveTotal % 60)}`;
    reason = `Completed ${durationMinutes} min`;
  } else if (resolvedStatus === 'Absent') {
    const didNotJoin = seed % 2 === 0;
    durationMinutes = didNotJoin ? 0 : 15 + (seed % 20);
    reason = didNotJoin ? 'Did not join' : 'Below 40 min';
  } else {
    reason = 'No class scheduled';
  }

  return {
    teacherId: teacher.id,
    isoDate,
    classCourse: teacher.classCourse,
    subject: teacher.subject,
    chapter: teacher.chapter,
    scheduledTime,
    joinedTime,
    leftTime,
    durationMinutes,
    status: resolvedStatus,
    reason,
  };
}

/** Key used in the `dayOverrides` map kept by `useAttendance`. */
export function dayOverrideKey(teacherId: string, isoDate: string): string {
  return `${teacherId}|${isoDate}`;
}

/**
 * Re-applies any locally-saved edits/deletes (`dayOverrides`) on top of a
 * freshly generated Monthly/Weekly grid, so Edit/Delete changes made by
 * the admin are reflected immediately without needing a backend.
 */
export function applyDayOverrides(
  grid: MonthlyAttendanceGrid,
  overrides: Record<string, EditableAttendanceSession>
): MonthlyAttendanceGrid {
  if (Object.keys(overrides).length === 0) return grid;

  return {
    days: grid.days,
    teachers: grid.teachers.map((teacher) => ({
      ...teacher,
      statuses: teacher.statuses.map((status, idx) => {
        const day = grid.days[idx];
        const override = day ? overrides[dayOverrideKey(teacher.id, day.isoDate)] : undefined;
        return override ? override.status : status;
      }),
    })),
  };
}
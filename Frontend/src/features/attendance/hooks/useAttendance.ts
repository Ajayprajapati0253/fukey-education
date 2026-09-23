import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  TeacherAttendanceRecord,
  KPIStats,
  AttendanceFilterState,
  AttendanceSettings,
  MonthlyAttendanceGrid,
  WeeklyAttendanceGrid,
  DayCellStatus,
  ClassSession,
  EditableAttendanceSession,
  AttendanceEditModalData,
  AttendanceDeleteModalData,
} from '../types';
import { attendanceApi } from '../api/attendanceApi';
import {
  INITIAL_KPI_STATS,
  DEFAULT_ATTENDANCE_SETTINGS,
  generateMonthlyAttendanceGrid,
  generateWeeklyAttendanceGrid,
} from '../data/attendanceData';
import { buildEditableSessionForDay, applyDayOverrides, dayOverrideKey } from '../data/attendanceEditHelpers';

const INITIAL_FILTERS: AttendanceFilterState = {
  searchQuery: '',
  dateRange: '01 Sep 2026 - 30 Sep 2026',
  classCourse: 'Class / Course: All Classes',
  subject: 'Subject: All Subjects',
  status: 'All',
  reason: 'All Reasons',
  instructor: 'All Instructors',
};

type AttendanceFrequency = 'Daily' | 'Weekly' | 'Monthly';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun ... 6 = Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return d;
}

function formatShort(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function formatShortWithYear(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function useAttendance() {
  const [records, setRecords] = useState<TeacherAttendanceRecord[]>([]);
  const [kpiStats, setKpiStats] = useState<KPIStats>(INITIAL_KPI_STATS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('TID-001');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  // Frequency & Date View
  const [activeFrequency, setActiveFrequency] = useState<AttendanceFrequency>('Daily');
  const [currentMonth, setCurrentMonth] = useState<string>('September 2026');

  // Frequency-aware date cursor that drives the Daily / Weekly / Monthly
  // navigation control above the attendance table (kept separate from
  // `currentMonth`, which the detail drawer already relies on).
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 22));

  // Calendar-grid (Monthly / Weekly) selected day column
  const [selectedGridDate, setSelectedGridDate] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<AttendanceFilterState>(INITIAL_FILTERS);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [settings, setSettings] = useState<AttendanceSettings>(DEFAULT_ATTENDANCE_SETTINGS);

  // Edit Attendance modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editModalData, setEditModalData] = useState<AttendanceEditModalData | null>(null);

  // Delete Attendance confirm modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deleteModalData, setDeleteModalData] = useState<AttendanceDeleteModalData | null>(null);

  // Locally-saved edits/deletes made from the Monthly/Weekly calendar cells,
  // keyed by "teacherId|isoDate". Applied on top of the generated grid data
  // until a real per-day attendance API exists on the backend.
  const [dayOverrides, setDayOverrides] = useState<Record<string, EditableAttendanceSession>>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Rules accordion in drawer
  const [isRulesExpanded, setIsRulesExpanded] = useState<boolean>(true);

  // Fetch records
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await attendanceApi.getRecords(filters);
      setRecords(response.records);
      setKpiStats(response.kpiStats);

      // Ensure selected teacher exists in view or default
      if (response.records.length > 0) {
        const exists = response.records.some((r) => r.id === selectedTeacherId);
        if (!exists) {
          setSelectedTeacherId(response.records[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load attendance records:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, selectedTeacherId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load settings once
  useEffect(() => {
    attendanceApi.getSettings().then(setSettings);
  }, []);

  // Filter Handlers
  const handleFilterChange = (field: keyof AttendanceFilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalItems = records.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return records.slice(start, start + itemsPerPage);
  }, [records, currentPage, itemsPerPage]);

  // Selected teacher object
  const selectedTeacher = useMemo(() => {
    return records.find((r) => r.id === selectedTeacherId) || records[0] || null;
  }, [records, selectedTeacherId]);

  // Settings Save
  const handleSaveSettings = async (newSettings: AttendanceSettings) => {
    try {
      const updated = await attendanceApi.updateSettings(newSettings);
      setSettings(updated);
      setIsSettingsOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  // Export File
  const handleExport = async (format: 'csv' | 'json') => {
    const fileContent = await attendanceApi.exportReport(format, records);
    const blob = new Blob([fileContent], { type: format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `teacher-attendance-report-${new Date().toISOString().split('T')[0]}.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
  };

  // Month navigation (kept as-is — used by the detail drawer)
  const handlePrevMonth = () => {
    if (currentMonth.includes('September')) setCurrentMonth('August 2026');
    else if (currentMonth.includes('August')) setCurrentMonth('July 2026');
    else setCurrentMonth('September 2026');
  };

  const handleNextMonth = () => {
    if (currentMonth.includes('August')) setCurrentMonth('September 2026');
    else if (currentMonth.includes('September')) setCurrentMonth('October 2026');
    else setCurrentMonth('September 2026');
  };

  /* ------------------------------------------------------------------ */
  /*  Frequency-aware date navigation for the attendance table header   */
  /* ------------------------------------------------------------------ */

  const periodLabel = useMemo(() => {
    if (activeFrequency === 'Daily') {
      return formatShortWithYear(currentDate);
    }
    if (activeFrequency === 'Weekly') {
      const start = getWeekStart(currentDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${formatShort(start)} - ${formatShortWithYear(end)}`;
    }
    return currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }, [activeFrequency, currentDate]);

  const handlePrevPeriod = useCallback(() => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (activeFrequency === 'Daily') next.setDate(next.getDate() - 1);
      else if (activeFrequency === 'Weekly') next.setDate(next.getDate() - 7);
      else next.setMonth(next.getMonth() - 1);
      return next;
    });
  }, [activeFrequency]);

  const handleNextPeriod = useCallback(() => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (activeFrequency === 'Daily') next.setDate(next.getDate() + 1);
      else if (activeFrequency === 'Weekly') next.setDate(next.getDate() + 7);
      else next.setMonth(next.getMonth() + 1);
      return next;
    });
  }, [activeFrequency]);

  const handleDateInputChange = useCallback((isoDateStr: string) => {
    if (!isoDateStr) return;
    const [y, m, d] = isoDateStr.split('-').map(Number);
    if (!y || !m || !d) return;
    setCurrentDate(new Date(y, m - 1, d));
  }, []);

  const selectedDateIso = useMemo(() => toIsoDate(currentDate), [currentDate]);

  // Reset the highlighted grid column whenever the visible period changes,
  // so a stale highlight from last month/week doesn't carry over.
  useEffect(() => {
    setSelectedGridDate(null);
  }, [activeFrequency, currentDate]);

  const handleSelectGridDate = useCallback((isoDate: string) => {
    setSelectedGridDate((prev) => (isoDate === prev ? null : isoDate || null));
  }, []);

  // Monthly calendar-grid data (teacher rows x day columns, full month),
  // with any locally-saved edits/deletes re-applied.
  const monthlyGrid: MonthlyAttendanceGrid = useMemo(() => {
    const base = generateMonthlyAttendanceGrid(records, currentDate.getFullYear(), currentDate.getMonth());
    return applyDayOverrides(base, dayOverrides);
  }, [records, currentDate, dayOverrides]);

  // Weekly calendar-grid data (teacher rows x 7 day columns, Mon-Sun of
  // the currently selected week), with overrides re-applied.
  const weeklyGrid: WeeklyAttendanceGrid = useMemo(() => {
    const base = generateWeeklyAttendanceGrid(records, getWeekStart(currentDate));
    return applyDayOverrides(base, dayOverrides);
  }, [records, currentDate, dayOverrides]);

  /* ------------------------------------------------------------------ */
  /*  Edit / Delete Attendance                                          */
  /* ------------------------------------------------------------------ */

  /** Opens the Edit modal for a specific teacher x day cell (Monthly/Weekly grid click). */
  const handleGridCellClick = useCallback(
    (teacherId: string, isoDate: string, status: DayCellStatus) => {
      const teacher = records.find((r) => r.id === teacherId);
      if (!teacher) return;

      setSelectedTeacherId(teacherId);
      if (!isDrawerOpen) setIsDrawerOpen(true);

      const key = dayOverrideKey(teacherId, isoDate);
      const existingOverride = dayOverrides[key];
      const data = existingOverride ?? buildEditableSessionForDay(teacher, isoDate, status);

      setEditModalData({ teacher, data });
      setIsEditModalOpen(true);
    },
    [records, dayOverrides, isDrawerOpen]
  );

  /** Opens the Edit modal directly from a Daily-table row's Actions (eye) button. */
  const handleOpenEditForDailyRecord = useCallback(
    (record: TeacherAttendanceRecord) => {
      setSelectedTeacherId(record.id);
      if (!isDrawerOpen) setIsDrawerOpen(true);

      const isoDate = selectedDateIso;
      const key = dayOverrideKey(record.id, isoDate);
      const existingOverride = dayOverrides[key];
      const data = existingOverride ?? buildEditableSessionForDay(record, isoDate, record.status as DayCellStatus);

      setEditModalData({ teacher: record, data });
      setIsEditModalOpen(true);
    },
    [selectedDateIso, dayOverrides, isDrawerOpen]
  );

  /** Opens the Edit modal from the drawer's "Edit Attendance" button, for the currently selected teacher + period date. */
  const handleOpenEditForSelectedTeacher = useCallback(() => {
    if (!selectedTeacher) return;
    const isoDate = selectedDateIso;
    const key = dayOverrideKey(selectedTeacher.id, isoDate);
    const existingOverride = dayOverrides[key];
    const data = existingOverride ?? buildEditableSessionForDay(selectedTeacher, isoDate, selectedTeacher.status as DayCellStatus);

    setEditModalData({ teacher: selectedTeacher, data });
    setIsEditModalOpen(true);
  }, [selectedTeacher, selectedDateIso, dayOverrides]);

  /** Opens the Edit modal for a specific row inside the drawer's "Class-wise Attendance" table. */
  const handleOpenEditForSession = useCallback(
    (session: ClassSession) => {
      if (!selectedTeacher) return;
      const data: EditableAttendanceSession = {
        teacherId: selectedTeacher.id,
        isoDate: selectedDateIso,
        classCourse: session.classCourse,
        subject: session.subject,
        chapter: session.chapter,
        scheduledTime: session.scheduledTime,
        joinedTime: session.joinedTime,
        leftTime: session.leftTime,
        durationMinutes: session.durationMinutes,
        status: session.status,
        reason: session.reason,
      };
      setEditModalData({ teacher: selectedTeacher, data, originalSessionId: session.id });
      setIsEditModalOpen(true);
    },
    [selectedTeacher, selectedDateIso]
  );

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditModalData(null);
  }, []);

  const handleSaveEdit = useCallback(
    (updated: EditableAttendanceSession, originalSessionId?: string) => {
      if (!editModalData) return;
      const teacherId = editModalData.teacher.id;

      if (originalSessionId) {
        // Patch an existing classHistory row
        setRecords((prev) =>
          prev.map((r) => {
            if (r.id !== teacherId) return r;
            return {
              ...r,
              classHistory: r.classHistory.map((cls) =>
                cls.id === originalSessionId
                  ? {
                      ...cls,
                      classCourse: updated.classCourse,
                      subject: updated.subject,
                      chapter: updated.chapter,
                      scheduledTime: updated.scheduledTime,
                      joinedTime: updated.joinedTime,
                      leftTime: updated.leftTime,
                      durationMinutes: updated.durationMinutes,
                      status: updated.status === 'NoClass' ? 'Absent' : updated.status,
                      reason: updated.reason,
                    }
                  : cls
              ),
            };
          })
        );
      } else {
        // Save as a calendar-day override (Monthly/Weekly grid cell, or the drawer's Edit button)
        setDayOverrides((prev) => ({
          ...prev,
          [dayOverrideKey(teacherId, updated.isoDate)]: updated,
        }));
      }

      closeEditModal();
    },
    [editModalData, closeEditModal]
  );

  /** Moves straight from the Edit modal into the Delete-confirm modal. */
  const handleRequestDeleteFromEditModal = useCallback(() => {
    if (!editModalData) return;
    const { teacher, data, originalSessionId } = editModalData;

    setDeleteModalData({
      teacherId: teacher.id,
      teacherName: teacher.name,
      isoDate: originalSessionId ? undefined : data.isoDate,
      sessionId: originalSessionId,
    });
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(true);
  }, [editModalData]);

  /** Opens the Delete-confirm modal directly from a Daily-table row's trash icon. */
  const handleOpenDeleteForDailyRecord = useCallback((record: TeacherAttendanceRecord) => {
    setDeleteModalData({
      teacherId: record.id,
      teacherName: record.name,
      isoDate: selectedDateIso,
    });
    setIsDeleteModalOpen(true);
  }, [selectedDateIso]);

  /** Opens the Delete-confirm modal directly from a class-wise table row's trash icon. */
  const handleOpenDeleteForSession = useCallback(
    (session: ClassSession) => {
      if (!selectedTeacher) return;
      setDeleteModalData({
        teacherId: selectedTeacher.id,
        teacherName: selectedTeacher.name,
        sessionId: session.id,
      });
      setIsDeleteModalOpen(true);
    },
    [selectedTeacher]
  );

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setDeleteModalData(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteModalData) return;

    if (deleteModalData.sessionId) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === deleteModalData.teacherId
            ? { ...r, classHistory: r.classHistory.filter((cls) => cls.id !== deleteModalData.sessionId) }
            : r
        )
      );
    } else if (deleteModalData.isoDate) {
      setDayOverrides((prev) => ({
        ...prev,
        [dayOverrideKey(deleteModalData.teacherId, deleteModalData.isoDate!)]: {
          teacherId: deleteModalData.teacherId,
          isoDate: deleteModalData.isoDate!,
          classCourse: '',
          subject: '',
          chapter: '',
          scheduledTime: '',
          durationMinutes: 0,
          status: 'NoClass',
          reason: 'Deleted',
        },
      }));
    }

    closeDeleteModal();
  }, [deleteModalData, closeDeleteModal]);

  return {
    records,
    paginatedRecords,
    kpiStats,
    isLoading,
    selectedTeacher,
    selectedTeacherId,
    setSelectedTeacherId,
    isDrawerOpen,
    setIsDrawerOpen,
    activeFrequency,
    setActiveFrequency,
    currentMonth,
    handlePrevMonth,
    handleNextMonth,

    // Frequency-aware date navigation (Daily / Weekly / Monthly)
    currentDate,
    periodLabel,
    selectedDateIso,
    handlePrevPeriod,
    handleNextPeriod,
    handleDateInputChange,
    monthlyGrid,
    weeklyGrid,

    // Calendar-grid day selection
    selectedGridDate,
    handleSelectGridDate,

    filters,
    handleFilterChange,
    handleResetFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    isSettingsOpen,
    setIsSettingsOpen,
    isExportOpen,
    setIsExportOpen,
    settings,
    handleSaveSettings,
    handleExport,
    isRulesExpanded,
    setIsRulesExpanded,
    loadData,

    // Edit / Delete Attendance
    isEditModalOpen,
    editModalData,
    handleGridCellClick,
    handleOpenEditForDailyRecord,
    handleOpenEditForSelectedTeacher,
    handleOpenEditForSession,
    closeEditModal,
    handleSaveEdit,
    handleRequestDeleteFromEditModal,

    isDeleteModalOpen,
    deleteModalData,
    handleOpenDeleteForSession,
    handleOpenDeleteForDailyRecord,
    closeDeleteModal,
    handleConfirmDelete,
  };
}
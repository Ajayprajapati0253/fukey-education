import React, { useState, useMemo } from 'react';
import { Users, Plus, Download } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useStudents } from '../hooks/useStudents';
import { StudentStatsGrid } from '../components/StudentStatsGrid';
import { StudentFilterBar } from '../components/StudentFilterBar';
import { StudentTable } from '../components/StudentTable';
import { StudentTablePagination } from '../components/StudentTablePagination';
import { StudentQuickInsights } from '../components/StudentQuickInsights';
import { StudentAccessChart } from '../components/StudentAccessChart';
import { StudentBulkActions } from '../components/StudentBulkActions';
import { AddStudentModal } from '../components/AddStudentModal';
import { ExtendAccessModal } from '../components/ExtendAccessModal';
import { SendEmailModal } from '../components/SendEmailModal';
import { ViewStudentModal } from '../components/ViewStudentModal';
import type { Student, KpiFilterKey, QuickInsightFilterKey, StudentFilterOptions } from '../types';

export const AllStudentsPage: React.FC = () => {
  const {
    students,
    deleteStudent,
    extendAccess,
    createStudent,
  } = useStudents();

  // KPI Filter State
  const [selectedKpi, setSelectedKpi] = useState<KpiFilterKey>(null);

  // Quick Insight Filter State
  const [selectedInsight, setSelectedInsight] = useState<QuickInsightFilterKey>(null);

  // Form / Container Filters State
  const [activeFilters, setActiveFilters] = useState<StudentFilterOptions>({
    search: '',
    course: 'All Courses',
    status: 'All Status',
    accessPeriod: 'All Access Period',
    progress: 'All Progress',
    joinedDate: '',
  });

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [extendStudent, setExtendStudent] = useState<Student | null>(null);
  const [emailStudent, setEmailStudent] = useState<Student | null>(null);
  const [isBulkExtendOpen, setIsBulkExtendOpen] = useState(false);
  const [isBulkEmailOpen, setIsBulkEmailOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Mock values as explicitly requested:
  // Total Students: 10
  // Active Students: 6
  // Expired Access: 1
  // New Enrollments: 3
  const kpiStats = useMemo(() => {
    const total = students.length || 10;
    const active = students.filter((s) => s.kpiType === 'active').length || 6;
    const expired = students.filter((s) => s.kpiType === 'expired' || s.status === 'Expired').length || 1;
    const newEnrolled = students.filter((s) => s.kpiType === 'new' || s.isNewEnrollment).length || 3;
    return {
      total,
      active,
      expired,
      newEnrolled,
    };
  }, [students]);

  // Derived filtered students:
  // Combines selected KPI with Search, All Courses, All Status, All Access Period, Joined Date
  // Original student data is never overwritten.
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // 1. KPI Filter
      if (selectedKpi === 'total') {
        // Show all 10 students
      } else if (selectedKpi === 'active') {
        // Show 6 active students
        if (student.kpiType !== 'active') return false;
      } else if (selectedKpi === 'expired') {
        // Show 1 expired student
        if (student.kpiType !== 'expired' && student.status !== 'Expired') return false;
      } else if (selectedKpi === 'new') {
        // Show 3 newly enrolled students
        if (student.kpiType !== 'new' && !student.isNewEnrollment) return false;
      }

      // Quick Insights Filter
      if (selectedInsight === 'most_enrolled') {
        const isMostEnrolled =
          student.primaryCourse === 'Class 10th (All Subjects)' ||
          student.courses.some((c) => c.name === 'Class 10th (All Subjects)');
        if (!isMostEnrolled) return false;
      } else if (selectedInsight === 'needing_attention') {
        // Show students with low progress (< 35%)
        if (student.progress >= 35) return false;
      } else if (selectedInsight === 'avg_progress') {
        // Show students on track with steady progress (>= 50%)
        if (student.progress < 50) return false;
      }

      // 2. Search Filter
      if (activeFilters.search.trim()) {
        const q = activeFilters.search.toLowerCase().trim();
        const matchName = student.name.toLowerCase().includes(q);
        const matchEmail = student.email.toLowerCase().includes(q);
        const matchPhone = student.phone.toLowerCase().includes(q);
        const matchCourse = student.primaryCourse.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchCourse) return false;
      }

      // 3. Course Filter
      if (activeFilters.course && activeFilters.course !== 'All Courses') {
        const matchCourse =
          student.primaryCourse === activeFilters.course ||
          student.courses.some((c) => c.name === activeFilters.course);
        if (!matchCourse) return false;
      }

      // 4. Status Filter
      if (activeFilters.status && activeFilters.status !== 'All Status') {
        if (student.status.toLowerCase() !== activeFilters.status.toLowerCase()) {
          return false;
        }
      }

      // 5. Access Period Filter (3 Months, 6 Months, 1 Year, 2 Years)
      if (activeFilters.accessPeriod && activeFilters.accessPeriod !== 'All Access Period') {
        if (activeFilters.accessPeriod === '3 Months') {
          if (!student.accessPeriodLabel.includes('3 Month')) return false;
        } else if (activeFilters.accessPeriod === '6 Months') {
          if (!student.accessPeriodLabel.includes('6 Month')) return false;
        } else if (activeFilters.accessPeriod === '1 Year') {
          if (!student.accessPeriodLabel.includes('1 Year')) return false;
        } else if (activeFilters.accessPeriod === '2 Years') {
          if (!student.accessPeriodLabel.includes('2 Year')) return false;
        }
      }

      // 6. Progress Filter
      if (activeFilters.progress && activeFilters.progress !== 'All Progress') {
        if (activeFilters.progress === 'below_35') {
          if (student.progress >= 35) return false;
        } else if (activeFilters.progress === 'below_25') {
          if (student.progress >= 25) return false;
        } else if (activeFilters.progress === '25_50') {
          if (student.progress < 25 || student.progress > 50) return false;
        } else if (activeFilters.progress === '50_75') {
          if (student.progress < 50 || student.progress > 75) return false;
        } else if (activeFilters.progress === 'above_75') {
          if (student.progress <= 75) return false;
        } else if (activeFilters.progress === 'below_10') {
          if (student.progress >= 10) return false;
        } else if (activeFilters.progress === '10_25') {
          if (student.progress < 10 || student.progress > 25) return false;
        } else if (activeFilters.progress === 'above_90') {
          if (student.progress < 90) return false;
        } else if (activeFilters.progress === '100') {
          if (student.progress !== 100) return false;
        }
      }

      // 7. Joined Date Filter (handles specific dates like "12 Jun 2026" or months like "Jun 2026")
      if (activeFilters.joinedDate && activeFilters.joinedDate.trim()) {
        const q = activeFilters.joinedDate.toLowerCase().trim();
        const studentDate = student.joinedAt.toLowerCase().trim();
        const qNormalized = q.replace(/^0(\d)/, '$1');
        const sNormalized = studentDate.replace(/^0(\d)/, '$1');
        if (!studentDate.includes(q) && !sNormalized.includes(qNormalized)) return false;
      }

      return true;
    });
  }, [students, selectedKpi, selectedInsight, activeFilters]);

  // Paginated slice
  const paginatedStudents = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredStudents.slice(startIndex, startIndex + pageSize);
  }, [filteredStudents, page, pageSize]);

  // Handle KPI card selection
  const handleSelectKpi = (kpi: KpiFilterKey) => {
    setSelectedKpi(kpi);
    if (kpi) {
      setSelectedInsight(null);
    }
    setPage(1);
    const labelMap: Record<string, string> = {
      total: 'Total Students (10)',
      active: 'Active Students (6)',
      expired: 'Expired Access (1)',
      new: 'New Enrollments (3)',
    };
    if (kpi) {
      showToast(`Filter applied: ${labelMap[kpi]}`);
    } else {
      showToast('KPI filter cleared. Showing all students.');
    }
  };

  // Handle Quick Insight selection
  const handleSelectInsight = (key: QuickInsightFilterKey) => {
    setSelectedInsight(key);
    if (key) {
      setSelectedKpi(null);
    }
    setPage(1);
    const labelMap: Record<string, string> = {
      most_enrolled: 'Filtered: Class 10th (All Subjects)',
      needing_attention: 'Filtered: Students Needing Attention (< 35% Progress)',
      avg_progress: 'Filtered: Students On-Track (≥ 50% Progress)',
    };

    if (key === 'needing_attention') {
      setActiveFilters((prev) => ({
        ...prev,
        progress: 'below_35',
      }));
    } else if (selectedInsight === 'needing_attention' && key === null) {
      setActiveFilters((prev) => ({
        ...prev,
        progress: 'All Progress',
      }));
    } else if (key === 'most_enrolled') {
      setActiveFilters((prev) => ({
        ...prev,
        course: 'Class 10th (All Subjects)',
      }));
    } else if (selectedInsight === 'most_enrolled' && key === null) {
      setActiveFilters((prev) => ({
        ...prev,
        course: 'All Courses',
      }));
    }

    if (key) {
      showToast(labelMap[key]);
    } else {
      showToast('Quick Insight cleared. Showing all students.');
    }
  };

  // Reset handler:
  // - Clear KPI selection
  // - Clear Quick Insight selection
  // - Clear all search/filter values
  // - Restore all 10 students
  const handleResetFilters = () => {
    setSelectedKpi(null);
    setSelectedInsight(null);
    setActiveFilters({
      search: '',
      course: 'All Courses',
      status: 'All Status',
      accessPeriod: 'All Access Period',
      progress: 'All Progress',
      joinedDate: '',
    });
    setPage(1);
    setSelectedIds([]);
    showToast('Filters reset. All students restored.');
  };

  // Filter button handler:
  // Applies selected filter values from the container
  const handleApplyFilters = (newFilters: StudentFilterOptions) => {
    setActiveFilters(newFilters);
    if (newFilters.progress === 'below_35') {
      setSelectedInsight('needing_attention');
      setSelectedKpi(null);
    } else if (selectedInsight === 'needing_attention' && newFilters.progress !== 'below_35') {
      setSelectedInsight(null);
    }
    setPage(1);
    showToast('Filters applied.');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedStudents.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectStudent = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleExportCSV = (selectedOnly: boolean = false) => {
    const exportData = selectedOnly && selectedIds.length > 0
      ? students.filter((s) => selectedIds.includes(s.id))
      : filteredStudents;

    const headers = ['SN,Name,Email,Phone,Course,Joined At,Access Until,Status,Progress'];
    const rows = exportData.map(
      (s) =>
        `"${s.sn}","${s.name}","${s.email}","${s.phone}","${s.primaryCourse}","${s.joinedAt}","${s.accessUntil}","${s.status}","${s.progress}%"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fukey_students_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${exportData.length} students to CSV.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium animate-in slide-in-from-bottom-5">
          <span>✓ {toastMessage}</span>
        </div>
      )}

      {/* Page Header:
          Keep Export immediately to the LEFT of Add New Student */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
  <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a] dark:text-white tracking-tight">
    All Students
  </h1>
  <p className="text-xs text-[#64748b] dark:text-slate-400 mt-0.5">
    View, search and manage all registered students
  </p>
</div>
        </div>

        {/* Action Buttons: Export immediately to the LEFT of Add New Student */}
        <div className="flex items-center gap-2.5">
          <Button
  variant="outline"
  onClick={() => handleExportCSV(false)}
  className="!px-3.5 !py-2.5 font-medium text-xs sm:text-sm !rounded-xl border-[#e2e8f0] dark:border-slate-700/80 bg-white dark:bg-[#0d162c] hover:bg-slate-50 dark:hover:bg-[#13203f] text-slate-700 dark:text-slate-200"
  title="Export CSV"
>
  <Download className="w-4 h-4 mr-1.5 text-slate-500 dark:text-slate-400" />
  Export
</Button>

          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="!px-4 !py-2.5 font-semibold text-xs sm:text-sm !rounded-xl shadow-lg shadow-blue-600/30"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add New Student
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Table (9 cols) + Right Insights & Actions (3 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left Column: Filter Bar + KPI Cards + Table + Pagination (col-span-9) */}
        <div className="xl:col-span-9 space-y-4">
          {/* ONE Filter Container holding: Search, All Courses, All Status, All Access Period, Joined Date, Reset, Filter */}
          <StudentFilterBar
            filters={activeFilters}
            onApplyFilters={handleApplyFilters}
            onReset={handleResetFilters}
            isFiltered={
              Boolean(selectedKpi) ||
              Boolean(selectedInsight) ||
              Boolean(activeFilters.search) ||
              activeFilters.course !== 'All Courses' ||
              activeFilters.status !== 'All Status' ||
              activeFilters.accessPeriod !== 'All Access Period' ||
              (Boolean(activeFilters.progress) && activeFilters.progress !== 'All Progress') ||
              Boolean(activeFilters.joinedDate)
            }
          />

          {/* KPI Cards working as filters (Positioned below the filter bar):
              Total Students: 10
              Active Students: 6
              Expired Access: 1
              New Enrollments: 3 */}
          <StudentStatsGrid
            totalStudents={kpiStats.total}
            activeStudents={kpiStats.active}
            expiredStudents={kpiStats.expired}
            newEnrollments={kpiStats.newEnrolled}
            selectedKpi={selectedKpi}
            onSelectKpi={handleSelectKpi}
          />

          <StudentTable
            students={paginatedStudents}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectStudent={handleSelectStudent}
            onViewStudent={(student) => setViewStudent(student)}
            onExtendAccess={(student) => setExtendStudent(student)}
            onSendEmail={(student) => setEmailStudent(student)}
            onDeleteStudent={(id) => {
              deleteStudent(id);
              showToast('Student deleted successfully.');
            }}
          />

          <StudentTablePagination
            currentPage={page}
            totalStudents={filteredStudents.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>

        {/* Right Column: Widgets (col-span-3) */}
        <div className="xl:col-span-3 space-y-4">
          <StudentQuickInsights
            selectedInsight={selectedInsight}
            onSelectInsight={handleSelectInsight}
          />
          <StudentAccessChart />
          <StudentBulkActions
            selectedCount={selectedIds.length}
            onSendBulkEmail={() => setIsBulkEmailOpen(true)}
            onExtendBulkAccess={() => setIsBulkExtendOpen(true)}
            onExportBulk={() => handleExportCSV(selectedIds.length > 0)}
          />
        </div>
      </div>

      {/* Add New Student Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={async (newStudentData) => {
          await createStudent(newStudentData);
          showToast('Student added successfully.');
        }}
      />

      {/* View Student Modal */}
      <ViewStudentModal
        isOpen={!!viewStudent}
        onClose={() => setViewStudent(null)}
        student={viewStudent}
      />

      {/* Extend Access Modal (Single) */}
      <ExtendAccessModal
        isOpen={!!extendStudent}
        onClose={() => setExtendStudent(null)}
        student={extendStudent}
        onConfirm={async (years) => {
          if (extendStudent) {
            await extendAccess(extendStudent.id, years);
            showToast(`Access extended by ${years} year(s).`);
          }
        }}
      />

      {/* Extend Access Modal (Bulk) */}
      <ExtendAccessModal
        isOpen={isBulkExtendOpen}
        onClose={() => setIsBulkExtendOpen(false)}
        student={null}
        selectedCount={selectedIds.length || filteredStudents.length}
        onConfirm={async (years) => {
          const targets = selectedIds.length > 0 ? selectedIds : filteredStudents.map((s) => s.id);
          for (const id of targets) {
            await extendAccess(id, years);
          }
          showToast(`Access extended for ${targets.length} students.`);
        }}
      />

      {/* Send Email Modal (Single) */}
      <SendEmailModal
        isOpen={!!emailStudent}
        onClose={() => setEmailStudent(null)}
        student={emailStudent}
        onSend={() => {
          showToast('Email delivered successfully.');
        }}
      />

      {/* Send Email Modal (Bulk) */}
      <SendEmailModal
        isOpen={isBulkEmailOpen}
        onClose={() => setIsBulkEmailOpen(false)}
        student={null}
        selectedCount={selectedIds.length || filteredStudents.length}
        onSend={() => {
          showToast(`Bulk email dispatched to ${selectedIds.length || filteredStudents.length} students.`);
        }}
      />
    </div>
  );
};

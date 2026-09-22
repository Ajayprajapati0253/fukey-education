import React, { useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Upload, Plus, ChevronDown, FileText, CheckCircle2 } from 'lucide-react';

import { MetricCards } from '../components/MetricCards';
import { CourseFilters } from '../components/CourseFilters';
import { CourseTable } from '../components/CourseTable';
import { AddCourseModal } from '../components/AddCourseModal';
import { EditCourseModal } from '../components/EditCourseModal';
import { CourseDetailsModal } from '../components/CourseDetailsModal';

import { useCourses } from '../hooks/useCourses';
import { INITIAL_COURSES } from '../data/InitialCourses';
import type { Course, CourseFilterState, CourseStatus, ApprovalStatus } from '../types/course.types';

const DEFAULT_FILTERS: CourseFilterState = {
  search: '',
  date: '',
  category: 'All Categories',
  instructor: 'All Instructors',
  level: 'All Levels',
  language: 'All Languages',
  status: 'All Status',
  approvalStatus: 'All Approval Status',
  courseType: 'Course Type',
  orderBy: 'newest',
  perPage: 10,
};

// Maps filter keys <-> URL query param names
const PARAM_KEYS: Record<keyof CourseFilterState, string> = {
  search: 'q',
  date: 'date',
  category: 'category',
  instructor: 'instructor',
  level: 'level',
  language: 'language',
  status: 'status',
  approvalStatus: 'approval',
  courseType: 'type',
  orderBy: 'sort',
  perPage: 'perPage',
};

function filtersFromSearchParams(params: URLSearchParams): CourseFilterState {
  const next = { ...DEFAULT_FILTERS };
  (Object.keys(PARAM_KEYS) as (keyof CourseFilterState)[]).forEach((key) => {
    const raw = params.get(PARAM_KEYS[key]);
    if (raw === null) return;
    if (key === 'perPage') {
      const n = Number(raw);
      if (!Number.isNaN(n)) next.perPage = n;
    } else {
      (next[key] as string) = raw;
    }
  });
  return next;
}

function searchParamsFromFilters(filters: CourseFilterState, page: number): URLSearchParams {
  const params = new URLSearchParams();
  (Object.keys(PARAM_KEYS) as (keyof CourseFilterState)[]).forEach((key) => {
    const value = filters[key];
    const defaultValue = DEFAULT_FILTERS[key];
    if (value !== defaultValue && value !== '') {
      params.set(PARAM_KEYS[key], String(value));
    }
  });
  if (page > 1) params.set('page', String(page));
  return params;
}

export const CoursesPage: React.FC = () => {
  const {
    courses, addCourse, updateCourse, deleteCourse, bulkUpdateStatus, bulkDelete,
  } = useCourses(INITIAL_COURSES);

  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);
  const currentPage = useMemo(() => {
    const p = Number(searchParams.get('page'));
    return Number.isFinite(p) && p > 0 ? p : 1;
  }, [searchParams]);

  const setFilters = useCallback(
    (updater: CourseFilterState | ((prev: CourseFilterState) => CourseFilterState)) => {
      const next = typeof updater === 'function' ? updater(filters) : updater;
      setSearchParams(searchParamsFromFilters(next, 1), { replace: false }); // filter change → reset to page 1
    },
    [filters, setSearchParams]
  );

  const setCurrentPage = useCallback(
    (page: number) => {
      setSearchParams(searchParamsFromFilters(filters, page), { replace: false });
    },
    [filters, setSearchParams]
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => {
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase();
          const matches = [course.title, course.id, course.instructorName, course.subtitle]
            .some((f) => f.toLowerCase().includes(q));
          if (!matches) return false;
        }
        if (filters.category !== 'All Categories' && course.category !== filters.category) return false;
        if (filters.instructor !== 'All Instructors' && course.instructorName !== filters.instructor) return false;
        if (filters.level !== 'All Levels' && course.level !== filters.level) return false;
        if (filters.language !== 'All Languages' && course.language !== filters.language) return false;
        if (filters.status !== 'All Status' && course.status !== filters.status) return false;
        if (filters.approvalStatus !== 'All Approval Status' && course.approvalStatus !== filters.approvalStatus) return false;
        if (filters.courseType !== 'Course Type' && course.courseType !== filters.courseType) return false;
        return true;
      })
      .sort((a, b) => {
        switch (filters.orderBy) {
          case 'oldest': return (a.sn || 0) - (b.sn || 0);
          case 'students_desc': return b.studentsCount - a.studentsCount;
          case 'students_asc': return a.studentsCount - b.studentsCount;
          case 'price_desc': return b.price - a.price;
          case 'price_asc': return a.price - b.price;
          case 'title_asc': return a.title.localeCompare(b.title);
          case 'newest':
          default: return (b.sn || 0) - (a.sn || 0);
        }
      });
  }, [courses, filters]);

  const handleAddCourse = (data: Omit<Course, 'id' | 'sn' | 'createdDate' | 'createdTime'>) => {
    const created = addCourse(data);
    showToast(`Course "${created.title}" successfully created!`);
  };

  const handleUpdateCourse = (updated: Course) => {
    updateCourse(updated);
    showToast(`Course "${updated.title}" updated.`);
  };

  const handleDeleteCourse = (id: string) => {
    const target = courses.find((c) => c.id === id);
    if (window.confirm(`Are you sure you want to delete "${target?.title || 'this course'}"?`)) {
      deleteCourse(id);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      showToast('Course removed successfully.');
    }
  };

  const handleDuplicateCourse = (course: Course) => {
    const duplicated = addCourse({
      ...course,
      title: `${course.title} (Copy)`,
      status: 'Draft',
      approvalStatus: 'Pending',
      studentsCount: 0,
    });
    showToast(`Duplicated "${course.title}" as "${duplicated.title}".`);
  };

  const handleChangeStatus = (id: string, newStatus: CourseStatus) => {
    const course = courses.find((c) => c.id === id);
    if (course) updateCourse({ ...course, status: newStatus });
    showToast(`Status changed to ${newStatus}.`);
  };

  const handleChangeApprovalStatus = (id: string, newApproval: ApprovalStatus) => {
    const course = courses.find((c) => c.id === id);
    if (course) updateCourse({ ...course, approvalStatus: newApproval });
    showToast(`Approval status updated to ${newApproval}.`);
  };

  const handleToggleSelectAll = () => {
    const pageIds = filteredCourses
      .slice((currentPage - 1) * filters.perPage, currentPage * filters.perPage)
      .map((c) => c.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      allSelected ? prev.filter((id) => !pageIds.includes(id)) : Array.from(new Set([...prev, ...pageIds]))
    );
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkStatusChange = (status: CourseStatus) => {
    bulkUpdateStatus(selectedIds, status);
    showToast(`Updated ${selectedIds.length} course(s) to ${status}.`);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected course(s)?`)) {
      bulkDelete(selectedIds);
      showToast(`Deleted ${selectedIds.length} course(s).`);
      setSelectedIds([]);
    }
  };

  const handleExportCSV = (selectedOnly = false) => {
    const dataToExport = selectedOnly && selectedIds.length > 0
      ? courses.filter((c) => selectedIds.includes(c.id))
      : filteredCourses;

    const headers = ['SN', 'ID', 'Title', 'Subtitle', 'Instructor', 'Category', 'Level', 'Students', 'Price', 'IsFree', 'Status', 'ApprovalStatus', 'Language', 'CreatedDate', 'CreatedTime'];
    const rows = dataToExport.map((c) => [
      c.sn, `"${c.id}"`, `"${c.title.replace(/"/g, '""')}"`, `"${c.subtitle.replace(/"/g, '""')}"`,
      `"${c.instructorName.replace(/"/g, '""')}"`, `"${c.category}"`, `"${c.level}"`, c.studentsCount,
      c.price, c.isFree ? 'TRUE' : 'FALSE', `"${c.status}"`, `"${c.approvalStatus}"`, `"${c.language}"`,
      `"${c.createdDate}"`, `"${c.createdTime}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `fukey_courses_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${dataToExport.length} course(s) to CSV!`);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    showToast('Filters reset to default.');
  };

  return (
    <div className="space-y-6 pb-8">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink dark:text-white tracking-tight">Manage Courses</h1>
          <p className="text-xs sm:text-sm text-ink-soft dark:text-[#94A3B8] mt-0.5 font-medium">
            Create, manage and organize all courses on your platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExportCSV(false)}
            className="flex items-center gap-2 px-4 py-2 border border-border-subtle dark:border-[#334155] bg-white dark:bg-[#1E293B] rounded-xl text-xs font-bold text-ink dark:text-gray-100 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-2xs cursor-pointer"
          >
            <Upload className="w-4 h-4 rotate-45" /><span>Export</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white rounded-xl text-xs font-bold hover:bg-[#1E44B8] active:scale-[0.98] transition-all shadow-[0_2px_8px_rgba(36,81,217,0.25)] select-none"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /><span>Add Course</span>
              <span
                onClick={(e) => { e.stopPropagation(); setIsAddDropdownOpen(!isAddDropdownOpen); }}
                className="p-0.5 hover:bg-white/20 rounded"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isAddDropdownOpen ? 'rotate-180' : ''}`} />
              </span>
            </button>

            {isAddDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1E293B] border border-border-subtle dark:border-[#334155] rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.15)] p-1.5 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => { setIsAddDropdownOpen(false); setIsAddModalOpen(true); }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-ink dark:text-gray-100 hover:bg-[#EAF0FE] dark:hover:bg-[#2451D9]/20 hover:text-brand rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-brand" /><span>Create Single Course</span>
                </button>
                <button
                  onClick={() => {
                    setIsAddDropdownOpen(false);
                    handleAddCourse({
                      title: 'Crash Course Class 10 Foundation',
                      subtitle: 'Foundation Series',
                      thumbnail: INITIAL_COURSES[0].thumbnail,
                      instructorName: 'Khabib Nurmagomedov',
                      instructorAvatar: INITIAL_COURSES[0].instructorAvatar,
                      category: 'Science',
                      level: 'Class 10',
                      studentsCount: 0,
                      price: 0,
                      isFree: true,
                      status: 'Draft',
                      approvalStatus: 'Pending',
                      courseType: 'Crash Course',
                      language: 'English',
                      duration: '20 hours',
                      lessonsCount: 25,
                      rating: 5.0,
                      description: 'Quick accelerated module template.',
                    });
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-ink dark:text-gray-100 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" /><span>Use Quick Template</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <CourseFilters
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
        onApplyFilter={() => showToast(`Applied filters (${filteredCourses.length} results)`)}
        filteredCount={filteredCourses.length}
      />

      <MetricCards
        courses={courses}
        activeStatusFilter={filters.status}
        onSelectStatusFilter={(st) => setFilters((prev) => ({ ...prev, status: st }))}
      />

      <CourseTable
        courses={filteredCourses}
        selectedIds={selectedIds}
        onToggleSelectAll={handleToggleSelectAll}
        onToggleSelectRow={handleToggleSelectRow}
        onViewCourse={(c) => { setViewingCourse(c); setIsDetailsModalOpen(true); }}
        onEditCourse={(c) => { setEditingCourse(c); setIsEditModalOpen(true); }}
        onDeleteCourse={handleDeleteCourse}
        onDuplicateCourse={handleDuplicateCourse}
        onChangeStatus={handleChangeStatus}
        onChangeApprovalStatus={handleChangeApprovalStatus}
        onBulkDelete={handleBulkDelete}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkExport={() => handleExportCSV(true)}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        perPage={filters.perPage}
      />

      <AddCourseModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddCourse={handleAddCourse} />

      <EditCourseModal
        course={editingCourse}
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingCourse(null); }}
        onUpdateCourse={handleUpdateCourse}
      />

      <CourseDetailsModal
        course={viewingCourse}
        isOpen={isDetailsModalOpen}
        onClose={() => { setIsDetailsModalOpen(false); setViewingCourse(null); }}
        onEdit={(c) => { setEditingCourse(c); setIsEditModalOpen(true); }}
      />
    </div>
  );
};

export default CoursesPage;
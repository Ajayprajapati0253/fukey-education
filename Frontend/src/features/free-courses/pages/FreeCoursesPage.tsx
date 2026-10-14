import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFreeCourses } from '../hooks/useFreeCourses';
import type { FreeCourse } from '../types/free-course.types';
import { FreeCourseFilters } from '../components/FreeCourseFilters';
import { FreeCourseKpiCards } from '../components/FreeCourseKpiCards';
import { FreeCourseTable } from '../components/FreeCourseTable';
import { FreeCourseCardGrid } from '../components/FreeCourseCardGrid';
import { FreeCourseReorderModal } from '../components/FreeCourseReorderModal';
import { FreeCourseBulkActions } from '../components/FreeCourseBulkActions';
import { AddFreeCourseModal } from '../components/AddFreeCourseModal';
import { StudentCoursePreviewModal } from '../components/StudentCoursePreviewModal';
import { FreeCourseDeleteModal } from '../components/FreeCourseDeleteModal';
import { FreeCourseEnrollmentModal } from '../components/FreeCourseEnrollmentModal';
import { FreeCourseContentManager } from '../components/FreeCourseContentManager';
import { Button } from '../../../components/ui/Button';
import { Plus, Download, ListOrdered, LayoutGrid, List } from 'lucide-react';

export const FreeCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    courses,
    paginatedCourses,
    totalCount,
    filters,
    handleFilterChange,
    resetFilters,
    availableSubjects,
    availableInstructors,
    kpis,
    activeScopeLabel,
    isScopeFiltered,
    currentPage,
    setCurrentPage,
    totalPages,
    selectedIds,
    clearSelection,
    isAllSelected,
    toggleSelectAll,
    toggleSelectOne,
    handleCreateCourse,
    handleUpdateCourse,
    handleDeleteCourse,
    handleDuplicateCourse,
    handleTogglePublish,
    handleArchiveCourse,
    handleRestoreCourse,
    handleBulkPublish,
    handleBulkUnpublish,
    handleBulkArchive,
    handleBulkDelete,
    handleExportCSV,
    loadCourses,
  } = useFreeCourses();

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [reorderOpen, setReorderOpen] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewCourse, setViewCourse] = useState<FreeCourse | null>(null);
  const [deleteCourse, setDeleteCourse] = useState<FreeCourse | null>(null);
  const [enrollmentCourse, setEnrollmentCourse] = useState<FreeCourse | null>(null);
  const [contentCourse, setContentCourse] = useState<FreeCourse | null>(null);

  if (contentCourse) {
    return (
      <div className="space-y-6">
        <FreeCourseContentManager
          course={contentCourse}
          onClose={() => setContentCourse(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-[#12141C] dark:text-white tracking-tight">
              Manage Free Courses
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#E7F7ED] text-[#16A34A] border border-[#16A34A]/30 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
              Classes 9–12
            </span>
          </div>
          <p className="text-xs text-[#686E7D] dark:text-slate-400 mt-1">
            Create, manage and organize all free courses for Classes 9–12.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" onClick={handleExportCSV}>
            <Download className="w-4 h-4" />
            Export
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/admin/free-courses/create')}
          >
            <Plus className="w-4 h-4" />
            Add Free Course
          </Button>
        </div>
      </div>

      {/* Active Scope Banner */}
      <div className="flex items-center justify-between gap-3 p-3 px-4 rounded-xl bg-gradient-to-r from-[#EAF0FE] to-[#F6F7FA] border border-[#2451D9]/30 dark:from-blue-950/40 dark:via-[#0e1c3a] dark:to-[#0c1834] dark:border-blue-500/30 text-xs shadow-sm dark:shadow-md">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-extrabold uppercase tracking-wide text-[#2451D9] dark:text-blue-400">
            ACTIVE SCOPE:
          </span>
          <span className="font-bold text-[#12141C] dark:text-white text-sm">
            {activeScopeLabel}
          </span>
          <span className="text-[#2451D9]/80 dark:text-blue-300 font-medium text-[11px]">
            (Metrics updated live)
          </span>
        </div>
        {isScopeFiltered && (
          <button
            onClick={resetFilters}
            className="text-xs text-[#2451D9] hover:text-[#1E44B8] dark:text-blue-400 dark:hover:text-white underline cursor-pointer shrink-0"
          >
            Reset Scope
          </button>
        )}
      </div>

      <FreeCourseKpiCards
        kpis={kpis}
        currentStatusFilter={filters.status}
        onSelectStatus={(status) => handleFilterChange({ status })}
      />

      <FreeCourseFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        availableSubjects={availableSubjects}
        availableInstructors={availableInstructors}
      />

      <FreeCourseBulkActions
        selectedCount={selectedIds.length}
        onPublish={handleBulkPublish}
        onUnpublish={handleBulkUnpublish}
        onArchive={handleBulkArchive}
        onDelete={handleBulkDelete}
        onClearSelection={clearSelection}
      />

      {/* Toolbar: Reorder + View Mode */}
      <div className="flex items-center justify-between gap-3 pb-1">
        <div className="text-xs text-[#686E7D] dark:text-slate-400">
          Showing{' '}
          <span className="font-semibold text-[#12141C] dark:text-white">{paginatedCourses.length}</span> of{' '}
          <span className="font-semibold text-[#12141C] dark:text-white">{totalCount}</span> free courses
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setReorderOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#E6E8EE] dark:border-slate-700/80 bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-sm cursor-pointer"
          >
            <ListOrdered className="w-4 h-4 text-[#2451D9] dark:text-blue-400" />
            <span>Reorder Sequence</span>
          </button>

          <div className="flex items-center p-1 bg-[#F1F3F8] dark:bg-[#0B0F19] rounded-xl border border-[#E6E8EE] dark:border-slate-800">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#EAF0FE] text-[#2451D9] border border-[#2451D9]/30 dark:bg-blue-600/20 dark:text-blue-400 dark:border-blue-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#EAF0FE] text-[#2451D9] border border-[#2451D9]/30 dark:bg-blue-600/20 dark:text-blue-400 dark:border-blue-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
              title="Grid / Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table or Grid */}
      {viewMode === 'table' ? (
        <FreeCourseTable
          courses={paginatedCourses}
          totalCoursesCount={totalCount}
          currentPage={currentPage}
          perPage={filters.perPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          selectedIds={selectedIds}
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectOne={toggleSelectOne}
          onView={(course) => setViewCourse(course)}
          onEdit={(course) => navigate(`/admin/free-courses/edit/${course.id}`)}
          onDuplicate={handleDuplicateCourse}
          onTogglePublish={handleTogglePublish}
          onArchive={handleArchiveCourse}
          onRestore={handleRestoreCourse}
          onDelete={(course) => setDeleteCourse(course)}
          onManageContent={(course) => setContentCourse(course)}
          onViewEnrollments={(course) => setEnrollmentCourse(course)}
          onUpdateStatus={async (courseId, nextStatus) => {
            await handleUpdateCourse(courseId, { status: nextStatus });
          }}
          onUpdateApprovalStatus={async (courseId, nextApproval) => {
            await handleUpdateCourse(courseId, { approvalStatus: nextApproval });
          }}
          onUpdateThumbnail={async (courseId, thumbnail) => {
            await handleUpdateCourse(courseId, { thumbnail });
          }}
        />
      ) : (
        <div className="space-y-6">
          <FreeCourseCardGrid
            courses={paginatedCourses}
            selectedIds={selectedIds}
            onToggleSelectOne={toggleSelectOne}
            onView={(course) => setViewCourse(course)}
            onEdit={(course) => navigate(`/admin/free-courses/edit/${course.id}`)}
            onDuplicate={handleDuplicateCourse}
            onTogglePublish={handleTogglePublish}
            onArchive={handleArchiveCourse}
            onRestore={handleRestoreCourse}
            onDelete={(course) => setDeleteCourse(course)}
            onManageContent={(course) => setContentCourse(course)}
            onViewEnrollments={(course) => setEnrollmentCourse(course)}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-4">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-xs text-[#686E7D] dark:text-slate-400 px-3">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      <AddFreeCourseModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleCreateCourse}
      />

      <StudentCoursePreviewModal
        course={viewCourse}
        isOpen={!!viewCourse}
        onClose={() => setViewCourse(null)}
        onEdit={(course) => {
          setViewCourse(null);
          navigate(`/admin/free-courses/edit/${course.id}`);
        }}
        onManageContent={(course) => {
          setViewCourse(null);
          setContentCourse(course);
        }}
        onDuplicate={handleDuplicateCourse}
      />

      <FreeCourseDeleteModal
        course={deleteCourse}
        isOpen={!!deleteCourse}
        onClose={() => setDeleteCourse(null)}
        onConfirmDelete={handleDeleteCourse}
        onArchiveInstead={handleArchiveCourse}
      />

      <FreeCourseEnrollmentModal
        course={enrollmentCourse}
        isOpen={!!enrollmentCourse}
        onClose={() => setEnrollmentCourse(null)}
      />

      <FreeCourseReorderModal
        isOpen={reorderOpen}
        onClose={() => setReorderOpen(false)}
        courses={courses}
        onSaveOrder={() => loadCourses()}
      />
    </div>
  );
};
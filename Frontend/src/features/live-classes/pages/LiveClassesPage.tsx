import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CalendarDays } from 'lucide-react';
import { LiveClassesKPI } from '../components/LiveClassesKPI';
import { LiveClassesFilters } from '../components/LiveClassesFilters';
import { LiveClassesTable } from '../components/LiveClassesTable';
import { CreateLiveClassModal } from '../components/CreateLiveClassModal';
import { EditLiveClassModal } from '../components/EditLiveClassModal';
import { ClassDetailsModal } from '../components/ClassDetailsModal';
import { CalendarViewModal } from '../components/CalendarViewModal';
import { JoinLiveModal } from '../components/JoinLiveModal';
import { ViewRecordingModal } from '../components/ViewRecordingModal';
import { useLiveClasses } from '../hooks/useLiveClasses';
import type { LiveClass } from '../types/live-class.types';

// This page renders inside the existing AdminLayout (sidebar + AdminHeader),
// the same way CoursesPage / BlogsPage do. It replaces the placeholder that
// currently sits at /admin/live-classes/schedules.
const LiveClassesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    paginatedClasses,
    filteredClasses,
    totalResults,
    filters,
    onFilterChange,
    resetFilters,
    filterByStatus,
    currentPage,
    setCurrentPage,
    pageSize,
    kpiCounts,
    addClass,
    updateClass,
    deleteClass,
    changeStatus,
  } = useLiveClasses();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<LiveClass | null>(null);
  const [detailsClass, setDetailsClass] = useState<LiveClass | null>(null);
  const [joiningClass, setJoiningClass] = useState<LiveClass | null>(null);
  const [recordingClass, setRecordingClass] = useState<LiveClass | null>(null);

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    // TODO: swap this alert() for the app's shared Toast component once
    // Live Classes is wired into the same toast/notification system as
    // Blogs / Courses.
    alert('Meeting link copied to clipboard!');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this live class? This action cannot be undone.')) {
      deleteClass(id);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Live Classes
          </h1>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            Schedule, monitor, and manage all live broadcasts across courses and instructors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/live-classes/calendar-views')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-[#26344a] transition-colors shadow-2xs"
          >
            <CalendarDays className="h-4 w-4" />
            <span>Calendar Views</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Live Class</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <LiveClassesKPI
        counts={kpiCounts}
        activeStatusFilter={filters.status}
        onFilterStatus={filterByStatus}
      />

      {/* Filters */}
      <LiveClassesFilters
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={resetFilters}
        totalFilteredCount={totalResults}
      />

      {/* Table */}
      <LiveClassesTable
        classes={paginatedClasses}
        totalResults={totalResults}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onViewDetails={setDetailsClass}
        onJoinLive={setJoiningClass}
        onViewRecording={setRecordingClass}
        onEditClass={setEditingClass}
        onDeleteClass={handleDelete}
        onStatusChange={changeStatus}
        onCopyLink={handleCopyLink}
      />

      {/* Create */}
      <CreateLiveClassModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={addClass}
      />

      {/* Edit */}
      <EditLiveClassModal
        isOpen={!!editingClass}
        onClose={() => setEditingClass(null)}
        liveClass={editingClass}
        onSave={updateClass}
        onDelete={handleDelete}
      />

      {/* Details */}
      <ClassDetailsModal
        isOpen={!!detailsClass}
        onClose={() => setDetailsClass(null)}
        liveClass={detailsClass}
        onJoinLive={setJoiningClass}
        onViewRecording={setRecordingClass}
        onCopyLink={handleCopyLink}
      />

      {/* Calendar */}
      <CalendarViewModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        classes={filteredClasses}
        onSelectClass={setDetailsClass}
        onCreateNew={() => {
          setIsCalendarOpen(false);
          setIsCreateOpen(true);
        }}
      />

      {/* Join Live */}
      <JoinLiveModal
        isOpen={!!joiningClass}
        onClose={() => setJoiningClass(null)}
        liveClass={joiningClass}
      />

      {/* View Recording */}
      <ViewRecordingModal
        isOpen={!!recordingClass}
        onClose={() => setRecordingClass(null)}
        liveClass={recordingClass}
      />
    </div>
  );
};

export default LiveClassesPage;
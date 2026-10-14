import { useState, useMemo } from 'react';
import { Plus, Users, Download } from 'lucide-react';
import { useInstructors } from '../hooks/useInstructors';
import { InstructorKpiCards } from '../components/InstructorKpiCards';
import { InstructorFilters } from '../components/InstructorFilters';
import { InstructorTable } from '../components/InstructorTable';
import { InstructorViewModal } from '../components/InstructorViewModal';
import { AddInstructorModal } from '../components/AddInstructorModal';
import { BulkActionModal } from '../components/BulkActionModal';
import type { BulkActionType } from '../components/BulkActionModal';
import { Toast } from '../../../components/ui/Toast';
import type { Instructor, InstructorStatus, VerificationStatus } from '../types/instructor';

export function AllInstructorsListPage() {
  const {
    instructors,
    paginatedInstructors,
    total,
    totalPages,
    page,
    setPage,
    pageSize,
    kpi,
    filters,
    setFilter,
    applyAllFilters,
    resetFilters,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    deleteInstructor,
    bulkUpdateStatus,
    bulkUpdateVerification,
    bulkDeleteInstructors,
    refresh,
  } = useInstructors();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingInstructor, setViewingInstructor] = useState<Instructor | null>(null);
  const [bulkModalAction, setBulkModalAction] = useState<BulkActionType | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  const selectedInstructors = useMemo(() => {
    return instructors.filter((i) => selectedIds.includes(i.id));
  }, [instructors, selectedIds]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
  };

  const handleTriggerBulkAction = (action: BulkActionType) => {
    if (selectedIds.length === 0) {
      showToast('Please select at least one instructor from the table to perform bulk actions.', 'info');
      return;
    }
    setBulkModalAction(action);
  };

  const handleConfirmBulkAction = async (payload: {
    actionType: BulkActionType;
    targetIds: string[];
    status?: InstructorStatus;
    verification?: VerificationStatus;
    reason?: string;
    notifyFaculty?: boolean;
    notifyCoordinators?: boolean;
  }) => {
    const count = payload.targetIds.length;
    if (count === 0) return;

    if (payload.actionType === 'activate') {
      await bulkUpdateStatus(payload.targetIds, 'Active', 'Reactivated by administrator');
      showToast(
        `Real-time Update: ${count} instructor${count > 1 ? 's' : ''} successfully activated. Live classes and portal access restored.`,
        'success'
      );
    } else if (payload.actionType === 'deactivate') {
      const targetStatus = payload.status || 'Inactive';
      await bulkUpdateStatus(payload.targetIds, targetStatus, payload.reason);
      showToast(
        `Real-time Update: ${count} instructor${count > 1 ? 's' : ''} moved to ${targetStatus} status. Notifications dispatched.`,
        'info'
      );
    } else if (payload.actionType === 'verify') {
      await bulkUpdateVerification(payload.targetIds, 'Verified');
      showToast(
        `Real-time Update: ${count} instructor${count > 1 ? 's' : ''} verified successfully with official CBSE/State Board credentials.`,
        'success'
      );
    } else if (payload.actionType === 'delete') {
      await bulkDeleteInstructors(payload.targetIds);
      showToast(
        `Real-time Update: ${count} instructor${count > 1 ? 's' : ''} permanently deleted from roster.`,
        'error'
      );
    }
  };

  const handleExport = () => {
    // Generate CSV string from instructors list
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Subject', 'Classes', 'Medium', 'Courses', 'Students', 'Attendance', 'Status'];
    const rows = paginatedInstructors.map((i) => [
      i.id,
      `"${i.name}"`,
      i.email,
      i.phone,
      i.subject,
      `"9th to 12th"`,
      `"Hindi & English Both"`,
      i.coursesCount,
      i.studentsCount,
      `${i.attendancePercentage}%`,
      i.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'instructors_9th_12th_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Instructor roster exported successfully as CSV', 'success');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this instructor?')) {
      await deleteInstructor(id);
      showToast('Instructor removed from roster', 'info');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Instructors
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
                Classes 9th - 12th · Hindi & English
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage instructor profiles, courses, live classes, attendance and performance for 9th to 12th classes in Hindi & English both medium.
            </p>
          </div>
        </div>

        {/* Top Header Buttons: Export on the left of Add New Instructor */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#162238] border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-xs cursor-pointer shrink-0"
            title="Export instructors CSV"
          >
            <Download className="w-4 h-4 text-blue-500" />
            <span>Export</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-sm shadow-blue-600/30 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Instructor</span>
          </button>
        </div>
      </div>

      {/* Filter Container on top */}
      <InstructorFilters
        filters={filters}
        onApplyFilters={applyAllFilters}
        onResetFilters={resetFilters}
      />

      {/* 5 KPI Summary Cards below filter */}
      <InstructorKpiCards
        kpi={kpi}
        activeStatusFilter={filters.status}
        onSelectStatusFilter={(statusVal) => setFilter('status', statusVal)}
      />

      {/* Instructor Table */}
      <InstructorTable
        instructors={paginatedInstructors}
        total={total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setPage}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onDeleteInstructor={handleDelete}
        onViewInstructor={(inst) => setViewingInstructor(inst)}
        onTriggerBulkAction={handleTriggerBulkAction}
        onClearSelection={clearSelection}
      />

      {/* Bulk Action Real-Time Confirmation Modal */}
      {bulkModalAction && (
        <BulkActionModal
          isOpen={!!bulkModalAction}
          onClose={() => setBulkModalAction(null)}
          actionType={bulkModalAction}
          selectedInstructors={selectedInstructors}
          onConfirm={handleConfirmBulkAction}
        />
      )}

      {/* Add Instructor Modal */}
      <AddInstructorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          refresh();
          showToast('New instructor registered successfully', 'success');
        }}
      />

      {/* View Instructor Modal */}
      <InstructorViewModal
        instructor={viewingInstructor}
        isOpen={!!viewingInstructor}
        onClose={() => setViewingInstructor(null)}
      />

      {/* Toast Feedback */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}

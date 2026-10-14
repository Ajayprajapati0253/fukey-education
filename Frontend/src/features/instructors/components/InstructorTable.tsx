import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MoreVertical,
  Edit2,
  Eye,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Mail,
  BookOpen,
  AlertCircle,
  Info,
  X
} from 'lucide-react';
import type { Instructor, InstructorStatus } from '../types/instructor';

interface InstructorTableProps {
  instructors: Instructor[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onDeleteInstructor: (id: string) => void;
  onViewInstructor: (instructor: Instructor) => void;
  onTriggerBulkAction?: (action: 'activate' | 'deactivate' | 'verify' | 'delete') => void;
  onClearSelection?: () => void;
}

export function InstructorTable({
  instructors,
  total,
  page,
  pageSize,
  totalPages,
  onPageChange,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onDeleteInstructor,
  onViewInstructor,
  onTriggerBulkAction,
  onClearSelection,
}: InstructorTableProps) {
  const navigate = useNavigate();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const bulkMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bulkMenuRef.current && !bulkMenuRef.current.contains(event.target as Node)) {
        setBulkMenuOpen(false);
      }
    }
    if (bulkMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [bulkMenuOpen]);

  const startRecord = (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, total);
  const allCurrentSelected =
    instructors.length > 0 && instructors.every((inst) => selectedIds.includes(inst.id));

  const getStatusBadge = (status: InstructorStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60">
            Active
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            Inactive
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800/60">
            Pending
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800/60">
            Suspended
          </span>
        );
    }
  };

  const getAttendanceRing = (percentage: number) => {
    const strokeColor =
      percentage >= 90
        ? 'text-emerald-500'
        : percentage >= 80
        ? 'text-blue-500'
        : percentage >= 70
        ? 'text-amber-500'
        : 'text-rose-500';

    return (
      <div className="flex items-center gap-2">
        <div className="relative w-6 h-6 flex items-center justify-center">
          <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-200 dark:text-slate-700"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={strokeColor}
              strokeDasharray={`${percentage}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
        </div>
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {percentage}%
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-[#111c34] border border-slate-200/80 dark:border-[#1e2c4c] rounded-xl shadow-xs overflow-hidden">
      {/* Table Top Controls / Bulk Action & Pagination Header */}
      <div className="px-4 py-3 sm:px-5 border-b border-slate-200/80 dark:border-[#1e2c4c] flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-[#10192d]">
        {/* Bulk Selection actions */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allCurrentSelected}
              onChange={onToggleSelectAll}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
            />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {selectedIds.length} selected
            </span>
          </label>

          <div className="relative" ref={bulkMenuRef}>
            <button
              onClick={() => setBulkMenuOpen(!bulkMenuOpen)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedIds.length > 0
                  ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-600 shadow-sm shadow-blue-600/30'
                  : 'bg-white dark:bg-[#162238] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span>Bulk Actions</span>
              {selectedIds.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/20 text-white">
                  {selectedIds.length}
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {bulkMenuOpen && (
              <div className="absolute left-0 mt-1 w-64 bg-white dark:bg-[#111c34] border border-slate-200 dark:border-[#1e2c4c] rounded-xl shadow-xl py-1 z-30 animate-in fade-in">
                {selectedIds.length === 0 ? (
                  <div className="p-3 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                      <Info className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>No Instructors Selected</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Select one or more checkboxes in the table below to activate, deactivate, verify, or delete instructors in bulk.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-[#1e2c4c]">
                      Apply to {selectedIds.length} selected faculty
                    </div>

                    <button
                      onClick={() => {
                        setBulkMenuOpen(false);
                        onTriggerBulkAction?.('activate');
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-semibold">Mark as Active</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">Restore access & live classes</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setBulkMenuOpen(false);
                        onTriggerBulkAction?.('deactivate');
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left transition-colors cursor-pointer"
                    >
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <div>
                        <div className="font-semibold">Mark as Inactive / Suspend</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">Pause portal & batch scheduling</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setBulkMenuOpen(false);
                        onTriggerBulkAction?.('verify');
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-left transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <div>
                        <div className="font-semibold">Verify Selected</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">Approve teaching credentials</div>
                      </div>
                    </button>

                    <div className="border-t border-slate-100 dark:border-[#1e2c4c] my-1" />

                    <button
                      onClick={() => {
                        setBulkMenuOpen(false);
                        onTriggerBulkAction?.('delete');
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 shrink-0" />
                      <div>
                        <div className="font-semibold">Delete Selected</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">Permanently remove from roster</div>
                      </div>
                    </button>

                    {onClearSelection && (
                      <>
                        <div className="border-t border-slate-100 dark:border-[#1e2c4c] my-1" />
                        <button
                          onClick={() => {
                            setBulkMenuOpen(false);
                            onClearSelection();
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Clear Selection</span>
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pagination Status & Controls */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {total > 0 ? `${startRecord}-${endRecord} of ${total}` : '0 of 0'}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              aria-label="Previous Page"
              className="p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              aria-label="Next Page"
              className="p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Responsive Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-[#1e2c4c] text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/70 dark:bg-[#0e1629]">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={allCurrentSelected}
                  onChange={onToggleSelectAll}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
                />
              </th>
              <th className="py-3 px-2 w-10">#</th>
              <th className="py-3 px-4 min-w-[200px]">Instructor</th>
              <th className="py-3 px-4 min-w-[190px]">Email / Phone</th>
              <th className="py-3 px-4 min-w-[110px]">Courses</th>
              <th className="py-3 px-4 min-w-[110px]">Live Classes</th>
              <th className="py-3 px-4 min-w-[110px]">Attendance</th>
              <th className="py-3 px-4 min-w-[90px]">Students</th>
              <th className="py-3 px-4 min-w-[120px]">Joined At</th>
              <th className="py-3 px-4 min-w-[100px]">Status</th>
              <th className="py-3 px-4 min-w-[180px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#1e2c4c]/60 text-xs">
            {instructors.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400">
                  No instructors found matching your filter criteria.
                </td>
              </tr>
            ) : (
              instructors.map((instructor, idx) => {
                const isSelected = selectedIds.includes(instructor.id);
                const globalIndex = (page - 1) * pageSize + idx + 1;

                return (
                  <tr
                    key={instructor.id}
                    className={`hover:bg-blue-50/40 dark:hover:bg-[#14203a] transition-colors ${
                      isSelected ? 'bg-blue-50/60 dark:bg-[#152342]' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(instructor.id)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800 cursor-pointer"
                      />
                    </td>

                    {/* Index */}
                    <td className="py-3.5 px-2 font-medium text-slate-400">
                      {globalIndex}
                    </td>

                    {/* Instructor Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 shrink-0">
                          <img
                            src={instructor.avatar}
                            alt={instructor.name}
                            className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          {instructor.verification === 'Verified' && (
                            <span
                              title="Verified Instructor"
                              className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#111c34]"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 fill-blue-600 text-white" />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white truncate">
                            <span
                              onClick={() => navigate(`/admin/users/instructors/${instructor.id}/edit`)}
                              className="hover:text-blue-500 hover:underline cursor-pointer"
                            >
                              {instructor.name}
                            </span>
                            {instructor.verification === 'Verified' && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {instructor.designation}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email / Phone */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium truncate">
                        {instructor.email}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {instructor.phone}
                      </div>
                    </td>

                    {/* Courses */}
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      {instructor.coursesCount} Courses
                    </td>

                    {/* Live Classes */}
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      {instructor.liveClassesDone} / {instructor.totalLiveClasses}
                    </td>

                    {/* Attendance */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getAttendanceRing(instructor.attendancePercentage)}
                    </td>

                    {/* Students */}
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200">
                      {instructor.studentsCount}
                    </td>

                    {/* Joined At */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {instructor.joinedAt}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(instructor.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {/* View Button */}
                        <button
                          onClick={() => onViewInstructor(instructor)}
                          className="px-3 py-1 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-2xs cursor-pointer"
                        >
                          View
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => navigate(`/admin/users/instructors/${instructor.id}/edit`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                          <span>Edit</span>
                        </button>

                        {/* More Actions Dropdown */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveMenuId(activeMenuId === instructor.id ? null : instructor.id)
                            }
                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === instructor.id && (
                            <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#111c34] border border-slate-200 dark:border-[#1e2c4c] rounded-xl shadow-xl py-1 z-30 animate-in fade-in text-left">
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onViewInstructor(instructor);
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                <span>View Details</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  navigate(`/admin/users/instructors/${instructor.id}/edit`);
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                <span>Edit Profile</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  navigate(`/admin/users/instructors/${instructor.id}/edit`);
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                                <span>Assign Course</span>
                              </button>
                              <div className="border-t border-slate-100 dark:border-[#1e2c4c] my-1" />
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onDeleteInstructor(instructor.id);
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Instructor</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

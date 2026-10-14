import React, { useState, useEffect, useRef } from 'react';
import {
  Eye,
  Edit3,
  MoreVertical,
  Copy,
  Archive,
  RotateCcw,
  Trash2,
  BookOpen,
  Users,
  Check,
  X,
  ChevronDown,
  AlertCircle,
  ArrowRight,
  Camera,
  UploadCloud,
} from 'lucide-react';
import type { FreeCourse } from '../types/free-course.types';
import { ActionMenu as Dropdown, type DropdownItem } from './ActionMenu';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

interface FreeCourseTableProps {
  courses: FreeCourse[];
  totalCoursesCount: number;
  currentPage: number;
  perPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedIds: string[];
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
  onToggleSelectOne: (id: string) => void;
  onView: (course: FreeCourse) => void;
  onEdit: (course: FreeCourse) => void;
  onDuplicate: (id: string) => void;
  onTogglePublish: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (course: FreeCourse) => void;
  onManageContent: (course: FreeCourse) => void;
  onViewEnrollments: (course: FreeCourse) => void;
  onUpdateStatus?: (courseId: string, nextStatus: FreeCourse['status']) => Promise<any> | void;
  onUpdateApprovalStatus?: (courseId: string, nextApproval: FreeCourse['approvalStatus']) => Promise<any> | void;
  onUpdateThumbnail?: (courseId: string, thumbnail: string) => Promise<any> | void;
}

export const FreeCourseTable: React.FC<FreeCourseTableProps> = ({
  courses,
  totalCoursesCount,
  currentPage,
  perPage,
  totalPages,
  onPageChange,
  selectedIds,
  isAllSelected,
  onToggleSelectAll,
  onToggleSelectOne,
  onView,
  onEdit,
  onDuplicate,
  onTogglePublish,
  onArchive,
  onRestore,
  onDelete,
  onManageContent,
  onViewEnrollments,
  onUpdateStatus,
  onUpdateApprovalStatus,
  onUpdateThumbnail,
}) => {
  // State for active inline dropdown popover (matching Image 2)
  const [activeDropdown, setActiveDropdown] = useState<{
    courseId: string;
    type: 'status' | 'approvalStatus';
  } | null>(null);

  // State for status change confirmation modal (popup)
  const [confirmChange, setConfirmChange] = useState<{
    course: FreeCourse;
    type: 'status' | 'approvalStatus';
    currentValue: string;
    nextValue: string;
  } | null>(null);

  // State for Quick Thumbnail CRUD modal
  const [quickThumbnailCourse, setQuickThumbnailCourse] = useState<{
    course: FreeCourse;
    thumbnail: string;
  } | null>(null);
  const [isSavingThumbnail, setIsSavingThumbnail] = useState(false);
  const quickFileRef = useRef<HTMLInputElement>(null);

  const [isUpdating, setIsUpdating] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.status-dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    if (activeDropdown) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [activeDropdown]);

  const handleConfirmUpdate = async () => {
    if (!confirmChange) return;
    setIsUpdating(true);
    try {
      if (confirmChange.type === 'status') {
        await onUpdateStatus?.(confirmChange.course.id, confirmChange.nextValue as FreeCourse['status']);
      } else {
        await onUpdateApprovalStatus?.(
          confirmChange.course.id,
          confirmChange.nextValue as FreeCourse['approvalStatus']
        );
      }
      setConfirmChange(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getSubjectBadgeVariant = (subject: string): 'purple' | 'teal' | 'warning' | 'info' | 'neutral' => {
    const s = subject.toLowerCase();
    if (s.includes('sci') || s.includes('bio')) return 'teal';
    if (s.includes('chem') || s.includes('phy')) return 'purple';
    if (s.includes('math')) return 'info';
    if (s.includes('eng') || s.includes('hindi')) return 'warning';
    return 'neutral';
  };

  const startIndex = (currentPage - 1) * perPage + 1;
  const endIndex = Math.min(currentPage * perPage, totalCoursesCount);

  if (courses.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-2xl p-12 text-center shadow-lg">
        <div className="w-14 h-14 rounded-2xl bg-[#EAF0FE] border border-blue-200 text-[#2451D9] dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 flex items-center justify-center mx-auto mb-3.5">
          <BookOpen className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-[#12141C] dark:text-white mb-1">No Free Courses Found</h3>
        <p className="text-xs text-[#686E7D] dark:text-slate-400 max-w-sm mx-auto">
          No free courses match your active search or filter criteria. Try adjusting filters or add a new free course.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E6E8EE] dark:border-[#334155] bg-[#F6F7FA] dark:bg-[#0B0F19]/50 text-[11px] uppercase tracking-wider text-[#686E7D] dark:text-slate-400 font-semibold select-none">
              <th className="py-3.5 px-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B0F19] text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="py-3.5 px-2 w-12 text-[#686E7D] dark:text-slate-400">SN</th>
              <th className="py-3.5 px-4 min-w-[240px]">Course</th>
              <th className="py-3.5 px-4 min-w-[170px]">Instructor</th>
              <th className="py-3.5 px-3 min-w-[120px]">Subjects</th>
              <th className="py-3.5 px-3 min-w-[100px]">Class</th>
              <th className="py-3.5 px-3 min-w-[100px]">Students</th>
              <th className="py-3.5 px-3 min-w-[100px]">Price</th>
              <th className="py-3.5 px-3 min-w-[110px]">Status</th>
              <th className="py-3.5 px-3 min-w-[110px]">Approval Status</th>
              <th className="py-3.5 px-4 min-w-[130px]">Created Date</th>
              <th className="py-3.5 px-4 text-right min-w-[110px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E8EE] dark:divide-[#334155]">
            {courses.map((course, idx) => {
              const isSelected = selectedIds.includes(course.id);
              const sn = totalCoursesCount - ((currentPage - 1) * perPage + idx);

              const dropdownItems: DropdownItem[] = [
                {
                  id: 'view',
                  label: 'View Details',
                  icon: <Eye className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />,
                  onClick: () => onView(course),
                },
                {
                  id: 'edit',
                  label: 'Edit Course',
                  icon: <Edit3 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />,
                  onClick: () => onEdit(course),
                },
                {
                  id: 'content',
                  label: 'Manage Content',
                  icon: <BookOpen className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />,
                  onClick: () => onManageContent(course),
                },
                {
                  id: 'enrollments',
                  label: 'View Enrollments',
                  icon: <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
                  onClick: () => onViewEnrollments(course),
                },
                {
                  id: 'duplicate',
                  label: 'Duplicate Course',
                  icon: <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />,
                  onClick: () => onDuplicate(course.id),
                },
                course.status === 'Published'
                  ? {
                      id: 'unpublish',
                      label: 'Unpublish (Draft)',
                      icon: <X className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
                      onClick: () => onTogglePublish(course.id),
                    }
                  : {
                      id: 'publish',
                      label: 'Publish Course',
                      icon: <Check className="w-3.5 h-3.5 text-[#16A34A] dark:text-emerald-400" />,
                      onClick: () => onTogglePublish(course.id),
                    },
                course.status === 'Archived'
                  ? {
                      id: 'restore',
                      label: 'Restore Course',
                      icon: <RotateCcw className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />,
                      onClick: () => onRestore(course.id),
                    }
                  : {
                      id: 'archive',
                      label: 'Archive Course',
                      icon: <Archive className="w-3.5 h-3.5 text-[#686E7D] dark:text-slate-400" />,
                      onClick: () => onArchive(course.id),
                    },
                {
                  id: 'delete',
                  label: 'Delete Course',
                  icon: <Trash2 className="w-3.5 h-3.5 text-[#DC5B3E] dark:text-rose-400" />,
                  danger: true,
                  onClick: () => onDelete(course),
                },
              ];

              return (
                <tr
                  key={course.id}
                  className={`hover:bg-slate-50 dark:hover:bg-[#121c36] transition-colors group ${
                    isSelected ? 'bg-[#EAF0FE]/60 dark:bg-[#152342]/60' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <td className="py-3.5 px-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectOne(course.id)}
                      className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B0F19] text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                  </td>

                  {/* Serial Number */}
                  <td className="py-3.5 px-2 text-[#686E7D] dark:text-slate-400 font-mono text-[11px]">
                    {sn}
                  </td>

                  {/* Course Details (Thumbnail + Title + Subtitle) */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative group/thumb shrink-0">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-11 h-11 rounded-xl object-cover border border-[#E6E8EE] dark:border-slate-700/60 bg-slate-100 dark:bg-slate-900 shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=80';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setQuickThumbnailCourse({ course, thumbnail: course.thumbnail })
                          }
                          className="absolute inset-0 bg-black/65 opacity-0 group-hover/thumb:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white cursor-pointer shadow-md"
                          title="Click to update / replace / delete thumbnail"
                        >
                          <Camera className="w-4 h-4 text-blue-300" />
                        </button>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onView(course)}
                            className="font-bold text-[#12141C] dark:text-white text-xs hover:text-[#2451D9] dark:hover:text-blue-400 transition-colors truncate max-w-xs text-left"
                            title={course.title}
                          >
                            {course.title}
                          </button>
                        </div>
                        <p className="text-[11px] text-[#686E7D] dark:text-slate-400 truncate mt-0.5">
                          {course.courseCode} • {course.courseType}: {course.targetClass}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Instructor */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={course.instructor.avatar}
                        alt={course.instructor.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0 border border-[#E6E8EE] dark:border-slate-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80';
                        }}
                      />
                      <span className="font-semibold text-slate-600 dark:text-slate-200 text-xs truncate max-w-[120px]">
                        {course.instructor.name}
                      </span>
                    </div>
                  </td>

                  {/* Subjects */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={getSubjectBadgeVariant(course.primarySubject)} size="sm">
                        {course.primarySubject}
                      </Badge>
                    </div>
                  </td>

                  {/* Class */}
                  <td className="py-3.5 px-3 font-semibold text-slate-600 dark:text-slate-200 text-xs">
                    {course.targetClass}
                  </td>

                  {/* Students / Enrollments */}
                  <td className="py-3.5 px-3">
                    <button
                      onClick={() => onViewEnrollments(course)}
                      className="font-semibold text-slate-600 dark:text-slate-200 hover:text-[#2451D9] dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer transition-colors"
                      title="View enrolled students"
                    >
                      <span>{course.enrollmentsCount.toLocaleString()}</span>
                    </button>
                  </td>

                  {/* Price (CRITICAL: 100% Free Guarantee) */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-[#16A34A] dark:text-emerald-400 text-xs tracking-tight">
                        ₹0.00
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#16A34A] dark:text-emerald-500">
                        FREE
                      </span>
                    </div>
                  </td>

                  {/* Status (Clickable Dropdown matching Image 2) */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="relative inline-block status-dropdown-container">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown?.courseId === course.id && activeDropdown?.type === 'status'
                              ? null
                              : { courseId: course.id, type: 'status' }
                          )
                        }
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer select-none shadow-sm ${
                          course.status === 'Published'
                            ? 'bg-[#E7F7ED] border-emerald-200 text-[#16A34A] hover:bg-emerald-100 dark:bg-emerald-500/15 dark:border-emerald-500/35 dark:text-emerald-400 dark:hover:bg-emerald-500/25'
                            : course.status === 'Draft'
                            ? 'bg-[#FCEAE4] border-rose-200 text-[#DC5B3E] hover:bg-rose-100 dark:bg-rose-500/15 dark:border-rose-500/35 dark:text-rose-400 dark:hover:bg-rose-500/25'
                            : 'bg-[#EAF0FE] border-blue-200 text-[#2451D9] hover:bg-blue-100 dark:bg-blue-500/15 dark:border-blue-500/35 dark:text-blue-400 dark:hover:bg-blue-500/25'
                        }`}
                        title="Click to change status"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            course.status === 'Published'
                              ? 'bg-emerald-500 dark:bg-emerald-400'
                              : course.status === 'Draft'
                              ? 'bg-rose-500 dark:bg-rose-400'
                              : 'bg-blue-500 dark:bg-blue-400'
                          }`}
                        />
                        <span>{course.status}</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${
                            activeDropdown?.courseId === course.id && activeDropdown?.type === 'status'
                              ? 'rotate-180'
                              : ''
                          }`}
                        />
                      </button>

                      {/* Dropdown Popover matching Image 2 */}
                      {activeDropdown?.courseId === course.id && activeDropdown?.type === 'status' && (
                        <div className="absolute left-0 top-full mt-1.5 w-44 bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-xl shadow-2xl z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                          <div className="px-3 py-1.5 text-[10px] font-extrabold text-[#686E7D] dark:text-slate-400 uppercase tracking-wider border-b border-[#E6E8EE] dark:border-[#334155]">
                            SELECT STATUS
                          </div>
                          <div className="py-1">
                            {(['Published', 'Draft', 'Archived'] as const).map((opt) => {
                              const isCurrent = course.status === opt;
                              const dotColor =
                                opt === 'Published'
                                  ? 'bg-emerald-500 dark:bg-emerald-400'
                                  : opt === 'Draft'
                                  ? 'bg-rose-500 dark:bg-rose-400'
                                  : 'bg-blue-500 dark:bg-blue-400';
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => {
                                    setActiveDropdown(null);
                                    if (!isCurrent) {
                                      setConfirmChange({
                                        course,
                                        type: 'status',
                                        currentValue: course.status,
                                        nextValue: opt,
                                      });
                                    }
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer text-left ${
                                    isCurrent
                                      ? 'bg-[#EAF0FE] font-bold text-[#12141C] dark:bg-blue-600/15 dark:text-white'
                                      : 'text-slate-600 hover:bg-slate-100 hover:text-[#12141C] dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                                    <span>{opt}</span>
                                  </div>
                                  {isCurrent && <Check className="w-3.5 h-3.5 text-[#2451D9] dark:text-blue-400 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Approval Status (Clickable Dropdown matching Image 2) */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="relative inline-block status-dropdown-container">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown?.courseId === course.id && activeDropdown?.type === 'approvalStatus'
                              ? null
                              : { courseId: course.id, type: 'approvalStatus' }
                          )
                        }
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer select-none shadow-sm ${
                          course.approvalStatus === 'Approved'
                            ? 'bg-[#E7F7ED] border-emerald-200 text-[#16A34A] hover:bg-emerald-100 dark:bg-emerald-500/15 dark:border-emerald-500/35 dark:text-emerald-400 dark:hover:bg-emerald-500/25'
                            : 'bg-[#FDF3E0] border-amber-200 text-[#D97706] hover:bg-amber-100 dark:bg-amber-500/15 dark:border-amber-500/35 dark:text-amber-400 dark:hover:bg-amber-500/25'
                        }`}
                        title="Click to change approval status"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            course.approvalStatus === 'Approved'
                              ? 'bg-emerald-500 dark:bg-emerald-400'
                              : 'bg-amber-500 dark:bg-amber-400'
                          }`}
                        />
                        <span>{course.approvalStatus === 'Approved' ? 'Approved' : 'Pending'}</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${
                            activeDropdown?.courseId === course.id && activeDropdown?.type === 'approvalStatus'
                              ? 'rotate-180'
                              : ''
                          }`}
                        />
                      </button>

                      {/* Dropdown Popover matching Image 2 */}
                      {activeDropdown?.courseId === course.id && activeDropdown?.type === 'approvalStatus' && (
                        <div className="absolute left-0 top-full mt-1.5 w-44 bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-xl shadow-2xl z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                          <div className="px-3 py-1.5 text-[10px] font-extrabold text-[#686E7D] dark:text-slate-400 uppercase tracking-wider border-b border-[#E6E8EE] dark:border-[#334155]">
                            SELECT APPROVAL
                          </div>
                          <div className="py-1">
                            {(['Approved', 'Pending'] as const).map((opt) => {
                              const isCurrent = course.approvalStatus === opt;
                              const dotColor =
                                opt === 'Approved'
                                  ? 'bg-emerald-500 dark:bg-emerald-400'
                                  : 'bg-amber-500 dark:bg-amber-400';
                              const displayLabel = opt === 'Approved' ? 'Approved' : 'Pending Review';
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => {
                                    setActiveDropdown(null);
                                    if (!isCurrent) {
                                      setConfirmChange({
                                        course,
                                        type: 'approvalStatus',
                                        currentValue: course.approvalStatus,
                                        nextValue: opt,
                                      });
                                    }
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer text-left ${
                                    isCurrent
                                      ? 'bg-[#EAF0FE] font-bold text-[#12141C] dark:bg-blue-600/15 dark:text-white'
                                      : 'text-slate-600 hover:bg-slate-100 hover:text-[#12141C] dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                                    <span>{displayLabel}</span>
                                  </div>
                                  {isCurrent && <Check className="w-3.5 h-3.5 text-[#2451D9] dark:text-blue-400 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Created Date */}
                  <td className="py-3.5 px-4 text-[#686E7D] dark:text-slate-400 text-[11px] whitespace-nowrap">
                    {course.createdAt}
                  </td>

                  {/* Actions Column (Matching uploaded reference design) */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {/* View Action (Solid Blue Button) */}
                      <button
                        onClick={() => onView(course)}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                        title="View Course Details"
                      >
                        View
                      </button>

                      {/* Edit Action (Bordered with pencil icon and text) */}
                      <button
                        onClick={() => onEdit(course)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E6E8EE] bg-white hover:bg-slate-50 text-slate-700 hover:text-[#12141C] dark:border-slate-700/90 dark:bg-slate-800/80 dark:hover:bg-slate-700/90 dark:hover:border-slate-600 dark:text-slate-200 dark:hover:text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
                        title="Edit Course"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
                        <span>Edit</span>
                      </button>

                      {/* Dropdown Menu (Three dots) */}
                      <Dropdown
                        trigger={
                          <button
                            className="p-1.5 rounded-lg text-[#686E7D] dark:text-slate-400 hover:text-[#12141C] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="More Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        }
                        items={dropdownItems}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-4 border-t border-[#E6E8EE] dark:border-[#334155] bg-[#F6F7FA] dark:bg-[#0B0F19]/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#686E7D] dark:text-slate-400">
        <div>
          Showing{' '}
          <span className="font-semibold text-[#12141C] dark:text-white">{startIndex}</span> to{' '}
          <span className="font-semibold text-[#12141C] dark:text-white">{endIndex}</span> of{' '}
          <span className="font-semibold text-[#12141C] dark:text-white">{totalCoursesCount}</span> free courses
        </div>

        <div className="flex items-center gap-1.5 select-none">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 rounded-xl border border-[#E6E8EE] dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-[#12141C] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
            // Keep pagination compact if many pages
            if (
              totalPages > 7 &&
              Math.abs(pageNum - currentPage) > 2 &&
              pageNum !== 1 &&
              pageNum !== totalPages
            ) {
              if (pageNum === 2 || pageNum === totalPages - 1) {
                return (
                  <span key={pageNum} className="px-1 text-slate-400 dark:text-slate-500">
                    ...
                  </span>
                );
              }
              return null;
            }

            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                    : 'border border-[#E6E8EE] dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-[#12141C] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-1.5 rounded-xl border border-[#E6E8EE] dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-[#12141C] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Status & Approval Change Confirmation Modal (Popup) */}
      {confirmChange && (
        <Modal
          isOpen={true}
          onClose={() => {
            if (!isUpdating) setConfirmChange(null);
          }}
          title={
            <div className="flex items-center gap-2.5 text-[#12141C] dark:text-white font-bold text-base">
              <div className="w-8 h-8 rounded-xl bg-[#FDF3E0] border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/25 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-[#D97706] dark:text-amber-400" />
              </div>
              <span>
                Confirm {confirmChange.type === 'status' ? 'Status' : 'Approval Status'} Update
              </span>
            </div>
          }
          maxWidth="md"
          footer={
            <div className="flex items-center justify-end gap-2.5 w-full">
              <Button
                variant="outline"
                size="md"
                onClick={() => setConfirmChange(null)}
                disabled={isUpdating}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleConfirmUpdate}
                disabled={isUpdating}
                icon={isUpdating ? undefined : <Check className="w-4 h-4" />}
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4 py-1 text-xs">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-200">
              Kya aap is course ka{' '}
              <span className="text-[#2451D9] dark:text-blue-400 font-bold">
                {confirmChange.type === 'status' ? 'Status' : 'Approval Status'}
              </span>{' '}
              change karna chahte hain?
            </p>

            {/* Course Information Box */}
            <div className="p-3.5 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-[#E6E8EE] dark:border-[#334155] space-y-1">
              <div className="text-[10px] text-[#686E7D] dark:text-slate-400 uppercase tracking-wider font-extrabold">
                Course:
              </div>
              <div className="font-bold text-[#12141C] dark:text-white text-xs leading-snug">
                {confirmChange.course.title}
              </div>
              <div className="text-[11px] text-[#686E7D] dark:text-slate-400 font-mono flex items-center gap-2">
                <span>Code: {confirmChange.course.courseCode}</span>
                <span>•</span>
                <span className="text-[#2451D9] dark:text-blue-400 font-sans font-semibold">
                  {confirmChange.course.targetClass}
                </span>
              </div>
            </div>

            {/* Visual Value Comparison */}
            <div className="flex items-center justify-center gap-4 p-4 bg-[#F6F7FA] dark:bg-[#0B0F19]/70 rounded-xl border border-[#E6E8EE] dark:border-[#334155]">
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-[#686E7D] dark:text-slate-400">Current</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    confirmChange.currentValue === 'Published' || confirmChange.currentValue === 'Approved'
                      ? 'bg-[#E7F7ED] border-emerald-200 text-[#16A34A] dark:bg-emerald-500/15 dark:border-emerald-500/35 dark:text-emerald-400'
                      : confirmChange.currentValue === 'Draft'
                      ? 'bg-[#FCEAE4] border-rose-200 text-[#DC5B3E] dark:bg-rose-500/15 dark:border-rose-500/35 dark:text-rose-400'
                      : 'bg-[#FDF3E0] border-amber-200 text-[#D97706] dark:bg-amber-500/15 dark:border-amber-500/35 dark:text-amber-400'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      confirmChange.currentValue === 'Published' || confirmChange.currentValue === 'Approved'
                        ? 'bg-emerald-500 dark:bg-emerald-400'
                        : confirmChange.currentValue === 'Draft'
                        ? 'bg-rose-500 dark:bg-rose-400'
                        : 'bg-amber-500 dark:bg-amber-400'
                    }`}
                  />
                  <span>
                    {confirmChange.currentValue === 'Pending' ? 'Pending Review' : confirmChange.currentValue}
                  </span>
                </span>
              </div>

              <ArrowRight className="w-5 h-5 text-[#2451D9] dark:text-blue-400 shrink-0 mt-4" />

              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-[#686E7D] dark:text-slate-400">New Value</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    confirmChange.nextValue === 'Published' || confirmChange.nextValue === 'Approved'
                      ? 'bg-[#E7F7ED] border-emerald-200 text-[#16A34A] ring-2 ring-emerald-500/20 dark:bg-emerald-500/15 dark:border-emerald-500/35 dark:text-emerald-400'
                      : confirmChange.nextValue === 'Draft'
                      ? 'bg-[#FCEAE4] border-rose-200 text-[#DC5B3E] ring-2 ring-rose-500/20 dark:bg-rose-500/15 dark:border-rose-500/35 dark:text-rose-400'
                      : 'bg-[#FDF3E0] border-amber-200 text-[#D97706] ring-2 ring-amber-500/20 dark:bg-amber-500/15 dark:border-amber-500/35 dark:text-amber-400'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      confirmChange.nextValue === 'Published' || confirmChange.nextValue === 'Approved'
                        ? 'bg-emerald-500 dark:bg-emerald-400'
                        : confirmChange.nextValue === 'Draft'
                        ? 'bg-rose-500 dark:bg-rose-400'
                        : 'bg-amber-500 dark:bg-amber-400'
                    }`}
                  />
                  <span>
                    {confirmChange.nextValue === 'Pending' ? 'Pending Review' : confirmChange.nextValue}
                  </span>
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#686E7D] dark:text-slate-400">
              Note: "Update" par click karte hi ye change database aur live KPI metrics mein turant reflect ho jayega.
            </p>
          </div>
        </Modal>
      )}

      {/* Quick Edit Thumbnail Modal */}
      {quickThumbnailCourse && (
        <Modal
          isOpen={true}
          onClose={() => {
            if (!isSavingThumbnail) setQuickThumbnailCourse(null);
          }}
          title={
            <div className="flex items-center gap-2 text-[#12141C] dark:text-white font-bold text-base">
              <Camera className="w-5 h-5 text-[#2451D9] dark:text-blue-400" />
              <span>Edit Course Thumbnail</span>
            </div>
          }
          maxWidth="md"
          footer={
            <div className="flex items-center justify-between w-full">
              {quickThumbnailCourse.thumbnail ? (
                <button
                  type="button"
                  onClick={() =>
                    setQuickThumbnailCourse((prev) =>
                      prev ? { ...prev, thumbnail: '' } : null
                    )
                  }
                  className="px-3 py-1.5 rounded-xl border border-rose-300 bg-[#FCEAE4] hover:bg-rose-100 text-[#DC5B3E] dark:border-rose-500/40 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#DC5B3E] dark:text-rose-400" />
                  <span>Delete Thumbnail</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-500">No image attached</span>
              )}

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickThumbnailCourse(null)}
                  disabled={isSavingThumbnail}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isSavingThumbnail}
                  onClick={async () => {
                    if (!quickThumbnailCourse) return;
                    setIsSavingThumbnail(true);
                    try {
                      await onUpdateThumbnail?.(
                        quickThumbnailCourse.course.id,
                        quickThumbnailCourse.thumbnail
                      );
                      setQuickThumbnailCourse(null);
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setIsSavingThumbnail(false);
                    }
                  }}
                  icon={<Check className="w-3.5 h-3.5" />}
                >
                  {isSavingThumbnail ? 'Saving...' : 'Save Thumbnail'}
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 py-1 text-xs">
            {/* Course Information */}
            <div className="p-3 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-[#E6E8EE] dark:border-[#334155] space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-[#686E7D] dark:text-slate-400">Course</span>
              <p className="font-bold text-[#12141C] dark:text-white text-xs leading-snug">
                {quickThumbnailCourse.course.title}
              </p>
              <span className="text-[11px] text-slate-500 font-mono">
                Code: {quickThumbnailCourse.course.courseCode} • {quickThumbnailCourse.course.targetClass}
              </span>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={quickFileRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                      setQuickThumbnailCourse((prev) =>
                        prev ? { ...prev, thumbnail: reader.result as string } : null
                      );
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
              accept="image/*"
              className="hidden"
            />

            {/* Preview Box / Dropzone */}
            {quickThumbnailCourse.thumbnail ? (
              <div className="relative group h-44 rounded-xl overflow-hidden border border-[#E6E8EE] dark:border-slate-700 bg-slate-100 dark:bg-slate-950 shadow-md">
                <img
                  src={quickThumbnailCourse.thumbnail}
                  alt="Thumbnail Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => quickFileRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload New</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQuickThumbnailCourse((prev) =>
                        prev ? { ...prev, thumbnail: '' } : null
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1 shadow-md cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-semibold text-slate-300">
                  16:9 • Course Cover
                </div>
              </div>
            ) : (
              <div
                onClick={() => quickFileRef.current?.click()}
                className="h-40 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-[#F6F7FA] dark:bg-[#0B0F19] flex flex-col items-center justify-center p-4 cursor-pointer transition-colors text-center group"
              >
                <UploadCloud className="w-7 h-7 text-[#2451D9] dark:text-blue-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-[#12141C] dark:text-white text-xs group-hover:text-[#2451D9] dark:group-hover:text-blue-400">
                  Click to Upload Image from Device
                </span>
                <span className="text-[11px] text-[#686E7D] dark:text-slate-400 mt-0.5">
                  Supports JPG, PNG, WebP up to 5MB
                </span>
              </div>
            )}

            {/* Upload Button & URL input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600 dark:text-slate-300 text-xs">Image URL / Path</span>
                <button
                  type="button"
                  onClick={() => quickFileRef.current?.click()}
                  className="text-xs text-[#2451D9] dark:text-blue-400 hover:underline dark:hover:text-white underline cursor-pointer flex items-center gap-1"
                >
                  <UploadCloud className="w-3 h-3" />
                  <span>Browse Device</span>
                </button>
              </div>
              <input
                type="text"
                value={quickThumbnailCourse.thumbnail}
                onChange={(e) =>
                  setQuickThumbnailCourse((prev) =>
                    prev ? { ...prev, thumbnail: e.target.value } : null
                  )
                }
                placeholder="https://... or upload from device"
                className="w-full bg-white dark:bg-[#0B0F19] border border-[#e2e8f0] dark:border-[#374151] text-[#0f172a] dark:text-gray-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#3b82f6]"
              />
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-[#686E7D] dark:text-slate-400 font-semibold block">
                Quick Subject Presets:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {[
                  {
                    label: 'Science',
                    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80',
                  },
                  {
                    label: 'Math',
                    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
                  },
                  {
                    label: 'Physics',
                    url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80',
                  },
                  {
                    label: 'Chemistry',
                    url: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&auto=format&fit=crop&q=80',
                  },
                  {
                    label: 'Tech',
                    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
                  },
                  {
                    label: 'Books',
                    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
                  },
                ].map((st) => (
                  <button
                    type="button"
                    key={st.label}
                    onClick={() =>
                      setQuickThumbnailCourse((prev) =>
                        prev ? { ...prev, thumbnail: st.url } : null
                      )
                    }
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors shrink-0 cursor-pointer ${
                      quickThumbnailCourse.thumbnail === st.url
                        ? 'bg-[#EAF0FE] border-blue-500 text-[#2451D9] font-bold dark:bg-blue-600/30 dark:text-blue-300'
                        : 'border-[#E6E8EE] bg-slate-50 text-[#686E7D] hover:text-[#12141C] dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
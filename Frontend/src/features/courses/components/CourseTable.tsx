// src/features/courses/components/CourseTable.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Eye, Pencil, MoreVertical, ChevronLeft, ChevronRight,
  CheckSquare, Square, Trash2, Download, CheckCircle, Clock, Archive,
  Copy, AlertCircle,
} from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { useUIStore } from '../../../store/ui.store';
import type { Course, CourseStatus, ApprovalStatus } from '../types/course.types';

interface CourseTableProps {
  courses: Course[];
  selectedIds: string[];
  onToggleSelectAll: () => void;
  onToggleSelectRow: (id: string) => void;
  onViewCourse: (course: Course) => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
  onDuplicateCourse: (course: Course) => void;
  onChangeStatus: (id: string, newStatus: CourseStatus) => void;
  onChangeApprovalStatus: (id: string, newApproval: ApprovalStatus) => void;
  onBulkDelete: () => void;
  onBulkStatusChange: (status: CourseStatus) => void;
  onBulkExport: () => void;
  // currency prop REMOVED — now read from global store below
  currentPage: number;
  setCurrentPage: (p: number) => void;
  perPage: number;
}

const STATUS_BADGE: Record<CourseStatus, { variant: 'success' | 'warning' | 'neutral' | 'brand'; dot: boolean }> = {
  Published: { variant: 'success', dot: true },
  'Pending Review': { variant: 'warning', dot: true },
  Draft: { variant: 'neutral', dot: true },
  Archived: { variant: 'brand', dot: true },
};

const APPROVAL_BADGE: Record<ApprovalStatus, { variant: 'success' | 'warning' | 'danger' }> = {
  Approved: { variant: 'success' },
  Pending: { variant: 'warning' },
  Rejected: { variant: 'danger' },
};

const CATEGORY_VARIANT: Record<string, 'accent' | 'brand' | 'warning' | 'teal' | 'success' | 'neutral'> = {
  science: 'accent',
  physics: 'brand',
  mathematics: 'warning',
  chemistry: 'teal',
  biology: 'success',
  'computer science': 'accent',
  english: 'warning',
};

export const CourseTable: React.FC<CourseTableProps> = ({
  courses, selectedIds, onToggleSelectAll, onToggleSelectRow, onViewCourse, onEditCourse,
  onDeleteCourse, onDuplicateCourse, onChangeStatus, onChangeApprovalStatus,
  onBulkDelete, onBulkStatusChange, onBulkExport,
  currentPage, setCurrentPage, perPage,
}) => {
  const { currency } = useUIStore(); // <-- NEW: pulled from global store instead of a prop
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setActiveActionMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalItems = courses.length;
  const totalPages = Math.ceil(totalItems / perPage) || 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * perPage;
  const currentCourses = courses.slice(startIndex, startIndex + perPage);

  const isAllSelected = currentCourses.length > 0 && currentCourses.every((c) => selectedIds.includes(c.id));
  const isSomeSelected = currentCourses.some((c) => selectedIds.includes(c.id)) && !isAllSelected;

  const formatPrice = (price: number, isFree: boolean) => {
    const sym = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '€';
    if (isFree || price === 0) return { amount: `${sym}0.00`, isFree: true };
    const conv = currency === 'INR' ? price : currency === 'USD' ? (price / 83).toFixed(2) : (price / 90).toFixed(2);
    return { amount: `${sym}${conv}`, isFree: false };
  };

  const categoryVariant = (category: string) => CATEGORY_VARIANT[category.toLowerCase()] ?? 'neutral';
 
  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#e2e8f0] dark:border-[#334155] shadow-2xs overflow-hidden">
      {selectedIds.length > 0 && (
        <div className="bg-blue-50/80 dark:bg-blue-500/10 border-b border-blue-200 dark:border-blue-500/20 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <span className="text-sm font-semibold text-[#0f172a] dark:text-gray-100">
            {selectedIds.length} course{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => onBulkStatusChange('Published')} className="px-2.5 py-1.5 bg-white dark:bg-[#1E293B] border border-[#e2e8f0] dark:border-[#334155] text-emerald-700 dark:text-emerald-400 rounded-md text-xs font-medium hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer">
              <CheckCircle className="w-3.5 h-3.5" /><span>Publish Selected</span>
            </button>
            <button onClick={() => onBulkStatusChange('Draft')} className="px-2.5 py-1.5 bg-white dark:bg-[#1E293B] border border-[#e2e8f0] dark:border-[#334155] text-slate-700 dark:text-gray-300 rounded-md text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer">
              <Clock className="w-3.5 h-3.5" /><span>Set Draft</span>
            </button>
            <button onClick={() => onBulkStatusChange('Archived')} className="px-2.5 py-1.5 bg-white dark:bg-[#1E293B] border border-[#e2e8f0] dark:border-[#334155] text-[#3b82f6] rounded-md text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer">
              <Archive className="w-3.5 h-3.5" /><span>Archive</span>
            </button>
            <button onClick={onBulkExport} className="px-2.5 py-1.5 bg-white dark:bg-[#1E293B] border border-[#e2e8f0] dark:border-[#334155] text-slate-700 dark:text-gray-300 rounded-md text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer">
              <Download className="w-3.5 h-3.5" /><span>Export</span>
            </button>
            <button onClick={onBulkDelete} className="px-2.5 py-1.5 bg-rose-600 text-white rounded-md text-xs font-medium hover:bg-rose-700 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" /><span>Delete</span>
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto min-h-87.5">
        <table className="w-full text-left border-collapse min-w-300">
          <thead>
            <tr className="border-b border-[#e2e8f0] dark:border-[#334155] bg-slate-50/70 dark:bg-slate-800/40">
              <th className="py-3 px-4 w-12 text-center">
                <button onClick={onToggleSelectAll} className="text-slate-500 dark:text-gray-400 hover:text-[#3b82f6] transition-colors cursor-pointer" title="Select All">
                  {isAllSelected ? <CheckSquare className="w-4 h-4 text-[#3b82f6]" /> : isSomeSelected ? (
                    <div className="w-4 h-4 rounded bg-[#3b82f6] flex items-center justify-center text-white text-[10px] font-bold">-</div>
                  ) : <Square className="w-4 h-4 text-slate-400" />}
                </button>
              </th>
              {['SN', 'Course', 'Instructor', 'Subjects', 'Level', 'Students', 'Price', 'Status', 'Approval Status', 'Created Date'].map((h) => (
                <th key={h} className="py-3 px-4 text-xs font-semibold text-[#64748b] dark:text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
              <th className="py-3 px-4 text-xs font-semibold text-[#64748b] dark:text-gray-400 uppercase tracking-wider text-center w-28">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-[#e2e8f0] dark:divide-[#334155]">
            {currentCourses.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-500 dark:text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 text-slate-300 dark:text-gray-600" />
                    <p className="font-semibold text-slate-700 dark:text-gray-300">No courses match your filters</p>
                    <p className="text-xs text-slate-400 dark:text-gray-500">Try clearing search queries or resetting status filters.</p>
                  </div>
                </td>
              </tr>
            ) : currentCourses.map((course, idx) => {
              const isSelected = selectedIds.includes(course.id);
              const priceInfo = formatPrice(course.price, course.isFree);
              return (
                <tr key={course.id} className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-blue-50/40 dark:bg-blue-500/5' : ''}`}>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => onToggleSelectRow(course.id)} className="text-slate-400 hover:text-[#3b82f6] cursor-pointer">
                      {isSelected ? <CheckSquare className="w-4 h-4 text-[#3b82f6]" /> : <Square className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-gray-400 font-medium">{course.sn || startIndex + idx + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={course.thumbnail} alt={course.title} className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-[#e2e8f0] dark:border-[#334155] shrink-0"
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&auto=format&fit=crop&q=80'; }} />
                      <div className="max-w-50 xl:max-w-60">
                        <p onClick={() => onViewCourse(course)} className="font-medium text-[#0f172a] dark:text-gray-100 hover:text-[#3b82f6] cursor-pointer line-clamp-1 transition-colors" title={course.title}>
                          {course.title}
                        </p>
                        <p className="text-xs text-[#64748b] dark:text-gray-400 truncate">{course.subtitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <img src={course.instructorAvatar} alt={course.instructorName} className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-600"
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80'; }} />
                      <span className="text-[#0f172a] dark:text-gray-100 font-medium whitespace-nowrap">{course.instructorName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4"><Badge variant={categoryVariant(course.category)} size="xs">{course.category}</Badge></td>
                  <td className="py-3 px-4 text-[#0f172a] dark:text-gray-100 font-medium whitespace-nowrap">{course.level}</td>
                  <td className="py-3 px-4 text-[#0f172a] dark:text-gray-100 font-medium whitespace-nowrap">{course.studentsCount.toLocaleString()}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <p className="text-[#0f172a] dark:text-gray-100 font-medium leading-tight">{priceInfo.amount}</p>
                    <p className={`text-xs font-medium ${priceInfo.isFree ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-gray-400'}`}>
                      {priceInfo.isFree ? 'Free' : 'Paid'}
                    </p>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <Badge variant={STATUS_BADGE[course.status].variant} dot>{course.status}</Badge>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <Badge variant={APPROVAL_BADGE[course.approvalStatus].variant}>{course.approvalStatus}</Badge>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <p className="text-[#0f172a] dark:text-gray-100 leading-tight font-medium text-xs">{course.createdDate}</p>
                    <p className="text-[11px] text-[#64748b] dark:text-gray-400">{course.createdTime}</p>
                  </td>
                  <td className="py-3 px-4 relative">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onViewCourse(course)} className="w-7 h-7 flex items-center justify-center rounded-md text-[#64748b] dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#0f172a] dark:hover:text-gray-100 transition-colors cursor-pointer" title="View Course">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => onEditCourse(course)} className="w-7 h-7 flex items-center justify-center rounded-md text-[#64748b] dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#0f172a] dark:hover:text-gray-100 transition-colors cursor-pointer" title="Edit Course">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button onClick={(e) => { e.stopPropagation(); setActiveActionMenuId(activeActionMenuId === course.id ? null : course.id); }}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-[#64748b] dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#0f172a] dark:hover:text-gray-100 transition-colors cursor-pointer" title="More options">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {activeActionMenuId === course.id && (
                          <div ref={actionMenuRef} className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#1E293B] rounded-lg shadow-xl border border-[#e2e8f0] dark:border-[#334155] py-1.5 z-40 text-xs text-left animate-in fade-in">
                            <div className="px-3 py-1 font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider text-[10px]">Actions</div>
                            <button onClick={() => { setActiveActionMenuId(null); onViewCourse(course); }} className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-gray-300 hover:bg-[#f8f9ff] dark:hover:bg-slate-700/50 flex items-center gap-2 cursor-pointer">
                              <Eye className="w-3.5 h-3.5 text-slate-500" /><span>Preview Curriculum</span>
                            </button>
                            <button onClick={() => { setActiveActionMenuId(null); onDuplicateCourse(course); }} className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-gray-300 hover:bg-[#f8f9ff] dark:hover:bg-slate-700/50 flex items-center gap-2 cursor-pointer">
                              <Copy className="w-3.5 h-3.5 text-slate-500" /><span>Duplicate Course</span>
                            </button>
                            <div className="my-1 border-t border-[#e2e8f0] dark:border-[#334155]" />
                            <div className="px-3 py-1 font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider text-[10px]">Change Status</div>
                            <button onClick={() => { setActiveActionMenuId(null); onChangeStatus(course.id, 'Published'); }} className="w-full px-3 py-1.5 text-left text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center gap-2 cursor-pointer">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" /><span>Publish</span>
                            </button>
                            <button onClick={() => { setActiveActionMenuId(null); onChangeStatus(course.id, 'Draft'); }} className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2 cursor-pointer">
                              <span className="w-2 h-2 rounded-full bg-slate-400" /><span>Draft</span>
                            </button>
                            <button onClick={() => { setActiveActionMenuId(null); onChangeStatus(course.id, 'Archived'); }} className="w-full px-3 py-1.5 text-left text-[#3b82f6] hover:bg-blue-50 dark:hover:bg-blue-500/10 flex items-center gap-2 cursor-pointer">
                              <span className="w-2 h-2 rounded-full bg-[#3b82f6]" /><span>Archive</span>
                            </button>
                            <div className="my-1 border-t border-[#e2e8f0] dark:border-[#334155]" />
                            <div className="px-3 py-1 font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider text-[10px]">Approval</div>
                            <button onClick={() => { setActiveActionMenuId(null); onChangeApprovalStatus(course.id, course.approvalStatus === 'Approved' ? 'Pending' : 'Approved'); }}
                              className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2 cursor-pointer">
                              <span>{course.approvalStatus === 'Approved' ? 'Mark Pending' : 'Approve Course'}</span>
                            </button>
                            <div className="my-1 border-t border-[#e2e8f0] dark:border-[#334155]" />
                            <button onClick={() => { setActiveActionMenuId(null); onDeleteCourse(course.id); }} className="w-full px-3 py-1.5 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer font-medium">
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" /><span>Delete Course</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 md:px-6 py-3 border-t border-[#e2e8f0] dark:border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs md:text-sm text-[#64748b] dark:text-gray-400 bg-white dark:bg-[#1E293B]">
        <div>
          Showing <span className="font-semibold text-[#0f172a] dark:text-gray-100">{totalItems > 0 ? startIndex + 1 : 0}</span> to{' '}
          <span className="font-semibold text-[#0f172a] dark:text-gray-100">{Math.min(startIndex + perPage, totalItems)}</span> of{' '}
          <span className="font-semibold text-[#0f172a] dark:text-gray-100">{totalItems}</span> courses
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentPage(Math.max(1, safePage - 1))} disabled={safePage <= 1}
            className="p-1.5 rounded-lg border border-[#e2e8f0] dark:border-[#334155] text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors" title="Previous Page">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                safePage === pageNum ? 'bg-[#3b82f6] text-white font-bold shadow-2xs' : 'text-[#64748b] dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-[#0f172a] dark:hover:text-gray-100'
              }`}>
              {pageNum}
            </button>
          ))}
          <button onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))} disabled={safePage >= totalPages}
            className="p-1.5 rounded-lg border border-[#e2e8f0] dark:border-[#334155] text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors" title="Next Page">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
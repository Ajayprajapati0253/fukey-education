// src/features/courses/components/CourseTable.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
  Eye,
  Pencil,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  Trash2,
  Download,
  CheckCircle,
  Clock,
  Archive,
  Copy,
  AlertCircle,
  ImageOff,
  User,
} from 'lucide-react';

import { Badge } from '../../../components/ui/Badge';
import { useUIStore } from '../../../store/ui.store';

import type {
  Course,
  CourseStatus,
  ApprovalStatus,
} from '../types/course.types';

interface CourseTableProps {
  courses: Course[];
  selectedIds: string[];

  onToggleSelectAll: () => void;
  onToggleSelectRow: (id: string) => void;

  onViewCourse: (course: Course) => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
  onDuplicateCourse: (course: Course) => void;

  onChangeStatus: (
    id: string,
    newStatus: CourseStatus,
  ) => void;

  onChangeApprovalStatus: (
    id: string,
    newApproval: ApprovalStatus,
  ) => void;

  onBulkDelete: () => void;
  onBulkStatusChange: (
    status: CourseStatus,
  ) => void;

  onBulkExport: () => void;

  currentPage: number;
  setCurrentPage: (page: number) => void;

  perPage: number;

  // API pagination
  totalItems?: number;
  totalPages?: number;
}

/* --------------------------------------------------
   STATUS HELPERS
-------------------------------------------------- */

type StatusBadgeVariant =
  | 'success'
  | 'warning'
  | 'neutral'
  | 'brand';

type ApprovalBadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral';

const getStatusBadge = (
  status?: unknown,
): {
  variant: StatusBadgeVariant;
  dot: boolean;
} => {
  const value = String(status ?? '')
    .trim()
    .toLowerCase();

  switch (value) {
    case 'published':
    case 'active':
    case '1':
      return {
        variant: 'success',
        dot: true,
      };

    case 'pending':
    case 'pending review':
    case 'review':
      return {
        variant: 'warning',
        dot: true,
      };

    case 'archived':
      return {
        variant: 'brand',
        dot: true,
      };

    case 'draft':
    case 'inactive':
    case '0':
      return {
        variant: 'neutral',
        dot: true,
      };

    default:
      return {
        variant: 'neutral',
        dot: true,
      };
  }
};

const getStatusLabel = (
  status?: unknown,
): string => {
  const value = String(status ?? '')
    .trim()
    .toLowerCase();

  switch (value) {
    case 'published':
    case 'active':
    case '1':
      return 'Published';

    case 'pending':
    case 'pending review':
    case 'review':
      return 'Pending Review';

    case 'archived':
      return 'Archived';

    case 'draft':
    case 'inactive':
    case '0':
      return 'Draft';

    default:
      return status !== null &&
        status !== undefined &&
        String(status).trim()
        ? String(status)
        : 'N/A';
  }
};

const getApprovalBadge = (
  approvalStatus?: unknown,
): {
  variant: ApprovalBadgeVariant;
} => {
  const value = String(approvalStatus ?? '')
    .trim()
    .toLowerCase();

  switch (value) {
    case 'approved':
    case 'approve':
    case '1':
      return {
        variant: 'success',
      };

    case 'pending':
    case '0':
      return {
        variant: 'warning',
      };

    case 'rejected':
    case 'reject':
      return {
        variant: 'danger',
      };

    default:
      return {
        variant: 'neutral',
      };
  }
};

const getApprovalLabel = (
  approvalStatus?: unknown,
): string => {
  const value = String(approvalStatus ?? '')
    .trim()
    .toLowerCase();

  switch (value) {
    case 'approved':
    case 'approve':
    case '1':
      return 'Approved';

    case 'pending':
    case '0':
      return 'Pending';

    case 'rejected':
    case 'reject':
      return 'Rejected';

    default:
      return approvalStatus !== null &&
        approvalStatus !== undefined &&
        String(approvalStatus).trim()
        ? String(approvalStatus)
        : 'N/A';
  }
};

/* --------------------------------------------------
   CATEGORY BADGE
-------------------------------------------------- */

const CATEGORY_VARIANT: Record<
  string,
  | 'accent'
  | 'brand'
  | 'warning'
  | 'teal'
  | 'success'
  | 'neutral'
> = {
  science: 'accent',
  physics: 'brand',
  mathematics: 'warning',
  chemistry: 'teal',
  biology: 'success',
  'computer science': 'accent',
  english: 'warning',
};

const categoryVariant = (
  category?: unknown,
) => {
  const value = String(category ?? '')
    .trim()
    .toLowerCase();

  return CATEGORY_VARIANT[value] ?? 'neutral';
};

/* --------------------------------------------------
   COMPONENT
-------------------------------------------------- */

export const CourseTable: React.FC<
  CourseTableProps
> = ({
  courses = [],
  selectedIds = [],

  onToggleSelectAll,
  onToggleSelectRow,

  onViewCourse,
  onEditCourse,
  onDeleteCourse,
  onDuplicateCourse,

  onChangeStatus,
  onChangeApprovalStatus,

  onBulkDelete,
  onBulkStatusChange,
  onBulkExport,

  currentPage,
  setCurrentPage,
  perPage,

  totalItems: apiTotalItems,
  totalPages: apiTotalPages,
}) => {
  const { currency } = useUIStore();

  const [
    activeActionMenuId,
    setActiveActionMenuId,
  ] = useState<string | null>(null);

  const actionMenuRef =
    useRef<HTMLDivElement>(null);

  /* --------------------------------------------------
     CLOSE ACTION MENU
  -------------------------------------------------- */

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent,
    ) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(
          event.target as Node,
        )
      ) {
        setActiveActionMenuId(null);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside,
      );
    };
  }, []);

  /* --------------------------------------------------
     PAGINATION
  -------------------------------------------------- */

  /*
   * courses already contains the current API page.
   * Do NOT slice it again here.
   */

  const currentCourses = courses;

  const totalItems =
    typeof apiTotalItems === 'number'
      ? apiTotalItems
      : courses.length;

  const totalPages =
    typeof apiTotalPages === 'number' &&
    apiTotalPages > 0
      ? apiTotalPages
      : Math.max(
          1,
          Math.ceil(totalItems / perPage),
        );

  const safePage = Math.min(
    Math.max(1, currentPage),
    totalPages,
  );

  const startIndex =
    (safePage - 1) * perPage;

  const endIndex =
    currentCourses.length > 0
      ? startIndex +
        currentCourses.length
      : 0;

  /* --------------------------------------------------
     SELECTION
  -------------------------------------------------- */

  const isAllSelected =
    currentCourses.length > 0 &&
    currentCourses.every((course) =>
      selectedIds.includes(
        String(course.id),
      ),
    );

  const isSomeSelected =
    currentCourses.some((course) =>
      selectedIds.includes(
        String(course.id),
      ),
    ) && !isAllSelected;

  /* --------------------------------------------------
     PRICE
  -------------------------------------------------- */

  const formatPrice = (
    priceValue?: unknown,
    isFreeValue?: unknown,
  ) => {
    const price =
      Number(priceValue) || 0;

    const isFree =
      Boolean(isFreeValue) ||
      price === 0;

    const symbol =
      currency === 'INR'
        ? '₹'
        : currency === 'USD'
          ? '$'
          : '€';

    if (isFree) {
      return {
        amount: `${symbol}0.00`,
        isFree: true,
      };
    }

    let convertedPrice:
      | number
      | string = price;

    if (currency === 'USD') {
      convertedPrice = (
        price / 83
      ).toFixed(2);
    } else if (currency !== 'INR') {
      convertedPrice = (
        price / 90
      ).toFixed(2);
    }

    return {
      amount: `${symbol}${convertedPrice}`,
      isFree: false,
    };
  };

  /* --------------------------------------------------
     PAGE NUMBERS
  -------------------------------------------------- */

  const getPageNumbers = () => {
    const pages: number[] = [];

    const maxVisible = 5;

    let start = Math.max(
      1,
      safePage -
        Math.floor(maxVisible / 2),
    );

    let end = Math.min(
      totalPages,
      start + maxVisible - 1,
    );

    if (
      end - start + 1 <
      maxVisible
    ) {
      start = Math.max(
        1,
        end - maxVisible + 1,
      );
    }

    for (
      let page = start;
      page <= end;
      page++
    ) {
      pages.push(page);
    }

    return pages;
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#e2e8f0] dark:border-[#334155] shadow-2xs overflow-hidden">

      {/* BULK ACTIONS */}

      {selectedIds.length > 0 && (
        <div className="bg-blue-50/80 dark:bg-blue-500/10 border-b border-blue-200 dark:border-blue-500/20 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">

          <span className="text-sm font-semibold text-[#0f172a] dark:text-gray-100">
            {selectedIds.length}{' '}
            course
            {selectedIds.length > 1
              ? 's'
              : ''}{' '}
            selected
          </span>

          <div className="flex items-center gap-2 flex-wrap">

            <button
              type="button"
              onClick={() =>
                onBulkStatusChange(
                  'Published',
                )
              }
              className="px-2.5 py-1.5 bg-white dark:bg-[#1E293B] border border-[#e2e8f0] dark:border-[#334155] text-emerald-700 dark:text-emerald-400 rounded-md text-xs font-medium hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />

              <span>
                Publish Selected
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                onBulkStatusChange(
                  'Draft',
                )
              }
              className="px-2.5 py-1.5 bg-white dark:bg-[#1E293B] border border-[#e2e8f0] dark:border-[#334155] text-slate-700 dark:text-gray-300 rounded-md text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />

              <span>
                Set Draft
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                onBulkStatusChange(
                  'Archived',
                )
              }
              className="px-2.5 py-1.5 bg-white dark:bg-[#1E293B] border border-[#e2e8f0] dark:border-[#334155] text-[#3b82f6] rounded-md text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5" />

              <span>Archive</span>
            </button>

            <button
              type="button"
              onClick={onBulkExport}
              className="px-2.5 py-1.5 bg-white dark:bg-[#1E293B] border border-[#e2e8f0] dark:border-[#334155] text-slate-700 dark:text-gray-300 rounded-md text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />

              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={onBulkDelete}
              className="px-2.5 py-1.5 bg-rose-600 text-white rounded-md text-xs font-medium hover:bg-rose-700 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />

              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}

      <div className="overflow-x-auto min-h-87.5">

        <table className="w-full text-left border-collapse min-w-300">

          <thead>
            <tr className="border-b border-[#e2e8f0] dark:border-[#334155] bg-slate-50/70 dark:bg-slate-800/40">

              <th className="py-3 px-4 w-12 text-center">

                <button
                  type="button"
                  onClick={
                    onToggleSelectAll
                  }
                  className="text-slate-500 dark:text-gray-400 hover:text-[#3b82f6] transition-colors cursor-pointer"
                  title="Select All"
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#3b82f6]" />
                  ) : isSomeSelected ? (
                    <div className="w-4 h-4 rounded bg-[#3b82f6] flex items-center justify-center text-white text-[10px] font-bold">
                      -
                    </div>
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </button>

              </th>

              {[
                'SN',
                'Course',
                'Instructor',
                'Subjects',
                'Level',
                'Students',
                'Price',
                'Status',
                'Approval Status',
                'Created Date',
              ].map((heading) => (
                <th
                  key={heading}
                  className="py-3 px-4 text-xs font-semibold text-[#64748b] dark:text-gray-400 uppercase tracking-wider"
                >
                  {heading}
                </th>
              ))}

              <th className="py-3 px-4 text-xs font-semibold text-[#64748b] dark:text-gray-400 uppercase tracking-wider text-center w-28">
                Action
              </th>

            </tr>
          </thead>

          <tbody className="text-sm divide-y divide-[#e2e8f0] dark:divide-[#334155]">

            {currentCourses.length ===
            0 ? (
              <tr>
                <td
                  colSpan={12}
                  className="py-12 text-center text-slate-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">

                    <AlertCircle className="w-8 h-8 text-slate-300 dark:text-gray-600" />

                    <p className="font-semibold text-slate-700 dark:text-gray-300">
                      No courses found
                    </p>

                    <p className="text-xs text-slate-400 dark:text-gray-500">
                      No course data is
                      available for the
                      selected filters.
                    </p>

                  </div>
                </td>
              </tr>
            ) : (
              currentCourses.map(
                (course, idx) => {
                  const courseId =
                    String(
                      course.id ?? '',
                    );

                  const isSelected =
                    selectedIds.includes(
                      courseId,
                    );

                  const priceInfo =
                    formatPrice(
                      course.price,
                      course.isFree,
                    );

                  const statusInfo =
                    getStatusBadge(
                      course.status,
                    );

                  const approvalInfo =
                    getApprovalBadge(
                      course.approvalStatus,
                    );

                  const statusLabel =
                    getStatusLabel(
                      course.status,
                    );

                  const approvalLabel =
                    getApprovalLabel(
                      course.approvalStatus,
                    );

                  const thumbnail =
                    String(
                      course.thumbnail ??
                        '',
                    ).trim();

                  const instructorAvatar =
                    String(
                      course.instructorAvatar ??
                        '',
                    ).trim();

                  const instructorName =
                    String(
                      course.instructorName ??
                        '',
                    ).trim() ||
                    'N/A';

                  const category =
                    String(
                      course.category ??
                        '',
                    ).trim() ||
                    'N/A';

                  const level =
                    String(
                      course.level ?? '',
                    ).trim() ||
                    'N/A';

                  const studentsCount =
                    Number(
                      course.studentsCount,
                    ) || 0;

                  return (
                    <tr
                      key={
                        courseId ||
                        idx
                      }
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected
                          ? 'bg-blue-50/40 dark:bg-blue-500/5'
                          : ''
                      }`}
                    >

                      {/* SELECT */}

                      <td className="py-3 px-4 text-center">

                        <button
                          type="button"
                          onClick={() =>
                            onToggleSelectRow(
                              courseId,
                            )
                          }
                          className="text-slate-400 hover:text-[#3b82f6] cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#3b82f6]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>

                      </td>

                      {/* SN */}

                      <td className="py-3 px-4 text-slate-500 dark:text-gray-400 font-medium">

                        {course.sn ??
                          startIndex +
                            idx +
                            1}

                      </td>

                      {/* COURSE */}

                      <td className="py-3 px-4">

                        <div className="flex items-center gap-3">

                          {thumbnail ? (
                            <img
                              src={
                                thumbnail
                              }
                              alt={
                                course.title ||
                                'Course'
                              }
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 border border-[#e2e8f0] dark:border-[#334155] shrink-0"
                              referrerPolicy="no-referrer"
                              onError={(
                                event,
                              ) => {
                                event.currentTarget.style.display =
                                  'none';

                                const next =
                                  event
                                    .currentTarget
                                    .nextElementSibling as HTMLElement | null;

                                if (next) {
                                  next.style.display =
                                    'flex';
                                }
                              }}
                            />
                          ) : null}

                          <div
                            style={{
                              display:
                                thumbnail
                                  ? 'none'
                                  : 'flex',
                            }}
                            className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-[#e2e8f0] dark:border-[#334155] shrink-0 items-center justify-center"
                          >
                            <ImageOff className="w-4 h-4 text-slate-400" />
                          </div>

                          <div className="max-w-50 xl:max-w-60">

                            <p
                              onClick={() =>
                                onViewCourse(
                                  course,
                                )
                              }
                              className="font-medium text-[#0f172a] dark:text-gray-100 hover:text-[#3b82f6] cursor-pointer line-clamp-1 transition-colors"
                              title={
                                course.title ||
                                ''
                              }
                            >
                              {course.title ||
                                'Untitled Course'}
                            </p>

                            {course.subtitle ? (
                              <p className="text-xs text-[#64748b] dark:text-gray-400 truncate">
                                {
                                  course.subtitle
                                }
                              </p>
                            ) : null}

                          </div>
                        </div>

                      </td>

                      {/* INSTRUCTOR */}

                      <td className="py-3 px-4">

                        <div className="flex items-center gap-2">

                          {instructorAvatar ? (
                            <img
                              src={
                                instructorAvatar
                              }
                              alt={
                                instructorName
                              }
                              className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-600"
                              referrerPolicy="no-referrer"
                              onError={(
                                event,
                              ) => {
                                event.currentTarget.style.display =
                                  'none';

                                const next =
                                  event
                                    .currentTarget
                                    .nextElementSibling as HTMLElement | null;

                                if (next) {
                                  next.style.display =
                                    'flex';
                                }
                              }}
                            />
                          ) : null}

                          <div
                            style={{
                              display:
                                instructorAvatar
                                  ? 'none'
                                  : 'flex',
                            }}
                            className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shrink-0 items-center justify-center"
                          >
                            <User className="w-3 h-3 text-slate-400" />
                          </div>

                          <span className="text-[#0f172a] dark:text-gray-100 font-medium whitespace-nowrap">
                            {
                              instructorName
                            }
                          </span>

                        </div>

                      </td>

                      {/* SUBJECT */}

                      <td className="py-3 px-4">

                        <Badge
                          variant={categoryVariant(
                            category,
                          )}
                          size="xs"
                        >
                          {category}
                        </Badge>

                      </td>

                      {/* LEVEL */}

                      <td className="py-3 px-4 text-[#0f172a] dark:text-gray-100 font-medium whitespace-nowrap">
                        {level}
                      </td>

                      {/* STUDENTS */}

                      <td className="py-3 px-4 text-[#0f172a] dark:text-gray-100 font-medium whitespace-nowrap">
                        {studentsCount.toLocaleString()}
                      </td>

                      {/* PRICE */}

                      <td className="py-3 px-4 whitespace-nowrap">

                        <p className="text-[#0f172a] dark:text-gray-100 font-medium leading-tight">
                          {
                            priceInfo.amount
                          }
                        </p>

                        <p
                          className={`text-xs font-medium ${
                            priceInfo.isFree
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-500 dark:text-gray-400'
                          }`}
                        >
                          {priceInfo.isFree
                            ? 'Free'
                            : 'Paid'}
                        </p>

                      </td>

                      {/* STATUS */}

                      <td className="py-3 px-4 whitespace-nowrap">

                        <Badge
                          variant={
                            statusInfo.variant
                          }
                          dot={
                            statusInfo.dot
                          }
                        >
                          {
                            statusLabel
                          }
                        </Badge>

                      </td>

                      {/* APPROVAL */}

                      <td className="py-3 px-4 whitespace-nowrap">

                        <Badge
                          variant={
                            approvalInfo.variant
                          }
                        >
                          {
                            approvalLabel
                          }
                        </Badge>

                      </td>

                      {/* CREATED DATE */}

                      <td className="py-3 px-4 whitespace-nowrap">

                        <p className="text-[#0f172a] dark:text-gray-100 leading-tight font-medium text-xs">
                          {course.createdDate ||
                            'N/A'}
                        </p>

                        {course.createdTime ? (
                          <p className="text-[11px] text-[#64748b] dark:text-gray-400">
                            {
                              course.createdTime
                            }
                          </p>
                        ) : null}

                      </td>

                      {/* ACTION */}

                      <td className="py-3 px-4 relative">

                        <div className="flex items-center justify-center gap-1">

                          <button
                            type="button"
                            onClick={() =>
                              onViewCourse(
                                course,
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center rounded-md text-[#64748b] dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#0f172a] dark:hover:text-gray-100 transition-colors cursor-pointer"
                            title="View Course"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onEditCourse(
                                course,
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center rounded-md text-[#64748b] dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#0f172a] dark:hover:text-gray-100 transition-colors cursor-pointer"
                            title="Edit Course"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <div className="relative">

                            <button
                              type="button"
                              onClick={(
                                event,
                              ) => {
                                event.stopPropagation();

                                setActiveActionMenuId(
                                  activeActionMenuId ===
                                    courseId
                                    ? null
                                    : courseId,
                                );
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded-md text-[#64748b] dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#0f172a] dark:hover:text-gray-100 transition-colors cursor-pointer"
                              title="More options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {activeActionMenuId ===
                              courseId && (
                              <div
                                ref={
                                  actionMenuRef
                                }
                                className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#1E293B] rounded-lg shadow-xl border border-[#e2e8f0] dark:border-[#334155] py-1.5 z-40 text-xs text-left animate-in fade-in"
                              >

                                <div className="px-3 py-1 font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider text-[10px]">
                                  Actions
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(
                                      null,
                                    );

                                    onViewCourse(
                                      course,
                                    );
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-gray-300 hover:bg-[#f8f9ff] dark:hover:bg-slate-700/50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-500" />

                                  <span>
                                    Preview
                                    Curriculum
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(
                                      null,
                                    );

                                    onDuplicateCourse(
                                      course,
                                    );
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-gray-300 hover:bg-[#f8f9ff] dark:hover:bg-slate-700/50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5 text-slate-500" />

                                  <span>
                                    Duplicate
                                    Course
                                  </span>
                                </button>

                                <div className="my-1 border-t border-[#e2e8f0] dark:border-[#334155]" />

                                <div className="px-3 py-1 font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider text-[10px]">
                                  Change Status
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(
                                      null,
                                    );

                                    onChangeStatus(
                                      courseId,
                                      'Published',
                                    );
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center gap-2 cursor-pointer"
                                >
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" />

                                  <span>
                                    Publish
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(
                                      null,
                                    );

                                    onChangeStatus(
                                      courseId,
                                      'Draft',
                                    );
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2 cursor-pointer"
                                >
                                  <span className="w-2 h-2 rounded-full bg-slate-400" />

                                  <span>
                                    Draft
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(
                                      null,
                                    );

                                    onChangeStatus(
                                      courseId,
                                      'Archived',
                                    );
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-[#3b82f6] hover:bg-blue-50 dark:hover:bg-blue-500/10 flex items-center gap-2 cursor-pointer"
                                >
                                  <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />

                                  <span>
                                    Archive
                                  </span>
                                </button>

                                <div className="my-1 border-t border-[#e2e8f0] dark:border-[#334155]" />

                                <div className="px-3 py-1 font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider text-[10px]">
                                  Approval
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(
                                      null,
                                    );

                                    onChangeApprovalStatus(
                                      courseId,
                                      approvalLabel ===
                                        'Approved'
                                        ? 'Pending'
                                        : 'Approved',
                                    );
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2 cursor-pointer"
                                >
                                  <span>
                                    {approvalLabel ===
                                    'Approved'
                                      ? 'Mark Pending'
                                      : 'Approve Course'}
                                  </span>
                                </button>

                                <div className="my-1 border-t border-[#e2e8f0] dark:border-[#334155]" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(
                                      null,
                                    );

                                    onDeleteCourse(
                                      courseId,
                                    );
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />

                                  <span>
                                    Delete Course
                                  </span>
                                </button>

                              </div>
                            )}

                          </div>

                        </div>

                      </td>

                    </tr>
                  );
                },
              )
            )}

          </tbody>

        </table>

      </div>

      {/* PAGINATION */}

      <div className="px-4 md:px-6 py-3 border-t border-[#e2e8f0] dark:border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs md:text-sm text-[#64748b] dark:text-gray-400 bg-white dark:bg-[#1E293B]">

        <div>
          Showing{' '}

          <span className="font-semibold text-[#0f172a] dark:text-gray-100">
            {totalItems > 0
              ? startIndex + 1
              : 0}
          </span>

          {' '}to{' '}

          <span className="font-semibold text-[#0f172a] dark:text-gray-100">
            {Math.min(
              endIndex,
              totalItems,
            )}
          </span>

          {' '}of{' '}

          <span className="font-semibold text-[#0f172a] dark:text-gray-100">
            {totalItems}
          </span>

          {' '}courses
        </div>

        <div className="flex items-center gap-1">

          <button
            type="button"
            onClick={() =>
              setCurrentPage(
                Math.max(
                  1,
                  safePage - 1,
                ),
              )
            }
            disabled={safePage <= 1}
            className="p-1.5 rounded-lg border border-[#e2e8f0] dark:border-[#334155] text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {getPageNumbers().map(
            (pageNumber) => (
              <button
                type="button"
                key={pageNumber}
                onClick={() =>
                  setCurrentPage(
                    pageNumber,
                  )
                }
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  safePage ===
                  pageNumber
                    ? 'bg-[#3b82f6] text-white font-bold shadow-2xs'
                    : 'text-[#64748b] dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-[#0f172a] dark:hover:text-gray-100'
                }`}
              >
                {pageNumber}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() =>
              setCurrentPage(
                Math.min(
                  totalPages,
                  safePage + 1,
                ),
              )
            }
            disabled={
              safePage >= totalPages
            }
            className="p-1.5 rounded-lg border border-[#e2e8f0] dark:border-[#334155] text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

        </div>

      </div>

    </div>
  );
};
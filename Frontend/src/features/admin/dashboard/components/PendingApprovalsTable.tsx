import React from 'react';
import { Eye, ChevronRight } from 'lucide-react';
import { Badge, type BadgeVariant } from '../../../../components/ui/Badge';
import type { PendingApprovalCourse } from '../types/dashboard.types';
import { useUIStore } from '../../../../store/ui.store';

interface PendingApprovalsTableProps {
  courses?: PendingApprovalCourse[];
  isLoading?: boolean;
}


const statusBadgeMap: Record<PendingApprovalCourse['status'], { label: string; variant: BadgeVariant }> = {
  approved: { label: 'Approved', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  draft: { label: 'Draft', variant: 'neutral' },
};

export const PendingApprovalsTable: React.FC<PendingApprovalsTableProps> = ({
  courses = [],
  isLoading = false,
}) => {
  const { setCurrentRoute } = useUIStore();

  return (
    <div className="bg-white dark:bg-[#1E293B] p-5 sm:p-6 rounded-2xl border border-[#E6E8EE] dark:border-[#334155] flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-[#12141C] dark:text-white tracking-tight">Pending Approvals</h3>
        <a
          href="/admin/courses"
          onClick={(e) => {
            e.preventDefault();
            setCurrentRoute('/admin/courses');
          }}
          className="text-xs font-semibold text-[#2451D9] dark:text-[#60A5FA] hover:underline flex items-center gap-1"
        >
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
        {isLoading ? (
          <div className="space-y-3 py-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#9DA2AF] dark:text-gray-400">
            No courses pending approval.
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[480px]">
            <thead>
              <tr className="border-b border-[#F1F3F8] dark:border-gray-800 text-[11px] font-bold text-[#9DA2AF] dark:text-gray-400 uppercase tracking-wider">
                <th className="pb-2.5 font-bold">Course</th>
                <th className="pb-2.5 font-bold">Instructor</th>
                <th className="pb-2.5 font-bold">Category</th>
                <th className="pb-2.5 font-bold">Submitted</th>
                <th className="pb-2.5 font-bold">Status</th>
                <th className="pb-2.5 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F6F7FA] dark:divide-gray-800/60 text-xs">
              {courses.map((course) => {
                const statusMeta = statusBadgeMap[course.status] || statusBadgeMap.pending;

                return (
                  <tr
                    key={course.id}
                    className="hover:bg-[#F9FAFC] dark:hover:bg-gray-800/40 transition-colors group"
                  >
                    <td className="py-3 font-bold text-[#12141C] dark:text-gray-200 group-hover:text-[#2451D9] dark:group-hover:text-[#60A5FA] transition-colors max-w-[140px] truncate pr-2">
                      {course.courseName}
                    </td>
                    <td className="py-3 text-[#686E7D] dark:text-[#94A3B8] whitespace-nowrap pr-2">
                      {course.instructorName}
                    </td>
                    <td className="py-3 text-[#686E7D] dark:text-[#94A3B8] whitespace-nowrap pr-2">
                      {course.category}
                    </td>
                    <td className="py-3 text-[#9DA2AF] dark:text-gray-400 text-[11px] whitespace-nowrap pr-2">
                      {course.submittedAt}
                    </td>
                    <td className="py-3 pr-2">
                      <Badge variant={statusMeta.variant} size="xs">
                        {statusMeta.label}
                      </Badge>
                    </td>
                    <td className="py-3 text-center">
                      <button
                        type="button"
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-[#2451D9] dark:hover:text-[#60A5FA] hover:bg-[#EAF0FE] dark:hover:bg-[#2451D9]/20 rounded-lg transition-colors inline-flex items-center justify-center"
                        title="Preview course"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PendingApprovalsTable;

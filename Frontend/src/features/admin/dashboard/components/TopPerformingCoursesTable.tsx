import React from 'react';
import { TrendingUp, TrendingDown, ChevronRight, Star } from 'lucide-react';
import type { TopPerformingCourse } from '../types/dashboard.types';
import { useUIStore } from '../../../../store/ui.store';

interface TopPerformingCoursesTableProps {
  courses?: TopPerformingCourse[];
  currency?: string;
  isLoading?: boolean;
}

export const TopPerformingCoursesTable: React.FC<TopPerformingCoursesTableProps> = ({
  courses = [],
  currency = 'INR',
  isLoading = false,
}) => {
  const { setCurrentRoute } = useUIStore();
  const currencySymbol = currency === 'INR' ? '₹' : '$';

  return (
    <div className="bg-white dark:bg-[#1E293B] p-5 sm:p-6 rounded-2xl border border-[#E6E8EE] dark:border-[#334155] flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-[#12141C] dark:text-white tracking-tight">
          Top Performing Courses
        </h3>
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

      {/* Table */}
      <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
        {isLoading ? (
          <div className="space-y-3 py-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#9DA2AF] dark:text-gray-400">
            No course performance metrics yet.
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[360px]">
            <thead>
              <tr className="border-b border-[#F1F3F8] dark:border-gray-800 text-[11px] font-bold text-[#9DA2AF] dark:text-gray-400 uppercase tracking-wider">
                <th className="pb-2.5 font-bold w-1/2">Course</th>
                <th className="pb-2.5 font-bold text-right">Students</th>
                <th className="pb-2.5 font-bold text-right">Revenue</th>
                <th className="pb-2.5 font-bold text-right">Rating</th>
                <th className="pb-2.5 font-bold text-center">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F6F7FA] dark:divide-gray-800/60 text-xs">
              {courses.map((course) => {
                const isTrendingUp =
                  course.trend.length >= 2 &&
                  course.trend[course.trend.length - 1] >= course.trend[0];

                return (
                  <tr
                    key={course.id}
                    className="hover:bg-[#F9FAFC] dark:hover:bg-gray-800/40 transition-colors group"
                  >
                    <td className="py-3 flex items-center gap-2.5 pr-2">
                      <img
                        src={
                          course.thumbnailUrl ||
                          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100&auto=format&fit=crop&q=80'
                        }
                        alt={course.name}
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-gray-100 dark:border-gray-700"
                        referrerPolicy="no-referrer"
                      />
                      <span className="font-bold text-[#12141C] dark:text-gray-200 group-hover:text-[#2451D9] dark:group-hover:text-[#60A5FA] transition-colors truncate max-w-[130px] sm:max-w-[160px]">
                        {course.name}
                      </span>
                    </td>
                    <td className="py-3 text-right text-[#686E7D] dark:text-[#94A3B8] font-medium tabular-nums whitespace-nowrap">
                      {course.students.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-[#12141C] dark:text-white font-bold tabular-nums whitespace-nowrap">
                      {currencySymbol}
                      {course.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-semibold tabular-nums whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[#12141C] dark:text-gray-200">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {course.rating}
                      </span>
                    </td>
                    <td className="py-3 text-center whitespace-nowrap">
                      {isTrendingUp ? (
                        <TrendingUp className="w-4 h-4 text-[#16A34A] dark:text-[#4ADE80] mx-auto stroke-[2.5]" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-[#DC5B3E] dark:text-[#F87171] mx-auto stroke-[2.5]" />
                      )}
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

export default TopPerformingCoursesTable;

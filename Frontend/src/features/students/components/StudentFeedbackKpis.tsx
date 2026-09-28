import React from 'react';
import { User, GraduationCap, MessagesSquare, Zap, ArrowDown } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import type { Student } from '../types';

interface StudentFeedbackKpisProps {
  student: Student;
  totalCourses: number;
  overallProgress: number;
  feedbackCount: number;
  onProfileClick?: () => void;
  onCoursesKpiClick?: () => void;
  onProgressKpiClick?: () => void;
  onFeedbackKpiClick: () => void;
  onQuickActionsClick: () => void;
  className?: string;
}

const CARD = 'p-3.5 cursor-pointer group flex items-center gap-3 select-none';
const TITLE = 'text-lg font-bold text-[#0f172a] dark:text-gray-100 tracking-tight leading-snug truncate';
const SUB = 'text-xs text-[#64748b] dark:text-gray-400 font-medium truncate mt-0.5';

const keyHandler = (fn?: () => void) => (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fn?.();
  }
};

export const StudentFeedbackKpis: React.FC<StudentFeedbackKpisProps> = ({
  student,
  totalCourses,
  overallProgress,
  feedbackCount,
  onProfileClick,
  onCoursesKpiClick,
  onProgressKpiClick,
  onFeedbackKpiClick,
  onQuickActionsClick,
  className = '',
}) => {
  const studentClassLabel = student.class
    ? student.class.includes('Class') || student.class.includes('th')
      ? student.class
      : `${student.class}th Class`
    : student.age
    ? `${student.age} Years`
    : '10th Class';

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 ${className}`}>
      <Card padding="none" hoverable onClick={onProfileClick} role="button" tabIndex={0} onKeyDown={keyHandler(onProfileClick)} className={CARD} title="View Profile Details">
        <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <User className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className={TITLE}>Profile</div>
          <div className={SUB}>{studentClassLabel}</div>
        </div>
      </Card>

      <Card padding="none" hoverable onClick={onCoursesKpiClick} role="button" tabIndex={0} onKeyDown={keyHandler(onCoursesKpiClick)} className={CARD} title="View Enrolled Courses">
        <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className={SUB}>{totalCourses === 1 ? 'Course' : 'Courses'}</div>
          <div className={TITLE}>{totalCourses}</div>
        </div>
      </Card>

      <Card padding="none" hoverable onClick={onProgressKpiClick} role="button" tabIndex={0} onKeyDown={keyHandler(onProgressKpiClick)} className={CARD} title="View Progress & Attendance">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <svg className="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-emerald-200 dark:text-emerald-950 stroke-current"
              strokeWidth="4"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-emerald-500 dark:text-emerald-400 stroke-current transition-all duration-500"
              strokeDasharray={`${overallProgress}, 100`}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className={SUB}>Attendance</div>
          <div className={TITLE}>{overallProgress}%</div>
        </div>
      </Card>

      <Card padding="none" hoverable onClick={onFeedbackKpiClick} role="button" tabIndex={0} onKeyDown={keyHandler(onFeedbackKpiClick)} className={`${CARD} !border-purple-200 dark:!border-purple-500/30`} title="View Student Feedback Across All Courses">
        <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <MessagesSquare className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className={`${SUB} group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors`}>Feedback</div>
          <div className={`${TITLE} flex items-center gap-1.5`}>
            <span>{feedbackCount}</span>
            <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/80 px-1 py-0.5 rounded border border-purple-200 dark:border-purple-800/60">
              New
            </span>
          </div>
        </div>
      </Card>

      <Card padding="none" hoverable onClick={onQuickActionsClick} role="button" tabIndex={0} onKeyDown={keyHandler(onQuickActionsClick)} className={`${CARD} col-span-2 sm:col-span-1`} title="Scroll to Quick Actions">
        <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <Zap className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-[#0f172a] dark:text-gray-300 font-bold truncate mt-1.5 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
            Quick Actions
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40 leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {student.status || 'Active'}
            </span>
            <ArrowDown className="w-3 h-3 text-amber-500 group-hover:translate-y-0.5 transition-transform" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudentFeedbackKpis;
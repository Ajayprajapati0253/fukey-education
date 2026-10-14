import { GraduationCap, Radio, Users, User, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Instructor } from '../types/instructor';

interface InstructorEditKpisProps {
  instructor: Instructor;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onGoToQuickActions?: () => void;
}

export function InstructorEditKpis({
  instructor,
  activeTab,
  onSelectTab,
  onGoToQuickActions,
}: InstructorEditKpisProps) {
  const isProfileActive = activeTab === 'Profile';
  const isCoursesActive = activeTab === 'Courses';
  const isLiveClassesActive = activeTab === 'Live Classes';
  const isAttendanceActive = activeTab === 'Attendance';
  const isStudentsActive = activeTab === 'Students';

  const handleQuickActionsClick = () => {
    if (onGoToQuickActions) {
      onGoToQuickActions();
    } else {
      const el = document.getElementById('quick-actions-card');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-blue-500/70', 'shadow-lg', 'shadow-blue-500/20');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-blue-500/70', 'shadow-lg', 'shadow-blue-500/20');
        }, 2200);
      }
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. Profile KPI Card */}
      <button
        type="button"
        onClick={() => onSelectTab('Profile')}
        className={`text-left p-4 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-3.5 border ${
          isProfileActive
            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30'
            : 'bg-white dark:bg-[#111c34] border-slate-200/80 dark:border-[#1e2c4c] hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-[#14203a]'
        }`}
        title="Click to view & edit Profile details"
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            isProfileActive
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/15 dark:text-blue-400'
          }`}
        >
          <User className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
            Profile Details
          </div>
          <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight truncate mt-0.5">
            {instructor.experience || 'Bio & Info'}
          </div>
        </div>
      </button>

      {/* 2. Courses KPI Card */}
      <button
        type="button"
        onClick={() => onSelectTab('Courses')}
        className={`text-left p-4 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-3.5 border ${
          isCoursesActive
            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30'
            : 'bg-white dark:bg-[#111c34] border-slate-200/80 dark:border-[#1e2c4c] hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-[#14203a]'
        }`}
        title="Click to view Assigned Courses"
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            isCoursesActive
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/15 dark:text-blue-400'
          }`}
        >
          <GraduationCap className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
            Courses
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight mt-0.5">
            {instructor.coursesCount}
          </div>
        </div>
      </button>

      {/* 3. Live Classes KPI Card */}
      <button
        type="button"
        onClick={() => onSelectTab('Live Classes')}
        className={`text-left p-4 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-3.5 border ${
          isLiveClassesActive
            ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/30'
            : 'bg-white dark:bg-[#111c34] border-slate-200/80 dark:border-[#1e2c4c] hover:border-purple-400 dark:hover:border-purple-500 hover:bg-slate-50 dark:hover:bg-[#14203a]'
        }`}
        title="Click to view Live Classes"
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            isLiveClassesActive
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-purple-500/10 text-purple-500 dark:bg-purple-500/15 dark:text-purple-400'
          }`}
        >
          <Radio className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
            Live Classes
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight mt-0.5">
            {instructor.liveClassesDone}
          </div>
        </div>
      </button>

      {/* 4. Attendance KPI Card */}
      <button
        type="button"
        onClick={() => onSelectTab('Attendance')}
        className={`text-left p-4 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-3.5 border ${
          isAttendanceActive
            ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30'
            : 'bg-white dark:bg-[#111c34] border-slate-200/80 dark:border-[#1e2c4c] hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-[#14203a]'
        }`}
        title="Click to view Attendance logs"
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            isAttendanceActive
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400'
          }`}
        >
          <div className="relative w-6 h-6 flex items-center justify-center">
            <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200 dark:text-slate-700"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={isAttendanceActive ? 'text-white' : 'text-emerald-500'}
                strokeDasharray={`${instructor.attendancePercentage}, 100`}
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
            Attendance
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight mt-0.5">
            {instructor.attendancePercentage}%
          </div>
        </div>
      </button>

      {/* 5. Students KPI Card */}
      <button
        type="button"
        onClick={() => onSelectTab('Students')}
        className={`text-left p-4 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-3.5 border ${
          isStudentsActive
            ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30'
            : 'bg-white dark:bg-[#111c34] border-slate-200/80 dark:border-[#1e2c4c] hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-[#14203a]'
        }`}
        title="Click to view Enrolled Students"
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            isStudentsActive
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-400'
          }`}
        >
          <Users className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
            Students
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight mt-0.5">
            {instructor.studentsCount}
          </div>
        </div>
      </button>

      {/* 6. Quick Actions KPI Card (Lands on Quick Actions in Sidebar) */}
      <button
        type="button"
        onClick={handleQuickActionsClick}
        className="text-left p-4 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-3 border bg-white dark:bg-[#111c34] border-slate-200/80 dark:border-[#1e2c4c] hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 hover:shadow-md group"
        title="Click to jump to Quick Actions on the left sidebar"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/15 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
          <Zap className="w-5 h-5 fill-amber-500/30 group-hover:fill-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
            Quick Actions
          </div>
          <div className="flex items-center gap-1 justify-between mt-1">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                instructor.status === 'Active'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                  : instructor.status === 'Suspended'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 border-amber-300 dark:border-amber-800'
              }`}
            >
              {instructor.status === 'Suspended' ? (
                <AlertTriangle className="w-2.5 h-2.5 text-rose-500" />
              ) : (
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
              )}
              <span>{instructor.status}</span>
            </span>
            <span className="text-[10px] text-blue-500 font-semibold group-hover:translate-y-0.5 transition-transform">
              ↓
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}

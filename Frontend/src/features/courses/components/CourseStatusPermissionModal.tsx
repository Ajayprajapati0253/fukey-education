import { useState } from 'react';
import {
  X,
  ShieldAlert,
  ArrowRight,
  Users,
  Radio,
  BookOpen,
  Bell,
  Sparkles,
  Lock,
  Unlock,
  Check,
} from 'lucide-react';

interface CourseStatusPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: { notifyStudents: boolean; notifyInstructor: boolean; reason: string }) => void;
  currentStatus: 'Active' | 'Inactive';
  courseName: string;
  courseCode: string;
  studentCount: number;
  instructorName: string;
  isLoading?: boolean;
}

export function CourseStatusPermissionModal({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  courseName,
  courseCode,
  studentCount,
  instructorName,
  isLoading = false,
}: CourseStatusPermissionModalProps) {
  const isDeactivating = currentStatus === 'Active';
  const targetStatus = isDeactivating ? 'Inactive' : 'Active';

  const [reason, setReason] = useState(
    isDeactivating ? 'Curriculum Revision & Content Update' : 'Academic Schedule Resumed'
  );
  const [notifyStudents, setNotifyStudents] = useState(true);
  const [notifyInstructor, setNotifyInstructor] = useState(true);
  const [acknowledged, setAcknowledged] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({ notifyStudents, notifyInstructor, reason });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#111c34] border border-slate-200 dark:border-[#1e2c4c] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`p-5 border-b flex items-start justify-between gap-4 ${
            isDeactivating
              ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-200 dark:border-amber-900/40'
              : 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-900/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                isDeactivating
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                  : 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
              }`}
            >
              {isDeactivating ? (
                <ShieldAlert className="w-6 h-6" />
              ) : (
                <Sparkles className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isDeactivating ? 'Deactivate Course & Restrict Permissions' : 'Activate & Publish Course'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review permissions impact on students, faculty and LMS tools before updating
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto scrollbar-thin">
          {/* Status Change Transition Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b1329] border border-slate-200/80 dark:border-[#1e2c4c] flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Target Transition
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate max-w-[240px]">
                {courseCode} · {courseName}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                  currentStatus === 'Active'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {currentStatus}
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold shadow-xs ${
                  targetStatus === 'Active'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}
              >
                {targetStatus}
              </span>
            </div>
          </div>

          {/* Permissions & LMS Impact Breakdown */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Permissions & System Impact</span>
              <span className="text-[11px] font-normal text-slate-400">
                {isDeactivating ? 'Temporary restrictions apply' : 'All permissions restored'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* 1. Student Access */}
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  isDeactivating
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-slate-800 dark:text-slate-200'
                    : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    isDeactivating
                      ? 'bg-rose-500/10 text-rose-500'
                      : 'bg-emerald-500/10 text-emerald-500'
                  }`}
                >
                  {isDeactivating ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-bold flex items-center gap-1">
                    <span>Student Access</span>
                    <span className="text-[10px] text-slate-400">({studentCount} Enrolled)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {isDeactivating
                      ? 'Access to recorded lectures, notes and syllabus is temporarily paused.'
                      : 'Full 24/7 access to syllabus modules, recordings & notes is reinstated.'}
                  </p>
                </div>
              </div>

              {/* 2. Live Classes */}
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  isDeactivating
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-slate-800 dark:text-slate-200'
                    : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    isDeactivating
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-emerald-500/10 text-emerald-500'
                  }`}
                >
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold">Live Classes & Broadcast</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {isDeactivating
                      ? 'Upcoming scheduled sessions are paused. Live streaming cannot be started.'
                      : 'Faculty can schedule and broadcast interactive live masterclasses.'}
                  </p>
                </div>
              </div>

              {/* 3. Assignments & Quizzes */}
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  isDeactivating
                    ? 'bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-[#1e2c4c]'
                    : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    isDeactivating
                      ? 'bg-slate-500/10 text-slate-500'
                      : 'bg-emerald-500/10 text-emerald-500'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold">Tests & Homework Submissions</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {isDeactivating
                      ? 'Quiz timers locked; new homework submissions are disabled.'
                      : 'Quizzes, assessments and assignment uploads are unlocked.'}
                  </p>
                </div>
              </div>

              {/* 4. New Enrollments */}
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  isDeactivating
                    ? 'bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-[#1e2c4c]'
                    : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    isDeactivating
                      ? 'bg-slate-500/10 text-slate-500'
                      : 'bg-emerald-500/10 text-emerald-500'
                  }`}
                >
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold">Catalog & Enrollments</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {isDeactivating
                      ? 'Unlisted from public student catalog; new admissions are closed.'
                      : 'Course is listed for discovery and open for student admissions.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Reason for Status Change *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {isDeactivating ? (
                <>
                  <option value="Curriculum Revision & Content Update">
                    Curriculum Revision & Content Update
                  </option>
                  <option value="Academic Semester Break">Academic Semester Break</option>
                  <option value="Faculty Reassignment / Leave">Faculty Reassignment / Leave</option>
                  <option value="Batch Capacity Completed">Batch Capacity Completed</option>
                  <option value="Platform Quality Audit">Platform Quality Audit</option>
                </>
              ) : (
                <>
                  <option value="Academic Schedule Resumed">Academic Schedule Resumed</option>
                  <option value="Curriculum Updates Approved">Curriculum Updates Approved</option>
                  <option value="Faculty Ready to Conduct Batches">Faculty Ready to Conduct Batches</option>
                  <option value="New Admission Batch Opened">New Admission Batch Opened</option>
                </>
              )}
            </select>
          </div>

          {/* Interactive Notification Toggles */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-[#1e2c4c]">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-blue-500" />
              <span>Automated Notifications</span>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-[#0b1329] border border-slate-200/70 dark:border-[#1e2c4c] cursor-pointer hover:bg-slate-100/60 dark:hover:bg-[#14203a] transition-colors">
                <input
                  type="checkbox"
                  checked={notifyStudents}
                  onChange={(e) => setNotifyStudents(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Notify {studentCount} Enrolled Students
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Sends push notification & email explaining the timetable update
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-[#0b1329] border border-slate-200/70 dark:border-[#1e2c4c] cursor-pointer hover:bg-slate-100/60 dark:hover:bg-[#14203a] transition-colors">
                <input
                  type="checkbox"
                  checked={notifyInstructor}
                  onChange={(e) => setNotifyInstructor(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Notify Faculty ({instructorName || 'Assigned Instructor'})
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Informs instructor about course availability on their dashboard
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Acknowledgement Checkbox */}
          <div className="pt-2 border-t border-slate-100 dark:border-[#1e2c4c]">
            <label className="flex items-start gap-2.5 p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer mt-0.5"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                I understand these permission changes and want to proceed with marking this course as{' '}
                <strong className={isDeactivating ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                  {targetStatus}
                </strong>
                .
              </span>
            </label>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-slate-100 dark:border-[#1e2c4c] bg-slate-50/70 dark:bg-[#0b1329] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel (Keep {currentStatus})
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!acknowledged || isLoading}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isDeactivating
                ? 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700'
                : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700'
            }`}
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>
              {isDeactivating ? 'Confirm Deactivation' : 'Confirm & Activate'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

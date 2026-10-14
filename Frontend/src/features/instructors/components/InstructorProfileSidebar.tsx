import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  BookOpen,
  Users,
  Radio,
  Percent,
  CheckCircle2,
  Send,
  Link2,
  ShieldCheck,
  PauseCircle,
  RotateCcw,
  Plus,
  GraduationCap,
  Edit3,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Star,
} from 'lucide-react';
import { INITIAL_REVIEWS } from '../data/mockReviews';
import type { Instructor, AssignedCourse } from '../types/instructor';
import { CourseStatusPermissionModal } from '../../courses/components/CourseStatusPermissionModal';

interface InstructorProfileSidebarProps {
  instructor: Instructor;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onUpdateField: <K extends keyof Instructor>(key: K, value: Instructor[K]) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  onOpenAssignCourseModal: () => void;
}

export function InstructorProfileSidebar({
  instructor,
  activeTab,
  onSelectTab,
  onUpdateField,
  onShowToast,
  onOpenAssignCourseModal,
}: InstructorProfileSidebarProps) {
  const navigate = useNavigate();
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [statusModalTarget, setStatusModalTarget] = useState<AssignedCourse | null>(null);

  // Expandable Box States (like assigned courses)
  const [isCoursesExpanded, setIsCoursesExpanded] = useState<boolean>(true);
  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState<boolean>(true);

  // Retrieve latest student feedback review
  const latestReview = (() => {
    try {
      const saved = localStorage.getItem(`fukey_instructor_reviews_${instructor.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      }
    } catch {
      // fallback
    }
    return INITIAL_REVIEWS[0] || null;
  })();

  const handleSendEmail = () => {
    if (!emailSubject.trim()) {
      onShowToast('Please enter an email subject', 'error');
      return;
    }
    setEmailModalOpen(false);
    setEmailSubject('');
    setEmailBody('');
    onShowToast(`Email sent successfully to ${instructor.email}`, 'success');
  };

  const handleSendLoginLink = () => {
    navigator.clipboard?.writeText?.(
      `https://fukeyeducation.com/login?magic_token=auth_${instructor.id}_${Date.now()}`
    );
    onShowToast(`Magic login link generated and copied for ${instructor.name}`, 'success');
  };

  const handleToggleVerification = () => {
    const nextStatus = instructor.verification === 'Verified' ? 'Unverified' : 'Verified';
    onUpdateField('verification', nextStatus);
    onShowToast(`Instructor status marked as ${nextStatus}`, 'success');
  };

  const handleToggleSuspend = () => {
    const nextStatus = instructor.status === 'Suspended' ? 'Active' : 'Suspended';
    onUpdateField('status', nextStatus);
    onShowToast(
      nextStatus === 'Suspended' ? 'Instructor account has been suspended' : 'Instructor account activated',
      nextStatus === 'Suspended' ? 'info' : 'success'
    );
  };

  const handleResetPassword = () => {
    onShowToast(`Password reset link sent to ${instructor.email}`, 'info');
  };

  const handleToggleCourseStatus = (courseId: string) => {
    const list = instructor.assignedCourses || [];
    const updated = list.map((c) => {
      if (c.id === courseId) {
        const nextStatus = (c.status === 'Active' ? 'Inactive' : 'Active') as 'Active' | 'Inactive';
        return { ...c, status: nextStatus };
      }
      return c;
    });
    onUpdateField('assignedCourses', updated);
    const target = list.find((c) => c.id === courseId);
    const nextStatus = target?.status === 'Active' ? 'Inactive' : 'Active';
    onShowToast(`Course marked as ${nextStatus}`, 'success');
  };

  const handleConfirmSidebarCourseStatus = (options: {
    notifyStudents: boolean;
    notifyInstructor: boolean;
    reason: string;
  }) => {
    if (!statusModalTarget) return;
    handleToggleCourseStatus(statusModalTarget.id);
    const targetStatus = statusModalTarget.status === 'Active' ? 'Inactive' : 'Active';
    const targetCount = statusModalTarget.studentCount;
    setStatusModalTarget(null);

    if (options.notifyStudents && targetCount > 0) {
      setTimeout(() => {
        onShowToast(`Notifications dispatched to ${targetCount} students (${options.reason})`, 'info');
      }, 700);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Main Profile Card */}
      <div className="bg-white dark:bg-[#111c34] border border-slate-200/80 dark:border-[#1e2c4c] rounded-xl p-5 shadow-xs text-center sm:text-left">
        {/* Avatar + Verified badge */}
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 mb-3">
            <img
              src={instructor.avatar}
              alt={instructor.name}
              className="w-24 h-24 rounded-full object-cover ring-3 ring-blue-500/30"
            />
            {instructor.verification === 'Verified' && (
              <div
                title="Verified Instructor"
                className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center ring-2 ring-white dark:ring-[#111c34]"
              >
                <CheckCircle2 className="w-4 h-4 fill-blue-600 text-white" />
              </div>
            )}
          </div>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {instructor.name}
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            {instructor.designation}
          </p>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-2.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>{instructor.status}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-400 border border-blue-300 dark:border-blue-800">
              <CheckCircle2 className="w-3 h-3 text-blue-500" />
              <span>{instructor.verification}</span>
            </span>
          </div>

          {/* Classes & Medium Tags (9th to 12th, Hindi & English) */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              Classes 9th - 12th
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60">
              {instructor.teachingMedium || 'Hindi & English Both'}
            </span>
          </div>
        </div>

        {/* Contact info list */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#1e2c4c] space-y-2.5 text-xs">
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{instructor.email}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{instructor.phone}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Joined At</span>
            </span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {instructor.joinedAt}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Last Active</span>
            </span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {instructor.lastActive}
            </span>
          </div>
        </div>

        {/* 4-Item Mini Stat Grid (Clickable) */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#1e2c4c] grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onSelectTab?.('Courses')}
            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'Courses'
                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-1 ring-blue-500/30'
                : 'bg-slate-50 dark:bg-[#0b1329] border-slate-200/70 dark:border-[#1e2c4c]/80 hover:border-blue-400'
            }`}
            title="Click to view Courses"
          >
            <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                Total Courses
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white leading-none mt-0.5">
                {instructor.coursesCount}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab?.('Students')}
            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'Students'
                ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/30'
                : 'bg-slate-50 dark:bg-[#0b1329] border-slate-200/70 dark:border-[#1e2c4c]/80 hover:border-indigo-400'
            }`}
            title="Click to view Students"
          >
            <Users className="w-4 h-4 text-indigo-500 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                Total Students
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white leading-none mt-0.5">
                {instructor.studentsCount}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab?.('Live Classes')}
            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'Live Classes'
                ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-500 ring-1 ring-purple-500/30'
                : 'bg-slate-50 dark:bg-[#0b1329] border-slate-200/70 dark:border-[#1e2c4c]/80 hover:border-purple-400'
            }`}
            title="Click to view Live Classes"
          >
            <Radio className="w-4 h-4 text-purple-500 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                Live Classes
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white leading-none mt-0.5">
                {instructor.liveClassesDone}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab?.('Attendance')}
            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'Attendance'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/30'
                : 'bg-slate-50 dark:bg-[#0b1329] border-slate-200/70 dark:border-[#1e2c4c]/80 hover:border-emerald-400'
            }`}
            title="Click to view Attendance"
          >
            <Percent className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                Avg Attendance
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white leading-none mt-0.5">
                {instructor.attendancePercentage}%
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Quick Actions Card */}
      <div
        id="quick-actions-card"
        className="bg-white dark:bg-[#111c34] border border-slate-200/80 dark:border-[#1e2c4c] rounded-xl p-4 sm:p-5 shadow-xs space-y-2.5 transition-all duration-300"
      >
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
          Quick Actions
        </h3>

        {/* Send Email */}
        <button
          onClick={() => setEmailModalOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-xs cursor-pointer"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Send Email</span>
        </button>

        {/* Send Login Link */}
        <button
          onClick={handleSendLoginLink}
          className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <Link2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Send Login Link</span>
        </button>

        {/* Verify Account */}
        <button
          onClick={handleToggleVerification}
          className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-[#162238] border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{instructor.verification === 'Verified' ? 'Unverify Account' : 'Verify Account'}</span>
        </button>

        {/* Suspend Account */}
        <button
          onClick={handleToggleSuspend}
          className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-[#162238] border border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
        >
          <PauseCircle className="w-3.5 h-3.5" />
          <span>{instructor.status === 'Suspended' ? 'Activate Account' : 'Suspend Account'}</span>
        </button>

        {/* Reset Password */}
        <button
          onClick={handleResetPassword}
          className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Password</span>
        </button>
      </div>

      {/* 3. Assigned Courses Card (Expandable Box) */}
      <div className="bg-white dark:bg-[#111c34] border border-slate-200/80 dark:border-[#1e2c4c] rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Assigned Courses
            </h3>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-slate-300">
              {instructor.assignedCourses?.length || 0}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsCoursesExpanded(!isCoursesExpanded)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isCoursesExpanded ? 'Collapse courses box' : 'Expand courses box'}
            >
              {isCoursesExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={onOpenAssignCourseModal}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3 h-3" />
              <span>Assign</span>
            </button>
          </div>
        </div>

        {!isCoursesExpanded ? (
          <button
            type="button"
            onClick={() => setIsCoursesExpanded(true)}
            className="w-full py-2 px-3 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 border border-dashed border-blue-200 dark:border-blue-900/60 rounded-lg hover:bg-blue-100/50 transition-colors flex items-center justify-between cursor-pointer"
          >
            <span>{instructor.assignedCourses?.length || 0} Courses Assigned</span>
            <span className="text-[11px] font-bold flex items-center gap-0.5">
              Click to Expand <ChevronDown className="w-3 h-3" />
            </span>
          </button>
        ) : (
          <div className="space-y-2.5">
            {instructor.assignedCourses && instructor.assignedCourses.length > 0 ? (
              instructor.assignedCourses.map((course) => {
                const isActive = course.status === 'Active';

                return (
                  <div
                    key={course.id}
                    onClick={() => navigate(`/admin/users/instructors/${instructor.id}/courses/${course.id}`)}
                    className={`p-3 rounded-lg border flex items-center justify-between gap-3 transition-colors cursor-pointer group ${
                      isActive
                        ? 'bg-slate-50 dark:bg-[#0b1329] border-slate-200/70 dark:border-[#1e2c4c] hover:border-blue-500 hover:shadow-xs'
                        : 'bg-slate-100/50 dark:bg-[#080e1c] border-slate-200 dark:border-slate-800 opacity-80 hover:border-blue-400'
                    }`}
                    title="Click to view Course Details & Syllabus"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white'
                            : 'bg-slate-500/10 text-slate-400'
                        }`}
                      >
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-500 transition-colors">
                          {course.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <span>{course.studentCount} Students</span>
                          <span>·</span>
                          <span className="text-blue-500 font-medium">Details →</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {/* Toggle Active / Inactive Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatusModalTarget(course);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-300'
                        }`}
                        title={isActive ? 'Click to make Inactive' : 'Click to make Active'}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        <span>{isActive ? 'Active' : 'Inactive'}</span>
                      </button>

                      {/* Edit Course Information */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/users/instructors/${instructor.id}/courses/${course.id}?tab=Information`);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Course Information"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">
                No courses assigned yet.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 4. Student Feedback Card (Expandable Box like Assigned Courses) */}
      <div className="bg-white dark:bg-[#111c34] border border-slate-200/80 dark:border-[#1e2c4c] rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
              <span>Student Feedback</span>
            </h3>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span>{instructor.rating || 4.9}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsFeedbackExpanded(!isFeedbackExpanded)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isFeedbackExpanded ? 'Collapse feedback box' : 'Expand feedback box'}
            >
              {isFeedbackExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => onSelectTab?.('Performance')}
              className="inline-flex items-center gap-0.5 text-[11px] font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 cursor-pointer"
            >
              <span>View Feed</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Content based on isFeedbackExpanded */}
        {!isFeedbackExpanded ? (
          <button
            type="button"
            onClick={() => setIsFeedbackExpanded(true)}
            className="w-full py-2 px-3 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 border border-dashed border-blue-200 dark:border-blue-900/60 rounded-lg hover:bg-blue-100/50 transition-colors flex items-center justify-between cursor-pointer"
          >
            <span className="truncate">
              {latestReview ? `Latest: "${latestReview.comment.slice(0, 30)}..."` : 'View reviews'}
            </span>
            <span className="text-[11px] font-bold shrink-0 flex items-center gap-0.5">
              Expand <ChevronDown className="w-3 h-3" />
            </span>
          </button>
        ) : (
          <div className="space-y-2.5">
            {latestReview ? (
              <div
                onClick={() => onSelectTab?.('Performance')}
                className="p-3 rounded-lg bg-slate-50 dark:bg-[#0b1329] border border-slate-200/70 dark:border-[#1e2c4c] space-y-2 hover:border-blue-400 transition-all cursor-pointer group"
                title="Click to open Performance & Feedback tab"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={latestReview.studentAvatar}
                      alt={latestReview.studentName}
                      className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-blue-500/30"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-500 transition-colors">
                        {latestReview.studentName}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {latestReview.courseName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-2.5 h-2.5 ${
                          s <= latestReview.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-slate-700 dark:text-slate-300 italic line-clamp-2 leading-relaxed">
                  "{latestReview.comment}"
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-[#1e2c4c] text-[10px] text-slate-400">
                  <span>{latestReview.createdAt}</span>
                  <span className="text-blue-500 font-semibold group-hover:underline flex items-center gap-0.5">
                    Open in Tab →
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-2">
                No student feedback yet.
              </p>
            )}

            <button
              type="button"
              onClick={() => onSelectTab?.('Performance')}
              className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-center text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-900/60 transition-colors cursor-pointer"
            >
              Expand All Reviews & Reply →
            </button>
          </div>
        )}
      </div>

      {/* Send Email Quick Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#10192d] border border-slate-200 dark:border-[#1e2c4c] rounded-2xl shadow-2xl p-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Send Email to {instructor.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                To: {instructor.email}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  placeholder="Enter email subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Write your email message here..."
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-[#1e2c4c] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEmailModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Status & Permissions Confirmation Modal */}
      {statusModalTarget && (
        <CourseStatusPermissionModal
          isOpen={!!statusModalTarget}
          onClose={() => setStatusModalTarget(null)}
          onConfirm={handleConfirmSidebarCourseStatus}
          currentStatus={statusModalTarget.status === 'Active' ? 'Active' : 'Inactive'}
          courseName={statusModalTarget.name}
          courseCode={statusModalTarget.id}
          studentCount={statusModalTarget.studentCount}
          instructorName={instructor.name}
        />
      )}
    </div>
  );
}

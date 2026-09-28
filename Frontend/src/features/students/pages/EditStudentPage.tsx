import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  Save,
  User,
  GraduationCap,
  BarChart2,
  MessagesSquare,
  Bell,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useStudent } from '../hooks/useStudent';
import { EditStudentSidebarCards } from '../components/EditStudentSidebarCards';
import { EditStudentProfileTab } from '../components/EditStudentProfileTab';
import { EditStudentCoursesTab } from '../components/EditStudentCoursesTab';
import { EditStudentActivityTab } from '../components/EditStudentActivityTab';
import { EditStudentLogsTab } from '../components/EditStudentLogsTab';
import { StudentFeedbackKpis } from '../components/StudentFeedbackKpis';
import { StudentFeedbackSummary } from '../components/StudentFeedbackSummary';
import { ExtendAccessModal } from '../components/ExtendAccessModal';
import { SendEmailModal } from '../components/SendEmailModal';
import { getStudentFeedback } from '../data/mockFeedbackData';

type ActiveTab = 'profile' | 'courses' | 'activity' | 'feedback' | 'logs';

const TAB_BASE = 'flex items-center gap-2 px-4 py-2 text-xs sm:text-sm transition-all rounded-xl';
const TAB_ACTIVE = 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30';
const TAB_IDLE =
  'text-[#64748b] dark:text-slate-400 hover:text-[#0f172a] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40 font-medium';

export const EditStudentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    student,
    setStudent,
    loading,
    saving,
    error,
    updateStudent,
    resetChanges,
    extendAccess,
    deleteAccount,
  } = useStudent(id);

  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isFeedbackTargeted] = useState(false);
  const [isQuickActionsTargeted, setIsQuickActionsTargeted] = useState(false);
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);

  // Compute actual feedback messages submitted across all courses
  const studentFeedbacks = useMemo(() => {
    if (!student) return [];
    if (student.feedback && student.feedback.length > 0) return student.feedback;
    const courseNames = student.courses?.map((c) => c.name) || [student.primaryCourse];
    return getStudentFeedback(student.id, student.name, courseNames);
  }, [student]);

  const feedbackCount = studentFeedbacks.length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleKpiNavigate = (tab: ActiveTab, targetElementId: string) => {
    setActiveTab(tab);
    setHighlightedSection(tab);

    setTimeout(() => {
      const el = document.getElementById(targetElementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);

    setTimeout(() => {
      setHighlightedSection(null);
    }, 2500);
  };

  const handleScrollToQuickActions = () => {
    setIsQuickActionsTargeted(true);
    setTimeout(() => {
      const el = document.getElementById('quick-actions-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
    setTimeout(() => {
      setIsQuickActionsTargeted(false);
    }, 2500);
  };

  const handleSaveChanges = async () => {
    if (!student) return;
    try {
      await updateStudent(student);
      showToast('Changes saved successfully!');
    } catch {
      showToast('Failed to save changes.');
    }
  };

  const handleReset = () => {
    resetChanges();
    showToast('Form reset to initial values.');
  };

  const handleDelete = async () => {
    if (!student) return;
    if (confirm(`Are you sure you want to permanently delete ${student.name}'s account? This action cannot be undone.`)) {
      await deleteAccount();
      navigate('/admin/students');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-[#64748b] dark:text-slate-400">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading student profile...</span>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#0d162c] border border-[#e2e8f0] dark:border-slate-800 rounded-2xl max-w-lg mx-auto mt-12">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-1">Student Not Found</h3>
        <p className="text-xs text-[#64748b] dark:text-slate-400 mb-4">
          The requested student could not be located in the database.
        </p>
        <Link to="/admin/students">
          <Button variant="primary" size="sm">
            Return to All Students
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium animate-in slide-in-from-bottom-5">
          <span>✓ {toastMessage}</span>
        </div>
      )}

      {/* Top Bar with Back Link, Page Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/users/students"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors mb-2 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to All Students</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a] dark:text-white tracking-tight">
            Edit {student.name}
          </h1>
          <p className="text-xs text-[#64748b] dark:text-slate-400 mt-0.5">
            Update student information and manage course enrollment for {student.name}
          </p>
        </div>

        {/* Action Buttons: Reset & Save Changes */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleReset}
            className="!text-xs sm:!text-sm !py-2 !px-4 border-[#e2e8f0] dark:border-slate-700/80 bg-white dark:bg-[#0c152a] hover:bg-slate-50 dark:hover:bg-[#121f3f] text-slate-700 dark:text-slate-300 !rounded-lg"
          >
            <RotateCcw className="w-4 h-4 mr-1.5 text-slate-500 dark:text-slate-400" />
            Reset
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            isLoading={saving}
            onClick={handleSaveChanges}
            className="!text-xs sm:!text-sm !py-2 !px-4 font-semibold !rounded-lg shadow-lg shadow-blue-600/30"
          >
            <Save className="w-4 h-4 mr-1.5" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Top 5 KPI Cards */}
      <StudentFeedbackKpis
        student={student}
        totalCourses={student.courses?.length || student.totalCourses || 1}
        overallProgress={student.progress}
        feedbackCount={feedbackCount}
        onProfileClick={() => handleKpiNavigate('profile', 'profile-details-section')}
        onCoursesKpiClick={() => handleKpiNavigate('courses', 'courses-section')}
        onProgressKpiClick={() => handleKpiNavigate('activity', 'activity-section')}
        onFeedbackKpiClick={() => handleKpiNavigate('feedback', 'feedback-section')}
        onQuickActionsClick={handleScrollToQuickActions}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-4 xl:col-span-4">
          <EditStudentSidebarCards
            student={student}
            isQuickActionsTargeted={isQuickActionsTargeted}
            onSendEmail={() => setIsEmailModalOpen(true)}
            onSendLoginLink={() => {
              showToast(`Login link generated and dispatched to ${student.email}`);
            }}
            onExtendAccess={() => setIsExtendModalOpen(true)}
            onDeleteAccount={handleDelete}
            onAddCourse={() => setActiveTab('courses')}
            onSelectCourse={(courseId) => {
              setSelectedCourseId(courseId);
              setActiveTab('courses');
            }}
          />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-4">
          {/* Tab Navigation Bar */}
          <div className="bg-white dark:bg-[#0c152b] border border-[#e2e8f0] dark:border-slate-800/80 rounded-2xl p-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`${TAB_BASE} ${activeTab === 'profile' ? TAB_ACTIVE : TAB_IDLE}`}
            >
              <User className="w-4 h-4" />
              <span>Profile Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('courses')}
              className={`${TAB_BASE} ${activeTab === 'courses' ? TAB_ACTIVE : TAB_IDLE}`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Course Enrollment</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('activity')}
              className={`${TAB_BASE} ${activeTab === 'activity' ? TAB_ACTIVE : TAB_IDLE}`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Activity &amp; Progress</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('feedback')}
              className={`${TAB_BASE} ${activeTab === 'feedback' ? TAB_ACTIVE : TAB_IDLE}`}
            >
              <MessagesSquare className="w-4 h-4" />
              <span>Feedback</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'feedback'
                    ? 'bg-white/20 text-white'
                    : 'bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30'
                }`}
              >
                {feedbackCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('logs')}
              className={`${TAB_BASE} ${activeTab === 'logs' ? TAB_ACTIVE : TAB_IDLE}`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications &amp; Logs</span>
            </button>
          </div>

          {/* Tab Content Display */}
          <div>
            {activeTab === 'profile' && (
              <div
                id="profile-details-section"
                className={`scroll-mt-24 transition-all duration-300 rounded-2xl ${
                  highlightedSection === 'profile'
                    ? 'ring-2 ring-blue-500 shadow-2xl shadow-blue-500/25'
                    : ''
                }`}
              >
                <EditStudentProfileTab
                  student={student}
                  onChange={(fields) => setStudent({ ...student, ...fields })}
                />
              </div>
            )}

            {activeTab === 'courses' && (
              <div
                id="courses-section"
                className={`scroll-mt-24 transition-all duration-300 rounded-2xl ${
                  highlightedSection === 'courses'
                    ? 'ring-2 ring-blue-500 shadow-2xl shadow-blue-500/25'
                    : ''
                }`}
              >
                <EditStudentCoursesTab
                  student={student}
                  initialSelectedCourseId={selectedCourseId}
                  onSelectCourseForProgress={(courseId) => {
                    setSelectedCourseId(courseId);
                    setActiveTab('activity');
                  }}
                  onUpdateCourses={(updatedCourses) => {
                    const totalLectures = updatedCourses.reduce((sum, c) => sum + (c.totalLectures || 0), 0);
                    const completedLectures = updatedCourses.reduce((sum, c) => sum + (c.completedLectures || 0), 0);
                    const avgProgress =
                      totalLectures > 0
                        ? Math.round((completedLectures / totalLectures) * 100)
                        : updatedCourses[0]?.progress ?? student.progress;

                    setStudent({
                      ...student,
                      courses: updatedCourses,
                      totalCourses: updatedCourses.length,
                      progress: avgProgress,
                      primaryCourse: updatedCourses[0]?.name || student.primaryCourse,
                    });
                  }}
                />
              </div>
            )}

            {activeTab === 'activity' && (
              <div
                id="activity-section"
                className={`scroll-mt-24 transition-all duration-300 rounded-2xl ${
                  highlightedSection === 'activity'
                    ? 'ring-2 ring-emerald-500 shadow-2xl shadow-emerald-500/25'
                    : ''
                }`}
              >
                <EditStudentActivityTab
                  student={student}
                  initialSelectedCourseId={selectedCourseId}
                  onSelectCourse={(courseId) => setSelectedCourseId(courseId)}
                  isFeedbackTargeted={isFeedbackTargeted}
                />
              </div>
            )}

            {activeTab === 'feedback' && (
              <div
                id="feedback-section"
                className={`scroll-mt-24 transition-all duration-300 rounded-2xl ${
                  highlightedSection === 'feedback'
                    ? 'ring-2 ring-purple-500 shadow-2xl shadow-purple-500/25'
                    : ''
                }`}
              >
                <StudentFeedbackSummary student={student} />
              </div>
            )}

            {activeTab === 'logs' && (
              <div id="logs-section" className="scroll-mt-24">
                <EditStudentLogsTab student={student} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Extend Access Modal */}
      <ExtendAccessModal
        isOpen={isExtendModalOpen}
        onClose={() => setIsExtendModalOpen(false)}
        student={student}
        onConfirm={async (years) => {
          await extendAccess(years);
          showToast(`Access extended by ${years} year(s).`);
        }}
      />

      {/* Send Email Modal */}
      <SendEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        student={student}
        onSend={() => {
          showToast(`Email dispatched to ${student.email}`);
        }}
      />
    </div>
  );
};
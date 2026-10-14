import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  Save,
  User,
  GraduationCap,
  Radio,
  Clock,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useInstructorDetail } from '../hooks/useInstructors';
import { InstructorEditKpis } from '../components/InstructorEditKpis';
import { InstructorProfileSidebar } from '../components/InstructorProfileSidebar';
import { InstructorProfileTab } from '../components/InstructorProfileTab';
import { InstructorOtherTabs } from '../components/InstructorOtherTabs';
import { AssignCourseModal } from '../components/AssignCourseModal';
import { Toast } from '../../../components/ui/Toast';
import type { AssignedCourse } from '../types/instructor';

export function EditInstructorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    instructor,
    loading,
    saving,
    saveSuccess,
    error,
    updateField,
    updateSocialLink,
    resetForm,
    saveChanges,
  } = useInstructorDetail(id);

  const [activeTab, setActiveTab] = useState<string>('Profile');
  const [isAssignCourseModalOpen, setIsAssignCourseModalOpen] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3500);
  };

  const handleSave = async () => {
    const success = await saveChanges();
    if (success) {
      showToast('Instructor profile and settings saved successfully', 'success');
    } else {
      showToast('Failed to save instructor changes', 'error');
    }
  };

  const handleReset = () => {
    resetForm();
    showToast('Changes discarded. Original data restored.', 'info');
  };

  const handleAssignCourse = (course: AssignedCourse) => {
    if (!instructor) return;
    const currentCourses = instructor.assignedCourses || [];
    const updatedCourses = [course, ...currentCourses];
    updateField('assignedCourses', updatedCourses);
    updateField('coursesCount', updatedCourses.length);
    showToast(`Course "${course.name}" assigned to ${instructor.name}`, 'success');
  };

  const tabs = [
    { id: 'Profile', label: 'Profile', icon: User },
    { id: 'Courses', label: 'Courses', icon: GraduationCap },
    { id: 'Live Classes', label: 'Live Classes', icon: Radio },
    { id: 'Attendance', label: 'Attendance', icon: Clock },
    { id: 'Students', label: 'Students', icon: Users },
    { id: 'Performance', label: 'Performance', icon: TrendingUp },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Loading instructor profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !instructor) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#111c34] border border-slate-200 dark:border-[#1e2c4c] rounded-2xl max-w-lg mx-auto mt-12 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Instructor Not Found
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The instructor ID <span className="font-mono text-blue-500">{id}</span> could not be located.
        </p>
        <button
          onClick={() => navigate('/admin/users/instructors')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Instructors</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Breadcrumb link */}
      <div>
        <Link
          to="/admin/users/instructors"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-400 hover:underline transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Instructors</span>
        </Link>
      </div>

      {/* Page Title & Top Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Edit {instructor.name || 'Instructor'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage instructor profile, courses, classes, attendance and account settings.
          </p>
        </div>

        {/* Action Buttons: Reset & Save Changes */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-[#162238] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-all shadow-sm shadow-blue-600/30 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* 6 Top KPI Summary Cards (Actionable / Clickable) */}
      <InstructorEditKpis
        instructor={instructor}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          const el = document.getElementById('instructor-tabs-nav');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }}
        onGoToQuickActions={() => {
          const el = document.getElementById('quick-actions-card');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-4', 'ring-blue-500/80', 'shadow-lg', 'shadow-blue-500/25');
            setTimeout(() => {
              el.classList.remove('ring-4', 'ring-blue-500/80', 'shadow-lg', 'shadow-blue-500/25');
            }, 2200);
          }
        }}
      />

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Profile Card + Quick Actions + Assigned Courses (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <InstructorProfileSidebar
            instructor={instructor}
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              const el = document.getElementById('instructor-tabs-nav');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }}
            onUpdateField={updateField}
            onShowToast={showToast}
            onOpenAssignCourseModal={() => setIsAssignCourseModalOpen(true)}
          />
        </div>

        {/* Right Column: Tabs Navigation + Tab Contents (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Tabs Navigation Bar */}
          <div
            id="instructor-tabs-nav"
            className="bg-white dark:bg-[#111c34] border border-slate-200/80 dark:border-[#1e2c4c] rounded-xl px-2 py-1.5 shadow-xs overflow-x-auto scrollbar-none"
          >
            <div className="flex items-center gap-1 min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-500' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tab View */}
          {activeTab === 'Profile' ? (
            <InstructorProfileTab
              instructor={instructor}
              onUpdateField={updateField}
              onUpdateSocialLink={updateSocialLink}
              onShowToast={showToast}
            />
          ) : (
            <InstructorOtherTabs
              activeTab={activeTab}
              instructor={instructor}
              onUpdateField={updateField}
              onShowToast={showToast}
              onOpenAssignCourseModal={() => setIsAssignCourseModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Assign Course Modal */}
      <AssignCourseModal
        instructor={instructor}
        isOpen={isAssignCourseModalOpen}
        onClose={() => setIsAssignCourseModalOpen(false)}
        onAssignCourse={handleAssignCourse}
      />

      {/* Feedback Toast */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}

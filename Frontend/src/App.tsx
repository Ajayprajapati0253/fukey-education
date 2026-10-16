import React from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
} from 'react-router-dom';

// Admin layout and dashboard
import { AdminLayout } from './layouts/admin/AdminLayout';
import { AdminDashboardPage } from './features/admin/dashboard/pages/AdminDashboardPage';

// Courses
import { CoursesPage } from './features/courses/pages/CoursesPage';
import CategoriesPage from './features/categories/pages/CategoriesPage';
import { CourseLanguagesPage } from './features/course-languages/pages/CourseLanguagesPage';
import CourseReviewsPage from './features/course-reviews/pages/CourseReviewsPage';
import CourseSubCategoriesPage from './features/course-sub-categories/pages/CourseSubCategoriesPage';

// Blogs
import { BlogsPage } from './features/blogs/pages/BlogsPage';
import BlogCategoriesPage from './features/blog-categories/pages/BlogCategoriesPage';

// Live classes
import LiveClassesPage from './features/live-classes/pages/LiveClassesPage';
import { CalendarViewsPage } from './features/calendar-views/pages/CalendarViewsPage';
import { AttendancePage } from './features/attendance/pages/AttendancePage';

// Students
import { AllStudentsPage } from './features/students/pages/AllStudentsPage';
import { EditStudentPage } from './features/students/pages/EditStudentPage';

// Instructors
import { AllInstructorsListPage } from './features/instructors/pages/AllInstructorsListPage';
import { EditInstructorPage } from './features/instructors/pages/EditInstructorPage';

// Study materials
import {
  StudyMaterialsOverviewPage,
  NotesManagementPage,
  PracticeQuestionsManagementPage,
  FormulaSheetsManagementPage,
  MCQManagementPage,
  ImportantQuestionsManagementPage,
  SamplePapersManagementPage,
  TestSeriesManagementPage,
  QuestionBankManagementPage,
} from './features/study-materials/pages/StudyMaterialsPages';

// Free courses
import { FreeCoursesPage } from './features/free-courses/pages/FreeCoursesPage';
import { FreeCourseCategoriesPage } from './features/free-courses/pages/FreeCourseCategoriesPage';
import { FreeCourseDeleteRequestsPage } from './features/free-courses/pages/FreeCourseDeleteRequestsPage';
import { FreeCourseEditPage } from './features/free-courses/pages/FreeCourseEditPage';
import { FreeCourseLanguagesPage } from './features/free-courses/pages/FreeCourseLanguagesPage';
import { FreeCourseLevelsPage } from './features/free-courses/pages/FreeCourseLevelsPage';
import { FreeCourseReviewsPage } from './features/free-courses/pages/FreeCourseReviewsPage';
import { FreeCoursesToastLayout } from './features/free-courses/hooks/useFreeToast';
import { FreeCourseCreatePage } from './features/free-courses/pages/FreeCourseCreatePage';

// Admin authentication
import { AdminLoginPage } from './features/admin/auth/pages/AdminLoginPage';

// Careers
import CareerApplicationsPage from './features/career-applications/pages/CareerApplicationsPage';
import CareerJobListingsPage from './features/careers/pages/CareerJobListingsPage';

// Coupons
import CouponsPage from './features/coupons/pages/CouponsPage';

// Sidebar configuration
import { SIDEBAR_GROUPS } from './layouts/admin/sidebar/sidebar.config';

// Icons
import {
  ArrowLeft,
  Construction,
  SearchX,
} from 'lucide-react';

/**
 * Collect sidebar routes for the admin catch-all.
 */
const VALID_ROUTES = new Set<string>();

SIDEBAR_GROUPS.forEach((group) => {
  group.items.forEach((item) => {
    VALID_ROUTES.add(item.route);

    item.children?.forEach((child) => {
      VALID_ROUTES.add(child.route);
    });
  });
});

/**
 * Placeholder for sidebar routes whose actual pages
 * have not been implemented yet.
 */
const PlaceholderPage: React.FC = () => {
  const location = useLocation();
  const currentRoute = location.pathname;

  return (
    <div className="bg-white p-8 sm:p-12 rounded-2xl border border-border-subtle text-center max-w-xl mx-auto my-12 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="w-12 h-12 rounded-2xl bg-[#EAF0FE] text-[#2451D9] flex items-center justify-center mx-auto">
        <Construction className="w-6 h-6" />
      </div>

      <h2 className="text-xl font-bold text-[#12141C]">
        {currentRoute
          .replace('/admin/', '')
          .replace('-', ' ')
          .toUpperCase()}{' '}
        Management
      </h2>

      <p className="text-xs text-[#686E7D] max-w-md mx-auto">
        This module is connected to the backend route ({currentRoute}).
        You can preview the primary dashboard overview anytime.
      </p>

      <div className="pt-4">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2451D9] text-white rounded-xl text-xs font-bold hover:bg-[#1E44B8] transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

/**
 * Admin catch-all.
 */
const AdminCatchAll: React.FC = () => {
  const location = useLocation();

  return VALID_ROUTES.has(location.pathname) ? (
    <PlaceholderPage />
  ) : (
    <StandaloneNotFound />
  );
};

/**
 * Full-screen 404 page.
 */
const StandaloneNotFound: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-app-bg px-4">
      <div className="bg-white p-8 sm:p-12 rounded-2xl border text-danger text-center max-w-xl w-full space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="w-12 h-12 rounded-2xl bg-danger-soft text-danger flex items-center justify-center mx-auto">
          <SearchX className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold text-ink">
          404 — Page Not Found
        </h2>

        <p className="text-xs text-ink-soft max-w-md mx-auto">
          The route{' '}
          <span className="font-mono">{location.pathname}</span> does not
          exist.
        </p>

        <div className="pt-4">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-xs font-bold hover:bg-[#1E44B8] transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      {/* ROOT */}
      <Route
        path="/"
        element={<Navigate to="/admin/login" replace />}
      />

      {/* ADMIN LOGIN */}
      <Route
        path="/admin/login"
        element={<AdminLoginPage />}
      />

      {/* ADMIN PANEL */}
      <Route path="/admin" element={<AdminLayout />}>
        {/* Admin root */}
        <Route
          index
          element={<Navigate to="/admin/dashboard" replace />}
        />

        {/* Dashboard */}
        <Route
          path="dashboard"
          element={<AdminDashboardPage />}
        />

        {/* Courses */}
        <Route path="courses">
          <Route index element={<CoursesPage />} />

          <Route
            path="all-courses"
            element={<CoursesPage />}
          />

          <Route
            path="classes"
            element={<CategoriesPage />}
          />

          <Route
            path="subjects"
            element={<CourseSubCategoriesPage />}
          />

          <Route
            path="medium"
            element={<CourseLanguagesPage />}
          />
        </Route>

        {/* Course reviews */}
        <Route
          path="course-reviews"
          element={<CourseReviewsPage />}
        />

        {/* Free courses */}
        <Route
          path="free-courses"
          element={<FreeCoursesToastLayout />}
        >
          <Route index element={<FreeCoursesPage />} />

          <Route
            path="all-free-courses"
            element={<FreeCoursesPage />}
          />

          <Route
            path="edit/:id"
            element={<FreeCourseEditPage />}
          />

          <Route
            path="categories"
            element={<FreeCourseCategoriesPage />}
          />

          <Route
            path="languages"
            element={<FreeCourseLanguagesPage />}
          />

          <Route
            path="levels"
            element={<FreeCourseLevelsPage />}
          />

          <Route
            path="reviews"
            element={<FreeCourseReviewsPage />}
          />

          <Route
            path="delete-requests"
            element={<FreeCourseDeleteRequestsPage />}
          />

          <Route
            path="create"
            element={<FreeCourseCreatePage />}
          />
        </Route>

        {/* Blogs */}
        <Route path="blogs">
          <Route index element={<BlogsPage />} />

          <Route
            path="all-posts"
            element={<BlogsPage />}
          />

          <Route
            path="categories"
            element={<BlogCategoriesPage />}
          />
        </Route>

        {/* Live classes */}
        <Route path="live-classes">
          <Route
            index
            element={<LiveClassesPage />}
          />

          <Route
            path="live-classes"
            element={<LiveClassesPage />}
          />

          <Route
            path="calendar-views"
            element={<CalendarViewsPage />}
          />

          <Route
            path="attendance"
            element={<AttendancePage />}
          />
        </Route>

        {/* Study materials */}
        <Route path="study-materials">
          <Route
            index
            element={<StudyMaterialsOverviewPage />}
          />

          <Route
            path="notes"
            element={<NotesManagementPage />}
          />

          <Route
            path="practice-questions"
            element={<PracticeQuestionsManagementPage />}
          />

          <Route
            path="formula-sheets"
            element={<FormulaSheetsManagementPage />}
          />

          <Route
            path="mcq"
            element={<MCQManagementPage />}
          />

          <Route
            path="important-questions"
            element={<ImportantQuestionsManagementPage />}
          />

          <Route
            path="sample-papers"
            element={<SamplePapersManagementPage />}
          />

          <Route
            path="test-series"
            element={<TestSeriesManagementPage />}
          />

          <Route
            path="complete-question-bank"
            element={<QuestionBankManagementPage />}
          />
        </Route>

        {/* Students and instructors */}
        <Route path="users">
          <Route path="students">
            <Route
              index
              element={<AllStudentsPage />}
            />

            <Route
              path=":id/edit"
              element={<EditStudentPage />}
            />
          </Route>

          <Route path="instructors">
            <Route
              index
              element={<AllInstructorsListPage />}
            />

            <Route
              path=":id/edit"
              element={<EditInstructorPage />}
            />
          </Route>
        </Route>

        {/* Careers */}
        <Route path="careers">
          <Route
            index
            element={<PlaceholderPage />}
          />

          <Route
            path="job-listings"
            element={<CareerJobListingsPage />}
          />

          <Route
            path="applications"
            element={<CareerApplicationsPage />}
          />
        </Route>

        {/* Coupons */}
        <Route
          path="coupons"
          element={<CouponsPage />}
        />

        {/* Admin catch-all */}
        <Route
          path="*"
          element={<AdminCatchAll />}
        />
      </Route>

      {/* Global 404 */}
      <Route
        path="*"
        element={<StandaloneNotFound />}
      />
    </Routes>
  );
}
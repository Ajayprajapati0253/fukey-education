import React from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
} from 'react-router-dom';

import { AdminLayout } from './layouts/admin/AdminLayout';
import { AdminDashboardPage } from './features/admin/dashboard/pages/AdminDashboardPage';
import { CoursesPage } from './features/courses/pages/CoursesPage';
import { BlogsPage } from './features/blogs/pages/BlogsPage';
import LiveClassesPage from './features/live-classes/pages/LiveClassesPage';
import { CalendarViewsPage } from './features/calendar-views/pages/CalendarViewsPage';
import { AttendancePage } from './features/attendance/pages/AttendancePage';

import { AdminLoginPage } from './features/admin/auth/pages/AdminLoginPage';
import { CourseLanguagesPage } from './features/course-languages/pages/CourseLanguagesPage';
import CourseReviewsPage from './features/course-reviews/pages/CourseReviewsPage';
import CourseSubCategoriesPage from './features/course-sub-categories/pages/CourseSubCategoriesPage';
import BlogCategoriesPage from './features/blog-categories/pages/BlogCategoriesPage';

import { SIDEBAR_GROUPS } from './layouts/admin/sidebar/sidebar.config';

import {
  ArrowLeft,
  Construction,
  SearchX,
} from 'lucide-react';

import CategoriesPage from './features/categories/pages/CategoriesPage';
import CareerApplicationsPage from './features/career-applications/pages/CareerApplicationsPage';
import CareerJobListingsPage from './features/careers/pages/CareerJobListingsPage';
import CouponsPage from './features/coupons/pages/CouponsPage';

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
 * Placeholder for sidebar routes that are defined
 * but don't have their actual page yet.
 */
const PlaceholderPage: React.FC = () => {
  const location = useLocation();
  const currentRoute = location.pathname;

  return (
    <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#E6E8EE] text-center max-w-xl mx-auto my-12 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
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
        This module is connected to the backend route (
        {currentRoute}). You can preview the primary
        dashboard overview anytime.
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
 * Full-screen 404.
 */
const StandaloneNotFound: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F6F7FA] px-4">
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#E6E8EE] text-center max-w-xl w-full space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="w-12 h-12 rounded-2xl bg-[#FCEAE4] text-[#DC5B3E] flex items-center justify-center mx-auto">
          <SearchX className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold text-[#12141C]">
          404 — Page Not Found
        </h2>

        <p className="text-xs text-[#686E7D] max-w-md mx-auto">
          The route{' '}
          <span className="font-mono">
            {location.pathname}
          </span>{' '}
          does not exist.
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
    </div>
  );
};

export default function App() {
  return (
    <Routes>

      {/* =================================
          ROOT
         ================================= */}
      <Route
        path="/"
        element={
          <Navigate
            to="/admin/login"
            replace
          />
        }
      />

      {/* =================================
          ADMIN AUTH
          No sidebar / no admin layout
         ================================= */}
      <Route
        path="/admin/login"
        element={<AdminLoginPage />}
      />

      {/* =================================
          ADMIN PANEL
         ================================= */}
      <Route
        path="/admin"
        element={<AdminLayout />}
      >
        {/* Admin root */}
        <Route
          index
          element={
            <Navigate
              to="/admin/dashboard"
              replace
            />
          }
        />

        {/* =================================
            DASHBOARD
           ================================= */}
        <Route
          path="dashboard"
          element={<AdminDashboardPage />}
        />

        {/* =================================
            COURSES
           ================================= */}
        <Route path="courses">

          <Route
            index
            element={<CoursesPage />}
          />

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

        {/* Course Reviews */}
        <Route
          path="course-reviews"
          element={<CourseReviewsPage />}
        />

        {/* =================================
            FREE COURSES
           ================================= */}
        <Route path="free-courses">

          <Route
            index
            element={<CoursesPage />}
          />

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
        {/* =================================
            BLOGS
           ================================= */}
        <Route path="blogs">

          <Route
            index
            element={<BlogsPage />}
          />

          <Route
            path="all-posts"
            element={<BlogsPage />}
          />

          <Route
            path="categories"
            element={<BlogCategoriesPage />}
          />

        </Route>

        {/* =================================
            LIVE CLASSES
           ================================= */}
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

        {/* =================================
            CAREERS
           ================================= */}
        <Route path="careers">

          {/* /admin/careers */}
          <Route
            index
            element={<PlaceholderPage />}
          />

          {/* /admin/careers/job-listings */}
          {/* <Route
            path="job-listings"
            element={<PlaceholderPage />}
          /> */}
          
          <Route
            path="job-listings"
            element={<CareerJobListingsPage />}
          />

          {/* /admin/careers/applications */}
          <Route
            path="applications"
            element={<CareerApplicationsPage />}
          />

        </Route>

        <Route
          path="coupons"
          element={<CouponsPage />}
        />

        {/* =================================
            ADMIN CATCH-ALL
           ================================= */}
        <Route
          path="*"
          element={<AdminCatchAll />}
        />

      </Route>

      {/* =================================
          GLOBAL CATCH-ALL
         ================================= */}
      <Route
        path="*"
        element={<StandaloneNotFound />}
      />

    </Routes>
  );
}
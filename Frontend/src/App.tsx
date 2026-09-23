import React from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AdminLayout } from './layouts/admin/AdminLayout';
import { AdminDashboardPage } from './features/admin/dashboard/pages/AdminDashboardPage';
import { SIDEBAR_GROUPS } from './layouts/admin/sidebar/sidebar.config';
import { ArrowLeft, Construction, SearchX } from 'lucide-react';
import { CoursesPage } from './features/courses/pages/CoursesPage';
import { BlogsPage } from './features/blogs/pages/BlogsPage';
import  LiveClassesPage  from './features/live-classes/pages/LiveClassesPage';
import { CalendarViewsPage } from './features/calendar-views/pages/CalendarViewsPage';
import { AttendancePage } from './features/attendance/pages/AttendancePage';

const VALID_ROUTES = new Set<string>();
SIDEBAR_GROUPS.forEach((group) => {
  group.items.forEach((item) => {
    VALID_ROUTES.add(item.route);
    item.children?.forEach((child) => VALID_ROUTES.add(child.route));
  });
});

// Sidebar mein defined hai lekin page abhi nahi bana — layout ke ANDAR dikhta hai
const PlaceholderPage: React.FC = () => {
  const location = useLocation();
  const currentRoute = location.pathname;

  return (
    <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#E6E8EE] text-center max-w-xl mx-auto my-12 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="w-12 h-12 rounded-2xl bg-[#EAF0FE] text-[#2451D9] flex items-center justify-center mx-auto">
        <Construction className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-bold text-[#12141C]">
        {currentRoute.replace('/admin/', '').replace('-', ' ').toUpperCase()} Management
      </h2>
      <p className="text-xs text-[#686E7D] max-w-md mx-auto">
        This module is connected to the backend route ({currentRoute}). You can preview the
        primary dashboard overview anytime.
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

const AdminCatchAll: React.FC = () => {
  const location = useLocation();
  return VALID_ROUTES.has(location.pathname) ? <PlaceholderPage /> : <StandaloneNotFound />;
};

// Poore screen pe — koi sidebar/header nahi, layout ke bahar render hota hai
const StandaloneNotFound: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F6F7FA] px-4">
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#E6E8EE] text-center max-w-xl w-full space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="w-12 h-12 rounded-2xl bg-[#FCEAE4] text-[#DC5B3E] flex items-center justify-center mx-auto">
          <SearchX className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#12141C]">404 — Page Not Found</h2>
        <p className="text-xs text-[#686E7D] max-w-md mx-auto">
          The route <span className="font-mono">{location.pathname}</span> does not exist.
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
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="courses">
          <Route index element={<CoursesPage />} />
          <Route path="all-courses" element={<CoursesPage />} />
        </Route>
         <Route path="blogs">
          <Route index element={<BlogsPage />} />
          <Route path="all-posts" element={<BlogsPage />} />
        </Route>
        <Route path="live-classes">
          <Route index element={<LiveClassesPage />} />
          <Route path="live-classes" element={<LiveClassesPage />} />
          <Route path="calendar-views" element={<CalendarViewsPage />} />
          <Route path="attendance" element={<AttendancePage />} />
        </Route>
        <Route path="*" element={<AdminCatchAll />} />
      </Route>

      {/* /admin se bilkul bahar ka koi bhi route — poori screen pe 404 */}
      <Route path="*" element={<StandaloneNotFound />} />
    </Routes>
  );
}
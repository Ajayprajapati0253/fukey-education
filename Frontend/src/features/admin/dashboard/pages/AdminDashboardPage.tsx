import React, { useState } from 'react';
import { Plus, ChevronDown, BookOpen, Book, Video, CheckCircle2 } from 'lucide-react';
import { getTimeBasedGreeting } from '../../../../utils/date.utils';
import { useDashboardOverview } from '../hooks/useDashboardOverview';
import { useUIStore } from '../../../../store/ui.store';
import type { TimeRange } from '../types/dashboard.types';

// Components
import { KpiCardGrid } from '../components/KpiCardGrid';
import { DateRangePicker } from '../components/DateRangePicker';
import { RevenueOverviewChart } from '../components/RevenueOverviewChart';
import { NeedsAttentionPanel } from '../components/NeedsAttentionPanel';
import { UpcomingLiveClassesPanel } from '../components/UpcomingLiveClassesPanel';
import { PendingApprovalsTable } from '../components/PendingApprovalsTable';
import { RecentActivityFeed } from '../components/RecentActivityFeed';
import { TopPerformingCoursesTable } from '../components/TopPerformingCoursesTable';
import { QuickActionsBar } from '../components/QuickActionsBar';

export const AdminDashboardPage: React.FC = () => {
  const { currency } = useUIStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('30D');
  const [isAddCourseMenuOpen, setIsAddCourseMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data, isLoading } = useDashboardOverview(timeRange);
  const greetingInfo = getTimeBasedGreeting('Admin');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddCourseAction = (actionName: string) => {
    setIsAddCourseMenuOpen(false);
    showToast(`Navigating to ${actionName} creator...`);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3.3 Dashboard Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink dark:text-white tracking-tight">
            {greetingInfo.greeting} <span className="inline-block">{greetingInfo.emoji}</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-soft dark:text-[#94A3B8] mt-0.5 font-medium">
            Here's what's happening with your education platform today.
          </p>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <DateRangePicker onRangeChange={(range) => showToast(`Filtered by ${range}`)} />

          {/* Primary '+ Add course' Button with Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAddCourseMenuOpen(!isAddCourseMenuOpen)}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white rounded-xl text-xs font-bold hover:bg-[#1E44B8] active:scale-[0.98] transition-all shadow-[0_2px_8px_rgba(36,81,217,0.25)] select-none"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add course</span>
              <ChevronDown
                className={`w-3.5 h-3.5 ml-0.5 transition-transform duration-200 ${
                  isAddCourseMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isAddCourseMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1E293B] border border-border-subtle dark:border-[#334155] rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.15)] p-1.5 z-50 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => handleAddCourseAction('Standard Course')}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-[#12141C] dark:text-gray-100 hover:bg-[#EAF0FE] dark:hover:bg-[#2451D9]/20 hover:text-[#2451D9] dark:hover:text-[#60A5FA] rounded-xl flex items-center gap-2 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#2451D9] dark:text-[#60A5FA]" />
                  <span>Add Course</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddCourseAction('Free Course')}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-[#12141C] dark:text-gray-100 hover:bg-[#E7F7ED] dark:hover:bg-[#16A34A]/20 hover:text-[#16A34A] dark:hover:text-[#4ADE80] rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Book className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#4ADE80]" />
                  <span>Add Free Course</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddCourseAction('Live Class')}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-ink dark:text-gray-100 hover:bg-warning-soft dark:hover:bg-warning/20 hover:text-[#D97706] dark:hover:text-[#FBBF24] rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Video className="w-3.5 h-3.5 text-warning dark:text-[#FBBF24]" />
                  <span>Add Live Class</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3.4 KPI Cards Grid (6 cards) */}
      <KpiCardGrid
        kpis={data?.kpis}
        currency={currency}
        isLoading={isLoading}
      />

      {/* 3.5 & 3.6 & 3.7 Main Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Revenue Overview (2 cols on large screen) */}
        <div className="lg:col-span-2">
          <RevenueOverviewChart
            data={data?.revenueOverview}
            selectedRange={timeRange}
            onRangeChange={setTimeRange}
            currency={currency}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column: Side Widgets Stack (Needs Attention + Upcoming Live Classes) */}
        <div className="flex flex-col gap-6">
          <NeedsAttentionPanel
            items={data?.needsAttention}
            isLoading={isLoading}
          />
          <UpcomingLiveClassesPanel
            classes={data?.upcomingLiveClasses}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* 3.8 & 3.9 & 3.10 Bottom Row: Tables & Feed (3 equal columns on large screen) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <PendingApprovalsTable
          courses={data?.pendingApprovals}
          isLoading={isLoading}
        />

        {/* Recent Activity */}
        <RecentActivityFeed
          activities={data?.recentActivity}
          isLoading={isLoading}
        />

        {/* Top Performing Courses */}
        <TopPerformingCoursesTable
          courses={data?.topPerformingCourses}
          currency={currency}
          isLoading={isLoading}
        />
      </div>

      {/* 3.11 Quick Actions Bar */}
      <QuickActionsBar
        onActionClick={(id) => showToast(`Triggered ${id.replace('-', ' ')} action`)}
      />
    </div>
  );
};

export default AdminDashboardPage;

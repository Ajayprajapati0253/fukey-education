export type TimeRange = '7D' | '30D' | '3M' | '6M' | '1Y' | 'custom';

export interface KpiMetric {
  value: number;
  deltaPct?: number;
  comparisonLabel?: string; // "vs last month"
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface NeedsAttentionItem {
  key: string;
  label: string;
  count: number;
  route: string;
  severity: 'warning' | 'danger' | 'brand' | 'accent' | 'teal' | 'success';
  iconType: 'course' | 'order' | 'instructor' | 'message' | 'payment' | 'live';
}

export interface UpcomingLiveClass {
  id: string;
  title: string;
  instructorName: string;
  instructorAvatarUrl?: string;
  startsAt: string;
  timeDisplay: string;
  status: 'live' | 'upcoming';
}

export interface PendingApprovalCourse {
  id: string;
  courseName: string;
  instructorName: string;
  category: string;
  submittedAt: string;
  status: 'approved' | 'pending' | 'draft';
}

export interface RecentActivityItem {
  id: string;
  type: 'approved' | 'instructor_request' | 'order' | 'blog' | 'student' | 'payment';
  message: string;
  occurredAt: string;
}

export interface TopPerformingCourse {
  id: string;
  name: string;
  thumbnailUrl?: string;
  students: number;
  revenue: number;
  rating: number;
  trend: number[]; // sparkline points
}

export interface DashboardOverviewResponse {
  kpis: {
    totalOrders: KpiMetric & { sparkline: number[] };
    pendingOrders: KpiMetric & { sparkline: number[] };
    totalCourses: KpiMetric & { sparkline: number[] };
    totalEarnings: KpiMetric & { sparkline: number[] };
    pendingCourses: KpiMetric & { sparkline: number[] };
    totalStudents: KpiMetric & { sparkline: number[] };
  };
  revenueOverview: {
    range: TimeRange;
    points: RevenuePoint[];
    totalRevenue: KpiMetric;
    totalOrders: KpiMetric;
    avgOrderValue: KpiMetric;
    refunds: KpiMetric;
  };
  needsAttention: NeedsAttentionItem[];
  upcomingLiveClasses: UpcomingLiveClass[];
  pendingApprovals: PendingApprovalCourse[];
  recentActivity: RecentActivityItem[];
  topPerformingCourses: TopPerformingCourse[];
}

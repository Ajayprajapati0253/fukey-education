import type { DashboardOverviewResponse, TimeRange } from '../types/dashboard.types';

/**
 * Generates mock points according to selected time range.
 */
function generateRevenuePoints(range: TimeRange) {
  const points = [];
  let count = 30;
  if (range === '7D') count = 7;
  else if (range === '30D') count = 30;
  else if (range === '3M') count = 12;
  else if (range === '6M') count = 24;
  else if (range === '1Y') count = 12;
  else count = 14;

  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    if (range === '7D' || range === '30D' || range === 'custom') {
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      // Generate smooth curves
      const baseRev = Math.sin(i * 0.4) * 2000 + 4500 + (Math.random() * 1000 - 500);
      const orders = Math.floor(Math.sin(i * 0.35) * 4 + 8 + Math.random() * 3);
      points.push({
        date: label,
        revenue: Math.max(800, Math.round(baseRev)),
        orders: Math.max(1, orders),
      });
    } else {
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const baseRev = Math.sin(i * 0.5) * 15000 + 40000 + (Math.random() * 5000);
      const orders = Math.floor(Math.sin(i * 0.45) * 25 + 60 + Math.random() * 15);
      points.push({
        date: label,
        revenue: Math.max(5000, Math.round(baseRev)),
        orders: Math.max(10, orders),
      });
    }
  }

  return points;
}

export async function getDashboardOverview(range: TimeRange = '30D'): Promise<DashboardOverviewResponse> {
  // Simulate standard network latency
  await new Promise((resolve) => setTimeout(resolve, 250));

  return {
    kpis: {
      totalOrders: {
        value: 100,
        deltaPct: 8.2,
        comparisonLabel: 'vs last month',
        sparkline: [35, 42, 38, 55, 60, 52, 68, 75, 70, 88, 93],
      },
      pendingOrders: {
        value: 91,
        deltaPct: -2.1,
        comparisonLabel: 'vs last month',
        sparkline: [98, 95, 99, 94, 96, 92, 90, 93, 89, 94, 91],
      },
      totalCourses: {
        value: 54,
        deltaPct: 5.9,
        comparisonLabel: 'vs last month',
        sparkline: [40, 42, 45, 44, 47, 49, 50, 51, 52, 53, 54],
      },
      totalEarnings: {
        value: 0,
        deltaPct: 0,
        comparisonLabel: 'vs last month',
        sparkline: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      pendingCourses: {
        value: 7,
        comparisonLabel: 'vs last month',
        sparkline: [4, 5, 8, 6, 9, 8, 7, 10, 8, 6, 7],
      },
      totalStudents: {
        value: 10025,
        deltaPct: 12.6,
        comparisonLabel: 'vs last month',
        sparkline: [1800, 1920, 2010, 2100, 2190, 2240, 2310, 2390, 2410, 2440, 2458],
      },
    },
    revenueOverview: {
      range,
      points: generateRevenuePoints(range),
      totalRevenue: {
        value: 0,
        deltaPct: 12.5,
      },
      totalOrders: {
        value: 93,
        deltaPct: 8.2,
      },
      avgOrderValue: {
        value: 0,
        deltaPct: 4.3,
      },
      refunds: {
        value: 0,
        deltaPct: 0,
      },
    },
    needsAttention: [
      {
        key: 'courses_pending',
        label: 'Courses pending approval',
        count: 7,
        route: '/admin/courses',
        severity: 'warning',
        iconType: 'course',
      },
      {
        key: 'pending_orders',
        label: 'Pending orders',
        count: 91,
        route: '/admin/orders',
        severity: 'danger',
        iconType: 'order',
      },
      {
        key: 'instructor_requests',
        label: 'Instructor requests',
        count: 4,
        route: '/admin/instructor-requests',
        severity: 'brand',
        iconType: 'instructor',
      },
      {
        key: 'contact_messages',
        label: 'Unread contact messages',
        count: 3,
        route: '/admin/messages',
        severity: 'accent',
        iconType: 'message',
      },
      {
        key: 'failed_payments',
        label: 'Failed payments',
        count: 1,
        route: '/admin/payments',
        severity: 'danger',
        iconType: 'payment',
      },
      {
        key: 'live_classes_today',
        label: 'Upcoming live classes today',
        count: 2,
        route: '/admin/live-classes',
        severity: 'teal',
        iconType: 'live',
      },
    ],
    upcomingLiveClasses: [
      {
        id: 'live-1',
        title: 'Physics 12th (English)',
        instructorName: 'Khabib Nurmagomedov',
        instructorAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        startsAt: new Date().toISOString(),
        timeDisplay: 'Today, 06:00 PM',
        status: 'live',
      },
      {
        id: 'live-2',
        title: 'Maths 9th (Hindi)',
        instructorName: 'Pawan Gupta',
        instructorAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        startsAt: new Date().toISOString(),
        timeDisplay: 'Today, 07:30 PM',
        status: 'upcoming',
      },
      {
        id: 'live-3',
        title: 'Science 9th (Hindi)',
        instructorName: 'Anil Kumar Nagar',
        instructorAvatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        startsAt: new Date(Date.now() + 86400000).toISOString(),
        timeDisplay: 'Tomorrow, 04:00 PM',
        status: 'upcoming',
      },
    ],
    pendingApprovals: [
      {
        id: 'app-1',
        courseName: 'Maths 9th (Hindi)',
        instructorName: 'Pawan Gupta',
        category: 'Class 9',
        submittedAt: '5 months ago',
        status: 'approved',
      },
      {
        id: 'app-2',
        courseName: 'Physics 12th (English)',
        instructorName: 'Khabib Nurmagomedov',
        category: 'Class 12',
        submittedAt: '7 months ago',
        status: 'pending',
      },
      {
        id: 'app-3',
        courseName: 'Science 9th (Hindi)',
        instructorName: 'Anil Kumar Nagar',
        category: 'Class 9',
        submittedAt: '7 months ago',
        status: 'pending',
      },
      {
        id: 'app-4',
        courseName: 'Political Science 12th (Hindi)',
        instructorName: 'Saurabh Bharne',
        category: 'Class 12',
        submittedAt: '7 months ago',
        status: 'pending',
      },
      {
        id: 'app-5',
        courseName: 'Chemistry 11th (English)',
        instructorName: 'John Doe',
        category: 'Class 11',
        submittedAt: '2 weeks ago',
        status: 'draft',
      },
    ],
    recentActivity: [
      {
        id: 'act-1',
        type: 'approved',
        message: 'Maths 9th (Hindi) course approved',
        occurredAt: '5 minutes ago',
      },
      {
        id: 'act-2',
        type: 'instructor_request',
        message: 'New instructor request received',
        occurredAt: '22 minutes ago',
      },
      {
        id: 'act-3',
        type: 'order',
        message: 'New order #ORD-00093 placed',
        occurredAt: '1 hour ago',
      },
      {
        id: 'act-4',
        type: 'blog',
        message: 'Blog "Study Tips for Exams" published',
        occurredAt: '2 hours ago',
      },
      {
        id: 'act-5',
        type: 'student',
        message: 'New student registered - Rahul Singh',
        occurredAt: '3 hours ago',
      },
      {
        id: 'act-6',
        type: 'payment',
        message: 'Payment received for order #ORD-00092',
        occurredAt: '5 hours ago',
      },
    ],
    topPerformingCourses: [
      {
        id: 'top-1',
        name: 'Full Stack Web Development',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100&auto=format&fit=crop&q=80',
        students: 1245,
        revenue: 45230,
        rating: 4.8,
        trend: [10, 15, 22, 30, 45, 52, 60],
      },
      {
        id: 'top-2',
        name: 'React JS - Complete Guide',
        thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&auto=format&fit=crop&q=80',
        students: 986,
        revenue: 32140,
        rating: 4.7,
        trend: [12, 18, 20, 28, 35, 42, 48],
      },
      {
        id: 'top-3',
        name: 'Python for Beginners',
        thumbnailUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=100&auto=format&fit=crop&q=80',
        students: 854,
        revenue: 28760,
        rating: 4.6,
        trend: [8, 14, 19, 25, 30, 38, 44],
      },
      {
        id: 'top-4',
        name: 'Data Structures & Algorithms',
        thumbnailUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=100&auto=format&fit=crop&q=80',
        students: 723,
        revenue: 21480,
        rating: 4.5,
        trend: [40, 36, 32, 30, 26, 24, 20],
      },
      {
        id: 'top-5',
        name: 'Digital Marketing Masterclass',
        thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&auto=format&fit=crop&q=80',
        students: 614,
        revenue: 18300,
        rating: 4.4,
        trend: [5, 10, 16, 22, 28, 32, 39],
      },
    ],
  };
}

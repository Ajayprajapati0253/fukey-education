export type StudentStatus = 'Active' | 'Expired' | 'Expiring Soon' | 'Pending';

export type KpiFilterKey = 'total' | 'active' | 'expired' | 'new' | null;

export type QuickInsightFilterKey = 'most_enrolled' | 'needing_attention' | 'avg_progress' | null;

export interface CourseTopic {
  id: string;
  title: string;
  duration?: string;
  completed: boolean;
  score?: number;
  inProgress?: boolean;
  lastWatched?: boolean;
}

export interface CourseChapter {
  id: string;
  name: string;
  subject?: string;
  totalLectures: number;
  completedLectures: number;
  status: 'Completed' | 'In Progress' | 'Pending';
  topics?: CourseTopic[];
}

export interface EnrolledCourse {
  id: string;
  name: string;
  status: 'Active' | 'Completed' | 'Expired';
  enrolledAt: string;
  endsAt: string;
  category?: string;
  progress?: number;
  totalChapters?: number;
  completedChapters?: number;
  totalLectures?: number;
  completedLectures?: number;
  totalAssignments?: number;
  completedAssignments?: number;
  averageScore?: number;
  chapters?: CourseChapter[];
}

export interface Student {
  id: string;
  sn: number;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  avatarBgColor?: string;
  initials: string;
  gender: 'Male' | 'Female' | 'Other';
  class: string;
  age: number | string;
  bio: string;
  country: string;
  state: string;
  city: string;
  address: string;
  joinedAt: string;
  joinedTime?: string;
  accessUntil: string;
  accessPeriodLabel: string;
  status: StudentStatus;
  progress: number;
  totalCourses: number;
  certificates: number;
  courses: EnrolledCourse[];
  primaryCourse: string;
  additionalCoursesCount: number;
  kpiType?: 'active' | 'expired' | 'new';
  isNewEnrollment?: boolean;
  feedback?: StudentCourseFeedback[];
}

export type FeedbackStatus = 'Reviewed' | 'Pending' | 'Action Taken' | 'Under Review';
export type ImprovementLevel = 'Low' | 'Medium' | 'High';

export interface StudentCourseFeedback {
  id: string;
  studentId: string;
  studentName?: string;
  courseId: string;
  courseName: string;
  subject: string;
  message: string;
  rating?: number;
  submittedAt: string;
  status: FeedbackStatus;
  needsImprovement?: boolean;
  adminNotes?: string;
  category?: 'Practice Material' | 'Lecture Quality' | 'Curriculum' | 'Doubt Support' | 'Assessments';
}

export interface CourseFeedbackSummary {
  courseName: string;
  count: number;
  averageRating: number;
  improvementCount: number;
}

export interface StudentFilterOptions {
  search: string;
  course: string;
  status: string;
  accessPeriod: string;
  progress?: string;
  joinedDate: string;
}

export interface QuickInsightData {
  mostEnrolledCourse: {
    title: string;
    studentCount: number;
    percentage: number;
  };
  highestProgressCourse: {
    title: string;
    avgCompletion: number;
  };
  recentlyJoined: {
    count: number;
    timeframe: string;
  };
}

export interface StudentAccessBreakdown {
  activeCount: number;
  activePercent: number;
  expiringCount: number;
  expiringPercent: number;
  expiredCount: number;
  expiredPercent: number;
  total: number;
}
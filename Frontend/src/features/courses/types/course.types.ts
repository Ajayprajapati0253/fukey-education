
export type CourseStatus = 'Published' | 'Pending Review' | 'Draft' | 'Archived';
export type ApprovalStatus = 'Approved' | 'Pending' | 'Rejected';
export type CourseType =
  | 'Standard'
  | 'Live Interactive'
  | 'Self-Paced'
  | 'Crash Course'
  | 'Test Series';

export interface Course {
  id: string;
  sn: number;
  title: string;
  subtitle: string;
  thumbnail: string;
  instructorName: string;
  instructorAvatar: string;
  category: string;
  categoryColor?: string;
  level: string;
  studentsCount: number;
  price: number;
  isFree: boolean;
  status: CourseStatus;
  approvalStatus: ApprovalStatus;
  createdDate: string;
  createdTime: string;
  courseType: CourseType;
  language: string;
  duration?: string;
  lessonsCount?: number;
  rating?: number;
  description?: string;
}

export interface CourseFilterState {
  search: string;
  date: string;
  category: string;
  instructor: string;
  level: string;
  language: string;
  status: string;
  approvalStatus: string;
  courseType: string;
  orderBy: string;
  perPage: number;
}

export interface CourseMetricSummary {
  totalCourses: number;
  published: number;
  pendingReview: number;
  draft: number;
  archived: number;
}
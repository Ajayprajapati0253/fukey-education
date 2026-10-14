import type { TargetClass } from './free-course.types';

export type { TargetClass };

export interface AdminReply {
  message: string;
  repliedAt: string;
  repliedBy: string;
}

export interface FreeCourseReview {
  id: string;
  courseId: string;
  courseTitle: string;
  targetClass: TargetClass;
  subject: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Hidden';
  adminReply?: AdminReply;
}

export interface ReviewFiltersState {
  search: string;
  targetClass: string; // 'All' | 'Class 9' | 'Class 10' | 'Class 11' | 'Class 12'
  subject: string; // 'All' | specific subject
  rating: string; // 'All' | '5' | '4' | '3' | '2' | '1'
  status: string; // 'All' | 'Approved' | 'Pending' | 'Hidden'
  sortBy: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating';
}

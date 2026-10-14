export type TargetClass = 'Class 9' | 'Class 10' | 'Class 11' | 'Class 12';

export type FreeCourseStatus = 'Published' | 'Draft' | 'Archived';
export type ApprovalStatus = 'Approved' | 'Pending';

export type ContentResourceType =
  | 'youtube_live'
  | 'youtube_recorded'
  | 'pdf'
  | 'notes'
  | 'study_material'
  | 'external_link'
  | 'document'
  | 'question_set';

export interface ResourceItem {
  id: string;
  title: string;
  type: ContentResourceType;
  url?: string;
  fileSize?: string;
  duration?: string;
  downloadable?: boolean;
  fileName?: string;
  fileData?: string;
  uploadedAt?: string;
}

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  order: number;
  duration: string; // e.g. "45 mins"
  contentType: ContentResourceType;
  videoUrl?: string;
  resources: ResourceItem[];
  isFreePreview: boolean; // Always true for free course
  description?: string;
}

export interface Chapter {
  id: string;
  moduleId: string;
  title: string;
  order: number;
  lessons: Lesson[];
  description?: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  order: number;
  chapters: Chapter[];
  description?: string;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  avatar: string;
  specialization: string;
}

export interface EnrolledStudent {
  id: string;
  name: string;
  email: string;
  enrolledAt: string;
  progressPercentage: number;
  lastActive: string;
  status: 'Active' | 'Completed' | 'Inactive';
}

export interface FreeCourse {
  id: string;
  courseCode: string; // e.g. "FC-901"
  title: string;
  shortDescription: string;
  fullDescription: string;
  targetClass: TargetClass;
  primarySubject: string;
  additionalSubjects: string[];
  board: 'CBSE' | 'ICSE' | 'State Board' | 'All Boards';
  language: 'Hindi' | 'English' | 'Hinglish' | 'Urdu';
  instructor: Instructor;
  thumbnail: string;
  demoVideoUrl?: string;
  demoVideoStorage?: 'upload' | 'youtube' | 'vimeo';
  duration: string; // e.g. "48 Hours"
  courseType: 'Foundation' | 'Crash Course' | 'Board Prep' | 'Concept Revision' | 'Full Syllabus';
  modulesCount: number;
  lessonsCount: number;
  enrollmentsCount: number;
  activeStudentsCount: number;
  completionRate: number; // percentage, e.g. 74
  price: 0; // strictly 0
  isFreeCourse: true; // strictly true
  allowFreeEnrollment: boolean;
  status: FreeCourseStatus;
  approvalStatus: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
  reviewerMessage?: string;
  qaEnabled: boolean;
  partnerInstructorEnabled: boolean;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface FreeCourseFiltersState {
  search: string;
  dateRange: string;
  targetClass: string; // 'All' | 'Class 9' | etc.
  subject: string; // 'All' | specific subject
  instructorId: string; // 'All' | id
  language: string; // 'All' | specific
  status: string; // 'All' | 'Published' | 'Draft' | 'Archived'
  approvalStatus: string; // 'All' | 'Approved' | 'Pending'
  courseType: string; // 'All' | specific
  sortBy: 'newest' | 'oldest' | 'title_asc' | 'title_desc' | 'enrollments_desc';
  perPage: number;
}

export interface FreeCourseKPIs {
  totalCourses: number;
  publishedCount: number;
  draftCount: number;
  archivedCount: number;
  pendingReviewCount: number;
  totalEnrollments: number;
  activeStudents: number;
}

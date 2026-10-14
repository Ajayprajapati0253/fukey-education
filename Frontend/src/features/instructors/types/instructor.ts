export type InstructorStatus = 'Active' | 'Inactive' | 'Pending' | 'Suspended';
export type VerificationStatus = 'Verified' | 'Unverified' | 'Pending';
export type TeachingType = 'Online' | 'Offline' | 'Hybrid';
export type TeachingMedium =  'Hindi Medium' | 'English Medium' | 'Hindi & English Both';

export interface AssignedCourse {
  id: string;
  name: string;
  category: string;
  studentCount: number;
  status: 'Active' | 'Inactive' | 'Draft' | 'Archived';
  batchTime?: string;
  classLevel?: string; // e.g. "Class 10", "Class 12", "Class 9-12"
  medium?: string;     // e.g. "Hindi & English Both", "Hindi", "English"
}

export interface LiveClass {
  id: string;
  title: string;
  courseName: string;
  date: string; 
  time: string;
  duration: string;
  status: 'Upcoming' | 'Live' | 'Completed' | 'Cancelled';
  attendeesCount: number;
  classLevel?: string;
  medium?: string;
}

export interface RecentActivityItem {
  id: string;
  type: 'profile_update' | 'course_assigned' | 'live_class_created' | 'attendance_marked';
  title: string;
  description: string;
  timeAgo: string;
}

export interface SocialLinks {
  linkedin?: string;
  youtube?: string;
  github?: string;
  website?: string;
  twitter?: string;
}

export interface Instructor {
  id: string;
  name: string;
  avatar: string;
  designation: string;
  email: string;
  phone: string;
  subject: string;
  experience: string;
  gender: 'Male' | 'Female' | 'Other';
  qualification: string;
  dateOfBirth: string;
  country: string;
  state: string;
  city: string;
  address: string;
  shortBio: string;
  fullBio: string;
  skills: string[];
  languages: string[];
  socialLinks: SocialLinks;

  // Teaching Domain (9th to 12th, Hindi & English both)
  teachingMedium: TeachingMedium;
  classesTaught: string[]; // ['9th', '10th', '11th', '12th']
  
  // Stats & Status
  status: InstructorStatus;
  verification: VerificationStatus;
  teachingType: TeachingType;
  coursesCount: number;
  liveClassesDone: number;
  totalLiveClasses: number;
  attendancePercentage: number;
  studentsCount: number;
  rating?: number;
  joinedAt: string;
  lastActive: string;
  
  // Relations
  assignedCourses: AssignedCourse[];
  recentActivities: RecentActivityItem[];
}

export interface ReviewReply {
  id: string;
  authorName: string;
  authorRole: 'Instructor' | 'Admin';
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface StudentReview {
  id: string;
  instructorId: string;
  studentName: string;
  studentAvatar: string;
  studentClass: string;
  courseName: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  createdAt: string;
  timestamp: number;
  helpfulCount: number;
  sentiment: 'positive' | 'neutral' | 'constructive';
  tags: string[];
  verifiedLearner: boolean;
  replies: ReviewReply[];
  isNew?: boolean;
}

export interface InstructorFilterParams {
  searchQuery: string;
  status: string;
  verification: string;
  course: string;
  subject: string;
  teachingType: string;
  classLevel: string;   // All Classes, 9th, 10th, 11th, 12th
  medium: string;       // All Mediums, Hindi & English Both, Hindi, English
  joinedDateRange: string;
  lastActiveRange: string;
  sortBy: 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'students_desc' | 'attendance_desc';
}

export interface InstructorKpiData {
  totalInstructors: number;
  totalGrowth: number;
  activeInstructors: number;
  activeGrowth: number;
  pendingVerification: number;
  pendingGrowth: number;
  currentlyTeaching: number;
  teachingGrowth: number;
  inactiveSuspended: number;
  inactiveGrowth: number;
}

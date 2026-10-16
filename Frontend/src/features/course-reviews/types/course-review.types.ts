export interface CourseReviewCourse {
  id: string;
  title: string;
}

export interface CourseReviewUser {
  id: string;
  name: string;
}

export interface CourseReview {
  id: string;
  course_id: string;
  user_id: string;
  status: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  course?: CourseReviewCourse | null;
  user?: CourseReviewUser | null;
  [key: string]: unknown;
}

export interface CourseReviewMeta {
  current_page: number;
  last_page: number;
  total: number;
}

export interface CourseReviewListResponse {
  status: string;
  data: CourseReview[];
  meta: CourseReviewMeta;
}

export interface CourseReviewFilters {
  keyword: string;
  status: string;
  orderBy: string;
  parPage: number | "all";
}

export interface UpdateCourseReviewPayload {
  status: boolean;
}

import { del, get, patch } from '../../../services/api';
import type {
  CourseReviewFilters,
  CourseReviewListResponse,
  CourseReview,
  UpdateCourseReviewPayload,
} from '../types/course-review.types';

const BASE_URL = '/admin/course-reviews';

export async function getCourseReviews(
  filters: CourseReviewFilters,
  page = 1,
): Promise<CourseReviewListResponse> {
  const params = new URLSearchParams();

  if (filters.keyword.trim()) {
    params.set('keyword', filters.keyword.trim());
  }

  if (filters.status !== 'all') {
    params.set('status', filters.status);
  }

  params.set('page', String(page));
  params.set('par-page', String(filters.parPage));
  params.set('order_by', filters.orderBy);

  const query = params.toString();
  return get(`${BASE_URL}?${query}`) as Promise<CourseReviewListResponse>;
}

export async function getCourseReview(
  id: string,
): Promise<{ status: string; data: CourseReview }> {
  return get(`${BASE_URL}/${id}`) as Promise<{
    status: string;
    data: CourseReview;
  }>;
}

export async function updateCourseReview(
  id: string,
  payload: UpdateCourseReviewPayload,
) {
  return patch(`${BASE_URL}/${id}`, payload);
}

export async function deleteCourseReview(id: string) {
  return del(`${BASE_URL}/${id}`);
}

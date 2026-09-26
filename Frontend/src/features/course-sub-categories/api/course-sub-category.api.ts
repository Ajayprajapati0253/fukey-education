import { get, post, patch, del } from '../../../services/api';

export interface CourseSubCategory {
  id: string;
  parent_id: string;
  slug: string;
  status: boolean;
}

export interface CourseSubCategoryResponse {
  status: string;
  data: CourseSubCategory[];
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface CourseSubCategoryFilters {
  parentId: string | number;
  keyword?: string;
  status?: string;
  page?: number;
  perPage?: number | 'all';
  orderBy?: string;
}

export interface CreateCourseSubCategoryPayload {
  slug: string;
  status: boolean;
}

export interface UpdateCourseSubCategoryPayload {
  status: boolean;
}

/**
 * Get subjects/sub-categories for a class/category
 *
 * GET /admin/course-sub-categories?parent_id=12
 */
export async function getCourseSubCategories(
  filters: CourseSubCategoryFilters,
): Promise<CourseSubCategoryResponse> {
  const params = new URLSearchParams();

  params.set('parent_id', String(filters.parentId));

  if (filters.keyword) {
    params.set('keyword', filters.keyword);
  }

  if (filters.status !== undefined && filters.status !== '') {
    params.set('status', filters.status);
  }

  if (filters.page !== undefined) {
    params.set('page', String(filters.page));
  }

  if (filters.perPage !== undefined) {
    params.set('par-page', String(filters.perPage));
  }

  if (filters.orderBy !== undefined) {
    params.set('order_by', String(filters.orderBy));
  }

  return get<CourseSubCategoryResponse>(
    `/admin/course-sub-categories?${params.toString()}`,
  );
}

/**
 * Create a subject/sub-category
 *
 * POST /admin/course-sub-categories/:parentId
 */
export async function createCourseSubCategory(
  parentId: string | number,
  data: CreateCourseSubCategoryPayload,
) {
  return post(
    `/admin/course-sub-categories/${parentId}`,
    data,
  );
}

/**
 * Update subject/sub-category status
 *
 * PATCH /admin/course-sub-categories/:parentId/:subCategoryId
 */
export async function updateCourseSubCategory(
  parentId: string | number,
  subCategoryId: string | number,
  data: UpdateCourseSubCategoryPayload,
) {
  return patch(
    `/admin/course-sub-categories/${parentId}/${subCategoryId}`,
    data,
  );
}

/**
 * Delete subject/sub-category
 *
 * DELETE /admin/course-sub-categories/:parentId/:subCategoryId
 */
export async function deleteCourseSubCategory(
  parentId: string | number,
  subCategoryId: string | number,
) {
  return del(
    `/admin/course-sub-categories/${parentId}/${subCategoryId}`,
  );
}

/**
 * Toggle subject/sub-category status
 *
 * PATCH /admin/course-sub-categories/:id/status
 */
export async function toggleCourseSubCategoryStatus(
  id: string | number,
) {
  return patch(
    `/admin/course-sub-categories/${id}/status`,
    {},
  );
}
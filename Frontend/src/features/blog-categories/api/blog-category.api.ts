import {
  get,
  post,
  patch,
  del,
} from '../../../services/api';

export interface BlogCategoryTranslation {
  id: string;
  blog_category_id: string;
  lang_code: string;
  title: string;
  short_description?: string | null;
}

export interface BlogCategory {
  id: string;
  slug: string;
  position?: number | null;
  parent_id?: string | null;
  status?: boolean;
  translations?: BlogCategoryTranslation[];
}

export interface BlogCategoryPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface BlogCategoryResponse {
  status: string;
  data: BlogCategory[];
  pagination: BlogCategoryPagination;
}

export interface CreateBlogCategoryPayload {
  slug: string;
  position?: number;
  parent_id?: string;
  status?: boolean;
  lang_code?: string;
  title?: string;
  short_description?: string;
}

export type UpdateBlogCategoryPayload =
  Partial<CreateBlogCategoryPayload>;

/**
 * GET /admin/blog-categories
 */
export async function getBlogCategories(
  page = 1,
  limit = 15,
): Promise<BlogCategoryResponse> {
  return get<BlogCategoryResponse>(
    `/admin/blog-categories?page=${page}&limit=${limit}`,
  );
}

/**
 * GET /admin/blog-categories/:id
 */
export async function getBlogCategory(
  id: string | number,
) {
  return get<{
    status: string;
    data: BlogCategory;
  }>(
    `/admin/blog-categories/${id}`,
  );
}

/**
 * POST /admin/blog-categories
 */
export async function createBlogCategory(
  data: CreateBlogCategoryPayload,
) {
  return post(
    '/admin/blog-categories',
    data,
  );
}

/**
 * PATCH /admin/blog-categories/:id
 */
export async function updateBlogCategory(
  id: string | number,
  data: UpdateBlogCategoryPayload,
) {
  return patch(
    `/admin/blog-categories/${id}`,
    data,
  );
}

/**
 * DELETE /admin/blog-categories/:id
 */
export async function deleteBlogCategory(
  id: string | number,
) {
  return del(
    `/admin/blog-categories/${id}`,
  );
}

/**
 * PATCH /admin/blog-categories/:id/status
 */
export async function toggleBlogCategoryStatus(
  id: string | number,
) {
  return patch(
    `/admin/blog-categories/${id}/status`,
    {},
  );
}
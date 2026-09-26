import {
  get,
  post,
  put,
  del,
} from '../../../services/api';

export interface Blog {
  id: string;
  title?: string;
  slug?: string;
  description?: string;
  content?: string;
  image?: string;
  thumbnail?: string;
  status?: boolean | string;
  created_at?: string;
  updated_at?: string;

  [key: string]: unknown;
}

export interface BlogListResponse {
  status: string;
  data: Blog[];

  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };

  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface BlogResponse {
  status: string;
  data: Blog;
  message?: string;
}

export interface CreateBlogPayload {
  [key: string]: unknown;
}

export interface UpdateBlogPayload {
  [key: string]: unknown;
}

/* =========================
   GET BLOGS
========================= */

export async function getBlogs(
  params: Record<
    string,
    string | number | boolean | undefined
  > = {},
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ''
    ) {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();

  return get<BlogListResponse>(
    `/admin/blogs${query ? `?${query}` : ''}`,
  );
}

/* =========================
   GET SINGLE BLOG
========================= */

export async function getBlog(id: string) {
  return get<BlogResponse>(
    `/admin/blogs/${id}`,
  );
}

/* =========================
   CREATE BLOG
========================= */

export async function createBlog(
  data: CreateBlogPayload,
) {
  return post<BlogResponse>(
    '/admin/blogs/create',
    data,
  );
}

/* =========================
   UPDATE BLOG
========================= */

export async function updateBlog(
  id: string,
  data: UpdateBlogPayload,
) {
  return put<BlogResponse>(
    `/admin/blogs/${id}`,
    data,
  );
}

/* =========================
   DELETE BLOG
========================= */

export async function deleteBlog(id: string) {
  return del<{
    status: string;
    message?: string;
  }>(`/admin/blogs/${id}`);
}
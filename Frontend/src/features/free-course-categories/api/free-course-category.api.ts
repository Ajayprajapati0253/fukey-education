import {
  get,
  post,
  patch,
  del,
} from '../../../services/api';

export interface FreeCourseCategory {
  id: string;
  name: string;
  slug?: string | null;
  code?: string | null;
  status: boolean;
  show_at_trending: boolean;
  parent_id?: string | null;
  icon?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface FreeCourseCategoriesResponse {
  status: string;
  data: FreeCourseCategory[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface FreeCourseCategoryResponse {
  status: string;
  message?: string;
  data: FreeCourseCategory;
}

export interface CreateFreeCourseCategoryPayload {
  name: string;
  slug: string;
  status: boolean;
  show_at_trending: boolean;
  parent_id?: string;
  icon?: File | null;
}

export interface UpdateFreeCourseCategoryPayload {
  name: string;
  code: string;
  status?: boolean;
  show_at_trending?: boolean;
  icon?: File | null;
}

const createFormData = (
  data: CreateFreeCourseCategoryPayload,
) => {
  const formData = new FormData();

  formData.append('name', data.name);
  formData.append('slug', data.slug);
  formData.append(
    'status',
    String(data.status),
  );
  formData.append(
    'show_at_trending',
    String(data.show_at_trending),
  );

  if (data.parent_id) {
    formData.append(
      'parent_id',
      data.parent_id,
    );
  }

  if (data.icon instanceof File) {
    formData.append('icon', data.icon);
  }

  return formData;
};

const updateFormData = (
  data: UpdateFreeCourseCategoryPayload,
) => {
  const formData = new FormData();

  formData.append('name', data.name);
  formData.append('code', data.code);

  if (data.status !== undefined) {
    formData.append(
      'status',
      String(data.status),
    );
  }

  if (data.show_at_trending !== undefined) {
    formData.append(
      'show_at_trending',
      String(data.show_at_trending),
    );
  }

  if (data.icon instanceof File) {
    formData.append('icon', data.icon);
  }

  return formData;
};

export const getFreeCourseCategories =
  async (
    params?: Record<string, any>,
  ): Promise<FreeCourseCategoriesResponse> => {
    return await get<FreeCourseCategoriesResponse>(
      '/admin/free-course-categories',
      {
        params,
      },
    );
  };

export const getFreeCourseCategory =
  async (
    id: string | number,
  ): Promise<FreeCourseCategoryResponse> => {
    return await get<FreeCourseCategoryResponse>(
      `/admin/free-course-categories/${id}`,
    );
  };

export const createFreeCourseCategory =
  async (
    data: CreateFreeCourseCategoryPayload,
  ): Promise<FreeCourseCategoryResponse> => {
    const formData = createFormData(data);

    return await post<
      FreeCourseCategoryResponse,
      FormData
    >(
      '/admin/free-course-categories',
      formData,
    );
  };

export const updateFreeCourseCategory =
  async (
    id: string | number,
    data: UpdateFreeCourseCategoryPayload,
  ): Promise<FreeCourseCategoryResponse> => {
    const formData = updateFormData(data);

    return await patch<
      FreeCourseCategoryResponse,
      FormData
    >(
      `/admin/free-course-categories/${id}`,
      formData,
    );
  };

export const deleteFreeCourseCategory =
  async (
    id: string | number,
  ) => {
    return await del(
      `/admin/free-course-categories/${id}`,
    );
  };

export const updateFreeCourseCategoryStatus =
  async (
    id: string | number,
  ) => {
    return await patch(
      `/admin/free-course-categories/${id}/status`,
      {},
    );
  };
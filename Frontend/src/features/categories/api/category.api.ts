import { get, post, patch, del } from '../../../services/api';

import type {
  Category,
  CategoryFilterState,
  CategoryListResponse,
  CreateCategoryData,
  UpdateCategoryData,
} from '../types/category.types';

const DEFAULT_FILTERS: CategoryFilterState = {
  search: '',
  status: 'All Status',
  trending: 'All',
  perPage: 10,
};

function mapApiCategory(category: any): Category {
  return {
    id: String(category?.id ?? ''),
    slug: category?.slug ?? '',
    order:
      category?.order !== null &&
      category?.order !== undefined
        ? Number(category.order)
        : null,

    icon: category?.icon ?? null,

    parentId:
      category?.parent_id !== null &&
      category?.parent_id !== undefined
        ? String(category.parent_id)
        : null,

    parentName:
      category?.parent?.slug ??
      category?.parent?.name ??
      null,

    showAtTrending:
      Boolean(
        category?.show_at_trending ??
          category?.showAtTrending ??
          false,
      ),

    status:
      Boolean(
        category?.status ??
          false,
      ),

    createdAt:
      category?.created_at ??
      category?.createdAt ??
      null,

    updatedAt:
      category?.updated_at ??
      category?.updatedAt ??
      null,
  };
}

export const getCategories = async (
  filters: CategoryFilterState = DEFAULT_FILTERS,
  page = 1,
): Promise<CategoryListResponse> => {
  const params = new URLSearchParams();

  if (filters.search.trim()) {
    params.set('keyword', filters.search.trim());
  }

  if (filters.status !== 'All Status') {
    params.set(
      'status',
      filters.status === 'Active'
        ? '1'
        : '0',
    );
  }

  if (filters.trending !== 'All') {
    params.set(
      'show_at_trending',
      filters.trending === 'Yes'
        ? '1'
        : '0',
    );
  }

  params.set(
    'page',
    String(page),
  );

  params.set(
    'par_page',
    String(filters.perPage),
  );

  const query = params.toString();

  const response = await get(
    `/admin/course-categories${query ? `?${query}` : ''}`,
  );

  return {
    ...response,
    data: Array.isArray(response?.data)
      ? response.data.map(mapApiCategory)
      : [],
  };
};

export const createCategory = async (
  data: CreateCategoryData,
) => {
  return await post(
    '/admin/course-categories',
    data,
  );
};

export const updateCategory = async (
  id: string,
  data: UpdateCategoryData,
) => {
  return await patch(
    `/admin/course-categories/${id}`,
    data,
  );
};

export const deleteCategory = async (
  id: string,
) => {
  return await del(
    `/admin/course-categories/${id}`,
  );
};
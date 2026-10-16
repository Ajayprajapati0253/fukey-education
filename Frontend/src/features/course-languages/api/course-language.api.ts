import { get, post, patch, del } from '../../../services/api';

import type {
  CourseLanguage,
  CourseLanguageFilters,
  CourseLanguageListResponse,
  CreateCourseLanguagePayload,
  UpdateCourseLanguagePayload,
} from '../types/course-language.types';

const BASE_URL = '/admin/course-languages';

export const getCourseLanguages = async (
  filters: CourseLanguageFilters,
  page: number,
): Promise<CourseLanguageListResponse> => {
  const params = new URLSearchParams();

  if (filters.search.trim()) {
    params.set('keyword', filters.search.trim());
  }

  if (
    filters.status &&
    filters.status !== 'All Status'
  ) {
    params.set('status', filters.status);
  }

  params.set('page', String(page));
  params.set('par-page', String(filters.perPage));

  if (filters.orderBy) {
    params.set('order_by', filters.orderBy);
  }

  return get<CourseLanguageListResponse>(
    `${BASE_URL}?${params.toString()}`,
  );
};

export const getCourseLanguage = async (
  id: number,
): Promise<CourseLanguage> => {
  return get<CourseLanguage>(`${BASE_URL}/${id}`);
};

export const createCourseLanguage = async (
  payload: CreateCourseLanguagePayload,
): Promise<CourseLanguage> => {
  return post<CourseLanguage>(
    BASE_URL,
    payload,
  );
};

export const updateCourseLanguage = async (
  id: number,
  payload: UpdateCourseLanguagePayload,
): Promise<CourseLanguage> => {
  return patch<CourseLanguage>(
    `${BASE_URL}/${id}`,
    payload,
  );
};

export const deleteCourseLanguage = async (
  id: number,
) => {
  return del(`${BASE_URL}/${id}`);
};

export const updateCourseLanguageStatus = async (
  id: number,
): Promise<CourseLanguage> => {
  return patch<CourseLanguage>(
    `${BASE_URL}/${id}/status`,
    {},
  );
};
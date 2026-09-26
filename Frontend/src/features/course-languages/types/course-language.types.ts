export interface CourseLanguage {
  id: number;
  name: string;
  status: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CourseLanguageFilters {
  search: string;
  status: string;
  orderBy: string;
  perPage: number;
}

export interface CreateCourseLanguagePayload {
  name: string;
  status: boolean;
}

export interface UpdateCourseLanguagePayload {
  name: string;
  status: boolean;
}

export interface CourseLanguageListResponse {
  data: CourseLanguage[];
  meta?: {
    total?: number;
    current_page?: number;
    last_page?: number;
    per_page?: number;
  };
}
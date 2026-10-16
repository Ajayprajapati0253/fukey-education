export interface CourseSubCategory {
  id: string;
  parent_id: string;
  slug: string;
  status: boolean;
}

export interface CourseSubCategoryFilterState {
  search: string;
  status: 'All Status' | 'Active' | 'Inactive';
  perPage: number;
}

export interface CreateCourseSubCategoryData {
  slug: string;
  status: boolean;
}

export interface UpdateCourseSubCategoryData {
  status: boolean;
}
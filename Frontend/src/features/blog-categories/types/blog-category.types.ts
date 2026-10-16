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

export interface BlogCategoryFilterState {
  search: string;
  status: 'All Status' | 'Active' | 'Inactive';
  perPage: number;
}

export interface CreateBlogCategoryData {
  slug: string;
  position?: number;
  parent_id?: string;
  status?: boolean;
  lang_code?: string;
  title?: string;
  short_description?: string;
}

export type UpdateBlogCategoryData =
  Partial<CreateBlogCategoryData>;
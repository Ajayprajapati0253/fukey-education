export interface Category {
  id: string;
  slug: string;
  order: number | null;
  icon: string | null;
  parentId: string | null;
  parentName?: string | null;
  showAtTrending: boolean;
  status: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CategoryFilterState {
  search: string;
  status: 'All Status' | 'Active' | 'Inactive';
  trending: 'All' | 'Yes' | 'No';
  perPage: number;
}

export interface CategoryListResponse {
  status: string;
  data: Category[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page?: number;
  };
}

export interface CreateCategoryData {
  slug: string;
  order?: number | null;
  icon?: string | null;
  parent_id?: number | null;
  show_at_trending?: boolean;
  status?: boolean;
}

export interface UpdateCategoryData
  extends Partial<CreateCategoryData> {}
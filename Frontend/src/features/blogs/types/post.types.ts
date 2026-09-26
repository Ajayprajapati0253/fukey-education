export type PostCategory = string;

export type PostStatus =
  | 'Published'
  | 'Draft'
  | 'Scheduled'
  | 'Archived';

export type PostLanguage = 'HI' | 'EN';

export interface Author {
  id?: string;
  name: string;
  avatar: string;
  role?: string;
  email?: string;
}

export interface PostTranslation {
  id?: string;
  blog_id?: string;
  lang_code: string;
  title?: string | null;
  description?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Post {
  id: string;
  sn: number;

  title: string;
  slug: string;

  thumbnail: string;

  author: Author;

  /*
   * Category is now dynamic.
   * It comes from Blog Category API.
   */
  category: PostCategory;

  /*
   * Actual backend category ID.
   */
  blog_category_id?: string | null;

  language: PostLanguage;

  showHomepage: boolean;
  isPopular: boolean;
  isFeatured: boolean;

  status: PostStatus;

  publishedDate: string;
  publishedTime: string;

  views: number;
  commentsCount: number;

  /*
   * Frontend normalized article content.
   *
   * Backend source:
   * translations[].description
   */
  content: string;

  excerpt: string;

  /*
   * Backend can return tags as JSON string,
   * therefore mapper should normalize it to string[].
   */
  tags: string[];

  /*
   * Original backend translations.
   * Useful for Edit / Preview / language selection.
   */
  translations?: PostTranslation[];

  createdAt: string;
}

export interface PostFilterOptions {
  searchQuery: string;

  language: string;

  showHomepage: string; // 'all' | 'true' | 'false'

  isPopular: string; // 'all' | 'true' | 'false'

  status: string; // 'all' | PostStatus

  category: string; // 'all' | category id/name

  author: string; // 'all' | author name

  dateRange: string;

  orderBy:
    | 'newest'
    | 'oldest'
    | 'title-asc'
    | 'title-desc'
    | 'popular'
    | 'views';

  perPage: number;
}

export interface PostMetricCounts {
  total: number;
  published: number;
  draft: number;
  scheduled: number;
  archived: number;
}

// --------------------------------------------------
// Blog Category
// --------------------------------------------------

export type CategoryStatus = 'Active' | 'Inactive';

export interface BlogCategory {
  id: string;
  sn: number;

  /*
   * Category name comes from Blog Category API.
   */
  name: string;

  slug?: string;

  status: CategoryStatus;
}

export interface CategoryFilterOptions {
  searchQuery: string;
  status: string; // 'all' | CategoryStatus
}
export type PostCategory =
  | 'Technology'
  | 'Strategies'
  | 'Development'
  | 'Psychology'
  | 'Education'
  | 'Involvement'
  | 'Evaluation'
  | 'Health';

export type PostStatus = 'Published' | 'Draft' | 'Scheduled' | 'Archived';
export type PostLanguage = 'HI' | 'EN';

export interface Author {
  name: string;
  avatar: string;
  role?: string;
  email?: string;
}

export interface Post {
  id: string;
  sn: number;
  title: string;
  slug: string;
  thumbnail: string;
  author: Author;
  category: PostCategory;
  language: PostLanguage;
  showHomepage: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  status: PostStatus;
  publishedDate: string;
  publishedTime: string;
  views: number;
  commentsCount: number;
  content: string;
  excerpt: string;
  tags: string[];
  createdAt: string;
}

export interface PostFilterOptions {
  searchQuery: string;
  language: string;
  showHomepage: string; // 'all' | 'true' | 'false'
  isPopular: string;    // 'all' | 'true' | 'false'
  status: string;       // 'all' | PostStatus
  category: string;     // 'all' | PostCategory
  author: string;       // 'all' | author name
  dateRange: string;
  orderBy: 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'popular' | 'views';
  perPage: number;
}

export interface PostMetricCounts {
  total: number;
  published: number;
  draft: number;
  scheduled: number;
  archived: number;
}

// ---- Blog Category (Category List page: SN, Name, Status, Actions) ----

export type CategoryStatus = 'Active' | 'Inactive';

export interface BlogCategory {
  id: string;
  sn: number;
  name: PostCategory;
  status: CategoryStatus;
}

export interface CategoryFilterOptions {
  searchQuery: string;
  status: string; // 'all' | CategoryStatus
}
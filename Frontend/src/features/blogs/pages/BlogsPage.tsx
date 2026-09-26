import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Upload,
  Plus,
  ChevronDown,
  FilePlus,
  Video,
  Import,
  CheckCircle2,
} from 'lucide-react';

import { MetricsCards } from '../components/MetricsCards';
import { FilterSection } from '../components/FilterSection';
import { PostTable } from '../components/PostTable';
import { PostModal } from '../components/PostModal';
import { PostPreviewModal } from '../components/PostPreviewModal';
import { ExportModal } from '../components/ExportModal';

import {
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} from '../api/blog.api';

import type {
  Blog,
  CreateBlogPayload,
  UpdateBlogPayload,
} from '../api/blog.api';

import type {
  Post,
  PostFilterOptions,
  PostStatus,
} from '../types/post.types';

const DEFAULT_FILTERS: PostFilterOptions = {
  searchQuery: '',
  language: 'all',
  showHomepage: 'all',
  isPopular: 'all',
  status: 'all',
  category: 'all',
  author: 'all',
  dateRange: '',
  orderBy: 'newest',
  perPage: 10,
};

const PARAM_KEYS: Record<keyof PostFilterOptions, string> = {
  searchQuery: 'q',
  language: 'lang',
  showHomepage: 'homepage',
  isPopular: 'popular',
  status: 'status',
  category: 'category',
  author: 'author',
  dateRange: 'date',
  orderBy: 'sort',
  perPage: 'perPage',
};

function filtersFromSearchParams(
  params: URLSearchParams,
): PostFilterOptions {
  const next = { ...DEFAULT_FILTERS };

  (
    Object.keys(PARAM_KEYS) as (keyof PostFilterOptions)[]
  ).forEach((key) => {
    const raw = params.get(PARAM_KEYS[key]);

    if (raw === null) return;

    if (key === 'perPage') {
      const n = Number(raw);

      if (!Number.isNaN(n)) {
        next.perPage = n;
      }
    } else {
      (next[key] as string) = raw;
    }
  });

  return next;
}

function searchParamsFromFilters(
  filters: PostFilterOptions,
  page: number,
): URLSearchParams {
  const params = new URLSearchParams();

  (
    Object.keys(PARAM_KEYS) as (keyof PostFilterOptions)[]
  ).forEach((key) => {
    const value = filters[key];
    const defaultValue = DEFAULT_FILTERS[key];

    if (value !== defaultValue && value !== '') {
      params.set(PARAM_KEYS[key], String(value));
    }
  });

  if (page > 1) {
    params.set('page', String(page));
  }

  return params;
}

/**
 * Convert backend Blog object into the existing Post UI structure.
 *
 * This keeps your existing PostTable / PostModal / MetricsCards
 * working while the data now comes from the API.
 */
const mapBlogToPost = (blog: Blog): Post => {
  const item = blog as any;

  // Backend title is inside translations
  const translation =
    Array.isArray(item.translations)
      ? item.translations[0]
      : null;

  const title =
    translation?.title ||
    item.title ||
    item.slug ||
    'Untitled';

  const language =
    translation?.lang_code ||
    item.lang_code ||
    item.language ||
    'en';

  return {
    ...item,

    id: String(item.id),

    title,

    author: {
      id: String(item.admin_id ?? ''),
      name: item.admin?.name || item.admin_name || `Admin #${item.admin_id ?? '-'}`,
    },

    category:
      item.category?.title ||
      item.category?.name ||
      item.category_name ||
      `Category #${item.blog_category_id ?? '-'}`,

    language,

    showHomepage:
      Boolean(item.show_homepage),

    isPopular:
      Boolean(item.is_popular),

    featured:
      Boolean(
        item.is_featured ??
        item.featured ??
        false,
      ),

    status:
      item.status ||
      item.blog_status ||
      'Draft',

    publishedDate:
      item.published_at ||
      item.published_date ||
      item.created_at ||
      new Date().toISOString(),

    createdAt:
      item.created_at ||
      new Date().toISOString(),

    views:
      Number(item.views ?? 0),

    image:
      item.image ||
      item.thumbnail ||
      '',
  } as Post;
};

/**
 * Convert frontend Post payload to backend payload.
 *
 * The backend DTO uses the actual field names supplied by
 * PostModal. Unknown additional fields are preserved.
 */
const mapPostToBlogPayload = (
  postData: Partial<Post>,
): CreateBlogPayload | UpdateBlogPayload => {
  const data = postData as any;

  return {
    ...data,

    id: undefined,

    author:
      typeof data.author === 'object'
        ? data.author?.id
        : data.author,

    author_id:
      data.author_id ??
      (typeof data.author === 'object'
        ? data.author?.id
        : undefined),

    category_id:
      data.category_id ??
      (typeof data.category === 'object'
        ? data.category?.id
        : undefined),

    show_homepage:
      data.show_homepage ??
      data.showHomepage,

    is_popular:
      data.is_popular ??
      data.isPopular,

    is_featured:
      data.is_featured ??
      data.featured,

    published_date:
      data.published_date ??
      data.publishedDate,

    created_at:
      data.created_at ??
      data.createdAt,
  };
};

export const BlogsPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchParams, setSearchParams] =
    useSearchParams();

  const filters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams],
  );

  const currentPage = useMemo(() => {
    const p = Number(searchParams.get('page'));

    return Number.isFinite(p) && p > 0 ? p : 1;
  }, [searchParams]);

  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedPostIds, setSelectedPostIds] =
    useState<string[]>([]);

  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  const [isAddMenuOpen, setIsAddMenuOpen] =
    useState(false);

  const [isPostModalOpen, setIsPostModalOpen] =
    useState(false);

  const [editingPost, setEditingPost] =
    useState<Post | null>(null);

  const [previewingPost, setPreviewingPost] =
    useState<Post | null>(null);

  const [isExportModalOpen, setIsExportModalOpen] =
    useState(false);

  /* =========================
     Toast
  ========================= */

  const showToast = (msg: string) => {
    setToastMessage(msg);

    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  /* =========================
     Load Blogs
  ========================= */

  const loadBlogs = async () => {
    try {
      setLoading(true);

      const response = await getBlogs({
        page: currentPage,
        perPage: filters.perPage,

        // Send these only if backend supports them.
        q:
          filters.searchQuery ||
          undefined,

        lang:
          filters.language !== 'all'
            ? filters.language
            : undefined,

        status:
          filters.status !== 'all'
            ? filters.status
            : undefined,

        category:
          filters.category !== 'all'
            ? filters.category
            : undefined,

        author:
          filters.author !== 'all'
            ? filters.author
            : undefined,

        date:
          filters.dateRange ||
          undefined,

        sort:
          filters.orderBy !== 'newest'
            ? filters.orderBy
            : undefined,
      });
      console.log('BLOG API RESPONSE:', response);
      console.log('BLOG API DATA:', response?.data);

      const apiBlogs = Array.isArray(response?.data)
        ? response.data
        : [];

      const mappedPosts = apiBlogs.map(
        mapBlogToPost,
      );

      setPosts(mappedPosts);

const pagination =
  response?.pagination ||
  response?.meta;

const total = Number(
  pagination?.total ??
    mappedPosts.length,
);

const lastPage = Number(
  pagination?.last_page ??
    Math.max(
      Math.ceil(total / filters.perPage),
      1,
    ),
);

setTotalResults(total);

setTotalPages(
  Math.max(lastPage, 1),
);
    } catch (error: any) {
      console.error(
        'Failed to load blogs:',
        error,
      );

      showToast(
        error?.message ||
          'Failed to load blogs',
      );

      setPosts([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, [
    currentPage,
    filters.perPage,
    filters.searchQuery,
    filters.language,
    filters.status,
    filters.category,
    filters.author,
    filters.dateRange,
    filters.orderBy,
  ]);

  /* =========================
     Filters
  ========================= */

  const setFilters = <
    K extends keyof PostFilterOptions,
  >(
    key: K,
    value: PostFilterOptions[K],
  ) => {
    const next = {
      ...filters,
      [key]: value,
    };

    setSearchParams(
      searchParamsFromFilters(
        next,
        1,
      ),
    );
  };

  const setCurrentPage = (
    page: number,
  ) => {
    setSearchParams(
      searchParamsFromFilters(
        filters,
        page,
      ),
    );
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;

    if (filters.searchQuery) count++;

    if (filters.language !== 'all')
      count++;

    if (filters.showHomepage !== 'all')
      count++;

    if (filters.isPopular !== 'all')
      count++;

    if (filters.status !== 'all')
      count++;

    if (filters.category !== 'all')
      count++;

    if (filters.author !== 'all')
      count++;

    if (filters.dateRange) count++;

    if (filters.orderBy !== 'newest')
      count++;

    return count;
  }, [filters]);

  /* =========================
     Metrics
  ========================= */

  const metricsCounts = useMemo(
    () => ({
      total: totalResults,

      published: posts.filter(
        (p) =>
          String(p.status).toLowerCase() ===
          'published',
      ).length,

      draft: posts.filter(
        (p) =>
          String(p.status).toLowerCase() ===
          'draft',
      ).length,

      scheduled: posts.filter(
        (p) =>
          String(p.status).toLowerCase() ===
          'scheduled',
      ).length,

      archived: posts.filter(
        (p) =>
          String(p.status).toLowerCase() ===
          'archived',
      ).length,
    }),
    [posts, totalResults],
  );

  /*
   * API is now responsible for pagination/filtering.
   * No INITIAL_POSTS and no local mock filtering.
   */
  const paginatedPosts = posts;

  /* =========================
     Selection
  ========================= */

  const handleToggleSelectPost = (
    id: string,
  ) => {
    setSelectedPostIds((prev) =>
      prev.includes(id)
        ? prev.filter(
            (postId) =>
              postId !== id,
          )
        : [...prev, id],
    );
  };

  const handleToggleSelectAll = () => {
    if (
      selectedPostIds.length ===
      paginatedPosts.length
    ) {
      setSelectedPostIds([]);
    } else {
      setSelectedPostIds(
        paginatedPosts.map(
          (post) => post.id,
        ),
      );
    }
  };

  /* =========================
     Update Blog
  ========================= */

  const handleUpdateBlog = async (
    id: string,
    payload: any,
    successMessage: string,
  ) => {
    try {
      setSaving(true);

      await updateBlog(
        id,
        payload,
      );

      await loadBlogs();

      showToast(successMessage);
    } catch (error: any) {
      console.error(
        'Failed to update blog:',
        error,
      );

      showToast(
        error?.message ||
          'Failed to update blog',
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     Homepage
  ========================= */

  const handleToggleHomepage = (
    id: string,
  ) => {
    const post = posts.find(
      (item) => item.id === id,
    );

    if (!post) return;

    handleUpdateBlog(
      id,
      {
        show_homepage:
          !post.showHomepage,
      },
      'Post homepage visibility updated',
    );
  };

  /* =========================
     Popular
  ========================= */

  const handleTogglePopular = (
    id: string,
  ) => {
    const post = posts.find(
      (item) => item.id === id,
    );

    if (!post) return;

    handleUpdateBlog(
      id,
      {
        is_popular:
          !post.isPopular,
      },
      'Post popularity updated',
    );
  };

  /* =========================
     Featured
  ========================= */

  const handleToggleFeatured = (
    id: string,
  ) => {
    const post = posts.find(
      (item) => item.id === id,
    );

    if (!post) return;

    handleUpdateBlog(
      id,
      {
        is_featured:
          !(post as any).featured,
      },
      'Post featured status updated',
    );
  };

  /* =========================
     Status
  ========================= */

  const handleChangeStatus = (
    id: string,
    newStatus: PostStatus,
  ) => {
    handleUpdateBlog(
      id,
      {
        status: newStatus,
      },
      `Status updated to "${newStatus}"`,
    );
  };

  /* =========================
     Delete
  ========================= */

  const handleDeletePost = async (
    id: string,
  ) => {
    const post = posts.find(
      (item) => item.id === id,
    );

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${
          post?.title || 'this post'
        }"?`,
      );

    if (!confirmed) return;

    try {
      setSaving(true);

      await deleteBlog(id);

      setSelectedPostIds(
        (prev) =>
          prev.filter(
            (postId) =>
              postId !== id,
          ),
      );

      await loadBlogs();

      showToast(
        'Post deleted successfully',
      );
    } catch (error: any) {
      console.error(
        'Failed to delete blog:',
        error,
      );

      showToast(
        error?.message ||
          'Failed to delete post',
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     Duplicate
  ========================= */

  const handleDuplicatePost = async (
    post: Post,
  ) => {
    try {
      setSaving(true);

      const payload =
        mapPostToBlogPayload({
          ...post,
          title: `${post.title} Copy`,
        });

      delete (payload as any).id;

      await createBlog(payload);

      await loadBlogs();

      showToast(
        `Duplicated "${post.title}"`,
      );
    } catch (error: any) {
      console.error(
        'Failed to duplicate blog:',
        error,
      );

      showToast(
        error?.message ||
          'Failed to duplicate post',
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     Bulk Status
  ========================= */

  const handleBulkStatusChange = async (
    status: PostStatus,
  ) => {
    if (!selectedPostIds.length) {
      return;
    }

    try {
      setSaving(true);

      await Promise.all(
        selectedPostIds.map(
          (id) =>
            updateBlog(id, {
              status,
            }),
        ),
      );

      setSelectedPostIds([]);

      await loadBlogs();

      showToast(
        `Updated ${selectedPostIds.length} posts to "${status}"`,
      );
    } catch (error: any) {
      console.error(
        'Failed bulk status update:',
        error,
      );

      showToast(
        error?.message ||
          'Failed to update posts',
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     Bulk Delete
  ========================= */

  const handleBulkDelete = async () => {
    if (!selectedPostIds.length) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${selectedPostIds.length} selected posts?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      await Promise.all(
        selectedPostIds.map(
          (id) =>
            deleteBlog(id),
        ),
      );

      setSelectedPostIds([]);

      await loadBlogs();

      showToast(
        'Selected posts deleted successfully',
      );
    } catch (error: any) {
      console.error(
        'Failed bulk delete:',
        error,
      );

      showToast(
        error?.message ||
          'Failed to delete posts',
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     Save Blog
  ========================= */

  const handleSavePost = async (
    postData: Partial<Post>,
  ) => {
    try {
      setSaving(true);

      const payload =
        mapPostToBlogPayload(
          postData,
        );

      if (editingPost) {
        await updateBlog(
          editingPost.id,
          payload,
        );

        showToast(
          'Post updated successfully',
        );
      } else {
        await createBlog(
          payload,
        );

        showToast(
          'New post created successfully',
        );
      }

      setEditingPost(null);
      setIsPostModalOpen(false);

      await loadBlogs();
    } catch (error: any) {
      console.error(
        'Failed to save blog:',
        error,
      );

      showToast(
        error?.message ||
          'Failed to save post',
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     Reset
  ========================= */

  const handleResetFilters = () => {
    setSearchParams(
      new URLSearchParams(),
    );

    showToast(
      'Filters reset to default',
    );
  };

  /* =========================
     Render
  ========================= */

  return (
    <div className="space-y-6 pb-8">
      {/* Saving overlay */}
      {saving && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20">
          <div className="rounded-xl bg-white px-5 py-4 shadow-xl dark:bg-[#1E293B]">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />

              <span className="text-sm font-medium text-ink dark:text-white">
                Processing...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4 text-success" />

          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink dark:text-white sm:text-2xl">
            All Posts
          </h1>

          <p className="mt-0.5 text-xs font-medium text-ink-soft dark:text-[#94A3B8] sm:text-sm">
            Create, manage and organize all blog posts on your platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Export */}
          <button
            type="button"
            onClick={() =>
              setIsExportModalOpen(true)
            }
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-border-subtle bg-white px-4 py-2 text-xs font-bold text-ink shadow-2xs transition-colors hover:bg-slate-50 dark:border-[#334155] dark:bg-[#1E293B] dark:text-gray-100 dark:hover:bg-slate-700/50"
          >
            <Upload className="h-4 w-4 rotate-45" />

            <span>Export</span>
          </button>

          {/* Add */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setEditingPost(null);
                setIsPostModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-[0_2px_8px_rgba(36,81,217,0.25)] transition-all hover:bg-[#1E44B8] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />

              <span>Add New Post</span>

              <span
                onClick={(e) => {
                  e.stopPropagation();

                  setIsAddMenuOpen(
                    !isAddMenuOpen,
                  );
                }}
                className="rounded p-0.5 hover:bg-white/20"
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${
                    isAddMenuOpen
                      ? 'rotate-180'
                      : ''
                  }`}
                />
              </span>
            </button>

            {isAddMenuOpen && (
              <div className="absolute right-0 z-50 mt-2 w-52 animate-in rounded-2xl border border-border-subtle bg-white p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.15)] fade-in zoom-in-95 dark:border-[#334155] dark:bg-[#1E293B]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddMenuOpen(false);
                    setEditingPost(null);
                    setIsPostModalOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-ink transition-colors hover:bg-[#EAF0FE] hover:text-brand dark:text-gray-100 dark:hover:bg-[#2451D9]/20"
                >
                  <FilePlus className="h-3.5 w-3.5 text-brand" />

                  <span>
                    Standard Article
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAddMenuOpen(false);
                    setEditingPost(null);
                    setIsPostModalOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-ink transition-colors hover:bg-slate-100 dark:text-gray-100 dark:hover:bg-slate-700/50"
                >
                  <Video className="h-3.5 w-3.5 text-purple-600" />

                  <span>
                    Video Tutorial Post
                  </span>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-[#334155]" />

                <button
                  type="button"
                  onClick={() => {
                    setIsAddMenuOpen(false);
                    setIsExportModalOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-ink transition-colors hover:bg-slate-100 dark:text-gray-100 dark:hover:bg-slate-700/50"
                >
                  <Import className="h-3.5 w-3.5 text-emerald-600" />

                  <span>
                    Import from CSV
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterSection
        filters={filters}
        onChangeFilter={setFilters}
        onResetFilters={handleResetFilters}
        onApplyFilters={() =>
          loadBlogs()
        }
        activeFiltersCount={
          activeFiltersCount
        }
      />

      {/* Metrics */}
      <MetricsCards
        counts={metricsCounts}
        activeFilter={filters.status}
        onSelectStatusFilter={(status) =>
          setFilters(
            'status',
            status,
          )
        }
      />

      {/* Table */}
      {loading ? (
        <div className="rounded-2xl border border-border-subtle bg-white p-6 dark:border-[#334155] dark:bg-[#1E293B]">
          <div className="space-y-4">
            {Array.from({
              length: 8,
            }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-4"
              >
                <div className="h-5 w-5 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />

                <div className="h-5 flex-1 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />

                <div className="h-5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />

                <div className="h-5 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <PostTable
          posts={paginatedPosts}
          selectedPostIds={
            selectedPostIds
          }
          onToggleSelectPost={
            handleToggleSelectPost
          }
          onToggleSelectAll={
            handleToggleSelectAll
          }
          onToggleHomepage={
            handleToggleHomepage
          }
          onTogglePopular={
            handleTogglePopular
          }
          onToggleFeatured={
            handleToggleFeatured
          }
          onEditPost={(post) => {
            setEditingPost(post);
            setIsPostModalOpen(true);
          }}
          onViewPost={(post) =>
            setPreviewingPost(post)
          }
          onDeletePost={
            handleDeletePost
          }
          onDuplicatePost={
            handleDuplicatePost
          }
          onChangeStatus={
            handleChangeStatus
          }
          onBulkStatusChange={
            handleBulkStatusChange
          }
          onBulkDelete={
            handleBulkDelete
          }
          onBulkExport={() =>
            setIsExportModalOpen(true)
          }
          currentPage={currentPage}
          totalPages={totalPages}
          totalResults={totalResults}
          perPage={filters.perPage}
          onPageChange={
            setCurrentPage
          }
        />
      )}

      {/* Edit/Create Modal */}
      <PostModal
        isOpen={isPostModalOpen}
        initialPost={editingPost}
        onClose={() => {
          setIsPostModalOpen(false);
          setEditingPost(null);
        }}
        onSave={handleSavePost}
      />

      {/* Preview */}
      <PostPreviewModal
        post={previewingPost}
        isOpen={!!previewingPost}
        onClose={() =>
          setPreviewingPost(null)
        }
        onEdit={(post) => {
          setPreviewingPost(null);
          setEditingPost(post);
          setIsPostModalOpen(true);
        }}
      />

      {/* Export */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() =>
          setIsExportModalOpen(false)
        }
        posts={posts}
      />
    </div>
  );
};

export default BlogsPage;
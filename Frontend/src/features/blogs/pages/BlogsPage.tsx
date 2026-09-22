import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Upload, Plus, ChevronDown, FilePlus, Video, Import, CheckCircle2 } from 'lucide-react';

import { MetricsCards } from '../components/MetricsCards';
import { FilterSection } from '../components/FilterSection';
import { PostTable } from '../components/PostTable';
import { PostModal } from '../components/PostModal';
import { PostPreviewModal } from '../components/PostPreviewModal';
import { ExportModal } from '../components/ExportModal';

import { usePosts } from '../hooks/usePosts';
import { INITIAL_POSTS } from '../data/InitialPosts';
import type { Post, PostFilterOptions, PostStatus } from '../types/post.types';

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

function filtersFromSearchParams(params: URLSearchParams): PostFilterOptions {
  const next = { ...DEFAULT_FILTERS };
  (Object.keys(PARAM_KEYS) as (keyof PostFilterOptions)[]).forEach((key) => {
    const raw = params.get(PARAM_KEYS[key]);
    if (raw === null) return;
    if (key === 'perPage') {
      const n = Number(raw);
      if (!Number.isNaN(n)) next.perPage = n;
    } else {
      (next[key] as string) = raw;
    }
  });
  return next;
}

function searchParamsFromFilters(filters: PostFilterOptions, page: number): URLSearchParams {
  const params = new URLSearchParams();
  (Object.keys(PARAM_KEYS) as (keyof PostFilterOptions)[]).forEach((key) => {
    const value = filters[key];
    const defaultValue = DEFAULT_FILTERS[key];
    if (value !== defaultValue && value !== '') {
      params.set(PARAM_KEYS[key], String(value));
    }
  });
  if (page > 1) params.set('page', String(page));
  return params;
}

export const BlogsPage: React.FC = () => {
  const {
    posts,
    addPost,
    updatePost,
    deletePost,
    duplicatePost,
    toggleHomepage,
    togglePopular,
    toggleFeatured,
    changeStatus,
    bulkChangeStatus,
    bulkDelete,
  } = usePosts(INITIAL_POSTS);

  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);
  const currentPage = useMemo(() => {
    const p = Number(searchParams.get('page'));
    return Number.isFinite(p) && p > 0 ? p : 1;
  }, [searchParams]);

  const setFilters = <K extends keyof PostFilterOptions>(key: K, value: PostFilterOptions[K]) => {
    const next = { ...filters, [key]: value };
    setSearchParams(searchParamsFromFilters(next, 1));
  };

  const setCurrentPage = (page: number) => {
    setSearchParams(searchParamsFromFilters(filters, page));
  };

  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [previewingPost, setPreviewingPost] = useState<Post | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.language !== 'all') count++;
    if (filters.showHomepage !== 'all') count++;
    if (filters.isPopular !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.category !== 'all') count++;
    if (filters.author !== 'all') count++;
    if (filters.dateRange) count++;
    if (filters.orderBy !== 'newest') count++;
    return count;
  }, [filters]);

  const metricsCounts = useMemo(
    () => ({
      total: posts.length,
      published: posts.filter((p) => p.status === 'Published').length,
      draft: posts.filter((p) => p.status === 'Draft').length,
      scheduled: posts.filter((p) => p.status === 'Scheduled').length,
      archived: posts.filter((p) => p.status === 'Archived').length,
    }),
    [posts]
  );

  const filteredAndSortedPosts = useMemo(() => {
    return posts
      .filter((post) => {
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matches = [post.title, post.author.name, post.category].some((f) =>
            f.toLowerCase().includes(q)
          );
          if (!matches) return false;
        }
        if (filters.language !== 'all' && post.language !== filters.language) return false;
        if (filters.showHomepage !== 'all' && post.showHomepage !== (filters.showHomepage === 'true'))
          return false;
        if (filters.isPopular !== 'all' && post.isPopular !== (filters.isPopular === 'true')) return false;
        if (filters.status !== 'all' && post.status !== filters.status) return false;
        if (filters.category !== 'all' && post.category !== filters.category) return false;
        if (filters.author !== 'all' && post.author.name !== filters.author) return false;
        if (
          filters.dateRange.trim() &&
          !post.publishedDate.toLowerCase().includes(filters.dateRange.toLowerCase())
        )
          return false;
        return true;
      })
      .sort((a, b) => {
        switch (filters.orderBy) {
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'title-asc':
            return a.title.localeCompare(b.title);
          case 'title-desc':
            return b.title.localeCompare(a.title);
          case 'popular':
            return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
          case 'views':
            return b.views - a.views;
          case 'newest':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [posts, filters]);

  const totalResults = filteredAndSortedPosts.length;
  const totalPages = Math.ceil(totalResults / filters.perPage) || 1;
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * filters.perPage;
    return filteredAndSortedPosts.slice(start, start + filters.perPage);
  }, [filteredAndSortedPosts, currentPage, filters.perPage]);

  const handleToggleSelectPost = (id: string) => {
    setSelectedPostIds((prev) => (prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]));
  };

  const handleToggleSelectAll = () => {
    if (selectedPostIds.length === paginatedPosts.length) {
      setSelectedPostIds([]);
    } else {
      setSelectedPostIds(paginatedPosts.map((p) => p.id));
    }
  };

  const handleToggleHomepage = (id: string) => {
    toggleHomepage(id);
    showToast('Post homepage visibility updated');
  };

  const handleTogglePopular = (id: string) => {
    togglePopular(id);
    showToast('Post popularity updated');
  };

  const handleToggleFeatured = (id: string) => {
    toggleFeatured(id);
    showToast('Post featured status updated');
  };

  const handleChangeStatus = (id: string, newStatus: PostStatus) => {
    changeStatus(id, newStatus);
    showToast(`Status updated to "${newStatus}"`);
  };

  const handleDuplicatePost = (post: Post) => {
    const duplicated = duplicatePost(post);
    showToast(`Duplicated "${post.title}" as "${duplicated.title}"`);
  };

  const handleDeletePost = (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePost(id);
      setSelectedPostIds((prev) => prev.filter((pId) => pId !== id));
      showToast('Post deleted successfully');
    }
  };

  const handleBulkStatusChange = (status: PostStatus) => {
    bulkChangeStatus(selectedPostIds, status);
    showToast(`Updated ${selectedPostIds.length} posts to "${status}"`);
    setSelectedPostIds([]);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedPostIds.length} selected posts?`)) {
      bulkDelete(selectedPostIds);
      setSelectedPostIds([]);
      showToast('Selected posts deleted successfully');
    }
  };

  const handleSavePost = (postData: Partial<Post>) => {
    if (editingPost) {
      updatePost(editingPost.id, postData);
      showToast('Post updated successfully');
    } else {
      addPost(postData);
      showToast('New post created successfully');
    }
    setEditingPost(null);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
    showToast('Filters reset to default');
  };

  return (
    <div className="space-y-6 pb-8">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink dark:text-white tracking-tight">
            All Post 
          </h1>
          <p className="text-xs sm:text-sm text-ink-soft dark:text-[#94A3B8] mt-0.5 font-medium">
            Create, manage and organize all blog posts on your platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-border-subtle dark:border-[#334155] bg-white dark:bg-[#1E293B] rounded-xl text-xs font-bold text-ink dark:text-gray-100 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-2xs cursor-pointer"
          >
            <Upload className="w-4 h-4 rotate-45" />
            <span>Export</span>
          </button>

          <div className="relative">
            <button
              onClick={() => {
                setEditingPost(null);
                setIsPostModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white rounded-xl text-xs font-bold hover:bg-[#1E44B8] active:scale-[0.98] transition-all shadow-[0_2px_8px_rgba(36,81,217,0.25)] select-none"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Post</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddMenuOpen(!isAddMenuOpen);
                }}
                className="p-0.5 hover:bg-white/20 rounded"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isAddMenuOpen ? 'rotate-180' : ''}`} />
              </span>
            </button>

            {isAddMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1E293B] border border-border-subtle dark:border-[#334155] rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.15)] p-1.5 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    setIsAddMenuOpen(false);
                    setEditingPost(null);
                    setIsPostModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-ink dark:text-gray-100 hover:bg-[#EAF0FE] dark:hover:bg-[#2451D9]/20 hover:text-brand rounded-xl flex items-center gap-2 transition-colors"
                >
                  <FilePlus className="w-3.5 h-3.5 text-brand" />
                  <span>Standard Article</span>
                </button>
                <button
                  onClick={() => {
                    setIsAddMenuOpen(false);
                    setEditingPost(null);
                    setIsPostModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-ink dark:text-gray-100 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Video className="w-3.5 h-3.5 text-purple-600" />
                  <span>Video Tutorial Post</span>
                </button>
                <div className="border-t border-slate-100 dark:border-[#334155] my-1" />
                <button
                  onClick={() => {
                    setIsAddMenuOpen(false);
                    setIsExportModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-ink dark:text-gray-100 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Import className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Import from CSV</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <FilterSection
        filters={filters}
        onChangeFilter={setFilters}
        onResetFilters={handleResetFilters}
        onApplyFilters={() => showToast(`Applied filters (${totalResults} results)`)}
        activeFiltersCount={activeFiltersCount}
      />

      <MetricsCards
        counts={metricsCounts}
        activeFilter={filters.status}
        onSelectStatusFilter={(status) => setFilters('status', status)}
      />

      <PostTable
        posts={paginatedPosts}
        selectedPostIds={selectedPostIds}
        onToggleSelectPost={handleToggleSelectPost}
        onToggleSelectAll={handleToggleSelectAll}
        onToggleHomepage={handleToggleHomepage}
        onTogglePopular={handleTogglePopular}
        onToggleFeatured={handleToggleFeatured}
        onEditPost={(post) => {
          setEditingPost(post);
          setIsPostModalOpen(true);
        }}
        onViewPost={(post) => setPreviewingPost(post)}
        onDeletePost={handleDeletePost}
        onDuplicatePost={handleDuplicatePost}
        onChangeStatus={handleChangeStatus}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkDelete={handleBulkDelete}
        onBulkExport={() => setIsExportModalOpen(true)}
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={totalResults}
        perPage={filters.perPage}
        onPageChange={setCurrentPage}
      />

      <PostModal
        isOpen={isPostModalOpen}
        initialPost={editingPost}
        onClose={() => {
          setIsPostModalOpen(false);
          setEditingPost(null);
        }}
        onSave={handleSavePost}
      />

      <PostPreviewModal
        post={previewingPost}
        isOpen={!!previewingPost}
        onClose={() => setPreviewingPost(null)}
        onEdit={(post) => {
          setEditingPost(post);
          setIsPostModalOpen(true);
        }}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        posts={filteredAndSortedPosts}
      />
    </div>
  );
};

export default BlogsPage;
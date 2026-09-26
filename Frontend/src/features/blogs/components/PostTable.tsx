import React, {
  useState,
  useRef,
  useEffect,
} from 'react';

import {
  CheckCircle2,
  XCircle,
  Star,
  Edit,
  Eye,
  MoreVertical,
  Trash2,
  Copy,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { Badge } from '../../../components/ui/Badge';

import type {
  Post,
  PostStatus,
} from '../types/post.types';

interface PostTableProps {
  posts: Post[];

  selectedPostIds: string[];

  onToggleSelectPost: (
    id: string,
  ) => void;

  onToggleSelectAll: () => void;

  onToggleHomepage: (
    id: string,
  ) => void;

  onTogglePopular: (
    id: string,
  ) => void;

  onToggleFeatured: (
    id: string,
  ) => void;

  onEditPost: (
    post: Post,
  ) => void;

  onViewPost: (
    post: Post,
  ) => void;

  onDeletePost: (
    id: string,
  ) => void;

  onDuplicatePost: (
    post: Post,
  ) => void;

  onChangeStatus: (
    id: string,
    status: PostStatus,
  ) => void;

  onBulkStatusChange: (
    status: PostStatus,
  ) => void;

  onBulkDelete: () => void;

  onBulkExport: () => void;

  currentPage: number;

  totalPages: number;

  totalResults: number;

  perPage: number;

  onPageChange: (
    page: number,
  ) => void;
}

/* =========================================================
   STATUS VARIANTS
========================================================= */

const STATUS_VARIANT: Record<
  PostStatus,
  'success' | 'warning' | 'brand' | 'neutral'
> = {
  Published: 'success',
  Draft: 'warning',
  Scheduled: 'brand',
  Archived: 'neutral',
};

/* =========================================================
   LANGUAGE FLAGS
========================================================= */

const LANGUAGE_FLAG: Record<
  string,
  string
> = {
  HI: '🇮🇳',
  EN: '🇺🇸',
  ES: '🇪🇸',
  FR: '🇫🇷',
};

/* =========================================================
   HELPERS
========================================================= */

const getInitials = (
  name?: string,
): string => {
  if (!name?.trim()) {
    return 'A';
  }

  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    words[0][0] +
    words[words.length - 1][0]
  ).toUpperCase();
};

const getCategoryBadgeVariant = (
  category?: string,
):
  | 'accent'
  | 'brand'
  | 'success'
  | 'warning'
  | 'neutral'
  | 'teal'
  | 'danger' => {
  const value =
    String(category || '')
      .toLowerCase();

  if (
    value.includes('education') ||
    value.includes('study') ||
    value.includes('academic')
  ) {
    return 'success';
  }

  if (
    value.includes('technology') ||
    value.includes('tech')
  ) {
    return 'brand';
  }

  if (
    value.includes('strategy') ||
    value.includes('business')
  ) {
    return 'warning';
  }

  if (
    value.includes('development') ||
    value.includes('program')
  ) {
    return 'accent';
  }

  if (
    value.includes('psychology') ||
    value.includes('mental')
  ) {
    return 'teal';
  }

  if (
    value.includes('health') ||
    value.includes('medical')
  ) {
    return 'danger';
  }

  return 'neutral';
};

const getStatusVariant = (
  status?: PostStatus,
) => {
  return (
    STATUS_VARIANT[
      status as PostStatus
    ] || 'neutral'
  );
};

/* =========================================================
   COMPONENT
========================================================= */

export const PostTable: React.FC<
  PostTableProps
> = ({
  posts,
  selectedPostIds,
  onToggleSelectPost,
  onToggleSelectAll,
  onToggleHomepage,
  onTogglePopular,
  onToggleFeatured,
  onEditPost,
  onViewPost,
  onDeletePost,
  onDuplicatePost,
  onChangeStatus,
  onBulkStatusChange,
  onBulkDelete,
  onBulkExport,
  currentPage,
  totalPages,
  totalResults,
  perPage,
  onPageChange,
}) => {
  const [
    activeDropdownId,
    setActiveDropdownId,
  ] = useState<string | null>(
    null,
  );

  const dropdownRef =
    useRef<HTMLDivElement>(null);

  /* =======================================================
     SELECTION
  ======================================================= */

  const isAllSelected =
    posts.length > 0 &&
    selectedPostIds.length ===
      posts.length;

  const isPartiallySelected =
    selectedPostIds.length > 0 &&
    selectedPostIds.length <
      posts.length;

  /* =======================================================
     CLOSE DROPDOWN ON OUTSIDE CLICK
  ======================================================= */

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent,
    ) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node,
        )
      ) {
        setActiveDropdownId(null);
      }
    };

    document.addEventListener(
      'mousedown',
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick,
      );
    };
  }, []);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const startItem =
    totalResults === 0
      ? 0
      : (currentPage - 1) *
          perPage +
        1;

  const endItem =
    Math.min(
      currentPage * perPage,
      totalResults,
    );

  /* =======================================================
     PAGE BUTTONS
  ======================================================= */

  const renderPageButtons = () => {
    const pages: (
      | number
      | string
    )[] = [];

    if (totalPages <= 7) {
      for (
        let i = 1;
        i <= totalPages;
        i++
      ) {
        pages.push(i);
      }
    } else if (currentPage <= 4) {
      pages.push(
        1,
        2,
        3,
        4,
        5,
        '...',
        totalPages,
      );
    } else if (
      currentPage >=
      totalPages - 3
    ) {
      pages.push(
        1,
        '...',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      pages.push(
        1,
        '...',
        currentPage - 1,
        currentPage,
        currentPage + 1,
        '...',
        totalPages,
      );
    }

    return pages.map(
      (page, index) =>
        page === '...' ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-8 w-8 select-none items-center justify-center text-xs font-semibold text-slate-400 dark:text-gray-500"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() =>
              onPageChange(
                page as number,
              )
            }
            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-xs font-semibold transition-all ${
              currentPage === page
                ? 'bg-blue-600 text-white shadow-xs'
                : 'border border-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-300 dark:hover:bg-slate-700/50 dark:hover:text-gray-100'
            }`}
          >
            {page}
          </button>
        ),
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-[#334155] dark:bg-[#1E293B]">

      {/* =================================================
          BULK ACTION BAR
      ================================================= */}

      {selectedPostIds.length >
        0 && (
        <div className="flex animate-fade-in flex-wrap items-center justify-between gap-3 border-b border-blue-200 bg-blue-50/90 px-4 py-2.5 text-xs dark:border-blue-500/20 dark:bg-blue-500/10">

          <div className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-300">

            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
              {
                selectedPostIds.length
              }
            </span>

            <span>
              {
                selectedPostIds.length
              }{' '}
              posts selected
            </span>
          </div>

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={() =>
                onBulkStatusChange(
                  'Published',
                )
              }
              className="rounded-md border border-blue-200 bg-white px-2.5 py-1 font-medium text-blue-700 hover:bg-blue-100/60 dark:border-blue-500/30 dark:bg-[#1E293B] dark:text-blue-400 dark:hover:bg-blue-500/20"
            >
              Publish Selected
            </button>

            <button
              type="button"
              onClick={() =>
                onBulkStatusChange(
                  'Draft',
                )
              }
              className="rounded-md border border-blue-200 bg-white px-2.5 py-1 font-medium text-slate-700 hover:bg-blue-100/60 dark:border-blue-500/30 dark:bg-[#1E293B] dark:text-gray-300 dark:hover:bg-blue-500/20"
            >
              Set to Draft
            </button>

            <button
              type="button"
              onClick={() =>
                onBulkStatusChange(
                  'Archived',
                )
              }
              className="rounded-md border border-blue-200 bg-white px-2.5 py-1 font-medium text-slate-700 hover:bg-blue-100/60 dark:border-blue-500/30 dark:bg-[#1E293B] dark:text-gray-300 dark:hover:bg-blue-500/20"
            >
              Archive Selected
            </button>

            <button
              type="button"
              onClick={
                onBulkExport
              }
              className="rounded-md border border-blue-200 bg-white px-2.5 py-1 font-medium text-slate-700 hover:bg-blue-100/60 dark:border-blue-500/30 dark:bg-[#1E293B] dark:text-gray-300 dark:hover:bg-blue-500/20"
            >
              Export Selected
            </button>

            <button
              type="button"
              onClick={
                onBulkDelete
              }
              className="flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 font-medium text-white hover:bg-red-700"
            >
              <Trash2 className="h-3 w-3" />
              <span>
                Delete
              </span>
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap text-left">

          {/* HEADER */}

          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-[#334155] dark:bg-slate-800/40 dark:text-gray-400">

              <th className="w-12 px-4 py-3.5 text-center">
                <input
                  type="checkbox"
                  checked={
                    isAllSelected
                  }
                  ref={(input) => {
                    if (input) {
                      input.indeterminate =
                        isPartiallySelected;
                    }
                  }}
                  onChange={
                    onToggleSelectAll
                  }
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-blue-500"
                />
              </th>

              <th className="w-12 px-2 py-3.5 font-bold">
                SN
              </th>

              <th className="min-w-[320px] px-4 py-3.5 font-bold">
                Title
              </th>

              <th className="px-4 py-3.5 font-bold">
                Author
              </th>

              <th className="px-4 py-3.5 font-bold">
                Category
              </th>

              <th className="px-4 py-3.5 font-bold">
                Language
              </th>

              <th className="px-4 py-3.5 text-center font-bold">
                Show Homepage
              </th>

              <th className="px-4 py-3.5 text-center font-bold">
                Popular
              </th>

              <th className="px-4 py-3.5 font-bold">
                Status
              </th>

              <th className="px-4 py-3.5 font-bold">
                Published Date
              </th>

              <th className="px-4 py-3.5 pr-6 text-right font-bold">
                Action
              </th>
            </tr>
          </thead>

          {/* BODY */}

          <tbody className="divide-y divide-slate-100 text-sm dark:divide-[#334155]">

            {posts.length ===
            0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="py-12 text-center text-slate-400 dark:text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-3xl">
                      🔍
                    </span>

                    <span className="text-base font-semibold text-slate-600 dark:text-gray-300">
                      No posts found
                    </span>

                    <span className="text-xs text-slate-400 dark:text-gray-500">
                      Try adjusting
                      your search
                      criteria or
                      resetting
                      filters
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              posts.map(
                (
                  post,
                  index,
                ) => {
                  const isSelected =
                    selectedPostIds.includes(
                      post.id,
                    );

                  const isMenuOpen =
                    activeDropdownId ===
                    post.id;

                  const category =
                    post.category ||
                    'Uncategorized';

                  const authorName =
                    post.author
                      ?.name ||
                    'Unknown Author';

                  const authorAvatar =
                    post.author
                      ?.avatar ||
                    '';

                  const language =
                    post.language ||
                    'EN';

                  return (
                    <tr
                      key={
                        post.id
                      }
                      className={`group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40 ${
                        isSelected
                          ? 'bg-blue-50/30 dark:bg-blue-500/5'
                          : ''
                      }`}
                    >

                      {/* CHECKBOX */}

                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={
                            isSelected
                          }
                          onChange={() =>
                            onToggleSelectPost(
                              post.id,
                            )
                          }
                          className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      {/* SN */}

                      <td className="px-2 py-3 text-xs font-medium text-slate-400 dark:text-gray-500">
                        {(currentPage -
                          1) *
                          perPage +
                          index +
                          1}
                      </td>

                      {/* TITLE */}

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">

                          {/* THUMBNAIL */}

                          <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-[#334155] dark:bg-slate-800">

                            {post.thumbnail ? (
                              <img
                                src={
                                  post.thumbnail
                                }
                                alt={
                                  post.title
                                }
                                className="h-full w-full object-cover"
                                onError={(
                                  event,
                                ) => {
                                  event.currentTarget.style.display =
                                    'none';
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-slate-400 dark:text-gray-500">
                                No image
                              </div>
                            )}
                          </div>

                          {/* TITLE */}

                          <div className="flex min-w-0 max-w-md flex-col">

                            <span
                              onClick={() =>
                                onViewPost(
                                  post,
                                )
                              }
                              className="cursor-pointer line-clamp-1 text-[13px] font-semibold leading-snug text-slate-900 transition-colors hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
                              title={
                                post.title
                              }
                            >
                              {post.title ||
                                'Untitled'}
                            </span>

                            {post.isFeatured && (
                              <div className="mt-1">
                                <Badge
                                  variant="success"
                                  size="xs"
                                >
                                  Featured
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* AUTHOR */}

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">

                          {authorAvatar ? (
                            <img
                              src={
                                authorAvatar
                              }
                              alt={
                                authorName
                              }
                              className="h-7 w-7 shrink-0 rounded-full border border-slate-200 object-cover dark:border-[#334155]"
                              onError={(
                                event,
                              ) => {
                                event.currentTarget.style.display =
                                  'none';
                              }}
                            />
                          ) : (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                              {getInitials(
                                authorName,
                              )}
                            </div>
                          )}

                          <span className="text-xs font-medium text-slate-800 dark:text-gray-200">
                            {
                              authorName
                            }
                          </span>
                        </div>
                      </td>

                      {/* CATEGORY */}

                      <td className="px-4 py-3">
                        <Badge
                          variant={getCategoryBadgeVariant(
                            category,
                          )}
                          size="xs"
                        >
                          {
                            category
                          }
                        </Badge>
                      </td>

                      {/* LANGUAGE */}

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-gray-300">
                          <span className="text-sm">
                            {LANGUAGE_FLAG[
                              language
                            ] ??
                              '🌐'}
                          </span>

                          <span>
                            {
                              language
                            }
                          </span>
                        </div>
                      </td>

                      {/* HOMEPAGE */}

                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            onToggleHomepage(
                              post.id,
                            )
                          }
                          className={`cursor-pointer rounded-full p-1.5 transition-transform hover:scale-110 ${
                            post.showHomepage
                              ? 'bg-emerald-50 text-emerald-600 hover:text-emerald-700 dark:bg-emerald-500/10'
                              : 'bg-red-50 text-red-500 hover:text-red-600 dark:bg-red-500/10'
                          }`}
                          title={
                            post.showHomepage
                              ? 'Visible on Homepage'
                              : 'Hidden from Homepage'
                          }
                        >
                          {post.showHomepage ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      {/* POPULAR */}

                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            onTogglePopular(
                              post.id,
                            )
                          }
                          className={`cursor-pointer rounded-full p-1.5 transition-transform hover:scale-110 ${
                            post.isPopular
                              ? 'bg-amber-50 text-amber-500 hover:bg-amber-100/80 dark:bg-amber-500/10'
                              : 'bg-slate-50 text-slate-300 hover:bg-slate-100 hover:text-slate-400 dark:bg-slate-800 dark:text-gray-600 dark:hover:bg-slate-700'
                          }`}
                          title={
                            post.isPopular
                              ? 'Marked as Popular'
                              : 'Click to make Popular'
                          }
                        >
                          <Star
                            className={`h-4 w-4 ${
                              post.isPopular
                                ? 'fill-amber-400 text-amber-500'
                                : ''
                            }`}
                          />
                        </button>
                      </td>

                      {/* STATUS */}

                      <td className="px-4 py-3">
                        <Badge
                          variant={getStatusVariant(
                            post.status,
                          )}
                          size="xs"
                        >
                          {post.status ||
                            'Unknown'}
                        </Badge>
                      </td>

                      {/* DATE */}

                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-gray-400">

                        {post.publishedDate &&
                        post.publishedDate !==
                          '—' ? (
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-gray-200">
                              {
                                post.publishedDate
                              }
                            </div>

                            {post.publishedTime && (
                              <div className="text-[11px] text-slate-400 dark:text-gray-500">
                                {
                                  post.publishedTime
                                }
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="font-bold text-slate-300 dark:text-gray-600">
                            —
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-4 py-3 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">

                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() =>
                              onEditPost(
                                post,
                              )
                            }
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-blue-600 shadow-2xs transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-[#334155] dark:hover:bg-blue-500/10"
                            title="Edit Post"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          {/* PREVIEW */}

                          <button
                            type="button"
                            onClick={() =>
                              onViewPost(
                                post,
                              )
                            }
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-800 dark:border-[#334155] dark:text-gray-400 dark:hover:bg-slate-700/50 dark:hover:text-gray-100"
                            title="Preview Post"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {/* MORE */}

                          <div className="relative">

                            <button
                              type="button"
                              onClick={() =>
                                setActiveDropdownId(
                                  isMenuOpen
                                    ? null
                                    : post.id,
                                )
                              }
                              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-800 dark:border-[#334155] dark:text-gray-400 dark:hover:bg-slate-700/50 dark:hover:text-gray-100"
                              title="More Actions"
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </button>

                            {isMenuOpen && (
                              <div
                                ref={
                                  dropdownRef
                                }
                                className="absolute right-0 z-30 mt-1.5 w-44 animate-fade-in rounded-xl border border-slate-200 bg-white py-1.5 text-left text-xs shadow-xl dark:border-[#334155] dark:bg-[#1E293B]"
                              >

                                {/* FEATURED */}

                                <button
                                  type="button"
                                  onClick={() => {
                                    onToggleFeatured(
                                      post.id,
                                    );

                                    setActiveDropdownId(
                                      null,
                                    );
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-slate-700/50"
                                >
                                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />

                                  <span>
                                    {post.isFeatured
                                      ? 'Unmark Featured'
                                      : 'Mark Featured'}
                                  </span>
                                </button>

                                {/* DUPLICATE */}

                                <button
                                  type="button"
                                  onClick={() => {
                                    onDuplicatePost(
                                      post,
                                    );

                                    setActiveDropdownId(
                                      null,
                                    );
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-slate-700/50"
                                >
                                  <Copy className="h-3.5 w-3.5 text-blue-500" />

                                  <span>
                                    Duplicate Post
                                  </span>
                                </button>

                                <div className="my-1 border-t border-slate-100 dark:border-[#334155]" />

                                {/* STATUS TITLE */}

                                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                                  Set Status
                                </div>

                                {/* STATUS OPTIONS */}

                                {(
                                  [
                                    'Published',
                                    'Draft',
                                    'Scheduled',
                                    'Archived',
                                  ] as PostStatus[]
                                ).map(
                                  (
                                    status,
                                  ) => (
                                    <button
                                      key={
                                        status
                                      }
                                      type="button"
                                      onClick={() => {
                                        onChangeStatus(
                                          post.id,
                                          status,
                                        );

                                        setActiveDropdownId(
                                          null,
                                        );
                                      }}
                                      className={`flex w-full items-center justify-between px-3 py-1 text-left ${
                                        post.status ===
                                        status
                                          ? 'bg-blue-50/40 font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                                          : 'text-slate-600 hover:bg-slate-50 dark:text-gray-400 dark:hover:bg-slate-700/50'
                                      }`}
                                    >
                                      <span>
                                        {
                                          status
                                        }
                                      </span>

                                      {post.status ===
                                        status && (
                                        <Check className="h-3 w-3" />
                                      )}
                                    </button>
                                  ),
                                )}

                                <div className="my-1 border-t border-slate-100 dark:border-[#334155]" />

                                {/* DELETE */}

                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeletePost(
                                      post.id,
                                    );

                                    setActiveDropdownId(
                                      null,
                                    );
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-1.5 font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />

                                  <span>
                                    Delete Post
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                },
              )
            )}
          </tbody>
        </table>
      </div>

      {/* =================================================
          PAGINATION
      ================================================= */}

      <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-white px-6 py-4 dark:border-[#334155] dark:bg-[#1E293B] sm:flex-row">

        <div className="text-xs font-medium text-slate-500 dark:text-gray-400 sm:text-sm">
          Showing{' '}
          <span className="font-semibold text-slate-900 dark:text-gray-100">
            {startItem}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-900 dark:text-gray-100">
            {endItem}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-slate-900 dark:text-gray-100">
            {totalResults}
          </span>{' '}
          results
        </div>

        <div className="flex items-center gap-1">

          {/* PREVIOUS */}

          <button
            type="button"
            onClick={() =>
              onPageChange(
                currentPage - 1,
              )
            }
            disabled={
              currentPage <= 1
            }
            className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 shadow-2xs transition-colors dark:border-[#334155] ${
              currentPage <= 1
                ? 'cursor-not-allowed bg-slate-50 text-slate-300 dark:bg-slate-800/40 dark:text-gray-600'
                : 'cursor-pointer text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-300 dark:hover:bg-slate-700/50 dark:hover:text-gray-100'
            }`}
            aria-label="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* PAGES */}

          {renderPageButtons()}

          {/* NEXT */}

          <button
            type="button"
            onClick={() =>
              onPageChange(
                currentPage + 1,
              )
            }
            disabled={
              currentPage >=
                totalPages ||
              totalPages === 0
            }
            className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 shadow-2xs transition-colors dark:border-[#334155] ${
              currentPage >=
                  totalPages ||
              totalPages === 0
                ? 'cursor-not-allowed bg-slate-50 text-slate-300 dark:bg-slate-800/40 dark:text-gray-600'
                : 'cursor-pointer text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-300 dark:hover:bg-slate-700/50 dark:hover:text-gray-100'
            }`}
            aria-label="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostTable;
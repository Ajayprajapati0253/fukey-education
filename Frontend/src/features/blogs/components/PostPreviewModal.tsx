import React, { useEffect, useState } from 'react';
import {
  X,
  Calendar,
  Eye,
  Globe,
  Sparkles,
  Edit,
} from 'lucide-react';

import type { Post } from '../types/post.types';

import {
  getBlogCategories,
  type BlogCategory,
} from '../../blog-categories/api/blog-category.api';

interface PostPreviewModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (post: Post) => void;
}

interface PostWithBackendFields extends Post {
  blog_category_id?: string | number | null;
  admin_id?: string | number | null;

  translations?: Array<{
    id?: string | number;
    blog_id?: string | number;
    lang_code?: string | null;
    title?: string | null;
    description?: string | null;
    seo_title?: string | null;
    seo_description?: string | null;
  }>;
}

/* =========================================================
   HELPERS
========================================================= */

/**
 * Get the correct translation for the current post.
 *
 * Priority:
 * 1. Post language
 * 2. English
 * 3. First available translation
 */
const getPostTranslation = (
  post: PostWithBackendFields,
) => {
  const translations = Array.isArray(
    post.translations,
  )
    ? post.translations
    : [];

  if (translations.length === 0) {
    return null;
  }

  const postLanguage =
    String(post.language || 'EN')
      .toLowerCase();

  return (
    translations.find(
      (translation) =>
        String(
          translation.lang_code || '',
        ).toLowerCase() ===
        postLanguage,
    ) ||
    translations.find(
      (translation) =>
        String(
          translation.lang_code || '',
        ).toLowerCase() === 'en',
    ) ||
    translations[0]
  );
};

/**
 * Safely convert backend tags into string[].
 *
 * Supports:
 *
 * ["education", "exam"]
 *
 * "[\"education\",\"exam\"]"
 *
 * [{"value":"education"},{"value":"exam"}]
 *
 * "education,exam"
 */
const getTagsArray = (
  tags: unknown,
): string[] => {
  if (Array.isArray(tags)) {
    return tags
      .map((tag: unknown) => {
        if (typeof tag === 'string') {
          return tag.trim();
        }

        if (
          tag &&
          typeof tag === 'object' &&
          'value' in tag
        ) {
          return String(
            (tag as { value?: unknown })
              .value ?? '',
          ).trim();
        }

        return '';
      })
      .filter(Boolean);
  }

  if (typeof tags !== 'string') {
    return [];
  }

  const trimmed = tags.trim();

  if (!trimmed) {
    return [];
  }

  /*
   * Try JSON first.
   */
  try {
    const parsed = JSON.parse(trimmed);

    if (Array.isArray(parsed)) {
      return parsed
        .map((tag: unknown) => {
          if (typeof tag === 'string') {
            return tag.trim();
          }

          if (
            tag &&
            typeof tag === 'object' &&
            'value' in tag
          ) {
            return String(
              (tag as { value?: unknown })
                .value ?? '',
            ).trim();
          }

          return '';
        })
        .filter(Boolean);
    }
  } catch {
    // Not JSON.
  }

  /*
   * Fallback: comma-separated tags.
   */
  return trimmed
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
};

/**
 * Convert HTML content into a safe-ish display value.
 *
 * The backend content is expected to be HTML.
 *
 * Example:
 * <p>Hello</p>
 * <h2>Heading</h2>
 */
const getArticleContent = (
  post: PostWithBackendFields,
): string => {
  const translation =
    getPostTranslation(post);

  /*
   * First use normalized frontend content.
   */
  if (
    typeof post.content === 'string' &&
    post.content.trim()
  ) {
    return post.content;
  }

  /*
   * Then use backend translation description.
   */
  if (
    typeof translation?.description ===
      'string' &&
    translation.description.trim()
  ) {
    return translation.description;
  }

  return '';
};

/* =========================================================
   COMPONENT
========================================================= */

export const PostPreviewModal: React.FC<
  PostPreviewModalProps
> = ({
  post,
  isOpen,
  onClose,
  onEdit,
}) => {
  const [categories, setCategories] =
    useState<BlogCategory[]>([]);

  const [categoriesLoading, setCategoriesLoading] =
    useState(false);

  /* =======================================================
     LOAD BLOG CATEGORIES
  ======================================================= */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;

    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);

        const response =
          await getBlogCategories(
            1,
            1000,
          );

        if (!cancelled) {
          setCategories(
            response?.data || [],
          );
        }
      } catch (error) {
        console.error(
          'Failed to load blog categories:',
          error,
        );

        if (!cancelled) {
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  /* =======================================================
     CLOSED
  ======================================================= */

  if (!isOpen || !post) {
    return null;
  }

  /* =======================================================
     BACKEND POST
  ======================================================= */

  const backendPost =
    post as PostWithBackendFields;

  /* =======================================================
     CATEGORY
  ======================================================= */

  const getCategoryTitle = (
    category: BlogCategory,
  ): string => {
    const englishTranslation =
      category.translations?.find(
        (translation) =>
          translation.lang_code
            ?.toLowerCase() === 'en',
      );

    return (
      englishTranslation?.title ||
      category.translations?.[0]?.title ||
      category.slug ||
      'Uncategorized'
    );
  };

  const blogCategoryId =
    backendPost.blog_category_id
      ? String(
          backendPost.blog_category_id,
        )
      : '';

  const selectedCategory =
    blogCategoryId
      ? categories.find(
          (category) =>
            String(category.id) ===
            blogCategoryId,
        )
      : undefined;

  const categoryName =
    selectedCategory
      ? getCategoryTitle(
          selectedCategory,
        )
      : backendPost.category ||
        'Uncategorized';

  /* =======================================================
     TRANSLATION
  ======================================================= */

  const translation =
    getPostTranslation(
      backendPost,
    );

  /* =======================================================
     ARTICLE CONTENT
  ======================================================= */

  const articleContent =
    getArticleContent(
      backendPost,
    );

  /* =======================================================
     TAGS
  ======================================================= */

  const tags = getTagsArray(
    backendPost.tags,
  );

  /* =======================================================
     TITLE
  ======================================================= */

  const articleTitle =
    backendPost.title ||
    translation?.title ||
    'Untitled';

  /* =======================================================
     EXCERPT
  ======================================================= */

  const articleExcerpt =
    backendPost.excerpt ||
    translation?.seo_description ||
    '';

  /* =======================================================
     AUTHOR
  ======================================================= */

  const authorName =
    backendPost.author?.name ||
    'Unknown Author';

  const authorRole =
    backendPost.author?.role ||
    'Content Author';

  const authorAvatar =
    backendPost.author?.avatar ||
    '/images/default-avatar.png';

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-xs animate-fade-in sm:p-6">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-[#334155] dark:bg-slate-800/40">

          <div className="flex items-center gap-2">

            {/* CATEGORY */}

            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
              {categoriesLoading
                ? 'Loading...'
                : categoryName}
            </span>

            {/* FEATURED */}

            {backendPost.isFeatured && (
              <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Sparkles className="h-2.5 w-2.5" />
                Featured
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">

            {/* EDIT */}

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(post);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </button>

            {/* CLOSE */}

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700/50 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="flex-1 space-y-6 overflow-y-auto p-6">

          {/* TITLE */}

          <h1 className="text-xl font-bold leading-tight text-slate-900 dark:text-gray-100 sm:text-2xl">
            {articleTitle}
          </h1>

          {/* =================================================
              AUTHOR / META
          ================================================= */}

          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-slate-100 py-3 text-xs text-slate-500 dark:border-[#334155] dark:text-gray-400">

            {/* AUTHOR */}

            <div className="flex items-center gap-3">

              <img
                src={authorAvatar}
                alt={authorName}
                className="h-10 w-10 rounded-full border border-slate-200 object-cover dark:border-[#334155]"
                onError={(event) => {
                  event.currentTarget.src =
                    '/images/default-avatar.png';
                }}
              />

              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-gray-100">
                  {authorName}
                </div>

                <div className="text-slate-400 dark:text-gray-500">
                  {authorRole}
                </div>
              </div>
            </div>

            {/* META */}

            <div className="flex items-center gap-4">

              {/* DATE */}

              <div className="flex items-center gap-1 text-slate-600 dark:text-gray-300">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />

                <span>
                  {backendPost.publishedDate ||
                    'Not published'}
                </span>
              </div>

              {/* VIEWS */}

              <div className="flex items-center gap-1 text-slate-600 dark:text-gray-300">
                <Eye className="h-3.5 w-3.5 text-slate-400" />

                <span>
                  {Number(
                    backendPost.views || 0,
                  ).toLocaleString()}{' '}
                  views
                </span>
              </div>

              {/* LANGUAGE */}

              <div className="flex items-center gap-1 text-slate-600 dark:text-gray-300">
                <Globe className="h-3.5 w-3.5 text-slate-400" />

                <span>
                  {backendPost.language ||
                    'EN'}
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              THUMBNAIL
          ================================================= */}

          <div className="h-64 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-[#334155] dark:bg-slate-800">

            {backendPost.thumbnail ? (
              <img
                src={
                  backendPost.thumbnail
                }
                alt={articleTitle}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display =
                    'none';
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-slate-400 dark:text-slate-500">
                No image available
              </div>
            )}
          </div>

          {/* =================================================
              EXCERPT
          ================================================= */}

          {articleExcerpt && (
            <div className="rounded-xl border-l-4 border-blue-500 bg-slate-50 p-4 text-sm italic leading-relaxed text-slate-700 dark:bg-slate-800/40 dark:text-gray-300">
              "{articleExcerpt}"
            </div>
          )}

          {/* =================================================
              ACTUAL BLOG CONTENT
          ================================================= */}

          <div>
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
              Article Content
            </div>

            {articleContent ? (
              <div
                className="
                  prose
                  prose-sm
                  max-w-none
                  text-slate-800
                  dark:prose-invert
                  dark:text-gray-300

                  prose-headings:text-slate-900
                  dark:prose-headings:text-gray-100

                  prose-p:text-slate-700
                  dark:prose-p:text-gray-300

                  prose-a:text-blue-600
                  dark:prose-a:text-blue-400

                  prose-strong:text-slate-900
                  dark:prose-strong:text-gray-100

                  prose-li:text-slate-700
                  dark:prose-li:text-gray-300
                "
                dangerouslySetInnerHTML={{
                  __html:
                    articleContent,
                }}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-400 dark:border-[#334155] dark:bg-slate-800/40 dark:text-slate-500">
                No article content
                available.
              </div>
            )}
          </div>

          {/* =================================================
              TAGS
          ================================================= */}

          {tags.length > 0 && (
            <div className="border-t border-slate-100 pt-4 dark:border-[#334155]">

              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                Tags & Topics
              </div>

              <div className="flex flex-wrap gap-1.5">
                {tags.map(
                  (tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-gray-300"
                    >
                      #{tag}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3 text-xs text-slate-500 dark:border-[#334155] dark:bg-slate-800/40 dark:text-gray-400">

          <span>
            Slug: /blogs/
            {backendPost.slug}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostPreviewModal;
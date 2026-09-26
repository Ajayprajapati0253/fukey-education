import React, { useEffect, useState } from 'react';
import {
  X,
  Image as ImageIcon,
  Calendar,
  Clock,
  Tag as TagIcon,
  Save,
  Plus,
} from 'lucide-react';

import type {
  Post,
  PostCategory,
  PostLanguage,
  PostStatus,
} from '../types/post.types';

import { getBlogCategories } from '../../blog-categories/api/blog-category.api';
import { get } from '../../../services/api';

interface BlogCategoryOption {
  id: string;
  slug: string;
  title: string;
  status?: boolean;
}

interface PostAuthorOption {
  id?: string;
  name: string;
  avatar?: string;
  role?: string;
  email?: string;
}
interface PostTranslation {
  id?: string;
  blog_id?: string;
  lang_code: string;
  title?: string | null;
  description?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
}

interface PostWithTranslations extends Post {
  blog_category_id?: string | null;
  admin_id?: string | null;
  translations?: PostTranslation[];
}

const getPostTranslation = (
  post: PostWithTranslations,
  language?: string,
): PostTranslation | undefined => {
  const translations =
    post.translations || [];

  if (!translations.length) {
    return undefined;
  }

  // First try currently selected language
  if (language) {
    const selected =
      translations.find(
        (translation) =>
          translation.lang_code?.toLowerCase() ===
          language.toLowerCase(),
      );

    if (selected) {
      return selected;
    }
  }

  // Then English
  const english =
    translations.find(
      (translation) =>
        translation.lang_code?.toLowerCase() ===
        'en',
    );

  if (english) {
    return english;
  }

  // Finally first available translation
  return translations[0];
};
interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Partial<Post>) => void;
  initialPost?: PostWithTranslations | null;

  /**
   * Categories and authors must come from the API.
   * No mock/static data is used here.
   */
  categories?: BlogCategoryOption[];

  authors?: PostAuthorOption[];
}

export const PostModal: React.FC<PostModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPost,
  categories = [],
  authors = [],
}) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] =
    useState<PostCategory | ''>('');
  const [authorName, setAuthorName] =
    useState('');

  const [language, setLanguage] =
    useState<PostLanguage>('EN');

  const [status, setStatus] =
    useState<PostStatus>('Draft');

  const [showHomepage, setShowHomepage] =
    useState(false);

  const [isPopular, setIsPopular] =
    useState(false);

  const [isFeatured, setIsFeatured] =
    useState(false);

  const [thumbnail, setThumbnail] =
    useState('');

  const [publishedDate, setPublishedDate] =
    useState('');

  const [publishedTime, setPublishedTime] =
    useState('');

  const [excerpt, setExcerpt] =
    useState('');

  const [content, setContent] =
    useState('');

  const [tags, setTags] =
    useState<string[]>([]);

  const [tagInput, setTagInput] =
    useState('');

    const [blogCategories, setBlogCategories] =
  useState<BlogCategoryOption[]>([]);

const [categoriesLoading, setCategoriesLoading] =
  useState(false);


  useEffect(() => {
  if (!isOpen) {
    return;
  }

  const loadBlogCategories = async () => {
    try {
      setCategoriesLoading(true);

      const response = await getBlogCategories(
        1,
        1000,
      );

      const activeCategories =
        (response?.data || [])
          .filter(
            (category) =>
              category.status !== false,
          )
          .map((category) => {
            const translation =
              category.translations?.[0];

            return {
              id: String(category.id),
              slug: category.slug,
              title:
                translation?.title ||
                category.slug,
            };
          });

      setBlogCategories(activeCategories);
    } catch (error) {
      console.error(
        'Failed to load blog categories:',
        error,
      );

      setBlogCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  loadBlogCategories();
}, [isOpen]);

  /* =========================
     Load/Edit Form Data
  ========================= */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialPost) {
      setTitle(initialPost.title || '');

      setSlug(initialPost.slug || '');

      setCategory(
        (initialPost.category as PostCategory) ||
          '',
      );

      setAuthorName(
        initialPost.author?.name || '',
      );

      setLanguage(
        initialPost.language || 'EN',
      );

      setStatus(
        initialPost.status || 'Draft',
      );

      setShowHomepage(
        Boolean(initialPost.showHomepage),
      );

      setIsPopular(
        Boolean(initialPost.isPopular),
      );

      setIsFeatured(
        Boolean(initialPost.isFeatured),
      );

      setThumbnail(
        initialPost.thumbnail || '',
      );

      setPublishedDate(
        initialPost.publishedDate &&
        initialPost.publishedDate !== '—'
          ? initialPost.publishedDate
          : '',
      );

      setPublishedTime(
        initialPost.publishedTime &&
        initialPost.publishedTime !== '—'
          ? initialPost.publishedTime
          : '',
      );

        const translation =
          getPostTranslation(
            initialPost,
            initialPost.language,
          );

        setExcerpt(
          initialPost.excerpt ||
            '',
        );

        setContent(
          initialPost.content ||
            translation?.description ||
            '',
        );

      setTags(
        Array.isArray(initialPost.tags)
          ? initialPost.tags
          : [],
      );

      setTagInput('');
    } else {
      /*
       * Empty defaults for a new post.
       * No mock/default content.
       */
      setTitle('');
      setSlug('');
      setCategory('');
      setAuthorName('');
      setLanguage('EN');
      setStatus('Draft');
      setShowHomepage(false);
      setIsPopular(false);
      setIsFeatured(false);
      setThumbnail('');
      setPublishedDate('');
      setPublishedTime('');
      setExcerpt('');
      setContent('');
      setTags([]);
      setTagInput('');
    }
  }, [initialPost, isOpen]);

  /* =========================
     Title / Slug
  ========================= */

  const handleTitleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const val = e.target.value;

    setTitle(val);

    if (!initialPost) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .slice(0, 50),
      );
    }
  };

  /* =========================
     Tags
  ========================= */

  const handleAddTag = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      e.key !== 'Enter' &&
      e.key !== ','
    ) {
      return;
    }

    e.preventDefault();

    const value = tagInput.trim();

    if (!value) {
      return;
    }

    if (
      tags.some(
        (tag) =>
          tag.toLowerCase() ===
          value.toLowerCase(),
      )
    ) {
      setTagInput('');
      return;
    }

    setTags((prev) => [
      ...prev,
      value,
    ]);

    setTagInput('');
  };

  const handleRemoveTag = (
    tagToRemove: string,
  ) => {
    setTags((prev) =>
      prev.filter(
        (tag) => tag !== tagToRemove,
      ),
    );
  };

  /* =========================
     Submit
  ========================= */

  const handleSubmit = (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    const selectedAuthor =
      authors.find(
        (author) =>
          author.name === authorName,
      );

    /*
     * Send the selected API-backed
     * author/category information.
     *
     * Existing Post structure is preserved
     * so PostModal remains compatible with
     * the current page/table.
     */
    onSave({
      title: title.trim(),

      slug:
        slug.trim() ||
        title
          .trim()
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .slice(0, 50),

      category,

      author:
        selectedAuthor || {
          name: authorName,
        },

      language,

      status,

      showHomepage,

      isPopular,

      isFeatured,

      thumbnail: thumbnail.trim(),

      publishedDate:
        status === 'Draft'
          ? '—'
          : publishedDate,

      publishedTime:
        status === 'Draft'
          ? '—'
          : publishedTime,

      excerpt: excerpt.trim(),

      content,

      tags,
    });

    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-xs animate-fade-in sm:p-6">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">

        {/* =========================
            Header
        ========================= */}

        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-6 py-4 dark:border-[#334155] dark:bg-slate-800/40">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100">
              {initialPost
                ? 'Edit Post'
                : 'Add New Post'}
            </h2>

            <p className="text-xs text-slate-500 dark:text-gray-400">
              {initialPost
                ? 'Update publication details and content.'
                : 'Create and configure a new educational article.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700/50 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* =========================
            Form
        ========================= */}

        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-5 overflow-y-auto p-6 text-sm"
        >

          {/* Post Title */}

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
              Post Title{' '}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter post title..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#334155] dark:bg-[#0F172A] dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Slug + Category */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                URL Slug
              </label>

              <input
                type="text"
                value={slug}
                onChange={(e) =>
                  setSlug(e.target.value)
                }
                placeholder="post-url-slug"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-[#334155] dark:bg-[#0F172A] dark:text-gray-200 dark:focus:bg-[#0F172A]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                Category
              </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value as PostCategory,
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#334155] dark:bg-[#0F172A] dark:text-gray-200"
                >
                  <option value="">
                    {categoriesLoading
                      ? 'Loading categories...'
                      : 'Select Category'}
                  </option>

                  {!categoriesLoading &&
                    blogCategories.map((categoryItem) => (
                      <option
                        key={categoryItem.id}
                        value={categoryItem.id}
                      >
                        {categoryItem.title}
                      </option>
                    ))}
                </select>
            </div>
          </div>

          {/* Author + Language + Status */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                Author
              </label>

              <select
                value={authorName}
                onChange={(e) =>
                  setAuthorName(
                    e.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#334155] dark:bg-[#0F172A] dark:text-gray-200"
              >
                <option value="">
                  Select Author
                </option>

                {authors.map(
                  (author) => (
                    <option
                      key={
                        author.id ??
                        author.name
                      }
                      value={
                        author.name
                      }
                    >
                      {author.name}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                Language
              </label>

              <select
                value={language}
                onChange={(e) =>
                  setLanguage(
                    e.target
                      .value as PostLanguage,
                  )
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#334155] dark:bg-[#0F172A] dark:text-gray-200"
              >
                <option value="EN">
                  English (EN)
                </option>

                <option value="HI">
                  Hindi (HI)
                </option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target
                      .value as PostStatus,
                  )
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#334155] dark:bg-[#0F172A] dark:text-gray-200"
              >
                <option value="Published">
                  Published
                </option>

                <option value="Draft">
                  Draft
                </option>

                <option value="Scheduled">
                  Scheduled
                </option>

                <option value="Archived">
                  Archived
                </option>
              </select>
            </div>
          </div>

          {/* Publication Date/Time */}

          {status !== 'Draft' && (
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200/80 bg-slate-50 p-3.5 dark:border-[#334155] dark:bg-slate-800/40 sm:grid-cols-2">

              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-gray-400">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />

                  Publication Date
                </label>

                <input
                  type="text"
                  value={publishedDate}
                  onChange={(e) =>
                    setPublishedDate(
                      e.target.value,
                    )
                  }
                  placeholder="Enter publication date"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-[#334155] dark:bg-[#0F172A] dark:text-gray-200"
                />
              </div>

              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-gray-400">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />

                  Publication Time
                </label>

                <input
                  type="text"
                  value={publishedTime}
                  onChange={(e) =>
                    setPublishedTime(
                      e.target.value,
                    )
                  }
                  placeholder="Enter publication time"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-[#334155] dark:bg-[#0F172A] dark:text-gray-200"
                />
              </div>
            </div>
          )}

          {/* Thumbnail */}

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
              <ImageIcon className="h-3.5 w-3.5 text-slate-400" />

              Thumbnail Image URL
            </label>

            <div className="flex gap-3">

              <input
                type="url"
                value={thumbnail}
                onChange={(e) =>
                  setThumbnail(
                    e.target.value,
                  )
                }
                placeholder="https://example.com/image.jpg"
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 dark:border-[#334155] dark:bg-[#0F172A] dark:text-gray-200"
              />

              <div className="h-10 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-[#334155] dark:bg-slate-800">

                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (
                        e.currentTarget
                      ).style.display =
                        'none';
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-slate-400" />
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Excerpt */}

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
              Summary / Excerpt
            </label>

            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) =>
                setExcerpt(
                  e.target.value,
                )
              }
              placeholder="Brief summary displayed in post listings and social cards..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#334155] dark:bg-[#0F172A] dark:text-gray-200"
            />
          </div>

          {/* Content */}

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
              Article Content
            </label>

            <textarea
              rows={5}
              value={content}
              onChange={(e) =>
                setContent(
                  e.target.value,
                )
              }
              placeholder="Write or paste the full educational post content here..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 font-sans text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#334155] dark:bg-[#0F172A] dark:text-gray-200"
            />
          </div>

          {/* Tags */}

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
              <TagIcon className="h-3.5 w-3.5 text-slate-400" />

              Tags
              <span className="font-normal normal-case tracking-normal text-slate-400">
                (Press Enter to add)
              </span>
            </label>

            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-[#334155] dark:bg-slate-800/40">

              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:border-[#334155] dark:bg-[#1E293B] dark:text-gray-300"
                >
                  #{tag}

                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveTag(
                        tag,
                      )
                    }
                    className="text-slate-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={tagInput}
                onChange={(e) =>
                  setTagInput(
                    e.target.value,
                  )
                }
                onKeyDown={
                  handleAddTag
                }
                placeholder="Add tag..."
                className="min-w-[80px] flex-1 bg-transparent px-2 py-0.5 text-xs text-slate-700 outline-none dark:text-gray-200"
              />
            </div>
          </div>

          {/* Display & Highlights */}

          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[#334155] dark:bg-slate-800/40">

            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
              Display & Highlights
            </div>

            <div className="flex flex-wrap gap-6 text-xs font-medium text-slate-700 dark:text-gray-300">

              <label className="flex cursor-pointer select-none items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    showHomepage
                  }
                  onChange={(e) =>
                    setShowHomepage(
                      e.target.checked,
                    )
                  }
                  className="h-4 w-4 cursor-pointer rounded accent-blue-600"
                />

                <span>
                  Show on Homepage
                </span>
              </label>

              <label className="flex cursor-pointer select-none items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) =>
                    setIsPopular(
                      e.target.checked,
                    )
                  }
                  className="h-4 w-4 cursor-pointer rounded accent-amber-500"
                />

                <span>
                  Mark as Popular
                  (Star)
                </span>
              </label>

              <label className="flex cursor-pointer select-none items-center gap-2">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) =>
                    setIsFeatured(
                      e.target.checked,
                    )
                  }
                  className="h-4 w-4 cursor-pointer rounded accent-emerald-600"
                />

                <span>
                  Featured Article
                  Badge
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-[#334155]">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-[#334155] dark:bg-[#0F172A] dark:text-gray-300 dark:hover:bg-slate-700/50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white shadow-xs transition-colors hover:bg-blue-700"
            >
              {initialPost ? (
                <>
                  <Save className="h-4 w-4" />

                  <span>
                    Save Changes
                  </span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />

                  <span>
                    Create Post
                  </span>
                </>
              )}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default PostModal;
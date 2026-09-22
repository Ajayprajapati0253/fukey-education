import { useState, useCallback } from 'react';
import type { Post, PostStatus } from '../types/post.types';

const STORAGE_KEY = 'fukey_posts_v1';

function loadPersisted(fallback: Post[]): Post[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function persist(posts: Post[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch {
    // Ignore storage errors
  }
}

export function usePosts(initialPosts: Post[]) {
  const [posts, setPosts] = useState<Post[]>(() => loadPersisted(initialPosts));
  const [isLoading] = useState(false); // TODO: wire to real loading state once posts.api.ts is connected
  const [error] = useState<Error | null>(null); // TODO: wire to real error state once posts.api.ts is connected

  const updateAndPersist = useCallback((next: Post[]) => {
    setPosts(next);
    persist(next);
  }, []);

  const addPost = useCallback(
    (data: Partial<Post>): Post => {
      const newPost: Post = {
        id: `post-${Date.now()}`,
        sn: posts.length + 1,
        title: data.title || 'Untitled Post',
        slug: data.slug || 'untitled',
        thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80',
        author: data.author || {
          name: 'Admin',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        },
        category: data.category || 'Education',
        language: data.language || 'EN',
        showHomepage: data.showHomepage ?? true,
        isPopular: data.isPopular ?? false,
        isFeatured: data.isFeatured ?? false,
        status: data.status || 'Published',
        publishedDate: data.publishedDate || '21 Aug, 2026',
        publishedTime: data.publishedTime || '11:00 AM',
        views: 0,
        commentsCount: 0,
        content: data.content || '',
        excerpt: data.excerpt || '',
        tags: data.tags || ['Education'],
        createdAt: new Date().toISOString(),
      };
      updateAndPersist([newPost, ...posts]);
      return newPost;
    },
    [posts, updateAndPersist]
  );

  const updatePost = useCallback(
    (id: string, data: Partial<Post>) => {
      updateAndPersist(posts.map((p) => (p.id === id ? ({ ...p, ...data } as Post) : p)));
    },
    [posts, updateAndPersist]
  );

  const deletePost = useCallback(
    (id: string) => {
      updateAndPersist(posts.filter((p) => p.id !== id));
    },
    [posts, updateAndPersist]
  );

  const duplicatePost = useCallback(
    (post: Post): Post => {
      const duplicated: Post = {
        ...post,
        id: `post-${Date.now()}`,
        sn: posts.length + 1,
        title: `${post.title} (Copy)`,
        status: 'Draft',
        publishedDate: '—',
        publishedTime: '—',
        createdAt: new Date().toISOString(),
      };
      updateAndPersist([duplicated, ...posts]);
      return duplicated;
    },
    [posts, updateAndPersist]
  );

  const toggleHomepage = useCallback(
    (id: string) => {
      updateAndPersist(posts.map((p) => (p.id === id ? { ...p, showHomepage: !p.showHomepage } : p)));
    },
    [posts, updateAndPersist]
  );

  const togglePopular = useCallback(
    (id: string) => {
      updateAndPersist(posts.map((p) => (p.id === id ? { ...p, isPopular: !p.isPopular } : p)));
    },
    [posts, updateAndPersist]
  );

  const toggleFeatured = useCallback(
    (id: string) => {
      updateAndPersist(posts.map((p) => (p.id === id ? { ...p, isFeatured: !p.isFeatured } : p)));
    },
    [posts, updateAndPersist]
  );

  const changeStatus = useCallback(
    (id: string, status: PostStatus) => {
      updateAndPersist(posts.map((p) => (p.id === id ? { ...p, status } : p)));
    },
    [posts, updateAndPersist]
  );

  const bulkChangeStatus = useCallback(
    (ids: string[], status: PostStatus) => {
      updateAndPersist(posts.map((p) => (ids.includes(p.id) ? { ...p, status } : p)));
    },
    [posts, updateAndPersist]
  );

  const bulkDelete = useCallback(
    (ids: string[]) => {
      updateAndPersist(posts.filter((p) => !ids.includes(p.id)));
    },
    [posts, updateAndPersist]
  );

  return {
    posts,
    isLoading,
    error,
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
  };
}
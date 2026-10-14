import { useState, useEffect, useMemo, useCallback } from 'react';
import { studyMaterialsApi } from '../api/studyMaterialsApi';
import type {
  MaterialFilterState,
  MaterialFormData,
  MaterialStatus,
  MaterialType,
  StudyMaterialItem,
} from '../types';

interface UseStudyMaterialsOptions {
  fixedType?: MaterialType | 'all';
}

export function useStudyMaterials(options: UseStudyMaterialsOptions = {}) {
  const { fixedType } = options;

  const [items, setItems] = useState<StudyMaterialItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const [filters, setFilters] = useState<MaterialFilterState>({
    searchQuery: '',
    type: fixedType || 'all',
    subject: 'All',
    grade: 'All',
    status: 'all',
    difficulty: 'All',
    sortBy: 'order',
    sortOrder: 'asc',
    showArchived: false,
  });

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((current) => (current?.text === text ? null : current));
    }, 3500);
  }, []);

  const loadData = useCallback(() => {
    const data = studyMaterialsApi.getAll();
    setItems([...data]);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Keep type aligned if fixedType changes
  useEffect(() => {
    if (fixedType) {
      setFilters((prev) => ({ ...prev, type: fixedType }));
    }
  }, [fixedType]);

  // Derived filter options based on existing data
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.subject) set.add(i.subject);
    });
    return Array.from(set).sort();
  }, [items]);

  const availableGrades = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.grade) set.add(i.grade);
    });
    return Array.from(set).sort();
  }, [items]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Type filter:
        const targetType = filters.type;
        if (targetType && targetType !== 'all') {
          if (item.type !== targetType) {
            return false;
          }
        }

        // Search query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchChapter = item.chapter.toLowerCase().includes(q);
          const matchSubject = item.subject.toLowerCase().includes(q);
          const matchAuthor = item.author.toLowerCase().includes(q);
          const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchChapter && !matchSubject && !matchAuthor && !matchTags) {
            return false;
          }
        }

        // Subject filter
        if (filters.subject !== 'All' && item.subject !== filters.subject) {
          return false;
        }

        // Grade filter (class 9th, class 10th, class 11th, class 12th)
        if (filters.grade !== 'All') {
          const sel = filters.grade.toLowerCase();
          const itemGrade = item.grade.toLowerCase();
          
          if (sel.includes('9')) {
            if (!itemGrade.includes('9')) return false;
          } else if (sel.includes('10')) {
            if (!itemGrade.includes('10')) return false;
          } else if (sel.includes('11')) {
            if (!itemGrade.includes('11')) return false;
          } else if (sel.includes('12')) {
            if (!itemGrade.includes('12')) return false;
          } else if (item.grade !== filters.grade) {
            return false;
          }
        }

        // Status filter
        if (filters.status !== 'all' && item.status !== filters.status) {
          return false;
        }

        // Archived filter
        if (!filters.showArchived && item.status === 'archived' && filters.status !== 'archived') {
          return false;
        }

        // Difficulty filter
        if (filters.difficulty !== 'All' && item.difficulty !== filters.difficulty) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[filters.sortBy as keyof StudyMaterialItem] ?? 0;
        let valB: any = b[filters.sortBy as keyof StudyMaterialItem] ?? 0;

        if (filters.sortBy === 'downloads') {
          valA = a.downloadCount;
          valB = b.downloadCount;
        } else if (filters.sortBy === 'views') {
          valA = a.viewCount;
          valB = b.viewCount;
        }

        if (typeof valA === 'string') {
          return filters.sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        return filters.sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [items, filters, fixedType]);

  // CRUD Actions
  const createItem = useCallback(
    (formData: MaterialFormData) => {
      const created = studyMaterialsApi.create(formData);
      loadData();
      showToast(`Created "${created.title}" successfully`, 'success');
      return created;
    },
    [loadData, showToast]
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<StudyMaterialItem>) => {
      const updated = studyMaterialsApi.update(id, updates);
      loadData();
      showToast(`Updated "${updated.title}" successfully`, 'success');
      return updated;
    },
    [loadData, showToast]
  );

  const deleteItem = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      studyMaterialsApi.delete(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      loadData();
      showToast(`Deleted "${item?.title || 'Material'}"`, 'info');
    },
    [items, loadData, showToast]
  );

  const bulkDelete = useCallback(
    (ids: string[]) => {
      studyMaterialsApi.bulkDelete(ids);
      setSelectedIds(new Set());
      loadData();
      showToast(`Deleted ${ids.length} selected items`, 'info');
    },
    [loadData, showToast]
  );

  const togglePublish = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      const nextStatus: MaterialStatus = item.status === 'published' ? 'draft' : 'published';
      studyMaterialsApi.setStatus(id, nextStatus);
      loadData();
      showToast(`Material ${nextStatus === 'published' ? 'published' : 'moved to draft'}`, 'success');
    },
    [items, loadData, showToast]
  );

  const toggleArchive = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      const nextStatus: MaterialStatus = item.status === 'archived' ? 'published' : 'archived';
      studyMaterialsApi.setStatus(id, nextStatus);
      loadData();
      showToast(`Material ${nextStatus === 'archived' ? 'archived' : 'restored'}`, 'info');
    },
    [items, loadData, showToast]
  );

  const bulkPublish = useCallback(
    (ids: string[]) => {
      studyMaterialsApi.bulkSetStatus(ids, 'published');
      loadData();
      showToast(`Published ${ids.length} items`, 'success');
    },
    [loadData, showToast]
  );

  const bulkUnpublish = useCallback(
    (ids: string[]) => {
      studyMaterialsApi.bulkSetStatus(ids, 'draft');
      loadData();
      showToast(`Unpublished ${ids.length} items to draft`, 'info');
    },
    [loadData, showToast]
  );

  const bulkArchive = useCallback(
    (ids: string[]) => {
      studyMaterialsApi.bulkSetStatus(ids, 'archived');
      loadData();
      showToast(`Archived ${ids.length} items`, 'info');
    },
    [loadData, showToast]
  );

  const bulkRestore = useCallback(
    (ids: string[]) => {
      studyMaterialsApi.bulkSetStatus(ids, 'published');
      loadData();
      showToast(`Restored ${ids.length} items to published`, 'success');
    },
    [loadData, showToast]
  );

  const replaceFile = useCallback(
    (id: string, fileName: string, fileSize: string, fileFormat: 'pdf' | 'docx' | 'zip' | 'quiz' | 'json') => {
      const updated = studyMaterialsApi.replaceFile(id, fileName, fileSize, fileFormat);
      loadData();
      showToast(`Replaced file with "${fileName}" (${fileSize})`, 'success');
      return updated;
    },
    [loadData, showToast]
  );

  const reorderItems = useCallback(
    (reorderedIds: string[]) => {
      studyMaterialsApi.reorder(reorderedIds);
      loadData();
      showToast(`Items reordered successfully`, 'success');
    },
    [loadData, showToast]
  );

  const resetAllData = useCallback(() => {
    studyMaterialsApi.resetToDefault();
    loadData();
    showToast(`Study materials reset to default sample set`, 'info');
  }, [loadData, showToast]);

  // Selection handlers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.id)));
    }
  }, [filteredItems, selectedIds.size]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Stats calculation across ALL active filters (Type, Subject, Grade, Difficulty, Status, Search)
  const stats = useMemo(() => {
    const scopeItems = items.filter((item) => {
      // Type filter
      if (filters.type && filters.type !== 'all' && item.type !== filters.type) {
        return false;
      }

      // Subject filter
      if (filters.subject !== 'All' && item.subject !== filters.subject) {
        return false;
      }

      // Grade filter (class 9th, class 10th, class 11th, class 12th)
      if (filters.grade !== 'All') {
        const sel = filters.grade.toLowerCase();
        const itemGrade = item.grade.toLowerCase();
        if (sel.includes('9')) {
          if (!itemGrade.includes('9')) return false;
        } else if (sel.includes('10')) {
          if (!itemGrade.includes('10')) return false;
        } else if (sel.includes('11')) {
          if (!itemGrade.includes('11')) return false;
        } else if (sel.includes('12')) {
          if (!itemGrade.includes('12')) return false;
        } else if (item.grade !== filters.grade) {
          return false;
        }
      }

      // Difficulty filter
      if (filters.difficulty !== 'All' && item.difficulty !== filters.difficulty) {
        return false;
      }

      // Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchChapter = item.chapter.toLowerCase().includes(q);
        const matchSubject = item.subject.toLowerCase().includes(q);
        const matchAuthor = item.author.toLowerCase().includes(q);
        const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchChapter && !matchSubject && !matchAuthor && !matchTags) {
          return false;
        }
      }

      return true;
    });

    const isStatusFiltered = filters.status !== 'all';
    const statusTargetItems = isStatusFiltered
      ? scopeItems.filter((i) => i.status === filters.status)
      : scopeItems;

    const total = isStatusFiltered ? statusTargetItems.length : scopeItems.length;
    const published = scopeItems.filter((i) => i.status === 'published').length;
    const drafts = scopeItems.filter((i) => i.status === 'draft').length;
    const archived = scopeItems.filter((i) => i.status === 'archived').length;
    const totalDownloads = statusTargetItems.reduce((acc, i) => acc + (i.downloadCount || 0), 0);
    const totalViews = statusTargetItems.reduce((acc, i) => acc + (i.viewCount || 0), 0);

    return {
      total,
      published,
      drafts,
      archived,
      totalDownloads,
      totalViews,
    };
  }, [items, filters]);

  // Human-readable summary of active filter scope
  const activeFiltersSummary = useMemo(() => {
    const parts: string[] = [];
    if (filters.type && filters.type !== 'all') {
      parts.push(filters.type.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase()));
    }
    if (filters.grade !== 'All') {
      parts.push(filters.grade);
    }
    if (filters.subject !== 'All') {
      parts.push(filters.subject);
    }
    if (filters.difficulty !== 'All') {
      parts.push(`${filters.difficulty} Difficulty`);
    }
    if (filters.status !== 'all') {
      parts.push(`Status: ${filters.status.toUpperCase()}`);
    }
    if (filters.searchQuery.trim()) {
      parts.push(`"${filters.searchQuery.trim()}"`);
    }
    return parts.length > 0 ? parts.join(' • ') : '';
  }, [filters]);

  return {
    items,
    filteredItems,
    selectedIds,
    filters,
    setFilters,
    availableSubjects,
    availableGrades,
    stats,
    activeFiltersSummary,
    toastMessage,
    // Operations
    createItem,
    updateItem,
    deleteItem,
    bulkDelete,
    togglePublish,
    toggleArchive,
    bulkPublish,
    bulkUnpublish,
    bulkArchive,
    bulkRestore,
    replaceFile,
    reorderItems,
    resetAllData,
    // Selection
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    showToast,
  };
}

import { useState, useCallback } from 'react';
import type { Course, CourseStatus } from '../types/course.types';

const STORAGE_KEY = 'fukey_courses_v1';

function loadPersisted(fallback: Course[]): Course[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function persist(courses: Course[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  } catch {
    // Ignore storage errors (e.g. private browsing, quota exceeded)
  }
}

export function useCourses(initialCourses: Course[]) {
  const [courses, setCourses] = useState<Course[]>(() => loadPersisted(initialCourses));
  const [isLoading] = useState(false); // TODO: wire to real loading state once courses.api.ts is connected
  const [error] = useState<Error | null>(null); // TODO: wire to real error state once courses.api.ts is connected

  const updateAndPersist = useCallback((next: Course[]) => {
    setCourses(next);
    persist(next);
  }, []);

  const addCourse = useCallback(
    (data: Omit<Course, 'id' | 'sn' | 'createdDate' | 'createdTime'>): Course => {
      const today = new Date();
      const created: Course = {
        ...data,
        id: `crs-${Date.now().toString().slice(-4)}`,
        sn: courses.length + 1,
        createdDate: today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        createdTime: today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      updateAndPersist([created, ...courses]);
      return created;
    },
    [courses, updateAndPersist]
  );

  const updateCourse = useCallback(
    (updated: Course) => {
      updateAndPersist(courses.map((c) => (c.id === updated.id ? updated : c)));
    },
    [courses, updateAndPersist]
  );

  const deleteCourse = useCallback(
    (id: string) => {
      updateAndPersist(courses.filter((c) => c.id !== id));
    },
    [courses, updateAndPersist]
  );

  const bulkUpdateStatus = useCallback(
    (ids: string[], status: CourseStatus) => {
      updateAndPersist(courses.map((c) => (ids.includes(c.id) ? { ...c, status } : c)));
    },
    [courses, updateAndPersist]
  );

  const bulkDelete = useCallback(
    (ids: string[]) => {
      updateAndPersist(courses.filter((c) => !ids.includes(c.id)));
    },
    [courses, updateAndPersist]
  );

  return {
    courses,
    isLoading,
    error,
    addCourse,
    updateCourse,
    deleteCourse,
    bulkUpdateStatus,
    bulkDelete,
  };
}
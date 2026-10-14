import type { FreeCourse, FreeCourseFiltersState, FreeCourseKPIs, EnrolledStudent } from '../types/free-course.types';
import { INITIAL_FREE_COURSES, INITIAL_STUDENTS } from '../data/InitialFreeCourses';

const STORAGE_KEY = 'fukey_free_courses_db_v1';

// Local storage helper
const getStoredCourses = (): FreeCourse[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FREE_COURSES));
      return INITIAL_FREE_COURSES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_FREE_COURSES;
  }
};

const saveStoredCourses = (courses: FreeCourse[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  } catch (e) {
    console.error('Failed to save courses to localStorage', e);
  }
};

export const freeCoursesApi = {
  async getFreeCourses(): Promise<FreeCourse[]> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return getStoredCourses();
  },

  async getFreeCourseById(id: string): Promise<FreeCourse | null> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    const courses = getStoredCourses();
    return courses.find((c) => c.id === id) || null;
  },

  async createFreeCourse(
    courseData: Omit<FreeCourse, 'id' | 'createdAt' | 'updatedAt' | 'price' | 'isFreeCourse'>
  ): Promise<FreeCourse> {
    await new Promise((resolve) => setTimeout(resolve, 120));
    const courses = getStoredCourses();
    const newCourse: FreeCourse = {
      ...courseData,
      id: `fc-${Date.now()}`,
      price: 0,
      isFreeCourse: true,
      createdAt: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      updatedAt: 'Just now',
    };
    courses.unshift(newCourse);
    saveStoredCourses(courses);
    return newCourse;
  },

  async updateFreeCourse(id: string, updates: Partial<FreeCourse>): Promise<FreeCourse> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const courses = getStoredCourses();
    const index = courses.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Course with id ${id} not found`);
    }

    const updated: FreeCourse = {
      ...courses[index],
      ...updates,
      price: 0, // Always enforce free course invariant
      isFreeCourse: true,
      updatedAt: 'Just now',
    };
    courses[index] = updated;
    saveStoredCourses(courses);
    return updated;
  },

  async deleteFreeCourse(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const courses = getStoredCourses();
    const filtered = courses.filter((c) => c.id !== id);
    saveStoredCourses(filtered);
    return true;
  },

  async bulkDeleteFreeCourses(ids: string[]): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 120));
    const courses = getStoredCourses();
    const filtered = courses.filter((c) => !ids.includes(c.id));
    saveStoredCourses(filtered);
    return true;
  },

  async duplicateFreeCourse(id: string): Promise<FreeCourse> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const courses = getStoredCourses();
    const target = courses.find((c) => c.id === id);
    if (!target) throw new Error('Target course not found');

    const duplicate: FreeCourse = {
      ...target,
      id: `fc-${Date.now()}`,
      courseCode: `${target.courseCode}-COPY`,
      title: `${target.title} (Copy)`,
      status: 'Draft', // Duplicated course defaults to Draft
      approvalStatus: 'Pending',
      enrollmentsCount: 0,
      activeStudentsCount: 0,
      createdAt: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      updatedAt: 'Just now',
    };

    courses.unshift(duplicate);
    saveStoredCourses(courses);
    return duplicate;
  },

  async publishFreeCourse(id: string): Promise<FreeCourse> {
    return this.updateFreeCourse(id, { status: 'Published', approvalStatus: 'Approved' });
  },

  async unpublishFreeCourse(id: string): Promise<FreeCourse> {
    return this.updateFreeCourse(id, { status: 'Draft' });
  },

  async archiveFreeCourse(id: string): Promise<FreeCourse> {
    return this.updateFreeCourse(id, { status: 'Archived' });
  },

  async restoreFreeCourse(id: string): Promise<FreeCourse> {
    return this.updateFreeCourse(id, { status: 'Published' });
  },

  async bulkUpdateStatus(ids: string[], status: 'Published' | 'Draft' | 'Archived'): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 120));
    const courses = getStoredCourses();
    const updated = courses.map((c) => {
      if (ids.includes(c.id)) {
        return {
          ...c,
          status,
          updatedAt: 'Just now',
        };
      }
      return c;
    });
    saveStoredCourses(updated);
    return true;
  },

  async getEnrolledStudents(courseId: string): Promise<EnrolledStudent[]> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return INITIAL_STUDENTS;
  },

  calculateKPIs(courses: FreeCourse[]): FreeCourseKPIs {
    const totalCourses = courses.length;
    const publishedCount = courses.filter((c) => c.status === 'Published').length;
    const draftCount = courses.filter((c) => c.status === 'Draft').length;
    const archivedCount = courses.filter((c) => c.status === 'Archived').length;
    const pendingReviewCount = courses.filter((c) => c.approvalStatus === 'Pending').length;
    const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrollmentsCount || 0), 0);
    const activeStudents = courses.reduce((sum, c) => sum + (c.activeStudentsCount || 0), 0);

    return {
      totalCourses,
      publishedCount,
      draftCount,
      archivedCount,
      pendingReviewCount,
      totalEnrollments,
      activeStudents,
    };
  },
};

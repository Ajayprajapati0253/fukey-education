import type { CourseModule, Chapter, Lesson, ResourceItem } from '../types/free-course.types';
import { INITIAL_MODULES_MAP } from '../data/InitialFreeCourses';

const CONTENT_STORAGE_KEY = 'fukey_free_courses_modules_v1';

const getStoredModulesMap = (): Record<string, CourseModule[]> => {
  try {
    const raw = localStorage.getItem(CONTENT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(INITIAL_MODULES_MAP));
      return INITIAL_MODULES_MAP;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_MODULES_MAP;
  }
};

const saveModulesMap = (map: Record<string, CourseModule[]>) => {
  try {
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save module map', e);
  }
};

export const freeCourseContentApi = {
  async getModules(courseId: string): Promise<CourseModule[]> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const map = getStoredModulesMap();
    if (!map[courseId]) {
      // Default initial module if none exists
      const defaultModules: CourseModule[] = [
        {
          id: `mod-${Date.now()}`,
          courseId,
          title: 'Module 1: Getting Started & Course Overview',
          order: 1,
          description: 'Fundamental roadmap and course prerequisites.',
          chapters: [
            {
              id: `chap-${Date.now()}`,
              moduleId: `mod-${Date.now()}`,
              title: 'Chapter 1: Course Orientation',
              order: 1,
              lessons: [
                {
                  id: `les-${Date.now()}`,
                  chapterId: `chap-${Date.now()}`,
                  title: 'Welcome to Free Course & Syllabus Walkthrough',
                  order: 1,
                  duration: '20 mins',
                  contentType: 'youtube_live',
                  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  isFreePreview: true,
                  resources: [
                    {
                      id: `res-${Date.now()}`,
                      title: 'Free Course Curriculum Map (PDF)',
                      type: 'pdf',
                      downloadable: true,
                      fileSize: '1.5 MB',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
      map[courseId] = defaultModules;
      saveModulesMap(map);
      return defaultModules;
    }
    return map[courseId];
  },

  async createModule(courseId: string, title: string, description?: string): Promise<CourseModule> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const map = getStoredModulesMap();
    const modules = map[courseId] || [];
    const newModule: CourseModule = {
      id: `mod-${Date.now()}`,
      courseId,
      title,
      order: modules.length + 1,
      description: description || '',
      chapters: [],
    };
    modules.push(newModule);
    map[courseId] = modules;
    saveModulesMap(map);
    return newModule;
  },

  async updateModule(courseId: string, moduleId: string, title: string, description?: string): Promise<CourseModule> {
    const map = getStoredModulesMap();
    const modules = map[courseId] || [];
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) throw new Error('Module not found');
    mod.title = title;
    if (description !== undefined) mod.description = description;
    saveModulesMap(map);
    return mod;
  },

  async deleteModule(courseId: string, moduleId: string): Promise<boolean> {
    const map = getStoredModulesMap();
    if (map[courseId]) {
      map[courseId] = map[courseId].filter((m) => m.id !== moduleId);
      saveModulesMap(map);
    }
    return true;
  },

  async createChapter(courseId: string, moduleId: string, title: string, description?: string): Promise<Chapter> {
    const map = getStoredModulesMap();
    const modules = map[courseId] || [];
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) throw new Error('Module not found');
    const newChapter: Chapter = {
      id: `chap-${Date.now()}`,
      moduleId,
      title,
      order: mod.chapters.length + 1,
      lessons: [],
      description: description || '',
    };
    mod.chapters.push(newChapter);
    saveModulesMap(map);
    return newChapter;
  },

  async updateChapter(courseId: string, moduleId: string, chapterId: string, title: string): Promise<Chapter> {
    const map = getStoredModulesMap();
    const mod = map[courseId]?.find((m) => m.id === moduleId);
    const chap = mod?.chapters.find((c) => c.id === chapterId);
    if (!chap) throw new Error('Chapter not found');
    chap.title = title;
    saveModulesMap(map);
    return chap;
  },

  async deleteChapter(courseId: string, moduleId: string, chapterId: string): Promise<boolean> {
    const map = getStoredModulesMap();
    const mod = map[courseId]?.find((m) => m.id === moduleId);
    if (mod) {
      mod.chapters = mod.chapters.filter((c) => c.id !== chapterId);
      saveModulesMap(map);
    }
    return true;
  },

  async createLesson(
    courseId: string,
    moduleId: string,
    chapterId: string,
    lessonData: Omit<Lesson, 'id' | 'chapterId' | 'order' | 'resources'>
  ): Promise<Lesson> {
    const map = getStoredModulesMap();
    const mod = map[courseId]?.find((m) => m.id === moduleId);
    const chap = mod?.chapters.find((c) => c.id === chapterId);
    if (!chap) throw new Error('Chapter not found');

    const newLesson: Lesson = {
      id: `les-${Date.now()}`,
      chapterId,
      order: chap.lessons.length + 1,
      resources: [],
      ...lessonData,
      isFreePreview: true, // Free course invariant
    };
    chap.lessons.push(newLesson);
    saveModulesMap(map);
    return newLesson;
  },

  async updateLesson(
    courseId: string,
    moduleId: string,
    chapterId: string,
    lessonId: string,
    updates: Partial<Lesson>
  ): Promise<Lesson> {
    const map = getStoredModulesMap();
    const mod = map[courseId]?.find((m) => m.id === moduleId);
    const chap = mod?.chapters.find((c) => c.id === chapterId);
    const lesson = chap?.lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');

    Object.assign(lesson, updates);
    saveModulesMap(map);
    return lesson;
  },

  async deleteLesson(courseId: string, moduleId: string, chapterId: string, lessonId: string): Promise<boolean> {
    const map = getStoredModulesMap();
    const mod = map[courseId]?.find((m) => m.id === moduleId);
    const chap = mod?.chapters.find((c) => c.id === chapterId);
    if (chap) {
      chap.lessons = chap.lessons.filter((l) => l.id !== lessonId);
      saveModulesMap(map);
    }
    return true;
  },

  async addResource(
    courseId: string,
    moduleId: string,
    chapterId: string,
    lessonId: string,
    resource: Omit<ResourceItem, 'id'>
  ): Promise<ResourceItem> {
    const map = getStoredModulesMap();
    const mod = map[courseId]?.find((m) => m.id === moduleId);
    const chap = mod?.chapters.find((c) => c.id === chapterId);
    const lesson = chap?.lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const newRes: ResourceItem = {
      id: `res-${Date.now()}`,
      ...resource,
    };
    lesson.resources.push(newRes);
    saveModulesMap(map);
    return newRes;
  },

  async updateResource(
    courseId: string,
    moduleId: string,
    chapterId: string,
    lessonId: string,
    resourceId: string,
    updates: Partial<ResourceItem>
  ): Promise<ResourceItem> {
    const map = getStoredModulesMap();
    const mod = map[courseId]?.find((m) => m.id === moduleId);
    const chap = mod?.chapters.find((c) => c.id === chapterId);
    const lesson = chap?.lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');
    const resource = lesson.resources?.find((r) => r.id === resourceId);
    if (!resource) throw new Error('Resource not found');

    Object.assign(resource, updates);
    saveModulesMap(map);
    return resource;
  },

  async deleteResource(
    courseId: string,
    moduleId: string,
    chapterId: string,
    lessonId: string,
    resourceId: string
  ): Promise<boolean> {
    const map = getStoredModulesMap();
    const mod = map[courseId]?.find((m) => m.id === moduleId);
    const chap = mod?.chapters.find((c) => c.id === chapterId);
    const lesson = chap?.lessons.find((l) => l.id === lessonId);
    if (lesson) {
      lesson.resources = lesson.resources.filter((r) => r.id !== resourceId);
      saveModulesMap(map);
    }
    return true;
  },
};

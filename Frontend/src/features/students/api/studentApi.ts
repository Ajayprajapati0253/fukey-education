import type { Student, StudentFilterOptions, QuickInsightData, StudentAccessBreakdown } from '../types';
import { INITIAL_STUDENTS, MOCK_QUICK_INSIGHTS, MOCK_ACCESS_BREAKDOWN } from '../data/mockStudents';

const STORAGE_KEY = 'fukey_education_students_v5';

function getStoredStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read students from localStorage', err);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDENTS));
  return INITIAL_STUDENTS;
}

function saveStudents(students: Student[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (err) {
    console.error('Failed to save students to localStorage', err);
  }
}

export const studentApi = {
  async getStudents(
    filters?: Partial<StudentFilterOptions>,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ data: Student[]; total: number; page: number; pageSize: number }> {
    await new Promise((r) => setTimeout(r, 60));

    let students = getStoredStudents();

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      students = students.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.phone.toLowerCase().includes(q) ||
          s.primaryCourse.toLowerCase().includes(q)
      );
    }

    if (filters?.course && filters.course !== 'All Courses') {
      students = students.filter(
        (s) => s.primaryCourse === filters.course || s.courses.some((c) => c.name === filters.course)
      );
    }

    if (filters?.status && filters.status !== 'All Status') {
      students = students.filter((s) => s.status.toLowerCase() === filters.status?.toLowerCase());
    }

    if (filters?.accessPeriod && filters.accessPeriod !== 'All Access Period') {
      if (filters.accessPeriod === '3 Months') {
        students = students.filter((s) => s.accessPeriodLabel.includes('3 Month'));
      } else if (filters.accessPeriod === '6 Months') {
        students = students.filter((s) => s.accessPeriodLabel.includes('6 Month'));
      } else if (filters.accessPeriod === '1 Year') {
        students = students.filter((s) => s.accessPeriodLabel.includes('1 Year'));
      } else if (filters.accessPeriod === '2 Years') {
        students = students.filter((s) => s.accessPeriodLabel.includes('2 Year'));
      }
    }

    if (filters?.progress && filters.progress !== 'All Progress') {
      if (filters.progress === 'below_35') {
        students = students.filter((s) => s.progress < 35);
      } else if (filters.progress === 'below_25') {
        students = students.filter((s) => s.progress < 25);
      } else if (filters.progress === '25_50') {
        students = students.filter((s) => s.progress >= 25 && s.progress <= 50);
      } else if (filters.progress === '50_75') {
        students = students.filter((s) => s.progress > 50 && s.progress <= 75);
      } else if (filters.progress === 'above_75') {
        students = students.filter((s) => s.progress > 75);
      } else if (filters.progress === 'below_10') {
        students = students.filter((s) => s.progress < 10);
      } else if (filters.progress === '10_25') {
        students = students.filter((s) => s.progress >= 10 && s.progress <= 25);
      } else if (filters.progress === 'above_90') {
        students = students.filter((s) => s.progress >= 90);
      } else if (filters.progress === '100') {
        students = students.filter((s) => s.progress === 100);
      }
    }

    const total = students.length;
    const startIndex = (page - 1) * pageSize;
    const data = students.slice(startIndex, startIndex + pageSize);

    return {
      data,
      total,
      page,
      pageSize,
    };
  },

  async getStudentById(id: string): Promise<Student | null> {
    await new Promise((r) => setTimeout(r, 40));
    const students = getStoredStudents();
    return students.find((s) => s.id === id) || null;
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    await new Promise((r) => setTimeout(r, 80));
    const students = getStoredStudents();
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error(`Student with id ${id} not found`);
    }

    const updated = {
      ...students[index],
      ...updates,
    };
    students[index] = updated;
    saveStudents(students);
    return updated;
  },

  async createStudent(studentData: Omit<Student, 'id' | 'sn'>): Promise<Student> {
    await new Promise((r) => setTimeout(r, 80));
    const students = getStoredStudents();
    const newId = (students.length + 1).toString();
    const newStudent: Student = {
      ...studentData,
      id: newId,
      sn: students.length + 1,
    };
    students.unshift(newStudent);
    saveStudents(students);
    return newStudent;
  },

  async deleteStudent(id: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 80));
    let students = getStoredStudents();
    students = students.filter((s) => s.id !== id);
    students = students.map((s, idx) => ({ ...s, sn: idx + 1 }));
    saveStudents(students);
    return true;
  },

  async extendAccess(id: string, additionalYears: number = 1): Promise<Student> {
    await new Promise((r) => setTimeout(r, 60));
    const students = getStoredStudents();
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Student not found');

    const student = students[index];
    const currentYear = parseInt(student.accessUntil.slice(-4)) || 2027;
    const newYear = currentYear + additionalYears;
    const newAccessUntil = student.accessUntil.replace(/\d{4}$/, newYear.toString());

    student.accessUntil = newAccessUntil;
    student.accessPeriodLabel = `(${additionalYears + 1} Years)`;
    student.status = 'Active';

    students[index] = student;
    saveStudents(students);
    return student;
  },

  async getQuickInsights(): Promise<QuickInsightData> {
    return MOCK_QUICK_INSIGHTS;
  },

  async getAccessBreakdown(): Promise<StudentAccessBreakdown> {
    return MOCK_ACCESS_BREAKDOWN;
  },
};
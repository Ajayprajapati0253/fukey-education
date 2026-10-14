import type { Instructor, InstructorKpiData, InstructorFilterParams, InstructorStatus, VerificationStatus } from '../types/instructor';
import { generateMockInstructors, INITIAL_KPI_DATA } from '../data/mockInstructors';

const STORAGE_KEY = 'fukey_instructors_data_v5';

function getStoredInstructors(): Instructor[] {
  try {
    let data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      data = localStorage.getItem('fukey_instructors_data_v4');
    }
    if (data) {
      const parsed: Instructor[] = JSON.parse(data);
      let changed = false;
      const updated = parsed.map((inst) => {
        if (
          inst.name?.toLowerCase().includes('sheetal gupta') ||
          inst.name?.toLowerCase().includes('sheetal') ||
          inst.email?.toLowerCase().includes('sheetal')
        ) {
          changed = true;
          return {
            ...inst,
            name: 'Arya Dube',
            email: 'arya.dube@fukeyeducation.com',
            designation: 'Hindi Instructor (9th-12th)',
            subject: 'Hindi',
            shortBio: (inst.shortBio || '').replace(/sheetal gupta/gi, 'Arya Dube'),
            fullBio: (inst.fullBio || '').replace(/sheetal gupta/gi, 'Arya Dube'),
          };
        }
        return inst;
      });

      // Ensure Arya Dube exists if not present
      if (!updated.some((i) => i.name === 'Arya Dube' || i.id === 'inst-9')) {
        const initial = generateMockInstructors();
        const arya = initial.find((i) => i.id === 'inst-9');
        if (arya) {
          updated.splice(8, 0, arya);
          changed = true;
        }
      }

      if (changed) {
        saveStoredInstructors(updated);
      }
      return updated;
    }
  } catch (e) {
    console.error('Failed to parse stored instructors', e);
  }
  const initial = generateMockInstructors();
  saveStoredInstructors(initial);
  return initial;
}

function saveStoredInstructors(instructors: Instructor[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(instructors));
    localStorage.setItem('fukey_instructors_data_v4', JSON.stringify(instructors));
  } catch (e) {
    console.error('Failed to save instructors to storage', e);
  }
}

export const instructorApi = {
  async getInstructors(params?: Partial<InstructorFilterParams>): Promise<{ data: Instructor[]; total: number; kpi: InstructorKpiData }> {
    // Simulated network delay
    await new Promise((res) => setTimeout(res, 60));
    let list = getStoredInstructors();

    if (params) {
      const { searchQuery, status, verification, course, subject, teachingType, classLevel, medium, sortBy } = params;

      if (searchQuery && searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        list = list.filter(
          (inst) =>
            inst.name.toLowerCase().includes(q) ||
            inst.email.toLowerCase().includes(q) ||
            inst.phone.replace(/\s+/g, '').includes(q.replace(/\s+/g, '')) ||
            inst.subject.toLowerCase().includes(q) ||
            inst.designation.toLowerCase().includes(q)
        );
      }

      if (status && status !== 'All' && status !== 'All Status') {
        list = list.filter((inst) => inst.status.toLowerCase() === status.toLowerCase());
      }

      if (verification && verification !== 'All' && verification !== 'All Verification') {
        list = list.filter((inst) => inst.verification.toLowerCase() === verification.toLowerCase());
      }

      if (course && course !== 'All' && course !== 'All Courses') {
        list = list.filter((inst) =>
          inst.assignedCourses.some((c) => c.name.toLowerCase().includes(course.toLowerCase()))
        );
      }

      if (subject && subject !== 'All' && subject !== 'All Subjects') {
        list = list.filter((inst) => inst.subject.toLowerCase() === subject.toLowerCase());
      }

      if (teachingType && teachingType !== 'All' && teachingType !== 'All Types') {
        list = list.filter((inst) => inst.teachingType.toLowerCase() === teachingType.toLowerCase());
      }

      if (classLevel && classLevel !== 'All' && classLevel !== 'All Classes') {
        const cl = classLevel.replace('Class ', '').replace('th', '').trim().toLowerCase();
        list = list.filter((inst) =>
          inst.classesTaught?.some((c) => c.toLowerCase().includes(cl)) ||
          inst.assignedCourses.some((c) => c.name.toLowerCase().includes(cl) || c.classLevel?.toLowerCase().includes(cl))
        );
      }

      if (medium && medium !== 'All' && medium !== 'All Mediums') {
        list = list.filter((inst) =>
          inst.teachingMedium?.toLowerCase().includes(medium.toLowerCase()) ||
          inst.assignedCourses.some((c) => c.medium?.toLowerCase().includes(medium.toLowerCase()))
        );
      }

      if (sortBy) {
        list = [...list].sort((a, b) => {
          if (sortBy === 'newest') return b.id.localeCompare(a.id);
          if (sortBy === 'oldest') return a.id.localeCompare(b.id);
          if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
          if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
          if (sortBy === 'students_desc') return b.studentsCount - a.studentsCount;
          if (sortBy === 'attendance_desc') return b.attendancePercentage - a.attendancePercentage;
          return 0;
        });
      }
    }

    const all = getStoredInstructors();
    const activeCount = all.filter((i) => i.status === 'Active').length;
    const pendingCount = all.filter((i) => i.verification === 'Pending' || i.status === 'Pending').length;
    const inactiveCount = all.filter((i) => i.status === 'Inactive' || i.status === 'Suspended').length;
    const teachingCount = all.filter((i) => i.status === 'Active' && i.assignedCourses?.length > 0).length;

    const dynamicKpi: InstructorKpiData = {
      ...INITIAL_KPI_DATA,
      totalInstructors: all.length,
      activeInstructors: activeCount,
      pendingVerification: pendingCount,
      inactiveSuspended: inactiveCount,
      currentlyTeaching: teachingCount,
    };

    return {
      data: list,
      total: list.length,
      kpi: dynamicKpi,
    };
  },

  async getInstructorById(id: string): Promise<Instructor | null> {
    await new Promise((res) => setTimeout(res, 50));
    const list = getStoredInstructors();
    const found = list.find((i) => i.id === id);
    return found ? { ...found } : null;
  },

  async updateInstructor(id: string, updates: Partial<Instructor>): Promise<Instructor> {
    await new Promise((res) => setTimeout(res, 100));
    const list = getStoredInstructors();
    const index = list.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new Error(`Instructor with id ${id} not found`);
    }

    const updated: Instructor = {
      ...list[index],
      ...updates,
      recentActivities: [
        {
          id: `act-${Date.now()}`,
          type: 'profile_update',
          title: 'Profile updated',
          description: 'Instructor updated their profile information',
          timeAgo: 'Just now',
        },
        ...list[index].recentActivities,
      ],
    };

    list[index] = updated;
    saveStoredInstructors(list);
    return updated;
  },

  async createInstructor(data: Omit<Instructor, 'id'>): Promise<Instructor> {
    await new Promise((res) => setTimeout(res, 120));
    const list = getStoredInstructors();
    const newId = `inst-${Date.now()}`;
    const newInstructor: Instructor = {
      ...data,
      id: newId,
      assignedCourses: data.assignedCourses || [],
      recentActivities: [
        {
          id: `act-${Date.now()}`,
          type: 'profile_update',
          title: 'Account created',
          description: 'Instructor registered in Fukey Education',
          timeAgo: 'Just now',
        },
      ],
    };

    list.unshift(newInstructor);
    saveStoredInstructors(list);
    return newInstructor;
  },

  async deleteInstructor(id: string): Promise<void> {
    await new Promise((res) => setTimeout(res, 100));
    const list = getStoredInstructors();
    const filtered = list.filter((i) => i.id !== id);
    saveStoredInstructors(filtered);
  },

  async bulkUpdateStatus(
    ids: string[],
    status: InstructorStatus,
    reason?: string
  ): Promise<{ success: boolean; count: number }> {
    await new Promise((res) => setTimeout(res, 120));
    const list = getStoredInstructors();
    let updatedCount = 0;

    const updatedList = list.map((inst) => {
      if (ids.includes(inst.id)) {
        updatedCount++;
        return {
          ...inst,
          status,
          recentActivities: [
            {
              id: `act-${Date.now()}-${inst.id}`,
              type: 'profile_update' as const,
              title: `Status updated to ${status}`,
              description: `Bulk admin action: ${reason || 'Status changed'}`,
              timeAgo: 'Just now',
            },
            ...inst.recentActivities,
          ],
        };
      }
      return inst;
    });

    saveStoredInstructors(updatedList);
    return { success: true, count: updatedCount };
  },

  async bulkUpdateVerification(
    ids: string[],
    verification: VerificationStatus
  ): Promise<{ success: boolean; count: number }> {
    await new Promise((res) => setTimeout(res, 120));
    const list = getStoredInstructors();
    let updatedCount = 0;

    const updatedList = list.map((inst) => {
      if (ids.includes(inst.id)) {
        updatedCount++;
        return {
          ...inst,
          verification,
          recentActivities: [
            {
              id: `act-${Date.now()}-${inst.id}`,
              type: 'profile_update' as const,
              title: `Credential status updated to ${verification}`,
              description: `Bulk admin verification approved for Classes 9th-12th teaching`,
              timeAgo: 'Just now',
            },
            ...inst.recentActivities,
          ],
        };
      }
      return inst;
    });

    saveStoredInstructors(updatedList);
    return { success: true, count: updatedCount };
  },

  async bulkDeleteInstructors(
    ids: string[]
  ): Promise<{ success: boolean; count: number }> {
    await new Promise((res) => setTimeout(res, 140));
    const list = getStoredInstructors();
    const beforeCount = list.length;
    const filtered = list.filter((i) => !ids.includes(i.id));
    saveStoredInstructors(filtered);
    return { success: true, count: beforeCount - filtered.length };
  },

  async resetToDefault(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  },
};

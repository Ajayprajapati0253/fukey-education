import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { FreeCourse } from '../types/free-course.types';
import { freeCoursesApi } from '../api/freeCourses.api';
import { INITIAL_INSTRUCTORS } from '../data/InitialFreeCourses';
import { RedesignedEditCourseView } from '../components/RedesignedEditCourseView';
import { useFreeToast as useToast } from '../hooks/useFreeToast';
import { ChevronRight, Home } from 'lucide-react';

export const FreeCourseCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  // Naye free course ka default template (ek baar banta hai)
  const [defaultNewCourse] = useState<FreeCourse>(() => ({
    id: `fc-${Date.now()}`,
    courseCode: `FC-${Math.floor(100 + Math.random() * 900)}`,
    title: 'New Class 9-12 Foundation Course',
    shortDescription: 'Comprehensive concept learning, high quality video lectures, and free revision notes.',
    fullDescription: 'Complete curriculum, clear explanations, NCERT derivations, sample papers, and chapter-wise tests designed for academic excellence.',
    targetClass: 'Class 9',
    primarySubject: 'Science',
    additionalSubjects: ['Physics', 'Chemistry'],
    board: 'CBSE',
    language: 'Hindi',
    instructor: INITIAL_INSTRUCTORS[0],
    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80',
    demoVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    demoVideoStorage: 'youtube',
    duration: '40 Hours',
    courseType: 'Foundation',
    modulesCount: 1,
    lessonsCount: 3,
    enrollmentsCount: 0,
    activeStudentsCount: 0,
    completionRate: 0,
    price: 0,
    isFreeCourse: true,
    allowFreeEnrollment: true,
    status: 'Published',
    approvalStatus: 'Approved',
    createdAt: 'Just now',
    updatedAt: 'Just now',
    qaEnabled: true,
    partnerInstructorEnabled: false,
    level: 'Beginner',
  }));

  const handleCreateCourse = async (courseData: Partial<FreeCourse>) => {
    try {
      const created = await freeCoursesApi.createFreeCourse({
        courseCode: courseData.courseCode || defaultNewCourse.courseCode,
        title: courseData.title || defaultNewCourse.title,
        shortDescription: courseData.shortDescription || defaultNewCourse.shortDescription,
        fullDescription: courseData.fullDescription || defaultNewCourse.fullDescription,
        targetClass: courseData.targetClass || defaultNewCourse.targetClass,
        primarySubject: courseData.primarySubject || defaultNewCourse.primarySubject,
        additionalSubjects: courseData.additionalSubjects || defaultNewCourse.additionalSubjects,
        board: courseData.board || defaultNewCourse.board,
        language: courseData.language || defaultNewCourse.language,
        instructor: courseData.instructor || defaultNewCourse.instructor,
        thumbnail: courseData.thumbnail || defaultNewCourse.thumbnail,
        demoVideoUrl: courseData.demoVideoUrl || defaultNewCourse.demoVideoUrl,
        demoVideoStorage: courseData.demoVideoStorage || defaultNewCourse.demoVideoStorage,
        duration: courseData.duration || defaultNewCourse.duration,
        courseType: courseData.courseType || defaultNewCourse.courseType,
        modulesCount: courseData.modulesCount || 1,
        lessonsCount: courseData.lessonsCount || 3,
        enrollmentsCount: 0,
        activeStudentsCount: 0,
        completionRate: 0,
        allowFreeEnrollment: true,
        status: courseData.status || 'Published',
        approvalStatus: 'Approved',
        qaEnabled: courseData.qaEnabled ?? true,
        partnerInstructorEnabled: courseData.partnerInstructorEnabled ?? false,
        level: courseData.level || 'Beginner',
        reviewerMessage: courseData.reviewerMessage || '',
      });

      success('Course Created! 🎉', `"${created.title}" has been successfully created.`);
      navigate('/admin/free-courses');
      return created;
    } catch (err: any) {
      error('Creation Failed', err?.message || 'Could not create course');
      throw err;
    }
  };

  return (
    <div className="space-y-4">
      <nav className="flex items-center gap-2 text-xs text-[#686E7D] dark:text-slate-400 pb-1">
        <Link
          to="/admin/dashboard"
          className="hover:text-[#12141C] dark:hover:text-white flex items-center gap-1 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
        <Link
          to="/admin/free-courses"
          className="hover:text-[#12141C] dark:hover:text-white transition-colors"
        >
          Manage Free Courses
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
        <span className="text-[#12141C] dark:text-white font-semibold">New Free Course</span>
        <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
        <span className="text-[#2451D9] dark:text-blue-400 font-semibold">Add Course (Full Page Studio)</span>
      </nav>

      <RedesignedEditCourseView
        course={defaultNewCourse}
        onSave={handleCreateCourse}
        onCancel={() => navigate('/admin/free-courses')}
        isCreateMode={true}
      />
    </div>
  );
};
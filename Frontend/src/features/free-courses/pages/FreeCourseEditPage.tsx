import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { FreeCourse } from '../types/free-course.types';
import { freeCoursesApi } from '../api/freeCourses.api';
import { RedesignedEditCourseView } from '../components/RedesignedEditCourseView';
import { StudentCoursePreviewModal } from '../components/StudentCoursePreviewModal';
import { useFreeToast as useToast } from '../hooks/useFreeToast';
import { Loader2 } from 'lucide-react';

export const FreeCourseEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [course, setCourse] = useState<FreeCourse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const found = await freeCoursesApi.getFreeCourseById(id);
        if (found) {
          setCourse(found);
        } else {
          error('Course not found', `Could not find course with ID ${id}`);
          navigate('/admin/free-courses');
        }
      } catch (err: any) {
        error('Failed to load course', err?.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [id, navigate, error]);

  const handleSaveCourse = async (updatedData: Partial<FreeCourse>) => {
    if (!id) return;
    try {
      const result = await freeCoursesApi.updateFreeCourse(id, updatedData);
      setCourse(result);
      success('Saved Successfully', `"${result.title}" has been updated.`);
      return result;
    } catch (err: any) {
      error('Failed to save', err?.message);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#2451D9] dark:text-blue-500" />
        <p className="text-xs text-[#686E7D] dark:text-slate-400">Loading Free Course Details...</p>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* <nav className="flex items-center gap-2 text-xs text-[#686E7D] dark:text-slate-400 pb-1">
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
        <span className="text-[#12141C] dark:text-white font-semibold truncate max-w-xs">{course.title}</span>
        <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
        <span className="text-[#2451D9] dark:text-blue-400 font-semibold">Edit Course (Full Page)</span>
      </nav> */}

      <RedesignedEditCourseView
        course={course}
        onSave={handleSaveCourse}
        onCancel={() => navigate('/admin/free-courses')}
        onViewDetails={() => setPreviewOpen(true)}
      />

      <StudentCoursePreviewModal
        course={course}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onDuplicate={async (dupId) => {
          await freeCoursesApi.duplicateFreeCourse(dupId);
          navigate('/admin/free-courses');
        }}
      />
    </div>
  );
};
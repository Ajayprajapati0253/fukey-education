import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, RotateCcw, ChevronRight, Home } from 'lucide-react';
import { freeCoursesApi } from '../api/freeCourses.api';
import type { FreeCourse } from '../types/free-course.types';
import { Button } from '../../../components/ui/Button';
// import { useFreeToast as useToast } from '../hooks/useFreeToast';

export const FreeCourseDeleteRequestsPage: React.FC = () => {
//   const { success, error } = useToast();
  const [archivedCourses, setArchivedCourses] = useState<FreeCourse[]>([]);

  useEffect(() => {
    freeCoursesApi.getFreeCourses().then((data) => {
      setArchivedCourses(data.filter((c) => c.status === 'Archived'));
    });
  }, []);

  const handleRestore = async (id: string) => {
    try {
      await freeCoursesApi.restoreFreeCourse(id);
      setArchivedCourses((prev) => prev.filter((c) => c.id !== id));
      success('Course Restored', 'Course moved back to published status.');
    } catch (err: any) {
      error('Failed to restore', err?.message);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!window.confirm('Permanently delete this free course? This action is irreversible.')) return;
    try {
      await freeCoursesApi.deleteFreeCourse(id);
      setArchivedCourses((prev) => prev.filter((c) => c.id !== id));
      success('Course Permanently Deleted');
    } catch (err: any) {
      error('Failed to delete', err?.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* <nav className="flex items-center gap-2 text-xs text-[#686E7D] dark:text-slate-400">
        <Link
          to="/admin/dashboard"
          className="hover:text-[#12141C] dark:hover:text-white flex items-center gap-1"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
        <Link to="/admin/free-courses" className="hover:text-[#12141C] dark:hover:text-white">
          Manage Free Courses
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
        <span className="text-[#12141C] dark:text-white font-semibold">Delete Requests & Archived</span>
      </nav> */}

      <div>
        <h1 className="text-2xl font-extrabold text-[#12141C] dark:text-white tracking-tight">
          Archived & Delete Requests
        </h1>
        <p className="text-xs text-[#686E7D] dark:text-slate-400 mt-1">
          Review retired free courses, restore them to active status, or purge permanently.
        </p>
      </div>

      {archivedCourses.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#1E293B] rounded-2xl border border-[#E6E8EE] dark:border-[#334155]">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Trash2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#12141C] dark:text-white">
            No Pending Deletion or Archived Courses
          </h3>
          <p className="text-xs text-[#686E7D] dark:text-slate-400 mt-1">
            All active free courses are published and running smoothly.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {archivedCourses.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <img
                  src={c.thumbnail}
                  alt={c.title}
                  className="w-12 h-12 rounded-xl object-cover border border-[#E6E8EE] dark:border-slate-700 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-[#2451D9] dark:bg-slate-800 dark:text-blue-400">
                      {c.courseCode}
                    </span>
                    <h4 className="text-xs font-bold text-[#12141C] dark:text-white">{c.title}</h4>
                  </div>
                  <p className="text-[11px] text-[#686E7D] dark:text-slate-400 mt-0.5">
                    {c.targetClass} • {c.primarySubject} • {c.enrollmentsCount} previous enrollments
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => handleRestore(c.id)}>
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-500" />
                  Restore Course
                </Button>
                <Button size="sm" variant="danger" onClick={() => handlePermanentDelete(c.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Permanently
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
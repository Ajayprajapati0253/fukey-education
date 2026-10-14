import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ExternalLink, ChevronRight, Home } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

export const FreeCourseCategoriesPage: React.FC = () => {
  const classesData = [
    {
      name: 'Class 9 Foundation',
      targetClass: 'Class 9',
      subjectsCount: 6,
      coursesCount: 14,
      totalStudents: 12450,
      description: 'NCERT foundation courses covering Science, Mathematics, Social Science, Hindi & English.',
    },
    {
      name: 'Class 10 Board Booster',
      targetClass: 'Class 10',
      subjectsCount: 6,
      coursesCount: 18,
      totalStudents: 24800,
      description: 'Comprehensive board exam preparation with high yield questions and past 10-year paper solutions.',
    },
    {
      name: 'Class 11 Science & CS',
      targetClass: 'Class 11',
      subjectsCount: 5,
      coursesCount: 12,
      totalStudents: 16300,
      description: 'Physics, Chemistry, Mathematics, Biology, and Python programming fundamentals.',
    },
    {
      name: 'Class 12 Boards & Competitive',
      targetClass: 'Class 12',
      subjectsCount: 5,
      coursesCount: 20,
      totalStudents: 31200,
      description: 'Advanced board masterclasses, concept revision mind maps, and live doubt sessions.',
    },
  ];

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
        <span className="text-[#12141C] dark:text-white font-semibold">Categories & Target Classes</span>
      </nav> */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#12141C] dark:text-white tracking-tight">
            Free Course Categories (Classes 9th to 12th)
          </h1>
          <p className="text-xs text-[#686E7D] dark:text-slate-400 mt-1">
            Organize free course offerings by academic class level and subject groups.
          </p>
        </div>

        <Link to="/admin/free-courses">
          <Button variant="primary" size="sm">
            <BookOpen className="w-4 h-4" />
            View All Free Courses
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {classesData.map((item) => (
          <div
            key={item.name}
            className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] hover:border-[#D1D5DB] dark:hover:border-gray-600 transition-all shadow-sm dark:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="brand" size="md" pill={false}>
                  {item.targetClass}
                </Badge>
                <span className="text-xs font-bold text-[#16A34A] dark:text-emerald-400">
                  100% Free Access
                </span>
              </div>
              <h3 className="text-base font-bold text-[#12141C] dark:text-white">{item.name}</h3>
              <p className="text-xs text-[#686E7D] dark:text-slate-400 mt-1.5 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-[#E6E8EE] dark:border-[#334155] flex items-center justify-between text-xs">
              <div className="flex items-center gap-4 text-[#686E7D] dark:text-slate-300">
                <span>
                  <strong className="text-[#12141C] dark:text-white">{item.coursesCount}</strong> Courses
                </span>
                <span>•</span>
                <span>
                  <strong className="text-[#12141C] dark:text-white">{item.subjectsCount}</strong> Subjects
                </span>
                <span>•</span>
                <span>
                  <strong className="text-[#12141C] dark:text-white">
                    {item.totalStudents.toLocaleString()}
                  </strong>{' '}
                  Students
                </span>
              </div>

              <Link
                to={`/admin/free-courses?class=${encodeURIComponent(item.targetClass)}`}
                className="text-[#2451D9] hover:text-[#1E44B8] dark:text-blue-400 dark:hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                <span>Filter</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';

export const FreeCourseLanguagesPage: React.FC = () => {
  const languages = [
    { name: 'Hindi (हिंदी)', code: 'hi', courses: 24, activeStudents: 38900, status: 'Active' },
    { name: 'English', code: 'en', courses: 18, activeStudents: 29400, status: 'Active' },
    { name: 'Hinglish (Bilingual)', code: 'hi-en', courses: 15, activeStudents: 22100, status: 'Active' },
    { name: 'Urdu (اردو)', code: 'ur', courses: 4, activeStudents: 4100, status: 'Active' },
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
        <span className="text-[#12141C] dark:text-white font-semibold">Languages</span>
      </nav> */}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#12141C] dark:text-white tracking-tight">
            Medium & Languages
          </h1>
          <p className="text-xs text-[#686E7D] dark:text-slate-400 mt-1">
            Languages supported across free courses for Classes 9 to 12.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {languages.map((l) => (
          <div
            key={l.code}
            className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] shadow-sm dark:shadow-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-[#EAF0FE] text-[#2451D9] dark:bg-[#2451D9]/20 dark:text-[#60A5FA] flex items-center justify-center font-bold text-xs uppercase">
                {l.code}
              </span>
              <Badge variant="success" size="xs" pill={false}>
                {l.status}
              </Badge>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#12141C] dark:text-white">{l.name}</h3>
              <p className="text-xs text-[#686E7D] dark:text-slate-400 mt-0.5">{l.courses} Free Courses</p>
            </div>
            <div className="pt-3 border-t border-[#E6E8EE] dark:border-[#334155] flex items-center justify-between text-xs text-[#686E7D] dark:text-slate-300">
              <span>{l.activeStudents.toLocaleString()} Learners</span>
              <Link
                to="/admin/free-courses"
                className="text-[#2451D9] hover:text-[#1E44B8] dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
              >
                Explore →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
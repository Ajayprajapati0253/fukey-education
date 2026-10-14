import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';

export const FreeCourseLevelsPage: React.FC = () => {
  const levels = [
    { name: 'Beginner', target: 'Class 9 & 10 Foundations', count: 18, desc: 'Introductory concept builder & foundational theories.' },
    { name: 'Intermediate', target: 'Board Preparations (9-12)', count: 24, desc: 'Rigorous standard syllabus, NCERT problem solving, and chapter formulas.' },
    { name: 'Advanced / Expert', target: 'Class 11 & 12 Boards / Olympiads', count: 12, desc: 'High order thinking problems, reaction mechanisms, and calculus physics.' },
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
        <span className="text-[#12141C] dark:text-white font-semibold">Course Difficulty Levels</span>
      </nav> */}

      <div>
        <h1 className="text-2xl font-extrabold text-[#12141C] dark:text-white tracking-tight">
          Difficulty Levels
        </h1>
        <p className="text-xs text-[#686E7D] dark:text-slate-400 mt-1">
          Proficiency levels available for free education curriculum.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {levels.map((lvl) => (
          <div
            key={lvl.name}
            className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] shadow-sm dark:shadow-lg space-y-3"
          >
            <Badge variant="accent" size="md" pill={false}>
              {lvl.name}
            </Badge>
            <h3 className="text-base font-bold text-[#12141C] dark:text-white mt-1">{lvl.target}</h3>
            <p className="text-xs text-[#686E7D] dark:text-slate-400 leading-relaxed">{lvl.desc}</p>
            <div className="pt-3 border-t border-[#E6E8EE] dark:border-[#334155] text-xs font-semibold text-[#2451D9] dark:text-blue-400">
              {lvl.count} active free courses
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
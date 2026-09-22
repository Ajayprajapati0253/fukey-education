// src/features/courses/components/CourseDetailsModal.tsx
import React from 'react';
import {
  X, Pencil, Users, Clock, Star, Globe, IndianRupee,
  FileCheck, Calendar, Share2,
} from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { useUIStore } from '../../../store/ui.store';
import type { Course } from '../types/course.types';

interface CourseDetailsModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (course: Course) => void;
  // currency prop removed — now read from global store
}

export const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({
  course, isOpen, onClose, onEdit,
}) => {
  const { currency } = useUIStore();
  if (!isOpen || !course) return null;

  const sym = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '€';
  const displayPrice = course.isFree
    ? 'Free'
    : `${sym}${currency === 'INR' ? course.price : (course.price / 83).toFixed(2)}`;

  const syllabusModules = [
    { title: 'Module 1: Foundations & Core Terminology', lessons: 8, duration: '4h 30m' },
    { title: 'Module 2: Key Theorems & Experimental Derivations', lessons: 14, duration: '9h 15m' },
    { title: 'Module 3: Problem Solving & NCERT Question Bank', lessons: 18, duration: '12h 00m' },
    { title: 'Module 4: Board Mock Exams & High-Yield Diagrams', lessons: 10, duration: '6h 45m' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 sm:pt-10 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-[#e2e8f0] dark:border-[#334155] shadow-2xl w-full max-w-3xl overflow-hidden mb-8 animate-in fade-in zoom-in-95">
        <div className="relative w-full aspect-video sm:aspect-[21/9] max-h-[280px] bg-slate-900 overflow-hidden">
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover object-top opacity-60" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button onClick={() => { onClose(); onEdit(course); }} className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 text-xs font-semibold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors">
              <Pencil className="w-3.5 h-3.5 text-[#3b82f6]" /><span>Edit</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs border border-white/30">{course.category}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/80 text-white">{course.level}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/80 text-white">{course.status}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">{course.title}</h1>
            <p className="text-xs text-slate-300 mt-0.5">{course.subtitle}</p>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#f8f9ff] dark:bg-slate-800/60 border border-[#e2e8f0] dark:border-[#334155]">
              <div className="flex items-center gap-2 text-[#64748b] dark:text-gray-400 text-xs font-medium mb-1"><Users className="w-4 h-4 text-[#3b82f6]" /><span>Enrolled</span></div>
              <p className="text-lg font-bold text-[#0f172a] dark:text-gray-100">{course.studentsCount.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#f8f9ff] dark:bg-slate-800/60 border border-[#e2e8f0] dark:border-[#334155]">
              <div className="flex items-center gap-2 text-[#64748b] dark:text-gray-400 text-xs font-medium mb-1"><IndianRupee className="w-4 h-4 text-emerald-600" /><span>Price</span></div>
              <p className="text-lg font-bold text-[#0f172a] dark:text-gray-100">{displayPrice}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#f8f9ff] dark:bg-slate-800/60 border border-[#e2e8f0] dark:border-[#334155]">
              <div className="flex items-center gap-2 text-[#64748b] dark:text-gray-400 text-xs font-medium mb-1"><Clock className="w-4 h-4 text-orange-500" /><span>Duration</span></div>
              <p className="text-lg font-bold text-[#0f172a] dark:text-gray-100">{course.duration || '48 hours'}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#f8f9ff] dark:bg-slate-800/60 border border-[#e2e8f0] dark:border-[#334155]">
              <div className="flex items-center gap-2 text-[#64748b] dark:text-gray-400 text-xs font-medium mb-1"><Star className="w-4 h-4 text-amber-500 fill-amber-400" /><span>Rating</span></div>
              <p className="text-lg font-bold text-[#0f172a] dark:text-gray-100">{course.rating || '4.8'} <span className="text-xs font-normal text-slate-500 dark:text-gray-400">/ 5.0</span></p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#e2e8f0] dark:border-[#334155] bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <img src={course.instructorAvatar} alt={course.instructorName} className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-xs" referrerPolicy="no-referrer" />
              <div>
                <p className="text-xs font-semibold text-[#64748b] dark:text-gray-400 uppercase tracking-wider">Lead Instructor</p>
                <p className="text-sm font-bold text-[#0f172a] dark:text-gray-100">{course.instructorName}</p>
                <p className="text-xs text-slate-500 dark:text-gray-400">Senior Faculty & Subject Specialist</p>
              </div>
            </div>
            <div className="text-xs text-slate-600 dark:text-gray-300 space-y-1 sm:text-right">
              <p className="flex items-center sm:justify-end gap-1.5"><Globe className="w-3.5 h-3.5 text-slate-400" /><span>Language: <strong>{course.language}</strong></span></p>
              <p className="flex items-center sm:justify-end gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /><span>Created: {course.createdDate} at {course.createdTime}</span></p>
              <p className="flex items-center sm:justify-end gap-1.5"><FileCheck className="w-3.5 h-3.5 text-emerald-500" /><span>Approval: <strong>{course.approvalStatus}</strong></span></p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#0f172a] dark:text-gray-100 mb-1.5">Course Overview</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
              {course.description || 'This course equips students with deep conceptual understanding, practical problem-solving methods, previous year question walk-throughs, and interactive live revision sessions.'}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#0f172a] dark:text-gray-100">Curriculum Structure ({course.lessonsCount || 50} Lessons)</h3>
              <span className="text-xs text-[#3b82f6] font-semibold">4 Chapters</span>
            </div>
            <div className="space-y-2">
              {syllabusModules.map((mod, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-slate-800/40 flex items-center justify-between text-xs sm:text-sm hover:border-[#3b82f6] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[#3b82f6] flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                    <span className="font-medium text-[#0f172a] dark:text-gray-100">{mod.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 dark:text-gray-400 text-xs">
                    <span>{mod.lessons} lectures</span><span>•</span><span>{mod.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#e2e8f0] dark:border-[#334155] bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <button onClick={() => { navigator.clipboard?.writeText(window.location.href); }} className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white border border-[#e2e8f0] dark:border-[#334155] rounded-lg bg-white dark:bg-[#1E293B] flex items-center gap-1.5 cursor-pointer shadow-2xs">
            <Share2 className="w-3.5 h-3.5" /><span>Copy Link</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 border border-[#e2e8f0] dark:border-[#334155] rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer">Close</button>
            <button onClick={() => { onClose(); onEdit(course); }} className="px-5 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg text-sm font-medium transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer">
              <Pencil className="w-4 h-4" /><span>Edit Course</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
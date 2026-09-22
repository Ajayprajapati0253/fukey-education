import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { Course, CourseStatus, ApprovalStatus, CourseType } from '../types/course.types';
import { CATEGORIES, INSTRUCTORS, LEVELS, COURSE_TYPES } from '../data/InitialCourses';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCourse: (course: Omit<Course, 'id' | 'sn' | 'createdDate' | 'createdTime'>) => void;
}

const SAMPLE_THUMBNAILS = [
  { label: 'Science & Lab', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVkW9SrOyBDQZOtv58POpA83WRuPCDX6Iez3s6MvMPXqjlZw5QjY8Ap22vwDPxAHL9CNpPvE8s71nWMkYgcG3BZSmwCV4Mv6BJi8fSYAgCUCewk9WgvYNJj0vnCOEg9_Vz6PulaDGw4CwdymVfbmHInA_Wm5UzqQIj4KZjZB8UP3CJ0dFby2RuN_WxJXS8RmZKKwN-8nDn98f_PWXi9FLBfRzbWReHUamFTz5uY3MsXfOZtT5uZXXEjw' },
  { label: 'Physics Optics', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhVMHzhZA4PfWTaIMmjafRDpiqkfDNL4WgO8ss7eqKXM751uNqFY3ChZwwGIpQ8YaZrpBrcKtHbdjpuXZzPlLfSjUV3kGTJVhSg4pFASC54AhV6qjKRvmKxewtAfZsaNgN02_t6HzidWZlCCYJi79NBVOKmnQp-clR98cnEb4MwBnQhJYTJrd-8WRR9u1-K2Bp_5yDbkQVPKFIA5g_1Nd4W0UJXdcSSL2y03K4XmIDgtAkF1Hd9eeIQA' },
  { label: 'Mathematics & Equations', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwWRZ7HLii70HUjBbeN7FVvxUZL4dSXBG8UjBmNa8RSSonW9yBMXm5Gle_GRA5rakIFV5Ne7jDyaMtpGpydUlhkPmHAAzcb8HD-oVf6f32QW8hiZNb3YE2GWtM_hZnQSm8SYx5-uAy57baGeAzfdyAxvwzIjA-v1AsnbAP6q63aZNU88jHcC0_ckpzusdmKaI-nv6l-7f-efk03unhY4TX7kzarGeN5IQXGOvKAABLk50au_HQz4Taag' },
  { label: 'Chemistry Flasks', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDE_M5KMf690wdiB2AaoaScl830X4rwuzUijiZjNIVhdD2L1b1phy8YMr5qAeEwoPnOF8vlXCPWbFVQaeUuLHf6aTH4Z2aONQkrpQuH-P82MOMSmUAa4jE9_4Ntk8Mdnz0KHQ6_-xZgmoHtB9HGNIypkIxuydWpyez4W9VoNbzFJq-4H2tkbgv3vKQj6XU-Eb4DNqZmMaCf3Y3_wZw5X_XAyJV-cW2zQl5RAwOFMvosHk8Hzle9yrsbUg' },
];

export const AddCourseModal: React.FC<AddCourseModalProps> = ({ isOpen, onClose, onAddCourse }) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1] || 'Science');
  const [instructorName, setInstructorName] = useState(INSTRUCTORS[1] || 'Khabib Nurmagomedov');
  const [level, setLevel] = useState(LEVELS[1] || 'Class 10');
  const [language, setLanguage] = useState('English');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState<number>(0);
  const [status, setStatus] = useState<CourseStatus>('Published');
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('Approved');
  const [courseType, setCourseType] = useState<CourseType>('Standard');
  const [thumbnail, setThumbnail] = useState(SAMPLE_THUMBNAILS[0].url);
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('40 hours');
  const [lessonsCount, setLessonsCount] = useState(50);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a course title');
      return;
    }

    const instructorAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8V9kHqZv878UnkvnyQWIBKTNdoI3uOb0TrEBO0AYdHUoyhxAqhsGmWwOaGOVyLpmr5G-szx3crDxPf03mhY4eltIWuHcGQeWKbyDxn4us6xVsPgPpwzf63kj3tA_QOSkSttDmxI5w4VguADxyAKAKj42Oh0v8PK-o4KEFVbvJFo0cXC5zO6bBNh3YovSotW9CfPGY0Mo6qK_EGel7sUaw1S5KJ1KeOkEJt8wV6ERJIJN2xPJzJk0lSA';

    onAddCourse({
      title: title.trim(),
      subtitle: subtitle.trim() || `${category}: ${level}`,
      thumbnail,
      instructorName,
      instructorAvatar,
      category,
      level,
      studentsCount: 0,
      price: isFree ? 0 : price,
      isFree,
      status,
      approvalStatus,
      courseType,
      language,
      duration,
      lessonsCount,
      rating: 5.0,
      description: description.trim() || 'Comprehensive course syllabus with interactive study notes and assignments.',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-[#e2e8f0] dark:border-[#334155] shadow-2xl w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-[#e2e8f0] dark:border-[#334155] flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-[#3b82f6] flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0f172a] dark:text-gray-100">Add New Course</h2>
              <p className="text-xs text-[#64748b] dark:text-gray-400">Fill in the details to publish or draft a new course.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Course Title *</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Class 10th Science & Board Prep"
                className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] outline-hidden" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Subtitle / Track</label>
              <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="e.g. Science: Class 10"
                className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] outline-hidden" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] outline-hidden">
                {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Instructor</label>
              <select value={instructorName} onChange={(e) => setInstructorName(e.target.value)}
                className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] outline-hidden">
                {INSTRUCTORS.filter((i) => i !== 'All Instructors').map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Level / Grade</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] outline-hidden">
                {LEVELS.filter((l) => l !== 'All Levels').map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-[#e2e8f0] dark:border-[#334155] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#0f172a] dark:text-gray-100">Course Pricing</p>
                <p className="text-xs text-[#64748b] dark:text-gray-400">Set whether this course is free or paid</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setIsFree(true); setPrice(0); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${isFree ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-white dark:bg-[#0F172A] text-slate-600 dark:text-gray-300 border border-[#e2e8f0] dark:border-[#334155]'}`}>
                  Free Course
                </button>
                <button type="button" onClick={() => { setIsFree(false); if (price === 0) setPrice(499); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${!isFree ? 'bg-[#3b82f6] text-white shadow-2xs' : 'bg-white dark:bg-[#0F172A] text-slate-600 dark:text-gray-300 border border-[#e2e8f0] dark:border-[#334155]'}`}>
                  Paid Course
                </button>
              </div>
            </div>
            {!isFree && (
              <div className="pt-2 flex items-center gap-3">
                <div className="relative w-48">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-400 text-sm font-semibold">₹</span>
                  <input type="number" min="1" value={price} onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-[#0F172A] border border-[#e2e8f0] dark:border-[#334155] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] outline-hidden font-medium" placeholder="499" />
                </div>
                <span className="text-xs text-slate-500 dark:text-gray-400">Students will pay this amount for full access.</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Delivery Mode</label>
              <select value={courseType} onChange={(e) => setCourseType(e.target.value as CourseType)}
                className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] outline-hidden">
                {COURSE_TYPES.filter((c) => c !== 'Course Type').map((ct) => <option key={ct} value={ct}>{ct}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Publication Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as CourseStatus)}
                className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] outline-hidden">
                <option value="Published">Published</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Approval Status</label>
              <select value={approvalStatus} onChange={(e) => setApprovalStatus(e.target.value as ApprovalStatus)}
                className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] outline-hidden">
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Course Cover Image</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SAMPLE_THUMBNAILS.map((t, idx) => (
                <div key={idx} onClick={() => setThumbnail(t.url)}
                  className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${thumbnail === t.url ? 'border-[#3b82f6] ring-2 ring-blue-200 dark:ring-blue-500/30' : 'border-transparent hover:opacity-80'}`}>
                  <img src={t.url} alt={t.label} className="w-full h-16 object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-0.5 text-[10px] text-white truncate text-center">{t.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Course Description & Curriculum Summary</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline what students will learn, prerequisites, and milestone assessments..."
              className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] outline-hidden" />
          </div>

          <div className="pt-4 border-t border-[#e2e8f0] dark:border-[#334155] flex items-center justify-end gap-3">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-[#e2e8f0] dark:border-[#334155] rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="px-5 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg text-sm font-medium transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer">
              <Plus className="w-4 h-4" /><span>Create Course</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
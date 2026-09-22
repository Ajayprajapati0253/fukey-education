import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { Course, CourseStatus, ApprovalStatus } from '../types/course.types';
import { CATEGORIES, INSTRUCTORS, LEVELS } from '../data/InitialCourses';

interface EditCourseModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCourse: (updated: Course) => void;
}

export const EditCourseModal: React.FC<EditCourseModalProps> = ({ course, isOpen, onClose, onUpdateCourse }) => {
  const [formData, setFormData] = useState<Course | null>(null);

  useEffect(() => {
    if (course) setFormData({ ...course });
  }, [course]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCourse(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-[#e2e8f0] dark:border-[#334155] shadow-2xl w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-[#e2e8f0] dark:border-[#334155] flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-[#3b82f6] flex items-center justify-center font-bold">#{formData.sn}</div>
            <div>
              <h2 className="text-lg font-bold text-[#0f172a] dark:text-gray-100">Edit Course Details</h2>
              <p className="text-xs text-[#64748b] dark:text-gray-400">ID: {formData.id}</p>
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
              <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] outline-hidden font-medium" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Subtitle / Track</label>
              <input type="text" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] outline-hidden" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] outline-hidden">
                {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Instructor</label>
              <select value={formData.instructorName} onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] outline-hidden">
                {INSTRUCTORS.filter((i) => i !== 'All Instructors').map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Level / Grade</label>
              <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] outline-hidden">
                {LEVELS.filter((l) => l !== 'All Levels').map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-[#e2e8f0] dark:border-[#334155] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#0f172a] dark:text-gray-100">Pricing & Access</p>
                <p className="text-xs text-[#64748b] dark:text-gray-400">Configure enrollment pricing</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setFormData({ ...formData, isFree: true, price: 0 })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${formData.isFree ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-white dark:bg-[#0F172A] text-slate-600 dark:text-gray-300 border border-[#e2e8f0] dark:border-[#334155]'}`}>
                  Free Course
                </button>
                <button type="button" onClick={() => setFormData({ ...formData, isFree: false, price: formData.price > 0 ? formData.price : 499 })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${!formData.isFree ? 'bg-[#3b82f6] text-white shadow-2xs' : 'bg-white dark:bg-[#0F172A] text-slate-600 dark:text-gray-300 border border-[#e2e8f0] dark:border-[#334155]'}`}>
                  Paid Course
                </button>
              </div>
            </div>
            {!formData.isFree && (
              <div className="pt-2 flex items-center gap-3">
                <div className="relative w-48">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-400 text-sm font-semibold">₹</span>
                  <input type="number" min="1" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-[#0F172A] border border-[#e2e8f0] dark:border-[#334155] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] outline-hidden font-medium" />
                </div>
                <span className="text-xs text-slate-500 dark:text-gray-400">Base course price in INR</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Publication Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as CourseStatus })}
                className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] outline-hidden">
                <option value="Published">Published</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Approval Status</label>
              <select value={formData.approvalStatus} onChange={(e) => setFormData({ ...formData, approvalStatus: e.target.value as ApprovalStatus })}
                className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] outline-hidden">
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Enrolled Students</label>
              <input type="number" value={formData.studentsCount} onChange={(e) => setFormData({ ...formData, studentsCount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] outline-hidden" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Course Description</label>
            <textarea rows={3} value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] outline-hidden" />
          </div>

          <div className="pt-4 border-t border-[#e2e8f0] dark:border-[#334155] flex items-center justify-end gap-3">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-[#e2e8f0] dark:border-[#334155] rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="px-5 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg text-sm font-medium transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer">
              <Save className="w-4 h-4" /><span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
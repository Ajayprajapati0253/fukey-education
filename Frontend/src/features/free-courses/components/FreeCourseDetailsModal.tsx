import React from 'react';
import type { FreeCourse } from '../types/free-course.types';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  BookOpen,
  ShieldCheck,
  Edit3,
  Copy,
  Archive,
  RotateCcw,
  Trash2,
} from 'lucide-react';

interface FreeCourseDetailsModalProps {
  course: FreeCourse | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (course: FreeCourse) => void;
  onManageContent: (course: FreeCourse) => void;
  onDuplicate: (id: string) => void;
  onTogglePublish: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (course: FreeCourse) => void;
}

export const FreeCourseDetailsModal: React.FC<FreeCourseDetailsModalProps> = ({
  course,
  isOpen,
  onClose,
  onEdit,
  onManageContent,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
}) => {
  if (!course) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-[#12141C] dark:text-white">Free Course Details</span>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-[#2451D9] border border-[#E6E8EE] dark:bg-slate-800 dark:text-blue-400 dark:border-slate-700">
            {course.courseCode}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#E7F7ED] text-[#16A34A] border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
            FREE (₹0)
          </span>
        </div>
      }
      subtitle={`Created on ${course.createdAt}`}
      maxWidth="4xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onDuplicate(course.id);
                onClose();
              }}
              icon={<Copy className="w-3.5 h-3.5" />}
            >
              Duplicate
            </Button>
            {course.status === 'Archived' ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onRestore(course.id);
                  onClose();
                }}
                icon={<RotateCcw className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />}
              >
                Restore
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onArchive(course.id);
                  onClose();
                }}
                icon={<Archive className="w-3.5 h-3.5 text-[#686E7D] dark:text-slate-400" />}
              >
                Archive
              </Button>
            )}
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                onClose();
                onDelete(course);
              }}
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                onClose();
                onManageContent(course);
              }}
              icon={<BookOpen className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />}
            >
              Manage Curriculum
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                onClose();
                onEdit(course);
              }}
              icon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Edit Course
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top Hero Banner with Thumbnail + Course Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 rounded-2xl bg-[#F6F7FA] dark:bg-[#0B0F19] border border-[#E6E8EE] dark:border-[#334155]">
          <div className="md:col-span-1">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-44 object-cover rounded-xl border border-[#E6E8EE] dark:border-slate-700 shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          <div className="md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="teal" size="sm">
                  {course.targetClass}
                </Badge>
                <Badge variant="purple" size="sm">
                  {course.primarySubject}
                </Badge>
                <Badge variant={course.status === 'Published' ? 'success' : 'neutral'} dot size="sm">
                  {course.status}
                </Badge>
                <span className="text-[11px] font-semibold text-[#686E7D] dark:text-slate-400">
                  {course.board} • {course.language}
                </span>
              </div>

              <h2 className="text-lg font-extrabold text-[#12141C] dark:text-white leading-snug">
                {course.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3">
                {course.shortDescription}
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#E6E8EE] dark:border-[#334155] text-center">
              <div>
                <span className="text-[10px] text-[#686E7D] dark:text-slate-400 uppercase font-semibold">Price</span>
                <p className="text-sm font-extrabold text-[#16A34A] dark:text-emerald-400">₹0 (FREE)</p>
              </div>
              <div>
                <span className="text-[10px] text-[#686E7D] dark:text-slate-400 uppercase font-semibold">Enrolled</span>
                <p className="text-sm font-extrabold text-[#12141C] dark:text-white">
                  {course.enrollmentsCount.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-[#686E7D] dark:text-slate-400 uppercase font-semibold">Duration</span>
                <p className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400">{course.duration}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Free Course Guarantee Badge */}
        <div className="p-3.5 rounded-xl bg-[#E7F7ED] dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#16A34A] dark:text-emerald-400 shrink-0" />
            <p className="text-xs text-slate-600 dark:text-slate-200">
              <strong className="text-[#16A34A] dark:text-emerald-400 font-bold">Free Enrollment Active:</strong> Students from {course.targetClass} can access this course immediately without entering any payment or checkout details.
            </p>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded bg-emerald-100 text-[#16A34A] border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30">
            Open Access
          </span>
        </div>

        {/* Grid: Instructor + Academic Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Instructor Card */}
          <div className="p-4 rounded-xl bg-[#F6F7FA] dark:bg-[#0B0F19] border border-[#E6E8EE] dark:border-[#334155]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#686E7D] dark:text-slate-400 block mb-3">
              Assigned Instructor
            </span>
            <div className="flex items-center gap-3">
              <img
                src={course.instructor.avatar}
                alt={course.instructor.name}
                className="w-12 h-12 rounded-full object-cover border border-[#E6E8EE] dark:border-slate-700"
              />
              <div>
                <h4 className="font-bold text-[#12141C] dark:text-white text-sm">{course.instructor.name}</h4>
                <p className="text-xs text-[#2451D9] dark:text-blue-400">{course.instructor.specialization}</p>
                <p className="text-[11px] text-[#686E7D] dark:text-slate-400 mt-0.5">{course.instructor.email}</p>
              </div>
            </div>
          </div>

          {/* Academic & Platform Specs */}
          <div className="p-4 rounded-xl bg-[#F6F7FA] dark:bg-[#0B0F19] border border-[#E6E8EE] dark:border-[#334155] space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#686E7D] dark:text-slate-400 block mb-2">
              Course Information
            </span>
            <div className="flex justify-between py-1 border-b border-[#E6E8EE] dark:border-[#334155]">
              <span className="text-[#686E7D] dark:text-slate-400">Target Level:</span>
              <span className="font-semibold text-[#12141C] dark:text-white">{course.targetClass} ({course.level})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E6E8EE] dark:border-[#334155]">
              <span className="text-[#686E7D] dark:text-slate-400">Course Type:</span>
              <span className="font-semibold text-[#12141C] dark:text-white">{course.courseType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E6E8EE] dark:border-[#334155]">
              <span className="text-[#686E7D] dark:text-slate-400">Medium & Language:</span>
              <span className="font-semibold text-[#12141C] dark:text-white">{course.language}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#686E7D] dark:text-slate-400">Q&A Discussion:</span>
              <span className="font-semibold text-[#16A34A] dark:text-emerald-400">
                {course.qaEnabled ? 'Enabled for Students' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="p-4 rounded-xl bg-[#F6F7FA] dark:bg-[#0B0F19] border border-[#E6E8EE] dark:border-[#334155]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#686E7D] dark:text-slate-400 block mb-2">
            Full Description & Syllabus Outline
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-200 whitespace-pre-line leading-relaxed">
            {course.fullDescription || course.shortDescription}
          </p>
        </div>
      </div>
    </Modal>
  );
};
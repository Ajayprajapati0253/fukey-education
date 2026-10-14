import React from 'react';
import { Eye, Edit3, MoreVertical, Copy, Archive, RotateCcw, Trash2, BookOpen, Users, Clock, Check, X } from 'lucide-react';
import type { FreeCourse } from '../types/free-course.types';
import { ActionMenu as Dropdown, type DropdownItem } from './ActionMenu';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

interface FreeCourseCardGridProps {
  courses: FreeCourse[];
  selectedIds: string[];
  onToggleSelectOne: (id: string) => void;
  onView: (course: FreeCourse) => void;
  onEdit: (course: FreeCourse) => void;
  onDuplicate: (id: string) => void;
  onTogglePublish: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (course: FreeCourse) => void;
  onManageContent: (course: FreeCourse) => void;
  onViewEnrollments: (course: FreeCourse) => void;
}

export const FreeCourseCardGrid: React.FC<FreeCourseCardGridProps> = ({
  courses,
  selectedIds,
  onToggleSelectOne,
  onView,
  onEdit,
  onDuplicate,
  onTogglePublish,
  onArchive,
  onRestore,
  onDelete,
  onManageContent,
  onViewEnrollments,
}) => {
  const getSubjectBadgeVariant = (subject: string): 'purple' | 'teal' | 'warning' | 'info' | 'neutral' => {
    const s = subject.toLowerCase();
    if (s.includes('sci') || s.includes('bio')) return 'teal';
    if (s.includes('chem') || s.includes('phy')) return 'purple';
    if (s.includes('math')) return 'info';
    if (s.includes('eng') || s.includes('hindi')) return 'warning';
    return 'neutral';
  };

  if (courses.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-2xl p-12 text-center shadow-lg">
        <h3 className="text-base font-bold text-[#12141C] dark:text-white mb-1">No Free Courses Found</h3>
        <p className="text-xs text-[#686E7D] dark:text-slate-400">
          Try adjusting your search criteria or add a new free course.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {courses.map((course) => {
        const isSelected = selectedIds.includes(course.id);

        const dropdownItems: DropdownItem[] = [
          {
            id: 'view',
            label: 'View Details',
            icon: <Eye className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />,
            onClick: () => onView(course),
          },
          {
            id: 'edit',
            label: 'Edit Full Page',
            icon: <Edit3 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />,
            onClick: () => onEdit(course),
          },
          {
            id: 'content',
            label: 'Manage Curriculum',
            icon: <BookOpen className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />,
            onClick: () => onManageContent(course),
          },
          {
            id: 'enrollments',
            label: 'View Students',
            icon: <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
            onClick: () => onViewEnrollments(course),
          },
          {
            id: 'duplicate',
            label: 'Duplicate Course',
            icon: <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />,
            onClick: () => onDuplicate(course.id),
          },
          course.status === 'Published'
            ? {
                id: 'unpublish',
                label: 'Unpublish (Draft)',
                icon: <X className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
                onClick: () => onTogglePublish(course.id),
              }
            : {
                id: 'publish',
                label: 'Publish Course',
                icon: <Check className="w-3.5 h-3.5 text-[#16A34A] dark:text-emerald-400" />,
                onClick: () => onTogglePublish(course.id),
              },
          course.status === 'Archived'
            ? {
                id: 'restore',
                label: 'Restore Course',
                icon: <RotateCcw className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />,
                onClick: () => onRestore(course.id),
              }
            : {
                id: 'archive',
                label: 'Archive Course',
                icon: <Archive className="w-3.5 h-3.5 text-[#686E7D] dark:text-slate-400" />,
                onClick: () => onArchive(course.id),
              },
          {
            id: 'delete',
            label: 'Delete Course',
            icon: <Trash2 className="w-3.5 h-3.5 text-[#DC5B3E] dark:text-rose-400" />,
            danger: true,
            onClick: () => onDelete(course),
          },
        ];

        return (
          <div
            key={course.id}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col group relative ${
              isSelected
                ? 'bg-[#EAF0FE] dark:bg-[#121f3f] border-blue-500 shadow-xl shadow-blue-500/10'
                : 'bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-[#233044] border-[#E6E8EE] dark:border-[#334155] hover:border-slate-300 dark:hover:border-slate-600 shadow-lg'
            }`}
          >
            {/* Top Image Banner */}
            <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-900">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 dark:from-[#1E293B] via-transparent to-black/40" />

              {/* Checkbox overlay */}
              <div className="absolute top-3 left-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelectOne(course.id)}
                  className="rounded border-slate-700 bg-black/60 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Badges on top */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500 text-slate-950 shadow-md">
                  FREE
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md ${
                    course.status === 'Published'
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                      : course.status === 'Draft'
                      ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                      : 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
                  }`}
                >
                  {course.status}
                </span>
              </div>

              {/* Class & Subject on bottom of image */}
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600/80 text-white backdrop-blur-sm">
                  {course.targetClass}
                </span>
                <Badge variant={getSubjectBadgeVariant(course.primarySubject)} size="sm">
                  {course.primarySubject}
                </Badge>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] font-mono text-[#686E7D] dark:text-slate-400 block mb-1">
                  {course.courseCode} • {course.courseType}
                </span>
                <h3
                  onClick={() => onView(course)}
                  className="font-bold text-[#12141C] dark:text-white text-sm hover:text-[#2451D9] dark:hover:text-blue-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
                  title={course.title}
                >
                  {course.title}
                </h3>
                <p className="text-[11px] text-[#686E7D] dark:text-slate-400 mt-1 line-clamp-2">
                  {course.shortDescription}
                </p>
              </div>

              {/* Instructor & Metrics */}
              <div className="pt-2 border-t border-[#E6E8EE] dark:border-[#334155] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      className="w-6 h-6 rounded-full object-cover border border-[#E6E8EE] dark:border-slate-700"
                    />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
                      {course.instructor.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#16A34A] dark:text-emerald-400 font-bold block uppercase">
                      ₹0.00 (Free)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#686E7D] dark:text-slate-400 pt-1">
                  <div
                    onClick={() => onViewEnrollments(course)}
                    className="flex items-center gap-1 hover:text-[#2451D9] dark:hover:text-blue-400 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-[#2451D9] dark:text-blue-400" />
                    <span>{course.enrollmentsCount.toLocaleString()} Students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#686E7D] dark:text-slate-400" />
                    <span>{course.duration}</span>
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="pt-2 border-t border-[#E6E8EE] dark:border-[#334155] flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1 flex-1">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => onView(course)}
                    className="flex-1"
                    icon={<Eye className="w-3 h-3 text-blue-500 dark:text-blue-400" />}
                  >
                    View
                  </Button>
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => onEdit(course)}
                    className="flex-1"
                    icon={<Edit3 className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />}
                  >
                    Edit
                  </Button>
                </div>

                <Dropdown
                  trigger={
                    <button
                      className="p-1.5 rounded-lg text-[#686E7D] dark:text-slate-400 hover:text-[#12141C] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="More Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  }
                  items={dropdownItems}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
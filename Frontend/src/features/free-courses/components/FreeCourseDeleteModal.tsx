import React from 'react';
import type { FreeCourse } from '../types/free-course.types';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { AlertTriangle, Archive, Trash2 } from 'lucide-react';

interface FreeCourseDeleteModalProps {
  course: FreeCourse | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (id: string) => void;
  onArchiveInstead?: (id: string) => void;
}

export const FreeCourseDeleteModal: React.FC<FreeCourseDeleteModalProps> = ({
  course,
  isOpen,
  onClose,
  onConfirmDelete,
  onArchiveInstead,
}) => {
  if (!course) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 shrink-0 text-[#DC5B3E] dark:text-rose-400" />
          <span className="text-base font-bold">Delete Free Course?</span>
        </div>
      }
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full">
          {onArchiveInstead && course.status !== 'Archived' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onArchiveInstead(course.id);
                onClose();
              }}
              icon={<Archive className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />}
            >
              Archive Instead
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                onConfirmDelete(course.id);
                onClose();
              }}
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Are you sure you want to permanently delete{' '}
          <strong className="text-[#12141C] dark:text-white font-bold">"{course.title}"</strong> (
          {course.courseCode})?
        </p>

        <div className="p-3 bg-[#FCEAE4] dark:bg-rose-500/10 border border-[#DC5B3E]/30 dark:border-rose-500/30 rounded-xl text-xs text-[#DC5B3E] dark:text-rose-300 space-y-1">
          <p className="font-semibold">⚠️ Irreversible Action:</p>
          <ul className="list-disc list-inside text-[11px] space-y-0.5">
            <li>All modules, chapters, and attached study notes will be removed.</li>
            <li>Current enrollments ({course.enrollmentsCount} students) will lose course access.</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
import React, { useState, useEffect } from 'react';
import type { FreeCourse } from '../types/free-course.types';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { ArrowUp, ArrowDown, Save } from 'lucide-react';
import { useFreeToast as useToast } from '../hooks/useFreeToast';

interface FreeCourseReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: FreeCourse[];
  onSaveOrder: (reorderedCourses: FreeCourse[]) => void;
}

export const FreeCourseReorderModal: React.FC<FreeCourseReorderModalProps> = ({
  isOpen,
  onClose,
  courses,
  onSaveOrder,
}) => {
  const { success } = useToast();
  const [items, setItems] = useState<FreeCourse[]>([]);

  useEffect(() => {
    if (isOpen) {
      setItems([...courses]);
    }
  }, [isOpen, courses]);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setItems(updated);
  };

  const handleSave = () => {
    onSaveOrder(items);
    success('Sequence Updated', 'Course display order saved successfully.');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className="text-base font-bold">Reorder Course Sequence</span>
          <span className="text-xs px-2 py-0.5 rounded bg-[#EAF0FE] text-[#2451D9] dark:bg-blue-500/20 dark:text-blue-400 font-bold">
            Live Display Order
          </span>
        </div>
      }
      subtitle="Arrange the priority sequence in which free courses appear to students on the Fukey Education app and website."
      maxWidth="2xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} icon={<Save className="w-4 h-4" />}>
            Save Sequence Order
          </Button>
        </>
      }
    >
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {items.map((course, idx) => (
          <div
            key={course.id}
            className="flex items-center justify-between p-3 rounded-xl bg-[#F6F7FA] dark:bg-[#0B0F19] border border-[#E6E8EE] dark:border-[#334155] hover:border-[#D1D5DB] dark:hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-600 dark:text-slate-300 shrink-0">
                #{idx + 1}
              </span>
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-10 h-10 rounded-lg object-cover border border-[#E6E8EE] dark:border-slate-700 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#12141C] dark:text-white truncate">{course.title}</p>
                <p className="text-[11px] text-[#686E7D] dark:text-slate-400">
                  {course.targetClass} • {course.primarySubject} • {course.instructor.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-3">
              <button
                type="button"
                onClick={() => moveItem(idx, 'up')}
                disabled={idx === 0}
                className="p-1.5 rounded-lg border border-[#E6E8EE] dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-[#12141C] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Move Up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveItem(idx, 'down')}
                disabled={idx === items.length - 1}
                className="p-1.5 rounded-lg border border-[#E6E8EE] dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-[#12141C] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Move Down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};
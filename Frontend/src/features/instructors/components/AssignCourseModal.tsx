import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import type { Instructor, AssignedCourse } from '../types/instructor';

interface AssignCourseModalProps {
  instructor: Instructor | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignCourse: (course: AssignedCourse) => void;
}

export function AssignCourseModal({
  instructor,
  isOpen,
  onClose,
  onAssignCourse,
}: AssignCourseModalProps) {
  const [courseName, setCourseName] = useState('Class 10 Mathematics (Hindi & English Medium)');
  const [category, setCategory] = useState('Class 10th Board');
  const [batchTime, setBatchTime] = useState('Mon, Wed, Fri 4:00 PM');
  const [studentCount, setStudentCount] = useState(30);

  const availableCourses = [
    { name: 'Class 10 Mathematics (Hindi & English Medium)', category: 'Class 10th Board' },
    { name: 'Class 12 Advanced Physics (Hindi & English)', category: 'Class 12th Board' },
    { name: 'Class 11 Physics Foundation (Bilingual)', category: 'Class 11th' },
    { name: 'Class 12 Chemistry Organic & Inorganic (Hindi & English)', category: 'Class 12th' },
    { name: 'Class 9 Science Complete (Hindi & English Medium)', category: 'Class 9th' },
    { name: 'Class 12 Biology Genetics & Ecology (Hindi & English)', category: 'Class 12th' },
    { name: 'Class 10 English Literature & Grammar (Hindi & English)', category: 'Class 10th' },
    { name: 'Class 11-12 Python for Computer Science (Hindi & English)', category: 'Class 11-12th' },
    { name: 'Class 10 Hindi Vyakaran & Sahitya (Hindi & English Medium)', category: 'Class 10th' },
  ];

  const handleAssign = () => {
    onAssignCourse({
      id: `c-${Date.now()}`,
      name: courseName,
      category,
      studentCount,
      status: 'Active',
      batchTime,
      medium: 'Hindi & English Both',
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Course to Instructor"
      subtitle={instructor ? `Assign course to ${instructor.name}` : undefined}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Select Course *
          </label>
          <select
            value={courseName}
            onChange={(e) => {
              const selected = availableCourses.find((c) => c.name === e.target.value);
              setCourseName(e.target.value);
              if (selected) setCategory(selected.category);
            }}
            className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableCourses.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.category})
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Course Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <Input
          label="Batch Schedule / Timings"
          value={batchTime}
          onChange={(e) => setBatchTime(e.target.value)}
          placeholder="e.g. Mon, Wed, Fri 4:00 PM"
        />

        <Input
          label="Initial Student Enrollment"
          type="number"
          value={studentCount}
          onChange={(e) => setStudentCount(Number(e.target.value) || 0)}
        />

        <div className="pt-3 border-t border-slate-100 dark:border-[#1e2c4c] flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleAssign}>
            Assign Course
          </Button>
        </div>
      </div>
    </Modal>
  );
}

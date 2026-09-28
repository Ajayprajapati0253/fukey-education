import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Clock } from 'lucide-react';
import type { Student } from '../types';

interface ExtendAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  selectedCount?: number;
  onConfirm: (durationYears: number) => void;
}

export const ExtendAccessModal: React.FC<ExtendAccessModalProps> = ({ isOpen, onClose, student, selectedCount, onConfirm }) => {
  const [extension, setExtension] = useState('1');

  if (!isOpen) return null;

  const targetText = student ? student.name : `${selectedCount || 'all selected'} students`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Extend Course Access" maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl">
          <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0" />
          <div className="text-xs text-[#64748b] dark:text-gray-300">
            Extending access for <strong className="text-[#0f172a] dark:text-white">{targetText}</strong>.
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#0f172a] dark:text-gray-300 mb-1.5">Select Extension Period</label>
          <Select value={extension} onChange={(e) => setExtension(e.target.value)}>
            <option value="0.25">+ 3 Months Extension</option>
            <option value="0.5">+ 6 Months Extension</option>
            <option value="1">+ 1 Year Extension</option>
            <option value="2">+ 2 Years Extension</option>
          </Select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e2e8f0] dark:border-[#334155]">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            variant="warning"
            size="sm"
            onClick={() => {
              onConfirm(Number(extension));
              onClose();
            }}
          >
            Confirm Extension
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExtendAccessModal;
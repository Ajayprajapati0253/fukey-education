import React, { useState } from 'react';
import { Check, X, Archive, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';

interface FreeCourseBulkActionsProps {
  selectedCount: number;
  onPublish: () => void;
  onUnpublish: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

export const FreeCourseBulkActions: React.FC<FreeCourseBulkActionsProps> = ({
  selectedCount,
  onPublish,
  onUnpublish,
  onArchive,
  onDelete,
  onClearSelection,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="bg-[#EAF0FE] dark:bg-[#101b38] border border-[#2451D9]/30 dark:border-blue-500/40 rounded-2xl p-3 px-5 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2451D9] dark:bg-blue-500 animate-ping" />
          <span className="text-xs font-bold text-[#12141C] dark:text-white tracking-wide">
            {selectedCount} free course{selectedCount > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={onClearSelection}
            className="text-xs text-[#686E7D] dark:text-slate-400 hover:text-[#12141C] dark:hover:text-white underline cursor-pointer"
          >
            Clear selection
          </button>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onPublish}
            icon={<Check className="w-3.5 h-3.5 text-[#16A34A] dark:text-emerald-400" />}
          >
            Publish
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onUnpublish}
            icon={<X className="w-3.5 h-3.5 text-[#D97706] dark:text-amber-400" />}
          >
            Unpublish
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onArchive}
            icon={<Archive className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />}
          >
            Archive
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete ({selectedCount})
          </Button>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Bulk Deletion"
        maxWidth="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                onDelete();
                setShowDeleteModal(false);
              }}
            >
              Permanently Delete ({selectedCount})
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to permanently delete{' '}
          <strong className="text-[#12141C] dark:text-white font-bold">{selectedCount}</strong> selected
          free courses? This action cannot be undone and will remove all associated modules, chapters,
          and resources.
        </p>
      </Modal>
    </>
  );
};
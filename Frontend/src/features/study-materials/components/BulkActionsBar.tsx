import React from 'react';
import { CheckCircle, Clock, Archive, Trash2, X, RotateCcw } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onPublish: () => void;
  onUnpublish: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onPublish,
  onUnpublish,
  onArchive,
  onRestore,
  onDelete,
  onClear,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white rounded-xl shadow-2xl px-5 py-3 flex items-center gap-4 border border-slate-700/80 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
          {selectedCount}
        </span>
        <span className="text-xs font-semibold text-slate-200">Selected</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPublish}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white transition-colors cursor-pointer"
          title="Publish selected materials to student app"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Publish</span>
        </button>

        <button
          onClick={onUnpublish}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-600/90 hover:bg-amber-600 rounded-lg text-white transition-colors cursor-pointer"
          title="Move selected materials to draft"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Draft</span>
        </button>

        <button
          onClick={onArchive}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-600/90 hover:bg-purple-600 rounded-lg text-white transition-colors cursor-pointer"
          title="Archive selected materials"
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Archive</span>
        </button>

        <button
          onClick={onRestore}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors cursor-pointer"
          title="Restore selected materials"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore</span>
        </button>

        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-600 hover:bg-rose-500 rounded-lg text-white transition-colors cursor-pointer"
          title="Permanently remove selected materials"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>

      <button
        onClick={onClear}
        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors ml-1 cursor-pointer"
        title="Deselect all"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

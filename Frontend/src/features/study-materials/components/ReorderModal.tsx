import React, { useState, useEffect } from 'react';
import { X, ArrowUp, ArrowDown, Check, GripVertical, ListOrdered } from 'lucide-react';
import type { StudyMaterialItem } from '../types';

interface ReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: StudyMaterialItem[];
  onSaveOrder: (reorderedIds: string[]) => void;
}

export const ReorderModal: React.FC<ReorderModalProps> = ({
  isOpen,
  onClose,
  items,
  onSaveOrder,
}) => {
  const [orderedItems, setOrderedItems] = useState<StudyMaterialItem[]>([]);

  useEffect(() => {
    setOrderedItems([...items].sort((a, b) => a.order - b.order));
  }, [items, isOpen]);

  if (!isOpen) return null;

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...orderedItems];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    setOrderedItems(newItems);
  };

  const moveDown = (index: number) => {
    if (index === orderedItems.length - 1) return;
    const newItems = [...orderedItems];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    setOrderedItems(newItems);
  };

  const handleSave = () => {
    onSaveOrder(orderedItems.map((i) => i.id));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#334155] overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#334155]/60 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 dark:bg-[#2451D9]/20 dark:text-[#60A5FA] rounded-lg">
              <ListOrdered className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-gray-100">Reorder Display Sequence</h2>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Adjust the priority order in which materials appear to students.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {orderedItems.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700/50 border border-slate-200 dark:border-[#334155] rounded-xl transition-all shadow-2xs group"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-gray-300 text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <GripVertical className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-gray-100 line-clamp-1">{item.title}</div>
                  <div className="text-2xs text-slate-500 dark:text-gray-400">
                    {item.subject} • {item.grade} • {item.chapter}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveUp(idx)}
                  className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-[#2451D9]/20 hover:text-blue-600 dark:hover:text-[#60A5FA] hover:border-blue-300 dark:hover:border-[#2451D9]/40 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === orderedItems.length - 1}
                  onClick={() => moveDown(idx)}
                  className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-[#2451D9]/20 hover:text-blue-600 dark:hover:text-[#60A5FA] hover:border-blue-300 dark:hover:border-[#2451D9]/40 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-[#334155]/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-gray-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Apply Sequence</span>
          </button>
        </div>
      </div>
    </div>
  );
};
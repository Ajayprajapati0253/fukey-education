import React, { useState, useEffect } from 'react';
import { X, Check, Gauge, ArrowRight } from 'lucide-react';
import type { StudyMaterialItem } from '../types';

interface DifficultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: StudyMaterialItem | null;
  targetDifficulty?: 'Easy' | 'Medium' | 'Hard';
  onUpdateDifficulty: (id: string, difficulty: 'Easy' | 'Medium' | 'Hard') => void;
}

export const DifficultyModal: React.FC<DifficultyModalProps> = ({
  isOpen,
  onClose,
  material,
  targetDifficulty,
  onUpdateDifficulty,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  useEffect(() => {
    if (targetDifficulty) {
      setSelectedDifficulty(targetDifficulty);
    } else if (material) {
      setSelectedDifficulty((material.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium');
    }
  }, [material, targetDifficulty, isOpen]);

  if (!isOpen || !material) return null;

  const currentLevel = (material.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium';

  const handleConfirm = () => {
    onUpdateDifficulty(material.id, selectedDifficulty);
    onClose();
  };

  const tierMeta = {
    Easy: {
      badgeBg: 'bg-emerald-100 dark:bg-emerald-500/10',
      badgeText: 'text-emerald-800 dark:text-emerald-300',
      dotColor: 'bg-emerald-500',
      description: 'Foundational concepts, direct textbook formulas, definitions, and standard beginner exercises.',
    },
    Medium: {
      badgeBg: 'bg-amber-100 dark:bg-amber-500/10',
      badgeText: 'text-amber-800 dark:text-amber-300',
      dotColor: 'bg-amber-500',
      description: 'Standard board & terminal examination benchmark with two-step reasoning, derivations, and mixed numericals.',
    },
    Hard: {
      badgeBg: 'bg-rose-100 dark:bg-rose-500/10',
      badgeText: 'text-rose-800 dark:text-rose-300',
      dotColor: 'bg-rose-500',
      description: 'Higher Order Thinking Skills (HOTS), multi-concept integration, tricky analytical questions, and competitive exam drills.',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#334155] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#334155]/60 bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 dark:bg-[#2451D9]/20 dark:text-[#60A5FA] rounded-xl">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-gray-100">Update Difficulty Level</h2>
              <p className="text-2xs text-slate-500 dark:text-gray-400 line-clamp-1 max-w-xs">{material.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-[#334155] flex items-center justify-around">
            <div className="text-center">
              <span className="text-2xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                Current Level
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${tierMeta[currentLevel].badgeBg} ${tierMeta[currentLevel].badgeText}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${tierMeta[currentLevel].dotColor}`} />
                {currentLevel}
              </span>
            </div>

            <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />

            <div className="text-center">
              <span className="text-2xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                New Target Level
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${tierMeta[selectedDifficulty].badgeBg} ${tierMeta[selectedDifficulty].badgeText}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${tierMeta[selectedDifficulty].dotColor}`} />
                {selectedDifficulty}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-2">
              Select or Confirm Target Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Easy', 'Medium', 'Hard'] as const).map((lvl) => {
                const isSelected = selectedDifficulty === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedDifficulty(lvl)}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      isSelected
                        ? lvl === 'Easy'
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-100 dark:ring-emerald-500/20'
                          : lvl === 'Hard'
                          ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-500 text-rose-800 dark:text-rose-300 ring-2 ring-rose-100 dark:ring-rose-500/20'
                          : 'bg-amber-50 dark:bg-amber-500/10 border-amber-500 text-amber-800 dark:text-amber-300 ring-2 ring-amber-100 dark:ring-amber-500/20'
                        : 'bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#334155] text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${tierMeta[lvl].dotColor}`} />
                    <span>{lvl}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-[#334155] text-xs text-slate-600 dark:text-gray-400 space-y-1">
            <span className="font-bold text-slate-800 dark:text-gray-100 block text-2xs uppercase tracking-wider">
              Curriculum Standard:
            </span>
            <p className="leading-relaxed">{tierMeta[selectedDifficulty].description}</p>
          </div>

          <p className="text-2xs text-slate-400 dark:text-slate-500 text-center">
            Clicking <strong>Close</strong> will cancel this change with no effect on the material.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-[#334155]/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-gray-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Update Difficulty</span>
          </button>
        </div>
      </div>
    </div>
  );
};
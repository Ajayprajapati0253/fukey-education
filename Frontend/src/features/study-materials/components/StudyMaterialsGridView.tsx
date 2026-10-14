import React, { useState } from 'react';
import {
  Eye,
  Edit2,
  Trash2,
  Upload,
  Archive,
  RotateCcw,
  Flame,
  CheckCircle,
  Clock,
  ChevronDown,
  Check,
} from 'lucide-react';
import type { StudyMaterialItem } from '../types';

interface GridProps {
  items: StudyMaterialItem[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onPreview: (item: StudyMaterialItem) => void;
  onEdit: (item: StudyMaterialItem) => void;
  onRequestChangeDifficulty?: (item: StudyMaterialItem, target: 'Easy' | 'Medium' | 'Hard') => void;
  onReplaceFile: (item: StudyMaterialItem) => void;
  onTogglePublish: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onDelete: (item: StudyMaterialItem) => void;
}

const STATUS_CHIP = {
  published:
    'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30 dark:hover:bg-emerald-500/20',
  draft:
    'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30 dark:hover:bg-amber-500/20',
  archived:
    'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/30 dark:hover:bg-purple-500/20',
};

const DIFF_CHIP = {
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30 dark:hover:bg-emerald-500/20',
  Hard: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30 dark:hover:bg-rose-500/20',
  Medium:
    'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30 dark:hover:bg-amber-500/20',
};

const ICON_BTN =
  'p-1.5 text-slate-400 dark:text-slate-500 rounded-lg transition-colors cursor-pointer';

export const StudyMaterialsGridView: React.FC<GridProps> = ({
  items,
  selectedIds,
  onToggleSelect,
  onPreview,
  onEdit,
  onRequestChangeDifficulty,
  onReplaceFile,
  onTogglePublish,
  onToggleArchive,
  onDelete,
}) => {
  const [openDifficultyId, setOpenDifficultyId] = useState<string | null>(null);

  const handleDifficultyOptionClick = (item: StudyMaterialItem, level: 'Easy' | 'Medium' | 'Hard') => {
    setOpenDifficultyId(null);
    if (item.difficulty === level) return;
    onRequestChangeDifficulty?.(item, level);
  };

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
      {items.map((item) => {
        const isSelected = selectedIds.has(item.id);
        const isDiffOpen = openDifficultyId === item.id;
        const diffKey = (item.difficulty || 'Medium') as 'Easy' | 'Medium' | 'Hard';

        return (
          <div
            key={item.id}
            className={`bg-white dark:bg-[#1E293B] border rounded-xl p-4 shadow-2xs transition-all flex flex-col justify-between relative group hover:shadow-md ${
              isSelected
                ? 'border-blue-500 ring-2 ring-blue-100 dark:ring-[#2451D9]/20'
                : 'border-[#e2e8f0] dark:border-[#334155] hover:border-slate-300 dark:hover:border-slate-500'
            } ${item.status === 'archived' ? 'opacity-75 bg-slate-50 dark:bg-slate-800/50' : ''}`}
          >
            <div>
              {/* Header row */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(item.id)}
                    className="rounded border-slate-300 dark:border-slate-600 dark:bg-[#0F172A] text-[#3b82f6] focus:ring-[#3b82f6] h-4 w-4 cursor-pointer flex-shrink-0"
                  />
                  <span
                    className="min-w-0 truncate text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-[#2451D9]/20 dark:text-[#60A5FA]"
                    title={item.type.replace('-', ' ')}
                  >
                    {item.type.replace('-', ' ')}
                  </span>
                  {item.isImportant && (
                    <span title="High Yield" className="text-amber-500 flex-shrink-0">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" />
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onTogglePublish(item.id)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize cursor-pointer flex-shrink-0 whitespace-nowrap transition-colors ${STATUS_CHIP[item.status]}`}
                  title="Click to toggle status"
                >
                  {item.status === 'published' ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                  <span>{item.status}</span>
                </button>
              </div>

              {/* Thumbnail */}
              {item.thumbnailUrl && (
                <div
                  onClick={() => onPreview(item)}
                  className="w-full h-32 rounded-lg overflow-hidden mb-3 border border-[#e2e8f0] dark:border-[#334155] bg-slate-100 dark:bg-slate-800 relative cursor-pointer group/thumb"
                  title="Click to preview material"
                >
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-end p-2.5">
                    <span className="text-white text-[11px] font-semibold flex items-center gap-1 bg-slate-900/70 px-2 py-0.5 rounded backdrop-blur-xs">
                      <Eye className="w-3 h-3" /> Quick Preview
                    </span>
                  </div>
                </div>
              )}

              {/* Title */}
              <h4
                onClick={() => onPreview(item)}
                className="text-sm font-semibold text-[#0f172a] dark:text-gray-100 hover:text-[#3b82f6] dark:hover:text-[#60A5FA] transition-colors cursor-pointer line-clamp-2 leading-snug"
              >
                {item.title}
              </h4>

              <div className="text-xs text-[#64748b] dark:text-gray-400 mt-1 line-clamp-1">
                {item.chapter} {item.topic && `• ${item.topic}`}
              </div>

              {/* Tags & Metadata */}
              <div className="flex items-center gap-1.5 mt-3 text-xs text-[#64748b] dark:text-gray-400 flex-wrap">
                <div className="relative inline-block text-left">
                  <button
                    type="button"
                    onClick={() => setOpenDifficultyId(isDiffOpen ? null : item.id)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${DIFF_CHIP[diffKey]}`}
                    title="Click to change difficulty level"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.difficulty === 'Easy'
                          ? 'bg-emerald-500'
                          : item.difficulty === 'Hard'
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    <span>{item.difficulty || 'Medium'}</span>
                    <ChevronDown
                      className={`w-3 h-3 text-slate-400 dark:text-slate-500 ${isDiffOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isDiffOpen && (
                    <div className="absolute left-0 top-full mt-1 w-36 bg-white dark:bg-[#1E293B] rounded-lg shadow-xl border border-[#e2e8f0] dark:border-[#334155] py-1.5 z-30">
                      {(['Easy', 'Medium', 'Hard'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleDifficultyOptionClick(item, lvl)}
                          className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left cursor-pointer transition-colors ${
                            item.difficulty === lvl
                              ? 'bg-slate-100 dark:bg-slate-800 font-semibold text-[#0f172a] dark:text-gray-100'
                              : 'text-slate-700 dark:text-gray-300 hover:bg-[#f8f9ff] dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                lvl === 'Easy' ? 'bg-emerald-500' : lvl === 'Hard' ? 'bg-rose-500' : 'bg-amber-500'
                              }`}
                            />
                            <span>{lvl}</span>
                          </div>
                          {item.difficulty === lvl && (
                            <Check className="w-3 h-3 text-[#3b82f6] dark:text-[#60A5FA]" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <span className="px-2 py-0.5 text-[11px] bg-slate-100 dark:bg-slate-800 rounded-md font-semibold text-slate-700 dark:text-gray-300">
                  {item.subject}
                </span>

                <span className="px-2 py-0.5 text-[11px] bg-slate-100 dark:bg-slate-800 rounded-md font-medium text-[#64748b] dark:text-gray-400">
                  {item.grade}
                </span>

                <span className="px-2 py-0.5 text-[11px] bg-blue-50 text-blue-700 dark:bg-[#2451D9]/20 dark:text-[#60A5FA] font-bold rounded uppercase">
                  {item.fileFormat}
                </span>

                <span className="text-[11px] text-slate-400 dark:text-gray-500">{item.fileSize}</span>
              </div>
            </div>

            {/* Bottom row */}
            <div className="pt-3 mt-3 border-t border-[#e2e8f0] dark:border-[#334155] flex items-center justify-between gap-2 text-xs text-slate-400 dark:text-gray-500">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span>{item.downloadCount} DLs</span>
                <span>•</span>
                <span>{item.viewCount} Views</span>
              </div>

              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  onClick={() => onPreview(item)}
                  className={`${ICON_BTN} hover:text-[#0f172a] dark:hover:text-gray-100 hover:bg-slate-100 dark:hover:bg-slate-700`}
                  title="Quick View"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onEdit(item)}
                  className={`${ICON_BTN} hover:text-[#3b82f6] dark:hover:text-[#60A5FA] hover:bg-blue-50 dark:hover:bg-[#2451D9]/20`}
                  title="Edit Material"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onReplaceFile(item)}
                  className={`${ICON_BTN} hover:text-[#3b82f6] dark:hover:text-[#60A5FA] hover:bg-blue-50 dark:hover:bg-[#2451D9]/20`}
                  title="Replace File"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onToggleArchive(item.id)}
                  className={`${ICON_BTN} hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10`}
                  title={item.status === 'archived' ? 'Restore Material' : 'Archive Material'}
                >
                  {item.status === 'archived' ? (
                    <RotateCcw className="w-3.5 h-3.5" />
                  ) : (
                    <Archive className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  onClick={() => onDelete(item)}
                  className={`${ICON_BTN} hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10`}
                  title="Delete Material"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Download,
  Eye,
  MoreVertical,
  Edit2,
  Trash2,
  Upload,
  Archive,
  RotateCcw,
  CheckCircle,
  Clock,
  Flame,
  ChevronDown,
  Check,
} from 'lucide-react';
import type { StudyMaterialItem } from '../types';

interface TableProps {
  items: StudyMaterialItem[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onPreview: (item: StudyMaterialItem) => void;
  onEdit: (item: StudyMaterialItem) => void;
  onRequestChangeDifficulty: (item: StudyMaterialItem, targetDifficulty: 'Easy' | 'Medium' | 'Hard') => void;
  onReplaceFile: (item: StudyMaterialItem) => void;
  onTogglePublish: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onDelete: (item: StudyMaterialItem) => void;
  onAddNew: () => void;
}

const TH =
  'py-3 px-3 text-xs font-semibold text-[#64748b] dark:text-gray-400 uppercase tracking-wider whitespace-nowrap';

const CHECKBOX =
  'rounded border-slate-300 dark:border-slate-600 dark:bg-[#0F172A] text-[#3b82f6] focus:ring-[#3b82f6] h-4 w-4 cursor-pointer';

const MENU_ITEM =
  'w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left text-slate-700 dark:text-gray-300 hover:bg-[#f8f9ff] dark:hover:bg-slate-700/50 cursor-pointer';

const DIFF_CHIP = {
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30 dark:hover:bg-emerald-500/20',
  Hard: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30 dark:hover:bg-rose-500/20',
  Medium:
    'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30 dark:hover:bg-amber-500/20',
};

const STATUS_CHIP = {
  published:
    'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30 dark:hover:bg-emerald-500/20',
  draft:
    'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30 dark:hover:bg-amber-500/20',
  archived:
    'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-gray-300 dark:border-[#334155] dark:hover:bg-slate-700',
};

export const StudyMaterialsTable: React.FC<TableProps> = ({
  items,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onPreview,
  onEdit,
  onRequestChangeDifficulty,
  onReplaceFile,
  onTogglePublish,
  onToggleArchive,
  onDelete,
  onAddNew,
}) => {
  const [openDifficultyDropdownId, setOpenDifficultyDropdownId] = useState<string | null>(null);
  const [openMoreActionsId, setOpenMoreActionsId] = useState<string | null>(null);

  const tableRef = useRef<HTMLDivElement>(null);

  // Close open dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        setOpenDifficultyDropdownId(null);
        setOpenMoreActionsId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const handleDifficultyOptionClick = (item: StudyMaterialItem, level: 'Easy' | 'Medium' | 'Hard') => {
    setOpenDifficultyDropdownId(null);
    if (item.difficulty === level) {
      return;
    }
    onRequestChangeDifficulty(item, level);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1E293B] border border-[#e2e8f0] dark:border-[#334155] rounded-xl p-10 text-center shadow-2xs">
        <div className="w-10 h-10 bg-blue-50 text-[#3b82f6] dark:bg-[#2451D9]/20 dark:text-[#60A5FA] rounded-xl flex items-center justify-center mx-auto mb-2.5">
          <FileText className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-300">No study materials found</h3>
        <p className="text-xs text-slate-400 dark:text-gray-500 max-w-sm mx-auto mt-1 mb-4">
          No records match your active search or filters. You can adjust filters or upload a new resource.
        </p>
        <button
          onClick={onAddNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <span>+ Create New Material</span>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={tableRef}
      className="bg-white dark:bg-[#1E293B] border border-[#e2e8f0] dark:border-[#334155] rounded-xl shadow-2xs overflow-visible"
    >
      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full min-w-[1000px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-[#e2e8f0] dark:border-[#334155]">
              <th className="py-3 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={onToggleSelectAll}
                  className={CHECKBOX}
                />
              </th>
              <th className={`${TH} w-12 text-center`}>Seq</th>
              <th className={TH}>Title & Curriculum Details</th>
              <th className={TH}>Subject & Grade</th>
              <th className={TH}>Document / File</th>
              <th className={TH}>Metrics</th>
              <th className={TH}>Difficulty</th>
              <th className={TH}>Status</th>
              <th className={`${TH} px-4 text-center w-44`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0] dark:divide-[#334155] text-sm">
            {items.map((item) => {
              const isSelected = selectedIds.has(item.id);
              const isDifficultyOpen = openDifficultyDropdownId === item.id;
              const isMoreOpen = openMoreActionsId === item.id;
              const diffKey = (item.difficulty || 'Medium') as 'Easy' | 'Medium' | 'Hard';

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                    isSelected
                      ? 'bg-blue-50/40 dark:bg-blue-500/5'
                      : item.status === 'archived'
                      ? 'bg-slate-50/50 dark:bg-slate-800/40 opacity-80'
                      : ''
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="py-2.5 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(item.id)}
                      className={CHECKBOX}
                    />
                  </td>

                  {/* Order Seq */}
                  <td className="py-2.5 px-2 text-center font-mono text-xs font-medium text-slate-500 dark:text-gray-400">
                    #{item.order}
                  </td>

                  {/* Title & Curriculum Details */}
                  <td className="py-2.5 px-3 w-[300px] max-w-[300px]">
                    <div className="flex items-center gap-2.5">
                      <div
                        onClick={() => onPreview(item)}
                        className="w-9 h-9 rounded-lg overflow-hidden border border-[#e2e8f0] dark:border-[#334155] bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center cursor-pointer shadow-2xs hover:border-[#3b82f6] transition-colors"
                        title="Click to preview resource"
                      >
                        {item.thumbnailUrl ? (
                          <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {item.isImportant && (
                            <span title="High-Yield Resource" className="text-amber-500 flex-shrink-0">
                              <Flame className="w-3.5 h-3.5 fill-amber-500" />
                            </span>
                          )}
                          <div
                            onClick={() => onPreview(item)}
                            className="font-medium text-sm text-[#0f172a] dark:text-gray-100 hover:text-[#3b82f6] cursor-pointer truncate transition-colors min-w-0"
                            title={item.title}
                          >
                            {item.title}
                          </div>
                        </div>
                        <div className="text-xs text-[#64748b] dark:text-gray-400 truncate mt-0.5">
                          <span className="font-medium text-slate-700 dark:text-gray-300">{item.chapter}</span>
                          {item.topic && <span> • {item.topic}</span>}
                          {item.author && <span> • By {item.author}</span>}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Subject & Grade */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5 items-start">
                      <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300">
                        {item.subject}
                      </span>
                      <span className="text-xs text-[#64748b] dark:text-gray-400 font-medium">{item.grade}</span>
                    </div>
                  </td>

                  {/* Document / File */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 text-xs font-bold rounded bg-blue-50 text-blue-700 dark:bg-[#2451D9]/20 dark:text-[#60A5FA] uppercase">
                          {item.fileFormat}
                        </span>
                        <span className="text-xs text-[#64748b] dark:text-gray-400 font-mono">{item.fileSize}</span>
                      </div>
                      <div
                        className="text-xs text-slate-400 dark:text-gray-500 truncate max-w-[120px]"
                        title={item.fileName}
                      >
                        {item.fileName}
                      </div>
                    </div>
                  </td>

                  {/* Metrics */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5 text-xs text-[#64748b] dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        {item.questionsCount && (
                          <span className="font-semibold text-[#3b82f6] dark:text-[#60A5FA]">
                            {item.questionsCount} Qs
                          </span>
                        )}
                        {item.durationMinutes && (
                          <span className="text-[#64748b] dark:text-gray-400">
                            {item.durationMinutes}m | {item.totalMarks || 100}M
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 dark:text-gray-500">
                        <span className="flex items-center gap-0.5" title="Downloads">
                          <Download className="w-3 h-3" /> {item.downloadCount}
                        </span>
                        <span className="flex items-center gap-0.5" title="Views">
                          <Eye className="w-3 h-3" /> {item.viewCount}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Difficulty with Inline Dropdown */}
                  <td className="py-2.5 px-3 whitespace-nowrap relative">
                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMoreActionsId(null);
                          setOpenDifficultyDropdownId(isDifficultyOpen ? null : item.id);
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-2xs hover:scale-105 ${DIFF_CHIP[diffKey]}`}
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
                          className={`w-3 h-3 transition-transform text-slate-400 dark:text-slate-500 ${
                            isDifficultyOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Dropdown with 3 options: Easy, Medium, Hard */}
                      {isDifficultyOpen && (
                        <div
                          className="absolute left-0 mt-1 w-36 bg-white dark:bg-[#1E293B] rounded-lg shadow-xl border border-[#e2e8f0] dark:border-[#334155] py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                            Select Level
                          </div>
                          {(['Easy', 'Medium', 'Hard'] as const).map((lvl) => {
                            const isCurrent = item.difficulty === lvl;
                            return (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => handleDifficultyOptionClick(item, lvl)}
                                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left cursor-pointer transition-colors ${
                                  isCurrent
                                    ? 'bg-slate-100 dark:bg-slate-800 font-semibold text-[#0f172a] dark:text-gray-100'
                                    : 'text-slate-700 dark:text-gray-300 hover:bg-[#f8f9ff] dark:hover:bg-slate-700/50'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      lvl === 'Easy'
                                        ? 'bg-emerald-500'
                                        : lvl === 'Hard'
                                        ? 'bg-rose-500'
                                        : 'bg-amber-500'
                                    }`}
                                  />
                                  <span>{lvl}</span>
                                </div>
                                {isCurrent && <Check className="w-3 h-3 text-[#3b82f6] dark:text-[#60A5FA]" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status pill with dot */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <button
                      onClick={() => onTogglePublish(item.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize transition-colors cursor-pointer border ${STATUS_CHIP[item.status]}`}
                      title="Click to toggle status (Published / Draft)"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'published'
                            ? 'bg-emerald-500'
                            : item.status === 'draft'
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span>{item.status}</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-4 text-center whitespace-nowrap w-44">
                    <div className="flex items-center justify-center gap-1.5 relative">
                      <button
                        type="button"
                        onClick={() => onPreview(item)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors cursor-pointer shadow-xs"
                        title="View & Download Document"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-gray-300 bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-[#e2e8f0] dark:border-[#334155] hover:border-slate-300 dark:hover:border-slate-500 rounded-md transition-colors cursor-pointer shadow-2xs"
                        title="Edit Study Material"
                      >
                        <Edit2 className="w-3 h-3 text-[#64748b] dark:text-gray-400" />
                        <span>Edit</span>
                      </button>

                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDifficultyDropdownId(null);
                            setOpenMoreActionsId(isMoreOpen ? null : item.id);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-[#64748b] dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#0f172a] dark:hover:text-gray-100 transition-colors cursor-pointer"
                          title="More Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* More Actions Dropdown Menu */}
                        {isMoreOpen && (
                          <div
                            className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#1E293B] rounded-lg shadow-xl border border-[#e2e8f0] dark:border-[#334155] py-1.5 z-30 text-xs text-left animate-in fade-in zoom-in-95 duration-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMoreActionsId(null);
                                onReplaceFile(item);
                              }}
                              className={MENU_ITEM}
                            >
                              <Upload className="w-3.5 h-3.5 text-slate-500" />
                              <span>Replace File</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenMoreActionsId(null);
                                onTogglePublish(item.id);
                              }}
                              className={MENU_ITEM}
                            >
                              {item.status === 'published' ? (
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              )}
                              <span>{item.status === 'published' ? 'Move to Draft' : 'Publish Material'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenMoreActionsId(null);
                                onToggleArchive(item.id);
                              }}
                              className={MENU_ITEM}
                            >
                              {item.status === 'archived' ? (
                                <RotateCcw className="w-3.5 h-3.5 text-purple-500" />
                              ) : (
                                <Archive className="w-3.5 h-3.5 text-purple-500" />
                              )}
                              <span>{item.status === 'archived' ? 'Restore Material' : 'Archive Material'}</span>
                            </button>

                            <div className="my-1 border-t border-[#e2e8f0] dark:border-[#334155]" />

                            <button
                              type="button"
                              onClick={() => {
                                setOpenMoreActionsId(null);
                                onDelete(item);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Delete Material</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
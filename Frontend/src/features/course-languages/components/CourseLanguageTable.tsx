import React from 'react';
import {
  Check,
  Edit2,
  MoreVertical,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import type { CourseLanguage } from '../types/course-language.types';

interface Props {
  languages: CourseLanguage[];
  selectedIds: number[];
  onToggleSelectAll: () => void;
  onToggleSelectRow: (id: number) => void;
  onEdit: (language: CourseLanguage) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number) => void;

  currentPage: number;
  setCurrentPage: (page: number) => void;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

const isActive = (status: number | boolean) =>
  status === 1 || status === true;

export const CourseLanguageTable: React.FC<Props> = ({
  languages,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectRow,
  onEdit,
  onDelete,
  onStatusChange,
  currentPage,
  setCurrentPage,
  perPage,
  totalItems,
  totalPages,
}) => {
  const allSelected =
    languages.length > 0 &&
    languages.every((item) =>
      selectedIds.includes(item.id),
    );

  const start =
    totalItems === 0
      ? 0
      : (currentPage - 1) * perPage + 1;

  const end = Math.min(
    currentPage * perPage,
    totalItems,
  );

  return (
    <div className="bg-white dark:bg-[#1E293B] border border-border-subtle dark:border-[#334155] rounded-2xl overflow-hidden shadow-2xs">
      <div className="px-5 py-4 border-b border-border-subtle dark:border-[#334155] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-ink dark:text-white">
            Course Languages
          </h2>

          <p className="text-xs text-ink-soft dark:text-[#94A3B8] mt-0.5">
            Manage languages available for courses.
          </p>
        </div>

        <span className="text-xs font-semibold text-ink-soft dark:text-[#94A3B8]">
          {totalItems} languages
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-subtle dark:border-[#334155] bg-slate-50/70 dark:bg-[#172033]">
              <th className="px-5 py-3 w-12">
                <button
                  type="button"
                  onClick={onToggleSelectAll}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                    allSelected
                      ? 'bg-brand border-brand'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {allSelected && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </button>
              </th>

              <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-ink-soft dark:text-[#94A3B8]">
                #
              </th>

              <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-ink-soft dark:text-[#94A3B8]">
                Language
              </th>

              <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-ink-soft dark:text-[#94A3B8]">
                Status
              </th>

              <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-ink-soft dark:text-[#94A3B8]">
                Created
              </th>

              <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-ink-soft dark:text-[#94A3B8]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {languages.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-16 text-center"
                >
                  <p className="text-sm font-semibold text-ink dark:text-white">
                    No course languages found
                  </p>

                  <p className="text-xs text-ink-soft dark:text-[#94A3B8] mt-1">
                    Try changing your filters or add a new language.
                  </p>
                </td>
              </tr>
            ) : (
              languages.map((language, index) => {
                const active = isActive(
                  language.status,
                );

                return (
                  <tr
                    key={language.id}
                    className="border-b last:border-b-0 border-border-subtle dark:border-[#334155] hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          onToggleSelectRow(language.id)
                        }
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          selectedIds.includes(
                            language.id,
                          )
                            ? 'bg-brand border-brand'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {selectedIds.includes(
                          language.id,
                        ) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </button>
                    </td>

                    <td className="px-3 py-4 text-xs font-semibold text-ink-soft dark:text-[#94A3B8]">
                      {(currentPage - 1) * perPage +
                        index +
                        1}
                    </td>

                    <td className="px-3 py-4">
                      <span className="text-sm font-bold text-ink dark:text-white">
                        {language.name}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          onStatusChange(language.id)
                        }
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          active
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {active ? (
                          <ToggleRight className="w-3.5 h-3.5" />
                        ) : (
                          <ToggleLeft className="w-3.5 h-3.5" />
                        )}

                        {active
                          ? 'Active'
                          : 'Inactive'}
                      </button>
                    </td>

                    <td className="px-3 py-4 text-xs text-ink-soft dark:text-[#94A3B8]">
                      {language.created_at
                        ? new Date(
                            language.created_at,
                          ).toLocaleDateString(
                            'en-IN',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            },
                          )
                        : '-'}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            onEdit(language)
                          }
                          className="p-2 rounded-lg text-ink-soft dark:text-[#94A3B8] hover:bg-[#EAF0FE] dark:hover:bg-[#2451D9]/20 hover:text-brand transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onDelete(language.id)
                          }
                          className="p-2 rounded-lg text-ink-soft dark:text-[#94A3B8] hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          className="p-2 rounded-lg text-ink-soft dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && (
        <div className="px-5 py-4 border-t border-border-subtle dark:border-[#334155] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-ink-soft dark:text-[#94A3B8]">
            Showing{' '}
            <span className="font-bold text-ink dark:text-white">
              {start}
            </span>{' '}
            to{' '}
            <span className="font-bold text-ink dark:text-white">
              {end}
            </span>{' '}
            of{' '}
            <span className="font-bold text-ink dark:text-white">
              {totalItems}
            </span>
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() =>
                setCurrentPage(currentPage - 1)
              }
              className="p-2 rounded-lg border border-border-subtle dark:border-[#334155] disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from(
              {
                length: Math.min(totalPages, 5),
              },
              (_, index) => {
                const page = index + 1;

                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() =>
                      setCurrentPage(page)
                    }
                    className={`min-w-8 h-8 rounded-lg text-xs font-bold ${
                      currentPage === page
                        ? 'bg-brand text-white'
                        : 'text-ink-soft dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {page}
                  </button>
                );
              },
            )}

            <button
              type="button"
              disabled={
                currentPage >= totalPages
              }
              onClick={() =>
                setCurrentPage(currentPage + 1)
              }
              className="p-2 rounded-lg border border-border-subtle dark:border-[#334155] disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
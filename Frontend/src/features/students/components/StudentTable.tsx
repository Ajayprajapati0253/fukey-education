import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit2, MoreVertical, ArrowUpDown, Clock, Mail, Trash2 } from 'lucide-react';
import type { Student } from '../types';
import { StudentAvatar } from './StudentAvatar';

interface StudentTableProps {
  students: Student[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectStudent: (id: string, checked: boolean) => void;
  onViewStudent: (student: Student) => void;
  onExtendAccess: (student: Student) => void;
  onSendEmail: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onSort?: (field: keyof Student) => void;  
}

const CHECKBOX = 'w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-blue-600 cursor-pointer';
const TH = 'py-3 px-3 text-xs font-semibold text-[#64748b] dark:text-gray-400 uppercase tracking-wider';
const SORT_ICON = 'w-3 h-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer';
const MENU_ITEM = 'w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer';

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  selectedIds,
  onSelectAll,
  onSelectStudent,
  onViewStudent,
  onExtendAccess,
  onSendEmail,
  onDeleteStudent,
}) => {
  const navigate = useNavigate();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const allSelected = students.length > 0 && selectedIds.length === students.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < students.length;
  const editPath = (id: string) => `/admin/users/students/${id}/edit`;

  const getCourseBadgeColor = (n: string) => {
    if (n.includes('Class 9th')) return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/80 dark:text-teal-300 dark:border-teal-800/60';
    if (n.includes('Class 10th')) return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/80 dark:text-blue-400 dark:border-blue-800/60';
    if (n.includes('Class 11th')) return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800/60';
    if (n.includes('Class 12th')) return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800/60';
    return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800/60';
  };

  const getProgressBarColor = (p: number) => {
    if (p >= 80) return 'bg-emerald-500';
    if (p >= 50) return 'bg-blue-500';
    if (p >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const statusCls = (s: string) =>
    s === 'Active'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
      : s === 'Expired'
      ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30'
      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30';

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#1E293B] shadow-2xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-[#e2e8f0] dark:border-[#334155] bg-slate-50/70 dark:bg-slate-800/40">
            <th className={`${TH} px-3.5 w-14`}>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className={CHECKBOX}
                />
                <span className="flex items-center gap-1">SN<ArrowUpDown className={SORT_ICON} /></span>
              </div>
            </th>
            <th className={`${TH} min-w-[140px]`}>
              <span className="flex items-center gap-1">Student Name<ArrowUpDown className={SORT_ICON} /></span>
            </th>
            <th className={`${TH} min-w-[170px]`}>Email / Phone</th>
            <th className={`${TH} min-w-[180px]`}>Courses (Enrolled)</th>
            <th className={`${TH} min-w-[100px]`}>
              <span className="flex items-center gap-1">Joined At<ArrowUpDown className={SORT_ICON} /></span>
            </th>
            <th className={`${TH} min-w-[105px]`}>Access Until</th>
            <th className={`${TH} min-w-[90px]`}>
              <span className="flex items-center gap-1">Status<ArrowUpDown className={SORT_ICON} /></span>
            </th>
            <th className={`${TH} min-w-[90px]`}>Progress</th>
            <th className={`${TH} text-right pr-4 min-w-[210px]`}>Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#e2e8f0] dark:divide-[#334155] text-[#0f172a] dark:text-gray-100">
          {students.map((student) => {
            const isSelected = selectedIds.includes(student.id);
            return (
              <tr
                key={student.id}
                className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                  isSelected ? 'bg-blue-50/40 dark:bg-blue-500/5' : ''
                }`}
              >
                <td className="py-3 px-3.5">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onSelectStudent(student.id, e.target.checked)}
                      className={CHECKBOX}
                    />
                    <span className="text-[#64748b] dark:text-gray-400 font-medium">{student.sn}</span>
                  </div>
                </td>

                <td className="py-3 px-3">
                  <div
                    onClick={() => navigate(editPath(student.id))}
                    className="flex items-center gap-2.5 cursor-pointer group"
                    title={`Edit ${student.name}`}
                  >
                    <StudentAvatar
                      name={student.name}
                      initials={student.initials}
                      avatarBgColor={student.avatarBgColor}
                      avatarUrl={student.avatarUrl}
                      size="md"
                    />
                    <span className="font-semibold text-[#0f172a] dark:text-gray-100 whitespace-nowrap group-hover:text-[#3b82f6] transition-colors">
                      {student.name}
                    </span>
                  </div>
                </td>

                <td className="py-3 px-3">
                  <div className="flex flex-col">
                    <span className="text-[#0f172a] dark:text-gray-100 font-medium truncate max-w-[160px]">{student.email}</span>
                    <span className="text-[#64748b] dark:text-gray-400 text-[11px] mt-0.5">{student.phone}</span>
                  </div>
                </td>

                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${getCourseBadgeColor(student.primaryCourse)}`}>
                      {student.primaryCourse}
                    </span>
                    {student.additionalCoursesCount > 0 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                        +{student.additionalCoursesCount}
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-3 px-3 text-[#0f172a] dark:text-gray-100 whitespace-nowrap">{student.joinedAt}</td>

                <td className="py-3 px-3 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-[#0f172a] dark:text-gray-100">{student.accessUntil}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">{student.accessPeriodLabel}</span>
                  </div>
                </td>

                <td className="py-3 px-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusCls(student.status)}`}>
                    {student.status}
                  </span>
                </td>

                <td className="py-3 px-3 whitespace-nowrap">
                  <div className="w-20">
                    <div className="text-[11px] font-medium text-[#0f172a] dark:text-gray-300 mb-1">{student.progress}%</div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full ${getProgressBarColor(student.progress)}`} style={{ width: `${student.progress}%` }} />
                    </div>
                  </div>
                </td>

                <td className="py-3 px-3 text-right pr-4 whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2 relative">
                    <button
                      type="button"
                      onClick={() => onViewStudent(student)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-all active:scale-95 cursor-pointer"
                      title="View Student Details"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(editPath(student.id))}
                      className="px-3 py-1.5 bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-[#e2e8f0] dark:border-[#334155] text-slate-700 dark:text-gray-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                      title={`Edit ${student.name}`}
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMenuId(activeMenuId === student.id ? null : student.id)}
                      className="w-7 h-7 flex items-center justify-center text-[#64748b] dark:text-gray-400 hover:text-[#0f172a] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                      title="More Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === student.id && (
                      <div
                        className="absolute right-0 top-8 z-30 w-44 bg-white dark:bg-[#1E293B] border border-[#e2e8f0] dark:border-[#334155] rounded-lg shadow-xl py-1.5 text-left animate-in fade-in zoom-in-95 duration-100"
                        onMouseLeave={() => setActiveMenuId(null)}
                      >
                        <button onClick={() => { setActiveMenuId(null); onViewStudent(student); }} className={MENU_ITEM}>
                          <Eye className="w-3.5 h-3.5 text-slate-500" />View Details
                        </button>
                        <button onClick={() => { setActiveMenuId(null); navigate(editPath(student.id)); }} className={MENU_ITEM}>
                          <Edit2 className="w-3.5 h-3.5 text-blue-500" />Edit Profile
                        </button>
                        <button onClick={() => { setActiveMenuId(null); onExtendAccess(student); }} className={MENU_ITEM}>
                          <Clock className="w-3.5 h-3.5 text-amber-500" />Extend Access
                        </button>
                        <button onClick={() => { setActiveMenuId(null); onSendEmail(student); }} className={MENU_ITEM}>
                          <Mail className="w-3.5 h-3.5 text-cyan-500" />Send Email
                        </button>
                        <div className="my-1 border-t border-[#e2e8f0] dark:border-[#334155]" />
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            if (confirm(`Are you sure you want to delete ${student.name}?`)) onDeleteStudent(student.id);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />Delete Student
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}

          {students.length === 0 && (
            <tr>
              <td colSpan={9} className="py-10 text-center text-[#64748b] dark:text-gray-400 text-sm">
                No students found matching your criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
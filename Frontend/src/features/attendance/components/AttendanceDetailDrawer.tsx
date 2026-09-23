import React, { useState, useEffect } from 'react';
import type { TeacherAttendanceRecord, AttendanceRule, ClassSession } from '../types';
import { ATTENDANCE_RULES } from '../data/attendanceData';
import { X, Calendar, ChevronLeft, ChevronRight, ChevronDown, ShieldCheck, Check, Info, Pencil, Trash2 } from 'lucide-react';

interface AttendanceDetailDrawerProps {
  teacher: TeacherAttendanceRecord | null;
  currentMonth: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onClose: () => void;
  isRulesExpanded: boolean;
  onToggleRules: () => void;
  rules?: AttendanceRule[];

  // Edit / Delete Attendance
  onEditAttendance: () => void;
  onEditSession: (session: ClassSession) => void;
  onDeleteSession: (session: ClassSession) => void;
}

export const AttendanceDetailDrawer: React.FC<AttendanceDetailDrawerProps> = ({
  teacher,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onClose,
  isRulesExpanded,
  onToggleRules,
  rules = ATTENDANCE_RULES,
  onEditAttendance,
  onEditSession,
  onDeleteSession,
}) => {
  // Which stat card is currently selected: 'All' | 'Present' | 'Absent'
  const [statusFilter, setStatusFilter] = useState<'All' | 'Present' | 'Absent'>('All');

  // Reset the filter whenever the selected teacher changes, so a stale
  // filter from the previous teacher doesn't silently carry over.
  useEffect(() => {
    setStatusFilter('All');
  }, [teacher?.id]);

  if (!teacher) {
    return (
      <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-xl p-6 text-center text-[#686E7D] dark:text-[#94A3B8]">
        Select a teacher to view details.
      </div>
    );
  }

  // Class-wise history filtered by the selected stat card
  const filteredClassHistory =
    teacher.classHistory?.filter((cls) => {
      if (statusFilter === 'All') return true;
      return cls.status === statusFilter;
    }) ?? [];

  // Calculate circular stroke values
  const radius = 13;
  const circumference = 2 * Math.PI * radius; // ~81.68
  const strokeDashoffset = circumference - (teacher.attendanceRate / 100) * circumference;

  return (
    <div
      id="attendance-detail-drawer"
      className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.15)] space-y-4"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-[#E6E8EE] dark:border-[#334155] pb-3 gap-2">
        <h3 className="text-sm font-bold text-[#12141C] dark:text-white tracking-tight">Teacher Attendance Details</h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="edit-attendance-btn"
            onClick={onEditAttendance}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2451D9] hover:bg-[#1e43b8] text-[11px] font-semibold text-white shadow-sm shadow-[#2451D9]/30 transition"
          >
            <Pencil className="w-3 h-3" />
            Edit Attendance
          </button>
          <button
            id="close-drawer-btn"
            onClick={onClose}
            className="text-[#686E7D] dark:text-[#94A3B8] hover:text-[#12141C] dark:hover:text-white p-1 rounded transition hover:bg-gray-100 dark:hover:bg-[#142038]"
            title="Close details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Profile Info Banner Card */}
      <div className="flex items-center gap-3 bg-[#F6F7FA] dark:bg-[#0F172A] border border-[#E6E8EE] dark:border-[#172749] p-3 rounded-lg">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#2451D9]/40 dark:border-blue-500/50 bg-gray-100 dark:bg-slate-800 shrink-0 flex items-center justify-center">
          {teacher.avatarUrl ? (
            <img
              alt={teacher.name}
              src={teacher.avatarUrl}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback to initials if image link breaks
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-sm font-bold ${teacher.avatarColor}`}>
              {teacher.initials}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-[#12141C] dark:text-white truncate">{teacher.name}</h4>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#172647] text-[#686E7D] dark:text-slate-400 border border-[#E6E8EE] dark:border-[#233760]">
              {teacher.id}
            </span>
          </div>
          <p className="text-xs text-[#686E7D] dark:text-[#94A3B8] mt-0.5">
            Subject: <span className="text-[#12141C] dark:text-slate-200">{teacher.subject}</span>
          </p>
        </div>
      </div>

      {/* Month Date Navigation */}
      <div className="flex items-center justify-center bg-[#F6F7FA] dark:bg-[#0F172A] border border-[#E6E8EE] dark:border-[#172749] rounded-lg px-3 py-1.5 text-xs text-[#12141C] dark:text-[#CBD5E1]">
        
        {/* Main spacing container using gap-4 (16px) or gap-6 (24px) */}
        <div className="flex items-center gap-4 text-[#686E7D] dark:text-[#94A3B8]">
          <button
            onClick={onPrevMonth}
            className="hover:text-[#12141C] dark:hover:text-white p-0.5 transition"
            title="Previous month"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#9DA2AF] dark:text-[#64748B]" />
            <span className="font-medium">{currentMonth}</span>
          </div>
          
          <button
            onClick={onNextMonth}
            className="hover:text-[#12141C] dark:hover:text-white p-0.5 transition"
            title="Next month"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* 4-Stat Box Grid with Circular Progress */}
      <div className="grid grid-cols-4 gap-2 bg-[#F6F7FA] dark:bg-[#0F172A] border border-[#E6E8EE] dark:border-[#172749] rounded-lg p-2.5 items-center">
        <button
          type="button"
          onClick={() => setStatusFilter('All')}
          title="Show all classes"
          className={`text-center rounded-md py-1 transition ${
            statusFilter === 'All'
              ? 'bg-[#2451D9]/10 dark:bg-blue-500/15 ring-1 ring-[#2451D9]/40 dark:ring-blue-400/40'
              : 'hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
        >
          <p className="text-[10px] text-[#686E7D] dark:text-[#94A3B8]">Total Classes</p>
          <p className="text-base font-bold text-[#12141C] dark:text-white mt-0.5">{teacher.totalClasses}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Present')}
          title="Show present classes only"
          className={`text-center border-l border-[#E6E8EE] dark:border-[#172749] rounded-md py-1 transition ${
            statusFilter === 'Present'
              ? 'bg-[#16A34A]/10 dark:bg-emerald-500/15 ring-1 ring-[#16A34A]/40 dark:ring-emerald-400/40'
              : 'hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
        >
          <p className="text-[10px] text-[#686E7D] dark:text-[#94A3B8]">Present</p>
          <p className="text-base font-bold text-[#16A34A] dark:text-emerald-400 mt-0.5">{teacher.presentClasses}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Absent')}
          title="Show absent classes only"
          className={`text-center border-l border-[#E6E8EE] dark:border-[#172749] rounded-md py-1 transition ${
            statusFilter === 'Absent'
              ? 'bg-[#DC5B3E]/10 dark:bg-rose-500/15 ring-1 ring-[#DC5B3E]/40 dark:ring-rose-400/40'
              : 'hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
        >
          <p className="text-[10px] text-[#686E7D] dark:text-[#94A3B8]">Absent</p>
          <p className="text-base font-bold text-[#DC5B3E] dark:text-rose-400 mt-0.5">{teacher.absentClasses}</p>
        </button>

        <div className="text-center border-l border-[#E6E8EE] dark:border-[#172749] flex flex-col items-center justify-center">
          <p className="text-[9px] text-[#686E7D] dark:text-[#94A3B8] leading-tight mb-1">Attendance Rate</p>
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg className="w-8 h-8 transform -rotate-90">
              <circle
                cx="16"
                cy="16"
                r={radius}
                fill="transparent"
                className="stroke-[#E6E8EE] dark:stroke-[#1c2d52]"
                strokeWidth="3"
              />
              <circle
                cx="16"
                cy="16"
                r={radius}
                fill="transparent"
                stroke={teacher.attendanceRate >= 75 ? '#16A34A' : '#DC5B3E'}
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute text-[9px] font-bold text-[#12141C] dark:text-white">
              {Math.round(teacher.attendanceRate)}%
            </span>
          </div>
        </div>
      </div>

      {/* Sub Section: Class-wise Attendance */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-[#12141C] dark:text-white tracking-tight">Class-wise Attendance</h4>
          {statusFilter !== 'All' && (
            <button
              type="button"
              onClick={() => setStatusFilter('All')}
              className="text-[10px] text-[#2451D9] dark:text-blue-400 hover:underline"
            >
              Clear filter ({statusFilter})
            </button>
          )}
        </div>
        <div className="overflow-x-auto border border-[#E6E8EE] dark:border-[#172749] rounded-lg bg-white dark:bg-[#09101f]">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#F6F7FA] dark:bg-[#0e172a] text-[10px] font-semibold text-[#686E7D] dark:text-[#94A3B8] border-b border-[#E6E8EE] dark:border-[#172749] uppercase">
              <tr>
                <th className="py-2 px-2">Class / Course</th>
                <th className="py-2 px-2">Chapter</th>
                <th className="py-2 px-1.5">Time</th>
                <th className="py-2 px-1.5">Joined - Left</th>
                <th className="py-2 px-1.5">Duration</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">Reason</th>
                <th className="py-2 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8EE] dark:divide-[#142038] text-[10px]">
              {filteredClassHistory.length > 0 ? (
                filteredClassHistory.map((cls) => (
                  <tr key={cls.id} className="hover:bg-gray-50 dark:hover:bg-[#0f1a33] transition">
                    <td className="py-2 px-2 font-medium text-[#12141C] dark:text-white">
                      {cls.classCourse}
                      <br />
                      <span className="text-[#686E7D] dark:text-slate-400 font-normal">{cls.subject}</span>
                    </td>
                    <td className="py-2 px-2 text-[#12141C]/80 dark:text-slate-300 max-w-[85px] truncate" title={cls.chapter}>
                      {cls.chapter}
                    </td>
                    <td className="py-2 px-1.5 text-[#12141C]/80 dark:text-slate-300">{cls.scheduledTime}</td>
                    <td className="py-2 px-1.5 text-[#12141C]/80 dark:text-slate-300 whitespace-nowrap">
                      {cls.joinedTime && cls.leftTime ? `${cls.joinedTime} - ${cls.leftTime}` : '—'}
                    </td>
                    <td className="py-2 px-1.5 text-[#12141C]/80 dark:text-slate-300">{cls.durationMinutes} min</td>
                    <td className="py-2 px-2">
                      {cls.status === 'Present' ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#E7F7ED] text-[#16A34A] border border-[#BFE9CD] dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30">
                          Present
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#FCEAE4] text-[#DC5B3E] border border-[#F5CFC0] dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30">
                          Absent
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-[#686E7D] dark:text-slate-400 whitespace-nowrap">{cls.reason}</td>
                    <td className="py-2 px-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEditSession(cls)}
                          title="Edit"
                          className="p-1 rounded bg-gray-100 dark:bg-[#101c38] hover:bg-gray-200 dark:hover:bg-[#182952] border border-[#E6E8EE] dark:border-[#203259] text-[#12141C] dark:text-slate-200 transition"
                        >
                          <Pencil className="w-2.5 h-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSession(cls)}
                          title="Delete"
                          className="p-1 rounded bg-[#FCEAE4] dark:bg-rose-500/10 hover:bg-[#f9ddd0] dark:hover:bg-rose-500/20 border border-[#F5CFC0] dark:border-rose-500/30 text-[#DC5B3E] dark:text-rose-400 transition"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-[#9DA2AF] dark:text-slate-500">
                    {teacher.classHistory && teacher.classHistory.length > 0
                      ? `No ${statusFilter.toLowerCase()} sessions found for this period.`
                      : 'No individual class sessions recorded for this period.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Rules Collapsible Card */}
      <div className="border border-[#E6E8EE] dark:border-[#172749] rounded-lg overflow-hidden bg-[#F6F7FA] dark:bg-[#0d162a]">
        {/* Accordion Header */}
        <div
          id="rules-accordion-toggle"
          onClick={onToggleRules}
          className="px-3 py-2 flex items-center justify-between border-b border-[#E6E8EE] dark:border-[#172749] cursor-pointer hover:bg-gray-100 dark:hover:bg-[#111f3d] transition"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-[#12141C] dark:text-white">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2451D9] dark:text-blue-400" />
            <span>Attendance Rules</span>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#686E7D] dark:text-slate-400 transition-transform duration-200 ${
              isRulesExpanded ? 'transform rotate-180' : ''
            }`}
          />
        </div>

        {/* Accordion Body */}
        {isRulesExpanded && (
          <div className="p-3 space-y-2.5 text-[11px]">
            {/* Rule 1: Present */}
            <div className="flex items-start justify-between gap-2 p-2 rounded bg-white dark:bg-[#09101f] border border-[#E6E8EE] dark:border-[#142038]">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-[#E7F7ED] dark:bg-emerald-500/20 text-[#16A34A] dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <div>
                  <span className="font-bold text-[#16A34A] dark:text-emerald-400">Present</span>
                  <p className="text-[#686E7D] dark:text-slate-400 text-[10px] mt-0.5">
                    Teacher completed 40 minutes or more of the scheduled class.
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[9px] text-[#9DA2AF] dark:text-slate-400 block">Minimum</span>
                <span className="text-[#12141C] dark:text-white font-bold text-[10px]">40 min</span>
              </div>
            </div>

            {/* Rule 2: Absent */}
            <div className="flex items-start justify-between gap-2 p-2 rounded bg-white dark:bg-[#09101f] border border-[#E6E8EE] dark:border-[#142038]">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-[#FCEAE4] dark:bg-rose-500/20 text-[#DC5B3E] dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <div>
                  <span className="font-bold text-[#DC5B3E] dark:text-rose-400">Absent</span>
                  <p className="text-[#686E7D] dark:text-slate-400 text-[10px] mt-0.5">
                    Teacher completed less than 40 minutes, did not join, or the class was cancelled.
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[9px] text-[#9DA2AF] dark:text-slate-400 block">Minimum</span>
                <span className="text-[#DC5B3E] dark:text-rose-400 font-bold text-[10px]">&lt; 40 min</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Info Note */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#EAF0FE] dark:bg-blue-950/40 border border-[#C7D7FB] dark:border-blue-800/40 text-[10px] text-[#2451D9] dark:text-blue-300">
        <Info className="w-4 h-4 text-[#2451D9] dark:text-blue-400 shrink-0" />
        <span>
          Attendance is calculated automatically from live class join/leave time. Use Edit Attendance to make a manual correction.
        </span>
      </div>
    </div>
  );
};
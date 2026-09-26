import React from 'react';
import type { TeacherAttendanceRecord, MonthlyAttendanceGrid, WeeklyAttendanceGrid, DayCellStatus } from '../types';
import { ChevronLeft, ChevronRight, Pencil, Trash2, Calendar } from 'lucide-react';
import { AttendanceMonthlyGrid } from './AttendanceMonthlyGrid';
import { AttendanceWeeklyGrid } from './AttendanceWeeklyGrid';

type AttendanceFrequency = 'Daily' | 'Weekly' | 'Monthly';

interface AttendanceTableProps {
  records: TeacherAttendanceRecord[];
  totalRecordsCount: number;
  currentPage: number;
  totalPages: number;
  selectedTeacherId: string;
  onSelectTeacher: (id: string) => void;
  onPageChange: (page: number) => void;
  activeFrequency: AttendanceFrequency;
  onFrequencyChange: (freq: AttendanceFrequency) => void;

  // Frequency-aware date navigation
  periodLabel: string;
  selectedDateIso: string;
  onPrevPeriod: () => void;
  onNextPeriod: () => void;
  onDateChange: (isoDateStr: string) => void;

  // Calendar-grid data
  monthlyGrid: MonthlyAttendanceGrid;
  weeklyGrid: WeeklyAttendanceGrid;

  // Calendar-grid day selection / edit
  selectedGridDate: string | null;
  onSelectGridDate: (isoDate: string) => void;
  onGridCellClick: (teacherId: string, isoDate: string, status: DayCellStatus) => void;

  // Daily table row → open Edit Attendance directly
  onEditRecord: (record: TeacherAttendanceRecord) => void;
  onDeleteRecord: (record: TeacherAttendanceRecord) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  totalRecordsCount,
  currentPage,
  totalPages,
  selectedTeacherId,
  onSelectTeacher,
  onPageChange,
  activeFrequency,
  onFrequencyChange,
  periodLabel,
  selectedDateIso,
  onPrevPeriod,
  onNextPeriod,
  onDateChange,
  monthlyGrid,
  weeklyGrid,
  selectedGridDate,
  onSelectGridDate,
  onGridCellClick,
  onEditRecord,
  onDeleteRecord,
}) => {
  const startCount = totalRecordsCount === 0 ? 0 : (currentPage - 1) * 10 + 1;
  const endCount = Math.min(currentPage * 10, totalRecordsCount);
  const isMonthly = activeFrequency === 'Monthly';
  const isWeekly = activeFrequency === 'Weekly';
  const isGridView = isMonthly || isWeekly;

  return (
    <div
      id="attendance-table-card"
      className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex flex-col"
    >
      {/* Table Card Header */}
      <div className="p-4 border-b border-[#E6E8EE] dark:border-[#334155] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {/* Frequency Toggle Pills */}
          <div className="flex items-center bg-[#F6F7FA] dark:bg-[#0F172A] border border-[#E6E8EE] dark:border-[#334155] rounded-lg p-0.5 text-xs font-medium">
            {(['Daily', 'Weekly', 'Monthly'] as const).map((freq) => (
              <button
                key={freq}
                id={`freq-btn-${freq.toLowerCase()}`}
                onClick={() => onFrequencyChange(freq)}
                className={`px-3 py-1 rounded-md transition ${
                  activeFrequency === freq
                    ? 'bg-[#2451D9] text-white shadow-sm font-semibold'
                    : 'text-[#686E7D] dark:text-[#94A3B8] hover:text-[#12141C] dark:hover:text-white'
                }`}
              >
                {freq}
              </button>
            ))}
          </div>
        </div>

        {/* Frequency-aware Date Control */}
        {activeFrequency === 'Daily' ? (
          <div className="relative flex items-center bg-[#F6F7FA] dark:bg-[#0F172A] border border-[#E6E8EE] dark:border-[#334155] rounded-lg px-2.5 py-1 text-xs text-[#12141C] dark:text-[#CBD5E1]">
            <Calendar className="w-3.5 h-3.5 text-[#9DA2AF] dark:text-[#64748B] mr-2 shrink-0" />
            <input
              id="daily-date-picker"
              type="date"
              value={selectedDateIso}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent text-[#12141C] dark:text-[#E2E8F0] text-xs font-medium focus:outline-none [color-scheme:light] dark:[color-scheme:dark] cursor-pointer"
            />
          </div>
        ) : (
          <div className="flex items-center bg-[#F6F7FA] dark:bg-[#0F172A] border border-[#E6E8EE] dark:border-[#334155] rounded-lg px-2.5 py-1 text-xs text-[#12141C] dark:text-[#CBD5E1]">
            <Calendar className="w-3.5 h-3.5 text-[#9DA2AF] dark:text-[#64748B] mr-2 shrink-0" />
            <span className="font-medium mr-2 whitespace-nowrap">{periodLabel}</span>
            <button
              id="period-prev-btn"
              onClick={onPrevPeriod}
              className="hover:text-[#12141C] dark:hover:text-white px-1 text-[#686E7D] dark:text-[#94A3B8] transition"
              title={activeFrequency === 'Weekly' ? 'Previous week' : 'Previous month'}
            >
              &lt;
            </button>
            <button
              id="period-next-btn"
              onClick={onNextPeriod}
              className="hover:text-[#12141C] dark:hover:text-white px-1 text-[#686E7D] dark:text-[#94A3B8] transition"
              title={activeFrequency === 'Weekly' ? 'Next week' : 'Next month'}
            >
              &gt;
            </button>
          </div>
        )}
      </div>

      {isMonthly ? (
        /* Monthly Calendar-Grid View */
        <AttendanceMonthlyGrid
          grid={monthlyGrid}
          selectedTeacherId={selectedTeacherId}
          onSelectTeacher={onSelectTeacher}
          selectedDate={selectedGridDate}
          onSelectDate={onSelectGridDate}
          onCellClick={onGridCellClick}
        />
      ) : isWeekly ? (
        /* Weekly Calendar-Grid View */
        <AttendanceWeeklyGrid
          grid={weeklyGrid}
          selectedTeacherId={selectedTeacherId}
          onSelectTeacher={onSelectTeacher}
          selectedDate={selectedGridDate}
          onSelectDate={onSelectGridDate}
          onCellClick={onGridCellClick}
        />
      ) : (
        <>
          {/* Responsive Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#12141C]/80 dark:text-[#CBD5E1]">
              <thead className="bg-[#F6F7FA] dark:bg-[#0B1220] text-[11px] font-semibold text-[#686E7D] dark:text-[#94A3B8] border-b border-[#E6E8EE] dark:border-[#334155] uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-2.5 px-3 w-8 text-center">
                    Sn
                  </th>
                  <th scope="col" className="py-2.5 px-3">
                    Teacher
                  </th>
                  <th scope="col" className="py-2.5 px-3">
                    Class
                  </th>
                  <th scope="col" className="py-2.5 px-3">
                    Subject
                  </th>
                  <th scope="col" className="py-2.5 px-3">
                    Chapter
                  </th>
                  <th scope="col" className="py-2.5 px-2.5">
                    Scheduled
                    <br />
                    Time
                  </th>
                  <th scope="col" className="py-2.5 px-2.5">
                    Class
                    <br />
                    Duration
                  </th>
                  <th scope="col" className="py-2.5 px-3">
                    Attendance
                  </th>
                  <th scope="col" className="py-2.5 px-3">
                    Reason
                  </th>
                  <th scope="col" className="py-2.5 px-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E8EE] dark:divide-[#1E293B] text-[11px]">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-[#686E7D] dark:text-[#94A3B8]">
                      No attendance records found matching the current filters.
                    </td>
                  </tr>
                ) : (
                  records.map((record, index) => {
                    const isSelected = record.id === selectedTeacherId;
                    const rowNum = (currentPage - 1) * 10 + index + 1;

                    return (
                      <tr
                        key={`${record.id}-${index}`}
                        onClick={() => onSelectTeacher(record.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#EAF0FE] dark:bg-[#1E3A66] border-l-2 border-l-[#2451D9] dark:border-l-blue-500'
                            : 'hover:bg-gray-50 dark:hover:bg-[#152238]'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center text-[#686E7D] dark:text-[#94A3B8] font-medium">
                          {rowNum}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border ${record.avatarColor}`}
                            >
                              {record.initials}
                            </div>
                            <span className="font-semibold text-[#12141C] dark:text-white truncate max-w-[95px]">
                              {record.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-[#12141C]/80 dark:text-[#CBD5E1]">{record.classCourse}</td>
                        <td className="py-2.5 px-3 text-[#12141C]/80 dark:text-[#CBD5E1]">{record.subject}</td>
                        <td
                          className="py-2.5 px-3 text-[#686E7D] dark:text-[#94A3B8] max-w-[130px] truncate"
                          title={record.chapter}
                        >
                          {record.chapter}
                        </td>
                        <td className="py-2.5 px-2.5 text-[#12141C]/80 dark:text-[#CBD5E1]">{record.scheduledTime}</td>
                        <td className="py-2.5 px-2.5 text-[#12141C]/80 dark:text-[#CBD5E1]">
                          {record.classDurationMinutes} min
                        </td>
                        <td className="py-2.5 px-3">
                          {record.status === 'Present' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E7F7ED] text-[#16A34A] border border-[#BFE9CD] dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30">
                              Present
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FCEAE4] text-[#DC5B3E] border border-[#F5CFC0] dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30">
                              Absent
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-[#686E7D] dark:text-[#94A3B8]">{record.reason}</td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectTeacher(record.id);
                                onEditRecord(record);
                              }}
                              title="Edit"
                              className="p-1.5 rounded bg-gray-100 dark:bg-[#101c38] hover:bg-gray-200 dark:hover:bg-[#182952] border border-[#E6E8EE] dark:border-[#203259] text-[#12141C] dark:text-slate-200 transition"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectTeacher(record.id);
                                onDeleteRecord(record);
                              }}
                              title="Delete"
                              className="p-1.5 rounded bg-[#FCEAE4] dark:bg-rose-500/10 hover:bg-[#f9ddd0] dark:hover:bg-rose-500/20 border border-[#F5CFC0] dark:border-rose-500/30 text-[#DC5B3E] dark:text-rose-400 transition"
                            >
                              <Trash2 className="w-3 h-3" />
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

          {/* Table Footer & Pagination */}
          <div className="p-3 border-t border-[#E6E8EE] dark:border-[#334155] flex items-center justify-between">
            <div className="w-48 h-1.5 bg-gray-100 dark:bg-[#142038] rounded-full overflow-hidden">
              <div
                className="bg-[#2451D9] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (currentPage / Math.max(1, totalPages)) * 100)}%` }}
              />
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1 text-xs">
              <button
                id="table-prev-page"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="w-7 h-7 rounded border border-[#E6E8EE] dark:border-[#1b2b4d] bg-white dark:bg-[#101c38] text-[#686E7D] dark:text-[#94A3B8] hover:text-[#12141C] dark:hover:text-white flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`w-7 h-7 rounded flex items-center justify-center font-semibold transition ${
                    currentPage === page
                      ? 'bg-[#2451D9] text-white shadow-sm'
                      : 'border border-[#E6E8EE] dark:border-[#1b2b4d] bg-white dark:bg-[#101c38] text-[#686E7D] dark:text-[#94A3B8] hover:text-[#12141C] dark:hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                id="table-next-page"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="w-7 h-7 rounded border border-[#E6E8EE] dark:border-[#1b2b4d] bg-white dark:bg-[#101c38] text-[#686E7D] dark:text-[#94A3B8] hover:text-[#12141C] dark:hover:text-white flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
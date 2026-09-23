import React from 'react';
import type { WeeklyAttendanceGrid, DayCellStatus } from '../types';

interface AttendanceWeeklyGridProps {
  grid: WeeklyAttendanceGrid;
  selectedTeacherId: string;
  onSelectTeacher: (id: string) => void;
  selectedDate?: string | null;
  onSelectDate?: (isoDate: string) => void;
  /** Fired when a teacher x day status cell is clicked — opens Edit Attendance. */
  onCellClick?: (teacherId: string, isoDate: string, status: DayCellStatus) => void;
}

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Weekly counterpart of `AttendanceMonthlyGrid` — same teacher-rows x
 * day-columns layout, scoped to the 7 days (Mon-Sun) of the currently
 * selected week instead of a full calendar month. Columns are wider
 * here since there are only 7 of them, so the full weekday name fits
 * comfortably without needing horizontal scroll on most screens.
 */
export const AttendanceWeeklyGrid: React.FC<AttendanceWeeklyGridProps> = ({
  grid,
  selectedTeacherId,
  onSelectTeacher,
  selectedDate = null,
  onSelectDate,
  onCellClick,
}) => {
  const { days, teachers } = grid;
  const currentIso = todayIso();

  const handleHeaderClick = (isoDate: string) => {
    if (!onSelectDate) return;
    onSelectDate(isoDate === selectedDate ? '' : isoDate);
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs text-[#12141C]/80 dark:text-[#CBD5E1]">
          <thead className="bg-[#F6F7FA] dark:bg-[#0B1220] border-b border-[#E6E8EE] dark:border-[#334155] text-[11px] font-semibold text-[#686E7D] dark:text-[#94A3B8] uppercase tracking-wider">
            <tr>
              <th className="sticky left-0 z-20 bg-[#F6F7FA] dark:bg-[#0B1220] py-2.5 px-3 min-w-[160px] border-r border-[#E6E8EE] dark:border-[#334155]">
                Teacher
              </th>

              {days.map((day) => {
                const isToday = day.isoDate === currentIso;
                const isSelected = day.isoDate === selectedDate;
                return (
                  <th
                    key={day.isoDate}
                    onClick={() => handleHeaderClick(day.isoDate)}
                    title="Click to highlight this day"
                    className={`py-2.5 px-2 text-center min-w-[92px] border-r border-[#E6E8EE] dark:border-[#1E293B] last:border-r-0 normal-case transition-colors ${
                      onSelectDate ? 'cursor-pointer' : ''
                    } ${
                      isSelected
                        ? 'bg-[#EAF0FE] dark:bg-[#2451D9]/20'
                        : isToday
                        ? 'bg-[#EAF0FE] dark:bg-[#2451D9]/10'
                        : onSelectDate
                        ? 'hover:bg-gray-100 dark:hover:bg-[#152238]'
                        : ''
                    }`}
                  >
                    <div
                      className={`font-bold text-[11px] leading-tight ${
                        isSelected || isToday ? 'text-[#2451D9] dark:text-[#60A5FA]' : 'text-[#12141C] dark:text-slate-200'
                      }`}
                    >
                      {day.weekday}
                    </div>

                    <div
                      className={`text-[10px] font-normal leading-tight mt-0.5 ${
                        isSelected || isToday ? 'text-[#2451D9]/80 dark:text-[#60A5FA]/80' : 'text-[#9DA2AF] dark:text-slate-500'
                      }`}
                    >
                      {day.date}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E6E8EE] dark:divide-[#1E293B] text-[11px]">
            {teachers.length === 0 ? (
              <tr>
                <td
                  colSpan={days.length + 1}
                  className="py-8 text-center text-[#686E7D] dark:text-[#94A3B8]"
                >
                  No teachers found matching the current filters.
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => {
                const isRowSelected = teacher.id === selectedTeacherId;

                return (
                  <tr
                    key={teacher.id}
                    className={`transition-colors ${
                      isRowSelected
                        ? 'bg-[#EAF0FE] dark:bg-[#1E3A66]'
                        : 'hover:bg-gray-50 dark:hover:bg-[#152238]'
                    }`}
                  >
                    <td
                      onClick={() => onSelectTeacher(teacher.id)}
                      className={`sticky left-0 z-10 py-2 px-3 font-semibold text-[#12141C] dark:text-white whitespace-nowrap border-r border-[#E6E8EE] dark:border-[#334155] cursor-pointer ${
                        isRowSelected
                          ? 'bg-[#EAF0FE] dark:bg-[#1E3A66]'
                          : 'bg-white dark:bg-[#1E293B]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border ${teacher.avatarColor}`}
                        >
                          {teacher.initials}
                        </div>

                        <span className="truncate max-w-[110px] text-[11px]">
                          {teacher.name}
                        </span>
                      </div>
                    </td>

                    {teacher.statuses.map((status, idx) => {
                      const day = days[idx];
                      const isToday = day?.isoDate === currentIso;
                      const isColSelected = day?.isoDate === selectedDate;
                      const isRowAndColSelected = isColSelected && isRowSelected;
                      return (
                        <td
                          key={idx}
                          onClick={() => {
                            onSelectTeacher(teacher.id);
                            if (day) {
                              onSelectDate?.(day.isoDate);
                              onCellClick?.(teacher.id, day.isoDate, status);
                            }
                          }}
                          title="Click to edit this day's attendance"
                          className={`py-2 px-2 text-center border-r border-[#E6E8EE] dark:border-[#1E293B] last:border-r-0 transition-colors cursor-pointer ${
                            isRowAndColSelected
                              ? 'bg-[#EAF0FE] dark:bg-[#2451D9]/20 ring-1 ring-inset ring-[#2451D9]/50 dark:ring-[#60A5FA]/40'
                              : isColSelected
                              ? 'bg-[#EAF0FE]/60 dark:bg-[#2451D9]/10'
                              : isToday
                              ? 'bg-[#EAF0FE]/40 dark:bg-[#2451D9]/5 hover:bg-gray-100 dark:hover:bg-[#152238]'
                              : 'hover:bg-gray-100 dark:hover:bg-[#152238]'
                          }`}
                        >
                          {status === 'Present' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E7F7ED] dark:bg-emerald-500/15 text-[#16A34A] dark:text-emerald-400 text-[9px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] dark:bg-emerald-400" />
                              Present
                            </span>
                          )}

                          {status === 'Absent' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FCEAE4] dark:bg-rose-500/15 text-[#DC5B3E] dark:text-rose-400 text-[9px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#DC5B3E] dark:bg-rose-400" />
                              Absent
                            </span>
                          )}

                          {status === 'NoClass' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700/60 text-[#9DA2AF] dark:text-slate-400 text-[9px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-slate-500" />
                              No Class
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Legend + hint */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-3 border-t border-[#E6E8EE] dark:border-[#334155] text-[11px] text-[#686E7D] dark:text-[#94A3B8]">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] dark:bg-emerald-400" />
            Present
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#DC5B3E] dark:bg-rose-400" />
            Absent
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-slate-500" />
            No Class
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#EAF0FE] dark:bg-[#2451D9]/10 border border-[#2451D9]/30 dark:border-[#60A5FA]/30" />
            Today / Selected
          </div>
        </div>

        <span className="text-[#9DA2AF] dark:text-slate-500">
          Click any date cell to edit &middot; Use &lt; / &gt; above to switch weeks
        </span>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Filter, Percent, Clock } from 'lucide-react';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import type { StudentFilterOptions } from '../types';
import { DatePickerPopover } from './DatePickerPopover';

interface StudentFilterBarProps {
  filters: StudentFilterOptions;
  onApplyFilters: (filters: StudentFilterOptions, silent?: boolean) => void;
  onReset: () => void;
  isFiltered?: boolean;
}

const COURSES = [
  ['Class 9th (All Subjects)', 'Class 9th (All Subjects)'],
  ['Class 9th (Science & Maths)', 'Class 9th (Science & Maths)'],
  ['Class 10th (All Subjects)', 'Class 10th (All Subjects)'],
  ['Class 10th (Maths & Science)', 'Class 10th (Maths & Science)'],
  ['Class 11th (Science - PCM)', 'Class 11th (Science - PCM)'],
  ['Class 11th (Science - PCB)', 'Class 11th (Science - PCB)'],
  ['Class 11th (Commerce)', 'Class 11th (Commerce)'],
  ['Class 11th (Arts / Humanities)', 'Class 11th (Humanities)'],
  ['Class 12th (Science - PCM)', 'Class 12th (Science - PCM)'],
  ['Class 12th (Science - PCB)', 'Class 12th (Science - PCB)'],
  ['Class 12th (Commerce)', 'Class 12th (Commerce)'],
  ['Class 12th (Arts / Humanities)', 'Class 12th (Humanities)'],
];

export const StudentFilterBar: React.FC<StudentFilterBarProps> = ({ filters, onApplyFilters, onReset }) => {
  const [draftFilters, setDraftFilters] = useState<StudentFilterOptions>(filters);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  // Auto-apply search 300ms after the user stops typing
  useEffect(() => {
    if (draftFilters.search === filters.search) return;
    const timer = setTimeout(() => {
      onApplyFilters(draftFilters, true);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftFilters.search]);

  const update = (patch: Partial<StudentFilterOptions>, apply = true) => {
    const updated = { ...draftFilters, ...patch };
    setDraftFilters(updated);
    if (apply) onApplyFilters(updated);
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(draftFilters);
  };

  const handleResetClick = () => {
    setDraftFilters({
      search: '',
      course: 'All Courses',
      status: 'All Status',
      accessPeriod: 'All Access Period',
      progress: 'All Progress',
      joinedDate: '',
    });
    onReset();
  };

  return (
    <form
      onSubmit={handleApply}
      className="p-4 bg-white dark:bg-[#1E293B] border border-[#e2e8f0] dark:border-[#334155] rounded-xl mb-4 shadow-2xs space-y-3.5"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        <div className="relative w-full">
          <input
            type="text"
            value={draftFilters.search}
            onChange={(e) => update({ search: e.target.value }, false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onApplyFilters(draftFilters);
            }}
            placeholder="Search Student"
            className="w-full pl-3 pr-10 py-2 bg-white dark:bg-[#0F172A] border border-[#e2e8f0] dark:border-[#334155] rounded-lg text-xs text-[#0f172a] dark:text-gray-100 focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] placeholder-slate-400 dark:placeholder-gray-500 outline-hidden transition-all"
          />
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <Select value={draftFilters.course} onChange={(e) => update({ course: e.target.value })} className="!py-2 !text-xs">
          <option value="All Courses">All Classes & Courses</option>
          {COURSES.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </Select>

        <Select value={draftFilters.status} onChange={(e) => update({ status: e.target.value })} className="!py-2 !text-xs">
          <option value="All Status">All Status</option>
          <option value="Active">Active</option>
          <option value="Expired">Expired</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        <Select
          icon={<Clock className="w-3.5 h-3.5" />}
          value={draftFilters.accessPeriod}
          onChange={(e) => update({ accessPeriod: e.target.value })}
          className="!py-2 !text-xs"
        >
          <option value="All Access Period">Access Period</option>
          <option value="3 Months">3 Months</option>
          <option value="6 Months">6 Months</option>
          <option value="1 Year">1 Year</option>
          <option value="2 Years">2 Years</option>
        </Select>

        <Select
          icon={<Percent className="w-3.5 h-3.5" />}
          value={draftFilters.progress || 'All Progress'}
          onChange={(e) => update({ progress: e.target.value })}
          className="!py-2 !text-xs"
        >
          <option value="All Progress">Progress</option>
          <option value="below_35">Below 35% (Low Progress)</option>
          <option value="below_25">Below 25% (Needs Attention)</option>
          <option value="25_50">25% – 50% (In Progress)</option>
          <option value="50_75">50% – 75% (On Track)</option>
          <option value="above_75">Above 75% (Ahead)</option>
          <option value="100">100% (Completed)</option>
          <option value="below_10">Below 10% (Critical)</option>
          <option value="above_90">Above 90% (Top Scorers)</option>
        </Select>

        <DatePickerPopover
          value={draftFilters.joinedDate}
          onChange={(d) => update({ joinedDate: d })}
          placeholder="Joined Date"
        />
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e2e8f0] dark:border-[#334155]">
        <Button type="button" variant="outline" size="sm" onClick={handleResetClick} className="!py-2 !px-4 !text-xs" title="Clear all filters">
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </Button>
        <Button type="submit" variant="primary" size="sm" className="!py-2 !px-5 !text-xs">
          <Filter className="w-3.5 h-3.5" />
          Filter
        </Button>
      </div>
    </form>
  );
};

export default StudentFilterBar;
import React, { useState, useEffect } from 'react';
import type { FreeCourse, EnrolledStudent } from '../types/free-course.types';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { freeCoursesApi } from '../api/freeCourses.api';
import { Users, Search } from 'lucide-react';

interface FreeCourseEnrollmentModalProps {
  course: FreeCourse | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FreeCourseEnrollmentModal: React.FC<FreeCourseEnrollmentModalProps> = ({
  course,
  isOpen,
  onClose,
}) => {
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Completed' | 'Inactive'>('All');

  useEffect(() => {
    if (course && isOpen) {
      freeCoursesApi.getEnrolledStudents(course.id).then(setStudents);
    }
  }, [course, isOpen]);

  if (!course) return null;

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <Users className="w-5 h-5 text-[#2451D9] dark:text-blue-400" />
          <span className="text-base font-bold text-[#12141C] dark:text-white">Course Student Enrollments</span>
          <span className="text-xs px-2 py-0.5 rounded bg-[#E7F7ED] text-[#16A34A] dark:bg-emerald-500/20 dark:text-emerald-400 font-bold">
            100% Free Access
          </span>
        </div>
      }
      subtitle={`Enrolled students in "${course.title}" (${course.targetClass})`}
      maxWidth="4xl"
      footer={
        <div className="flex justify-between items-center w-full">
          <span className="text-xs text-[#686E7D] dark:text-slate-400">
            All students enrolled with ₹0 tuition fees.
          </span>
          <Button size="sm" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* KPI stat summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-[#E6E8EE] dark:border-[#334155]">
            <span className="text-[10px] text-[#686E7D] dark:text-slate-400 font-semibold uppercase">Total Enrolled</span>
            <p className="text-lg font-extrabold text-[#12141C] dark:text-white mt-0.5">
              {course.enrollmentsCount.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-[#E6E8EE] dark:border-[#334155]">
            <span className="text-[10px] text-[#686E7D] dark:text-slate-400 font-semibold uppercase">Active Learners</span>
            <p className="text-lg font-extrabold text-[#16A34A] dark:text-emerald-400 mt-0.5">
              {course.activeStudentsCount.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-[#E6E8EE] dark:border-[#334155]">
            <span className="text-[10px] text-[#686E7D] dark:text-slate-400 font-semibold uppercase">Completion Rate</span>
            <p className="text-lg font-extrabold text-[#2451D9] dark:text-blue-400 mt-0.5">
              {course.completionRate}%
            </p>
          </div>
          <div className="p-3 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-[#E6E8EE] dark:border-[#334155]">
            <span className="text-[10px] text-[#686E7D] dark:text-slate-400 font-semibold uppercase">Enrolled Cost</span>
            <p className="text-lg font-extrabold text-[#16A34A] dark:text-emerald-400 mt-0.5">₹0 (Free)</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-[#686E7D] dark:text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student name or email..."
              className="w-full bg-white dark:bg-[#0B0F19] border border-[#e2e8f0] dark:border-[#374151] text-[#0f172a] dark:text-gray-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#3b82f6]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {(['All', 'Active', 'Completed', 'Inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Students Table */}
        <div className="border border-[#E6E8EE] dark:border-[#334155] rounded-xl overflow-hidden bg-white dark:bg-[#0B0F19]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F7FA] dark:bg-[#1E293B] border-b border-[#E6E8EE] dark:border-[#334155] text-[11px] uppercase tracking-wider text-[#686E7D] dark:text-slate-400 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Student</th>
                <th className="py-2.5 px-3">Enrolled Date</th>
                <th className="py-2.5 px-3">Progress</th>
                <th className="py-2.5 px-3">Last Active</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8EE] dark:divide-[#334155]">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#12141C] dark:text-white">{student.name}</div>
                    <div className="text-[11px] text-[#686E7D] dark:text-slate-400">{student.email}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{student.enrolledAt}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${student.progressPercentage}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300">
                        {student.progressPercentage}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[#686E7D] dark:text-slate-400 text-[11px]">{student.lastActive}</td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        student.status === 'Completed'
                          ? 'bg-[#E7F7ED] text-[#16A34A] dark:bg-emerald-500/20 dark:text-emerald-400'
                          : student.status === 'Active'
                          ? 'bg-[#EAF0FE] text-[#2451D9] dark:bg-blue-500/20 dark:text-blue-400'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-700/40 dark:text-slate-400'
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};
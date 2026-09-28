import React, { useState, useMemo } from 'react';
import {
  MessageSquareQuote, Star, Calendar, BookOpen, Filter, CheckCircle2, AlertTriangle,
  Clock, ChevronRight, Info, X, HelpCircle, GraduationCap, Sparkles,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import type { Student, StudentCourseFeedback, FeedbackStatus } from '../types';
import { getStudentFeedback, calculateImprovementNeeded, getCourseFeedbackSummaries } from '../data/mockFeedbackData';

interface StudentFeedbackSummaryProps {
  student: Student;
  className?: string;
  isTargeted?: boolean;
}

const DIVIDER = 'border-[#e2e8f0] dark:border-[#334155]';
const INNER = 'bg-slate-50 dark:bg-[#0F172A]';

const STATUS_STYLE: Record<FeedbackStatus, { cls: string; icon: React.ElementType }> = {
  Reviewed: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30', icon: CheckCircle2 },
  'Action Taken': { cls: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30', icon: Sparkles },
  'Under Review': { cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30', icon: Clock },
  Pending: { cls: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30', icon: HelpCircle },
};

const StatusBadge: React.FC<{ status: FeedbackStatus }> = ({ status }) => {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.Pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${s.cls}`}>
      <Icon className="w-3 h-3" /> {status}
    </span>
  );
};

export const StudentFeedbackSummary: React.FC<StudentFeedbackSummaryProps> = ({ student, className = '', isTargeted = false }) => {
  const allFeedbacks: StudentCourseFeedback[] = useMemo(() => {
    if (student.feedback && student.feedback.length > 0) return student.feedback;
    const courseNames = student.courses?.map((c) => c.name) || [student.primaryCourse];
    return getStudentFeedback(student.id, student.name, courseNames);
  }, [student]);

  const [selectedCourse, setSelectedCourse] = useState<string>('All Courses');
  const [activeFeedback, setActiveFeedback] = useState<StudentCourseFeedback | null>(null);

  const courseOptions = useMemo(() => {
    const set = new Set<string>();
    student.courses?.forEach((c) => set.add(c.name));
    allFeedbacks.forEach((fb) => set.add(fb.courseName));
    return Array.from(set);
  }, [student, allFeedbacks]);

  const courseSummaries = useMemo(() => getCourseFeedbackSummaries(allFeedbacks), [allFeedbacks]);
  const improvement = useMemo(() => calculateImprovementNeeded(allFeedbacks), [allFeedbacks]);

  const displayed = useMemo(
    () => (selectedCourse === 'All Courses' ? allFeedbacks : allFeedbacks.filter((fb) => fb.courseName === selectedCourse)),
    [allFeedbacks, selectedCourse]
  );

  const improvementCls =
    improvement.level === 'High'
      ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-600/40 dark:text-rose-300'
      : improvement.level === 'Medium'
      ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-600/40 dark:text-amber-300'
      : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-600/40 dark:text-emerald-300';

  const pill = (on: boolean) =>
    on
      ? 'bg-purple-600 text-white border-purple-500'
      : `${INNER} text-[#64748b] dark:text-gray-300 ${DIVIDER} hover:border-slate-300 dark:hover:border-slate-600 hover:text-[#0f172a] dark:hover:text-white`;

  return (
    <div
      id="feedback-section"
      className={`space-y-4 scroll-mt-24 transition-all duration-300 ${className} ${
        isTargeted ? 'ring-2 ring-purple-500/60 rounded-2xl p-1' : ''
      }`}
    >
      <Card padding="none" className="p-5">
        {/* Header */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${DIVIDER}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-300 shrink-0">
              <MessageSquareQuote className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-[#0f172a] dark:text-white tracking-tight">Feedback &amp; Course Experience</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40">
                  {allFeedbacks.length} Total Messages
                </span>
              </div>
              <p className="text-xs text-[#64748b] dark:text-gray-400 mt-0.5">
                Feedback and suggestions submitted across all enrolled courses
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${improvementCls}`}
            title={improvement.reason}
          >
            {improvement.level === 'Low' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            <span>Improvement Needed:</span>
            <span className="font-bold underline decoration-dotted">{improvement.level}</span>
          </div>
        </div>

        {/* Pills + dropdown */}
        <div className="pt-4 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedCourse('All Courses')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${pill(selectedCourse === 'All Courses')}`}
              >
                <span>All Courses</span>
                <span className="ml-1.5 px-1.5 rounded bg-black/10 dark:bg-black/25 text-[10px]">{allFeedbacks.length}</span>
              </button>

              {courseSummaries.map((s) => (
                <button
                  key={s.courseName}
                  type="button"
                  onClick={() => setSelectedCourse(s.courseName)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5 cursor-pointer ${pill(selectedCourse === s.courseName)}`}
                >
                  <span className="truncate max-w-[170px]">{s.courseName}</span>
                  <span className="px-1.5 rounded bg-black/10 dark:bg-black/25 text-[10px] font-bold">
                    {s.count} {s.count === 1 ? 'Message' : 'Messages'}
                  </span>
                  {s.improvementCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Contains feedback with rating ≤ 3" />}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-64 shrink-0">
              <Select
                icon={<Filter className="w-3.5 h-3.5" />}
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="!py-1.5 !text-xs"
              >
                <option value="All Courses">All Courses ({allFeedbacks.length} Messages)</option>
                {courseOptions.map((course) => {
                  const count = allFeedbacks.filter((fb) => fb.courseName === course).length;
                  return (
                    <option key={course} value={course}>
                      {course} ({count} {count === 1 ? 'Message' : 'Messages'})
                    </option>
                  );
                })}
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#64748b] dark:text-gray-400 pt-1">
            <span>
              Showing <strong className="text-[#0f172a] dark:text-white">{displayed.length}</strong>{' '}
              {displayed.length === 1 ? 'feedback message' : 'feedback messages'} for{' '}
              <span className="text-purple-600 dark:text-purple-300 font-semibold">{selectedCourse}</span>
            </span>
            <span className="text-[11px] text-slate-400 italic hidden sm:inline">Click any feedback to view details</span>
          </div>
        </div>

        {/* List */}
        <div className="mt-4 space-y-3">
          {displayed.length === 0 ? (
            <div className={`p-8 text-center border border-dashed ${DIVIDER} rounded-xl ${INNER}`}>
              <MessageSquareQuote className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-[#0f172a] dark:text-gray-300 font-medium">No feedback messages found for {selectedCourse}</p>
              <p className="text-[11px] text-slate-400 mt-1">The student has not submitted any feedback for this course yet.</p>
            </div>
          ) : (
            displayed.map((fb, index) => (
              <div
                key={fb.id}
                onClick={() => setActiveFeedback(fb)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveFeedback(fb);
                  }
                }}
                className={`p-4 rounded-xl border ${DIVIDER} ${INNER} hover:bg-slate-100 dark:hover:bg-[#0f1b38] hover:border-purple-400 dark:hover:border-purple-500/50 transition-all cursor-pointer group relative overflow-hidden`}
              >
                {fb.needsImprovement && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />}

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30">
                        <BookOpen className="w-3 h-3" />
                        {fb.courseName}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                        Subject: {fb.subject}
                      </span>
                      {fb.category && (
                        <span className="text-[10px] text-[#64748b] dark:text-gray-400 bg-white dark:bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700/60">
                          {fb.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-[#0f172a] dark:text-slate-200 font-medium leading-relaxed pt-1">
                      &ldquo;{fb.message}&rdquo;
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1.5 shrink-0 pt-1">
                    {fb.rating !== undefined && (
                      <div className={`flex items-center gap-1 bg-white dark:bg-[#070d1c] px-2 py-1 rounded-md border ${DIVIDER}`}>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-300">{fb.rating}/5</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-[11px] text-[#64748b] dark:text-gray-400">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{fb.submittedAt}</span>
                    </div>
                    <StatusBadge status={fb.status} />
                  </div>
                </div>

                <div className={`flex items-center justify-between mt-3 pt-2 border-t ${DIVIDER} text-[11px]`}>
                  <span className="text-slate-400">Feedback #{index + 1} &bull; Submitted by {student.name}</span>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    View Details <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Detail dialog */}
      {activeFeedback && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setActiveFeedback(null)}
        >
          <div
            className={`w-full max-w-xl bg-white dark:bg-[#1E293B] border ${DIVIDER} rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between p-5 border-b ${DIVIDER} ${INNER}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/40 flex items-center justify-center text-purple-600 dark:text-purple-300">
                  <MessageSquareQuote className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a] dark:text-white">Feedback Details</h3>
                  <p className="text-[11px] text-[#64748b] dark:text-gray-400">Student review submitted on {activeFeedback.submittedAt}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveFeedback(null)}
                className="p-1.5 text-slate-400 hover:text-[#0f172a] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-blue-300 shrink-0 mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                    Target Enrolled Course &amp; Subject
                  </span>
                  <div className="text-sm font-bold text-[#0f172a] dark:text-white mt-0.5">{activeFeedback.courseName}</div>
                  <div className="text-xs text-blue-700 dark:text-blue-200 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>Subject: <strong>{activeFeedback.subject}</strong></span>
                    {activeFeedback.category && (
                      <>
                        <span>&bull;</span>
                        <span>Category: <strong>{activeFeedback.category}</strong></span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className={`p-3 rounded-lg ${INNER} border ${DIVIDER}`}>
                  <span className="text-[#64748b] dark:text-gray-400 text-[11px]">Student</span>
                  <div className="text-[#0f172a] dark:text-white font-semibold mt-0.5 truncate">{student.name}</div>
                  <div className="text-[10px] text-[#64748b] dark:text-gray-400 truncate">{student.email}</div>
                </div>
                <div className={`p-3 rounded-lg ${INNER} border ${DIVIDER}`}>
                  <span className="text-[#64748b] dark:text-gray-400 text-[11px]">Rating</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-amber-600 dark:text-amber-300 font-bold text-sm">
                      {activeFeedback.rating !== undefined ? `${activeFeedback.rating}/5` : 'No Rating'}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${INNER} border ${DIVIDER} col-span-2 sm:col-span-1`}>
                  <span className="text-[#64748b] dark:text-gray-400 text-[11px]">Feedback Status</span>
                  <div className="mt-1"><StatusBadge status={activeFeedback.status} /></div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0f172a] dark:text-gray-300 block mb-1.5">Student Feedback Message:</label>
                <div className={`p-4 rounded-xl ${INNER} border border-purple-200 dark:border-purple-500/30 text-[#0f172a] dark:text-slate-100 text-xs sm:text-sm leading-relaxed relative`}>
                  <MessageSquareQuote className="w-6 h-6 text-purple-500/20 absolute right-3 top-3 pointer-events-none" />
                  &ldquo;{activeFeedback.message}&rdquo;
                </div>
              </div>

              {activeFeedback.adminNotes && (
                <div className={`p-3 rounded-xl ${INNER} border ${DIVIDER} text-xs space-y-1`}>
                  <div className="flex items-center gap-1.5 text-[#64748b] dark:text-gray-400 font-semibold">
                    <Info className="w-3.5 h-3.5 text-blue-500" />
                    <span>Admin Action &amp; Notes:</span>
                  </div>
                  <p className="text-[#0f172a] dark:text-slate-300 pl-5">{activeFeedback.adminNotes}</p>
                </div>
              )}

              {activeFeedback.needsImprovement && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-600/30 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Flagged for Improvement:</strong>
                    <span>
                      This feedback indicates potential curriculum or lecture pacing issues in {activeFeedback.courseName} ({activeFeedback.subject}).
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className={`p-4 border-t ${DIVIDER} ${INNER} flex items-center justify-between`}>
              <span className="text-[11px] text-[#64748b] dark:text-gray-400">
                Course: <strong className="text-[#0f172a] dark:text-slate-200">{activeFeedback.courseName}</strong>
              </span>
              <Button type="button" variant="primary" size="sm" onClick={() => setActiveFeedback(null)}>
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFeedbackSummary;
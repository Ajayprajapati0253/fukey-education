import React, { useState, useMemo, useEffect } from 'react';
import {
  PlayCircle, CheckCircle2, Clock, BookOpen, FileCheck, ChevronDown, ChevronUp,
  Award, GraduationCap, Sparkles, CircleDot, Radio, Filter, RotateCcw,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import type { Student, EnrolledCourse, CourseChapter, CourseTopic } from '../types';
import { buildEnrolledCourseWithStats, getDefaultChaptersForCourse } from '../data/courseSyllabusData';
import { StudentFeedbackSummary } from './StudentFeedbackSummary';

export type KpiFilterType = 'completed' | 'remaining' | 'in_progress' | 'units_mastered' | 'assignments' | null;

interface EditStudentActivityTabProps {
  student: Student;
  initialSelectedCourseId?: string | null;
  onSelectCourse?: (courseId: string) => void;
  isFeedbackTargeted?: boolean;
}

const DIVIDER = 'border-[#e2e8f0] dark:border-[#334155]';
const INNER = 'bg-slate-50 dark:bg-[#0F172A]';

type Color = 'emerald' | 'amber' | 'orange' | 'blue' | 'purple';
const COLOR: Record<Color, { pillOn: string; icon: string; cardOn: string; chip: string }> = {
  emerald: {
    pillOn: 'bg-emerald-600 text-white', icon: 'text-emerald-500',
    cardOn: '!border-emerald-500 ring-2 ring-emerald-500/30',
    chip: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800/60',
  },
  amber: {
    pillOn: 'bg-amber-600 text-white', icon: 'text-amber-500',
    cardOn: '!border-amber-500 ring-2 ring-amber-500/30',
    chip: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-800/60',
  },
  orange: {
    pillOn: 'bg-orange-600 text-white', icon: 'text-orange-500',
    cardOn: '!border-orange-500 ring-2 ring-orange-500/30',
    chip: 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950 dark:border-orange-800/60',
  },
  blue: {
    pillOn: 'bg-blue-600 text-white', icon: 'text-blue-500',
    cardOn: '!border-blue-500 ring-2 ring-blue-500/30',
    chip: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800/60',
  },
  purple: {
    pillOn: 'bg-purple-600 text-white', icon: 'text-purple-500',
    cardOn: '!border-purple-500 ring-2 ring-purple-500/30',
    chip: 'text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-950 dark:border-purple-800/60',
  },
};

export const EditStudentActivityTab: React.FC<EditStudentActivityTabProps> = ({
  student,
  initialSelectedCourseId = null,
  onSelectCourse,
  isFeedbackTargeted = false,
}) => {
  const courses: EnrolledCourse[] = useMemo(() => {
    if (student.courses && student.courses.length > 0) {
      return student.courses.map((c) => (c.chapters && c.chapters.length > 0 ? c : buildEnrolledCourseWithStats(c)));
    }
    return [
      buildEnrolledCourseWithStats({
        id: 'c_default',
        name: student.primaryCourse || 'Class 10th (All Subjects)',
        status: student.status === 'Active' ? 'Active' : 'Completed',
        enrolledAt: student.joinedAt,
        endsAt: student.accessUntil,
        progress: student.progress,
        category: 'Academic Curriculum',
      }),
    ];
  }, [student]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialSelectedCourseId || courses[0]?.id || '');

  useEffect(() => {
    if (initialSelectedCourseId && courses.some((c) => c.id === initialSelectedCourseId)) {
      setSelectedCourseId(initialSelectedCourseId);
    } else if (courses.length > 0 && !courses.some((c) => c.id === selectedCourseId)) {
      setSelectedCourseId(courses[0].id);
    }
  }, [initialSelectedCourseId, courses, selectedCourseId]);

  const handleSelectCourse = (id: string) => {
    setSelectedCourseId(id);
    onSelectCourse?.(id);
  };

  const currentCourse = useMemo(() => courses.find((c) => c.id === selectedCourseId) || courses[0], [courses, selectedCourseId]);

  const [activeKpiFilter, setActiveKpiFilter] = useState<KpiFilterType>(null);
  const handleKpiToggle = (f: KpiFilterType) => setActiveKpiFilter((p) => (p === f ? null : f));
  const handleClearKpiFilter = () => setActiveKpiFilter(null);

  const chapters: CourseChapter[] = useMemo(() => {
    if (currentCourse?.chapters && currentCourse.chapters.length > 0) return currentCourse.chapters;
    return getDefaultChaptersForCourse(currentCourse?.name || student.primaryCourse, currentCourse?.progress ?? student.progress);
  }, [currentCourse, student]);

  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  const isAssignmentTitle = (t: string) => {
    const s = t.toLowerCase();
    return s.includes('quiz') || s.includes('test') || s.includes('exam') || s.includes('assignment');
  };

  useEffect(() => {
    if (!chapters || chapters.length === 0) return;
    const next: Record<string, boolean> = {};

    if (activeKpiFilter) {
      chapters.forEach((ch) => {
        if (activeKpiFilter === 'units_mastered') next[ch.id] = ch.status === 'Completed' || ch.completedLectures >= ch.totalLectures;
        else if (activeKpiFilter === 'completed') next[ch.id] = Boolean(ch.topics?.some((t) => t.completed) || ch.completedLectures > 0);
        else if (activeKpiFilter === 'remaining') next[ch.id] = Boolean(ch.topics?.some((t) => !t.completed) || ch.completedLectures < ch.totalLectures);
        else if (activeKpiFilter === 'in_progress') next[ch.id] = ch.status === 'In Progress';
        else if (activeKpiFilter === 'assignments')
          next[ch.id] = Boolean(ch.topics?.some((t) => t.score !== undefined || isAssignmentTitle(t.title)));
      });
    } else {
      let found = false;
      chapters.forEach((ch, i) => {
        if (ch.status !== 'Completed' && !found) {
          next[ch.id] = true;
          found = true;
        } else if (i === 0 && !found) next[ch.id] = true;
        else next[ch.id] = false;
      });
    }
    setExpandedChapters(next);
  }, [selectedCourseId, chapters, activeKpiFilter]);

  const toggleChapter = (id: string) => setExpandedChapters((p) => ({ ...p, [id]: !p[id] }));

  const totalLectures = currentCourse.totalLectures || chapters.reduce((s, c) => s + c.totalLectures, 0);
  const completedLectures = currentCourse.completedLectures || chapters.reduce((s, c) => s + c.completedLectures, 0);
  const remainingLectures = Math.max(0, totalLectures - completedLectures);
  const inProgressLectures = chapters.some((c) => c.status === 'In Progress') ? 1 : 0;
  const totalChapters = chapters.length;
  const completedChapters = chapters.filter((c) => c.status === 'Completed').length;
  const remainingChapters = totalChapters - completedChapters;
  const totalAssignments = currentCourse.totalAssignments || totalChapters;
  const completedAssignments =
    currentCourse.completedAssignments || Math.min(totalAssignments, Math.round(((currentCourse.progress ?? 0) / 100) * totalAssignments));
  const avgScore =
    currentCourse.averageScore || (currentCourse.progress ? Math.min(95, 72 + Math.round((currentCourse.progress / 100) * 22)) : 0);
  const courseProgress = currentCourse.progress ?? 0;

  const isTopicMatchingFilter = (topic: CourseTopic, chapter: CourseChapter, tIdx: number): boolean => {
    if (!activeKpiFilter) return true;
    if (activeKpiFilter === 'completed') return Boolean(topic.completed);
    if (activeKpiFilter === 'remaining') return !topic.completed;
    if (activeKpiFilter === 'in_progress') {
      const isInProgress = chapter.status === 'In Progress';
      return Boolean(topic.inProgress || topic.lastWatched || (!topic.completed && isInProgress && tIdx === chapter.completedLectures));
    }
    if (activeKpiFilter === 'assignments')
      return Boolean(topic.score !== undefined || isAssignmentTitle(topic.title) || topic.title.toLowerCase().includes('worksheet'));
    return true;
  };

  const filteredChapters = useMemo(() => {
    if (!activeKpiFilter) return chapters;
    if (activeKpiFilter === 'units_mastered')
      return chapters.filter((c) => c.status === 'Completed' || c.completedLectures >= c.totalLectures);
    return chapters.filter((ch) => ch.topics && ch.topics.length > 0 && ch.topics.some((t, i) => isTopicMatchingFilter(t, ch, i)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters, activeKpiFilter]);

  const getFilterLabel = (f: KpiFilterType): string =>
    ({
      completed: 'Completed Lectures',
      remaining: 'Remaining Lectures',
      in_progress: 'In-Progress Content',
      units_mastered: 'Units Mastered',
      assignments: 'Assignments & Tests',
    } as Record<string, string>)[f ?? ''] ?? 'All Content';

  const PILLS: { key: Exclude<KpiFilterType, null>; label: string; icon: React.ElementType; color: Color }[] = [
    { key: 'completed', label: `Completed (${completedLectures})`, icon: CheckCircle2, color: 'emerald' },
    { key: 'remaining', label: `Remaining (${remainingLectures})`, icon: Clock, color: 'amber' },
    { key: 'in_progress', label: `In-Progress (${inProgressLectures})`, icon: CircleDot, color: 'orange' },
    { key: 'units_mastered', label: `Units Mastered (${completedChapters}/${totalChapters})`, icon: BookOpen, color: 'blue' },
    { key: 'assignments', label: `Assignments (${completedAssignments})`, icon: FileCheck, color: 'purple' },
  ];

  const KPIS: {
    key: Exclude<KpiFilterType, null>; label: string; icon: React.ElementType; color: Color;
    value: number; unit: string; foot: string; footCls: string; hint: string;
  }[] = [
    { key: 'completed', label: 'Completed Lectures', icon: CheckCircle2, color: 'emerald', value: completedLectures, unit: `/ ${totalLectures}`, foot: `${courseProgress}% watched`, footCls: 'text-emerald-600 dark:text-emerald-400', hint: 'Click to show only completed lectures' },
    { key: 'remaining', label: 'Remaining Lectures', icon: Clock, color: 'amber', value: remainingLectures, unit: 'left', foot: `${100 - courseProgress}% pending`, footCls: 'text-amber-600 dark:text-amber-400', hint: 'Click to show only remaining lectures' },
    { key: 'in_progress', label: 'In-Progress', icon: CircleDot, color: 'orange', value: inProgressLectures, unit: 'lecture', foot: 'Currently active', footCls: 'text-orange-600 dark:text-orange-400', hint: 'Click to show in-progress content' },
    { key: 'units_mastered', label: 'Units Mastered', icon: BookOpen, color: 'blue', value: completedChapters, unit: `/ ${totalChapters}`, foot: `${remainingChapters} units left`, footCls: 'text-[#64748b] dark:text-gray-400', hint: 'Click to show mastered units' },
    { key: 'assignments', label: 'Assignments', icon: FileCheck, color: 'purple', value: completedAssignments, unit: `/ ${totalAssignments}`, foot: `Avg: ${avgScore}%`, footCls: 'text-purple-600 dark:text-purple-300', hint: 'Click to show quizzes and assignments' },
  ];

  const pillBase = 'px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer';
  const pillOff = 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:text-slate-300';

  let foundCurrentWatched = false;

  return (
    <div className="space-y-6">
      {/* Course selector */}
      <Card padding="none" className="p-5">
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b ${DIVIDER}`}>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-[#0f172a] dark:text-gray-100">Course-Wise Learning Progress</h3>
              <Badge variant="brand" size="xs">{courses.length} {courses.length === 1 ? 'Course' : 'Courses'}</Badge>
            </div>
            <p className="text-xs text-[#64748b] dark:text-gray-400 mt-0.5">
              Select a course card to view its chapter syllabus and completion status
            </p>
          </div>
          <span className="text-[11px] text-[#64748b] dark:text-gray-400 hidden sm:inline">Click any course to inspect</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {courses.map((course, idx) => {
            const isSelected = course.id === selectedCourseId;
            const progress = course.progress ?? 0;
            const tL = course.totalLectures || 30;
            const cL = course.completedLectures ?? Math.round((progress / 100) * tL);
            const statusLabel = progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Active';

            return (
              <div
                key={course.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectCourse(course.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectCourse(course.id);
                  }
                }}
                className={`relative p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer select-none group ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-[#101d3a] border-blue-500 ring-2 ring-blue-500/30'
                    : `${INNER} ${DIVIDER} hover:border-slate-300 dark:hover:border-slate-600`
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-blue-950/90 border border-blue-200 dark:border-blue-800/60 px-1.5 py-0.5 rounded">
                    <Radio className="w-2.5 h-2.5 animate-pulse" />
                    Viewing
                  </div>
                )}

                <div className="flex items-start gap-2.5 pr-14">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold truncate text-[#0f172a] dark:text-gray-100" title={course.name}>
                      {course.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#64748b] dark:text-gray-400">{cL}/{tL} Lectures</span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span
                        className={`text-[10px] font-semibold ${
                          statusLabel === 'Completed'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : statusLabel === 'In Progress'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-[#64748b] dark:text-gray-400'
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-[#64748b] dark:text-gray-400">Progress</span>
                    <span className={`font-bold ${progress === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Selected course + filters + syllabus */}
      <Card padding="none" className="p-5">
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b ${DIVIDER}`}>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-[#0f172a] dark:text-gray-100">{currentCourse.name}</h3>
              <Badge variant={currentCourse.status === 'Active' ? 'success' : 'neutral'}>{currentCourse.status}</Badge>
              {currentCourse.category && (
                <span className="text-[11px] text-[#64748b] dark:text-gray-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded">
                  {currentCourse.category}
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748b] dark:text-gray-400 mt-0.5">
              Click any KPI card below to filter the syllabus (click again to clear)
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#64748b] dark:text-gray-400">
            <span>Enrolled: <strong className="text-[#0f172a] dark:text-gray-300">{currentCourse.enrolledAt}</strong></span>
            <span>•</span>
            <span>Ends: <strong className="text-emerald-600 dark:text-emerald-400">{currentCourse.endsAt}</strong></span>
          </div>
        </div>

        {/* Filter pills */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 ${INNER} border ${DIVIDER} rounded-xl mb-4`}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#64748b] dark:text-gray-400 flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5 text-blue-500" />
              Filters:
            </span>
            <button
              type="button"
              onClick={handleClearKpiFilter}
              className={`${pillBase} ${activeKpiFilter === null ? 'bg-blue-600 text-white' : pillOff}`}
            >
              All Content ({totalLectures})
            </button>
            {PILLS.map((p) => {
              const Icon = p.icon;
              const on = activeKpiFilter === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handleKpiToggle(p.key)}
                  className={`${pillBase} ${on ? COLOR[p.color].pillOn : pillOff}`}
                >
                  <Icon className={`w-3 h-3 ${on ? 'text-white' : COLOR[p.color].icon}`} />
                  {p.label}
                </button>
              );
            })}
          </div>

          {activeKpiFilter && (
            <button
              type="button"
              onClick={handleClearKpiFilter}
              className="text-xs font-semibold text-blue-600 dark:text-blue-300 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/60 dark:hover:bg-blue-900 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-700/60 transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filter
            </button>
          )}
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
          {KPIS.map((k) => {
            const Icon = k.icon;
            const on = activeKpiFilter === k.key;
            return (
              <div
                key={k.key}
                onClick={() => handleKpiToggle(k.key)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleKpiToggle(k.key);
                  }
                }}
                title={k.hint}
                className={`p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer select-none group ${
                  on
                    ? `bg-white dark:bg-[#122244] ${COLOR[k.color].cardOn}`
                    : `${INNER} ${DIVIDER} hover:border-slate-300 dark:hover:border-slate-600`
                }`}
              >
                <div className="text-[11px] text-[#64748b] dark:text-gray-400 flex items-center justify-between">
                  <span>{k.label}</span>
                  <Icon className={`w-3.5 h-3.5 ${COLOR[k.color].icon}`} />
                </div>
                <div className="text-lg font-bold text-[#0f172a] dark:text-white mt-1">
                  {k.value} <span className="text-xs font-normal text-[#64748b] dark:text-gray-400">{k.unit}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5 text-[10px]">
                  <span className={k.footCls}>{k.foot}</span>
                  {on ? (
                    <span className={`font-bold uppercase text-[9px] px-1 rounded border ${COLOR[k.color].chip}`}>Filtered</span>
                  ) : (
                    <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">Filter</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Syllabus */}
        <div className="space-y-3">
          <div className={`flex items-center justify-between pb-2 border-b ${DIVIDER}`}>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <h4 className="text-xs font-bold text-[#0f172a] dark:text-gray-200 uppercase tracking-wider">
                Curriculum Syllabus & Chapter Telemetry
              </h4>
            </div>
            <span className="text-[11px] text-[#64748b] dark:text-gray-400 hidden sm:inline">Click unit header to expand/collapse</span>
          </div>

          <div className="space-y-3">
            {filteredChapters.length > 0 ? (
              filteredChapters.map((chapter, chIdx) => {
                const isExpanded = Boolean(expandedChapters[chapter.id]);
                const chProgress = chapter.totalLectures > 0 ? Math.round((chapter.completedLectures / chapter.totalLectures) * 100) : 0;
                const isCompleted = chapter.status === 'Completed' || chProgress === 100;
                const isInProgress = chapter.status === 'In Progress' || (chProgress > 0 && chProgress < 100);
                const matchingTopics = chapter.topics?.filter((t, i) => isTopicMatchingFilter(t, chapter, i)) || [];

                return (
                  <div
                    key={chapter.id}
                    className={`border rounded-xl bg-white dark:bg-[#1E293B] overflow-hidden transition-colors ${
                      isExpanded ? 'border-slate-300 dark:border-slate-600' : `${DIVIDER} hover:border-slate-300 dark:hover:border-slate-600`
                    }`}
                  >
                    <div
                      onClick={() => toggleChapter(chapter.id)}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Badge variant="neutral" size="xs" pill={false}>Unit {chIdx + 1}</Badge>
                        {chapter.subject && <Badge variant="brand" size="xs" pill={false}>{chapter.subject}</Badge>}
                        <h5 className="text-xs font-bold text-[#0f172a] dark:text-gray-200 truncate">{chapter.name}</h5>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <div className="text-right">
                          <div className="text-[11px] font-semibold text-[#0f172a] dark:text-gray-300">
                            {chapter.completedLectures} / {chapter.totalLectures} Lectures
                          </div>
                          <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-1 mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : isInProgress ? 'bg-amber-500' : 'bg-slate-400'}`}
                              style={{ width: `${chProgress}%` }}
                            />
                          </div>
                        </div>

                        <Badge variant={isCompleted ? 'success' : isInProgress ? 'warning' : 'neutral'} size="xs" pill={false}>
                          {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending'}
                        </Badge>

                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className={`p-3 divide-y divide-[#e2e8f0] dark:divide-[#334155] border-t ${DIVIDER}`}>
                        {matchingTopics.length > 0 ? (
                          matchingTopics.map((topic, tIdx) => {
                            const done = topic.completed;
                            let isCurrentWatched = false;
                            if (!done && !foundCurrentWatched && isInProgress) {
                              isCurrentWatched = true;
                              foundCurrentWatched = true;
                            } else if (topic.lastWatched || topic.inProgress) isCurrentWatched = true;
                            const tInProg = isCurrentWatched || (!done && isInProgress && tIdx === chapter.completedLectures);

                            return (
                              <div
                                key={topic.id}
                                className={`py-2.5 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-lg transition-colors ${
                                  isCurrentWatched
                                    ? 'bg-blue-50 dark:bg-blue-950/25 border border-blue-200 dark:border-blue-900/40'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {done ? (
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    </div>
                                  ) : tInProg ? (
                                    <div className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                                      <PlayCircle className="w-3.5 h-3.5 text-amber-500" />
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                                    <span
                                      className={`text-xs font-medium ${
                                        done
                                          ? 'text-[#0f172a] dark:text-gray-300'
                                          : tInProg
                                          ? 'text-[#0f172a] dark:text-white font-semibold'
                                          : 'text-[#64748b] dark:text-gray-400'
                                      }`}
                                    >
                                      {tIdx + 1}. {topic.title}
                                    </span>
                                    {isCurrentWatched && (
                                      <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800/60 px-1.5 py-0.5 rounded uppercase">
                                        Last Watched
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center text-xs">
                                  {topic.duration && (
                                    <span className="text-[11px] text-[#64748b] dark:text-gray-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      {topic.duration}
                                    </span>
                                  )}
                                  {topic.score !== undefined && (
                                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/50 px-1.5 py-0.5 rounded">
                                      Quiz: {topic.score}%
                                    </span>
                                  )}
                                  <Badge variant={done ? 'success' : tInProg ? 'warning' : 'neutral'} size="xs" pill={false}>
                                    {done ? 'Completed' : tInProg ? 'In Progress' : 'Pending'}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-3 text-xs text-slate-400">No lectures in this unit match the active filter.</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className={`p-8 text-center ${INNER} border ${DIVIDER} rounded-xl`}>
                <CheckCircle2 className="w-8 h-8 text-blue-500 mx-auto mb-2 opacity-80" />
                <h5 className="text-xs font-bold text-[#0f172a] dark:text-white">No Content Matching Filter</h5>
                <p className="text-[11px] text-[#64748b] dark:text-gray-400 mt-1">
                  No items in {currentCourse.name} match the "{getFilterLabel(activeKpiFilter)}" filter.
                </p>
                <button
                  type="button"
                  onClick={handleClearKpiFilter}
                  className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Clear filter to view all curriculum units
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <StudentFeedbackSummary student={student} isTargeted={isFeedbackTargeted} />

      {/* Telemetry */}
      <Card padding="none" className="p-5">
        <div className={`flex items-center justify-between mb-4 pb-2 border-b ${DIVIDER}`}>
          <div>
            <h4 className="text-xs font-bold text-[#0f172a] dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Recent Learning Telemetry
            </h4>
            <p className="text-xs text-[#64748b] dark:text-gray-400 mt-0.5">
              Timeline of latest completed modules, quizzes, and live milestones for {currentCourse.name}
            </p>
          </div>
        </div>

        <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
          {[
            { icon: CheckCircle2, cls: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/15', text: `Completed unit lecture in ${currentCourse.name}`, when: 'Today at 02:40 PM' },
            { icon: PlayCircle, cls: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/15', text: 'Watched lecture: Core Concepts & Formulas Revision', when: 'Yesterday at 06:15 PM' },
            { icon: FileCheck, cls: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/15', text: `Submitted Assignment & Practice Worksheet (Score: ${avgScore}%)`, when: '23 Jun 2026' },
            { icon: Award, cls: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/15', text: 'Completed Mid-Term Assessment with Distinction', when: '18 Jun 2026' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.text} className="relative flex items-start gap-3">
                <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-[#1E293B] ${item.cls}`}>
                  <Icon className="w-3 h-3" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#0f172a] dark:text-gray-200">{item.text}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-[#64748b] dark:text-gray-400">
                    <span>{currentCourse.name}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.when}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default EditStudentActivityTab;
import React, { useState } from 'react';
import {
  Plus, Trash2, Calendar, Award, ChevronDown, ChevronUp, CheckCircle2,
  Clock, BookOpen, FileCheck, TrendingUp, PlayCircle,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { Student, EnrolledCourse, CourseChapter } from '../types';
import { buildEnrolledCourseWithStats } from '../data/courseSyllabusData';

interface EditStudentCoursesTabProps {
  student: Student;
  onUpdateCourses: (courses: EnrolledCourse[]) => void;
  initialSelectedCourseId?: string | null;
  onSelectCourseForProgress?: (courseId: string) => void;
}

const DIVIDER = 'border-[#e2e8f0] dark:border-[#334155]';
const FIELD =
  'w-full bg-white dark:bg-[#0F172A] border border-[#e2e8f0] dark:border-[#334155] text-xs text-[#0f172a] dark:text-gray-100 rounded-lg p-2 outline-hidden focus:border-[#3b82f6]';

const COURSE_OPTIONS = [
  'Class 9th (All Subjects)', 'Class 9th (Science & Maths)',
  'Class 10th (All Subjects)', 'Class 10th (Maths & Science)',
  'Class 11th (Science - PCM)', 'Class 11th (Science - PCB)',
  'Class 11th (Commerce)', 'Class 11th (Arts / Humanities)',
  'Class 12th (Science - PCM)', 'Class 12th (Science - PCB)',
  'Class 12th (Commerce)', 'Class 12th (Arts / Humanities)',
];

const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export const EditStudentCoursesTab: React.FC<EditStudentCoursesTabProps> = ({
  student,
  onUpdateCourses,
  initialSelectedCourseId = null,
  onSelectCourseForProgress,
}) => {
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('Class 10th (All Subjects)');
  const [newCourseCategory, setNewCourseCategory] = useState('Secondary School');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(
    initialSelectedCourseId || student.courses[0]?.id || null
  );

  React.useEffect(() => {
    if (initialSelectedCourseId) setExpandedCourseId(initialSelectedCourseId);
  }, [initialSelectedCourseId]);

  const handleToggleCourse = (id: string) => setExpandedCourseId((p) => (p === id ? null : id));

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const ends = new Date();
    ends.setFullYear(ends.getFullYear() + 1);
    const newCourse = buildEnrolledCourseWithStats({
      id: `c_${Date.now()}`,
      name: newCourseName,
      status: 'Active',
      enrolledAt: fmt(new Date()),
      endsAt: fmt(ends),
      category: newCourseCategory,
      progress: 0,
    });
    onUpdateCourses([...student.courses, newCourse]);
    setExpandedCourseId(newCourse.id);
    setShowAddCourse(false);
  };

  const handleRemoveCourse = (courseId: string) => {
    if (confirm('Are you sure you want to unenroll student from this course?')) {
      const updated = student.courses.filter((c) => c.id !== courseId);
      onUpdateCourses(updated);
      if (expandedCourseId === courseId) setExpandedCourseId(updated[0]?.id || null);
    }
  };

  const handleToggleTopic = (courseId: string, chapterId: string, topicId: string) => {
    const updatedCourses = student.courses.map((course) => {
      if (course.id !== courseId || !course.chapters) return course;

      const updatedChapters: CourseChapter[] = course.chapters.map((chapter) => {
        if (chapter.id !== chapterId || !chapter.topics) return chapter;
        const updatedTopics = chapter.topics.map((t) => (t.id === topicId ? { ...t, completed: !t.completed } : t));
        const completedLectures = updatedTopics.filter((t) => t.completed).length;
        const status: 'Completed' | 'In Progress' | 'Pending' =
          completedLectures === updatedTopics.length ? 'Completed' : completedLectures > 0 ? 'In Progress' : 'Pending';
        return { ...chapter, topics: updatedTopics, completedLectures, status };
      });

      const totalLectures = updatedChapters.reduce((s, c) => s + c.totalLectures, 0);
      const completedLectures = updatedChapters.reduce((s, c) => s + c.completedLectures, 0);
      const totalChapters = updatedChapters.length;
      const completedChapters = updatedChapters.filter((c) => c.status === 'Completed').length;
      const newProgress = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
      const totalAssignments = totalChapters;
      const completedAssignments = Math.min(totalAssignments, Math.round((newProgress / 100) * totalAssignments));

      return {
        ...course,
        progress: newProgress,
        chapters: updatedChapters,
        totalLectures,
        completedLectures,
        totalChapters,
        completedChapters,
        totalAssignments,
        completedAssignments,
      };
    });
    onUpdateCourses(updatedCourses);
  };

  const chapterBadge = (done: boolean, inProg: boolean) =>
    done
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800/50'
      : inProg
      ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800/50'
      : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50';

  return (
    <div className="space-y-6">
      <Card padding="none" className="p-5">
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b ${DIVIDER}`}>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-[#0f172a] dark:text-gray-100">Course Enrollments</h3>
              <Badge variant="brand" size="xs">
                {student.courses.length} {student.courses.length === 1 ? 'Course' : 'Courses'} Enrolled
              </Badge>
            </div>
            <p className="text-xs text-[#64748b] dark:text-gray-400 mt-0.5">
              Click on any course to open its Activity & Progress
            </p>
          </div>
          <Button size="sm" variant="primary" onClick={() => setShowAddCourse(true)} className="self-start sm:self-auto">
            <Plus className="w-3.5 h-3.5" />
            Enroll In Course
          </Button>
        </div>

        {showAddCourse && (
          <form
            onSubmit={handleAddCourse}
            className="p-4 mb-5 bg-slate-50 dark:bg-[#0F172A] border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-3 animate-in fade-in"
          >
            <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400">Add New Enrollment</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#64748b] dark:text-gray-400 mb-1">Course</label>
                <select
                  value={newCourseName}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNewCourseName(v);
                    setNewCourseCategory(v.includes('Class 9th') || v.includes('Class 10th') ? 'Secondary School' : 'Senior Secondary');
                  }}
                  className={FIELD}
                >
                  {COURSE_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-[#64748b] dark:text-gray-400 mb-1">Category</label>
                <input type="text" value={newCourseCategory} onChange={(e) => setNewCourseCategory(e.target.value)} className={FIELD} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddCourse(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm">Confirm Enrollment</Button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {student.courses.map((course, index) => {
            const isExpanded = expandedCourseId === course.id;
            const progress = course.progress ?? 0;
            const remainingProgress = 100 - progress;
            const totalLectures = course.totalLectures || 30;
            const completedLectures = course.completedLectures || Math.round((progress / 100) * totalLectures);
            const remainingLectures = Math.max(0, totalLectures - completedLectures);
            const totalChapters = course.totalChapters || course.chapters?.length || 5;
            const completedChapters = course.completedChapters || Math.round((progress / 100) * totalChapters);
            const remainingChapters = Math.max(0, totalChapters - completedChapters);

            const tiles = [
              {
                label: '✓ Completed', icon: CheckCircle2,
                box: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/40',
                txt: 'text-emerald-600 dark:text-emerald-400',
                sub: 'text-emerald-700/80 dark:text-emerald-300/80',
                value: completedLectures, of: `/ ${totalLectures}`, foot: `Lectures Completed (${progress}%)`,
              },
              {
                label: '⏳ Remaining', icon: Clock,
                box: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/40',
                txt: 'text-amber-600 dark:text-amber-400',
                sub: 'text-amber-700/80 dark:text-amber-300/80',
                value: remainingLectures, of: 'Lectures', foot: `Remaining to Complete (${remainingProgress}%)`,
              },
              {
                label: '📚 Chapters Mastered', icon: BookOpen,
                box: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/40',
                txt: 'text-blue-600 dark:text-blue-400',
                sub: 'text-blue-700/80 dark:text-blue-300/80',
                value: completedChapters, of: `/ ${totalChapters}`, foot: `${remainingChapters} chapters remaining`,
              },
              {
                label: '📝 Assignments & Tests', icon: FileCheck,
                box: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800/40',
                txt: 'text-indigo-600 dark:text-indigo-400',
                sub: 'text-indigo-700/80 dark:text-indigo-300/80',
                value: course.completedAssignments || Math.round((progress / 100) * 5),
                of: `/ ${course.totalAssignments || 5}`, foot: `Avg Score: ${course.averageScore || 85}%`,
              },
            ];

            return (
              <div
                key={course.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-white dark:bg-[#1E293B] ${
                  isExpanded
                    ? 'border-blue-400 dark:border-blue-500/70 ring-1 ring-blue-500/30 shadow-lg shadow-blue-500/5'
                    : 'border-[#e2e8f0] dark:border-[#334155] hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div
                  onClick={() => onSelectCourseForProgress?.(course.id)}
                  className="p-4 sm:p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  title="Click to view Activity & Progress for this course"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <Badge variant="brand" size="xs">Course #{index + 1}</Badge>
                      <h4 className="text-base font-bold text-[#0f172a] dark:text-gray-100 hover:text-[#3b82f6] transition-colors">
                        {course.name}
                      </h4>
                      <Badge variant={course.status === 'Active' ? 'success' : 'danger'}>{course.status}</Badge>
                      {course.category && (
                        <span className="text-[11px] text-[#64748b] dark:text-gray-400 bg-slate-100 dark:bg-slate-800/70 px-2 py-0.5 rounded">
                          {course.category}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-[#64748b] dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Enrolled: {course.enrolledAt}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-emerald-600 dark:text-emerald-400">Ends: {course.endsAt}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{completedLectures}/{totalLectures} Lectures Completed</span>
                      </div>
                    </div>

                    <div className="mt-3 max-w-md">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-[#64748b] dark:text-gray-400 font-medium">Progress</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      Certificate
                    </Button>

                    {student.courses.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCourse(course.id);
                        }}
                        className="!p-2 !text-rose-500 hover:!bg-rose-50 dark:hover:!bg-rose-500/10"
                        title="Unenroll course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCourse(course.id);
                      }}
                      className={`p-2 rounded-lg transition-all cursor-pointer ${
                        isExpanded
                          ? 'rotate-180 bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300'
                      }`}
                      title={isExpanded ? 'Collapse course details' : 'Expand course details'}
                      aria-label={isExpanded ? 'Collapse course details' : 'Expand course details'}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className={`border-t ${DIVIDER} p-5 bg-slate-50/60 dark:bg-[#0F172A]/60 space-y-5 animate-in fade-in duration-150`}>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-xs font-bold text-[#0f172a] dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                          Detailed Completion Status
                        </h5>
                        <span className="text-[11px] text-[#64748b] dark:text-gray-400">
                          Overall: <strong className="text-[#0f172a] dark:text-white">{progress}%</strong>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {tiles.map((t) => {
                          const Icon = t.icon;
                          return (
                            <div key={t.label} className={`p-3.5 rounded-xl border ${t.box}`}>
                              <div className="flex items-center justify-between">
                                <span className={`text-[11px] font-semibold ${t.txt}`}>{t.label}</span>
                                <Icon className={`w-4 h-4 ${t.txt}`} />
                              </div>
                              <div className="text-xl font-bold text-[#0f172a] dark:text-white mt-1">
                                {t.value} <span className="text-xs font-normal text-[#64748b] dark:text-gray-400">{t.of}</span>
                              </div>
                              <div className={`text-[11px] mt-0.5 ${t.sub}`}>{t.foot}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className={`p-3 rounded-xl bg-white dark:bg-[#0F172A] border ${DIVIDER}`}>
                      <div className="flex justify-between items-center text-xs mb-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="text-[#0f172a] dark:text-gray-300 font-medium">Completed: {progress}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                          <span className="text-[#64748b] dark:text-gray-400 font-medium">Pending: {remainingProgress}%</span>
                        </div>
                      </div>
                      <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                        <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-[#0f172a] dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                          Course Syllabus & Chapter Breakdown
                        </h5>
                        <span className="text-[11px] text-[#64748b] dark:text-gray-400 hidden sm:inline">
                          Click topic to mark completed/pending
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {course.chapters && course.chapters.length > 0 ? (
                          course.chapters.map((chapter, chIdx) => {
                            const done = chapter.status === 'Completed';
                            const inProg = chapter.status === 'In Progress';
                            return (
                              <div key={chapter.id} className={`border ${DIVIDER} rounded-xl bg-white dark:bg-[#1E293B] overflow-hidden`}>
                                <div className={`p-3 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 border-b ${DIVIDER}`}>
                                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                    <Badge variant="neutral" size="xs" pill={false}>Unit {chIdx + 1}</Badge>
                                    <span className="text-xs font-bold text-[#0f172a] dark:text-gray-200 truncate">{chapter.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[11px] text-[#64748b] dark:text-gray-400 hidden sm:inline">
                                      {chapter.completedLectures} / {chapter.totalLectures} lectures
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${chapterBadge(done, inProg)}`}>
                                      {done ? 'Completed' : inProg ? 'In Progress' : 'Pending'}
                                    </span>
                                  </div>
                                </div>

                                <div className="p-2.5 divide-y divide-[#e2e8f0] dark:divide-[#334155]">
                                  {chapter.topics?.map((topic) => (
                                    <div
                                      key={topic.id}
                                      onClick={() => handleToggleTopic(course.id, chapter.id, topic.id)}
                                      className="py-2 px-2 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg cursor-pointer transition-colors group"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <input
                                          type="checkbox"
                                          checked={topic.completed}
                                          onChange={() => {}}
                                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 bg-white dark:bg-slate-900 cursor-pointer"
                                        />
                                        <span
                                          className={`text-xs truncate ${
                                            topic.completed
                                              ? 'text-[#64748b] dark:text-gray-400 line-through'
                                              : 'text-[#0f172a] dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-300'
                                          }`}
                                        >
                                          {topic.title}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-3 shrink-0 text-[11px]">
                                        {topic.duration && (
                                          <span className="text-slate-400 flex items-center gap-1">
                                            <PlayCircle className="w-3 h-3" />
                                            {topic.duration}
                                          </span>
                                        )}
                                        {topic.score && (
                                          <span className="text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                                            Score: {topic.score}%
                                          </span>
                                        )}
                                        <span
                                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                            topic.completed
                                              ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/60'
                                              : 'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800/60'
                                          }`}
                                        >
                                          {topic.completed ? 'Done' : 'Pending'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className={`p-4 rounded-xl bg-white dark:bg-slate-900/60 border ${DIVIDER} text-center text-xs text-[#64748b] dark:text-gray-400`}>
                            No chapter breakdown available for this course yet.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleToggleCourse(course.id)}>
                        <ChevronUp className="w-3.5 h-3.5" />
                        Close Course Details
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default EditStudentCoursesTab;
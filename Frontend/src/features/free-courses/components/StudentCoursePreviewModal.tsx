import React, { useState, useEffect } from 'react';
import type { FreeCourse, CourseModule, Lesson, ResourceItem } from '../types/free-course.types';
import { freeCourseContentApi } from '../api/freeCourseContent.api';
import { useFreeToast as useToast } from '../hooks/useFreeToast';
import {
  Play,
  CheckCircle2,
  Download,
  FileText,
  BookOpen,
  Clock,
  Users,
  Award,
  Star,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Send,
  X,
  ShieldCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  Edit3,
  FileDown,
} from 'lucide-react';

interface StudentCoursePreviewModalProps {
  course: FreeCourse | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (course: FreeCourse) => void;
  onManageContent?: (course: FreeCourse) => void;
  onDuplicate?: (id: string) => void;
}

export const StudentCoursePreviewModal: React.FC<StudentCoursePreviewModalProps> = ({
  course,
  isOpen,
  onClose,
  onEdit,
}) => {
  const { success, info } = useToast();

  // Mode: 'overview' (Course Landing & Syllabus) or 'classroom' (Active Video Player & Notes Reader)
  const [viewTab, setViewTab] = useState<'overview' | 'classroom'>('overview');

  // Enrolled status state in student preview
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Curriculum data
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);

  // Active playing lesson in classroom
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Completed lessons tracking in student preview
  const [completedLessonIds, setCompletedLessonIds] = useState<Record<string, boolean>>({});

  // Classroom bottom tabs: 'notes' | 'summary' | 'doubts' | 'quiz'
  const [classroomSubTab, setClassroomSubTab] = useState<'notes' | 'summary' | 'doubts' | 'quiz'>('notes');

  // Interactive doubts state
  const [doubtText, setDoubtText] = useState('');
  const [doubtsList, setDoubtsList] = useState<Array<{
    id: string;
    studentName: string;
    avatar: string;
    time: string;
    question: string;
    answer?: string;
    upvotes: number;
  }>>([
    {
      id: 'd-1',
      studentName: 'Aarav Sharma (Class 10)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80',
      time: '2 hours ago',
      question: 'Sir, in this lecture how does latent heat of vaporisation differ from latent heat of fusion?',
      answer: 'Great question Aarav! Latent heat of fusion is required for solid-to-liquid phase transition, while vaporisation is for liquid-to-gas at boiling point without change in temperature.',
      upvotes: 14,
    },
    {
      id: 'd-2',
      studentName: 'Riya Patel (Class 10)',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
      time: '1 day ago',
      question: 'Are the formulas in the attached PDF sufficient for CBSE board exam?',
      answer: 'Yes Riya, the attached Formula Sheet and Mindmap covers 100% of NCERT derivations and key standard numerical formulas.',
      upvotes: 9,
    },
  ]);

  // Expanded modules in accordion
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Load course modules when modal opens
  useEffect(() => {
    if (isOpen && course) {
      setIsLoadingModules(true);
      freeCourseContentApi.getModules(course.id)
        .then((data) => {
          setModules(data);
          const exp: Record<string, boolean> = {};
          data.forEach((m) => {
            exp[m.id] = true;
          });
          setExpandedModules(exp);

          // Find first lesson for classroom
          for (const m of data) {
            for (const c of m.chapters) {
              if (c.lessons && c.lessons.length > 0) {
                setActiveLesson(c.lessons[0]);
                break;
              }
            }
            if (activeLesson) break;
          }
        })
        .catch((err) => console.error('Failed to load modules for preview:', err))
        .finally(() => setIsLoadingModules(false));
    }
  }, [isOpen, course?.id]);

  if (!isOpen || !course) return null;

  // Calculate total lessons and completion stats
  const allLessons: Lesson[] = [];
  modules.forEach((m) => {
    m.chapters?.forEach((c) => {
      c.lessons?.forEach((l) => allLessons.push(l));
    });
  });
  const totalLessonsCount = allLessons.length || course.lessonsCount || 8;
  const completedCount = Object.keys(completedLessonIds).filter((id) => completedLessonIds[id]).length;
  const progressPercent = Math.min(100, Math.round((completedCount / (totalLessonsCount || 1)) * 100));

  // Toggle module in curriculum accordion
  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  // Launch a specific lesson in Classroom Player
  const handleStartLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setViewTab('classroom');
  };

  // Mark lesson as complete
  const handleToggleCompleteLesson = (lessonId: string) => {
    const isNowComplete = !completedLessonIds[lessonId];
    setCompletedLessonIds((prev) => ({ ...prev, [lessonId]: isNowComplete }));
    if (isNowComplete) {
      success('Lesson Completed!', 'Your course progress has been updated.');
    }
  };

  // Navigate to next lesson
  const handleNextLesson = () => {
    if (!activeLesson) return;
    const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      setActiveLesson(allLessons[currentIndex + 1]);
    } else {
      info('End of Course', 'You have reached the final lesson of this course.');
    }
  };

  // Navigate to previous lesson
  const handlePrevLesson = () => {
    if (!activeLesson) return;
    const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex > 0) {
      setActiveLesson(allLessons[currentIndex - 1]);
    }
  };

  // Handle Free Enrollment
  const handleEnrollNow = () => {
    setIsEnrolled(true);
    success('Enrolled Successfully! 🎉', 'You now have 100% free lifetime access to this course.');
  };

  // Handle Post Doubt
  const handlePostDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtText.trim()) return;
    const newDoubt = {
      id: `d-${Date.now()}`,
      studentName: 'You (Student Preview)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
      time: 'Just now',
      question: doubtText.trim(),
      answer: 'Thank you for your doubt! Teacher will address this numerical in the upcoming live revision class.',
      upvotes: 1,
    };
    setDoubtsList((prev) => [newDoubt, ...prev]);
    setDoubtText('');
    success('Doubt Posted', 'Your question has been added to the discussion forum.');
  };

  // Download resource helper
  const handleDownloadResource = (res: ResourceItem) => {
    if (res.fileData) {
      const a = document.createElement('a');
      a.href = res.fileData;
      a.download = res.fileName || `${res.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      success('Download Started', `Downloading ${a.download}`);
    } else if (res.url) {
      window.open(res.url, '_blank');
    } else {
      const blob = new Blob(
        [
          `Course: ${course.title}\nStudy Resource: ${res.title}\nClass: ${course.targetClass} • Subject: ${course.primarySubject}\n100% Free Educational Material - Fukey Education`
        ],
        { type: 'text/plain' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${res.title.replace(/\s+/g, '_')}_Notes.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      success('Download Started', `Downloaded "${res.title}"`);
    }
  };

  // Convert youtube url to embed format
  const getEmbedUrl = (url?: string) => {
    if (!url) return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`;
    }
    return url;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F6F7FA]/95 dark:bg-slate-950/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. STUDENT PREVIEW HEADER & TOP BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#1E293B] border-b border-[#E6E8EE] dark:border-[#334155] px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-lg">
        {/* Left: Preview Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#EAF0FE] border border-blue-200 text-[#2451D9] dark:bg-blue-500/15 dark:border-blue-500/30 dark:text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Student View</span>
          </div>
          <div className="hidden md:block">
            <span className="text-xs font-semibold text-[#12141C] dark:text-white truncate max-w-sm block">
              {course.title}
            </span>
            <span className="text-[10px] text-[#686E7D] dark:text-slate-400 font-mono">
              {course.courseCode} • {course.targetClass} • 100% Free
            </span>
          </div>
        </div>

        {/* Center: Student Navigation Switcher */}
        <div className="flex items-center bg-[#F6F7FA] dark:bg-[#0B0F19] border border-[#E6E8EE] dark:border-[#334155] rounded-xl p-1 shadow-inner">
          <button
            type="button"
            onClick={() => setViewTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewTab === 'overview'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-[#686E7D] dark:text-slate-400 hover:text-[#12141C] dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Course Overview</span>
          </button>
          <button
            type="button"
            onClick={() => setViewTab('classroom')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewTab === 'classroom'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-[#686E7D] dark:text-slate-400 hover:text-[#12141C] dark:hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Classroom Player</span>
          </button>
        </div>

        {/* Right: Quick Admin Shortcuts & Exit Preview */}
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(course);
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-[#E6E8EE] text-slate-600 hover:text-[#12141C] dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white text-xs font-semibold cursor-pointer transition-colors"
              title="Edit course in Admin panel"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#2451D9] dark:text-blue-400" />
              <span>Edit Course</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FCEAE4] hover:bg-rose-100 border border-rose-200 text-[#DC5B3E] dark:bg-rose-500/15 dark:hover:bg-rose-500/25 dark:border-rose-500/35 dark:text-rose-300 text-xs font-bold cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Exit Preview</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. TAB 1: COURSE OVERVIEW & SYLLABUS (STUDENT LANDING PAGE) */}
      {/* ========================================================================= */}
      {viewTab === 'overview' && (
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-150">
          {/* Top Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Cols: Title, Instructor, Description, Action */}
            <div className="lg:col-span-2 space-y-5">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E7F7ED] text-[#16A34A] border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  100% Free Tuition (₹0)
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF0FE] text-[#2451D9] border border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30">
                  {course.targetClass}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F1EAFE] text-[#7C3AED] border border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30">
                  {course.board}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FDF3E0] text-[#D97706] border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30">
                  {course.language} Medium
                </span>
              </div>

              {/* Title & Short Description */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#12141C] dark:text-white tracking-tight leading-tight">
                  {course.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {course.shortDescription}
                </p>
              </div>

              {/* Key Student Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-[#E6E8EE] dark:border-[#334155]">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#2451D9] dark:text-blue-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#686E7D] dark:text-slate-400 block uppercase font-bold">Duration</span>
                    <span className="text-xs font-bold text-[#12141C] dark:text-white">{course.duration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-[#16A34A] dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#686E7D] dark:text-slate-400 block uppercase font-bold">Curriculum</span>
                    <span className="text-xs font-bold text-[#12141C] dark:text-white">{totalLessonsCount} Lessons</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#686E7D] dark:text-slate-400 block uppercase font-bold">Enrolled</span>
                    <span className="text-xs font-bold text-[#12141C] dark:text-white">
                      {course.enrollmentsCount?.toLocaleString() || '3,450'}+ Students
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#686E7D] dark:text-slate-400 block uppercase font-bold">Certificate</span>
                    <span className="text-xs font-bold text-[#12141C] dark:text-white">Verified Free</span>
                  </div>
                </div>
              </div>

              {/* Instructor Card */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] shadow-sm">
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  className="w-12 h-12 rounded-xl object-cover border border-[#E6E8EE] dark:border-slate-700 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#12141C] dark:text-white">{course.instructor.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAF0FE] text-[#2451D9] border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30 font-semibold">
                      Top Faculty
                    </span>
                  </div>
                  <p className="text-xs text-[#686E7D] dark:text-slate-400 truncate">
                    {course.instructor.specialization}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-[#686E7D] dark:text-slate-400 mt-1">
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      4.9 (1,450 reviews)
                    </span>
                    <span>•</span>
                    <span>15,000+ Students Mentored</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Course Card & Free Enrollment CTA */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-3xl p-5 shadow-2xl space-y-5 sticky top-20">
                {/* 16:9 Thumbnail Banner with Play Overlay */}
                <div
                  onClick={() => setViewTab('classroom')}
                  className="relative group rounded-2xl overflow-hidden aspect-video border border-[#E6E8EE] dark:border-slate-700 bg-slate-100 dark:bg-slate-950 cursor-pointer shadow-lg"
                >
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-blue-600 group-hover:bg-blue-500 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2.5 left-3 bg-black/75 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1">
                    <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                    <span>Watch Free Demo Lesson</span>
                  </div>
                </div>

                {/* Price & Free Guarantee */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#686E7D] dark:text-slate-400">Tuition Fee</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#16A34A] dark:text-emerald-400">₹0</span>
                      <span className="text-xs line-through text-slate-500 font-semibold">₹2,999</span>
                      <span className="text-[10px] font-bold text-[#16A34A] bg-[#E7F7ED] dark:text-emerald-300 dark:bg-emerald-500/20 px-2 py-0.5 rounded">
                        100% OFF
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#686E7D] dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
                    Full Free Access
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5">
                  {isEnrolled ? (
                    <button
                      type="button"
                      onClick={() => setViewTab('classroom')}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer transition-all"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Continue Learning (Classroom)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleEnrollNow}
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                      <span>Enroll Now for Free (₹0)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setViewTab('classroom')}
                    className="w-full py-2.5 px-3 rounded-xl border border-[#E6E8EE] bg-white hover:bg-slate-50 text-slate-600 hover:text-[#12141C] dark:border-slate-700 dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#2451D9] dark:text-blue-400" />
                    <span>View Curriculum & PDF Notes</span>
                  </button>
                </div>

                {/* What's included checklist */}
                <div className="pt-3 border-t border-[#E6E8EE] dark:border-[#334155] space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-[#686E7D] dark:text-slate-400 uppercase tracking-wider block">
                    What Students Get:
                  </span>
                  <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#16A34A] dark:text-emerald-400 shrink-0" />
                      <span>Lifetime Access to all Video Lectures</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#16A34A] dark:text-emerald-400 shrink-0" />
                      <span>Downloadable Hand-written Notes & PDFs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#16A34A] dark:text-emerald-400 shrink-0" />
                      <span>Daily Practice Sheets (DPS) with Solutions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#16A34A] dark:text-emerald-400 shrink-0" />
                      <span>Doubt Clearance Forum with Master Teachers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#16A34A] dark:text-emerald-400 shrink-0" />
                      <span>Certificate of Completion (100% Free)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CURRICULUM ACCORDION (WHAT STUDENTS WILL LEARN) */}
          {/* ========================================================================= */}
          <section className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-bold text-[#12141C] dark:text-white tracking-tight">
                  Course Curriculum & Study Material
                </h3>
                <p className="text-xs text-[#686E7D] dark:text-slate-400 mt-0.5">
                  Complete syllabus modules, interactive lessons, and downloadable study resources for {course.targetClass}.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#686E7D] dark:text-slate-400">
                {modules.length} Modules • {totalLessonsCount} Lessons
              </span>
            </div>

            {/* Modules List */}
            {isLoadingModules ? (
              <div className="p-8 text-center bg-white dark:bg-[#0B0F19] rounded-2xl border border-[#E6E8EE] dark:border-[#334155]">
                <span className="text-xs text-[#686E7D] dark:text-slate-400">Loading syllabus modules...</span>
              </div>
            ) : modules.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#0B0F19] rounded-2xl border border-[#E6E8EE] dark:border-[#334155]">
                <span className="text-xs text-[#686E7D] dark:text-slate-400">No syllabus modules configured yet.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {modules.map((module, mIdx) => {
                  const isExpanded = expandedModules[module.id] ?? true;
                  const modLessonsCount = module.chapters.reduce(
                    (acc, c) => acc + (c.lessons?.length || 0),
                    0
                  );

                  return (
                    <div
                      key={module.id}
                      className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-2xl overflow-hidden shadow-md"
                    >
                      {/* Module Header */}
                      <button
                        type="button"
                        onClick={() => toggleModule(module.id)}
                        className="w-full p-4 bg-slate-50 hover:bg-slate-100 dark:bg-[#0d172e]/60 dark:hover:bg-[#0d172e] flex items-center justify-between text-left cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-[#EAF0FE] text-[#2451D9] border border-blue-200 dark:bg-blue-600/20 dark:text-blue-400 dark:border-blue-500/30 font-bold text-xs flex items-center justify-center">
                            {mIdx + 1}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-[#12141C] dark:text-white block">
                              {module.title}
                            </span>
                            {module.description && (
                              <span className="text-[11px] text-[#686E7D] dark:text-slate-400 block mt-0.5">
                                {module.description}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-[#686E7D] dark:text-slate-400 font-medium">
                            {modLessonsCount} Lessons
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-[#686E7D] dark:text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-[#686E7D] dark:text-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Chapters & Lessons */}
                      {isExpanded && (
                        <div className="p-4 space-y-4 border-t border-[#E6E8EE] dark:border-[#334155]">
                          {module.chapters.map((chapter) => (
                            <div key={chapter.id} className="space-y-2">
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block pl-1">
                                {chapter.title}
                              </span>

                              <div className="space-y-2">
                                {chapter.lessons.map((lesson) => (
                                  <div
                                    key={lesson.id}
                                    className="p-3 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-[#E6E8EE] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                                  >
                                    {/* Lesson Left: Play icon & title */}
                                    <div className="flex items-start gap-3">
                                      <button
                                        type="button"
                                        onClick={() => handleStartLesson(lesson)}
                                        className="mt-0.5 w-7 h-7 rounded-lg bg-[#EAF0FE] hover:bg-blue-100 border border-blue-200 text-[#2451D9] dark:bg-blue-500/15 dark:hover:bg-blue-500/30 dark:border-blue-500/30 dark:text-blue-400 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                                        title="Play Lesson"
                                      >
                                        <Play className="w-3.5 h-3.5 fill-blue-600 dark:fill-blue-400" />
                                      </button>
                                      <div>
                                        <span
                                          onClick={() => handleStartLesson(lesson)}
                                          className="text-xs font-semibold text-[#12141C] dark:text-white hover:text-[#2451D9] dark:hover:text-blue-400 cursor-pointer transition-colors block"
                                        >
                                          {lesson.title}
                                        </span>
                                        <div className="flex items-center gap-2 text-[10px] text-[#686E7D] dark:text-slate-400 mt-0.5">
                                          <span>{lesson.duration}</span>
                                          <span>•</span>
                                          <span className="capitalize">
                                            {lesson.contentType.replace('_', ' ')}
                                          </span>
                                          <span>•</span>
                                          <span className="text-[#16A34A] dark:text-emerald-400 font-bold">
                                            100% Free
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Lesson Right: Attached PDFs / Resources & Play button */}
                                    <div className="flex flex-wrap items-center gap-2">
                                      {lesson.resources?.map((res) => (
                                        <button
                                          type="button"
                                          key={res.id}
                                          onClick={() => handleDownloadResource(res)}
                                          className="px-2.5 py-1 rounded-lg bg-[#EAF0FE] hover:bg-blue-100 border border-blue-200 text-[#2451D9] dark:bg-[#111c38] dark:hover:bg-[#18264c] dark:border-blue-500/25 dark:text-blue-300 text-[11px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                                          title="Click to download resource"
                                        >
                                          <Download className="w-3 h-3 text-[#2451D9] dark:text-blue-400" />
                                          <span className="truncate max-w-[140px]">{res.title}</span>
                                          {res.fileSize && (
                                            <span className="text-[10px] text-[#686E7D] dark:text-slate-400">
                                              ({res.fileSize})
                                            </span>
                                          )}
                                        </button>
                                      ))}

                                      <button
                                        type="button"
                                        onClick={() => handleStartLesson(lesson)}
                                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition-colors ml-auto"
                                      >
                                        Watch
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Full Description & Student Benefits */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-[#12141C] dark:text-white uppercase tracking-wider">
                About this Free Course
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {course.fullDescription || course.shortDescription}
              </p>
            </div>

            <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-[#12141C] dark:text-white uppercase tracking-wider">
                Student Learning Perks
              </h4>
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="p-3 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-[#E6E8EE] dark:border-[#334155]">
                  <strong className="text-[#12141C] dark:text-white block">No Hidden Costs (Always Free):</strong>
                  <span className="text-[#686E7D] dark:text-slate-400 text-[11px]">
                    This curriculum is completely sponsored for student academic excellence without any subscription fees.
                  </span>
                </div>
                <div className="p-3 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-[#E6E8EE] dark:border-[#334155]">
                  <strong className="text-[#12141C] dark:text-white block">Interactive Doubt Clearance:</strong>
                  <span className="text-[#686E7D] dark:text-slate-400 text-[11px]">
                    Ask doubts directly beneath each video lecture and receive certified answers from mentors.
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB 2: LIVE CLASSROOM & VIDEO PLAYER (STUDENT LEARNING ENVIRONMENT) */}
      {/* ========================================================================= */}
      {viewTab === 'classroom' && (
        <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden animate-in fade-in duration-150">
          {/* Main Stage: Cinema Video Player + Notes / Doubts Drawer */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5">
            {/* Player Container */}
            <div className="rounded-2xl overflow-hidden bg-black border border-[#E6E8EE] dark:border-slate-800 shadow-2xl">
              <div className="relative aspect-video w-full">
                <iframe
                  src={getEmbedUrl(activeLesson?.videoUrl || course.demoVideoUrl)}
                  title={activeLesson?.title || course.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Lesson Title & Completion Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] shadow-md">
              <div>
                <span className="text-[10px] text-[#2451D9] dark:text-blue-400 font-bold uppercase tracking-wider block">
                  Now Playing • {course.targetClass} {course.primarySubject}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-[#12141C] dark:text-white mt-0.5">
                  {activeLesson?.title || 'Lesson 1: Introduction to Foundation Concepts'}
                </h2>
                <div className="flex items-center gap-2 text-xs text-[#686E7D] dark:text-slate-400 mt-1">
                  <span>{activeLesson?.duration || '45 mins'}</span>
                  <span>•</span>
                  <span>Faculty: {course.instructor.name}</span>
                </div>
              </div>

              {/* Progress & Next/Prev Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevLesson}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-[#12141C] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white cursor-pointer transition-colors"
                  title="Previous Lesson"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                {activeLesson && (
                  <button
                    type="button"
                    onClick={() => handleToggleCompleteLesson(activeLesson.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      completedLessonIds[activeLesson.id]
                        ? 'bg-[#E7F7ED] text-[#16A34A] border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {completedLessonIds[activeLesson.id] ? 'Completed' : 'Mark Complete'}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNextLesson}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-[#12141C] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white cursor-pointer transition-colors"
                  title="Next Lesson"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabbed Learning Resources Drawer */}
            <div className="bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-2xl overflow-hidden shadow-md">
              {/* Tabs Bar */}
              <div className="flex items-center gap-2 border-b border-[#E6E8EE] dark:border-[#334155] px-4 pt-2 overflow-x-auto bg-[#F6F7FA] dark:bg-[#0B0F19]">
                <button
                  type="button"
                  onClick={() => setClassroomSubTab('notes')}
                  className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-all ${
                    classroomSubTab === 'notes'
                      ? 'border-blue-500 text-[#2451D9] dark:text-blue-400'
                      : 'border-transparent text-[#686E7D] dark:text-slate-400 hover:text-[#12141C] dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Study Notes & PDFs ({activeLesson?.resources?.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setClassroomSubTab('doubts')}
                  className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-all ${
                    classroomSubTab === 'doubts'
                      ? 'border-blue-500 text-[#2451D9] dark:text-blue-400'
                      : 'border-transparent text-[#686E7D] dark:text-slate-400 hover:text-[#12141C] dark:hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Student Doubts & Q&A ({doubtsList.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setClassroomSubTab('summary')}
                  className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-all ${
                    classroomSubTab === 'summary'
                      ? 'border-blue-500 text-[#2451D9] dark:text-blue-400'
                      : 'border-transparent text-[#686E7D] dark:text-slate-400 hover:text-[#12141C] dark:hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Lecture Summary</span>
                </button>
              </div>

              {/* Sub-tab 1: Study Notes & PDFs */}
              {classroomSubTab === 'notes' && (
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#12141C] dark:text-white uppercase tracking-wider">
                        Attached Lecture Materials
                      </h4>
                      <p className="text-[11px] text-[#686E7D] dark:text-slate-400 mt-0.5">
                        Download and read revision materials, formula sheets, and question sets prepared by {course.instructor.name}.
                      </p>
                    </div>
                  </div>

                  {activeLesson?.resources && activeLesson.resources.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeLesson.resources.map((res) => (
                        <div
                          key={res.id}
                          className="p-3.5 rounded-xl bg-[#F6F7FA] dark:bg-[#0B0F19] border border-[#E6E8EE] dark:border-[#334155] flex items-center justify-between gap-3 hover:border-blue-400 dark:hover:border-blue-500/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-[#EAF0FE] border border-blue-200 text-[#2451D9] dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-[#12141C] dark:text-white block truncate">
                                {res.title}
                              </span>
                              <span className="text-[10px] text-[#686E7D] dark:text-slate-400 block mt-0.5 font-mono">
                                {res.type.toUpperCase()} • {res.fileSize || 'Standard'} • Free
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDownloadResource(res)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors shrink-0"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center rounded-xl bg-[#F6F7FA] dark:bg-[#0B0F19] border border-dashed border-[#E6E8EE] dark:border-[#334155]">
                      <FileDown className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-xs font-bold text-[#686E7D] dark:text-slate-400">
                        No supplementary PDFs attached to this lesson yet.
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Students can review core formulas from the main course curriculum.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab 2: Doubts & Q&A */}
              {classroomSubTab === 'doubts' && (
                <div className="p-5 space-y-5">
                  {/* Ask a Doubt Form */}
                  <form onSubmit={handlePostDoubt} className="space-y-2">
                    <span className="text-xs font-bold text-[#12141C] dark:text-white uppercase tracking-wider block">
                      Ask a Doubt or Question
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={doubtText}
                        onChange={(e) => setDoubtText(e.target.value)}
                        placeholder="Type your question or concept doubt here..."
                        className="flex-1 bg-white dark:bg-[#0B0F19] border border-[#e2e8f0] dark:border-[#374151] text-[#0f172a] dark:text-gray-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#3b82f6]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post Doubt</span>
                      </button>
                    </div>
                  </form>

                  {/* Doubts List */}
                  <div className="space-y-3">
                    {doubtsList.map((d) => (
                      <div
                        key={d.id}
                        className="p-3.5 rounded-xl bg-[#F6F7FA] dark:bg-[#0B0F19] border border-[#E6E8EE] dark:border-[#334155] space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={d.avatar}
                              alt={d.studentName}
                              className="w-6 h-6 rounded-full object-cover border border-[#E6E8EE] dark:border-slate-700"
                            />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                              {d.studentName}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">{d.time}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium pl-8">
                          "{d.question}"
                        </p>

                        {d.answer && (
                          <div className="ml-8 mt-2 p-3 rounded-lg bg-[#EAF0FE] dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/20 text-xs space-y-1">
                            <div className="flex items-center gap-1.5 text-[#2451D9] dark:text-blue-400 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Faculty Reply:</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                              {d.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-tab 3: Lecture Summary */}
              {classroomSubTab === 'summary' && (
                <div className="p-5 space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  <h4 className="font-bold text-[#12141C] dark:text-white uppercase tracking-wider text-xs">
                    Lesson Concept Breakdown
                  </h4>
                  <p>
                    In this session, students dive deep into core foundational concepts aligned with CBSE NCERT.
                    Emphasis is placed on step-by-step problem solving, derivation of standard laws, and identifying high-frequency board exam questions.
                  </p>
                  <div className="p-3 bg-[#F6F7FA] dark:bg-[#0B0F19] rounded-xl border border-[#E6E8EE] dark:border-[#334155] text-[11px] space-y-1 text-[#686E7D] dark:text-slate-400">
                    <strong className="text-[#12141C] dark:text-white block">Key Student Takeaways:</strong>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Understanding conceptual definitions and physical significance.</li>
                      <li>Solving exemplar numerical problems with dimensional analysis.</li>
                      <li>Reviewing common student errors in board examinations.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right-Side Sticky Playlist: Syllabus & Lesson Navigator */}
          <div className="w-full lg:w-96 bg-white dark:bg-[#1E293B] border-t lg:border-t-0 lg:border-l border-[#E6E8EE] dark:border-[#334155] flex flex-col shrink-0">
            {/* Playlist Header & Student Progress Bar */}
            <div className="p-4 border-b border-[#E6E8EE] dark:border-[#334155] bg-slate-50 dark:bg-[#0B0F19]/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#12141C] dark:text-white uppercase tracking-wider">
                  Course Playlist
                </span>
                <span className="text-xs font-bold text-[#2451D9] dark:text-blue-400 font-mono">
                  {progressPercent}% Done
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#686E7D] dark:text-slate-400">
                <span>{completedCount} of {totalLessonsCount} Completed</span>
                <span>Free Access</span>
              </div>
            </div>

            {/* Playlist Lessons List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {modules.map((module, mIdx) => (
                <div key={module.id} className="space-y-1">
                  <div className="px-2 py-1 text-[11px] font-bold text-[#686E7D] dark:text-slate-400 uppercase tracking-wider">
                    Module {mIdx + 1}: {module.title}
                  </div>

                  <div className="space-y-1">
                    {module.chapters.map((chap) =>
                      chap.lessons.map((lesson) => {
                        const isActive = activeLesson?.id === lesson.id;
                        const isCompleted = completedLessonIds[lesson.id];

                        return (
                          <button
                            type="button"
                            key={lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                            className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                              isActive
                                ? 'bg-[#EAF0FE] border border-blue-300 text-[#12141C] shadow-sm dark:bg-blue-600/20 dark:border-blue-500/50 dark:text-white'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-emerald-400 shrink-0" />
                              ) : (
                                <Play
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isActive
                                      ? 'text-[#2451D9] fill-[#2451D9] dark:text-blue-400 dark:fill-blue-400'
                                      : 'text-slate-400 dark:text-slate-500'
                                  }`}
                                />
                              )}
                              <div className="min-w-0">
                                <span
                                  className={`text-xs font-medium block truncate ${
                                    isActive
                                      ? 'text-[#2451D9] dark:text-blue-300 font-bold'
                                      : 'text-slate-600 dark:text-slate-300'
                                  }`}
                                >
                                  {lesson.title}
                                </span>
                                <span className="text-[10px] text-slate-500 block">
                                  {lesson.duration}
                                </span>
                              </div>
                            </div>

                            {lesson.resources && lesson.resources.length > 0 && (
                              <span className="text-[10px] font-semibold text-[#2451D9] bg-[#EAF0FE] border border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20 px-1.5 py-0.5 rounded shrink-0">
                                {lesson.resources.length} PDF
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
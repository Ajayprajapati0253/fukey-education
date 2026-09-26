// src/features/courses/components/CourseDetailsModal.tsx

import React, { useEffect, useState } from 'react';
import {
  X,
  Pencil,
  Users,
  Clock,
  Star,
  Globe,
  IndianRupee,
  FileCheck,
  Calendar,
  Share2,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  FileText,
  Video,
} from 'lucide-react';

import { useUIStore } from '../../../store/ui.store';
import type { Course } from '../types/course.types';

import {
  getCourseChapters,
  type CourseChapter,
  type CourseLesson,
} from '../api/course.api';

interface CourseDetailsModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (course: Course) => void;
}

export const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({
  course,
  isOpen,
  onClose,
  onEdit,
}) => {
  const { currency } = useUIStore();

  const [chapters, setChapters] = useState<CourseChapter[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);

  const [expandedChapters, setExpandedChapters] = useState<
    Record<string, boolean>
  >({});

  const [selectedLesson, setSelectedLesson] =
    useState<CourseLesson | null>(null);

  /**
   * ------------------------------------------------------------
   * API BASE URL
   * ------------------------------------------------------------
   *
   * Example:
   * VITE_API_BASE_URL =
   * http://localhost:3000/api
   *
   * Recording URL becomes:
   * http://localhost:3000/recordings/...
   */
  const getVideoUrl = (filePath?: string | null) => {
    if (!filePath) {
      return '';
    }

    // Already a complete URL
    if (
      filePath.startsWith('http://') ||
      filePath.startsWith('https://')
    ) {
      return filePath;
    }

    const apiBaseUrl = "https://d11dhk504cz5tf.cloudfront.net/"

    const serverBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '');

    const cleanPath = filePath.replace(/^\/+/, '');

    return `${serverBaseUrl}/${cleanPath}`;
  };

  /**
   * Load course chapters whenever modal opens
   * or selected course changes.
   */
  useEffect(() => {
    if (!isOpen || !course?.id) {
      setChapters([]);
      setExpandedChapters({});
      setSelectedLesson(null);
      return;
    }

    let cancelled = false;

    const loadChapters = async () => {
      try {
        setChaptersLoading(true);

        const response = await getCourseChapters(course.id);

        console.log('responseByHimanshu', response);

        if (cancelled) {
          return;
        }

        const fetchedChapters = Array.isArray(response?.data)
          ? response.data
          : [];

        setChapters(fetchedChapters);

        // Open first chapter by default
        if (fetchedChapters.length > 0) {
          setExpandedChapters({
            [fetchedChapters[0].id]: true,
          });
        } else {
          setExpandedChapters({});
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          'Failed to load course chapters:',
          error,
        );

        setChapters([]);
        setExpandedChapters({});
      } finally {
        if (!cancelled) {
          setChaptersLoading(false);
        }
      }
    };

    loadChapters();

    return () => {
      cancelled = true;
    };
  }, [isOpen, course?.id]);

  /**
   * Stop video when modal closes
   */
  useEffect(() => {
    if (!isOpen) {
      setSelectedLesson(null);
    }
  }, [isOpen]);

  /**
   * Expand / collapse chapter
   */
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  /**
   * Open video player
   */
  const handlePlayLesson = (lesson: CourseLesson) => {
    if (!lesson.file_path) {
      console.error(
        'No video file path available for lesson:',
        lesson,
      );

      return;
    }

    setSelectedLesson(lesson);
  };

  /**
   * Close video player
   */
  const closeVideoPlayer = () => {
    setSelectedLesson(null);
  };

  /**
   * Escape key closes video player first,
   * otherwise closes main modal.
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      if (selectedLesson) {
        setSelectedLesson(null);
        return;
      }

      if (isOpen) {
        onClose();
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [selectedLesson, isOpen, onClose]);

  if (!isOpen || !course) {
    return null;
  }

  const sym =
    currency === 'INR'
      ? '₹'
      : currency === 'USD'
        ? '$'
        : '€';

  const displayPrice = course.isFree
    ? 'Free'
    : `${sym}${
        currency === 'INR'
          ? course.price
          : (course.price / 83).toFixed(2)
      }`;

  /**
   * Total lessons
   */
  const totalLessons = chapters.reduce(
    (total, chapter) =>
      total + (chapter.lessons?.length ?? 0),
    0,
  );

  /**
   * Video URL
   */
  const selectedVideoUrl = selectedLesson
    ? getVideoUrl(selectedLesson.file_path)
    : '';

  return (
    <>
      {/* =========================================================
          MAIN COURSE DETAILS MODAL
      ========================================================= */}

      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-8 backdrop-blur-xs sm:pt-10">
        <div className="mb-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-2xl animate-in fade-in zoom-in-95 dark:border-[#334155] dark:bg-[#1E293B]">

          {/* =====================================================
              HEADER / HERO
          ===================================================== */}

          <div className="relative aspect-video max-h-[280px] w-full overflow-hidden bg-slate-900 sm:aspect-[21/9]">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="h-full w-full object-cover object-top opacity-60"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-full w-full bg-slate-800" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            {/* Header actions */}
            <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(course);
                }}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-md transition-colors hover:bg-white"
              >
                <Pencil className="h-3.5 w-3.5 text-[#3b82f6]" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-lg bg-black/40 p-1.5 text-white transition-colors hover:bg-black/60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Course information */}
            <div className="absolute bottom-4 left-6 right-6">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/30 bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-xs">
                  {course.category || 'Uncategorized'}
                </span>

                {course.level && (
                  <span className="rounded-full bg-blue-500/80 px-2.5 py-0.5 text-xs font-semibold text-white">
                    {course.level}
                  </span>
                )}

                <span className="rounded-full bg-emerald-500/80 px-2.5 py-0.5 text-xs font-semibold text-white">
                  {course.status || 'Draft'}
                </span>
              </div>

              <h1 className="text-xl font-bold leading-tight text-white sm:text-2xl">
                {course.title}
              </h1>

              {course.subtitle && (
                <p className="mt-0.5 text-xs text-slate-300">
                  {course.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* =====================================================
              CONTENT
          ===================================================== */}

          <div className="max-h-[60vh] space-y-6 overflow-y-auto p-6">

            {/* ===================================================
                COURSE STATS
            =================================================== */}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

              {/* Enrolled */}
              <div className="rounded-xl border border-[#e2e8f0] bg-[#f8f9ff] p-3 dark:border-[#334155] dark:bg-slate-800/60">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-[#64748b] dark:text-gray-400">
                  <Users className="h-4 w-4 text-[#3b82f6]" />
                  <span>Enrolled</span>
                </div>

                <p className="text-lg font-bold text-[#0f172a] dark:text-gray-100">
                  {Number(
                    course.studentsCount || 0,
                  ).toLocaleString()}
                </p>
              </div>

              {/* Price */}
              <div className="rounded-xl border border-[#e2e8f0] bg-[#f8f9ff] p-3 dark:border-[#334155] dark:bg-slate-800/60">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-[#64748b] dark:text-gray-400">
                  <IndianRupee className="h-4 w-4 text-emerald-600" />
                  <span>Price</span>
                </div>

                <p className="text-lg font-bold text-[#0f172a] dark:text-gray-100">
                  {displayPrice}
                </p>
              </div>

              {/* Duration */}
              <div className="rounded-xl border border-[#e2e8f0] bg-[#f8f9ff] p-3 dark:border-[#334155] dark:bg-slate-800/60">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-[#64748b] dark:text-gray-400">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span>Duration</span>
                </div>

                <p className="text-lg font-bold text-[#0f172a] dark:text-gray-100">
                  {course.duration || '48 hours'}
                </p>
              </div>

              {/* Rating */}
              <div className="rounded-xl border border-[#e2e8f0] bg-[#f8f9ff] p-3 dark:border-[#334155] dark:bg-slate-800/60">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-[#64748b] dark:text-gray-400">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                  <span>Rating</span>
                </div>

                <p className="text-lg font-bold text-[#0f172a] dark:text-gray-100">
                  {course.rating || '4.8'}

                  <span className="text-xs font-normal text-slate-500 dark:text-gray-400">
                    {' '}
                    / 5.0
                  </span>
                </p>
              </div>
            </div>

            {/* ===================================================
                INSTRUCTOR
            =================================================== */}

            <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-[#e2e8f0] bg-slate-50/50 p-4 dark:border-[#334155] dark:bg-slate-800/40 sm:flex-row sm:items-center">

              <div className="flex items-center gap-3">
                {course.instructorAvatar ? (
                  <img
                    src={course.instructorAvatar}
                    alt={
                      course.instructorName ||
                      'Instructor'
                    }
                    className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-xs dark:border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-sm font-bold text-slate-600 shadow-xs dark:border-slate-700 dark:bg-slate-700 dark:text-slate-200">
                    {(course.instructorName || 'I')
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b] dark:text-gray-400">
                    Lead Instructor
                  </p>

                  <p className="text-sm font-bold text-[#0f172a] dark:text-gray-100">
                    {course.instructorName ||
                      'Not assigned'}
                  </p>

                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    {course.title || 'Not assigned'}
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600 dark:text-gray-300 sm:text-right">
                <p className="flex items-center gap-1.5 sm:justify-end">
                  <Globe className="h-3.5 w-3.5 text-slate-400" />

                  <span>
                    Language:{' '}
                    <strong>
                      {course.language ||
                        'Not specified'}
                    </strong>
                  </span>
                </p>

                <p className="flex items-center gap-1.5 sm:justify-end">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />

                  <span>
                    Created:{' '}
                    {course.createdDate || '-'}
                    {course.createdTime
                      ? ` at ${course.createdTime}`
                      : ''}
                  </span>
                </p>

                <p className="flex items-center gap-1.5 sm:justify-end">
                  <FileCheck className="h-3.5 w-3.5 text-emerald-500" />

                  <span>
                    Approval:{' '}
                    <strong>
                      {course.approvalStatus ||
                        'Pending'}
                    </strong>
                  </span>
                </p>
              </div>
            </div>

            {/* ===================================================
                COURSE OVERVIEW
            =================================================== */}

            <div>
              <h3 className="mb-1.5 text-sm font-bold text-[#0f172a] dark:text-gray-100">
                Course Overview
              </h3>

              <div
                className="
                  text-xs sm:text-sm
                  leading-relaxed
                  text-slate-600 dark:text-gray-300
                  prose prose-sm max-w-none
                  dark:prose-invert
                  [&_p]:mb-3
                  [&_strong]:font-semibold
                  [&_ul]:list-disc
                  [&_ul]:pl-5
                  [&_ol]:list-decimal
                  [&_ol]:pl-5
                  [&_li]:mb-1
                  [&_a]:text-blue-600
                  [&_a]:underline
                "
                dangerouslySetInnerHTML={{
                  __html:
                    course.description ||
                    '<p>This course equips students with deep conceptual understanding, practical problem-solving methods, previous year question walk-throughs, and interactive live revision sessions.</p>',
                }}
              />
            </div>

            {/* ===================================================
                CURRICULUM
            =================================================== */}

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0f172a] dark:text-gray-100">
                  Curriculum Structure

                  {!chaptersLoading &&
                    chapters.length > 0 && (
                      <span className="ml-1 font-normal text-slate-500 dark:text-gray-400">
                        ({totalLessons}{' '}
                        {totalLessons === 1
                          ? 'Lesson'
                          : 'Lessons'}
                        )
                      </span>
                    )}
                </h3>

                {!chaptersLoading && (
                  <span className="text-xs font-semibold text-[#3b82f6]">
                    {chapters.length}{' '}
                    {chapters.length === 1
                      ? 'Chapter'
                      : 'Chapters'}
                  </span>
                )}
              </div>

              {/* Loading */}
              {chaptersLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="rounded-lg border border-[#e2e8f0] bg-white p-3 dark:border-[#334155] dark:bg-slate-800/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />

                        <div className="flex-1">
                          <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />

                          <div className="mt-2 h-3 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                        </div>

                        <div className="h-4 w-4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : chapters.length === 0 ? (
                /* Empty */
                <div className="rounded-lg border border-dashed border-[#e2e8f0] py-8 text-center dark:border-[#334155]">
                  <FileText className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />

                  <p className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    No chapters added to this
                    course yet.
                  </p>

                  <p className="mt-1 text-xs text-slate-400 dark:text-gray-500">
                    Add chapters from the course
                    editor.
                  </p>
                </div>
              ) : (
                /* Chapters */
                <div className="space-y-2">
                  {chapters.map((chapter, index) => {
                    const lessons =
                      chapter.lessons ?? [];

                    const isExpanded =
                      expandedChapters[
                        chapter.id
                      ] ?? false;

                    return (
                      <div
                        key={chapter.id}
                        className="overflow-hidden rounded-lg border border-[#e2e8f0] bg-white dark:border-[#334155] dark:bg-slate-800/40"
                      >
                        {/* Chapter header */}
                        <button
                          type="button"
                          onClick={() =>
                            toggleChapter(
                              chapter.id,
                            )
                          }
                          className="flex w-full cursor-pointer items-center justify-between gap-3 p-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#3b82f6] dark:bg-blue-500/10">
                              {index + 1}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#0f172a] dark:text-gray-100">
                                {chapter.title}
                              </p>

                              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-gray-400">
                                {lessons.length}{' '}
                                {lessons.length ===
                                1
                                  ? 'Lecture'
                                  : 'Lectures'}

                                {' • '}

                                Chapter{' '}
                                {chapter.order ||
                                  index + 1}

                                {chapter.status && (
                                  <>
                                    {' • '}

                                    <span className="capitalize">
                                      {
                                        chapter.status
                                      }
                                    </span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>

                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                          )}
                        </button>

                        {/* Lessons */}
                        {isExpanded && (
                          <div className="border-t border-[#e2e8f0] dark:border-[#334155]">
                            {lessons.length ===
                            0 ? (
                              <div className="px-4 py-4 text-xs text-slate-500 dark:text-gray-400">
                                No lectures
                                available in this
                                chapter.
                              </div>
                            ) : (
                              <div className="divide-y divide-[#e2e8f0] dark:divide-[#334155]">
                                {lessons.map(
                                  (
                                    lesson,
                                    lessonIndex,
                                  ) => {
                                    const isVideo =
                                      lesson.file_type?.toLowerCase() ===
                                      'video';

                                    return (
                                      <div
                                        key={
                                          lesson.id
                                        }
                                        className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70"
                                      >
                                        {/* Left */}
                                        <div className="flex min-w-0 items-center gap-3">
                                          <div
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                              isVideo
                                                ? 'bg-blue-50 dark:bg-blue-500/10'
                                                : 'bg-slate-100 dark:bg-slate-700'
                                            }`}
                                          >
                                            {isVideo ? (
                                              <Video className="h-4 w-4 text-[#3b82f6]" />
                                            ) : (
                                              <FileText className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                                            )}
                                          </div>

                                          <div className="min-w-0">
                                            <p className="truncate text-xs font-medium text-[#0f172a] dark:text-gray-100 sm:text-sm">
                                              {lesson.title ||
                                                'Untitled Lecture'}
                                            </p>

                                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-gray-400">
                                              Lecture{' '}
                                              {lessonIndex +
                                                1}

                                              {lesson.file_type && (
                                                <>
                                                  {' • '}

                                                  <span className="capitalize">
                                                    {
                                                      lesson.file_type
                                                    }
                                                  </span>
                                                </>
                                              )}

                                              {lesson.is_free && (
                                                <>
                                                  {' • '}

                                                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                                    Free
                                                  </span>
                                                </>
                                              )}
                                            </p>
                                          </div>
                                        </div>

                                        {/* Right */}
                                        <div className="flex shrink-0 items-center gap-2">
                                          {lesson.duration && (
                                            <span className="hidden items-center gap-1 text-[11px] text-slate-500 dark:text-gray-400 sm:flex">
                                              <Clock className="h-3 w-3" />

                                              {lesson.duration}
                                            </span>
                                          )}

                                          {lesson.status && (
                                            <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium capitalize text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 md:inline-flex">
                                              {
                                                lesson.status
                                              }
                                            </span>
                                          )}

                                          {/* PLAY VIDEO */}
                                          {isVideo &&
                                            lesson.file_path && (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handlePlayLesson(
                                                    lesson,
                                                  )
                                                }
                                                className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#3b82f6] px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-[#2563eb]"
                                              >
                                                <PlayCircle className="h-3.5 w-3.5" />

                                                <span>
                                                  Play
                                                </span>
                                              </button>
                                            )}

                                          {/* PDF */}
                                          {lesson.file_type?.toLowerCase() ===
                                            'pdf' &&
                                            lesson.file_path && (
                                              <a
                                                href={getVideoUrl(
                                                  lesson.file_path,
                                                )}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#334155] dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                                              >
                                                <FileText className="h-3.5 w-3.5" />

                                                <span>
                                                  View
                                                </span>
                                              </a>
                                            )}
                                        </div>
                                      </div>
                                    );
                                  },
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* =====================================================
              FOOTER
          ===================================================== */}

          <div className="flex items-center justify-between border-t border-[#e2e8f0] bg-slate-50/50 px-6 py-4 dark:border-[#334155] dark:bg-slate-800/40">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(
                  window.location.href,
                );
              }}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-2xs hover:text-slate-900 dark:border-[#334155] dark:bg-[#1E293B] dark:text-gray-300 dark:hover:text-white"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Copy Link</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-lg border border-[#e2e8f0] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-[#334155] dark:text-gray-300 dark:hover:bg-slate-700/50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(course);
                }}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#3b82f6] px-5 py-2 text-sm font-medium text-white shadow-2xs transition-colors hover:bg-[#2563eb]"
              >
                <Pencil className="h-4 w-4" />
                <span>Edit Course</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          VIDEO PLAYER MODAL
      ========================================================= */}

      {selectedLesson && selectedVideoUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeVideoPlayer();
            }
          }}
        >
          <div className="w-full max-w-5xl overflow-hidden rounded-xl bg-black shadow-2xl">

            {/* Video header */}
            <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-slate-950 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {selectedLesson.title ||
                    'Video Lecture'}
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  {selectedLesson.file_type
                    ? selectedLesson.file_type.toUpperCase()
                    : 'VIDEO'}

                  {selectedLesson.duration
                    ? ` • ${selectedLesson.duration}`
                    : ''}
                </p>
              </div>

              <button
                type="button"
                onClick={closeVideoPlayer}
                className="shrink-0 rounded-lg p-2 text-white transition-colors hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Video */}
            <div className="relative aspect-video bg-black">
              <video
                key={selectedLesson.id}
                src={selectedVideoUrl}
                controls
                autoPlay
                playsInline
                preload="metadata"
                className="h-full w-full object-contain"
                onError={(event) => {
                  console.error(
                    'Video playback failed:',
                    {
                      lesson:
                        selectedLesson,
                      videoUrl:
                        selectedVideoUrl,
                      error:
                        event.currentTarget.error,
                    },
                  );
                }}
              >
                Your browser does not support
                HTML5 video.
              </video>
            </div>

            {/* Video footer */}
            <div className="flex items-center justify-between gap-3 bg-slate-950 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-xs text-slate-300">
                  {selectedLesson.title}
                </p>

                {selectedLesson.downloadable && (
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Downloadable lecture
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={closeVideoPlayer}
                className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
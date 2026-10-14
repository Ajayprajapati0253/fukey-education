import React, { useEffect, useState } from 'react';
import {
  X,
  Calendar,
  Repeat,
  Video,
  BookOpen,
  Users,
  Link,
} from 'lucide-react';

import type { PlatformType } from '../types/live-class.types';
import type { CreateLiveClassPayload } from '../api/live-class.api';

import { get } from '../../../services/api';

interface CreateLiveClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateLiveClassPayload) => Promise<void> | void;
  initialType?: 'one-time' | 'recurring';
}

/* =========================================================
   API TYPES
========================================================= */

interface InstructorOption {
  id: number | string;
  name: string;
  email?: string | null;
}

interface CourseOption {
  id: number | string;
  title: string;
}

interface FreeCourseOption {
  id: number | string;
  title: string;
}

interface OptionsResponse<T> {
  status?: string;
  data?: T[];
  meta?: {
    total?: number;
    current_page?: number;
    last_page?: number;
  };
}

/* =========================================================
   COMPONENT
========================================================= */

export const CreateLiveClassModal: React.FC<
  CreateLiveClassModalProps
> = ({
  isOpen,
  onClose,
  onSave,
  initialType = 'one-time',
}) => {
  /* =======================================================
     FORM STATE
  ======================================================= */

  const [classType, setClassType] = useState<
    'one-time' | 'recurring'
  >(initialType);

  const [title, setTitle] = useState('');

  // IDs are stored internally.
  // UI will show names.
  const [instructorId, setInstructorId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [freeCourseId, setFreeCourseId] = useState('');

  const [platform, setPlatform] =
    useState<PlatformType>('Jitsi');

  const [youtubeVideoId, setYoutubeVideoId] =
    useState('');

  const [date, setDate] = useState('');

  const [time, setTime] = useState('16:00');

  const [duration, setDuration] = useState('60');

  const [description, setDescription] = useState('');

  /* =======================================================
     RECURRING STATE
  ======================================================= */

  const [recurrenceFreq, setRecurrenceFreq] = useState<
    'daily' | 'weekly' | 'weekdays' | 'custom'
  >('weekly');

  const [selectedDays, setSelectedDays] =
    useState<string[]>([
      'Mon',
      'Wed',
      'Fri',
    ]);

  const [startDate, setStartDate] = useState('');

  const [endDate, setEndDate] = useState('');

  /* =======================================================
     API OPTIONS
  ======================================================= */

  const [instructors, setInstructors] = useState<
    InstructorOption[]
  >([]);

  const [courses, setCourses] = useState<
    CourseOption[]
  >([]);

  const [freeCourses, setFreeCourses] = useState<
    FreeCourseOption[]
  >([]);

  const [loadingOptions, setLoadingOptions] =
    useState(false);

  const [optionsError, setOptionsError] =
    useState('');

  /* =======================================================
     SUBMIT STATE
  ======================================================= */

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');

  /* =======================================================
     DAYS
  ======================================================= */

  const weekDays = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun',
  ];

  /* =======================================================
     RESET FORM WHEN MODAL OPENS
  ======================================================= */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const today = new Date();

    const yyyy = today.getFullYear();

    const mm = String(
      today.getMonth() + 1,
    ).padStart(2, '0');

    const dd = String(
      today.getDate(),
    ).padStart(2, '0');

    const todayString =
      `${yyyy}-${mm}-${dd}`;

    setClassType(initialType);

    setTitle('');

    setInstructorId('');
    setCourseId('');
    setFreeCourseId('');

    setPlatform('Jitsi');

    setYoutubeVideoId('');

    setDate(todayString);

    setStartDate(todayString);

    setEndDate('');

    setTime('16:00');

    setDuration('60');

    setDescription('');

    setRecurrenceFreq('weekly');

    setSelectedDays([
      'Mon',
      'Wed',
      'Fri',
    ]);

    setError('');
    setOptionsError('');
    setSaving(false);
  }, [isOpen, initialType]);

  /* =======================================================
     LOAD INSTRUCTORS + COURSES + FREE COURSES
  ======================================================= */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let mounted = true;

    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        setOptionsError('');

        const [
          instructorResponse,
          courseResponse,
          freeCourseResponse,
        ] = await Promise.all([
          get(
            '/admin/customers/instructors?limit=100&page=1',
          ) as Promise<
            OptionsResponse<InstructorOption>
          >,

          get(
            '/admin/courses?par_page=100&page=1',
          ) as Promise<
            OptionsResponse<CourseOption>
          >,

          get(
            '/admin/free-courses?par_page=100&page=1',
          ) as Promise<
            OptionsResponse<FreeCourseOption>
          >,
        ]);

        if (!mounted) {
          return;
        }

        setInstructors(
          Array.isArray(
            instructorResponse?.data,
          )
            ? instructorResponse.data
            : [],
        );

        setCourses(
          Array.isArray(
            courseResponse?.data,
          )
            ? courseResponse.data
            : [],
        );

        setFreeCourses(
          Array.isArray(
            freeCourseResponse?.data,
          )
            ? freeCourseResponse.data
            : [],
        );
      } catch (err: any) {
        console.error(
          'Failed to load live class options:',
          err,
        );

        if (!mounted) {
          return;
        }

        const backendMessage =
          err?.response?.data?.message;

        setOptionsError(
          Array.isArray(backendMessage)
            ? backendMessage.join(', ')
            : backendMessage ||
                err?.message ||
                'Failed to load instructors and courses.',
        );

        setInstructors([]);
        setCourses([]);
        setFreeCourses([]);
      } finally {
        if (mounted) {
          setLoadingOptions(false);
        }
      }
    };

    loadOptions();

    return () => {
      mounted = false;
    };
  }, [isOpen]);

  /* =======================================================
     TOGGLE RECURRING DAY
  ======================================================= */

  const toggleDay = (day: string) => {
    setSelectedDays((previous) => {
      if (previous.includes(day)) {
        return previous.filter(
          (item) => item !== day,
        );
      }

      return [...previous, day];
    });
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    setError('');

    /* -----------------------------------------------------
       TITLE
    ----------------------------------------------------- */

    if (!title.trim()) {
      setError(
        'Class title is required.',
      );
      return;
    }

    /* -----------------------------------------------------
       INSTRUCTOR
    ----------------------------------------------------- */

    if (!instructorId) {
      setError(
        'Instructor is required.',
      );
      return;
    }

    /* -----------------------------------------------------
       COURSE
    ----------------------------------------------------- */

    if (
      platform === 'Jitsi' &&
      !courseId
    ) {
      setError(
        'Course is required for Jitsi live class.',
      );
      return;
    }

    /* -----------------------------------------------------
       FREE COURSE
    ----------------------------------------------------- */

    if (
      platform === 'YouTube' &&
      !freeCourseId
    ) {
      setError(
        'Free Course is required for YouTube live class.',
      );
      return;
    }

    /* -----------------------------------------------------
       YOUTUBE VIDEO ID
    ----------------------------------------------------- */

    if (
      platform === 'YouTube' &&
      !youtubeVideoId.trim()
    ) {
      setError(
        'YouTube Video ID is required.',
      );
      return;
    }

    /* -----------------------------------------------------
       DATE
    ----------------------------------------------------- */

    if (
      !date &&
      classType === 'one-time'
    ) {
      setError(
        'Class date is required.',
      );
      return;
    }

    /* -----------------------------------------------------
       RECURRING DAYS
    ----------------------------------------------------- */

    if (
      classType === 'recurring' &&
      selectedDays.length === 0
    ) {
      setError(
        'Select at least one recurring day.',
      );
      return;
    }

    /* -----------------------------------------------------
       RECURRING START DATE
    ----------------------------------------------------- */

    if (
      classType === 'recurring' &&
      !startDate
    ) {
      setError(
        'Recurring start date is required.',
      );
      return;
    }

    /* -----------------------------------------------------
       RECURRING END DATE
    ----------------------------------------------------- */

    if (
      classType === 'recurring' &&
      !endDate
    ) {
      setError(
        'Recurring end date is required.',
      );
      return;
    }

    /* -----------------------------------------------------
       DURATION
    ----------------------------------------------------- */

    const parsedDuration =
      Number(duration);

    if (
      !Number.isInteger(
        parsedDuration,
      ) ||
      parsedDuration < 10
    ) {
      setError(
        'Duration must be at least 10 minutes.',
      );
      return;
    }

    /* -----------------------------------------------------
       START DATE
    ----------------------------------------------------- */

    const actualStartDate =
      classType === 'recurring'
        ? startDate
        : date;

    /* =====================================================
       CREATE PAYLOAD

       IMPORTANT:
       UI shows names.
       Backend receives IDs.
    ===================================================== */

    const payload: CreateLiveClassPayload = {
      title: title.trim(),

      instructor:
        Number(instructorId),

      platform:
        platform === 'Jitsi'
          ? 'jitsi'
          : 'youtube',

      duration:
        parsedDuration,

      status: true,

      start_time:
        `${actualStartDate}T${time}:00`,

      description:
        description.trim() ||
        undefined,
    };

    /* -----------------------------------------------------
       JITSI COURSE
    ----------------------------------------------------- */

    if (platform === 'Jitsi') {
      payload.course_id =
        Number(courseId);
    }

    /* -----------------------------------------------------
       YOUTUBE FREE COURSE
    ----------------------------------------------------- */

    if (platform === 'YouTube') {
      payload.free_course_id =
        Number(freeCourseId);

      payload.youtube_video_id =
        youtubeVideoId.trim();
    }

    /* -----------------------------------------------------
       RECURRING
    ----------------------------------------------------- */

    if (
      classType === 'recurring'
    ) {
      payload.recurring_days =
        selectedDays;

      payload.recurring_time =
        time;

      payload.end_date =
        `${endDate}T23:59:59`;
    }

    /* =====================================================
       SAVE
    ===================================================== */

    try {
      setSaving(true);

      await onSave(payload);

      onClose();
    } catch (err) {
      console.error(
        'Create live class failed:',
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create live class.',
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     CLOSED
  ======================================================= */

  if (!isOpen) {
    return null;
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative my-8 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Create New Live Class
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Schedule an interactive live session.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* =================================================
            CLASS TYPE
        ================================================= */}

        <div className="mt-4 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() =>
              setClassType('one-time')
            }
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold ${
              classType === 'one-time'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600'
            }`}
          >
            <Calendar className="h-4 w-4" />

            One-time Class
          </button>

          <button
            type="button"
            onClick={() =>
              setClassType('recurring')
            }
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold ${
              classType === 'recurring'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600'
            }`}
          >
            <Repeat className="h-4 w-4" />

            Recurring Class
          </button>
        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-4"
        >

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* =================================================
              OPTIONS ERROR
          ================================================= */}

          {optionsError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {optionsError}
            </div>
          )}

          {/* =================================================
              TITLE
          ================================================= */}

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Class Title{' '}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="e.g. Physics - Laws of Motion"
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* =================================================
              INSTRUCTOR + COURSE
          ================================================= */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            {/* -------------------------------------------------
                INSTRUCTOR
            ------------------------------------------------- */}

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Instructor{' '}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <div className="relative">

                <Users className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <select
                  value={instructorId}
                  onChange={(e) =>
                    setInstructorId(
                      e.target.value,
                    )
                  }
                  disabled={loadingOptions}
                  className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-blue-500 disabled:bg-slate-50"
                >

                  <option value="">
                    {loadingOptions
                      ? 'Loading instructors...'
                      : 'Select Instructor'}
                  </option>

                  {instructors.map(
                    (instructor) => (
                      <option
                        key={String(
                          instructor.id,
                        )}
                        value={String(
                          instructor.id,
                        )}
                      >
                        {instructor.name}
                        {instructor.email
                          ? ` — ${instructor.email}`
                          : ''}
                      </option>
                    ),
                  )}

                </select>
              </div>
            </div>

            {/* -------------------------------------------------
                COURSE / FREE COURSE
            ------------------------------------------------- */}

            {platform === 'Jitsi' ? (
              <div>

                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Course{' '}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">

                  <BookOpen className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <select
                    value={courseId}
                    onChange={(e) =>
                      setCourseId(
                        e.target.value,
                      )
                    }
                    disabled={loadingOptions}
                    className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-blue-500 disabled:bg-slate-50"
                  >

                    <option value="">
                      {loadingOptions
                        ? 'Loading courses...'
                        : 'Select Course'}
                    </option>

                    {courses.map(
                      (course) => (
                        <option
                          key={String(
                            course.id,
                          )}
                          value={String(
                            course.id,
                          )}
                        >
                          {course.title}
                        </option>
                      ),
                    )}

                  </select>
                </div>
              </div>
            ) : (
              <div>

                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Free Course{' '}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">

                  <BookOpen className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <select
                    value={freeCourseId}
                    onChange={(e) =>
                      setFreeCourseId(
                        e.target.value,
                      )
                    }
                    disabled={loadingOptions}
                    className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-blue-500 disabled:bg-slate-50"
                  >

                    <option value="">
                      {loadingOptions
                        ? 'Loading free courses...'
                        : 'Select Free Course'}
                    </option>

                    {freeCourses.map(
                      (course) => (
                        <option
                          key={String(
                            course.id,
                          )}
                          value={String(
                            course.id,
                          )}
                        >
                          {course.title}
                        </option>
                      ),
                    )}

                  </select>
                </div>
              </div>
            )}

          </div>

          {/* =================================================
              PLATFORM
          ================================================= */}

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Streaming Platform
            </label>

            <div className="relative">

              <Video className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <select
                value={platform}
                onChange={(e) => {
                  setPlatform(
                    e.target.value as PlatformType,
                  );

                  // Clear platform-specific selection
                  setCourseId('');
                  setFreeCourseId('');
                  setYoutubeVideoId('');
                }}
                className="h-10 w-full appearance-none rounded-lg border border-slate-200 pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-blue-500"
              >

                <option value="Jitsi">
                  Jitsi Meet
                </option>

                <option value="YouTube">
                  YouTube Live
                </option>

              </select>

            </div>
          </div>

          {/* =================================================
              YOUTUBE VIDEO ID
          ================================================= */}

          {platform === 'YouTube' && (
            <div>

              <label className="mb-1 block text-xs font-bold text-slate-700">
                YouTube Video ID{' '}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <div className="relative">

                <Link className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={youtubeVideoId}
                  onChange={(e) =>
                    setYoutubeVideoId(
                      e.target.value,
                    )
                  }
                  placeholder="e.g. dQw4w9WgXcQ"
                  className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-blue-500"
                />

              </div>

              <p className="mt-1 text-[10px] text-slate-500">
                Enter only the YouTube video ID, not the complete URL.
              </p>

            </div>
          )}

          {/* =================================================
              ONE TIME DATE / TIME / DURATION
          ================================================= */}

          {classType === 'one-time' ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

              {/* Date */}

              <div>

                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Class Date
                </label>

                <input
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(e.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs"
                />

              </div>

              {/* Time */}

              <div>

                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Start Time
                </label>

                <input
                  type="time"
                  value={time}
                  onChange={(e) =>
                    setTime(e.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs"
                />

              </div>

              {/* Duration */}

              <div>

                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Duration (mins)
                </label>

                <input
                  type="number"
                  min="10"
                  value={duration}
                  onChange={(e) =>
                    setDuration(
                      e.target.value,
                    )
                  }
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs"
                />

              </div>

            </div>
          ) : (

            /* =================================================
               RECURRING
            ================================================= */

            <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/40 p-4">

              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">

                <Repeat className="h-4 w-4 text-blue-600" />

                Recurring Schedule

              </div>

              {/* Days */}

              <div>

                <label className="mb-1.5 block text-[11px] font-bold text-slate-600">
                  Select Days
                </label>

                <div className="flex flex-wrap gap-1.5">

                  {weekDays.map((day) => {

                    const selected =
                      selectedDays.includes(day);

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() =>
                          toggleDay(day)
                        }
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                          selected
                            ? 'bg-blue-600 text-white'
                            : 'border border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        {day}
                      </button>
                    );

                  })}

                </div>
              </div>

              {/* Date / Time / Duration */}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">

                {/* Start Date */}

                <div>

                  <label className="mb-1 block text-[11px] font-bold text-slate-600">
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) =>
                      setStartDate(
                        e.target.value,
                      )
                    }
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs"
                  />

                </div>

                {/* End Date */}

                <div>

                  <label className="mb-1 block text-[11px] font-bold text-slate-600">
                    End Date
                  </label>

                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) =>
                      setEndDate(
                        e.target.value,
                      )
                    }
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs"
                  />

                </div>

                {/* Time */}

                <div>

                  <label className="mb-1 block text-[11px] font-bold text-slate-600">
                    Class Time
                  </label>

                  <input
                    type="time"
                    value={time}
                    onChange={(e) =>
                      setTime(e.target.value)
                    }
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs"
                  />

                </div>

                {/* Duration */}

                <div>

                  <label className="mb-1 block text-[11px] font-bold text-slate-600">
                    Duration
                  </label>

                  <input
                    type="number"
                    min="10"
                    value={duration}
                    onChange={(e) =>
                      setDuration(
                        e.target.value,
                      )
                    }
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs"
                  />

                </div>

              </div>

              {/* Frequency */}

              <div>

                <label className="mb-1 block text-[11px] font-bold text-slate-600">
                  Frequency
                </label>

                <select
                  value={recurrenceFreq}
                  onChange={(e) =>
                    setRecurrenceFreq(
                      e.target.value as
                        | 'daily'
                        | 'weekly'
                        | 'weekdays'
                        | 'custom',
                    )
                  }
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs"
                >

                  <option value="daily">
                    Daily
                  </option>

                  <option value="weekly">
                    Weekly
                  </option>

                  <option value="weekdays">
                    Weekdays
                  </option>

                  <option value="custom">
                    Custom
                  </option>

                </select>

              </div>

            </div>
          )}

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div>

            <label className="mb-1 block text-xs font-bold text-slate-700">
              Class Description
            </label>

            <textarea
              rows={3}
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value,
                )
              }
              placeholder="Describe what students will learn..."
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500"
            />

          </div>

          {/* =================================================
              INFO
          ================================================= */}

          <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] text-blue-700">

            {platform === 'Jitsi'
              ? 'Jitsi meeting URL will be generated automatically by the backend.'
              : 'For YouTube, provide the actual YouTube Video ID.'}

          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                loadingOptions
              }
              className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? 'Creating...'
                : classType ===
                    'recurring'
                  ? 'Schedule Recurring Series'
                  : 'Publish Live Class'}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};
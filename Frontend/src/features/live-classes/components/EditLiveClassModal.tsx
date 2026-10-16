import React, { useEffect, useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Users,
  Trash2,
} from 'lucide-react';

import type {
  LiveClass,
  ClassStatus,
} from '../types/live-class.types';

export interface EditLiveClassData {
  title: string;
  instructor: number;
  start_time: string;
  duration: number;
  description?: string;
  status: boolean;
}

interface EditLiveClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveClass: LiveClass | null;
  onSave: (
    updatedClass: LiveClass,
  ) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}

const getStatusFromClass = (
  liveClass: LiveClass,
): ClassStatus => {
  return liveClass.status;
};

const getDateTimeParts = (
  isoDateTime: string,
  startTime: string,
) => {
  const source =
    isoDateTime || startTime;

  const date = new Date(source);

  if (!Number.isNaN(date.getTime())) {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1,
    ).padStart(2, '0');

    const day = String(
      date.getDate(),
    ).padStart(2, '0');

    const hours = String(
      date.getHours(),
    ).padStart(2, '0');

    const minutes = String(
      date.getMinutes(),
    ).padStart(2, '0');

    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`,
    };
  }

  return {
    date: '',
    time: '',
  };
};

export const EditLiveClassModal: React.FC<
  EditLiveClassModalProps
> = ({
  isOpen,
  onClose,
  liveClass,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] =
    useState('');

  const [instructorId, setInstructorId] =
    useState('');

  const [date, setDate] =
    useState('');

  const [time, setTime] =
    useState('');

  const [duration, setDuration] =
    useState('60');

  const [status, setStatus] =
    useState<ClassStatus>('Upcoming');

  const [description, setDescription] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState('');

  useEffect(() => {
    if (!liveClass) {
      return;
    }

    setTitle(liveClass.title);

    setInstructorId(
      liveClass.instructor.id,
    );

    const parts = getDateTimeParts(
      liveClass.isoDateTime,
      liveClass.startTime,
    );

    setDate(parts.date);
    setTime(parts.time);

    setDuration(
      String(liveClass.duration),
    );

    setStatus(
      getStatusFromClass(liveClass),
    );

    setDescription(
      liveClass.description || '',
    );

    setError('');
  }, [liveClass]);

  if (!isOpen || !liveClass) {
    return null;
  }

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    setError('');

    if (!title.trim()) {
      setError(
        'Class title is required.',
      );
      return;
    }

    if (!instructorId) {
      setError(
        'Instructor ID is required.',
      );
      return;
    }

    if (!date || !time) {
      setError(
        'Start date and time are required.',
      );
      return;
    }

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

    /*
     * Backend UpdateLiveClassDto expects:
     *
     * title
     * instructor
     * start_time
     * duration
     * description
     * status
     */
    const updated: LiveClass = {
      ...liveClass,

      title: title.trim(),

      instructor: {
        ...liveClass.instructor,
        id: instructorId,
      },

      isoDateTime:
        `${date}T${time}:00`,

      startTime:
        `${date} ${time}`,

      duration: parsedDuration,

      status,

      description:
        description.trim(),

    };

    try {
      setSaving(true);

      await onSave(updated);

      onClose();
    } catch (err) {
      console.error(
        'Failed to update live class:',
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update live class.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this live class?',
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      setError('');

      await onDelete(
        liveClass.id,
      );

      onClose();
    } catch (err) {
      console.error(
        'Failed to delete live class:',
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete live class.',
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative my-6 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Edit Live Class
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Update the live class schedule and details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving || deleting}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-4"
        >
          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Class Title{' '}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="text"
              required
              maxLength={255}
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Instructor */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Instructor ID{' '}
              <span className="text-red-500">
                *
              </span>
            </label>

            <div className="relative">
              <Users className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="number"
                min="1"
                required
                value={instructorId}
                onChange={(e) =>
                  setInstructorId(
                    e.target.value,
                  )
                }
                className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {liveClass.instructor.name && (
              <p className="mt-1 text-[10px] text-slate-500">
                Current instructor:{' '}
                {liveClass.instructor.name}
              </p>
            )}
          </div>

          {/* Start Date / Time / Duration */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Start Date{' '}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) =>
                    setDate(
                      e.target.value,
                    )
                  }
                  className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Start Time{' '}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <div className="relative">
                <Clock className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) =>
                    setTime(
                      e.target.value,
                    )
                  }
                  className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Duration (mins){' '}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                type="number"
                min="10"
                required
                value={duration}
                onChange={(e) =>
                  setDuration(
                    e.target.value,
                  )
                }
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-800 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as ClassStatus,
                )
              }
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="Upcoming">
                Upcoming
              </option>

              <option value="Live">
                Live
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Cancelled">
                Cancelled
              </option>
            </select>

            <p className="mt-1 text-[10px] text-slate-500">
              Backend stores this as an active/inactive boolean.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Description
            </label>

            <textarea
              rows={3}
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Read-only information */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[10px] text-slate-500">
                  Platform
                </p>

                <p className="font-semibold text-slate-800">
                  {liveClass.platform}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500">
                  Students
                </p>

                <p className="font-semibold text-slate-800">
                  {liveClass.students}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500">
                  Course
                </p>

                <p className="font-semibold text-slate-800">
                  {liveClass.course || '-'}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500">
                  Meeting
                </p>

                <p className="truncate font-semibold text-slate-800">
                  {liveClass.meetingUrl || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={
                saving || deleting
              }
              className="flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />

              <span>
                {deleting
                  ? 'Deleting...'
                  : 'Delete Class'}
              </span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={
                  saving || deleting
                }
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  saving || deleting
                }
                className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? 'Saving...'
                  : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
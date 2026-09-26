import React from 'react';

import {
  Edit,
  Trash2,
  MapPin,
  Briefcase,
  Users,
  Star,
  Zap,
  Globe,
  Loader2,
  Calendar,
} from 'lucide-react';

import type {
  Career,
  CareerStatus,
} from '../api/career.api';

interface CareerTableProps {
  careers: Career[];

  loading: boolean;

  updatingStatus: string | null;

  deletingId: string | null;

  onEdit: (
    career: Career,
  ) => void;

  onDelete: (
    career: Career,
  ) => void;

  onStatusChange: (
    career: Career,
    status: CareerStatus,
  ) => void;
}

const formatDate = (
  value?: string | null,
) => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
};

const formatStatus = (
  value?: string,
) => {
  if (!value) {
    return '—';
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
};

const getStatusClasses = (
  status?: string,
) => {
  switch (
    status?.toLowerCase()
  ) {
    case 'published':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';

    case 'closed':
      return 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400';

    case 'draft':
    default:
      return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
  }
};

const CareerTable: React.FC<
  CareerTableProps
> = ({
  careers,
  loading,
  updatingStatus,
  deletingId,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  if (loading) {
    return (
      <div className="p-5">
        <div className="space-y-3">
          {Array.from({
            length: 7,
          }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700"
            />
          ))}
        </div>
      </div>
    );
  }

  if (careers.length === 0) {
    return (
      <div className="px-5 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
          <Briefcase size={24} />
        </div>

        <h3 className="mt-4 text-sm font-semibold text-ink dark:text-white">
          No job listings found
        </h3>

        <p className="mt-1 text-sm text-ink-soft dark:text-slate-400">
          Create a new job or change your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1200px]">
        <thead>
          <tr className="border-b border-border-subtle bg-slate-50 dark:border-slate-700 dark:bg-[#172033]">
            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-slate-400">
              Job
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-slate-400">
              Department
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-slate-400">
              Location
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-slate-400">
              Employment
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-slate-400">
              Vacancies
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-slate-400">
              Status
            </th>

            <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-slate-400">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {careers.map((career) => {
            const isUpdating =
              updatingStatus ===
              career.id;

            const isDeleting =
              deletingId ===
              career.id;

            return (
              <tr
                key={career.id}
                className="border-b border-border-subtle last:border-b-0 hover:bg-slate-50/70 dark:border-slate-700 dark:hover:bg-slate-800/50"
              >
                {/* Job */}
                <td className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <Briefcase
                        size={18}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-ink dark:text-white">
                          {career.title}
                        </p>

                        {career.is_featured && (
                          <Star
                            size={14}
                            className="fill-current text-amber-500"
                          />
                        )}

                        {career.is_urgent && (
                          <Zap
                            size={14}
                            className="text-red-500"
                          />
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-xs text-ink-soft dark:text-slate-400">
                        <Calendar
                          size={12}
                        />

                        {formatDate(
                          career.created_at,
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Department */}
                <td className="px-5 py-4">
                  <span className="text-sm text-ink dark:text-slate-200">
                    {career.department ||
                      '—'}
                  </span>
                </td>

                {/* Location */}
                <td className="px-5 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-ink dark:text-slate-200">
                      {career.is_remote ? (
                        <Globe
                          size={14}
                          className="text-emerald-500"
                        />
                      ) : (
                        <MapPin
                          size={14}
                          className="text-slate-400"
                        />
                      )}

                      <span>
                        {career.is_remote
                          ? 'Remote'
                          : career.location ||
                            '—'}
                      </span>
                    </div>

                    {career.is_remote &&
                      career.location && (
                        <p className="pl-5 text-xs text-ink-soft">
                          {career.location}
                        </p>
                      )}
                  </div>
                </td>

                {/* Employment */}
                <td className="px-5 py-4">
                  <span className="text-sm text-ink dark:text-slate-200">
                    {career.employment_type ||
                      '—'}
                  </span>
                </td>

                {/* Vacancies */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-sm text-ink dark:text-slate-200">
                    <Users
                      size={14}
                      className="text-slate-400"
                    />

                    {career.vacancies ??
                      '—'}
                  </div>
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <select
                      value={
                        career.status
                      }
                      disabled={
                        isUpdating
                      }
                      onChange={(event) =>
                        onStatusChange(
                          career,
                          event.target
                            .value as CareerStatus,
                        )
                      }
                      className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none ${getStatusClasses(
                        career.status,
                      )}`}
                    >
                      <option value="draft">
                        Draft
                      </option>

                      <option value="published">
                        Published
                      </option>

                      <option value="closed">
                        Closed
                      </option>
                    </select>

                    {isUpdating && (
                      <Loader2
                        size={14}
                        className="animate-spin text-slate-400"
                      />
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      title="Edit Job"
                      onClick={() =>
                        onEdit(career)
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-ink-soft transition hover:bg-slate-100 hover:text-brand dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-brand"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      type="button"
                      title="Delete Job"
                      disabled={
                        isDeleting
                      }
                      onClick={() =>
                        onDelete(career)
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:hover:bg-red-500/10"
                    >
                      {isDeleting ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2
                          size={16}
                        />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CareerTable;
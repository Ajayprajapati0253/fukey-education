import React from 'react';
import {
  Eye,
  FileText,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Loader2,
} from 'lucide-react';

import type { CareerApplication } from '../api/career-application.api';

interface CareerApplicationTableProps {
  applications: CareerApplication[];

  statusOptions: string[];

  loading: boolean;

  updatingStatus: string | null;
  deletingId: string | null;
  loadingResumeId: string | null;

  onStatusChange: (
    applicationId: string,
    status: string,
  ) => void;

  onResume: (
    application: CareerApplication,
  ) => void;

  onView: (
    application: CareerApplication,
  ) => void;

  onDelete: (
    application: CareerApplication,
  ) => void;
}

const formatStatus = (value: string) => {
  if (!value) {
    return '—';
  }

  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
};

const getStatusClasses = (value: string) => {
  const normalized = value.toLowerCase();

  if (
    normalized.includes('reject') ||
    normalized.includes('declin')
  ) {
    return 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400';
  }

  if (
    normalized.includes('hire') ||
    normalized.includes('accept') ||
    normalized.includes('select')
  ) {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
  }

  if (
    normalized.includes('short') ||
    normalized.includes('interview')
  ) {
    return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';
  }

  if (
    normalized.includes('pending') ||
    normalized.includes('review') ||
    normalized.includes('new')
  ) {
    return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
  }

  return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
};

const formatDate = (
  value?: string | null,
) => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
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

const CareerApplicationTable: React.FC<
  CareerApplicationTableProps
> = ({
  applications,
  statusOptions,
  loading,
  updatingStatus,
  deletingId,
  loadingResumeId,
  onStatusChange,
  onResume,
  onView,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="p-5">
        <div className="space-y-4">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <div
                key={index}
                className="animate-pulse"
              >
                <div className="h-14 rounded-xl bg-slate-100 dark:bg-slate-700" />
              </div>
            ),
          )}
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="px-5 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
          <FileText size={24} />
        </div>

        <h3 className="mt-4 text-sm font-semibold text-ink dark:text-white">
          No applications found
        </h3>

        <p className="mt-1 text-sm text-ink-soft dark:text-slate-400">
          There are no applications matching the current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px]">
        <thead>
          <tr className="border-b border-border-subtle bg-slate-50 dark:border-slate-700 dark:bg-[#172033]">
            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-slate-400">
              Applicant
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-slate-400">
              Contact
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-slate-400">
              Status
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-slate-400">
              Applied Date
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-slate-400">
              Resume
            </th>

            <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-slate-400">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {applications.map((application) => {
            const phone =
              application.phone ??
              application.mobile ??
              application.contact ??
              null;

            const isUpdating =
              updatingStatus === application.id;

            const isDeleting =
              deletingId === application.id;

            const isLoadingResume =
              loadingResumeId === application.id;

            return (
              <tr
                key={application.id}
                className="border-b border-border-subtle last:border-b-0 hover:bg-slate-50/70 dark:border-slate-700 dark:hover:bg-slate-800/50"
              >
                {/* Applicant */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                      {application.name
                        ?.charAt(0)
                        ?.toUpperCase() || '?'}
                    </div>

                    <div>
                      <p className="font-medium text-ink dark:text-white">
                        {application.name ||
                          'Unnamed Applicant'}
                      </p>

                      <p className="mt-0.5 text-xs text-ink-soft dark:text-slate-400">
                        Application #
                        {application.id}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-5 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-ink dark:text-slate-200">
                      <Mail
                        size={14}
                        className="text-slate-400"
                      />

                      <span>
                        {application.email || '—'}
                      </span>
                    </div>

                    {phone && (
                      <div className="flex items-center gap-2 text-xs text-ink-soft dark:text-slate-400">
                        <Phone
                          size={14}
                          className="text-slate-400"
                        />

                        <span>{phone}</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <div className="flex items-center">
                    <select
                      value={
                        application.status || ''
                      }
                      disabled={
                        isUpdating ||
                        statusOptions.length === 0
                      }
                      onChange={(event) =>
                        onStatusChange(
                          application.id,
                          event.target.value,
                        )
                      }
                      className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none ${getStatusClasses(
                        application.status || '',
                      )}`}
                    >
                      {application.status && (
                        <option
                          value={application.status}
                        >
                          {formatStatus(
                            application.status,
                          )}
                        </option>
                      )}

                      {statusOptions
                        .filter(
                          (option) =>
                            option !==
                            application.status,
                        )
                        .map((option) => (
                          <option
                            key={option}
                            value={option}
                          >
                            {formatStatus(option)}
                          </option>
                        ))}
                    </select>

                    {isUpdating && (
                      <Loader2
                        size={14}
                        className="ml-2 animate-spin text-slate-400"
                      />
                    )}
                  </div>
                </td>

                {/* Date */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-sm text-ink-soft dark:text-slate-400">
                    <Calendar size={15} />

                    {formatDate(
                      application.created_at,
                    )}
                  </div>
                </td>

                {/* Resume */}
                <td className="px-5 py-4">
                  {application.resume ? (
                    <button
                      type="button"
                      onClick={() =>
                        onResume(application)
                      }
                      disabled={isLoadingResume}
                      className="inline-flex items-center gap-2 rounded-lg border border-border-subtle px-3 py-2 text-xs font-medium text-ink transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      {isLoadingResume ? (
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <FileText size={15} />
                      )}

                      {isLoadingResume
                        ? 'Opening...'
                        : 'View Resume'}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">
                      No Resume
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      title="View Application"
                      onClick={() =>
                        onView(application)
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-ink-soft transition hover:bg-slate-100 hover:text-brand dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-brand"
                    >
                      <Eye size={17} />
                    </button>

                    <button
                      type="button"
                      title="Delete Application"
                      onClick={() =>
                        onDelete(application)
                      }
                      disabled={isDeleting}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:hover:bg-red-500/10"
                    >
                      {isDeleting ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={17} />
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

export default CareerApplicationTable;
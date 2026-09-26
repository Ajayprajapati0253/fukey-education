import React from 'react';
import {
  X,
  FileText,
} from 'lucide-react';

import type { CareerApplication } from '../api/career-application.api';

interface CareerApplicationDetailsModalProps {
  application: CareerApplication | null;

  onClose: () => void;

  onResume: (
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
      month: 'long',
      year: 'numeric',
    },
  );
};

const CareerApplicationDetailsModal: React.FC<
  CareerApplicationDetailsModalProps
> = ({
  application,
  onClose,
  onResume,
}) => {
  if (!application) {
    return null;
  }

  const phone =
    application.phone ??
    application.mobile ??
    application.contact ??
    null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-[#1E293B]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-ink dark:text-white">
              Application Details
            </h2>

            <p className="mt-1 text-xs text-ink-soft dark:text-slate-400">
              Application #
              {application.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[75vh] space-y-5 overflow-y-auto p-5">

          {/* Applicant */}
          <div>
            <p className="text-xs text-ink-soft dark:text-slate-400">
              Applicant
            </p>

            <p className="mt-1 font-medium text-ink dark:text-white">
              {application.name || '—'}
            </p>
          </div>

          {/* Email */}
          <div>
            <p className="text-xs text-ink-soft dark:text-slate-400">
              Email
            </p>

            <p className="mt-1 break-all font-medium text-ink dark:text-white">
              {application.email || '—'}
            </p>
          </div>

          {/* Phone */}
          {phone && (
            <div>
              <p className="text-xs text-ink-soft dark:text-slate-400">
                Phone
              </p>

              <p className="mt-1 font-medium text-ink dark:text-white">
                {phone}
              </p>
            </div>
          )}

          {/* Status */}
          <div>
            <p className="text-xs text-ink-soft dark:text-slate-400">
              Status
            </p>

            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                application.status || '',
              )}`}
            >
              {formatStatus(
                application.status || '',
              )}
            </span>
          </div>

          {/* Date */}
          <div>
            <p className="text-xs text-ink-soft dark:text-slate-400">
              Applied
            </p>

            <p className="mt-1 font-medium text-ink dark:text-white">
              {formatDate(
                application.created_at,
              )}
            </p>
          </div>

          {/* Resume */}
          {application.resume && (
            <button
              type="button"
              onClick={() =>
                onResume(application)
              }
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              <FileText size={16} />
              View Resume
            </button>
          )}

          {/* Additional fields */}
          <AdditionalFields
            application={application}
          />
        </div>
      </div>
    </div>
  );
};

interface AdditionalFieldsProps {
  application: CareerApplication;
}

const AdditionalFields: React.FC<
  AdditionalFieldsProps
> = ({ application }) => {
  const excludedFields = [
    'id',
    'career_id',
    'name',
    'email',
    'phone',
    'mobile',
    'contact',
    'status',
    'resume',
    'created_at',
    'updated_at',
  ];

  const fields = Object.entries(application).filter(
    ([key, value]) =>
      !excludedFields.includes(key) &&
      value !== null &&
      value !== undefined &&
      value !== '',
  );

  if (fields.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-border-subtle pt-5 dark:border-slate-700">
      <h3 className="mb-4 text-sm font-semibold text-ink dark:text-white">
        Additional Information
      </h3>

      <div className="space-y-3">
        {fields.map(([key, value]) => (
          <div
            key={key}
            className="flex flex-col gap-1 border-b border-border-subtle pb-3 last:border-0 dark:border-slate-700 sm:flex-row sm:justify-between"
          >
            <span className="text-sm capitalize text-ink-soft">
              {key.replace(/_/g, ' ')}
            </span>

            <span className="break-all text-sm text-ink dark:text-slate-200 sm:max-w-[60%] sm:text-right">
              {typeof value === 'object'
                ? JSON.stringify(value)
                : String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerApplicationDetailsModal;
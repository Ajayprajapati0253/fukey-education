import React, {
  useEffect,
  useState,
} from 'react';

import {
  X,
  Loader2,
} from 'lucide-react';

import type {
  Career,
  CareerEmploymentType,
  CareerPayload,
  CareerStatus,
} from '../api/career.api';

interface CareerFormModalProps {
  open: boolean;

  career: Career | null;

  loading: boolean;

  onClose: () => void;

  onSubmit: (
    payload: CareerPayload,
  ) => Promise<void>;
}

interface FormState {
  title: string;

  department: string;

  location: string;

  employment_type: CareerEmploymentType;

  experience: string;

  salary: string;

  vacancies: string;

  description: string;

  requirements: string;

  responsibilities: string;

  benefits: string;

  status: CareerStatus;

  is_featured: boolean;

  is_urgent: boolean;

  is_remote: boolean;

  published_at: string;
}

const defaultForm: FormState = {
  title: '',

  department: '',

  location: '',

  employment_type: 'Full Time',

  experience: '',

  salary: '',

  vacancies: '1',

  description: '',

  requirements: '',

  responsibilities: '',

  benefits: '',

  status: 'draft',

  is_featured: false,

  is_urgent: false,

  is_remote: false,

  published_at: '',
};

const toDateTimeLocal = (
  value?: string | null,
) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '';
  }

  const pad = (
    number: number,
  ) =>
    String(number).padStart(
      2,
      '0',
    );

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1,
  )}-${pad(
    date.getDate(),
  )}T${pad(
    date.getHours(),
  )}:${pad(
    date.getMinutes(),
  )}`;
};

const CareerFormModal: React.FC<
  CareerFormModalProps
> = ({
  open,
  career,
  loading,
  onClose,
  onSubmit,
}) => {
  const [
    form,
    setForm,
  ] = useState<FormState>(
    defaultForm,
  );

  const [
    validationError,
    setValidationError,
  ] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setValidationError('');

    if (career) {
      setForm({
        title:
          career.title || '',

        department:
          career.department || '',

        location:
          career.location || '',

        employment_type:
          (career.employment_type as CareerEmploymentType) ||
          'Full Time',

        experience:
          career.experience || '',

        salary:
          career.salary || '',

        vacancies:
          career.vacancies != null
            ? String(
                career.vacancies,
              )
            : '1',

        description:
          career.description || '',

        requirements:
          career.requirements || '',

        responsibilities:
          career.responsibilities ||
          '',

        benefits:
          career.benefits || '',

        status:
          (career.status as CareerStatus) ||
          'draft',

        is_featured:
          Boolean(
            career.is_featured,
          ),

        is_urgent:
          Boolean(
            career.is_urgent,
          ),

        is_remote:
          Boolean(
            career.is_remote,
          ),

        published_at:
          toDateTimeLocal(
            career.published_at,
          ),
      });
    } else {
      setForm(defaultForm);
    }
  }, [open, career]);

  if (!open) {
    return null;
  }

  const updateField = <
    K extends keyof FormState,
  >(
    field: K,
    value: FormState[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setValidationError('');

    if (!form.title.trim()) {
      setValidationError(
        'Job title is required.',
      );

      return;
    }

    const vacancies =
      Number(form.vacancies);

    if (
      !Number.isInteger(
        vacancies,
      ) ||
      vacancies < 1
    ) {
      setValidationError(
        'Vacancies must be at least 1.',
      );

      return;
    }

    const payload: CareerPayload = {
      title:
        form.title.trim(),

      department:
        form.department.trim() ||
        undefined,

      location:
        form.location.trim() ||
        undefined,

      employment_type:
        form.employment_type,

      experience:
        form.experience.trim() ||
        undefined,

      salary:
        form.salary.trim() ||
        undefined,

      vacancies,

      description:
        form.description.trim() ||
        undefined,

      requirements:
        form.requirements.trim() ||
        undefined,

      responsibilities:
        form.responsibilities.trim() ||
        undefined,

      benefits:
        form.benefits.trim() ||
        undefined,

      status:
        form.status,

      is_featured:
        form.is_featured,

      is_urgent:
        form.is_urgent,

      is_remote:
        form.is_remote,

      published_at:
        form.published_at
          ? new Date(
              form.published_at,
            ).toISOString()
          : undefined,
    };

    await onSubmit(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#1E293B]">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-6 py-4 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-ink dark:text-white">
              {career
                ? 'Edit Job'
                : 'Add Job'}
            </h2>

            <p className="mt-1 text-xs text-ink-soft dark:text-slate-400">
              {career
                ? 'Update the job listing details.'
                : 'Create a new job listing.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto"
        >
          <div className="space-y-6 p-6">

            {validationError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400">
                {validationError}
              </div>
            )}

            {/* Basic Information */}
            <section>
              <SectionTitle>
                Basic Information
              </SectionTitle>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <Input
                  label="Job Title"
                  required
                  value={form.title}
                  onChange={(value) =>
                    updateField(
                      'title',
                      value,
                    )
                  }
                  placeholder="e.g. Software Developer"
                  className="md:col-span-2"
                />

                <Input
                  label="Department"
                  value={
                    form.department
                  }
                  onChange={(value) =>
                    updateField(
                      'department',
                      value,
                    )
                  }
                  placeholder="e.g. Engineering"
                />

                <Input
                  label="Location"
                  value={
                    form.location
                  }
                  onChange={(value) =>
                    updateField(
                      'location',
                      value,
                    )
                  }
                  placeholder="e.g. Bhopal / Remote"
                />

                <Select
                  label="Employment Type"
                  value={
                    form.employment_type
                  }
                  onChange={(value) =>
                    updateField(
                      'employment_type',
                      value as CareerEmploymentType,
                    )
                  }
                  options={[
                    'Full Time',
                    'Part Time',
                    'Internship',
                    'Contract',
                  ]}
                />

                <Input
                  label="Experience"
                  value={
                    form.experience
                  }
                  onChange={(value) =>
                    updateField(
                      'experience',
                      value,
                    )
                  }
                  placeholder="e.g. 2-4 Years"
                />

                <Input
                  label="Salary"
                  value={
                    form.salary
                  }
                  onChange={(value) =>
                    updateField(
                      'salary',
                      value,
                    )
                  }
                  placeholder="e.g. ₹4L - ₹8L"
                />

                <Input
                  label="Vacancies"
                  type="number"
                  min={1}
                  value={
                    form.vacancies
                  }
                  onChange={(value) =>
                    updateField(
                      'vacancies',
                      value,
                    )
                  }
                  placeholder="1"
                />

                <Select
                  label="Status"
                  value={
                    form.status
                  }
                  onChange={(value) =>
                    updateField(
                      'status',
                      value as CareerStatus,
                    )
                  }
                  options={[
                    'draft',
                    'published',
                    'closed',
                  ]}
                  formatOption={(
                    value,
                  ) =>
                    value
                      .charAt(0)
                      .toUpperCase() +
                    value.slice(1)
                  }
                />

                <Input
                  label="Published At"
                  type="datetime-local"
                  value={
                    form.published_at
                  }
                  onChange={(value) =>
                    updateField(
                      'published_at',
                      value,
                    )
                  }
                />
              </div>
            </section>

            {/* Job Description */}
            <section>
              <SectionTitle>
                Job Details
              </SectionTitle>

              <div className="space-y-4">
                <TextArea
                  label="Description"
                  value={
                    form.description
                  }
                  onChange={(value) =>
                    updateField(
                      'description',
                      value,
                    )
                  }
                  placeholder="Describe the job..."
                />

                <TextArea
                  label="Requirements"
                  value={
                    form.requirements
                  }
                  onChange={(value) =>
                    updateField(
                      'requirements',
                      value,
                    )
                  }
                  placeholder="List the candidate requirements..."
                />

                <TextArea
                  label="Responsibilities"
                  value={
                    form.responsibilities
                  }
                  onChange={(value) =>
                    updateField(
                      'responsibilities',
                      value,
                    )
                  }
                  placeholder="List the job responsibilities..."
                />

                <TextArea
                  label="Benefits"
                  value={
                    form.benefits
                  }
                  onChange={(value) =>
                    updateField(
                      'benefits',
                      value,
                    )
                  }
                  placeholder="Describe employee benefits..."
                />
              </div>
            </section>

            {/* Options */}
            <section>
              <SectionTitle>
                Job Options
              </SectionTitle>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Checkbox
                  label="Featured Job"
                  checked={
                    form.is_featured
                  }
                  onChange={(value) =>
                    updateField(
                      'is_featured',
                      value,
                    )
                  }
                />

                <Checkbox
                  label="Urgent Hiring"
                  checked={
                    form.is_urgent
                  }
                  onChange={(value) =>
                    updateField(
                      'is_urgent',
                      value,
                    )
                  }
                />

                <Checkbox
                  label="Remote Job"
                  checked={
                    form.is_remote
                  }
                  onChange={(value) =>
                    updateField(
                      'is_remote',
                      value,
                    )
                  }
                />
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 justify-end gap-3 border-t border-border-subtle bg-white px-6 py-4 dark:border-slate-700 dark:bg-[#1E293B]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-border-subtle px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {loading
                ? 'Saving...'
                : career
                  ? 'Update Job'
                  : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =====================================================
   Small Components
===================================================== */

interface InputProps {
  label: string;

  value: string;

  onChange: (
    value: string,
  ) => void;

  placeholder?: string;

  required?: boolean;

  type?: string;

  min?: number;

  className?: string;
}

const Input: React.FC<
  InputProps
> = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
  min,
  className = '',
}) => {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-ink dark:text-slate-200">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        min={min}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-border-subtle bg-white px-4 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/10 dark:border-slate-600 dark:bg-[#0F172A] dark:text-white"
      />
    </div>
  );
};

interface TextAreaProps {
  label: string;

  value: string;

  onChange: (
    value: string,
  ) => void;

  placeholder?: string;
}

const TextArea: React.FC<
  TextAreaProps
> = ({
  label,
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink dark:text-slate-200">
        {label}
      </label>

      <textarea
        rows={4}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-border-subtle bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/10 dark:border-slate-600 dark:bg-[#0F172A] dark:text-white"
      />
    </div>
  );
};

interface SelectProps {
  label: string;

  value: string;

  onChange: (
    value: string,
  ) => void;

  options: string[];

  formatOption?: (
    value: string,
  ) => string;
}

const Select: React.FC<
  SelectProps
> = ({
  label,
  value,
  onChange,
  options,
  formatOption,
}) => {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink dark:text-slate-200">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="h-11 w-full rounded-xl border border-border-subtle bg-white px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 dark:border-slate-600 dark:bg-[#0F172A] dark:text-white"
      >
        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {formatOption
                ? formatOption(
                    option,
                  )
                : option}
            </option>
          ),
        )}
      </select>
    </div>
  );
};

interface CheckboxProps {
  label: string;

  checked: boolean;

  onChange: (
    value: boolean,
  ) => void;
}

const Checkbox: React.FC<
  CheckboxProps
> = ({
  label,
  checked,
  onChange,
}) => {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border-subtle p-4 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(
            event.target.checked,
          )
        }
        className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
      />

      <span className="text-sm font-medium text-ink dark:text-slate-200">
        {label}
      </span>
    </label>
  );
};

const SectionTitle: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <h3 className="mb-4 text-sm font-semibold text-ink dark:text-white">
      {children}
    </h3>
  );
};

export default CareerFormModal;
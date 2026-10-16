import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    status: number;
  }) => void;
}

export const AddCourseLanguageModal: React.FC<Props> = ({
  isOpen,
  isSubmitting = false,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-border-subtle dark:border-[#334155]">
        <div className="px-5 py-4 border-b border-border-subtle dark:border-[#334155] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-ink dark:text-white">
              Add Course Language
            </h2>

            <p className="text-xs text-ink-soft dark:text-[#94A3B8] mt-0.5">
              Add a language for courses.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-5"
        >
          <div>
            <label className="block text-xs font-bold text-ink dark:text-white mb-2">
              Language Name
            </label>

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="e.g. Hindi"
              className="w-full px-3 py-2.5 rounded-xl border border-border-subtle dark:border-[#334155] bg-white dark:bg-[#0F172A] text-sm text-ink dark:text-white outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink dark:text-white mb-2">
              Status
            </label>

                    <select
                    value={status ? 'true' : 'false'}
                    onChange={(e) =>
                        setStatus(e.target.value === 'true')
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-border-subtle dark:border-[#334155] bg-white dark:bg-[#0F172A] text-sm text-ink dark:text-white outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                    </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border-subtle dark:border-[#334155] text-xs font-bold text-ink dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting || !name.trim()
              }
              className="px-4 py-2.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-[#1E44B8] disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}

              Add Language
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
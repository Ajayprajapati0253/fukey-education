import React, {
  useEffect,
  useState,
} from 'react';

import { X } from 'lucide-react';

import type {
  Coupon,
  CouponPayload,
  CouponStatus,
} from '../api/coupon.api';

interface CouponFormModalProps {
  open: boolean;
  coupon?: Coupon | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: CouponPayload) => Promise<void>;
}

interface FormState {
  coupon_code: string;
  offer_percentage: string;
  min_price: string;
  expired_date: string;
  status: CouponStatus;
}

const initialForm: FormState = {
  coupon_code: '',
  offer_percentage: '',
  min_price: '',
  expired_date: '',
  status: 'active',
};

const getDateInputValue = (
  date?: string,
) => {
  if (!date) return '';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date.substring(0, 10);
  }

  return parsed.toISOString().substring(0, 10);
};

const CouponFormModal: React.FC<
  CouponFormModalProps
> = ({
  open,
  coupon,
  loading = false,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] =
    useState<FormState>(initialForm);

  const [error, setError] =
    useState('');

  const isEdit = Boolean(coupon);

  useEffect(() => {
    if (!open) return;

    if (coupon) {
      setForm({
        coupon_code:
          coupon.coupon_code ?? '',
        offer_percentage:
          String(
            coupon.offer_percentage ?? '',
          ),
        min_price: String(
          coupon.min_price ?? '',
        ),
        expired_date:
          getDateInputValue(
            coupon.expired_date,
          ),
        status:
          coupon.status === 'inactive'
            ? 'inactive'
            : 'active',
      });
    } else {
      setForm(initialForm);
    }

    setError('');
  }, [open, coupon]);

  if (!open) return null;

  const updateField = <
    K extends keyof FormState,
  >(
    field: K,
    value: FormState[K],
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setError('');

    if (!form.coupon_code.trim()) {
      setError('Coupon code is required.');
      return;
    }

    const offerPercentage = Number(
      form.offer_percentage,
    );

    if (
      !form.offer_percentage ||
      Number.isNaN(offerPercentage) ||
      offerPercentage <= 0
    ) {
      setError(
        'Please enter a valid offer percentage.',
      );
      return;
    }

    const minPrice = Number(form.min_price);

    if (
      !form.min_price ||
      Number.isNaN(minPrice) ||
      minPrice < 0
    ) {
      setError(
        'Please enter a valid minimum price.',
      );
      return;
    }

    if (!form.expired_date) {
      setError('Expiry date is required.');
      return;
    }

    const payload: CouponPayload = {
      coupon_code:
        form.coupon_code.trim(),
      offer_percentage:
        offerPercentage,
      min_price: minPrice,
      expired_date:
        form.expired_date,
      status: form.status,
    };

    try {
      await onSubmit(payload);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Something went wrong. Please try again.',
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-[#1E293B]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-ink dark:text-white">
              {isEdit
                ? 'Edit Coupon'
                : 'Create Coupon'}
            </h2>

            <p className="mt-0.5 text-sm text-ink-soft">
              {isEdit
                ? 'Update coupon details.'
                : 'Create a new discount coupon.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="max-h-[75vh] overflow-y-auto p-6"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Coupon Code */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white">
                Coupon Code
              </label>

              <input
                type="text"
                value={form.coupon_code}
                onChange={(e) =>
                  updateField(
                    'coupon_code',
                    e.target.value.toUpperCase(),
                  )
                }
                placeholder="e.g. WELCOME10"
                maxLength={255}
                className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand dark:bg-[#0F172A] dark:text-white"
              />
            </div>

            {/* Offer */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white">
                Offer Percentage
              </label>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    form.offer_percentage
                  }
                  onChange={(e) =>
                    updateField(
                      'offer_percentage',
                      e.target.value,
                    )
                  }
                  placeholder="10"
                  className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2.5 pr-10 text-sm text-ink outline-none focus:border-brand dark:bg-[#0F172A] dark:text-white"
                />

                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-soft">
                  %
                </span>
              </div>
            </div>

            {/* Minimum Price */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white">
                Minimum Price
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-soft">
                  ₹
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.min_price}
                  onChange={(e) =>
                    updateField(
                      'min_price',
                      e.target.value,
                    )
                  }
                  placeholder="500"
                  className="w-full rounded-lg border border-border-subtle bg-white py-2.5 pl-8 pr-3 text-sm text-ink outline-none focus:border-brand dark:bg-[#0F172A] dark:text-white"
                />
              </div>
            </div>

            {/* Expiry */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white">
                Expiry Date
              </label>

              <input
                type="date"
                value={form.expired_date}
                onChange={(e) =>
                  updateField(
                    'expired_date',
                    e.target.value,
                  )
                }
                className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand dark:bg-[#0F172A] dark:text-white"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white">
                Status
              </label>

              <select
                value={form.status}
                onChange={(e) =>
                  updateField(
                    'status',
                    e.target
                      .value as CouponStatus,
                  )
                }
                className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand dark:bg-[#0F172A] dark:text-white"
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3 border-t border-border-subtle pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-border-subtle px-5 py-2.5 text-sm font-medium text-ink hover:bg-gray-50 dark:text-white dark:hover:bg-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? 'Saving...'
                : isEdit
                  ? 'Update Coupon'
                  : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponFormModal;
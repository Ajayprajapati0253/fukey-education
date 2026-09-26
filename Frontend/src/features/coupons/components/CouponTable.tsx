import React from 'react';
import {
  Edit,
  Trash2,
  Ticket,
} from 'lucide-react';

import type { Coupon } from '../api/coupon.api';

interface CouponTableProps {
  coupons: Coupon[];
  loading: boolean;
  onEdit: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
}

const formatDate = (date?: string) => {
  if (!date) return '-';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const CouponTable: React.FC<CouponTableProps> = ({
  coupons,
  loading,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-border-subtle bg-white dark:bg-[#1E293B]">
        <div className="p-4">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="flex animate-pulse items-center gap-4"
                >
                  <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-slate-700" />

                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-gray-200 dark:bg-slate-700" />
                    <div className="h-3 w-24 rounded bg-gray-200 dark:bg-slate-700" />
                  </div>

                  <div className="h-8 w-20 rounded bg-gray-200 dark:bg-slate-700" />
                  <div className="h-8 w-20 rounded bg-gray-200 dark:bg-slate-700" />
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="rounded-xl border border-border-subtle bg-white px-6 py-16 text-center dark:bg-[#1E293B]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700">
          <Ticket
            size={26}
            className="text-ink-soft"
          />
        </div>

        <h3 className="text-base font-semibold text-ink dark:text-white">
          No coupons found
        </h3>

        <p className="mt-1 text-sm text-ink-soft">
          Try changing your search or create a new
          coupon.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-white dark:bg-[#1E293B]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px]">
          <thead>
            <tr className="border-b border-border-subtle bg-gray-50 dark:bg-slate-800/60">
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Coupon
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Discount
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Minimum Price
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Expiry
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Status
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {coupons.map((coupon) => (
              <tr
                key={coupon.id}
                className="border-b border-border-subtle last:border-b-0 hover:bg-gray-50 dark:hover:bg-slate-800/40"
              >
                {/* Coupon */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      <Ticket size={18} />
                    </div>

                    <div>
                      <p className="font-semibold text-ink dark:text-white">
                        {coupon.coupon_code}
                      </p>

                      <p className="text-xs text-ink-soft">
                        ID: {coupon.id}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Discount */}
                <td className="px-5 py-4">
                  <span className="font-medium text-ink dark:text-white">
                    {coupon.offer_percentage}%
                  </span>
                </td>

                {/* Minimum Price */}
                <td className="px-5 py-4">
                  <span className="text-sm text-ink dark:text-white">
                    ₹{coupon.min_price}
                  </span>
                </td>

                {/* Expiry */}
                <td className="px-5 py-4">
                  <span className="text-sm text-ink dark:text-white">
                    {formatDate(
                      coupon.expired_date,
                    )}
                  </span>
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      coupon.status === 'active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {coupon.status === 'active'
                      ? 'Active'
                      : 'Inactive'}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onEdit(coupon)
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-ink-soft transition hover:border-brand hover:text-brand dark:text-gray-300"
                      title="Edit coupon"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onDelete(coupon)
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20"
                      title="Delete coupon"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CouponTable;
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Plus,
  Ticket,
} from 'lucide-react';

import {
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
  type Coupon,
  type CouponPayload,
} from '../api/coupon.api';

import CouponFilters from '../components/CouponFilters';
import CouponTable from '../components/CouponTable';
import CouponFormModal from '../components/CouponFormModal';

const CouponsPage: React.FC = () => {
  const [coupons, setCoupons] =
    useState<Coupon[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [selectedCoupon, setSelectedCoupon] =
    useState<Coupon | null>(null);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const [status, setStatus] =
    useState('');

  const [error, setError] =
    useState('');

  const [successMessage, setSuccessMessage] =
    useState('');

  const loadCoupons = useCallback(
    async () => {
      try {
        setLoading(true);
        setError('');

        const response =
          await getCoupons();

        setCoupons(
          Array.isArray(response.data)
            ? response.data
            : [],
        );
      } catch (err: any) {
        console.error(
          'Failed to load coupons:',
          err,
        );

        setError(
          err?.response?.data?.message ||
            'Failed to load coupons.',
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const filteredCoupons = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return coupons.filter((coupon) => {
      const matchesSearch =
        !normalizedSearch ||
        coupon.coupon_code
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        !status ||
        coupon.status === status;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    coupons,
    search,
    status,
  ]);

  const handleCreate = () => {
    setSelectedCoupon(null);
    setModalOpen(true);
  };

  const handleEdit = (
    coupon: Coupon,
  ) => {
    setSelectedCoupon(coupon);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (saving) return;

    setModalOpen(false);
    setSelectedCoupon(null);
  };

  const handleSubmit = async (
    data: CouponPayload,
  ) => {
    try {
      setSaving(true);
      setError('');

      if (selectedCoupon) {
        const response =
          await updateCoupon(
            selectedCoupon.id,
            data,
          );

        setSuccessMessage(
          response.message ||
            'Coupon updated successfully.',
        );
      } else {
        const response =
          await createCoupon(data);

        setSuccessMessage(
          response.message ||
            'Coupon created successfully.',
        );
      }

      setModalOpen(false);
      setSelectedCoupon(null);

      await loadCoupons();

      window.setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      console.error(
        'Failed to save coupon:',
        err,
      );

      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    coupon: Coupon,
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete coupon "${coupon.coupon_code}"?`,
      );

    if (!confirmed) return;

    try {
      setError('');

      await deleteCoupon(coupon.id);

      setSuccessMessage(
        'Coupon deleted successfully.',
      );

      await loadCoupons();

      window.setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      console.error(
        'Failed to delete coupon:',
        err,
      );

      setError(
        err?.response?.data?.message ||
          'Failed to delete coupon.',
      );
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Ticket
              size={24}
              className="text-brand"
            />

            <h1 className="text-2xl font-bold text-ink dark:text-white">
              Coupons
            </h1>
          </div>

          <p className="mt-1 text-sm text-ink-soft">
            Manage discount coupons and
            promotional offers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          <Plus size={18} />
          Add Coupon
        </button>
      </div>

      {/* Success */}
      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400">
          {successMessage}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Filters */}
      <CouponFilters
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onClear={handleClearFilters}
      />

      {/* Table */}
      <CouponTable
        coupons={filteredCoupons}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      <CouponFormModal
        open={modalOpen}
        coupon={selectedCoupon}
        loading={saving}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default CouponsPage;
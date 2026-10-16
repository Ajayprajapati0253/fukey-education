import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Plus,
  Briefcase,
  RefreshCw,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

import {
  getCareers,
  createCareer,
  updateCareer,
  deleteCareer,
  updateCareerStatus,
  type Career,
  type CareerPayload,
  type CareerStatus,
} from '../api/career.api';

import CareerFilters from '../components/CareerFilters';

import CareerTable from '../components/CareerTable';

import CareerFormModal from '../components/CareerFormModal';

const PAGE_SIZE = 20;

const CareerJobListingsPage: React.FC =
  () => {
    /*
     * ================================================
     * State
     * ================================================
     */

    const [careers, setCareers] =
      useState<Career[]>([]);

    const [loading, setLoading] =
      useState(true);

    const [
      saving,
      setSaving,
    ] = useState(false);

    const [
      updatingStatus,
      setUpdatingStatus,
    ] = useState<string | null>(
      null,
    );

    const [
      deletingId,
      setDeletingId,
    ] = useState<string | null>(
      null,
    );

    const [
      error,
      setError,
    ] = useState<string | null>(
      null,
    );

    const [
      search,
      setSearch,
    ] = useState('');

    const [
      department,
      setDepartment,
    ] = useState('');

    const [
      location,
      setLocation,
    ] = useState('');

    const [
      employmentType,
      setEmploymentType,
    ] = useState('');

    const [
      status,
      setStatus,
    ] = useState('');

    const [
      orderBy,
      setOrderBy,
    ] = useState(2);

    const [
      page,
      setPage,
    ] = useState(1);

    const [
      pagination,
      setPagination,
    ] = useState({
      current_page: 1,
      per_page: PAGE_SIZE,
      total: 0,
      last_page: 0,
    });

    const [
      modalOpen,
      setModalOpen,
    ] = useState(false);

    const [
      editingCareer,
      setEditingCareer,
    ] = useState<Career | null>(
      null,
    );

    /*
     * ================================================
     * Load Careers
     * ================================================
     */

    const loadCareers =
      useCallback(
        async () => {
          try {
            setLoading(true);
            setError(null);

            const response =
              await getCareers({
                page,
                limit: PAGE_SIZE,

                keyword:
                  search.trim() ||
                  undefined,

                department:
                  department ||
                  undefined,

                location:
                  location ||
                  undefined,

                employment_type:
                  employmentType ||
                  undefined,

                status:
                  status ||
                  undefined,

                order_by:
                  orderBy,
              });

            setCareers(
              response?.data ?? [],
            );

            setPagination(
              response?.pagination ?? {
                current_page: page,
                per_page:
                  PAGE_SIZE,
                total: 0,
                last_page: 0,
              },
            );
          } catch (err: any) {
            console.error(
              'Failed to load careers:',
              err,
            );

            setCareers([]);

            setPagination({
              current_page: page,
              per_page: PAGE_SIZE,
              total: 0,
              last_page: 0,
            });

            setError(
              err?.response
                ?.data?.message ||
                'Failed to load job listings.',
            );
          } finally {
            setLoading(false);
          }
        },
        [
          page,
          search,
          department,
          location,
          employmentType,
          status,
          orderBy,
        ],
      );

    useEffect(() => {
      const timer =
        window.setTimeout(
          () => {
            loadCareers();
          },
          350,
        );

      return () => {
        window.clearTimeout(
          timer,
        );
      };
    }, [loadCareers]);

    /*
     * ================================================
     * Filter Options
     * ================================================
     */

    const departmentOptions =
      useMemo(() => {
        const values =
          careers
            .map(
              (career) =>
                career.department,
            )
            .filter(
              (
                value,
              ): value is string =>
                Boolean(
                  value,
                ),
            );

        return Array.from(
          new Set(values),
        );
      }, [careers]);

    const locationOptions =
      useMemo(() => {
        const values =
          careers
            .map(
              (career) =>
                career.location,
            )
            .filter(
              (
                value,
              ): value is string =>
                Boolean(
                  value,
                ),
            );

        return Array.from(
          new Set(values),
        );
      }, [careers]);

    /*
     * ================================================
     * Clear Filters
     * ================================================
     */

    const handleClearFilters =
      () => {
        setSearch('');
        setDepartment('');
        setLocation('');
        setEmploymentType('');
        setStatus('');
        setOrderBy(2);
        setPage(1);
      };

    /*
     * ================================================
     * Add Job
     * ================================================
     */

    const handleAddCareer =
      () => {
        setEditingCareer(null);
        setModalOpen(true);
      };

    /*
     * ================================================
     * Edit Job
     * ================================================
     */

    const handleEditCareer =
      (career: Career) => {
        setEditingCareer(
          career,
        );

        setModalOpen(true);
      };

    /*
     * ================================================
     * Create / Update
     * ================================================
     */

    const handleSubmitCareer =
      async (
        payload: CareerPayload,
      ) => {
        try {
          setSaving(true);
          setError(null);

          if (editingCareer) {
            await updateCareer(
              editingCareer.id,
              payload,
            );
          } else {
            await createCareer(
              payload,
            );
          }

          setModalOpen(false);
          setEditingCareer(null);

          await loadCareers();
        } catch (err: any) {
          console.error(
            'Failed to save career:',
            err,
          );

          setError(
            err?.response
              ?.data?.message ||
              'Failed to save job listing.',
          );

          throw err;
        } finally {
          setSaving(false);
        }
      };

    /*
     * ================================================
     * Delete
     * ================================================
     */

    const handleDeleteCareer =
      async (
        career: Career,
      ) => {
        const confirmed =
          window.confirm(
            `Are you sure you want to delete "${career.title}"?`,
          );

        if (!confirmed) {
          return;
        }

        try {
          setDeletingId(
            career.id,
          );

          setError(null);

          await deleteCareer(
            career.id,
          );

          if (
            careers.length === 1 &&
            page > 1
          ) {
            setPage(
              (current) =>
                current - 1,
            );
          } else {
            await loadCareers();
          }
        } catch (err: any) {
          console.error(
            'Failed to delete career:',
            err,
          );

          setError(
            err?.response
              ?.data?.message ||
              'Failed to delete job listing.',
          );
        } finally {
          setDeletingId(null);
        }
      };

    /*
     * ================================================
     * Status Update
     * ================================================
     */

    const handleStatusChange =
      async (
        career: Career,
        newStatus: CareerStatus,
      ) => {
        if (
          !newStatus ||
          newStatus ===
            career.status
        ) {
          return;
        }

        try {
          setUpdatingStatus(
            career.id,
          );

          setError(null);

          await updateCareerStatus(
            career.id,
            newStatus,
          );

          await loadCareers();
        } catch (err: any) {
          console.error(
            'Failed to update career status:',
            err,
          );

          setError(
            err?.response
              ?.data?.message ||
              'Failed to update job status.',
          );
        } finally {
          setUpdatingStatus(
            null,
          );
        }
      };

    /*
     * ================================================
     * Pagination
     * ================================================
     */

    const canGoPrevious =
      page > 1;

    const canGoNext =
      pagination.last_page >
        0 &&
      page <
        pagination.last_page;

    const pageNumbers =
      useMemo(() => {
        const totalPages =
          pagination.last_page;

        if (!totalPages) {
          return [];
        }

        const maxVisible = 5;

        let start = Math.max(
          1,
          page - 2,
        );

        let end = Math.min(
          totalPages,
          start +
            maxVisible -
            1,
        );

        if (
          end - start + 1 <
          maxVisible
        ) {
          start = Math.max(
            1,
            end -
              maxVisible +
              1,
          );
        }

        return Array.from(
          {
            length:
              end -
              start +
              1,
          },
          (_, index) =>
            start + index,
        );
      }, [
        page,
        pagination.last_page,
      ]);

    /*
     * ================================================
     * Render
     * ================================================
     */

    return (
      <div className="min-h-full bg-slate-50 p-4 dark:bg-[#0F172A] sm:p-6">
        <div className="mx-auto max-w-[1600px]">

          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Briefcase
                  size={22}
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-ink dark:text-white">
                  Job Listings
                </h1>

                <p className="mt-1 text-sm text-ink-soft dark:text-slate-400">
                  Create and manage your career opportunities.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={
                  loadCareers
                }
                disabled={
                  loading
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border-subtle bg-white px-4 text-sm font-medium text-ink transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-[#1E293B] dark:text-white dark:hover:bg-slate-700"
              >
                <RefreshCw
                  size={16}
                  className={
                    loading
                      ? 'animate-spin'
                      : ''
                  }
                />

                Refresh
              </button>

              <button
                type="button"
                onClick={
                  handleAddCareer
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-medium text-white transition hover:opacity-90"
              >
                <Plus
                  size={17}
                />

                Add Job
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400">
              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={() =>
                  setError(
                    null,
                  )
                }
                className="shrink-0"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* Main Card */}
          <div className="overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-sm dark:border-slate-700 dark:bg-[#1E293B]">

            {/* Filters */}
            <CareerFilters
              search={search}
              department={
                department
              }
              location={
                location
              }
              employmentType={
                employmentType
              }
              status={status}
              orderBy={orderBy}
              departments={
                departmentOptions
              }
              locations={
                locationOptions
              }
              onSearchChange={(
                value,
              ) => {
                setSearch(
                  value,
                );
                setPage(1);
              }}
              onDepartmentChange={(
                value,
              ) => {
                setDepartment(
                  value,
                );
                setPage(1);
              }}
              onLocationChange={(
                value,
              ) => {
                setLocation(
                  value,
                );
                setPage(1);
              }}
              onEmploymentTypeChange={(
                value,
              ) => {
                setEmploymentType(
                  value,
                );
                setPage(1);
              }}
              onStatusChange={(
                value,
              ) => {
                setStatus(
                  value,
                );
                setPage(1);
              }}
              onOrderChange={(
                value,
              ) => {
                setOrderBy(
                  value,
                );
                setPage(1);
              }}
              onClear={
                handleClearFilters
              }
            />

            {/* Stats */}
            <div className="border-b border-border-subtle px-5 py-4 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Users
                    size={18}
                  />
                </div>

                <div>
                  <p className="text-xs text-ink-soft dark:text-slate-400">
                    Total Job Listings
                  </p>

                  <p className="text-lg font-bold text-ink dark:text-white">
                    {
                      pagination.total
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Table */}
            <CareerTable
              careers={
                careers
              }
              loading={
                loading
              }
              updatingStatus={
                updatingStatus
              }
              deletingId={
                deletingId
              }
              onEdit={
                handleEditCareer
              }
              onDelete={
                handleDeleteCareer
              }
              onStatusChange={
                handleStatusChange
              }
            />

            {/* Pagination */}
            {!loading &&
              careers.length >
                0 && (
                <div className="flex flex-col gap-3 border-t border-border-subtle px-5 py-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">

                  <p className="text-sm text-ink-soft dark:text-slate-400">
                    Showing{' '}
                    {(pagination.current_page -
                      1) *
                      pagination.per_page +
                      1}{' '}
                    to{' '}
                    {Math.min(
                      pagination.current_page *
                        pagination.per_page,
                      pagination.total,
                    )}{' '}
                    of{' '}
                    {
                      pagination.total
                    }{' '}
                    jobs
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setPage(
                          (current) =>
                            current -
                            1,
                        )
                      }
                      disabled={
                        !canGoPrevious ||
                        loading
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-slate-400 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-700"
                    >
                      <ChevronLeft
                        size={17}
                      />
                    </button>

                    {pageNumbers.map(
                      (
                        pageNumber,
                      ) => (
                        <button
                          key={
                            pageNumber
                          }
                          type="button"
                          onClick={() =>
                            setPage(
                              pageNumber,
                            )
                          }
                          disabled={
                            loading
                          }
                          className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm transition ${
                            pageNumber ===
                            page
                              ? 'bg-brand font-medium text-white'
                              : 'border border-border-subtle text-ink-soft hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          {
                            pageNumber
                          }
                        </button>
                      ),
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setPage(
                          (current) =>
                            current +
                            1,
                        )
                      }
                      disabled={
                        !canGoNext ||
                        loading
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <ChevronRight
                        size={17}
                      />
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Add/Edit Modal */}
        <CareerFormModal
          open={modalOpen}
          career={
            editingCareer
          }
          loading={saving}
          onClose={() => {
            if (!saving) {
              setModalOpen(
                false,
              );

              setEditingCareer(
                null,
              );
            }
          }}
          onSubmit={
            handleSubmitCareer
          }
        />
      </div>
    );
  };

export default CareerJobListingsPage;
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Users,
  X,
} from 'lucide-react';

import {
  getCareers,
  getCareerApplications,
  updateCareerApplicationStatus,
  deleteCareerApplication,
  getCareerApplicationResume,
  type Career,
  type CareerApplication,
} from '../api/career-application.api';

import CareerApplicationFilters from '../components/CareerApplicationFilters';
import CareerApplicationTable from '../components/CareerApplicationTable';
import CareerApplicationDetailsModal from '../components/CareerApplicationDetailsModal';

const PAGE_SIZE = 20;

const CareerApplicationsPage: React.FC = () => {
  /*
   * --------------------------------
   * State
   * --------------------------------
   */

  const [careers, setCareers] = useState<Career[]>([]);

  const [applications, setApplications] =
    useState<CareerApplication[]>([]);

  const [selectedCareer, setSelectedCareer] =
    useState('');

  const [search, setSearch] =
    useState('');

  const [status, setStatus] =
    useState('all');

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      current_page: 1,
      per_page: PAGE_SIZE,
      total: 0,
      last_page: 0,
    });

  const [loadingCareers, setLoadingCareers] =
    useState(true);

  const [loadingApplications, setLoadingApplications] =
    useState(false);

  const [updatingStatus, setUpdatingStatus] =
    useState<string | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [loadingResumeId, setLoadingResumeId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [selectedApplication, setSelectedApplication] =
    useState<CareerApplication | null>(null);

  /*
   * --------------------------------
   * Load Careers
   * --------------------------------
   */

  const loadCareers = useCallback(
    async () => {
      try {
        setLoadingCareers(true);
        setError(null);

        const response = await getCareers({
          page: 1,
          limit: 100,
        });

        const careerList =
          response?.data ?? [];

        setCareers(careerList);

        // Select first career if nothing selected
        setSelectedCareer((current) => {
          if (
            current &&
            careerList.some(
              (career) =>
                String(career.id) ===
                String(current),
            )
          ) {
            return current;
          }

          return careerList.length > 0
            ? String(careerList[0].id)
            : '';
        });
      } catch (err: any) {
        console.error(
          'Failed to load careers:',
          err,
        );

        setError(
          err?.response?.data?.message ||
            'Failed to load careers.',
        );
      } finally {
        setLoadingCareers(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadCareers();
  }, [loadCareers]);

  /*
   * --------------------------------
   * Load Applications
   * --------------------------------
   */

  const loadApplications = useCallback(
    async () => {
      if (!selectedCareer) {
        setApplications([]);

        setPagination({
          current_page: 1,
          per_page: PAGE_SIZE,
          total: 0,
          last_page: 0,
        });

        return;
      }

      try {
        setLoadingApplications(true);
        setError(null);

        const response =
          await getCareerApplications(
            selectedCareer,
            {
              page,
              limit: PAGE_SIZE,

              status:
                status === 'all'
                  ? undefined
                  : status,

              keyword:
                search.trim() || undefined,
            },
          );

        setApplications(
          response?.data ?? [],
        );

        setPagination(
          response?.pagination ?? {
            current_page: page,
            per_page: PAGE_SIZE,
            total: 0,
            last_page: 0,
          },
        );
      } catch (err: any) {
        console.error(
          'Failed to load applications:',
          err,
        );

        setApplications([]);

        setPagination({
          current_page: page,
          per_page: PAGE_SIZE,
          total: 0,
          last_page: 0,
        });

        setError(
          err?.response?.data?.message ||
            'Failed to load career applications.',
        );
      } finally {
        setLoadingApplications(false);
      }
    },
    [
      selectedCareer,
      page,
      status,
      search,
    ],
  );

  /*
   * --------------------------------
   * Debounced API request
   * --------------------------------
   */

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        loadApplications();
      }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadApplications]);

  /*
   * --------------------------------
   * Career Change
   * --------------------------------
   */

  const handleCareerChange = (
    value: string,
  ) => {
    setSelectedCareer(value);
    setPage(1);
    setStatus('all');
    setSearch('');
    setSelectedApplication(null);
  };

  /*
   * --------------------------------
   * Status Options
   * --------------------------------
   */

  const statusOptions = useMemo(() => {
    const values = applications
      .map((application) =>
        String(
          application.status || '',
        ).trim(),
      )
      .filter(Boolean);

    return Array.from(
      new Set(values),
    );
  }, [applications]);

  /*
   * --------------------------------
   * Status Update
   * --------------------------------
   */

  const handleStatusChange = async (
    applicationId: string,
    newStatus: string,
  ) => {
    if (!newStatus) {
      return;
    }

    try {
      setUpdatingStatus(applicationId);
      setError(null);

      await updateCareerApplicationStatus(
        applicationId,
        newStatus,
      );

      await loadApplications();
    } catch (err: any) {
      console.error(
        'Failed to update application status:',
        err,
      );

      setError(
        err?.response?.data?.message ||
          'Failed to update application status.',
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  /*
   * --------------------------------
   * Delete
   * --------------------------------
   */

  const handleDelete = async (
    application: CareerApplication,
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete the application from ${application.name}?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(application.id);
      setError(null);

      await deleteCareerApplication(
        application.id,
      );

      setSelectedApplication(null);

      // If last item on page was deleted
      if (
        applications.length === 1 &&
        page > 1
      ) {
        setPage(
          (current) => current - 1,
        );
      } else {
        await loadApplications();
      }
    } catch (err: any) {
      console.error(
        'Failed to delete application:',
        err,
      );

      setError(
        err?.response?.data?.message ||
          'Failed to delete application.',
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
   * --------------------------------
   * Resume
   * --------------------------------
   */

  const handleResume = async (
    application: CareerApplication,
  ) => {
    try {
      setLoadingResumeId(
        application.id,
      );

      setError(null);

      const response =
        await getCareerApplicationResume(
          application.id,
        );

      const resumeUrl =
        response?.data?.resume_url;

      if (!resumeUrl) {
        throw new Error(
          'Resume URL was not returned.',
        );
      }

      window.open(
        resumeUrl,
        '_blank',
        'noopener,noreferrer',
      );
    } catch (err: any) {
      console.error(
        'Failed to open resume:',
        err,
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to open resume.',
      );
    } finally {
      setLoadingResumeId(null);
    }
  };

  /*
   * --------------------------------
   * Refresh
   * --------------------------------
   */

  const handleRefresh = async () => {
    await loadCareers();
    await loadApplications();
  };

  /*
   * --------------------------------
   * Pagination
   * --------------------------------
   */

  const canGoPrevious =
    page > 1;

  const canGoNext =
    pagination.last_page > 0 &&
    page < pagination.last_page;

  const handlePreviousPage = () => {
    if (canGoPrevious) {
      setPage(
        (current) => current - 1,
      );
    }
  };

  const handleNextPage = () => {
    if (canGoNext) {
      setPage(
        (current) => current + 1,
      );
    }
  };

  const handlePageChange = (
    newPage: number,
  ) => {
    if (
      newPage >= 1 &&
      newPage <= pagination.last_page
    ) {
      setPage(newPage);
    }
  };

  const pageNumbers = useMemo(() => {
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
      start + maxVisible - 1,
    );

    if (
      end - start + 1 <
      maxVisible
    ) {
      start = Math.max(
        1,
        end - maxVisible + 1,
      );
    }

    return Array.from(
      {
        length:
          end - start + 1,
      },
      (_, index) =>
        start + index,
    );
  }, [
    page,
    pagination.last_page,
  ]);

  /*
   * --------------------------------
   * Current Career
   * --------------------------------
   */

  const currentCareer =
    careers.find(
      (career) =>
        String(career.id) ===
        String(selectedCareer),
    );

  /*
   * --------------------------------
   * Render
   * --------------------------------
   */

  return (
    <div className="min-h-full bg-slate-50 p-4 dark:bg-[#0F172A] sm:p-6">
      <div className="mx-auto max-w-[1600px]">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Briefcase size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-ink dark:text-white">
                  Career Applications
                </h1>

                <p className="mt-1 text-sm text-ink-soft dark:text-slate-400">
                  Manage applications received for your job openings.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={
              loadingCareers ||
              loadingApplications
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border-subtle bg-white px-4 text-sm font-medium text-ink transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-[#1E293B] dark:text-white dark:hover:bg-slate-700"
          >
            <RefreshCw
              size={16}
              className={
                loadingCareers ||
                loadingApplications
                  ? 'animate-spin'
                  : ''
              }
            />

            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError(null)
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
          <CareerApplicationFilters
            careers={careers}
            selectedCareer={
              selectedCareer
            }
            search={search}
            status={status}
            statusOptions={
              statusOptions
            }
            loadingCareers={
              loadingCareers
            }
            onCareerChange={
              handleCareerChange
            }
            onSearchChange={(
              value,
            ) => {
              setSearch(value);
              setPage(1);
            }}
            onStatusChange={(
              value,
            ) => {
              setStatus(value);
              setPage(1);
            }}
          />

          {/* Selected career */}
          {currentCareer && (
            <div className="border-b border-border-subtle px-5 py-3 dark:border-slate-700">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft dark:text-slate-400">
                <span>
                  Career:{' '}
                  <strong className="text-ink dark:text-slate-200">
                    {currentCareer.title}
                  </strong>
                </span>

                {currentCareer.department && (
                  <span>
                    Department:{' '}
                    <strong className="text-ink dark:text-slate-200">
                      {currentCareer.department}
                    </strong>
                  </span>
                )}

                {currentCareer.location && (
                  <span>
                    Location:{' '}
                    <strong className="text-ink dark:text-slate-200">
                      {currentCareer.location}
                    </strong>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="border-b border-border-subtle px-5 py-4 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Users size={18} />
              </div>

              <div>
                <p className="text-xs text-ink-soft dark:text-slate-400">
                  Total Applications
                </p>

                <p className="text-lg font-bold text-ink dark:text-white">
                  {pagination.total}
                </p>
              </div>
            </div>
          </div>

          {/* No career */}
          {!selectedCareer &&
          !loadingCareers ? (
            <div className="px-5 py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                <Briefcase size={24} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-ink dark:text-white">
                Select a career
              </h3>

              <p className="mt-1 text-sm text-ink-soft dark:text-slate-400">
                Select a career above to view its applications.
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
              <CareerApplicationTable
                applications={
                  applications
                }
                statusOptions={
                  statusOptions
                }
                loading={
                  loadingApplications
                }
                updatingStatus={
                  updatingStatus
                }
                deletingId={
                  deletingId
                }
                loadingResumeId={
                  loadingResumeId
                }
                onStatusChange={
                  handleStatusChange
                }
                onResume={
                  handleResume
                }
                onView={(
                  application,
                ) =>
                  setSelectedApplication(
                    application,
                  )
                }
                onDelete={
                  handleDelete
                }
              />

              {/* Pagination */}
              {!loadingApplications &&
                applications.length >
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
                      {pagination.total}{' '}
                      applications
                    </p>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={
                          handlePreviousPage
                        }
                        disabled={
                          !canGoPrevious ||
                          loadingApplications
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-slate-400 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-700"
                      >
                        <ChevronLeft
                          size={17}
                        />
                      </button>

                      {pageNumbers.map(
                        (pageNumber) => (
                          <button
                            key={
                              pageNumber
                            }
                            type="button"
                            onClick={() =>
                              handlePageChange(
                                pageNumber,
                              )
                            }
                            disabled={
                              loadingApplications
                            }
                            className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm transition ${
                              pageNumber ===
                              page
                                ? 'bg-brand font-medium text-white'
                                : 'border border-border-subtle text-ink-soft hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
                            } disabled:cursor-not-allowed disabled:opacity-50`}
                          >
                            {pageNumber}
                          </button>
                        ),
                      )}

                      <button
                        type="button"
                        onClick={
                          handleNextPage
                        }
                        disabled={
                          !canGoNext ||
                          loadingApplications
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
            </>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <CareerApplicationDetailsModal
        application={
          selectedApplication
        }
        onClose={() =>
          setSelectedApplication(
            null,
          )
        }
        onResume={
          handleResume
        }
      />
    </div>
  );
};

export default CareerApplicationsPage;
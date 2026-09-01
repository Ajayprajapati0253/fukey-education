import { useState, useEffect, useCallback } from 'react';
import { getDashboardOverview } from '../api/dashboard.api';
import type { DashboardOverviewResponse, TimeRange } from '../types/dashboard.types';

export function useDashboardOverview(range: TimeRange = '30D') {
  const [data, setData] = useState<DashboardOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (selectedRange: TimeRange) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getDashboardOverview(selectedRange);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load dashboard data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(range);
  }, [range, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: () => fetchData(range),
  };
}

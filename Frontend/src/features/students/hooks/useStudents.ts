import { useState, useEffect, useCallback } from 'react';
import type { Student, StudentFilterOptions, QuickInsightData, StudentAccessBreakdown } from '../types';
import { studentApi } from '../api/studentApi';

export function useStudents(initialFilters?: Partial<StudentFilterOptions>) {
  const [students, setStudents] = useState<Student[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [filters, setFilters] = useState<StudentFilterOptions>({
    search: initialFilters?.search || '',
    course: initialFilters?.course || 'All Courses',
    status: initialFilters?.status || 'All Status',
    accessPeriod: initialFilters?.accessPeriod || 'All Access Period',
    joinedDate: initialFilters?.joinedDate || '',
  });

  const [insights, setInsights] = useState<QuickInsightData | null>(null);
  const [accessBreakdown, setAccessBreakdown] = useState<StudentAccessBreakdown | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentApi.getStudents(filters, page, pageSize);
      setStudents(res.data);
      setTotalStudents(res.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    studentApi.getQuickInsights().then(setInsights);
    studentApi.getAccessBreakdown().then(setAccessBreakdown);
  }, []);

  const deleteStudent = async (id: string) => {
    await studentApi.deleteStudent(id);
    await fetchStudents();
  };

  const extendAccess = async (id: string, years: number = 1) => {
    await studentApi.extendAccess(id, years);
    await fetchStudents();
  };

  const createStudent = async (studentData: Omit<Student, 'id' | 'sn'>) => {
    const created = await studentApi.createStudent(studentData);
    await fetchStudents();
    return created;
  };

  return {
    students,
    totalStudents,
    loading,
    error,
    page,
    setPage,
    pageSize,
    filters,
    setFilters,
    insights,
    accessBreakdown,
    refetch: fetchStudents,
    deleteStudent,
    extendAccess,
    createStudent,
  };
}
import { useState, useEffect, useCallback } from 'react';
import type { Student } from '../types';
import { studentApi } from '../api/studentApi';

export function useStudent(id?: string) {
  const [student, setStudent] = useState<Student | null>(null);
  const [initialData, setInitialData] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudent = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await studentApi.getStudentById(id);
      if (data) {
        setStudent(data);
        setInitialData(data);
      } else {
        setError('Student not found');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch student details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  const updateStudent = async (updates: Partial<Student>) => {
    if (!id) return;
    try {
      setSaving(true);
      const updated = await studentApi.updateStudent(id, updates);
      setStudent(updated);
      setInitialData(updated);
      return updated;
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    if (initialData) {
      setStudent({ ...initialData });
    }
  };

  const extendAccess = async (years: number = 1) => {
    if (!id) return;
    const updated = await studentApi.extendAccess(id, years);
    setStudent(updated);
    setInitialData(updated);
    return updated;
  };

  const deleteAccount = async () => {
    if (!id) return;
    await studentApi.deleteStudent(id);
  };

  return {
    student,
    setStudent,
    loading,
    saving,
    error,
    updateStudent,
    resetChanges,
    extendAccess,
    deleteAccount,
    refetch: fetchStudent,
  };
}
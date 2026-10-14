import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Outlet } from 'react-router-dom';
import { Toast } from '../../../components/ui/Toast';

type ToastType = 'success' | 'error' | 'info';

interface FreeToastApi {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const FreeToastContext = createContext<FreeToastApi | null>(null);

export const FreeToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({
    show: false,
    message: '',
    type: 'success',
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  const push = useCallback((type: ToastType, title: string, message?: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ show: true, type, message: message ? `${title} — ${message}` : title });
    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Functions stable rakhe hain, kyunki useFreeCourses / EditPage ke useEffect deps mein use hote hain
  const api = useMemo<FreeToastApi>(
    () => ({
      success: (title, message) => push('success', title, message),
      error: (title, message) => push('error', title, message),
      info: (title, message) => push('info', title, message),
    }),
    [push]
  );

  return (
    <FreeToastContext.Provider value={api}>
      {children}
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={hide} />
    </FreeToastContext.Provider>
  );
};

export const useFreeToast = (): FreeToastApi => {
  const ctx = useContext(FreeToastContext);
  if (!ctx) {
    throw new Error('useFreeToast must be used within FreeToastProvider');
  }
  return ctx;
};

// Routes ke liye: <Route path="free-courses" element={<FreeCoursesToastLayout />}> ... </Route>
export const FreeCoursesToastLayout: React.FC = () => (
  <FreeToastProvider>
    <Outlet />
  </FreeToastProvider>
);
import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { post } from '../../../../services/api';

interface AdminLoginResponse {
  message: string;
  access_token: string;
  admin: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    bio: string | null;
    status: string;
  };
}

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await post<AdminLoginResponse>(
        '/admin/auth/login',
        {
          email: email.trim(),
          password,
          remember,
        },
      );

      if (!response?.access_token) {
        throw new Error(
          'Login response did not contain an access token.',
        );
      }

      const storage = remember
        ? localStorage
        : sessionStorage;

      storage.setItem(
        'admin_token',
        response.access_token,
      );

      storage.setItem(
        'admin_user',
        JSON.stringify(response.admin),
      );

      // Remove stale token from the other storage.
      if (remember) {
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_user');
      } else {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }

      navigate('/admin/dashboard', {
        replace: true,
      });
    } catch (err: any) {
      console.error('Admin login error:', err);

      const message =
        err?.response?.data?.message ??
        err?.message ??
        'Unable to login. Please check your credentials.';

      setError(
        Array.isArray(message)
          ? message[0]
          : message,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#0F172A] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center shadow-[0_8px_24px_rgba(36,81,217,0.25)]">
              <span className="text-white text-xl font-black">
                F
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-ink dark:text-white">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-ink-soft dark:text-slate-400">
            Sign in to your Fukey Education admin account
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-border-subtle dark:border-slate-700/70 shadow-[0_12px_40px_rgba(15,23,42,0.08)] p-6 sm:p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-4 py-3">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-ink dark:text-slate-200 mb-2"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="admin@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-ink dark:text-white placeholder:text-slate-400 outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-ink dark:text-slate-200 mb-2"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                <input
                  id="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="w-full h-11 pl-10 pr-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-ink dark:text-white placeholder:text-slate-400 outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev,
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) =>
                    setRemember(
                      e.target.checked,
                    )
                  }
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand"
                />

                <span className="text-xs font-medium text-ink-soft dark:text-slate-400">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/admin/forgot-password',
                  )
                }
                className="text-xs font-bold text-brand hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-brand text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#1E44B8] active:scale-[0.99] transition-all shadow-[0_4px_14px_rgba(36,81,217,0.25)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} Fukey Education. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
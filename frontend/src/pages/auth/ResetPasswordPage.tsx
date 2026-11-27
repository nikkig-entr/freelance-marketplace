import { useState } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { authService } from '@/services/api';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

export function ResetPasswordPage() {
  const search = useSearch({ strict: false }) as { token?: string };
  const token = search.token;
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toast.error('Invalid reset token');
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      setIsSuccess(true);
      toast.success('Password has been reset');
    } catch {
      const message = 'Failed to reset password';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 mb-8 text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors">
            <div className="w-10 h-10 border border-white/15 flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-[var(--color-text)]">FreelanceHub</span>
          </Link>
          <div className="border border-white/15 p-8 text-center">
            <div className="w-16 h-16 border border-white flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-heading font-bold text-[var(--color-text)] text-2xl">Password Reset</h2>
            <p className="mt-2 text-[var(--color-text-muted)] font-[Instrument_Serif] italic">Your password has been successfully updated.</p>
            <Link
              to="/login"
              className="border border-white w-full py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors block text-center mt-8"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 mb-8 text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors">
            <div className="w-10 h-10 border border-white/15 flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-[var(--color-text)]">FreelanceHub</span>
          </Link>
          <div className="border border-white/15 p-8 text-center">
            <div className="w-16 h-16 border border-white flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="font-heading font-bold text-[var(--color-text)] text-2xl">Invalid Reset Link</h2>
            <p className="mt-2 text-[var(--color-text-muted)] font-[Instrument_Serif] italic">This password reset link is invalid or has expired.</p>
            <Link
              to="/forgot-password"
              className="border border-white w-full py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors block text-center mt-8"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors">
          <div className="w-10 h-10 border border-white/15 flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <span className="font-heading font-bold text-xl text-[var(--color-text)]">FreelanceHub</span>
        </Link>
        <div className="border border-white/15 p-8">
          <div className="text-center mb-8">
            <h2 className="font-heading font-bold text-[var(--color-text)] text-2xl">Reset your password</h2>
            <p className="mt-2 text-[var(--color-text-muted)] font-[Instrument_Serif] italic">Enter your new password below.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="password" className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase block mb-2">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[var(--color-text-subtle)] hover:text-white"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  }
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                />
              </div>
              <p className="mt-1 font-mono text-xs text-[var(--color-text-muted)]">At least 8 characters</p>
            </div>

            <Input
              id="confirmPassword"
              label="Confirm New Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />

            <button
              type="submit"
              className="border border-white w-full py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <p className="mt-6 text-center font-mono text-xs text-[var(--color-text-muted)]">
            <Link to="/login" className="text-white hover:text-[var(--color-text-muted)] underline font-medium">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
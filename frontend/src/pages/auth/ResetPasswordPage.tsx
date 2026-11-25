import { useState } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { authService } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { AuthLayout } from '@/components/layout/Layout';
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
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to reset password';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout>
        <Card padding="lg">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-[var(--color-bg)]" />
              </div>
              <span className="font-heading font-bold text-xl text-[var(--color-text)]">FreelanceHub</span>
            </Link>
            <div className="w-16 h-16 bg-[var(--color-success-muted)] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Password Reset</h2>
            <p className="mt-2 text-[var(--color-text-muted)]">Your password has been successfully updated.</p>
            <Button variant="primary" fullWidth size="lg" asChild className="mt-8">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </Card>
      </AuthLayout>
    );
  }

  if (!token) {
    return (
      <AuthLayout>
        <Card padding="lg">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-[var(--color-bg)]" />
              </div>
              <span className="font-heading font-bold text-xl text-[var(--color-text)]">FreelanceHub</span>
            </Link>
            <div className="w-16 h-16 bg-[var(--color-error-muted)] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[var(--color-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Invalid Reset Link</h2>
            <p className="mt-2 text-[var(--color-text-muted)]">This password reset link is invalid or has expired.</p>
            <Button variant="primary" fullWidth size="lg" asChild className="mt-8">
              <Link to="/forgot-password">Request New Link</Link>
            </Button>
          </div>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card padding="lg">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-[var(--color-bg)]" />
            </div>
            <span className="font-heading font-bold text-xl text-[var(--color-text)]">FreelanceHub</span>
          </Link>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Reset your password</h2>
          <p className="mt-2 text-[var(--color-text-muted)]">Enter your new password below.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="password" className="label">
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
                    className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)]"
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
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">At least 8 characters</p>
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

          <Button type="submit" fullWidth size="lg" loading={isLoading}>
            Reset Password
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
          <Link to="/login" className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium">
            Back to Sign In
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
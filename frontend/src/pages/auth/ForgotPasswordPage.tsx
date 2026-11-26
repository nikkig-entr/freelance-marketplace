import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { authService } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { AuthLayout } from '@/components/layout/Layout';
import toast from 'react-hot-toast';

interface ForgotPasswordForm {
  email: string;
}

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSent(true);
      toast.success('If the email exists, a reset link has been sent');
    } catch {
      // Don't reveal if email exists
      setIsSent(true);
      toast.success('If the email exists, a reset link has been sent');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
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
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Check your email</h2>
            <p className="mt-2 text-[var(--color-text-muted)]">
              If an account exists for that email, you&apos;ll receive a password reset link shortly.
            </p>
            <div className="mt-8 space-y-4">
              <Button variant="primary" fullWidth size="lg" asChild>
                <Link to="/login">Back to Sign In</Link>
              </Button>
              <Button variant="outline" fullWidth size="lg" asChild>
                <Link to="/register">Create Account</Link>
              </Button>
            </div>
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
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Forgot your password?</h2>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />

          <Button type="submit" fullWidth size="lg" loading={isLoading}>
            Send Reset Link
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
          Remember your password?{' '}
          <Link to="/login" className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium">
            Sign in
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
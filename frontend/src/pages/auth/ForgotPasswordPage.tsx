import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { authService } from '@/services/api';
import { Input } from '@/components/ui/Input';
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
      setIsSent(true);
      toast.success('If the email exists, a reset link has been sent');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
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
            <h2 className="font-heading font-bold text-[var(--color-text)] text-2xl">Check your email</h2>
            <p className="mt-2 text-[var(--color-text-muted)] font-[Instrument_Serif] italic">
              If an account exists for that email, you&apos;ll receive a password reset link shortly.
            </p>
            <div className="mt-8 space-y-4">
              <Link
                to="/login"
                className="border border-white w-full py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors block text-center"
              >
                Back to Sign In
              </Link>
              <Link
                to="/register"
                className="border border-white/15 w-full py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors block text-center"
              >
                Create Account
              </Link>
            </div>
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
            <h2 className="font-heading font-bold text-[var(--color-text)] text-2xl">Forgot your password?</h2>
            <p className="mt-2 text-[var(--color-text-muted)] font-[Instrument_Serif] italic">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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

            <button
              type="submit"
              className="border border-white w-full py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="mt-6 text-center font-mono text-xs text-[var(--color-text-muted)]">
            Remember your password?{' '}
            <Link to="/login" className="text-white hover:text-[var(--color-text-muted)] underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
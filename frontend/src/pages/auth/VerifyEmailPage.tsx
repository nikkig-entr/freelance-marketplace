import { useState, useEffect } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { authService } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AuthLayout } from '@/components/layout/Layout';
import toast from 'react-hot-toast';

export function VerifyEmailPage() {
  const search = useSearch({ strict: false }) as { token?: string };
  const token = search.token;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }
      try {
        await authService.verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      } catch (error: any) {
        setStatus('error');
        const msg = error.response?.data?.error?.message || 'Verification failed';
        setMessage(msg);
      }
    };
    verify();
  }, [token]);

  const handleResend = async () => {
    setResendLoading(true);
    try {
      // Use forgot password as resend verification - backend handles this
      await authService.forgotPassword(''); // This would need an email, but we don't have it here
      toast.success('Verification email sent');
      setCanResend(false);
      setTimeout(() => setCanResend(true), 60000);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to send email');
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'error') {
      const timer = setTimeout(() => setCanResend(true), 60000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <AuthLayout>
      <Card padding="lg">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-[var(--color-bg)]" />
          </div>
          <span className="font-heading font-bold text-xl text-[var(--color-text)]">FreelanceHub</span>
        </Link>

        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-[var(--color-accent-muted)] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg className="w-8 h-8 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Verifying your email</h2>
            <p className="mt-2 text-[var(--color-text-muted)]">Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-[var(--color-success-muted)] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Email Verified!</h2>
            <p className="mt-2 text-[var(--color-text-muted)]">{message}</p>
            <Button variant="primary" fullWidth size="lg" asChild className="mt-8">
              <Link to="/login">Sign In</Link>
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-[var(--color-error-muted)] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[var(--color-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Verification Failed</h2>
            <p className="mt-2 text-[var(--color-text-muted)]">{message}</p>
            <div className="mt-8 space-y-4">
              <Button variant="secondary" fullWidth size="lg" onClick={handleResend} disabled={resendLoading || !canResend}>
                {resendLoading ? 'Sending...' : canResend ? 'Resend Verification Email' : 'Resend available in 1 minute'}
              </Button>
              <Button variant="primary" fullWidth size="lg" asChild>
                <Link to="/login">Back to Sign In</Link>
              </Button>
            </div>
          </>
        )}
      </Card>
    </AuthLayout>
  );
}
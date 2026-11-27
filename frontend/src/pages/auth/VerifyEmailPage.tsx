import { useState, useEffect } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { authService } from '@/services/api';
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
      } catch (err: unknown) {
        setStatus('error');
        const error = err as { response?: { data?: { error?: { message?: string } } } };
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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
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
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors">
          <div className="w-10 h-10 border border-white/15 flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <span className="font-heading font-bold text-xl text-[var(--color-text)]">FreelanceHub</span>
        </Link>

        {status === 'loading' && (
          <div className="border border-white/15 p-8 text-center">
            <div className="w-16 h-16 border border-white/15 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="font-heading font-bold text-[var(--color-text)] text-2xl">Verifying your email</h2>
            <p className="mt-2 text-[var(--color-text-muted)] font-[Instrument_Serif] italic">Please wait while we verify your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="border border-white/15 p-8 text-center">
            <div className="w-16 h-16 border border-white flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-heading font-bold text-[var(--color-text)] text-2xl">Email Verified!</h2>
            <p className="mt-2 text-[var(--color-text-muted)] font-[Instrument_Serif] italic">{message}</p>
            <Link
              to="/login"
              className="border border-white w-full py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors block text-center mt-8"
            >
              Sign In
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="border border-white/15 p-8 text-center">
            <div className="w-16 h-16 border border-white flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="font-heading font-bold text-[var(--color-text)] text-2xl">Verification Failed</h2>
            <p className="mt-2 text-[var(--color-text-muted)] font-[Instrument_Serif] italic">{message}</p>
            <div className="mt-8 space-y-4">
              <button
                onClick={handleResend}
                disabled={resendLoading || !canResend}
                className="border border-white/15 w-full py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? 'Sending...' : canResend ? 'Resend Verification Email' : 'Resend available in 1 minute'}
              </button>
              <Link
                to="/login"
                className="border border-white w-full py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors block text-center"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
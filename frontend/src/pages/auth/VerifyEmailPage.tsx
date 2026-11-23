import { useState, useEffect } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { Briefcase } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/verify-email' });
  const token = search.token as string | undefined;
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
        await api.verifyEmail(token);
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
      await api.resendVerificationEmail();
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">FreelanceHub</span>
        </Link>

        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verifying your email</h2>
            <p className="mt-2 text-gray-600">Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <Link to="/login" className="btn-primary w-full block py-3 mt-8">
              Sign In
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <div className="mt-8 space-y-4">
              <button
                onClick={handleResend}
                disabled={resendLoading || !canResend}
                className="w-full btn-secondary py-3"
              >
                {resendLoading ? 'Sending...' : canResend ? 'Resend Verification Email' : 'Resend available in 1 minute'}
              </button>
              <Link to="/login" className="btn-primary w-full block py-3">
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Need to import Link
import { Link } from '@tanstack/react-router';
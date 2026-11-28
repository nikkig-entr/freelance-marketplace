'use client';

import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CinemaMedia } from '@/components/ui/CinemaMedia';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate({ to: '/' });
    } catch {
      const message = 'Invalid email or password';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col lg:flex-row">
      {/* Left Side - Architectural Image - Dark Theme */}
      <div className="relative lg:w-1/2 hidden lg:block overflow-hidden min-h-[100dvh]">
        <CinemaMedia
          src="/media/arch-02.jpg"
          aspectRatio={1}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg)]/60 via-transparent to-[var(--color-bg)]/90" />
        <div className="absolute bottom-12 left-12 right-12 z-10">
          <span className="font-mono text-xs text-[var(--color-white)]/70 tracking-wider uppercase block mb-4">
            Sign In
          </span>
          <h1 className="font-heading font-extrabold text-[var(--color-white)] uppercase tracking-[-0.03em] leading-[0.92] text-[clamp(2.2rem,5.8vw,6rem)] break-words max-w-full"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
            }}
          >
            <span>Welcome</span>
            <br />
            <span>back</span>
          </h1>
        </div>
      </div>

      {/* Mobile Hero - condensed */}
      <div className="lg:hidden relative overflow-hidden min-h-[40vh]">
        <CinemaMedia
          src="/media/arch-02.jpg"
          aspectRatio={16/9}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg)]/60 via-transparent to-[var(--color-bg)]/90" />
        <div className="absolute bottom-6 left-6 right-6 z-10">
          <span className="font-mono text-xs text-[var(--color-white)]/70 tracking-wider uppercase block mb-2">
            Sign In
          </span>
          <h1 className="font-heading font-extrabold text-[var(--color-white)] uppercase tracking-[-0.03em] leading-[0.92] text-[clamp(2.2rem,5.8vw,6rem)] break-words max-w-full"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
            }}
          >
            <span>Welcome</span>
            <br />
            <span>back</span>
          </h1>
        </div>
      </div>

      {/* Right Side - Form - HIGH-CONTRAST INVERTED: White bg, Black text */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 min-h-[100dvh] lg:min-h-auto bg-white overflow-y-auto">
        <div className="w-full max-w-md"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
          }}
        >
          <div className="mb-10 lg:mb-12">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <span className="font-mono text-xs tracking-[0.25em] uppercase text-black">
                FREELANCEHUB
              </span>
            </Link>
            <h1 className="font-heading font-extrabold text-black uppercase tracking-[-0.03em] leading-[0.92] text-[clamp(2.2rem,5.8vw,6rem)] break-words max-w-full mb-4">
              <span>Sign</span>
              <br />
              <span>in</span>
            </h1>
            <p className="font-editorial italic font-light text-black/50 leading-relaxed tracking-[0.01em] text-body mt-6">
              Enter your credentials to access the archive
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              className="border-0 border-b border-black/30 bg-transparent px-0 py-4 text-base sm:text-lg placeholder-black/30 focus:ring-0 focus:border-black min-h-[48px] text-[16px] text-black"
              {...register('email')}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password?.message}
                rightIcon={
                  <button
                    type="button"
                    className="text-black/30 hover:text-black transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                }
                className="border-0 border-b border-black/30 bg-transparent px-0 py-4 pr-12 text-base sm:text-lg placeholder-black/30 focus:ring-0 focus:border-black min-h-[48px] text-[16px] text-black"
                {...register('password')}
              />
            </div>

            <Button type="submit" fullWidth size="lg" loading={isLoading} className="mt-4 border-2 border-black px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] bg-black text-white hover:bg-black/90 hover:text-white transition-colors min-h-[56px]">
              Sign In
            </Button>
          </form>

          <div className="mt-10 lg:mt-12 text-center">
            <p className="text-black/50">
              Don&apos;t have an account?&nbsp;
              <Link to="/register" className="font-medium text-black hover:underline transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
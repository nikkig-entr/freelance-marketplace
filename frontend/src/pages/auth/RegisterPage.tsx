import { useState } from 'react';
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

const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirm: z.string().min(1, 'Please confirm your password'),
  role: z.enum(['freelancer', 'client']),
}).refine((data) => data.password === data.password_confirm, {
  message: 'Passwords do not match',
  path: ['password_confirm'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'freelancer',
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        password_confirm: data.password_confirm,
        full_name: data.full_name,
        role: data.role,
      });
      toast.success('Account created successfully!');
      navigate({ to: '/' });
    } catch {
      const message = 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      {/* Left Side - Image + Headline */}
      <div className="relative hidden lg:block bg-[var(--color-bg)] overflow-hidden">
        <CinemaMedia
          src="/media/arch-02.jpg"
          aspectRatio={1}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg)]/60 via-transparent to-[var(--color-bg)]/90" />
        <div className="absolute bottom-12 left-12 right-12 z-10">
          <span className="font-mono text-xs text-[var(--color-white)]/70 tracking-wider uppercase block mb-4">
            Join the Archive
          </span>
          <h1 className="font-heading font-bold text-[var(--color-white)] uppercase tracking-[-0.02em] leading-[0.95] text-[clamp(2.5rem,5vw,4rem)] max-w-xl">
            Create your professional profile
          </h1>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-8 lg:p-16 bg-[var(--color-bg)]">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <span className="font-mono text-xs tracking-[0.25em] uppercase text-[var(--color-text)]">
                FREELANCEHUB
              </span>
            </Link>
            <h1 className="font-heading font-bold text-[var(--color-text)] uppercase tracking-[-0.02em] text-[clamp(2rem,4vw,3rem)] mb-4">
              Create account
            </h1>
            <p className="font-[Instrument_Serif] italic font-light text-[var(--color-text-muted)] leading-relaxed tracking-[0.01em]">
              Join thousands of architects and designers in the archive
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              error={errors.full_name?.message}
              className="border-0 border-b border-white/30 bg-transparent px-0 py-3 text-lg placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white"
              {...register('full_name')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              className="border-0 border-b border-white/30 bg-transparent px-0 py-3 text-lg placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white"
              {...register('email')}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                error={errors.password?.message}
                rightIcon={
                  <button
                    type="button"
                    className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                }
                className="border-0 border-b border-white/30 bg-transparent px-0 py-3 pr-12 text-lg placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white"
                {...register('password')}
              />
            </div>

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.password_confirm?.message}
              className="border-0 border-b border-white/30 bg-transparent px-0 py-3 text-lg placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white"
              {...register('password_confirm')}
            />

            <div className="space-y-3">
              <label className="input-label">Role</label>
              <select
                {...register('role')}
                className="w-full border-0 border-b border-white/30 bg-transparent px-0 py-3 text-lg appearance-none text-[var(--color-text)] focus:ring-0 focus:border-white"
                aria-invalid={errors.role ? 'true' : 'false'}
              >
                <option value="freelancer">I want to find work (Freelancer)</option>
                <option value="client">I want to hire talent (Client)</option>
              </select>
              {errors.role && <p className="input-hint text-[var(--color-gray-500)]" role="alert">{errors.role.message}</p>}
            </div>

            <Button type="submit" fullWidth size="lg" loading={isLoading} className="mt-4 border border-white px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors">
              Create Account
            </Button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-[var(--color-text-muted)]">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-[var(--color-text)] hover:underline transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
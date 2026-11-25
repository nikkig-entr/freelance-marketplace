import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SparklesIcon, EyeIcon, EyeSlashIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { AuthLayout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirm: z.string().min(1, 'Please confirm your password'),
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  role: z.enum(['freelancer', 'client']),
  terms: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.password_confirm, {
  message: 'Passwords do not match',
  path: ['password_confirm'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const roleOptions = [
  {
    value: 'freelancer' as const,
    label: 'I want to find work',
    description: 'Get hired for projects, build your portfolio',
    icon: UserIcon,
  },
  {
    value: 'client' as const,
    label: 'I want to hire talent',
    description: 'Post projects, find skilled freelancers',
    icon: BuildingOfficeIcon,
  },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'freelancer',
      terms: false,
    },
  });

  const watchedRole = watch('role');

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
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card padding="lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-[var(--color-bg)]" />
            </div>
            <span className="font-heading font-bold text-xl text-[var(--color-text)]">FreelanceHub</span>
          </Link>
          <h1 className="text-2xl font-heading font-bold text-[var(--color-text)]">Create your account</h1>
          <p className="mt-2 text-[var(--color-text-muted)]">Join thousands of freelancers and clients</p>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <label className="label">I want to</label>
          <div className="grid grid-cols-2 gap-3">
            {roleOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setValue('role', option.value)}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                  ${watchedRole === option.value
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)] ring-2 ring-[var(--color-accent)]/20'
                    : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                    {watchedRole === option.value ? (
                      <div className="w-full h-full rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
                        <option.icon className="w-5 h-5 text-[var(--color-bg)]" />
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-lg bg-[var(--color-surface-muted)] flex items-center justify-center">
                        <option.icon className="w-5 h-5 text-[var(--color-text-muted)]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-text)]">{option.label}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{option.description}</p>
                  </div>
                </div>
                {watchedRole === option.value && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
                    <svg className="w-3 h-3 text-[var(--color-bg)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
          {errors.role && <p className="mt-2 text-sm text-[var(--color-error)]" role="alert">{errors.role.message}</p>}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            error={errors.full_name?.message}
            {...register('full_name')}
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
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
                  className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)]"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              }
              {...register('password')}
            />
            {watch('password') && (
              <div className="mt-2 h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
                <div
                  className="h-full bg-[var(--color-accent)] transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (watch('password').length / 16) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>

          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.password_confirm?.message}
            {...register('password_confirm')}
          />

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              className="mt-1 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]"
              {...register('terms')}
            />
            <label htmlFor="terms" className="text-sm text-[var(--color-text-muted)]">
              I agree to the{' '}
              <Link to="/terms" className="text-[var(--color-accent)] hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-[var(--color-accent)] hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.terms && <p className="text-sm text-[var(--color-error)]" role="alert">{errors.terms.message}</p>}

          <Button type="submit" fullWidth size="lg" loading={isLoading}>
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[var(--color-text-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </AuthLayout>
  );
}
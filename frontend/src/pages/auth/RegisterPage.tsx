import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthLayout } from '@/components/layout/Layout';
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
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-16">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-[var(--color-text)] rounded-none flex items-center justify-center">
              <svg className="w-6 h-6 text-[var(--color-bg)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <span className="font-heading font-bold text-xl text-[var(--color-text)]">FreelanceHub</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-[var(--color-text)]">Create account</h1>
          <p className="mt-4 text-lg text-[var(--color-text-muted)]">Join thousands of freelancers and clients</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            error={errors.full_name?.message}
            className="text-lg py-4"
            {...register('full_name')}
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            className="text-lg py-4"
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
              className="text-lg py-4 pr-12"
              {...register('password')}
            />
          </div>

          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.password_confirm?.message}
            className="text-lg py-4"
            {...register('password_confirm')}
          />

          <div className="space-y-3">
            <label className="input-label">Role</label>
            <select
              {...register('role')}
              className="input text-lg py-4 appearance-none bg-[var(--glass-bg)]"
              aria-invalid={errors.role ? 'true' : 'false'}
            >
              <option value="freelancer">I want to find work (Freelancer)</option>
              <option value="client">I want to hire talent (Client)</option>
            </select>
            {errors.role && <p className="input-hint text-[var(--color-gray-500)]" role="alert">{errors.role.message}</p>}
          </div>

          <Button type="submit" fullWidth size="xl" loading={isLoading} className="mt-4">
            Create Account
          </Button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-[var(--color-text-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
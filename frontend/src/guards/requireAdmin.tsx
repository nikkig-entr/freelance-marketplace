import { Outlet, Navigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Route guard that requires admin role.
 * Redirects to /dashboard if user is not authenticated or not an admin.
 */
export function RequireAdmin() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

/**
 * Hook version for use inside components that need admin check
 */
export function useRequireAdmin() {
  const { user, isLoading } = useAuth();

  return {
    isAdmin: !isLoading && !!user && user.role === 'admin',
    isLoading,
    user,
  };
}
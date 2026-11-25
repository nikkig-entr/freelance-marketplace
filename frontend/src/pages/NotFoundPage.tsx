import { useNavigate, useSearch } from '@tanstack/react-router';
import { HomeIcon, MagnifyingGlassIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export function NotFoundPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { q?: string };

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate({ to: '/projects' });
    } else {
      navigate({ to: '/' });
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('q') as string;
    if (query.trim()) {
      navigate({ to: '/projects', search: { q: query.trim() } });
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <span className="text-9xl font-bold text-[var(--color-accent)]/20">404</span>
        </div>

        <h1 className="text-3xl font-heading font-bold text-[var(--color-text)] mb-4">Page Not Found</h1>
        <p className="text-[var(--color-text-muted)] mb-8 max-w-sm mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleGoHome} leftIcon={<HomeIcon className="w-5 h-5" />}>
            Go to Homepage
          </Button>
          <Button variant="outline" onClick={() => window.history.back()} leftIcon={<ArrowLeftIcon className="w-5 h-5" />}>
            Go Back
          </Button>
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-[var(--color-surface-muted)]">
          <h3 className="font-medium text-[var(--color-text)] mb-4">Or try searching:</h3>
          <form onSubmit={handleSearch}>
            <div className="flex gap-2">
              <label htmlFor="search" className="sr-only">Search projects</label>
              <input
                id="search"
                name="q"
                type="search"
                placeholder="Search projects..."
                defaultValue={search.q || ''}
                className="flex-1 px-4 py-2 rounded-xl border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent text-[var(--color-text)] placeholder-[var(--color-text-subtle)] bg-[var(--color-bg)]"
              />
              <Button type="submit" leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}>
                Search
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-sm text-[var(--color-text-subtle)]">
          <p>If you think this is a mistake, <a href="mailto:support@freelancemarketplace.com" className="text-[var(--color-accent)] hover:underline">contact support</a></p>
        </div>
      </div>
    </div>
  );
}
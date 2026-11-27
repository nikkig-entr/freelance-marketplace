import { useNavigate, useSearch } from '@tanstack/react-router';
import { HomeIcon, MagnifyingGlassIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
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
          <span className="text-9xl font-bold text-white/10 font-heading">404</span>
        </div>

        <h1 className="font-heading font-bold text-[var(--color-text)] text-[clamp(2rem,4vw,3rem)] tracking-tight mb-4">Page Not Found</h1>
        <p className="text-[var(--color-text-muted)] font-[Instrument_Serif] italic mb-8 max-w-sm mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoHome}
            className="border border-white px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors flex items-center gap-2 justify-center"
          >
            <HomeIcon className="w-5 h-5" />
            Go to Homepage
          </button>
          <button
            onClick={() => window.history.back()}
            className="border border-white/15 px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors flex items-center gap-2 justify-center"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Go Back
          </button>
        </div>

        <div className="mt-12 p-6 border border-white/15">
          <h3 className="font-heading font-medium text-[var(--color-text)] mb-4">Or try searching:</h3>
          <form onSubmit={handleSearch}>
            <div className="flex gap-2">
              <label htmlFor="search" className="sr-only">Search projects</label>
              <input
                id="search"
                name="q"
                type="search"
                placeholder="Search projects..."
                defaultValue={search.q || ''}
                className="flex-1 px-4 py-3 bg-transparent border border-white/15 text-white placeholder-[var(--color-text-subtle)] focus:ring-2 focus:ring-white focus:border-transparent"
              />
              <button
                type="submit"
                className="border border-white px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors flex items-center justify-center"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-sm text-[var(--color-text-subtle)]">
          <p>If you think this is a mistake, <a href="mailto:support@freelancemarketplace.com" className="text-white hover:text-[var(--color-text-muted)] underline">contact support</a></p>
        </div>
      </div>
    </div>
  );
}
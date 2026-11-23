import { Link, useNavigate } from '@tanstack/react-router';
import { HomeIcon, MagnifyingGlassIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export function NotFoundPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' });
    } else {
      navigate({ to: '/' });
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <span className="text-9xl font-bold text-primary-500/20">404</span>
        </div>

        <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-4">Page Not Found</h1>
        <p className="text-secondary-600 mb-8 max-w-sm mx-auto">
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

        <div className="mt-12 p-6 rounded-2xl bg-secondary-50">
          <h3 className="font-medium text-secondary-900 mb-4">Or try searching:</h3>
          <form onSubmit={(e) => { e.preventDefault(); navigate({ to: '/projects', search: { q: (e.target as HTMLFormElement).elements.namedItem('q')?.value } }); }}>
            <div className="flex gap-2">
              <label htmlFor="search" className="sr-only">Search projects</label>
              <input
                id="search"
                name="q"
                type="search"
                placeholder="Search projects..."
                className="flex-1 px-4 py-2 rounded-xl border border-secondary-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900 placeholder-secondary-400"
              />
              <Button type="submit" leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}>
                Search
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-sm text-secondary-400">
          <p>If you think this is a mistake, <a href="mailto:support@freelancemarketplace.com" className="text-primary-600 hover:underline">contact support</a></p>
        </div>
      </div>
    </div>
  );
}
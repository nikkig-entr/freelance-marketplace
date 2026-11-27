import { Outlet } from '@tanstack/react-router';
import { Header } from '@/components/layout/Header';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-12 md:py-16 lg:py-20">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export { AdminLayout as default };
import { Outlet } from '@tanstack/react-router';
import { Header } from '@/components/layout/Header';

export function Layout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-[var(--color-border)] py-6 bg-[var(--color-bg-elevated)]/50">
        <div className="container">
          <p className="text-center text-sm text-[var(--color-text-muted)]">
            &copy; {new Date().getFullYear()} FreelanceHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
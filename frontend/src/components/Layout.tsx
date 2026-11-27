import { Outlet } from '@tanstack/react-router';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/sections/Footer';

export function Layout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
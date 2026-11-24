import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { clsx } from 'clsx';

export function Layout() {
  return (
    <div className="min-h-screen bg-obsidian flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto lg:ml-64">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export function SimpleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-obsidian">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-obsidian flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
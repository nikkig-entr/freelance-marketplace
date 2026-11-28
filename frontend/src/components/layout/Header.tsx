'use client';

import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useState, useEffect, useRef } from 'react';
import { XIcon } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useLenis } from '@/hooks/useLenis';

const navigation = [
  { index: '01', name: 'PROJECTS', href: '/projects', roles: ['client', 'freelancer', 'admin'] },
  { index: '02', name: 'TALENT', href: '/talent', roles: ['client', 'freelancer', 'admin'] },
  { index: '03', name: 'PRICING', href: '/pricing', roles: ['client', 'freelancer', 'admin'] },
  { index: '04', name: 'SIGN IN', href: '/login', roles: ['client', 'freelancer', 'admin'] },
];

const adminNavigation = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Users', href: '/admin/users' },
  { name: 'Projects', href: '/admin/projects' },
  { name: 'Withdrawals', href: '/admin/withdrawals' },
  { name: 'Transactions', href: '/admin/transactions' },
];

export function Header() {
  const { user, logout, isLoading } = useAuth();
  useWebSocket(); // Keep connection alive
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const lenis = useLenis();
  const scrollDirectionRef = useRef<'up' | 'down'>('down');
  const lastScrollRef = useRef(0);

  const filteredNavigation = navigation.filter((item) =>
    user ? item.roles.includes(user.role) : true
  );

  // Handle scroll state for header background
  useEffect(() => {
    if (!lenis) return;

    const handleScroll = () => {
      const currentScroll = lenis.scroll;
      const direction = currentScroll > lastScrollRef.current ? 'down' : 'up';
      scrollDirectionRef.current = direction;
      lastScrollRef.current = currentScroll;

      setIsScrolled(currentScroll > 20);
    };

    lenis.on('scroll', handleScroll);
    return () => lenis.off('scroll', handleScroll);
  }, [lenis]);

  // Sync mobile menu state with Lenis (lock scroll when open)
  useEffect(() => {
    if (!lenis) return;
    if (isMobileMenuOpen) {
      lenis.stop();
    } else {
      lenis.start();
    }
    return () => lenis.start();
  }, [isMobileMenuOpen, lenis]);

  // Handle storage change for auth sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' && !e.newValue) {
        navigate({ to: '/login' });
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/login' });
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (isLoading) {
    return (
      <header className="h-16 border-b border-white/15 bg-[var(--color-bg)]/90 backdrop-blur-[var(--glass-blur)] fixed top-0 left-0 right-0 z-40">
        <div className="container h-full flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/15 border-t-white animate-spin" />
        </div>
      </header>
    );
  }

  return (
    <header
      className={`h-16 border-b fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[var(--color-bg)]/95 backdrop-blur-[var(--glass-blur-strong)] border-[var(--color-border)] shadow-[var(--shadow-md)]'
          : 'bg-[var(--color-bg)]/60 backdrop-blur-[var(--glass-blur)] border-[var(--color-border)]'
      }`}
      style={{ willChange: 'transform, box-shadow' }}
    >
      <div className="container h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left: BrandLogo + FREELANCEHUB wordmark */}
          <Link
            to="/"
            className="flex items-center gap-3 shrink-0"
            aria-label="FREELANCEHUB Home"
            onClick={closeMobileMenu}
          >
            <BrandLogo size={32} strokeWidth={2} />
            <span className="font-mono text-xs font-bold tracking-[0.28em] uppercase text-[var(--color-text)] select-none">
              FREELANCEHUB
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation" role="navigation">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-[0.22em] transition-all duration-200 ${
                    isActive
                      ? 'text-[var(--color-text)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={closeMobileMenu}
                >
                  <span className="text-[var(--color-text-subtle)] w-8 text-right select-none">{item.index}</span>
                  <span className="relative z-10">{item.name}</span>
                  {/* Active indicator - hairline underline */}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-4 right-4 h-px bg-[var(--color-white)] transform scale-x-0 transition-transform duration-300 ease-out"
                      style={{ transformOrigin: 'center' }}
                    />
                  )}
                </Link>
              );
            })}

            {user?.role === 'admin' && (
              <div className="flex items-center gap-1 border-l border-[var(--color-border)] pl-4 ml-2">
                <span className="text-xs font-semibold text-[var(--color-text-subtle)] uppercase tracking-wider px-2 select-none">Admin</span>
                {adminNavigation.map((item) => {
                  const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-[var(--color-text)] bg-[var(--glass-bg-strong)]'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)]'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={closeMobileMenu}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Start Project CTA - Sharp rectangular button */}
            {((user && (user.role === 'client' || user.role === 'admin')) || !user) && (
              <Link
                to={user ? '/projects/create' : '/register'}
                className="ml-2 border border-[var(--color-white)] px-5 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-text)] hover:bg-[var(--color-white)] hover:text-[var(--color-bg)] transition-all duration-200 min-h-[44px] flex items-center justify-center"
                onClick={closeMobileMenu}
              >
                START PROJECT
              </Link>
            )}
          </nav>

          {/* Right Side Actions - User Menu / Mobile Toggle */}
          <div className="flex items-center gap-2">
            {/* User Menu - Desktop */}
            {user ? (
              <div className="relative" id="user-menu-trigger">
                <button
                  className="flex items-center gap-2 p-1.5 hover:bg-[var(--glass-bg)] transition-colors min-h-[44px] min-w-[44px] rounded-none"
                  aria-label="User menu"
                  aria-expanded="false"
                  aria-haspopup="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    const menu = document.getElementById('user-dropdown');
                    if (menu) menu.classList.toggle('hidden');
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--glass-bg-strong)] flex items-center justify-center border border-[var(--glass-border)] overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-8 h-8 object-cover" />
                    ) : (
                      <svg className="w-5 h-5 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-[var(--color-text)] max-w-[160px] truncate">
                    {user.full_name || user.email}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div
                  id="user-dropdown"
                  className="hidden absolute right-0 top-full mt-2 w-56 glass-card z-50 py-2 animate-in"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <Link
                    to="/profile/$userId"
                    params={{ userId: user.id.toString() }}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)] transition-colors"
                    role="menuitem"
                    onClick={closeMobileMenu}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)] transition-colors"
                    role="menuitem"
                    onClick={closeMobileMenu}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Settings
                  </Link>
                  {user.role === 'admin' && (
                    <>
                      <div className="border-t border-[var(--glass-border)] my-2" />
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)] transition-colors"
                        role="menuitem"
                        onClick={closeMobileMenu}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                        Admin Panel
                      </Link>
                    </>
                  )}
                  <div className="border-t border-[var(--glass-border)] my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)] transition-colors text-left"
                    role="menuitem"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/register"
                className="hidden sm:inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] border border-[var(--color-white)] bg-[var(--color-white)] text-[var(--color-bg)] hover:bg-[var(--color-gray-100)] transition-colors"
                onClick={closeMobileMenu}
              >
                Get Started
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-drawer"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? (
                <XIcon className="w-6 h-6" strokeWidth={2} />
              ) : (
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] flex items-center gap-1.5 border border-[var(--color-border)] px-3 min-h-[44px]">
                  MENU
                  <span className="text-[var(--color-text-subtle)]">[</span>
                  <span className="text-[var(--color-text)]">+</span>
                  <span className="text-[var(--color-text-subtle)]">]</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Fullscreen Swiss Drawer */}
      {isMobileMenuOpen && (
        <div
          id="mobile-drawer"
          className="md:hidden fixed inset-0 z-50 bg-[var(--color-bg)] animate-in"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="flex flex-col h-full">
            {/* Drawer Header */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-[var(--color-border)]">
              <Link to="/" className="flex items-center gap-3" onClick={closeMobileMenu}>
                <BrandLogo size={28} strokeWidth={2} />
                <span className="font-mono text-xs font-bold tracking-[0.28em] uppercase text-[var(--color-text)] select-none">FREELANCEHUB</span>
              </Link>
              <button
                onClick={closeMobileMenu}
                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)] transition-colors min-h-[44px] min-w-[44px] rounded-none"
                aria-label="Close menu"
              >
                <XIcon className="w-6 h-6" strokeWidth={2} />
              </button>
            </div>

            {/* Drawer Navigation */}
            <nav className="flex-1 overflow-y-auto px-6 py-6 space-y-1" aria-label="Mobile navigation">
              {filteredNavigation.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-4 px-4 py-5 rounded-none text-base font-mono uppercase tracking-[0.22em] transition-colors ${
                      isActive
                        ? 'text-[var(--color-text)] bg-[var(--glass-bg-strong)]'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)]'
                    }`}
                    onClick={closeMobileMenu}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="text-[var(--color-text-subtle)] w-8 text-right select-none">{item.index}</span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {user?.role === 'admin' && (
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <span className="px-4 text-xs font-semibold text-[var(--color-text-subtle)] uppercase tracking-wider block mb-3 select-none">Admin</span>
                  {adminNavigation.map((item) => {
                    const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center gap-3 px-4 py-4 rounded-none text-base font-medium transition-colors ${
                          isActive
                            ? 'text-[var(--color-text)] bg-[var(--glass-bg-strong)]'
                            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)]'
                        }`}
                        onClick={closeMobileMenu}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}

              {user && (
                <div className="pt-6 border-t border-[var(--color-border)]">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-none text-base font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)] transition-colors min-h-[44px]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Sign out
                  </button>
                </div>
              )}
            </nav>

            {/* Drawer Footer - CTA for non-authenticated */}
            {!user && (
              <div className="p-6 border-t border-[var(--color-border)] space-y-3">
                <Link to="/register" onClick={closeMobileMenu}>
                  <button className="w-full min-h-[56px] px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] border border-[var(--color-white)] bg-[var(--color-white)] text-[var(--color-bg)] hover:bg-[var(--color-gray-100)] transition-colors">
                    Get Started
                  </button>
                </Link>
                <Link to="/login" onClick={closeMobileMenu}>
                  <button className="w-full min-h-[56px] px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--glass-bg)] hover:border-[var(--color-border-hover)] transition-colors">
                    Sign in
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Close dropdown on outside click */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              document.addEventListener('click', function(e) {
                const dropdown = document.getElementById('user-dropdown');
                const trigger = document.getElementById('user-menu-trigger');
                if (dropdown && trigger && !trigger.contains(e.target)) {
                  dropdown.classList.add('hidden');
                }
              });
            })();
          `,
        }}
      />
    </header>
  );
}

export { Header as default };
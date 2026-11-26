'use client';

import { Link, useLocation } from '@tanstack/react-router';
import { clsx } from 'clsx';

const footerColumns = [
  {
    title: 'Platform',
    links: [
      { name: 'Projects', href: '/projects', index: '01' },
      { name: 'Talent', href: '/talent', index: '02' },
      { name: 'AI Tools', href: '/ai-tools', index: '03' },
      { name: 'Pricing', href: '/pricing', index: '04' },
    ],
  },
  {
    title: 'Freelancers',
    links: [
      { name: 'Find Projects', href: '/projects', index: '01' },
      { name: 'Create Profile', href: '/register?role=freelancer', index: '02' },
      { name: 'How It Works', href: '/how-it-works', index: '03' },
    ],
  },
  {
    title: 'Clients',
    links: [
      { name: 'Post a Project', href: '/projects/create', index: '01' },
      { name: 'Hire Talent', href: '/talent', index: '02' },
      { name: 'Enterprise', href: '/enterprise', index: '03' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About', href: '/about', index: '01' },
      { name: 'Blog', href: '/blog', index: '02' },
      { name: 'Contact', href: '/contact', index: '03' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy', href: '/privacy', index: '01' },
      { name: 'Terms', href: '/terms', index: '02' },
      { name: 'Security', href: '/security', index: '03' },
    ],
  },
];

export function Footer() {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="container py-12 lg:py-16">
        {/* Main Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h4 className="font-heading font-medium text-[var(--color-text)] mb-6 tracking-[-0.01em]">
                {column.title}
              </h4>
              <ul className="space-y-3">
                {column.links.map((link) => {
                  const isActive = location.pathname === link.href || location.pathname.startsWith(link.href + '/');
                  return (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className={clsx(
                          'flex items-center gap-3 text-sm font-medium transition-colors duration-200',
                          isActive ? 'text-[var(--color-white)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-white)]'
                        )}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span className="font-mono text-[var(--color-text-subtle)] text-xs tracking-wider w-8 shrink-0">
                          {link.index}
                        </span>
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--color-border)] my-12" />

        {/* Bottom Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <div className="text-center lg:text-left">
            <p className="text-sm text-[var(--color-text-subtle)]">
              &copy; {currentYear} FreelanceHub. All rights reserved.
            </p>
          </div>

          {/* Version */}
          <div className="text-center lg:text-right">
            <p className="text-xs font-mono text-[var(--color-text-subtle)] tracking-wider uppercase">
              v2.5.0
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer as default };
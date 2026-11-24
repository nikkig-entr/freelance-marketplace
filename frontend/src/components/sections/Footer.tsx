import { Link } from 'react-router-dom';
import { SparklesIcon, GlobeAltIcon, EnvelopeIcon, ShieldCheckIcon, ChatBubbleLeftRightIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Briefcase, Code, Palette, Users, Cpu, Shield, Globe, Zap, Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Inline SVG components for social icons not available in lucide-react
function LinkedinIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function GithubIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

const footerLinks = {
  product: [
    { name: 'Projects', href: '/projects' },
    { name: 'Talent', href: '/talent' },
    { name: 'AI Tools', href: '/ai-tools' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Categories', href: '/categories' },
  ],
  freelancers: [
    { name: 'Find Projects', href: '/projects' },
    { name: 'Create Profile', href: '/register?role=freelancer' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Success Stories', href: '/stories' },
    { name: 'Community Forum', href: '/community' },
  ],
  clients: [
    { name: 'Post a Project', href: '/projects/create' },
    { name: 'Hire Freelancers', href: '/talent' },
    { name: 'Enterprise', href: '/enterprise' },
    { name: 'Managed Services', href: '/managed' },
    { name: 'Case Studies', href: '/case-studies' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Blog', href: '/blog' },
    { name: 'Press', href: '/press' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Security', href: '/security' },
    { name: 'Accessibility', href: '/accessibility' },
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Safety Guidelines', href: '/safety' },
    { name: 'Dispute Resolution', href: '/disputes' },
    { name: 'API Docs', href: '/api-docs' },
    { name: 'Status', href: '/status' },
  ],
};

const socialLinks = [
  { name: 'X', href: 'https://x.com/freelancehub', icon: X },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/freelancehub', icon: LinkedinIcon },
  { name: 'GitHub', href: 'https://github.com/freelancehub', icon: GithubIcon },
  { name: 'Discord', href: 'https://discord.gg/freelancehub', icon: Mail },
];

const trustBadges = [
  { name: 'Secure Payments', icon: ShieldCheckIcon, desc: 'Escrow protection on every project' },
  { name: 'Verified Talent', icon: UserGroupIcon, desc: 'Identity-verified freelancers' },
  { name: '24/7 Support', icon: ChatBubbleLeftRightIcon, desc: 'Round-the-clock assistance' },
  { name: 'Global Reach', icon: GlobeAltIcon, desc: '120+ countries represented' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/[0.06]">
      {/* Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-amber/2 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-teal/2 blur-3xl" />
      </div>

      <div className="container py-16 lg:py-24">
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 lg:gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2 xl:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6" aria-label="FreelanceHub Home">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber to-amber-400 flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-obsidian" />
              </div>
              <span className="font-heading font-bold text-xl text-cream">FreelanceHub</span>
            </Link>
            <p className="text-muted max-w-xs mb-8 leading-relaxed">
              The modern freelance marketplace connecting talented professionals with great clients worldwide.
              Secure payments, AI tools, and zero hassle.
            </p>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {trustBadges.map((badge) => (
                <div key={badge.name} className="flex items-start gap-3 p-3 glass-subtle rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center flex-shrink-0">
                    <badge.icon className="w-4 h-4 text-amber" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-cream">{badge.name}</p>
                    <p className="text-xs text-muted mt-0.5">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="w-10 h-10 rounded-xl glass-card-hover flex items-center justify-center text-muted transition-all duration-300"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product */}
          <nav aria-label="Product">
            <h4 className="font-semibold text-cream mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-muted hover:text-amber transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Freelancers */}
          <nav aria-label="For Freelancers">
            <h4 className="font-semibold text-cream mb-4">For Freelancers</h4>
            <ul className="space-y-3">
              {footerLinks.freelancers.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-muted hover:text-amber transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Clients */}
          <nav aria-label="For Clients">
            <h4 className="font-semibold text-cream mb-4">For Clients</h4>
            <ul className="space-y-3">
              {footerLinks.clients.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-muted hover:text-amber transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company">
            <h4 className="font-semibold text-cream mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-muted hover:text-amber transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Legal">
            <h4 className="font-semibold text-cream mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-muted hover:text-amber transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.06] mb-8" />

        {/* Bottom Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-between gap-4 text-center sm:text-left">
            <p className="text-sm text-muted">
              &copy; {currentYear} FreelanceHub. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-muted/70">
              <span>Made with <span className="text-amber">♥</span> for freelancers worldwide</span>
              <span>v2.4.0</span>
            </div>
          </div>

          {/* Newsletter */}
          <div className="w-full lg:w-96">
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <EnvelopeIcon className="w-6 h-6 text-amber" />
                <div>
                  <p className="font-medium text-cream">Stay Updated</p>
                  <p className="text-sm text-muted">Get the latest freelance tips, platform updates, and success stories.</p>
                </div>
              </div>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 input"
                  aria-label="Email address"
                />
                <Button variant="primary" size="md" type="submit">
                  Subscribe
                </Button>
              </form>
              <p className="text-xs text-muted/60 mt-3 text-center">
                No spam. Unsubscribe anytime. <Link to="/privacy" className="text-amber hover:underline">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
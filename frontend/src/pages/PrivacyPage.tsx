import { Link } from '@tanstack/react-router';
import { SparklesIcon } from '@heroicons/react/24/outline';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 mb-8 text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors">
            <div className="w-10 h-10 border border-white/15 flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-[var(--color-text)]">FreelanceHub</span>
          </Link>
          <h1 className="font-heading font-bold text-[var(--color-text)] text-[clamp(2rem,4vw,3rem)] tracking-tight mb-6">Privacy Policy</h1>
          <div className="space-y-6 text-[var(--color-text-muted)] font-[Instrument_Serif] leading-relaxed">
            <p className="font-mono text-xs text-[var(--color-text-subtle)]">Last updated: November 2026</p>
            <p>Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use FreelanceHub.</p>
            <div className="space-y-3 pt-4 border-t border-white/15">
              <h2 className="font-heading font-semibold text-[var(--color-text)] text-xl">Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, post a project, or contact us.</p>
            </div>
            <div className="space-y-3 pt-4 border-t border-white/15">
              <h2 className="font-heading font-semibold text-[var(--color-text)] text-xl">How We Use Your Information</h2>
              <p>We use the information to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
            </div>
            <div className="space-y-3 pt-4 border-t border-white/15">
              <h2 className="font-heading font-semibold text-[var(--color-text)] text-xl">Data Security</h2>
              <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
            </div>
            <div className="space-y-3 pt-4 border-t border-white/15">
              <h2 className="font-heading font-semibold text-[var(--color-text)] text-xl">Your Rights</h2>
              <p>You have the right to access, update, or delete your personal information. You can do this through your account settings or by contacting us.</p>
            </div>
            <div className="space-y-3 pt-4 border-t border-white/15">
              <h2 className="font-heading font-semibold text-[var(--color-text)] text-xl">Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us at privacy@freelancehub.com</p>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Link to="/" className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)] hover:text-white transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
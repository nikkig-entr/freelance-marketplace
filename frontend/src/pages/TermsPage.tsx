import { Link } from '@tanstack/react-router';
import { SparklesIcon } from '@heroicons/react/24/outline';

export function TermsPage() {
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
          <h1 className="font-heading font-bold text-[var(--color-text)] text-[clamp(2rem,4vw,3rem)] tracking-tight mb-6">Terms of Service</h1>
          <div className="space-y-6 text-[var(--color-text-muted)] font-[Instrument_Serif] leading-relaxed">
            <p className="font-mono text-xs text-[var(--color-text-subtle)]">Last updated: November 2026</p>
            <p>By accessing or using FreelanceHub, you agree to be bound by these Terms of Service.</p>
            <div className="space-y-3 pt-4 border-t border-white/15">
              <h2 className="font-heading font-semibold text-[var(--color-text)] text-xl">1. Acceptance of Terms</h2>
              <p>By creating an account or using our services, you agree to these Terms and our Privacy Policy.</p>
            </div>
            <div className="space-y-3 pt-4 border-t border-white/15">
              <h2 className="font-heading font-semibold text-[var(--color-text)] text-xl">2. User Accounts</h2>
              <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
            </div>
            <div className="space-y-3 pt-4 border-t border-white/15">
              <h2 className="font-heading font-semibold text-[var(--color-text)] text-xl">3. Projects and Bids</h2>
              <p>Clients can post projects and freelancers can submit bids. All interactions should be conducted through our platform.</p>
            </div>
            <div className="space-y-3 pt-4 border-t border-white/15">
              <h2 className="font-heading font-semibold text-[var(--color-text)] text-xl">4. Payments and Fees</h2>
              <p>Platform fees apply to completed projects. Payments are processed securely through our payment partners.</p>
            </div>
            <div className="space-y-3 pt-4 border-t border-white/15">
              <h2 className="font-heading font-semibold text-[var(--color-text)] text-xl">5. Intellectual Property</h2>
              <p>You retain ownership of your work. By submitting work, you grant the client a license to use it as agreed.</p>
            </div>
            <div className="space-y-3 pt-4 border-t border-white/15">
              <h2 className="font-heading font-semibold text-[var(--color-text)] text-xl">6. Dispute Resolution</h2>
              <p>We provide a dispute resolution process for conflicts between clients and freelancers.</p>
            </div>
            <div className="space-y-3 pt-4 border-t border-white/15">
              <h2 className="font-heading font-semibold text-[var(--color-text)] text-xl">7. Termination</h2>
              <p>We may suspend or terminate accounts that violate these Terms.</p>
            </div>
            <div className="space-y-3 pt-4 border-t border-white/15">
              <h2 className="font-heading font-semibold text-[var(--color-text)] text-xl">8. Limitation of Liability</h2>
              <p>FreelanceHub is not liable for indirect, incidental, or consequential damages.</p>
            </div>
            <div className="space-y-3 pt-4 border-t border-white/15">
              <h2 className="font-heading font-semibold text-[var(--color-text)] text-xl">Contact Us</h2>
              <p>If you have questions about these Terms, please contact us at legal@freelancehub.com</p>
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
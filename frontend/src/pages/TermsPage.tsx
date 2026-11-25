import { Link } from '@tanstack/react-router';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { AuthLayout } from '@/components/layout/Layout';

export function TermsPage() {
  return (
    <AuthLayout>
      <Card padding="lg" className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-[var(--color-bg)]" />
          </div>
          <span className="font-heading font-bold text-xl text-[var(--color-text)]">FreelanceHub</span>
        </Link>
        <h1 className="text-3xl font-heading font-bold text-[var(--color-text)] mb-6">Terms of Service</h1>
        <div className="prose prose-invert max-w-none text-[var(--color-text-muted)] space-y-4">
          <p>Last updated: November 2026</p>
          <p>By accessing or using FreelanceHub, you agree to be bound by these Terms of Service.</p>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">1. Acceptance of Terms</h2>
          <p>By creating an account or using our services, you agree to these Terms and our Privacy Policy.</p>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">2. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">3. Projects and Bids</h2>
          <p>Clients can post projects and freelancers can submit bids. All interactions should be conducted through our platform.</p>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">4. Payments and Fees</h2>
          <p>Platform fees apply to completed projects. Payments are processed securely through our payment partners.</p>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">5. Intellectual Property</h2>
          <p>You retain ownership of your work. By submitting work, you grant the client a license to use it as agreed.</p>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">6. Dispute Resolution</h2>
          <p>We provide a dispute resolution process for conflicts between clients and freelancers.</p>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">7. Termination</h2>
          <p>We may suspend or terminate accounts that violate these Terms.</p>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">8. Limitation of Liability</h2>
          <p>FreelanceHub is not liable for indirect, incidental, or consequential damages.</p>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Contact Us</h2>
          <p>If you have questions about these Terms, please contact us at legal@freelancehub.com</p>
        </div>
        <div className="mt-8 text-center">
          <Link to="/" className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">Back to Home</Link>
        </div>
      </Card>
    </AuthLayout>
  );
}
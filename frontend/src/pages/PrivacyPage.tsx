import { Link } from '@tanstack/react-router';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { AuthLayout } from '@/components/layout/Layout';

export function PrivacyPage() {
  return (
    <AuthLayout>
      <Card padding="lg" className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-[var(--color-bg)]" />
          </div>
          <span className="font-heading font-bold text-xl text-[var(--color-text)]">FreelanceHub</span>
        </Link>
        <h1 className="text-3xl font-heading font-bold text-[var(--color-text)] mb-6">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none text-[var(--color-text-muted)] space-y-4">
          <p>Last updated: November 2026</p>
          <p>Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use FreelanceHub.</p>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, post a project, or contact us.</p>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">How We Use Your Information</h2>
          <p>We use the information to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Your Rights</h2>
          <p>You have the right to access, update, or delete your personal information. You can do this through your account settings or by contacting us.</p>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at privacy@freelancehub.com</p>
        </div>
        <div className="mt-8 text-center">
          <Link to="/" className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">Back to Home</Link>
        </div>
      </Card>
    </AuthLayout>
  );
}
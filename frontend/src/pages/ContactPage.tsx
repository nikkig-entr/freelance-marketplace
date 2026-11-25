import { Link } from '@tanstack/react-router';
import { SparklesIcon, EnvelopeIcon, ChatBubbleLeftRightIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { AuthLayout } from '@/components/layout/Layout';

export function ContactPage() {
  return (
    <AuthLayout>
      <Card padding="lg" className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-[var(--color-bg)]" />
          </div>
          <span className="font-heading font-bold text-xl text-[var(--color-text)]">FreelanceHub</span>
        </Link>
        <h1 className="text-3xl font-heading font-bold text-[var(--color-text)] mb-2">Contact Us</h1>
        <p className="text-[var(--color-text-muted)] mb-8">We'd love to hear from you. Reach out through any of the channels below.</p>
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
            <div className="w-12 h-12 bg-[var(--color-accent-muted)] rounded-lg flex items-center justify-center">
              <EnvelopeIcon className="w-6 h-6 text-[var(--color-accent)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-text)]">Email Support</h3>
              <p className="text-[var(--color-text-muted)]">support@freelancehub.com</p>
              <p className="text-sm text-[var(--color-text-subtle)]">Response within 24 hours</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
            <div className="w-12 h-12 bg-[var(--color-accent-muted)] rounded-lg flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-[var(--color-accent)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-text)]">Live Chat</h3>
              <p className="text-[var(--color-text-muted)]">Available in-app</p>
              <p className="text-sm text-[var(--color-text-subtle)]">Mon-Fri, 9am-6pm UTC</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
            <div className="w-12 h-12 bg-[var(--color-accent-muted)] rounded-lg flex items-center justify-center">
              <GlobeAltIcon className="w-6 h-6 text-[var(--color-accent)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-text)]">Help Center</h3>
              <p className="text-[var(--color-text-muted)]">help.freelancehub.com</p>
              <p className="text-sm text-[var(--color-text-subtle)]">Articles and FAQs</p>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link to="/" className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">Back to Home</Link>
        </div>
      </Card>
    </AuthLayout>
  );
}
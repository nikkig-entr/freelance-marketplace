import { Link } from '@tanstack/react-router';
import { SparklesIcon, EnvelopeIcon, ChatBubbleLeftRightIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export function ContactPage() {
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
          <h1 className="font-heading font-bold text-[var(--color-text)] text-[clamp(2rem,4vw,3rem)] tracking-tight mb-2">Contact Us</h1>
          <p className="text-[var(--color-text-muted)] font-[Instrument_Serif] italic mb-8">We'd love to hear from you. Reach out through any of the channels below.</p>
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-6 border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all duration-300">
              <div className="w-12 h-12 border border-white/15 flex items-center justify-center flex-shrink-0">
                <EnvelopeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-[var(--color-text)]">Email Support</h3>
                <p className="text-[var(--color-text-muted)]">support@freelancehub.com</p>
                <p className="font-mono text-xs text-[var(--color-text-subtle)]">Response within 24 hours</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all duration-300">
              <div className="w-12 h-12 border border-white/15 flex items-center justify-center flex-shrink-0">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-[var(--color-text)]">Live Chat</h3>
                <p className="text-[var(--color-text-muted)]">Available in-app</p>
                <p className="font-mono text-xs text-[var(--color-text-subtle)]">Mon-Fri, 9am-6pm UTC</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all duration-300">
              <div className="w-12 h-12 border border-white/15 flex items-center justify-center flex-shrink-0">
                <GlobeAltIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-[var(--color-text)]">Help Center</h3>
                <p className="text-[var(--color-text-muted)]">help.freelancehub.com</p>
                <p className="font-mono text-xs text-[var(--color-text-subtle)]">Articles and FAQs</p>
              </div>
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
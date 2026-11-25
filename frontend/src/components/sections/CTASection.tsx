import { Link } from '@tanstack/react-router';
import { ArrowRightIcon, CheckIcon, ShieldCheckIcon, SparklesIcon, UserGroupIcon, BoltIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AmbientBackground } from '@/components/ui/AmbientBackground';

const ctaBenefits = [
  { icon: CheckIcon, text: 'Free to join — no credit card required' },
  { icon: CheckIcon, text: '14-day Pro trial included' },
  { icon: CheckIcon, text: 'Cancel anytime, no questions asked' },
  { icon: CheckIcon, text: 'Access to 37,000+ active projects' },
  { icon: ShieldCheckIcon, text: 'Secure escrow payment protection' },
  { icon: SparklesIcon, text: 'AI tools for Pro & Agency plans' },
  { icon: UserGroupIcon, text: 'Join 50K+ professionals worldwide' },
  { icon: BoltIcon, text: 'Instant profile setup in minutes' },
];

export function CTASection() {
  return (
    <section className="section">
      <AmbientBackground size="lg" opacity="strong">
        <div className="container">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center max-w-5xl mx-auto">
          {/* Left side - Content */}
          <div className="text-center lg:text-left">
            <Badge variant="primary" size="md" className="mb-6 inline-flex" dot>
              <SparklesIcon className="w-3.5 h-3.5" />
              Start Free Today — 14-Day Pro Trial
            </Badge>
            <h2 className="text-headline-1 text-[var(--color-text)] leading-tight">
              Ready to Build Your <span className="text-gradient-accent">Freelance Career?</span>
            </h2>
            <p className="mt-6 text-body-lg text-[var(--color-text-muted)] max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Join thousands of freelancers and clients who trust FreelanceHub. Create your profile,
              browse projects, and start earning — all in minutes.
            </p>

            {/* Benefits - Clean List */}
            <div className="mt-10 space-y-3 max-w-xl mx-auto lg:mx-0">
              {ctaBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 text-[var(--color-text-muted)]">
                  <div className="w-5 h-5 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <benefit.icon className="w-3 h-3 text-[var(--color-accent)]" />
                  </div>
                  <span className="text-base">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button size="lg" variant="primary" asChild className="w-full sm:w-auto px-8 py-4">
                <Link to="/register">
                  Create Free Account
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="w-full sm:w-auto px-8 py-4">
                <Link to="/projects">
                  Browse Projects First
                </Link>
              </Button>
            </div>

            {/* Trust indicators - Minimal */}
            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-[var(--color-text-subtle)]">
              <span className="flex items-center gap-1.5">
                <ShieldCheckIcon className="w-4 h-4 text-[var(--color-accent)]" />
                Secure & Verified
              </span>
              <span className="flex items-center gap-1.5">
                <SparklesIcon className="w-4 h-4 text-[var(--color-accent)]" />
                AI-Powered Tools
              </span>
              <span className="flex items-center gap-1.5">
                <UserGroupIcon className="w-4 h-4 text-[var(--color-accent)]" />
                50K+ Members
              </span>
              <span className="flex items-center gap-1.5">
                <GlobeAltIcon className="w-4 h-4 text-[var(--color-accent)]" />
                120+ Countries
              </span>
            </div>
          </div>

          {/* Right side - Visual Preview */}
          <div className="relative mt-12 lg:mt-0">
            <div className="relative max-w-lg mx-auto">
              {/* Main preview card */}
              <div className="glass-card rounded-3xl overflow-hidden border border-[var(--color-border)]">
                {/* Top bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)]">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <div className="flex-1 text-center text-xs text-[var(--color-text-subtle)] font-mono">dashboard.freelancehub.com</div>
                </div>
                {/* Dashboard preview */}
                <div className="p-6 space-y-5">
                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: 'Active Bids', value: '3/50', color: 'text-[var(--color-accent)]' },
                      { label: 'Earnings', value: '$2,847', color: 'text-[var(--color-text)]' },
                      { label: 'Rating', value: '4.9★', color: 'text-[var(--color-text)]' },
                      { label: 'Projects', value: '12', color: 'text-[var(--color-text)]' },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center p-4 glass-subtle rounded-xl">
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-[var(--color-text-subtle)] mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Recent activity */}
                  <div className="space-y-3 pt-4 border-t border-[var(--color-border)]">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--color-text-muted)]">Recent Activity</span>
                      <span className="text-xs text-[var(--color-text-subtle)]">This Week</span>
                    </div>
                    {[
                      { project: 'React Dashboard Redesign', status: 'Interviewing' },
                      { project: 'Mobile App - Fitness Tracker', status: 'Submitted' },
                      { project: 'E-commerce API Integration', status: 'Hired' },
                      { project: 'Brand Identity Package', status: 'New Match' },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center justify-between p-3 glass-subtle rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg glass flex items-center justify-center">
                            <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[var(--color-text)]">{activity.project}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">{activity.status}</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full glass text-[var(--color-text-muted)]">
                          {activity.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* AI suggestion */}
                  <div className="pt-4 border-t border-[var(--color-border)]">
                    <div className="flex items-center gap-3 p-4 bg-[var(--color-accent-muted)] border border-[var(--color-accent)]/30 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/20 flex items-center justify-center">
                        <SparklesIcon className="w-5 h-5 text-[var(--color-accent)]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[var(--color-text)]">AI Suggestion</p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">3 new projects match your skills. <span className="text-[var(--color-accent)]">View matches →</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating cards - Minimal */}
              <div className="absolute -top-4 -right-4 w-56">
                <div className="glass-card p-4">
                  <p className="text-xs text-[var(--color-text-subtle)] mb-1 tracking-wide">WEEKLY PROGRESS</p>
                  <p className="text-3xl font-extrabold text-[var(--color-text)]">78%</p>
                  <p className="text-xs text-[var(--color-text-subtle)]">Bid limit used</p>
                  <div className="mt-3 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--color-accent)] rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 -left-4 w-48">
                <div className="glass-card p-4">
                  <p className="text-xs text-[var(--color-text-subtle)] mb-1 tracking-wide">AI PROPOSALS</p>
                  <p className="text-3xl font-extrabold text-[var(--color-text)]">12/50</p>
                  <p className="text-xs text-[var(--color-text-subtle)]">Used this month</p>
                  <div className="mt-3 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--color-gray-600)] rounded-full" style={{ width: '24%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </AmbientBackground>
    </section>
  );
}
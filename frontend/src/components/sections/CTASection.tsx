import { Link } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon, ShieldCheckIcon, SparklesIcon, UserGroupIcon, BoltIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

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
    <section className="section relative">
      {/* Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian/50 to-obsidian" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-amber/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-teal/5 blur-3xl" />
        <div className="absolute inset-0 bg-[url('/media/placeholders/pattern.svg')] opacity-[0.02]" />
      </div>

      <div className="container relative">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center max-w-5xl mx-auto">
          {/* Left side - Content */}
          <div className="text-center lg:text-left">
            <Badge variant="primary" size="lg" className="mb-6 inline-flex" dot dotColor="#2DD4BF">
              <SparklesIcon className="w-4 h-4" />
              Start Free Today — 14-Day Pro Trial
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-cream tracking-tight leading-tight">
              Ready to Build Your <span className="text-gradient">Freelance Career?</span>
            </h2>
            <p className="mt-6 text-lg sm:text-xl text-muted/90 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Join thousands of freelancers and clients who trust FreelanceHub. Create your profile,
              browse projects, and start earning — all in minutes.
            </p>

            {/* Benefits */}
            <div className="mt-10 space-y-3 max-w-xl mx-auto lg:mx-0">
              {ctaBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 text-muted/90">
                  <div className="w-6 h-6 rounded-full bg-teal/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <benefit.icon className="w-3.5 h-3.5 text-teal" />
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

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-muted/70">
              <span className="flex items-center gap-1.5">
                <ShieldCheckIcon className="w-4 h-4 text-amber" />
                Secure & Verified
              </span>
              <span className="flex items-center gap-1.5">
                <SparklesIcon className="w-4 h-4 text-teal" />
                AI-Powered Tools
              </span>
              <span className="flex items-center gap-1.5">
                <UserGroupIcon className="w-4 h-4 text-amber" />
                50K+ Members
              </span>
              <span className="flex items-center gap-1.5">
                <GlobeAltIcon className="w-4 h-4 text-teal" />
                120+ Countries
              </span>
            </div>
          </div>

          {/* Right side - Visual Preview */}
          <div className="relative mt-12 lg:mt-0">
            <div className="relative max-w-lg mx-auto">
              {/* Main preview card */}
              <div className="glass-card rounded-3xl overflow-hidden shadow-2xl border border-white/[0.1]">
                {/* Top bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <div className="flex-1 text-center text-xs text-muted/50 font-mono">dashboard.freelancehub.com</div>
                </div>
                {/* Dashboard preview */}
                <div className="p-6 space-y-5">
                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: 'Active Bids', value: '3/50', color: 'text-amber' },
                      { label: 'Earnings', value: '$2,847', color: 'text-teal' },
                      { label: 'Rating', value: '4.9★', color: 'text-yellow-400' },
                      { label: 'Projects', value: '12', color: 'text-purple-400' },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center p-4 glass-subtle rounded-xl">
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-muted mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Recent activity */}
                  <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">Recent Activity</span>
                      <span className="text-xs text-muted/50">This Week</span>
                    </div>
                    {[
                      { project: 'React Dashboard Redesign', status: 'Interviewing', color: 'text-blue-400', bg: 'bg-blue-500/20' },
                      { project: 'Mobile App - Fitness Tracker', status: 'Submitted', color: 'text-amber', bg: 'bg-amber/20' },
                      { project: 'E-commerce API Integration', status: 'Hired', color: 'text-teal', bg: 'bg-teal/20' },
                      { project: 'Brand Identity Package', status: 'New Match', color: 'text-purple-400', bg: 'bg-purple-500/20' },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center justify-between p-3 glass-subtle rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-white/[0.03] flex items-center justify-center">
                            <svg className="w-4 h-4 text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-cream">{activity.project}</p>
                            <p className="text-xs text-muted">{activity.status}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${activity.bg} ${activity.color}`}>
                          {activity.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* AI suggestion */}
                  <div className="pt-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3 p-4 bg-amber/10 border border-amber/20 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-amber/20 flex items-center justify-center">
                        <SparklesIcon className="w-5 h-5 text-amber" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-cream">AI Suggestion</p>
                        <p className="text-xs text-muted mt-0.5">3 new projects match your skills. <span className="text-amber">View matches →</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute -top-4 -right-4 w-56">
                <div className="glass-card p-4 shadow-xl">
                  <p className="text-xs text-muted mb-1">WEEKLY PROGRESS</p>
                  <p className="text-3xl font-bold text-cream">78%</p>
                  <p className="text-xs text-muted">Bid limit used</p>
                  <div className="mt-3 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                    <div className="h-full bg-amber rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 -left-4 w-48">
                <div className="glass-card p-4 shadow-xl">
                  <p className="text-xs text-muted mb-1">AI PROPOSALS</p>
                  <p className="text-3xl font-bold text-cream">12/50</p>
                  <p className="text-xs text-muted">Used this month</p>
                  <div className="mt-3 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '24%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
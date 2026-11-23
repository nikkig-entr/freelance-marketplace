import { Link } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon, ShieldCheckIcon, SparklesIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const ctaBenefits = [
  { icon: CheckIcon, text: 'Free to join — no credit card required' },
  { icon: CheckIcon, text: '14-day Pro trial included' },
  { icon: CheckIcon, text: 'Cancel anytime, no questions asked' },
  { icon: CheckIcon, text: 'Access to 37,000+ projects' },
  { icon: ShieldCheckIcon, text: 'Secure escrow payments' },
  { icon: SparklesIcon, text: 'AI tools for Pro & Agency plans' },
  { icon: UserGroupIcon, text: 'Join 50K+ professionals' },
];

export function CTASection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <picture>
          <source
            srcSet="
              /media/cta/cta-bg-384w.webp 384w,
              /media/cta/cta-bg-640w.webp 640w,
              /media/cta/cta-bg-960w.webp 960w,
              /media/cta/cta-bg-1280w.webp 1280w,
              /media/cta/cta-bg.webp 1920w
            "
            type="image/webp"
          />
          <source
            srcSet="
              /media/cta/cta-bg-384w.webp 384w,
              /media/cta/cta-bg-640w.webp 640w,
              /media/cta/cta-bg-960w.webp 960w,
              /media/cta/cta-bg-1280w.webp 1280w,
              /media/cta/cta-bg.webp 1920w
            "
            type="image/avif"
          />
          <img
            src="/media/cta/cta-bg.jpg"
            alt="Modern workspace with laptop and coffee"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </picture>
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-900/95 via-secondary-900/80 to-secondary-900/95" />
        {/* Subtle pattern */}
        <div className="absolute inset-0 bg-[url('/media/placeholders/dots.svg')] opacity-5" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
          {/* Left side - Content */}
          <div className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            <Badge variant="primary" size="lg" className="mb-6 inline-flex" dot dotColor="#22c55e">
              Start Free Today — 14-Day Pro Trial
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white tracking-tight leading-tight">
              Ready to Build Your <span className="text-primary-400">Freelance Career?</span>
            </h2>
            <p className="mt-6 text-lg sm:text-xl text-secondary-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Join thousands of freelancers and clients who trust FreelanceHub. Create your profile,
              browse projects, and start earning — all in minutes.
            </p>

            {/* Benefits */}
            <div className="mt-10 space-y-3 max-w-xl mx-auto lg:mx-0">
              {ctaBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 text-secondary-200">
                  <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <benefit.icon className="w-4 h-4 text-primary-400" />
                  </div>
                  <span className="text-base">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button size="lg" variant="secondary" asChild className="w-full sm:w-auto px-8 py-4">
                <Link to="/register">
                  Create Free Account
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="w-full sm:w-auto px-8 py-4 border-white/30 text-white hover:bg-white/10">
                <Link to="/projects">
                  Browse Projects First
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-secondary-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheckIcon className="w-4 h-4 text-primary-400" />
                Secure & Verified
              </span>
              <span className="flex items-center gap-1.5">
                <SparklesIcon className="w-4 h-4 text-primary-400" />
                AI-Powered Tools
              </span>
              <span className="flex items-center gap-1.5">
                <UserGroupIcon className="w-4 h-4 text-primary-400" />
                50K+ Members
              </span>
            </div>
          </div>

          {/* Right side - Visual Preview */}
          <div className="relative mt-12 lg:mt-0 hidden lg:block">
            <div className="relative max-w-lg mx-auto">
              {/* Main preview card */}
              <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Top bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div className="flex-1 text-center text-xs text-white/40 font-mono">dashboard.freelancehub.com</div>
                </div>
                {/* Dashboard preview */}
                <div className="p-6 space-y-4">
                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: 'Active Bids', value: '3/50', color: 'text-primary-400' },
                      { label: 'Earnings', value: '$2,847', color: 'text-emerald-400' },
                      { label: 'Rating', value: '4.9★', color: 'text-yellow-400' },
                      { label: 'Projects', value: '12', color: 'text-purple-400' },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-white/50 mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Recent activity */}
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Recent Activity</span>
                      <span className="text-xs text-white/40">This Week</span>
                    </div>
                    {[
                      { project: 'React Dashboard Redesign', status: 'Interviewing', color: 'text-blue-400', bg: 'bg-blue-500/20' },
                      { project: 'Mobile App - Fitness Tracker', status: 'Submitted', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
                      { project: 'E-commerce API Integration', status: 'Hired', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
                      { project: 'Brand Identity Package', status: 'New Match', color: 'text-purple-400', bg: 'bg-purple-500/20' },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-primary-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{activity.project}</p>
                            <p className="text-xs text-white/50">{activity.status}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${activity.bg} ${activity.color}`}>
                          {activity.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* AI suggestion */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center gap-3 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                        <SparklesIcon className="w-5 h-5 text-primary-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">AI Suggestion</p>
                        <p className="text-xs text-white/70 mt-0.5">3 new projects match your skills. <span className="text-primary-400">View matches →</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute -top-4 -right-4 w-64">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl">
                  <p className="text-xs text-white/50 mb-1">WEEKLY PROGRESS</p>
                  <p className="text-3xl font-bold text-white">78%</p>
                  <p className="text-xs text-white/50">Bid limit used</p>
                  <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 -left-4 w-56">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl">
                  <p className="text-xs text-white/50 mb-1">AI PROPOSALS</p>
                  <p className="text-3xl font-bold text-white">12/50</p>
                  <p className="text-xs text-white/50">Used this month</p>
                  <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
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
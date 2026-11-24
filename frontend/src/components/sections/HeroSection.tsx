import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, ShieldCheckIcon, CheckIcon, SparklesIcon, GlobeAltIcon, CurrencyDollarIcon, UserGroupIcon, BoltIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Briefcase, Code, Zap, Users, Shield, TrendingUp } from 'lucide-react';

const skillTags = [
  { name: 'React', icon: Code },
  { name: 'FastAPI', icon: Zap },
  { name: 'UI/UX', icon: Briefcase },
  { name: 'AI/ML', icon: Users },
  { name: 'Node.js', icon: Code },
  { name: 'Python', icon: Zap },
  { name: 'TypeScript', icon: Code },
  { name: 'PostgreSQL', icon: Shield },
];

const stats = [
  { value: '50K+', label: 'Active Freelancers', icon: UserGroupIcon },
  { value: '12K+', label: 'Projects Completed', icon: Briefcase },
  { value: '$5M+', label: 'Paid to Freelancers', icon: CurrencyDollarIcon },
  { value: '98%', label: 'Client Satisfaction', icon: SparklesIcon },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 -z-10">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/media/hero/hero-bg-poster.jpg"
          className="w-full h-full object-cover"
        >
          <source src="/media/hero/hero-bg.mp4" type="video/mp4" />
        </video>
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/90 via-obsidian/60 to-obsidian/95" />
        {/* Subtle radial gradient for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(229,154,75,0.08)_0%,_transparent_70%)]" />
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.02] bg-[url('/media/placeholders/pattern.svg')]" />
      </div>

      {/* Floating ambient orbs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-amber/10 blur-3xl animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-teal/10 blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-amber/5 blur-3xl animate-pulse-soft" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32 lg:py-40">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="mb-8 animate-in">
            <Badge variant="primary" size="lg" className="inline-flex" dot dotColor="#2DD4BF">
              <SparklesIcon className="w-4 h-4" />
              New: AI-Powered Tools for Pro & Agency Plans
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-heading font-bold text-cream tracking-tight leading-[1.1] animate-slide-up">
            Find Work. <span className="text-gradient-amber">Build Your Career.</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl lg:text-2xl text-muted/90 max-w-2xl leading-relaxed animate-slide-up-delay-1">
            The modern freelance marketplace connecting talented professionals with great clients.
            Secure escrow payments, AI-powered matching, and zero hassle.
          </p>

          {/* Search + Skill Tags */}
          <div className="mt-10 animate-slide-up-delay-2">
            <div className="glass-card p-4 mb-6 max-w-2xl">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted/50" />
                <input
                  type="search"
                  placeholder="Search projects, skills, or freelancers..."
                  className="w-full pl-12 pr-4 py-4 bg-transparent border-0 text-cream placeholder-muted/50 text-lg focus:outline-none"
                  aria-label="Search projects"
                />
              </div>
            </div>

            {/* Clickable Skill Tags */}
            <div className="flex flex-wrap items-center gap-2.5 max-w-3xl" role="list" aria-label="Popular skills">
              {skillTags.map((skill, index) => (
                <button
                  key={skill.name}
                  className="group glass-card-hover px-4 py-2.5 rounded-xl text-sm font-medium text-muted transition-all duration-300 flex items-center gap-2"
                  role="listitem"
                >
                  <skill.icon className="w-4 h-4 text-muted group-hover:text-amber transition-colors" aria-hidden="true" />
                  {skill.name}
                </button>
              ))}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted/80 animate-slide-up-delay-3">
            <span className="flex items-center gap-1.5">
              <ShieldCheckIcon className="w-4 h-4 text-amber" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckIcon className="w-4 h-4 text-teal" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-1.5">
              <CheckIcon className="w-4 h-4 text-teal" />
              14-day free trial on Pro
            </span>
          </div>

          {/* Stats Row */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 animate-slide-up-delay-4">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-amber" />
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-cream tracking-tight">{stat.value}</p>
                <p className="mt-1 text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Preview Card */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block max-w-xl animate-float">
          <div className="relative">
            <div className="glass-card overflow-hidden">
              {/* Top bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <div className="flex-1 text-center text-xs text-muted/50 font-mono">dashboard.freelancehub.com</div>
              </div>
              {/* Dashboard preview */}
              <div className="p-6 space-y-5">
                {/* Stats */}
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
                          <Briefcase className="w-4 h-4 text-amber" />
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

            {/* Floating badges */}
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

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/[0.15] rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white/[0.3] animate-bounce" style={{ animationDuration: '1.5s' }} />
        </div>
      </div>
    </section>
  );
}
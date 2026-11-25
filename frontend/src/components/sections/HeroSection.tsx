import { MagnifyingGlassIcon, ShieldCheckIcon, CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { Briefcase, Code, Zap, Users, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

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
  { value: '50K+', label: 'Active Freelancers' },
  { value: '12K+', label: 'Projects Completed' },
  { value: '$5M+', label: 'Paid to Freelancers' },
  { value: '98%', label: 'Client Satisfaction' },
];

interface HeroSectionProps {
  isVisible?: boolean;
}

export function HeroSection({ isVisible = true }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Subtle ambient depth - single radial gradient */}
      <motion.div
        className="absolute inset-0 -z-10 pointer-events-none"
        initial={isVisible ? { scale: 1.12 } : { scale: 1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
        style={{ transformOrigin: 'center center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[var(--color-accent)]/3 blur-[200px]" />
      </motion.div>

      {/* Noise texture - subtle */}
      <div className="absolute inset-0 -z-10 opacity-[0.015] bg-[url('/media/placeholders/pattern.svg')]" />

      <motion.div
        className="relative container py-20 sm:py-28 lg:py-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      >
        <div className="max-w-4xl">
          {/* Badge - minimal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="mb-8"
          >
            <Badge variant="primary" size="md" className="inline-flex" dot>
              <SparklesIcon className="w-3.5 h-3.5" />
              New: AI-Powered Tools for Pro & Agency Plans
            </Badge>
          </motion.div>

          {/* Main Headline - typography driven */}
          <motion.h1
            className="text-display-sm font-extrabold text-[var(--color-text)] tracking-[-0.02em] leading-[1.05]"
            initial={{ opacity: 0, y: 30, clipPath: 'inset(100% 0 0 0)' }}
            animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' }}
            transition={{
              duration: 1.0,
              ease: [0.76, 0, 0.24, 1],
              delay: isVisible ? 0.3 : 0,
            }}
          >
            Find Work.
            <br />
            <span className="text-gradient-accent">Build Your Career.</span>
          </motion.h1>

          {/* Subheadline - restrained */}
          <motion.p
            className="mt-6 text-body-lg text-[var(--color-text-muted)] max-w-2xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          >
            The modern freelance marketplace connecting talented professionals with great clients.
            Secure escrow payments, AI-powered matching, and zero hassle.
          </motion.p>

          {/* Search + Skill Tags */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
          >
            <div className="glass-card p-3 mb-6 max-w-2xl">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-subtle)]" />
                <input
                  type="search"
                  placeholder="Search projects, skills, or freelancers..."
                  className="w-full pl-12 pr-4 py-3.5 bg-transparent border-0 text-[var(--color-text)] placeholder-[var(--color-text-subtle)] text-base focus:outline-none"
                  aria-label="Search projects"
                />
              </div>
            </div>

            {/* Clickable Skill Tags - minimal */}
            <div className="flex flex-wrap items-center gap-2 max-w-3xl" role="list" aria-label="Popular skills">
              {skillTags.map((skill, index) => (
                <motion.button
                  key={skill.name}
                  className="glass-card-hover px-4 py-2 rounded-xl text-sm font-medium text-[var(--color-text-muted)] transition-all duration-300 flex items-center gap-2"
                  role="listitem"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 1.0 + index * 0.03 }}
                >
                  <skill.icon className="w-4 h-4 text-[var(--color-text-subtle)] hover:text-[var(--color-accent)] transition-colors" aria-hidden="true" />
                  {skill.name}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Trust Indicators - minimal */}
          <motion.div
            className="mt-10 flex flex-wrap items-center gap-6 text-sm text-[var(--color-text-subtle)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 1.2 }}
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheckIcon className="w-4 h-4 text-[var(--color-accent)]" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckIcon className="w-4 h-4 text-[var(--color-gray-500)]" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-1.5">
              <CheckIcon className="w-4 h-4 text-[var(--color-gray-500)]" />
              14-day free trial on Pro
            </span>
          </motion.div>

          {/* Stats Row - clean typography */}
          <motion.div
            className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 1.4 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 1.4 + index * 0.08 }}
              >
                <p className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--color-text)] tracking-tight leading-none">{stat.value}</p>
                <p className="mt-2 text-sm text-[var(--color-text-muted)] leading-normal">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Floating Preview Card - refined */}
        <motion.div
          className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block max-w-xl"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 1.6 }}
        >
          <div className="relative">
            <div className="glass-card overflow-hidden">
              {/* Top bar - minimal */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)]">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <div className="flex-1 text-center text-xs text-[var(--color-text-subtle)] font-mono">dashboard.freelancehub.com</div>
              </div>
              {/* Dashboard preview */}
              <div className="p-6 space-y-5">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Active Bids', value: '3/50', color: 'text-[var(--color-accent)]' },
                    { label: 'Earnings', value: '$2,847', color: 'text-[var(--color-gray-400)]' },
                    { label: 'Rating', value: '4.9★', color: 'text-[var(--color-gray-400)]' },
                    { label: 'Projects', value: '12', color: 'text-[var(--color-gray-400)]' },
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
                        <div className="w-9 h-9 rounded-lg bg-[var(--glass-bg)] flex items-center justify-center">
                          <Briefcase className="w-4 h-4 text-[var(--color-accent)]" />
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

                {/* AI suggestion - accent highlighted */}
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

            {/* Floating badges - minimal */}
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
        </motion.div>
      </motion.div>

      {/* Scroll indicator - minimal */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 2.2 }}
      >
        <div className="w-5 h-9 border-1.5 border-[var(--color-border)] rounded-full flex justify-center pt-1.5">
          <motion.div
            className="w-1 h-1 rounded-full bg-[var(--color-text-muted)]"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}

export { HeroSection as default };
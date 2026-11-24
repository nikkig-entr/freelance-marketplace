import { ShieldCheckIcon, GlobeAltIcon, UserGroupIcon, BoltIcon, ChartBarIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { Briefcase, Zap, Users, Shield, Globe, TrendingUp, Lock, Code, Palette, Cpu } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const bentoItems = [
  {
    id: 1,
    title: 'Work Without Borders',
    description: 'Connect with clients globally. Our platform removes geographical barriers so you can work from anywhere — whether that\'s a beach in Bali or a cafe in Berlin.',
    icon: Globe,
    accent: 'teal',
    media: '/media/bento/bento-remote-work.jpg',
    mediaType: 'image',
    stats: ['120+ Countries', '24/7 Opportunities'],
    features: ['Timezone-aware matching', 'Async communication tools', 'Global payment support'],
    large: true,
  },
  {
    id: 2,
    title: 'Secure Escrow Payments',
    description: 'Milestone-based escrow protects both parties. Funds are held securely until work is approved — no more chasing invoices or payment disputes.',
    icon: Shield,
    accent: 'amber',
    media: '/media/bento/bento-escrow.jpg',
    mediaType: 'image',
    stats: ['99.2% Success Rate', '< 4hr Disputes'],
    features: ['Milestone-based releases', 'Automated invoicing', 'Multi-currency support'],
    large: false,
  },
  {
    id: 3,
    title: 'AI-Powered Matching',
    description: 'Our intelligent matching engine analyzes your skills, portfolio, and preferences to surface the most relevant projects — saving you hours of searching.',
    icon: Cpu,
    accent: 'teal',
    media: '/media/bento/bento-ai.mp4',
    mediaType: 'video',
    poster: '/media/bento/bento-ai-poster.jpg',
    stats: ['3.2x More Matches', '85% Relevance Score'],
    features: ['Skill-based recommendations', 'Budget prediction', 'Proposal optimization'],
    large: false,
  },
  {
    id: 4,
    title: 'Verified Talent Pool',
    description: 'Every freelancer undergoes identity verification and skill assessment. Clients get access to pre-vetted professionals with proven track records.',
    icon: Users,
    accent: 'amber',
    media: '/media/bento/bento-remote-work.jpg',
    mediaType: 'image',
    stats: ['50K+ Verified', '4.9 Avg Rating'],
    features: ['Identity verification', 'Skill assessments', 'Portfolio validation'],
    large: false,
  },
  {
    id: 5,
    title: 'Real-Time Collaboration',
    description: 'Built-in messaging, file sharing, and project tracking keep everyone aligned. No need for external tools — everything happens in one place.',
    icon: Code,
    accent: 'teal',
    media: '/media/bento/bento-escrow.jpg',
    mediaType: 'image',
    stats: ['< 1min Response', '99.9% Uptime'],
    features: ['Integrated chat', 'File versioning', 'Time tracking'],
    large: false,
  },
  {
    id: 6,
    title: 'Smart Contracts',
    description: 'AI-generated contracts tailored to your project type. Legal-grade templates with customizable terms — reviewed by our legal partners.',
    icon: Lock,
    accent: 'amber',
    media: '/media/bento/bento-ai.mp4',
    mediaType: 'video',
    poster: '/media/bento/bento-ai-poster.jpg',
    stats: ['50+ Templates', 'Auto-compliance'],
    features: ['Jurisdiction-aware', 'Auto-renewal options', 'Digital signatures'],
    large: false,
  },
];

export function BentoGridSection() {
  return (
    <section className="section relative">
      {/* Background ambient glow */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-teal/5 blur-3xl" />
      </div>

      <div className="container relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="primary" size="lg" className="mb-4 inline-flex">
            Why Choose FreelanceHub
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-cream tracking-tight">
            Built for the <span className="text-gradient">Modern Freelancer</span>
          </h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Six pillars that make freelancing secure, efficient, and rewarding. Real features, real results.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {bentoItems.map((item, index) => (
            <article
              key={item.id}
              className={`
                relative glass-card-hover overflow-hidden group
                ${item.large ? 'lg:col-span-7 lg:row-span-2' : 'lg:col-span-5'}
                ${index === 1 ? 'lg:col-start-8' : ''}
                ${index === 2 ? 'lg:col-start-8' : ''}
              `}
              style={{ '--accent-color': `var(--color-${item.accent})` }}
            >
              {/* Media Background */}
              <div className="absolute inset-0 -z-10 overflow-hidden">
                {item.mediaType === 'video' ? (
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster={item.poster}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  >
                    <source src={item.media} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={item.media}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/95 via-obsidian/30 to-transparent" />
                {/* Accent border glow on hover */}
                <div className="absolute inset-0 border-2 border-transparent transition-all duration-300 group-hover:border-amber/30" />
              </div>

              {/* Content */}
              <div className="relative h-full p-6 lg:p-8 flex flex-col justify-between">
                {/* Top: Badge + Icon */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={item.accent === 'amber' ? 'primary' : 'success'} size="sm">
                      {item.accent === 'amber' ? 'Security' : 'Innovation'}
                    </Badge>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] flex items-center justify-center text-2xl`}>
                    <item.icon className={`w-7 h-7 text-${item.accent}`} aria-hidden="true" />
                  </div>
                </div>

                {/* Middle: Title & Description */}
                <div className="flex-1 flex flex-col justify-center pt-4">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-cream tracking-tight leading-tight">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base sm:text-lg text-muted/90 leading-relaxed max-w-md lg:max-w-lg">
                    {item.description}
                  </p>
                </div>

                {/* Bottom: Stats & Features */}
                <div className="pt-6 border-t border-white/[0.06]">
                  {/* Stats */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    {item.stats.map((stat, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 glass-subtle rounded-xl">
                        <span className="text-xs font-medium text-cream">{stat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {item.features.map((feature, i) => (
                      <Badge key={i} variant="outline" size="sm" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
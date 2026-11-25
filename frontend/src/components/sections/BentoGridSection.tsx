import { Users, Shield, Globe, Lock, Code, Cpu } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { AmbientBackground } from '@/components/ui/AmbientBackground';

const bentoItems = [
  {
    id: 1,
    title: 'Work Without Borders',
    description: 'Connect with clients globally. Our platform removes geographical barriers so you can work from anywhere — whether that\'s a beach in Bali or a cafe in Berlin.',
    icon: Globe,
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
    <section className="section">
      <AmbientBackground size="md" opacity="default">
        <div className="container">
        {/* Header - centered, typography focused */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="primary" size="md" className="mb-4 inline-flex">
            Why Choose FreelanceHub
          </Badge>
          <h2 className="text-headline-1 text-[var(--color-text)]">
            Built for the <span className="text-gradient-accent">Modern Freelancer</span>
          </h2>
          <p className="mt-4 text-body text-[var(--color-text-muted)] max-w-2xl mx-auto">
            Six pillars that make freelancing secure, efficient, and rewarding. Real features, real results.
          </p>
        </div>

        {/* Bento Grid - clean, precise layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {bentoItems.map((item, index) => (
            <article
              key={item.id}
              className={`
                relative glass-card-hover overflow-hidden group
                ${item.large ? 'lg:col-span-7 lg:row-span-2' : 'lg:col-span-5'}
                $${index === 1 ? 'lg:col-start-8' : ''}
                ${index === 2 ? 'lg:col-start-8' : ''}
                animate-slide-up delay-${Math.min(index + 1, 5)}
              `}
            >
              {/* Media Background - subtle */}
              <div className="absolute inset-0 -z-10 overflow-hidden">
                {item.mediaType === 'video' ? (
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster={item.poster}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  >
                    <source src={item.media} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={item.media}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    loading="lazy"
                  />
                )}
                {/* Gradient overlay - clean */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                {/* Subtle border glow on hover */}
                <div className="absolute inset-0 border border-transparent transition-all duration-300 group-hover:border-[var(--color-accent)]/30" />
              </div>

              {/* Content */}
              <div className="relative h-full p-6 lg:p-8 flex flex-col justify-between">
                {/* Top: Icon */}
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl glass flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-[var(--color-accent)]" aria-hidden="true" />
                  </div>
                </div>

                {/* Middle: Title & Description */}
                <div className="flex-1 flex flex-col justify-center pt-4">
                  <h3 className="text-headline-4 text-[var(--color-text)] leading-tight">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-body text-[var(--color-text-muted)] leading-relaxed max-w-md lg:max-w-lg">
                    {item.description}
                  </p>
                </div>

                {/* Bottom: Stats & Features */}
                <div className="pt-6 border-t border-[var(--color-border)]">
                  {/* Stats */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    {item.stats.map((stat, i) => (
                      <div key={i} className="px-3 py-1.5 glass-subtle rounded-xl">
                        <span className="text-xs font-medium text-[var(--color-text)]">{stat}</span>
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

              {/* Hover accent line - minimal */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </article>
          ))}
        </div>
      </div>
      </AmbientBackground>
    </section>
  );
}
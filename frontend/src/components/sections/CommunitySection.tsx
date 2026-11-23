import { ShieldCheckIcon, StarIcon, UserGroupIcon, ChatBubbleLeftRightIcon, TrophyIcon, HeartIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';

const trustSignals = [
  {
    icon: ShieldCheckIcon,
    title: 'Verified Identities',
    description: 'Every freelancer and client undergoes identity verification for a safer marketplace.',
  },
  {
    icon: StarIcon,
    title: 'Transparent Reviews',
    description: 'Honest, detailed reviews from real projects. No fake ratings, no review manipulation.',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Dispute Protection',
    description: 'Built-in mediation and escrow system protects both parties on every project.',
  },
  {
    icon: TrophyIcon,
    title: 'Top Talent Badge',
    description: 'Earn recognition for consistent quality. Top 5% freelancers get featured placement.',
  },
  {
    icon: HeartIcon,
    title: 'Community Guidelines',
    description: 'Clear code of conduct with zero tolerance for harassment, discrimination, or fraud.',
  },
  {
    icon: UserGroupIcon,
    title: 'Peer Support Network',
    description: 'Join forums, mentorship programs, and local meetups. You\'re never alone.',
  },
];

const testimonials = [
  {
    quote: "FreelanceHub changed how I find work. The remote-first approach means I can take projects from anywhere — I've worked from 12 countries this year alone.",
    author: "Sarah Chen",
    role: "Full-Stack Developer",
    avatar: "/media/community/community-team-thumb.webp",
    rating: 5,
  },
  {
    quote: "As a client, the escrow system gives me peace of mind. I only pay for work I approve, and the dispute resolution is fair and fast.",
    author: "Marcus Johnson",
    role: "CTO, TechStartup Inc.",
    avatar: "/media/community/community-handshake-thumb.webp",
    rating: 5,
  },
  {
    quote: "The community forums saved my career. When I hit a rough patch, other freelancers helped me pivot and find better clients.",
    author: "Elena Rodriguez",
    role: "UI/UX Designer",
    avatar: "/media/community/community-team-thumb.webp",
    rating: 5,
  },
];

const communityStats = [
  { value: '4.9/5', label: 'Average Rating' },
  { value: '99.2%', label: 'Successful Projects' },
  { value: '< 4hr', label: 'Avg. Dispute Resolution' },
  { value: '50K+', label: 'Active Members' },
];

export function CommunitySection() {
  return (
    <section className="py-20 sm:py-24 lg:py-28 bg-secondary-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="secondary" size="lg" className="mb-4 inline-flex">
            Trusted by 50,000+ Professionals
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-secondary-900 tracking-tight">
            A Community Built on <span className="text-primary-600">Trust & Transparency</span>
          </h2>
          <p className="mt-4 text-lg text-secondary-600 max-w-2xl mx-auto">
            We believe great work happens when people trust each other. Our platform puts safety, fairness, and community first.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {communityStats.map((stat) => (
            <Card key={stat.label} className="text-center p-6 bg-white border-secondary-200 shadow-sm">
              <p className="text-3xl sm:text-4xl font-bold text-primary-600">{stat.value}</p>
              <p className="mt-1 text-sm text-secondary-600">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Visual + Trust signals */}
        <div className="relative lg:grid lg:grid-cols-2 lg:gap-12 items-center mb-20">
          {/* Image side */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-secondary-100">
              <picture>
                <source
                  srcSet="
                    /media/community/community-team-384w.webp 384w,
                    /media/community/community-team-640w.webp 640w,
                    /media/community/community-team-960w.webp 960w,
                    /media/community/community-team-1280w.webp 1280w
                  "
                  type="image/webp"
                />
                <source
                  srcSet="
                    /media/community/community-team-384w.webp 384w,
                    /media/community/community-team-640w.webp 640w,
                    /media/community/community-team-960w.webp 960w,
                    /media/community/community-team-1280w.webp 1280w
                  "
                  type="image/avif"
                />
                <img
                  src="/media/community/community-team.jpg"
                  alt="Diverse group of freelancers collaborating"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </picture>
              {/* Floating trust badge */}
              <div className="absolute -bottom-6 -left-6 md:left-auto md:right-6 md:bottom-6 md:w-72">
                <Card className="bg-white/95 backdrop-blur-sm shadow-xl border border-secondary-200 p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                      <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-secondary-900">Verified Marketplace</p>
                      <p className="text-sm text-secondary-500">Identity + Payment Verified</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Trust signals */}
          <div className="order-1 lg:order-2 space-y-6">
            <h3 className="text-2xl font-bold text-secondary-900">How we keep you safe</h3>
            <div className="space-y-4">
              {trustSignals.map((signal, index) => (
                <Card key={index} className="p-5 hover:shadow-md transition-shadow border border-secondary-200 bg-white">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <signal.icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary-900">{signal.title}</h4>
                      <p className="text-sm text-secondary-600 mt-0.5">{signal.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-secondary-900 text-center mb-12">What our community says</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 bg-white border-secondary-200 shadow-sm h-full">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-secondary-600 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <Avatar
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    size="md"
                    fallback={testimonial.author.charAt(0)}
                  />
                  <div>
                    <p className="font-semibold text-secondary-900">{testimonial.author}</p>
                    <p className="text-sm text-secondary-500">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="bg-white border-secondary-200 p-8 sm:p-12 rounded-3xl shadow-xl">
            <h3 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-4">
              Join a community that has your back
            </h3>
            <p className="text-secondary-600 mb-8 max-w-2xl mx-auto">
              50,000+ freelancers and clients trust FreelanceHub. Create your profile and start building
              meaningful professional relationships today.
            </p>
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors"
            >
              Join Free Today
              <ArrowRightIcon className="w-5 h-5" />
            </a>
          </Card>
        </div>
      </div>
    </section>
  );
}
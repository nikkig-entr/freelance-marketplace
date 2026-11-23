import { CheckIcon, ComputerDesktopIcon, WifiIcon, SunIcon, MoonIcon, HomeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const remoteBenefits = [
  {
    icon: WifiIcon,
    title: 'Work From Anywhere',
    description: 'Connect to high-speed internet and work from cafes, coworking spaces, or beaches worldwide.',
  },
  {
    icon: SunIcon,
    title: 'Flexible Hours',
    description: 'Set your own schedule. Morning person or night owl — you decide when you\'re most productive.',
  },
  {
    icon: HomeIcon,
    title: 'Work-Life Balance',
    description: 'Eliminate commute time. Spend more time with family, on hobbies, or learning new skills.',
  },
  {
    icon: ComputerDesktopIcon,
    title: 'Global Opportunities',
    description: 'Access clients from San Francisco to Singapore without leaving your home office.',
  },
  {
    icon: MoonIcon,
    title: 'Async Communication',
    description: 'Built-in messaging and project tools designed for distributed teams across time zones.',
  },
  {
    icon: CheckIcon,
    title: 'Verified Remote-Friendly',
    description: 'Every project tagged with remote-friendly policies, timezone requirements, and communication expectations.',
  },
];

const stats = [
  { value: '85%', label: 'Projects Remote-Friendly' },
  { value: '120+', label: 'Countries Represented' },
  { value: '3.2x', label: 'More Applications' },
  { value: '40%', label: 'Faster Hiring' },
];

export function RemoteWorkSection() {
  return (
    <section className="py-20 sm:py-24 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="secondary" size="lg" className="mb-4 inline-flex">
            Remote-First Marketplace
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-secondary-900 tracking-tight">
            Built for the <span className="text-primary-600">Remote Generation</span>
          </h2>
          <p className="mt-4 text-lg text-secondary-600 max-w-2xl mx-auto">
            FreelanceHub was designed from day one for distributed teams. No commute, no borders, just great work.
          </p>
        </div>

        {/* Hero visual with stats */}
        <div className="relative lg:grid lg:grid-cols-2 lg:gap-12 items-center mb-20">
          {/* Image side */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-secondary-100">
              <picture>
                <source
                  srcSet="
                    /media/remote/remote-cafe-384w.webp 384w,
                    /media/remote/remote-cafe-640w.webp 640w,
                    /media/remote/remote-cafe-960w.webp 960w,
                    /media/remote/remote-cafe-1280w.webp 1280w
                  "
                  type="image/webp"
                />
                <source
                  srcSet="
                    /media/remote/remote-cafe-384w.webp 384w,
                    /media/remote/remote-cafe-640w.webp 640w,
                    /media/remote/remote-cafe-960w.webp 960w,
                    /media/remote/remote-cafe-1280w.webp 1280w
                  "
                  type="image/avif"
                />
                <img
                  src="/media/remote/remote-cafe.jpg"
                  alt="Freelancer working remotely from a modern cafe"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </picture>
              {/* Floating stat cards */}
              <div className="absolute -bottom-6 left-6 right-6 md:left-auto md:right-6 md:bottom-6 md:w-64">
                <Card className="bg-white/95 backdrop-blur-sm shadow-xl border border-secondary-200 p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                      <WifiIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-secondary-900">120+</p>
                      <p className="text-sm text-secondary-500">Countries</p>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="absolute -bottom-6 -left-6 md:left-auto md:right-auto md:bottom-6 md:w-64 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:-right-6">
                <Card className="bg-white/95 backdrop-blur-sm shadow-xl border border-secondary-200 p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <CheckIcon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-secondary-900">85%</p>
                      <p className="text-sm text-secondary-500">Remote Projects</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Stats + Intro side */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat) => (
                <Card key={stat.label} className="text-center p-6 bg-secondary-50 border-secondary-200">
                  <p className="text-3xl sm:text-4xl font-bold text-primary-600">{stat.value}</p>
                  <p className="mt-1 text-sm text-secondary-600">{stat.label}</p>
                </Card>
              ))}
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-secondary-900">Why freelancers choose remote work</h3>
              <p className="text-secondary-600">
                The freedom to choose your environment isn\'t just a perk — it\'s a productivity multiplier.
                Our platform connects you with clients who understand and embrace distributed work.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div>
          <h3 className="text-2xl font-bold text-secondary-900 text-center mb-12">Everything you need for remote success</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {remoteBenefits.map((benefit, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow h-full border border-secondary-200">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h4 className="text-lg font-semibold text-secondary-900 mb-2">{benefit.title}</h4>
                <p className="text-secondary-600">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <Card className="bg-primary-600 border-none p-8 sm:p-12 rounded-3xl">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to work from anywhere?
            </h3>
            <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of freelancers building careers without borders. Start free today.
            </p>
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-colors"
            >
              Create Free Account
              <ArrowRightIcon className="w-5 h-5" />
            </a>
          </Card>
        </div>
      </div>
    </section>
  );
}
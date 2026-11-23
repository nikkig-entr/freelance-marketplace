import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, ShieldCheckIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Video/Image */}
      <div className="absolute inset-0 -z-10">
        <picture>
          <source
            srcSet="
              /media/hero/hero-main-384w.webp 384w,
              /media/hero/hero-main-640w.webp 640w,
              /media/hero/hero-main-960w.webp 960w,
              /media/hero/hero-main-1280w.webp 1280w,
              /media/hero/hero-main.webp 1920w
            "
            type="image/webp"
          />
          <source
            srcSet="
              /media/hero/hero-main-384w.webp 384w,
              /media/hero/hero-main-640w.webp 640w,
              /media/hero/hero-main-960w.webp 960w,
              /media/hero/hero-main-1280w.webp 1280w,
              /media/hero/hero-main.webp 1920w
            "
            type="image/avif"
          />
          <img
            src="/media/hero/hero-main.jpg"
            alt="Freelancer working on laptop"
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </picture>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-900/80 via-secondary-900/60 to-transparent" />
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[url('/media/placeholders/pattern.svg')] opacity-5" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32 lg:py-40">
        <div className="max-w-3xl">
          <Badge variant="primary" size="lg" className="mb-6 inline-flex" dot dotColor="#22c55e">
            New: AI-Powered Proposals for Pro & Agency Plans
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold text-white tracking-tight leading-tight">
            Find Work. <span className="text-primary-400">Build Your Career.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-secondary-200 max-w-2xl leading-relaxed">
            The modern freelance marketplace connecting talented professionals with great clients.
            Secure payments, AI tools, and zero hassle.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-start gap-4">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link to="/register">Start Freelancing Free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
              <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
              Browse Projects
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-start gap-6 text-sm text-secondary-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheckIcon className="w-4 h-4 text-primary-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckIcon className="w-4 h-4 text-primary-400" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-1.5">
              <CheckIcon className="w-4 h-4 text-primary-400" />
              14-day free trial on Pro
            </span>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap items-center gap-8 text-secondary-400">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">50K+</span>
              <span className="text-sm">Active Freelancers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">10K+</span>
              <span className="text-sm">Projects Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">$2.5M+</span>
              <span className="text-sm">Paid to Freelancers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">98%</span>
              <span className="text-sm">Client Satisfaction</span>
            </div>
          </div>
        </div>

        {/* Floating cards with code preview */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block max-w-md">
          <div className="relative">
            <picture>
              <source
                srcSet="
                  /media/hero/hero-code-384w.webp 384w,
                  /media/hero/hero-code-640w.webp 640w,
                  /media/hero/hero-code-960w.webp 960w,
                  /media/hero/hero-code-1280w.webp 1280w
                "
                type="image/webp"
              />
              <source
                srcSet="
                  /media/hero/hero-code-384w.webp 384w,
                  /media/hero/hero-code-640w.webp 640w,
                  /media/hero/hero-code-960w.webp 960w,
                  /media/hero/hero-code-1280w.webp 1280w
                "
                type="image/avif"
              />
              <img
                src="/media/hero/hero-code.jpg"
                alt="Code editor preview showing freelance project"
                className="rounded-2xl shadow-2xl border border-white/10 w-full aspect-[4/3] object-cover"
                loading="lazy"
              />
            </picture>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 border border-secondary-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-secondary-900">AI Proposal Generator</p>
                  <p className="text-sm text-secondary-500">Generate winning proposals in seconds</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
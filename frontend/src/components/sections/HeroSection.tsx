'use client';

import { useEffect, useRef, useState } from 'react';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { MonumentalHeadline } from '@/components/ui/MonumentalHeadline';
import { EditorialText } from '@/components/ui/EditorialText';
import { MagnifyingGlassIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

interface Lenis {
  raf: (time: number) => void;
  on: (event: 'scroll', callback: (data: { scroll: number }) => void) => () => void;
  destroy: () => void;
}

interface HeroSectionProps {
  isVisible?: boolean;
}

export function HeroSection({ isVisible = true }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const initLenis = async () => {
      if (typeof window !== 'undefined') {
        const { default: Lenis } = await import('lenis');
        const lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          touchMultiplier: 2,
        });

        lenisRef.current = lenis;

        function raf(time: number) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Track scroll progress for parallax
        lenis.on('scroll', ({ scroll }: { scroll: number }) => {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          setScrollProgress(scroll / maxScroll);
        });

        return () => {
          lenis.destroy();
        };
      }
    };

    initLenis();

    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        videoRef.current!.muted = true;
        videoRef.current!.play();
      });
    }

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" data-lenis-prevent>
      {/* Video Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster="/media/hero/hero-bg-poster.jpg"
          className="w-full h-full object-cover"
          aria-hidden="true"
          style={{
            transform: `translateY(${scrollProgress * 100}px)`,
            willChange: 'transform',
          }}
        >
          <source src="/media/hero/hero-bg.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg)]/70 via-[var(--color-bg)]/40 to-[var(--color-bg)]/90" />
        {/* Subtle accent glow - moves with scroll */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[var(--color-accent)]/5 blur-[200px] pointer-events-none"
          style={{
            transform: `translate(-50%, -50%) translateY(${scrollProgress * 50}px)`,
            willChange: 'transform',
          }}
        />
        {/* Noise texture */}
        <div className="absolute inset-0 noise-overlay opacity-[0.015]" />
      </div>

      <div className="relative container py-20 sm:py-28 lg:py-40" data-lenis-prevent>
        <div className="max-w-4xl">
          {/* Badge - minimal */}
          <div className="mb-10" style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s'
          }}>
            <span className="inline-flex items-center gap-2 glass-card px-5 py-2.5 rounded-xl border-[var(--color-accent)]/30 backdrop-blur-[20px]">
              <SparklesIcon className="w-4 h-4 text-[var(--color-accent)]" aria-hidden="true" />
              <span className="text-sm font-medium text-[var(--color-text)] tracking-wide uppercase">New: AI-Powered Matching for Pro & Agency</span>
            </span>
          </div>

          {/* Main Headline - Monumental with mask reveal */}
          <MonumentalHeadline
            splitBy="lines"
            delay={0.3}
            stagger={0.1}
            duration={1.4}
            ease="cubic-bezier(0.76, 0, 0.24, 1)"
            parallax={true}
            parallaxStrength={0.08}
            maskAnimation={true}
            className="mb-6"
          >
            Find Work.
            Build Your Career.
          </MonumentalHeadline>

          {/* Editorial subheadline with italic serif */}
          <EditorialText
            size="lg"
            animated={true}
            hoverReroll={true}
            rerollText="Secure escrow. Zero hassle. Pure craft."
            className="max-w-2xl mb-12"
          >
            The modern freelance marketplace connecting talented professionals with great clients.
          </EditorialText>

          {/* Search + CTA */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16" style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.4s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.4s'
          }}>
            <div className="glass-card p-2 flex-1 max-w-2xl backdrop-blur-[20px] border-[var(--color-border)]">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-subtle)]" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search projects, skills, or freelancers…"
                  className="w-full pl-12 pr-4 py-3.5 bg-transparent border-0 text-[var(--color-text)] placeholder-[var(--color-text-subtle)] text-base focus:outline-none font-sans"
                  aria-label="Search projects"
                />
              </div>
            </div>
            <MagneticButton
              variant="primary"
              size="lg"
              leftIcon={<SparklesIcon className="w-5 h-5" />}
              rightIcon={<ArrowRightIcon className="w-5 h-5" />}
              strength={0.35}
              className="whitespace-nowrap"
            >
              Explore Projects
            </MagneticButton>
          </div>

          {/* Trust Indicators - minimal */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--color-text-subtle)]" style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.6s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.6s'
          }}>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[var(--color-gray-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Cancel anytime
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[var(--color-gray-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              14-day free trial on Pro
            </span>
          </div>

          {/* Scroll indicator - minimal */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2" style={{
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 2.2s'
          }}>
            <div className="w-5 h-9 border-1.5 border-[var(--color-border)] rounded-full flex justify-center pt-1.5">
              <div className="w-1 h-1 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDuration: '1.5s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }} aria-hidden="true" />
            </div>
            <p className="text-xs text-[var(--color-text-subtle)] text-center mt-2 font-mono tracking-wider uppercase">Scroll</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export { HeroSection as default };
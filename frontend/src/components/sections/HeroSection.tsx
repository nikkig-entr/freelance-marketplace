'use client';

import { useEffect, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { ParallaxVideo } from '@/components/ui/ParallaxVideo';
import { MonumentalHeadline } from '@/components/ui/MonumentalHeadline';
import { EditorialText } from '@/components/ui/EditorialText';

export function HeroSection({ isVisible = true }: { isVisible?: boolean }) {
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoContainerRef.current) {
      const video = videoContainerRef.current.querySelector('video');
      if (video) {
        video.play().catch(() => {
          video.muted = true;
          video.play();
        });
      }
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" data-lenis-prevent>
      {/* Video Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div ref={videoContainerRef}>
          <ParallaxVideo
            src="/media/hero-bg.mp4"
            poster="/media/arch-01.jpg"
            autoPlay={true}
            muted={true}
            loop={true}
            playsInline={true}
            aspectRatio={16 / 9}
            speed={0.15}
            zoomRange={[1, 1.08]}
            revealOnScroll={true}
            revealThreshold={0}
            className="grayscale"
          />
        </div>
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg)]/80 via-[var(--color-bg)]/50 to-[var(--color-bg)]/95" />
        {/* Noise texture */}
        <div className="absolute inset-0 noise-overlay opacity-[0.02]" />
      </div>

      <div className="relative container py-20 sm:py-28 lg:py-40" data-lenis-prevent>
        <div className="max-w-4xl">
          {/* Badge - minimal */}
          <div className="mb-10" style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s'
          }}>
            <span className="inline-flex items-center gap-2 glass px-5 py-2.5 border border-[var(--color-border)]">
              <span className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase">New</span>
              <span className="text-sm font-medium text-[var(--color-text)] tracking-wide">AI-Powered Matching for Pro & Agency</span>
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

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16" style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.4s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.4s'
          }}>
            <Link to="/projects" className="btn-primary btn-lg flex-1 text-center whitespace-nowrap">
              Explore Projects
            </Link>
            <Link to="/register" className="btn-secondary btn-lg flex-1 text-center whitespace-nowrap">
              Join as Freelancer
            </Link>
          </div>

          {/* Trust Indicators - minimal */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--color-text-subtle)]" style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.6s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.6s'
          }}>
            <span className="flex items-center gap-1.5 font-mono text-xs tracking-wider">
              No credit card required
            </span>
            <span className="flex items-center gap-1.5 font-mono text-xs tracking-wider">
              Cancel anytime
            </span>
            <span className="flex items-center gap-1.5 font-mono text-xs tracking-wider">
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
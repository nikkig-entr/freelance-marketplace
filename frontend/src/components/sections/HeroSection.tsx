'use client';

import { Link } from '@tanstack/react-router';
import { CinemaMedia } from '@/components/ui/CinemaMedia';
import { MonumentalHeadline } from '@/components/ui/MonumentalHeadline';
import { EditorialText } from '@/components/ui/EditorialText';

export function HeroSection({ isVisible = true }: { isVisible?: boolean }) {

  return (
    <section className="relative min-h-screen flex items-end justify-center overflow-hidden" data-lenis-prevent>
      {/* Video Background - full screen, opacity-50 */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <CinemaMedia
          src="/media/hero-bg.mp4"
          poster="/media/arch-01.jpg"
          autoPlay={true}
          muted={true}
          loop={true}
          playsInline={true}
          aspectRatio={16 / 9}
          priority={true}
          className="opacity-50"
        />
      </div>

      <div className="relative container pb-20 lg:pb-32" data-lenis-prevent>
        {/* Top Indices - mono indices */}
        <div className="flex items-center justify-between mb-12 lg:mb-20" style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s'
        }}>
          <span className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase">
            [ 00 / ARCHITECTURAL TALENT ARCHIVE ]
          </span>
          <span className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase">
            [ EST. 2026 — WORLDWIDE ]
          </span>
        </div>

        {/* Monumental Headline - 100% width */}
        <div className="w-full max-w-none" style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s'
        }}>
          <MonumentalHeadline
            splitBy="lines"
            delay={0}
            stagger={0.08}
            duration={1.4}
            ease="cubic-bezier(0.76, 0, 0.24, 1)"
            parallax={false}
            maskAnimation={true}
            className="mb-8"
            as="h1"
          >
            Architectural Talent
            <br />
            Curated for Excellence
          </MonumentalHeadline>

          {/* Sub-headline with dual font contrast: Syne uppercase + Instrument Serif italic */}
          <div className="max-w-3xl mb-12" style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.8s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.8s'
          }}>
            <p className="font-heading font-medium text-[var(--color-text-muted)] uppercase tracking-[0.15em] text-sm mb-3">
              The Archive
            </p>
            <EditorialText
              size="xl"
              animated={false}
              className="max-w-2xl"
            >
              A meticulously curated network of world-class architects, spatial designers, and architectural technologists. Every professional vetted. Every project matched with precision.
            </EditorialText>
          </div>

          {/* CTA Button */}
          <div className="flex items-center gap-4" style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.1s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.1s'
          }}>
            <Link
              to="/projects"
              className="inline-flex items-center justify-center gap-2 border border-white px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors rounded-none"
            >
              EXPLORE ARCHIVE →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export { HeroSection as default };
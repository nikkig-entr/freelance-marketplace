'use client';

import { Link } from '@tanstack/react-router';
import { IglooMonolithCanvas } from '@/components/canvas/IglooMonolithCanvas';
import { SplitTextReveal } from '@/components/motion/SplitTextReveal';

export function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-between overflow-hidden" data-lenis-prevent>
      {/* Igloo Monolith Canvas - Full Bleed Background */}
      <IglooMonolithCanvas />

      {/* Top HUD Metadata */}
      <div className="absolute top-0 left-0 right-0 z-10 pt-8 md:pt-12 px-4 md:px-8 flex flex-wrap justify-between gap-2 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.18em] md:tracking-[0.22em] text-[var(--color-text-subtle)] pointer-events-none">
        <div className="flex flex-col gap-1">
          <span>[ 00 / ARCHITECTURAL TALENT ARCHIVE ]</span>
          <span className="opacity-50">[ // INDEPENDENT PRACTICE 2026 ]</span>
        </div>
        <div className="flex flex-col gap-1 items-end text-right">
          <span>[ // CURATED NETWORK ]</span>
          <span className="opacity-50">[ // WORLDWIDE ]</span>
        </div>
      </div>

      {/* Bottom Monumental Headline - 2 Lines Edge-to-Edge */}
      <div className="relative z-10 w-full px-4 md:px-8 pb-8 md:pb-12">
        {/* Line 1: ARCHITECTURAL TALENT (Syne uppercase) */}
        <SplitTextReveal
          splitBy="lines"
          delay={0}
          stagger={0.1}
          duration={1.2}
          ease="cubic-bezier(0.16, 1, 0.3, 1)"
          immediate={true}
          as="div"
          className="mb-4"
        >
          ARCHITECTURAL TALENT
          <br />
          CURATED FOR EXCELLENCE
        </SplitTextReveal>

        {/* Line 2: Curated for Excellence (Instrument Serif italic) - handled by splitBy="lines" above */}

        {/* Bottom Hairline Bar: Editorial Copy Left + CTA Right */}
        <div className="border-t border-white/15 pt-6 mt-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
          <p className="max-w-md text-sm md:text-base text-[var(--color-text-secondary)] leading-relaxed">
            Every professional vetted. Every project matched with precision.
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center justify-center gap-2 border border-white px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors min-h-[48px] w-full sm:w-auto"
          >
            EXPLORE ARCHIVE →
          </Link>
        </div>
      </div>
    </section>
  );
}

export { HeroSection as default };
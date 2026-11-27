'use client';

import { Link } from '@tanstack/react-router';
import { IglooMonolithCanvas } from '@/components/canvas/IglooMonolithCanvas';
import { SplitTextReveal } from '@/components/motion/SplitTextReveal';

export function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-between pt-24 pb-8 px-4 md:px-8 overflow-hidden" data-lenis-prevent>
      {/* Igloo Monolith Canvas - Full Bleed Background */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <IglooMonolithCanvas />
      </div>

      {/* Top HUD Metadata */}
      <div className="relative z-10 flex justify-between font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-400">
        <span>[ 00 / ARCHITECTURAL TALENT ARCHIVE ]</span>
        <span>[ // INDEPENDENT PRACTICE 2026 ]</span>
      </div>

      {/* Bottom Monumental Headline - 2 Lines Edge-to-Edge */}
      <div className="relative z-10 mt-auto w-full">
        {/* Line 1: ARCHITECTURAL TALENT (Syne uppercase) */}
        <h1 className="font-heading font-extrabold uppercase leading-[0.88] tracking-[-0.04em] text-white text-[clamp(2.4rem,7vw,8rem)] mb-2">
          <SplitTextReveal
            splitBy="words"
            delay={0}
            stagger={0.06}
            duration={1}
            ease="cubic-bezier(0.16, 1, 0.3, 1)"
            immediate={true}
            as="span"
          >
            ARCHITECTURAL TALENT
          </SplitTextReveal>
        </h1>

        {/* Line 2: Curated for Excellence (Instrument Serif italic) */}
        <h2 className="font-[Instrument_Serif] italic font-normal leading-[0.92] tracking-[-0.02em] text-white text-[clamp(2.6rem,7.6vw,8.6rem)] mb-6">
          <SplitTextReveal
            splitBy="words"
            delay={0.15}
            stagger={0.06}
            duration={1}
            ease="cubic-bezier(0.16, 1, 0.3, 1)"
            immediate={true}
            as="span"
          >
            Curated for Excellence
          </SplitTextReveal>
        </h2>

        {/* Bottom Hairline Bar: Editorial Copy Left + CTA Right */}
        <div className="border-t border-white/15 pt-6 mt-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <p className="max-w-md text-sm text-neutral-300 leading-relaxed">
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
'use client';

import { Link } from '@tanstack/react-router';
import { IglooMonolithCanvas } from '@/components/canvas/IglooMonolithCanvas';
import { SplitTextReveal } from '@/components/motion/SplitTextReveal';

export function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-between pt-24 pb-8 px-4 md:px-8 overflow-hidden" data-lenis-prevent>
      {/*
         3D Z-INDEX TYPOGRAPHY SANDWICH:
         Layer order (back to front):
         1. IglooMonolithCanvas (z-0) - 3D monolith in background
         2. Monumental typography with mix-blend-difference (z-10) - ARCHITECTURAL TALENT / Curated for Excellence
         3. HUD metadata (z-20) - [ 00 / ... ]
         4. Bottom hairline bar with copy + CTA (z-20)
       */}

      {/* Layer 1: 3D Monolith Canvas - full bleed, blends seamlessly into #050505 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <IglooMonolithCanvas />
      </div>

      {/* Layer 2: Monumental Display Typography with mix-blend-difference */}
      {/* This sits "through" the monolith - letters invert where monolith passes */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 pointer-events-none" style={{ perspective: '1000px' }}>
        <div className="text-center w-full px-4">
          {/* Line 1: ARCHITECTURAL TALENT - Bold Syne uppercase */}
          <h1 className="font-heading font-extrabold uppercase leading-[0.92] tracking-[-0.03em] whitespace-nowrap text-white text-[clamp(1.65rem,4.3vw,5rem)] mb-3 mix-blend-difference select-none" style={{ transform: 'translateZ(40px)' }}>
            <SplitTextReveal
              splitBy="words"
              delay={0}
              stagger={0.05}
              duration={1.2}
              ease="cubic-bezier(0.16, 1, 0.3, 1)"
              immediate={true}
              as="span"
            >
              ARCHITECTURAL TALENT
            </SplitTextReveal>
          </h1>

          {/* Line 2: Curated for Excellence - Tall italic Instrument Serif */}
          <h2 className="font-[Instrument_Serif] italic font-light leading-[0.95] text-white text-[clamp(1.85rem,4.8vw,5.6rem)] mb-2 mix-blend-difference select-none" style={{ transform: 'translateZ(80px)' }}>
            <SplitTextReveal
              splitBy="words"
              delay={0.1}
              stagger={0.05}
              duration={1.2}
              ease="cubic-bezier(0.16, 1, 0.3, 1)"
              immediate={true}
              as="span"
            >
              Curated for Excellence
            </SplitTextReveal>
          </h2>
        </div>
      </div>

      {/* Layer 3: Top HUD Metadata */}
      <div className="relative z-20 flex justify-between font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-400 pointer-events-none">
        <span>[ 00 / ARCHITECTURAL TALENT ARCHIVE ]</span>
        <span>[ // INDEPENDENT PRACTICE 2026 ]</span>
      </div>

      {/* Layer 4: Bottom Hairline Bar - Editorial Copy Left + CTA Right */}
      <div className="relative z-20 w-full pointer-events-auto">
        <div className="border-t border-white/15 pt-6 mt-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <p className="max-w-md text-sm text-neutral-300 leading-relaxed">
            Every professional vetted. Every project curated with precision.
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
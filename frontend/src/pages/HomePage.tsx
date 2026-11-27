'use client';

import { IglooMonolithCanvas } from '@/components/canvas/IglooMonolithCanvas';
import { SplitTextReveal } from '@/components/motion/SplitTextReveal';
import { DualLayerTextRoll } from '@/components/motion/DualLayerTextRoll';
import { KineticScrollMarquee } from '@/components/motion/KineticScrollMarquee';
import { SliceStripGallery } from '@/components/motion/SliceStripGallery';
import { CinemaMedia } from '@/components/ui/CinemaMedia';
import { Footer } from '@/components/sections/Footer';
import { usePreloader } from '@/contexts/PreloaderContext';
import { NumericPreloader } from '@/components/motion/NumericPreloader';
import { SmoothScrollProvider } from '@/components/motion/SmoothScrollProvider';
import { CustomCursorProvider } from '@/components/motion/CustomCursor';
import { Link } from '@tanstack/react-router';

export function HomePage() {
  const { setPreloaderComplete } = usePreloader();

  // Wrap everything in motion providers
  return (
    <SmoothScrollProvider>
      <CustomCursorProvider>
        <NumericPreloader onComplete={() => setPreloaderComplete(true)} />
        <div className="relative min-h-screen bg-[var(--color-bg)]" data-lenis-prevent>
          {/* Section 1 — Interactive 3D Monolith Hero */}
          <section className="relative min-h-[100dvh] flex flex-col overflow-hidden" data-lenis-prevent>
            {/* Full-bleed 3D Monolith Canvas */}
            <IglooMonolithCanvas />

            {/* Corner HUD Metadata */}
            <div className="absolute top-0 left-0 right-0 z-10 pt-20 md:pt-24 px-4 md:px-8 flex flex-wrap justify-between gap-2 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.18em] md:tracking-[0.22em] text-[var(--color-text-subtle)] pointer-events-none">
              <div className="flex flex-col gap-1">
                <span>[ 00 / ARCHITECTURAL TALENT ARCHIVE ]</span>
                <span className="opacity-50">[ INDEPENDENT PRACTICE 2026 ]</span>
              </div>
              <div className="flex flex-col gap-1 items-end text-right">
                <span>[ // CURATED NETWORK ]</span>
                <span className="opacity-50">[ // WORLDWIDE ]</span>
              </div>
            </div>

            {/* Bottom Monumental Typography */}
            <div className="relative z-10 mt-auto w-full overflow-hidden px-4 md:px-8 pb-6 md:pb-8">
              {/* 2-line display: Syne uppercase + Instrument Serif italic */}
              <SplitTextReveal
                splitBy="lines"
                delay={0}
                stagger={0.1}
                duration={1.2}
                ease="cubic-bezier(0.16, 1, 0.3, 1)"
                immediate={true}
                as="div"
                className="mb-6"
              >
                ARCHITECTURAL TALENT
                <br />
                CURATED FOR EXCELLENCE
              </SplitTextReveal>

              <SplitTextReveal
                splitBy="lines"
                delay={0.2}
                stagger={0.1}
                duration={1.2}
                ease="cubic-bezier(0.16, 1, 0.3, 1)"
                immediate={true}
                as="div"
                className="mb-8 font-[Instrument_Serif] italic font-light text-[var(--color-text-muted)] leading-relaxed tracking-[0.01em]"
                style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)' }}
              >
                A meticulously curated network of world-class architects,
                <br />
                spatial designers, and architectural technologists.
              </SplitTextReveal>

              {/* Bottom bar: statement left, CTA right */}
              <div className="border-t border-white/15 pt-5 md:pt-6 mt-5 md:mt-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
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

          {/* Section 2 — Kinetic Marquee & Editorial Spread */}
          <section className="relative border-t border-white/15 overflow-hidden" data-lenis-prevent>
            {/* Kinetic Scroll Marquee */}
            <KineticScrollMarquee
              texts={[
                'ARCHITECTURAL TALENT ARCHIVE  —  INDEPENDENT PRACTICE 2026  —  ARCHITECTURAL TALENT ARCHIVE  —  INDEPENDENT PRACTICE 2026',
                'ARCHITECTURAL TALENT ARCHIVE  —  INDEPENDENT PRACTICE 2026  —  ARCHITECTURAL TALENT ARCHIVE  —  INDEPENDENT PRACTICE 2026',
              ]}
            />

            {/* Asymmetrical Swiss Grid Editorial */}
            <div className="container border-b border-white/15">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 py-16 md:py-20">
                {/* Left Column - Editorial Manifesto */}
                <div className="lg:col-span-5 pt-4 lg:pt-8">
                  <div className="mb-8 lg:mb-12">
                    <span className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase block mb-4">
                      [ 01 / PRACTICE ]
                    </span>
                    <SplitTextReveal
                      splitBy="lines"
                      delay={0}
                      stagger={0.1}
                      duration={1}
                      ease="cubic-bezier(0.16, 1, 0.3, 1)"
                      as="h2"
                      className="font-[Instrument_Serif] italic font-light text-[var(--color-text-muted)] leading-[0.95] text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
                    >
                      We believe the future
                      <br />
                      of architectural practice
                      <br />
                      is a partnership
                    </SplitTextReveal>
                  </div>

                  <p className="font-[Instrument_Serif] italic font-light text-[var(--color-text-muted)] leading-relaxed tracking-[0.01em] text-[clamp(1.125rem,2vw,1.5rem)] mb-12 max-w-none">
                    Every project posted, every proposal sent, every milestone reached is a step toward a world where talent finds its match without friction, where clients find craft without compromise, and where the best work rises on merit alone.
                  </p>

                  <div className="w-16 h-px bg-[var(--color-text-subtle)] mb-6" />
                  <Link
                    to="/projects"
                    className="inline-flex items-center justify-center gap-2 border border-white px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors min-h-[48px] w-full sm:w-auto"
                  >
                    VIEW ROSTER
                  </Link>
                </div>

                {/* Right Column - Cinema Frame */}
                <div className="lg:col-span-7 relative" data-cursor="PLAY REEL">
                  <CinemaMedia
                    src="/media/arch-01.jpg"
                    aspectRatio={16 / 10}
                    className="w-full h-auto max-h-[600px] rounded-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 — Interactive Vertical-Slice Strip */}
          <SliceStripGallery />

          {/* Section 4 — Full-Bleed Discipline Index */}
          <section className="relative py-14 md:py-20 px-4 md:px-8 border-b border-white/15 overflow-hidden" data-lenis-prevent>
            <div className="container">
              <div className="mb-12 lg:mb-16">
                <span className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase block mb-4">
                  [ 02 / DISCIPLINES ]
                </span>
              </div>

              <div className="space-y-0">
                {[
                  {
                    number: '01',
                    title: 'Architecture & Spatial',
                    description: 'Architects, urban planners, spatial designers — mastering the built environment',
                    image: '/media/arch-01.jpg',
                  },
                  {
                    number: '02',
                    title: 'Digital Product Systems',
                    description: 'Product designers, design systems engineers, UX architects — systematic digital craft',
                    image: '/media/arch-02.jpg',
                  },
                  {
                    number: '03',
                    title: 'Creative Direction',
                    description: 'Art directors, brand strategists, creative technologists — vision made tangible',
                    image: '/media/arch-03.jpg',
                  },
                  {
                    number: '04',
                    title: 'Engineering & WebGL',
                    description: 'Creative developers, WebGL engineers, three.js specialists — code as craft',
                    image: '/media/arch-04.jpg',
                  },
                ].map((discipline, idx) => (
                  <DisciplineRow
                    key={discipline.number}
                    {...discipline}
                    isLast={idx === 3}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Section 5 — Monumental Footer */}
          <Footer />
        </div>
      </CustomCursorProvider>
    </SmoothScrollProvider>
  );
}

// Discipline Row Component - DualLayerTextRoll on hover + preview reveal
function DisciplineRow({
  number,
  title,
  description,
  image,
  isLast,
}: {
  number: string;
  title: string;
  description: string;
  image: string;
  isLast: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div
      className={`relative group border-b border-white/15 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isHovered ? 'opacity-100' : 'opacity-100'
      }`}
      style={{
        opacity: 1,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 py-8 lg:py-12 ${isLast ? '' : ''}`}>
        {/* Left Content */}
        <div className="flex-1 lg:w-2/3 min-w-0 pr-8 lg:pr-12">
          <div className="font-mono text-[var(--color-text-subtle)] text-xs md:text-sm tracking-wider uppercase mb-3">
            {number}
          </div>
          <DualLayerTextRoll index={number}>
            <h3 className="font-heading font-bold text-[var(--color-text)] uppercase tracking-[-0.02em] leading-[0.95] text-[clamp(1.75rem,3.5vw,3rem)]">
              {title}
            </h3>
          </DualLayerTextRoll>
          <p className="font-[Instrument_Serif] italic font-light text-[var(--color-text-muted)] leading-relaxed tracking-[0.01em] text-[clamp(1rem,1.5vw,1.125rem)] mt-3 max-w-xl">
            {description}
          </p>
        </div>

        {/* Right Preview - Pure borderless B&W image */}
        <div className="relative lg:w-1/3 flex-shrink-0">
          <div className="aspect-[16/10] lg:aspect-[16/10] w-full lg:w-[360px] overflow-hidden">
            <CinemaMedia
              src={image}
              aspectRatio={16 / 10}
              className={`w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isHovered ? 'scale-105' : 'scale-100'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Mobile: inline preview strip inside active row */}
      {isMobile && isHovered && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 border-t border-white/15 pt-4"
        >
          <div className="aspect-[16/9] w-full overflow-hidden">
            <CinemaMedia
              src={image}
              aspectRatio={16 / 9}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export { HomePage as default };
'use client';

import { HeroSection } from '@/components/sections/HeroSection';
import { EditorialParallaxStage } from '@/components/sections/EditorialParallaxStage';
import { GeometricCompassSection } from '@/components/sections/GeometricCompassSection';
import { SliceStripGallery } from '@/components/motion/SliceStripGallery';
import { InteractiveIndexSection } from '@/components/sections/InteractiveIndexSection';
import { usePreloader } from '@/contexts/PreloaderContext';
import { NumericPreloader } from '@/components/motion/NumericPreloader';
import { SmoothScrollProvider } from '@/components/motion/SmoothScrollProvider';

export function HomePage() {
  const { setPreloaderComplete } = usePreloader();

  // Wrap everything in motion providers
  return (
    <SmoothScrollProvider>
      <NumericPreloader onComplete={() => setPreloaderComplete(true)} />
      <div className="relative min-h-screen bg-[var(--color-bg)]" data-lenis-prevent>
        {/* Section 1 — Interactive 3D Monolith Hero */}
        <HeroSection />

        {/* Section 2 — Editorial Parallax Stage: Hollow typography + B&W photography + mix-blend-difference */}
        <EditorialParallaxStage />

        {/* Section 3 — Interactive Vertical-Slice Strip */}
        <SliceStripGallery />

        {/* Section 4 — Geometric Compass: Morphing SVG Sculpture */}
        <GeometricCompassSection />

        {/* Section 5 — Interactive Index: Hover-only discipline index */}
        <InteractiveIndexSection />

      </div>
    </SmoothScrollProvider>
  );
}

export { HomePage as default };
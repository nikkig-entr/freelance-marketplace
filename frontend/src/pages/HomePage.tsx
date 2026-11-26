import { HeroSection } from '@/components/sections/HeroSection';
import { EditorialManifestoSection } from '@/components/sections/EditorialManifestoSection';
import { CinemaReelSection } from '@/components/sections/CinemaReelSection';
import { InteractiveIndexSection } from '@/components/sections/InteractiveIndexSection';
import { CTASection } from '@/components/sections/CTASection';
import { Footer } from '@/components/sections/Footer';
import { usePreloader } from '@/contexts/PreloaderContext';

export function HomePage() {
  const { isPreloaderComplete } = usePreloader();

  return (
    <div className="space-y-0">
      <HeroSection isVisible={isPreloaderComplete} />
      <EditorialManifestoSection />
      <CinemaReelSection />
      <InteractiveIndexSection />
      <CTASection />
      <Footer />
    </div>
  );
}

export { HomePage as default };
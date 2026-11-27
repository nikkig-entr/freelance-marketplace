import { HeroSection } from '@/components/sections/HeroSection';
import { EditorialSplitSection } from '@/components/sections/EditorialSplitSection';
import { InteractiveIndexSection } from '@/components/sections/InteractiveIndexSection';
import { Footer } from '@/components/sections/Footer';
import { usePreloader } from '@/contexts/PreloaderContext';

export function HomePage() {
  const { isPreloaderComplete } = usePreloader();

  return (
    <div className="space-y-0">
      <HeroSection isVisible={isPreloaderComplete} />
      <EditorialSplitSection />
      <InteractiveIndexSection />
      <Footer />
    </div>
  );
}

export { HomePage as default };
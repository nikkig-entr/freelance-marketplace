import { HeroSection } from '@/components/sections/HeroSection';
import { BentoGridSection } from '@/components/sections/BentoGridSection';
import { AIShowcaseSection } from '@/components/sections/AIShowcaseSection';
import { CategoriesProjectsSection } from '@/components/sections/CategoriesProjectsSection';
import { PricingSection } from '@/components/sections/PricingSection';
import { CTASection } from '@/components/sections/CTASection';
import { Footer } from '@/components/sections/Footer';

export function HomePage() {
  return (
    <div className="space-y-0">
      <HeroSection />
      <BentoGridSection />
      <AIShowcaseSection />
      <CategoriesProjectsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}
import { HeroSection, RemoteWorkSection, CommunitySection, ProjectsSection, CTASection } from '@/components/sections';

export function HomePage() {
  return (
    <div className="space-y-0">
      <HeroSection />
      <RemoteWorkSection />
      <CommunitySection />
      <ProjectsSection />
      <CTASection />
    </div>
  );
}
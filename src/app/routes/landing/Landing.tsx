import { Wordmark } from '@/app/components/brand/Wordmark';
import { LocaleToggle } from '@/app/components/brand/LocaleToggle';
import { Hero, PlanTeaser, TrustStrip, HowItWorks } from './LandingSectionsA';
import { ScienceSection, RegimenTeaser, CtaBanner, ResearchSection, FinalCta, Footer } from './LandingSectionsB';

export function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-6 py-4">
        <Wordmark />
        <LocaleToggle />
      </header>
      <Hero />
      <PlanTeaser />
      <TrustStrip />
      <HowItWorks />
      <ScienceSection />
      <RegimenTeaser />
      <CtaBanner />
      <ResearchSection />
      <FinalCta />
      <Footer />
    </main>
  );
}

import { CircleCheck } from 'lucide-react';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useReducedMotion } from '@/app/lib/useReducedMotion';
import { cn } from '@/app/components/ui/utils';
import {
  Section,
  Button,
  ConcernCard,
  MediaCaption,
  MediaPlaceholder,
  Timeline,
  BeforeAfterSlider,
  Hero,
  CtaSection,
  SectionIntro,
  renderWithEmphasis,
  ScanMesh,
} from '@/app/components/roote';
import { PATHS } from '@/app/paths';
import { pickLocalized } from '@/content/localized';
import { getProduct } from '@/content/products';
import { getSolution } from '@/content/solutions';
import { brandLines, systemSteps } from '@/content/brand';
import { CONCERN_OPTIONS } from '@/content/assessment';
import type { MessageKey } from '@/i18n/messages';
import heroImage from '@/assets/heroes/Hero.png';
import concernThinning from '@/assets/concerns/solution-thinning-crown.png';
import concernGray from '@/assets/concerns/solution-gray-advanced.png';
import concernBoth from '@/assets/concerns/concern-both.png';
import scanBaseline from '@/assets/scans/scan-baseline.png';
import scanFinal from '@/assets/scans/scan-progress.png';
import step1Quiz from '@/assets/steps/step-1-quiz.png';
import step3Formula from '@/assets/steps/step-3-formula.png';
import step4Progress from '@/assets/steps/step-4-progress.png';
import step5Track from '@/assets/steps/step-5-track.png';
import level6 from '@/assets/products/Level 6.png';
import level10 from '@/assets/products/Level 10.png';
import level15 from '@/assets/products/Level 15.png';

const DENSITY_LEVEL_PHOTOS: Record<string, string> = {
  higher: level6,
  moderate: level10,
  advanced: level15,
};

/** One photo per systemSteps entry (content/brand.ts). */
const SYSTEM_STEP_PHOTOS: Record<string, string> = {
  analyze: step1Quiz,
  personalize: step3Formula,
  treat: step4Progress,
  track: step5Track,
};

/* 1 — Hero ----------------------------------------------------------------- */
function HomeHero() {
  const t = useT();
  const cl = useLocale().locale;
  const withLocale = useLocalizedPath();
  return (
    <Hero
      title={renderWithEmphasis(pickLocalized(brandLines.headline, cl))}
      body={t('marketing.home.hero.support')}
      cta={
        <Button to={withLocale(PATHS.analysis)} caps className="w-full sm:w-auto">
          {t('marketing.nav.cta')}
        </Button>
      }
      image={{
        src: heroImage,
        alt: t('marketing.home.hero.mediaAlt'),
        className: 'shadow-product',
      }}
    />
  );
}

/* 2 — Trust / system strip ---------------------------------------------- */
function SystemStrip() {
  const t = useT();
  const reduce = useReducedMotion();
  const items = [
    t('marketing.home.strip.item1'),
    t('marketing.home.strip.item2'),
    t('marketing.home.strip.item3'),
    t('marketing.home.strip.item4'),
  ];
  // Below `lg` the four items no longer fit one row — instead of wrapping to
  // multiple lines, the strip scrolls. The track is the item list twice
  // back-to-back so an exact -50% translate loops seamlessly; the second copy
  // is aria-hidden so it isn't announced twice. Reduced-motion gets a single,
  // plain, horizontally-scrollable copy instead of the auto-scroll.
  const trackItems = reduce ? items : [...items, ...items];

  const renderItem = (item: string, i: number) => (
    <li
      key={i}
      aria-hidden={!reduce && i >= items.length ? true : undefined}
      className="flex shrink-0 items-center gap-2 whitespace-nowrap"
    >
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
      {item}
    </li>
  );

  return (
    <Section
      tone="cream"
      width="content"
      animate={false}
      className="overflow-hidden border-b border-accent !py-4 !lg:py-4"
    >
      {/* lg+: comfortably fits one static row */}
      <ul className="hidden flex-wrap items-center justify-center gap-x-8 font-body text-sm text-muted-foreground lg:flex">
        {items.map(renderItem)}
      </ul>
      {/* below lg: auto-scrolling marquee, or a plain scrollable row when reduced motion is preferred */}
      <div className={cn('lg:hidden', reduce ? 'overflow-x-auto' : 'overflow-hidden')}>
        <ul
          className={cn(
            'flex w-max items-center gap-x-8 font-body text-sm text-muted-foreground',
            !reduce && 'roote-marquee-track',
          )}
        >
          {trackItems.map(renderItem)}
        </ul>
      </div>
    </Section>
  );
}

/* 3 — Choose your concern --------------------------------------------- */
function Concern() {
  const t = useT();
  const cl = useLocale().locale;
  const withLocale = useLocalizedPath();
  const media: Record<string, string> = {
    thinning: t('marketing.home.concern.thinningMediaAlt'),
    gray: t('marketing.home.concern.grayMediaAlt'),
    both: t('marketing.home.concern.bothMediaAlt'),
  };
  const images: Record<string, string> = {
    thinning: concernThinning,
    gray: concernGray,
    both: concernBoth,
  };
  return (
    <Section tone="cream" width="content" gap={12}>
      <SectionIntro eyebrow={t('marketing.home.concern.eyebrow')} title={t('marketing.home.concern.heading')} />
      <div className="flex flex-col gap-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {CONCERN_OPTIONS.map((c) => (
            <ConcernCard
              key={c.value}
              title={pickLocalized(c.title, cl)}
              description={pickLocalized(c.description, cl)}
              to={withLocale(PATHS.analysis)}
              mediaAlt={media[c.value]}
              mediaLabel={`${pickLocalized(c.title, cl)}: clinical crop, no face`}
              image={images[c.value]}
            />
          ))}
        </div>
        {/* All three cards route to the same assessment — this shared CTA
            below the grid instead routes to the Magazine for further reading. */}
        <div className="flex justify-center">
          <Button to={withLocale(PATHS.magazine)} caps className="w-full sm:w-auto">
            {t('marketing.home.concern.cta')}
          </Button>
        </div>
      </div>
    </Section>
  );
}

/* 4 — How ROOTÉ works (the 4-step sequence) --------------------------- */
const SYSTEM_STEP_ALT_KEY: Record<string, MessageKey> = {
  analyze: 'marketing.howItWorks.step1MediaAlt',
  personalize: 'marketing.howItWorks.step3MediaAlt',
  treat: 'marketing.howItWorks.step4MediaAlt',
  track: 'marketing.home.how.step5MediaAlt',
};

function HowItWorksSection() {
  const t = useT();
  const cl = useLocale().locale;
  const withLocale = useLocalizedPath();
  return (
    <Section tone="cream" width="content" gap={12} className="-mt-24">
      <SectionIntro eyebrow={t('marketing.home.how.eyebrow')} title={t('marketing.home.how.heading')} />
      <div className="flex flex-col gap-8">
        <ol className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {systemSteps.map((step) => (
            <li key={step.key} className="flex flex-col gap-4 lg:gap-8">
              <div className="relative aspect-square w-full">
                <img
                  src={SYSTEM_STEP_PHOTOS[step.key]}
                  alt={t(SYSTEM_STEP_ALT_KEY[step.key])}
                  loading="lazy"
                  className="h-full w-full rounded-sm object-cover"
                />
                {step.key === 'analyze' && <ScanMesh className="absolute inset-0 h-full w-full" />}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex flex-row items-baseline gap-2">
                  <span className="shrink-0 font-display text-lg lg:text-xl text-accent">{step.n}.</span>
                  <p className="font-display text-lg lg:text-xl text-foreground">{pickLocalized(step.title, cl)}</p>
                </div>
                <p className="font-body text-sm lg:text-base text-muted-foreground">{pickLocalized(step.body, cl)}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="flex justify-center">
          <Button to={withLocale(PATHS.faq)} caps className="w-full sm:w-auto">
            {t('marketing.home.how.cta')}
          </Button>
        </div>
      </div>
    </Section>
  );
}

/* 5 — Personalized system + Progress/durations (one program, over time) --
   Combined into one continuous teal band with PersonalizedSystem below
   (same tone, back to back) — one section's worth of top/bottom padding
   instead of two, with a smaller gap between the two content blocks.
   Every element from both original sections is unchanged. */
function SystemAndProgress() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const milestones = [
    { id: 'd0', dayLabel: 'Day 0', title: t('marketing.home.progress.baseline'), state: 'done' as const },
    { id: 'd30', dayLabel: 'Day 30', title: t('marketing.home.progress.progressPhoto'), state: 'done' as const },
    { id: 'd60', dayLabel: 'Day 60', title: t('marketing.home.progress.progressPhoto'), state: 'done' as const },
    { id: 'd90', dayLabel: 'Day 90', title: t('marketing.home.progress.progressScan'), state: 'current' as const },
    { id: 'd180', dayLabel: 'Day 180', title: t('marketing.home.progress.finalScan'), state: 'upcoming' as const },
  ];
  const includes = [
    t('marketing.home.durations.includesDensity'),
    t('marketing.home.durations.includesShampoo'),
    t('marketing.home.durations.includesTracking'),
  ];
  return (
    <Section tone="teal" width="content" gap={20}>
      <div className="flex flex-col gap-12">
        <SectionIntro
          onInk
          eyebrow={t('marketing.home.system.eyebrow')}
          title={t('marketing.home.system.heading')}
          body={t('marketing.home.system.body')}
        />
        <div className="grid gap-8 lg:grid-cols-2">
          <div data-pack="men" className="flex flex-col gap-8">
            <MediaPlaceholder
              alt={t('marketing.home.system.menMediaAlt')}
              label={`${t('marketing.home.system.menMediaAlt')}: product photography`}
              ratio="4 / 3"
              tone="cream"
              className="w-full shadow-product"
            />
            <p className="u-caps text-center font-body text-sm font-medium text-foreground">{t('marketing.home.system.men')}</p>
          </div>
          <div data-pack="women" className="flex flex-col gap-8">
            <MediaPlaceholder
              alt={t('marketing.home.system.womenMediaAlt')}
              label={`${t('marketing.home.system.womenMediaAlt')}: product photography`}
              ratio="4 / 3"
              tone="card"
              className="w-full shadow-product"
            />
            <p className="u-caps text-center font-body text-sm font-medium text-foreground">{t('marketing.home.system.women')}</p>
          </div>
        </div>
        <div className="flex justify-center">
          <Button to={withLocale(PATHS.products)} caps className="w-full sm:w-auto">
            {t('marketing.home.system.cta')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-12">
        <SectionIntro
          onInk
          eyebrow={t('marketing.home.progress.eyebrow')}
          title={t('marketing.home.progress.heading')}
          body={t('marketing.home.progress.body')}
        />
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col gap-8">
            <Timeline milestones={milestones} className="gap-4" dayLabelClassName="text-ink-foreground" />
            <div className="flex flex-col gap-4 border-t border-ink-foreground/15 pt-6">
              <p className="font-body text-sm font-semibold uppercase text-ink-foreground">
                {t('marketing.home.durations.includesHeading')}
              </p>
              <ul className="flex flex-col gap-1 font-body text-base text-ink-foreground">
                {includes.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <div>
                <Button to={withLocale(PATHS.hairScan)} caps className="w-full sm:w-auto">
                  {t('marketing.home.progress.cta')}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <BeforeAfterSlider
              ariaLabel={`${t('marketing.home.progress.before')} / ${t('marketing.home.progress.after')}`}
              beforeLabel={t('marketing.home.progress.before')}
              afterLabel={t('marketing.home.progress.after')}
              className="border-accent/50"
              before={
                <img
                  src={scanBaseline}
                  alt={t('marketing.home.progress.beforeMediaAlt')}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              }
              after={
                <img
                  src={scanFinal}
                  alt={t('marketing.home.progress.afterMediaAlt')}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              }
            />
            <p className="font-body text-sm text-ink-foreground">{t('marketing.home.progress.compareCaption')}</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* 6 — Density System spotlight (severity levels) ------------------ */
function DensitySystem() {
  const t = useT();
  const cl = useLocale().locale;
  const withLocale = useLocalizedPath();
  const thinning = getSolution('thinning')!;
  return (
    <Section tone="cream" width="content" gap={12}>
      <SectionIntro
        eyebrow={t('marketing.home.density.eyebrow')}
        title={t('marketing.home.density.heading')}
        body={t('marketing.home.density.note')}
      />
      <div className="flex flex-col gap-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {thinning.severityLevels.map((lvl) => (
            <MediaCaption
              key={lvl.id}
              media={<img src={DENSITY_LEVEL_PHOTOS[lvl.id]} alt="" loading="lazy" className="aspect-[3/4] w-full rounded-sm object-contain" />}
              title={pickLocalized(lvl.title, cl)}
              description={pickLocalized(lvl.description, cl)}
            />
          ))}
        </div>
        <div className="flex justify-center">
          <Button to={withLocale(PATHS.solutionThinning)} caps className="w-full sm:w-auto">
            {t('marketing.home.density.cta')}
          </Button>
        </div>
      </div>
    </Section>
  );
}

/* 7 — Gray System spotlight (Gray Support + Gray Serum bundle) ---- */
function GraySystem() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const support = getProduct('gray-support')!;
  const serum = getProduct('gray-serum')!;
  const packs = [
    { id: 'men' as const, label: t('marketing.home.gray.forMen') },
    { id: 'women' as const, label: t('marketing.home.gray.forWomen') },
  ];
  return (
    <Section tone="cream" width="content" className="-mt-24">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col justify-center gap-4">
          <SectionIntro
            eyebrow={t('marketing.home.gray.eyebrow')}
            title={t('marketing.home.gray.heading')}
            body={t('marketing.home.gray.body')}
          />
          <Button to={withLocale(PATHS.solutionGray)} caps className="w-full sm:w-auto mt-4">
            {t('marketing.home.gray.cta')}
          </Button>
        </div>
        {packs.map((pack) => (
          <MediaCaption
            key={pack.id}
            media={
              <MediaPlaceholder
                alt={t('marketing.home.gray.mediaAlt')}
                label={`${t('marketing.home.gray.mediaAlt')}: product photography`}
                ratio="3 / 4"
                tone={pack.id === 'men' ? 'teal' : 'card'}
                className="w-full"
              />
            }
            title={pack.label}
            description={`${support.name} + ${serum.name}`}
          />
        ))}
      </div>
    </Section>
  );
}

/* 8 — Final CTA ------------------------------------------------- */
const FINAL_CTA_BENEFITS: Array<{ bodyKey: MessageKey }> = [
  { bodyKey: 'marketing.sys.pillar.analyzeBody' },
  { bodyKey: 'marketing.sys.pillar.treatBody' },
  { bodyKey: 'marketing.sys.pillar.trackBody' },
];

function FinalCta() {
  const t = useT();
  return (
    <CtaSection
      title={t('marketing.home.finalCta.heading')}
      body={t('marketing.home.finalCta.body')}
      items={FINAL_CTA_BENEFITS.map((b) => (
        <>
          <CircleCheck aria-hidden strokeWidth={1.5} className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <span className="font-body text-base text-ink-foreground">{t(b.bodyKey)}</span>
        </>
      ))}
      image={{ src: heroImage, alt: t('marketing.home.hero.mediaAlt') }}
    />
  );
}

export function Home() {
  return (
    <>
      <HomeHero />
      <SystemStrip />
      <Concern />
      <HowItWorksSection />
      <SystemAndProgress />
      <DensitySystem />
      <GraySystem />
      <FinalCta />
    </>
  );
}

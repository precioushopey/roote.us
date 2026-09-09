import { useT, useContentLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useReducedMotion } from '@/app/lib/useReducedMotion';
import { cn } from '@/app/components/ui/utils';
import {
  Section,
  DisplayTitle,
  Prose,
  Eyebrow,
  Button,
  ConcernCard,
  Timeline,
  BeforeAfterSlider,
} from '@/app/components/roote';
import { EXTERNAL_ASSESSMENT_URL } from '@/app/paths';
import { pickLocalized } from '@/content/localized';
import { getProduct } from '@/content/products';
import { getSolution } from '@/content/solutions';
import { brandLines, systemSteps } from '@/content/brand';
import { CONCERN_OPTIONS } from '@/content/assessment';
import type { MessageKey } from '@/i18n/messages';
import heroImage from '@/assets/heroes/Hero.png';
import concernThinning from '@/assets/concerns/concern-thinning.png';
import concernGray from '@/assets/concerns/concern-gray.png';
import concernBoth from '@/assets/concerns/concern-both.png';
import systemMen from '@/assets/bundles/system-men.png';
import systemWomen from '@/assets/bundles/system-women.png';
import scanBaseline from '@/assets/scans/scan-baseline.png';
import scanFinal from '@/assets/scans/scan-progress.png';
import step1Quiz from '@/assets/steps/step-1-quiz.png';
import step2Scan from '@/assets/steps/step-2-scan.png';
import step3Formula from '@/assets/steps/step-3-formula.png';
import step4Progress from '@/assets/steps/step-4-progress.png';
import step5Track from '@/assets/steps/step-5-track.png';
import grayBundleMen from '@/assets/bundles/gray-bundle-men.png';
import grayBundleWomen from '@/assets/bundles/gray-bundle-women.png';
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
  understand: step2Scan,
  personalize: step3Formula,
  treat: step4Progress,
  track: step5Track,
};

/** Splits on `*word*` markers, rendering the marked parts in italic and
 *  leaving everything else in the surrounding (normal) style. */
function renderWithEmphasis(text: string) {
  return text.split(/\*(.+?)\*/g).map((part, i) => (i % 2 === 1 ? <em key={i}>{part}</em> : part));
}

/* 1 — Hero ----------------------------------------------------------------- */
function Hero() {
  const t = useT();
  const cl = useContentLocale();
  const [line1, line2] = pickLocalized(brandLines.headline, cl).split('\n');
  return (
    <Section tone="teal" width="content" animate={false} className="overflow-hidden py-12 md:py-0">
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col items-start gap-6 text-start">
          <h1
            className="font-medium leading-[1.15]"
            style={{ fontSize: 'clamp(1.875rem, 4vw, 3rem)', fontFamily: "'Frank Ruhl Libre', serif" }}
          >
            {renderWithEmphasis(line1)}
            <br />
            {renderWithEmphasis(line2)}
          </h1>
          <Prose size="lg" className="max-w-lg text-ink-foreground">
            {t('marketing.home.hero.support')}
          </Prose>
          <Button to={EXTERNAL_ASSESSMENT_URL} external size="lg" caps className="w-full text-sm sm:w-auto">
            {t('marketing.nav.cta')}
          </Button>
        </div>
        <div className="relative h-[380px] sm:h-[480px] lg:h-[600px] xl:h-[680px] -mt-24">
          <img
            src={heroImage}
            alt={t('marketing.home.hero.mediaAlt')}
            className="absolute inset-x-0 bottom-0 mx-auto h-full w-auto max-w-full object-contain object-bottom drop-shadow-[0_30px_40px_rgba(6,46,49,0.18)]"
          />
        </div>
      </div>
    </Section>
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
      space="tight"
      width="content"
      animate={false}
      className="overflow-hidden border-b border-accent py-4 md:py-4"
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
  const cl = useContentLocale();
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
    <Section tone="cream" width="content">
      <Eyebrow>{t('marketing.home.concern.eyebrow')}</Eyebrow>
      <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
        {t('marketing.home.concern.heading')}
      </DisplayTitle>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {CONCERN_OPTIONS.map((c) => (
          <ConcernCard
            key={c.value}
            title={pickLocalized(c.title, cl)}
            description={pickLocalized(c.description, cl)}
            to={EXTERNAL_ASSESSMENT_URL}
            external
            mediaAlt={media[c.value]}
            mediaLabel={`${pickLocalized(c.title, cl)}: clinical crop, no face`}
            image={images[c.value]}
          />
        ))}
      </div>
      {/* All three cards route to the same assessment — one shared CTA
          instead of repeating the same button three times. */}
      <div className="mt-8 flex justify-center">
        <Button to={EXTERNAL_ASSESSMENT_URL} external size="lg" caps className="w-full text-sm sm:w-auto">
          {t('marketing.home.concern.cta')}
        </Button>
      </div>
    </Section>
  );
}

/* 4 — How ROOTÉ works (the 5-step sequence) --------------------------- */
const SYSTEM_STEP_ALT_KEY: Record<string, MessageKey> = {
  analyze: 'marketing.howItWorks.step1MediaAlt',
  understand: 'marketing.howItWorks.step2MediaAlt',
  personalize: 'marketing.howItWorks.step3MediaAlt',
  treat: 'marketing.howItWorks.step4MediaAlt',
  track: 'marketing.home.how.step5MediaAlt',
};

function HowItWorksSection() {
  const t = useT();
  const cl = useContentLocale();
  return (
    <Section tone="cream" width="content">
      <Eyebrow>{t('marketing.home.how.eyebrow')}</Eyebrow>
      <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
        {t('marketing.home.how.heading')}
      </DisplayTitle>
      <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
        {systemSteps.map((step) => (
          <li key={step.key} className="flex flex-col gap-3">
            <img
              src={SYSTEM_STEP_PHOTOS[step.key]}
              alt={t(SYSTEM_STEP_ALT_KEY[step.key])}
              className="aspect-square w-full rounded-sm object-cover"
            />
            <div className="flex flex-row items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent font-display text-sm text-accent">
                {step.n}
              </span>
              <p className="font-display text-md text-foreground">{pickLocalized(step.title, cl)}</p>
            </div>
            <p className="font-body text-sm text-muted-foreground">{pickLocalized(step.body, cl)}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* 5 — ROOTÉ hair analysis (data-as-surface) -------------------------- */
/* 6 — Personalized system (men teal / women cream) ------------------ */
/* 10 — ROOTÉ Progress + Program durations (one program, over time) --
   Combined into one continuous teal band with PersonalizedSystem below
   (same tone, back to back) — one section's worth of top/bottom padding
   instead of two, with a smaller gap between the two content blocks.
   Every element from both original sections is unchanged. */
function SystemAndProgress() {
  const t = useT();
  const milestones = [
    { id: 'd0', dayLabel: 'Day 0', title: t('marketing.home.progress.baseline'), state: 'done' as const },
    { id: 'd30', dayLabel: 'Day 30', title: t('marketing.home.progress.progressPhoto'), state: 'done' as const },
    { id: 'd60', dayLabel: 'Day 60', title: t('marketing.home.progress.progressPhoto'), state: 'current' as const },
    { id: 'd90', dayLabel: 'Day 90', title: t('marketing.home.progress.progressScan'), state: 'upcoming' as const },
    { id: 'd180', dayLabel: 'Day 180', title: t('marketing.home.progress.finalScan'), state: 'upcoming' as const },
  ];
  const includes = [
    t('marketing.home.durations.includesDensity'),
    t('marketing.home.durations.includesShampoo'),
    t('marketing.home.durations.includesTracking'),
  ];
  return (
    <Section tone="teal" width="content">
      <Eyebrow className="text-ink-foreground/70">{t('marketing.home.system.eyebrow')}</Eyebrow>
      <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
        {t('marketing.home.system.heading')}
      </DisplayTitle>
      <Prose className="mt-4 max-w-2xl text-ink-foreground/75">{t('marketing.home.system.body')}</Prose>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div data-pack="men">
          <img
            src={systemMen}
            alt={t('marketing.home.system.menMediaAlt')}
            className="aspect-[4/3] w-full rounded-sm object-contain drop-shadow-[0_30px_40px_rgba(6,46,49,0.18)]"
          />
          <p className="u-caps mt-4 text-center font-body text-sm font-semibold text-foreground">{t('marketing.home.system.men')}</p>
        </div>
        <div data-pack="women">
          <img
            src={systemWomen}
            alt={t('marketing.home.system.womenMediaAlt')}
            className="aspect-[4/3] w-full rounded-sm object-contain drop-shadow-[0_30px_40px_rgba(6,46,49,0.18)]"
          />
          <p className="u-caps mt-4 text-center font-body text-sm font-semibold text-foreground">{t('marketing.home.system.women')}</p>
        </div>
      </div>

      <div className="mt-16 md:mt-20">
        <Eyebrow className="text-ink-foreground/70">{t('marketing.home.progress.eyebrow')}</Eyebrow>
        <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
          {t('marketing.home.progress.heading')}
        </DisplayTitle>
        <Prose size="lg" className="mt-4 max-w-2xl text-ink-foreground/75">{t('marketing.home.progress.body')}</Prose>
        <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Timeline milestones={milestones} className="gap-3" dayLabelClassName="text-ink-foreground/70" />
            <div className="mt-8 border-t border-ink-foreground/15 pt-6">
              <p className="font-body text-sm font-semibold uppercase text-ink-foreground">
                {t('marketing.home.durations.includesHeading')}
              </p>
              <ul className="mt-3 flex flex-col gap-1.5 font-body text-base text-ink-foreground">
                {includes.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <BeforeAfterSlider
              ariaLabel={`${t('marketing.home.progress.before')} / ${t('marketing.home.progress.after')}`}
              beforeLabel={t('marketing.home.progress.before')}
              afterLabel={t('marketing.home.progress.after')}
              className="border-accent/50"
              before={
                <img
                  src={scanBaseline}
                  alt={t('marketing.home.progress.beforeMediaAlt')}
                  className="aspect-[4/3] w-full object-cover"
                />
              }
              after={
                <img
                  src={scanFinal}
                  alt={t('marketing.home.progress.afterMediaAlt')}
                  className="aspect-[4/3] w-full object-cover"
                />
              }
            />
            <p className="mt-2 font-body text-sm text-ink-foreground">{t('marketing.home.progress.compareCaption')}</p>
          </div>
        </div>
      </div>
    </Section>
  );
}


/* 12 — Density System spotlight (severity levels) ------------------ */
function DensitySystem() {
  const t = useT();
  const cl = useContentLocale();
  const thinning = getSolution('thinning')!;
  return (
    <Section tone="cream" width="content">
      <Eyebrow>{t('marketing.home.density.eyebrow')}</Eyebrow>
      <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
        {t('marketing.home.density.heading')}
      </DisplayTitle>
      <Prose className="mt-4 max-w-2xl">{t('marketing.home.density.note')}</Prose>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {thinning.severityLevels.map((lvl) => (
          <div key={lvl.id} className="flex flex-col items-center gap-0 text-center">
            <img src={DENSITY_LEVEL_PHOTOS[lvl.id]} alt="" className="aspect-[3/4] w-full rounded-sm object-contain" />
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-md text-foreground">{pickLocalized(lvl.title, cl)}</h3>
              <p className="font-body text-sm text-muted-foreground">{pickLocalized(lvl.description, cl)}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* 13 — Gray System spotlight (Gray Support + Gray Serum bundle) ---- */
function GraySystem() {
  const t = useT();
  const support = getProduct('gray-support')!;
  const serum = getProduct('gray-serum')!;
  const packs = [
    { id: 'men', label: t('marketing.home.gray.forMen'), image: grayBundleMen },
    { id: 'women', label: t('marketing.home.gray.forWomen'), image: grayBundleWomen },
  ];
  return (
    <Section tone="cream" width="content">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex flex-col justify-center">
          <Eyebrow>{t('marketing.home.gray.eyebrow')}</Eyebrow>
          <DisplayTitle as="h2" step="lg" className="mt-2">
            {t('marketing.home.gray.heading')}
          </DisplayTitle>
          <Prose className="mt-4">{t('marketing.home.gray.body')}</Prose>
        </div>
        {packs.map((pack) => (
          <div key={pack.id} className="flex flex-col items-center gap-0 text-center">
            <img
              src={pack.image}
              alt={t('marketing.home.gray.mediaAlt')}
              className="aspect-[3/4] w-full rounded-sm object-contain"
            />
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-md text-foreground">{pack.label}</h3>
              <p className="font-body text-sm text-muted-foreground">
                {support.name} + {serum.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* 14 — Final CTA ------------------------------------------------- */
const FINAL_CTA_BENEFITS: Array<{ titleKey: MessageKey; bodyKey: MessageKey }> = [
  { titleKey: 'marketing.sys.pillar.analyze', bodyKey: 'marketing.sys.pillar.analyzeBody' },
  { titleKey: 'marketing.sys.pillar.treat', bodyKey: 'marketing.sys.pillar.treatBody' },
  { titleKey: 'marketing.sys.pillar.track', bodyKey: 'marketing.sys.pillar.trackBody' },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={className} fill="none">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 10.3l2.5 2.5L14 7.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FinalCta() {
  const t = useT();
  return (
    <Section tone="teal" width="content" className="border-b border-accent">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-5">
          <DisplayTitle as="h2" step="xl" className="max-w-lg">
            {t('marketing.home.finalCta.heading')}
          </DisplayTitle>
          <Prose size="lg" className="max-w-lg text-ink-foreground/75">
            {t('marketing.home.finalCta.body')}
          </Prose>
          <ul className="flex flex-col gap-3">
            {FINAL_CTA_BENEFITS.map((b) => (
              <li key={b.titleKey} className="flex items-start gap-3">
                <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span className="max-w-md font-body text-sm text-ink-foreground/85">{t(b.bodyKey)}</span>
              </li>
            ))}
          </ul>
          <Button to={EXTERNAL_ASSESSMENT_URL} external size="lg" caps className="w-full text-sm sm:w-auto">
            {t('marketing.nav.cta')}
          </Button>
        </div>
        <img
          src={heroImage}
          alt={t('marketing.home.hero.mediaAlt')}
          className="w-full object-contain drop-shadow-[0_30px_40px_rgba(6,46,49,0.18)]"
        />
      </div>
    </Section>
  );
}

export function Home() {
  return (
    <>
      <Hero />
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

import { Link } from 'react-router';
import { useT, useContentLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useHeroLogoReveal } from '@/app/lib/useHeroLogoReveal';
import { useReducedMotion } from '@/app/lib/useReducedMotion';
import { cn } from '@/app/components/ui/utils';
import { Wordmark } from '@/app/components/brand/Wordmark';
import {
  Section,
  DisplayTitle,
  Prose,
  Eyebrow,
  Button,
  ConcernCard,
  Timeline,
  BeforeAfterSlider,
  Card,
} from '@/app/components/roote';
import { PATHS } from '@/app/paths';
import { pickLocalized } from '@/content/localized';
import { getProduct } from '@/content/products';
import { getSolution } from '@/content/solutions';
import { brandLines, systemSteps } from '@/content/brand';
import { CONCERN_OPTIONS } from '@/content/assessment';
import heroSystem from '@/assets/images/hero-system.png';
import concernThinning from '@/assets/images/concern-thinning.png';
import concernGray from '@/assets/images/concern-gray.png';
import concernBoth from '@/assets/images/concern-both.png';
import systemMen from '@/assets/images/system-men.png';
import systemWomen from '@/assets/images/system-women.png';
import scanBaseline from '@/assets/images/scan-baseline.png';
import scanFinal from '@/assets/images/scan-final.png';
import grayBundleMen from '@/assets/images/gray-bundle-men.png';
import grayBundleWomen from '@/assets/images/gray-bundle-women.png';
import level6 from '@/assets/images/Level 6.png';
import level10 from '@/assets/images/Level 10.png';
import level15 from '@/assets/images/Level 15.png';

const DENSITY_LEVEL_PHOTOS: Record<string, string> = {
  higher: level6,
  moderate: level10,
  advanced: level15,
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
  const withLocale = useLocalizedPath();
  const heroLogoReveal = useHeroLogoReveal();
  const [line1, line2] = pickLocalized(brandLines.headline, cl).split('\n');
  return (
    <Section
      tone="teal"
      width="content"
      animate={false}
      className="overflow-hidden pt-8 pb-24 sm:pt-12 md:pt-32 md:pb-32"
    >
      <div className="relative">
        {/* Fixed-height spacer (not margin, so it can't collapse) — keeps the
            wordmark's `top-16` anchor fixed while pushing the image itself
            down, so the logo reads against plain teal instead of the photo. */}
        <div aria-hidden className="h-32 sm:h-40 md:h-48" />
        <div
          role="img"
          aria-label={t('marketing.home.hero.mediaAlt')}
          className="relative aspect-[16/9] w-full overflow-hidden border border-gold-500 [border-radius:50%_50%_0_0/100%_100%_0_0]"
        >
          <img src={heroSystem} alt="" className="h-full w-full object-cover object-top" />
        </div>
        {/* Large wordmark sitting on the hero image — only ever visible at the
            very top of the homepage; it shrinks and fades as the page scrolls,
            seamlessly handing off to the navbar's own wordmark, which grows
            and fades in at the same rate (see useHeroLogoReveal). */}
        <Link
          to={withLocale(PATHS.home)}
          aria-label="ROOTÉ"
          aria-hidden={heroLogoReveal > 0.5}
          tabIndex={heroLogoReveal > 0.5 ? -1 : undefined}
          style={{
            opacity: 1 - heroLogoReveal,
            pointerEvents: heroLogoReveal > 0.5 ? 'none' : 'auto',
            transform: `translateY(-50%) scale(${1 - 0.45 * heroLogoReveal})`,
          }}
          className="absolute inset-x-0 top-16 mx-auto w-fit"
        >
          <Wordmark className="w-[min(88vw,64rem)]" />
        </Link>
      </div>
      <div className="mx-auto flex w-full flex-col items-center gap-6 pt-12 md:pt-32 text-center">
        <Eyebrow onDark className="rounded-full border border-gold-500 px-4 py-1.5">
          {t('marketing.home.hero.eyebrow')}
        </Eyebrow>
        <h1
          className="font-normal leading-[1.15] text-cream-100"
          style={{ fontSize: 'clamp(2.25rem, 5.5vw, 3.75rem)', fontFamily: "'Frank Ruhl Libre', serif" }}
        >
          {renderWithEmphasis(line1)}
          <br />
          {renderWithEmphasis(line2)}
        </h1>
        <Prose onDark size="lg" className="max-w-xl">
          {t('marketing.home.hero.support')}
        </Prose>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            to={withLocale(PATHS.analysis)}
            size="lg"
            caps
            className="bg-gold-500 text-ink text-xs md:text-sm font-bold hover:bg-gold-600"
          >
            {t('marketing.nav.cta')}
          </Button>
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
      className="overflow-hidden border-b border-gold-500 py-4 md:py-4"
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
      <DisplayTitle as="h2" step="lg">
        {t('marketing.home.concern.heading')}
      </DisplayTitle>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {CONCERN_OPTIONS.map((c) => (
          <ConcernCard
            key={c.value}
            title={pickLocalized(c.title, cl)}
            description={pickLocalized(c.description, cl)}
            to={withLocale(`${PATHS.analysis}?concern=${c.value}`)}
            cta={t('marketing.home.concern.cta')}
            mediaAlt={media[c.value]}
            mediaLabel={`${pickLocalized(c.title, cl)} — clinical crop, no face`}
            image={images[c.value]}
          />
        ))}
      </div>
    </Section>
  );
}

/* 4 — How ROOTÉ works (the 5-step sequence) --------------------------- */
function HowItWorksSection() {
  const t = useT();
  const cl = useContentLocale();
  return (
    <Section tone="cream" width="content">
      <Eyebrow>{t('marketing.home.how.eyebrow')}</Eyebrow>
      <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
        {t('marketing.home.how.heading')}
      </DisplayTitle>
      <ol className="relative mt-12 flex flex-col gap-10 lg:flex-row lg:gap-2">
        <span aria-hidden className="absolute left-[10%] right-[10%] top-5 hidden h-px bg-gold-500/40 lg:block" />
        {systemSteps.map((step) => (
          <li key={step.key} className="relative flex flex-1 gap-4 lg:flex-col lg:items-center lg:gap-3 lg:text-center">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-500 bg-background font-display text-sm text-accent">
              {String(step.n).padStart(2, '0')}
            </span>
            <div className="flex flex-col gap-1">
              <p className="font-display text-md text-foreground">{pickLocalized(step.title, cl)}</p>
              <p className="font-body text-sm text-muted-foreground">{pickLocalized(step.body, cl)}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* 5 — ROOTÉ hair analysis (data-as-surface) -------------------------- */
/* 6 — Personalized system (men teal / women cream) ------------------ */
function PersonalizedSystem() {
  const t = useT();
  return (
    <Section tone="teal" width="content">
      <Eyebrow onDark>{t('marketing.home.system.eyebrow')}</Eyebrow>
      <DisplayTitle as="h2" step="lg" onDark className="mt-2 max-w-2xl">
        {t('marketing.home.system.heading')}
      </DisplayTitle>
      <Prose onDark className="mt-4 max-w-2xl">{t('marketing.home.system.body')}</Prose>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Card padded={false} radius="2xl" className="overflow-hidden border-gold-500" data-pack="men">
          <div className="aspect-[4/3] w-full bg-background p-6">
            <img
              src={systemMen}
              alt={t('marketing.home.system.menMediaAlt')}
              className="h-full w-full object-contain"
            />
          </div>
          <p className="p-5 text-center font-display text-lg font-bold text-foreground">{t('marketing.home.system.men')}</p>
        </Card>
        <Card padded={false} radius="2xl" className="overflow-hidden border-gold-500" data-pack="women">
          <div className="aspect-[4/3] w-full bg-background p-6">
            <img
              src={systemWomen}
              alt={t('marketing.home.system.womenMediaAlt')}
              className="h-full w-full object-contain"
            />
          </div>
          <p className="p-5 text-center font-display text-lg font-bold text-foreground">{t('marketing.home.system.women')}</p>
        </Card>
      </div>
    </Section>
  );
}



/* 10 — ROOTÉ Progress + Program durations (one program, over time) -- */
function ProgressSection() {
  const t = useT();
  const withLocale = useLocalizedPath();
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
      <Eyebrow onDark>{t('marketing.home.progress.eyebrow')}</Eyebrow>
      <DisplayTitle as="h2" step="lg" onDark className="mt-2 max-w-2xl">
        {t('marketing.home.progress.heading')}
      </DisplayTitle>
      <Prose onDark size="lg" className="mt-4 max-w-2xl">{t('marketing.home.progress.body')}</Prose>
      <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Timeline milestones={milestones} className="gap-3" onDark />
          <div className="mt-8 border-t border-cream-100/15 pt-6">
            <p className="font-body text-sm font-semibold uppercase tracking-wide text-cream-100/70">
              {t('marketing.home.durations.includesHeading')}
            </p>
            <ul className="mt-3 flex flex-col gap-1.5 font-body text-base text-cream-100/85">
              {includes.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <Button
            to={withLocale(PATHS.system)}
            variant="secondary"
            size="sm"
            className="mt-6 border-cream-100/30 text-cream-100 hover:border-gold-500"
          >
            {t('marketing.home.progress.cta')}
          </Button>
        </div>
        <div>
          <BeforeAfterSlider
            ariaLabel={`${t('marketing.home.progress.before')} / ${t('marketing.home.progress.after')}`}
            beforeLabel={t('marketing.home.progress.before')}
            afterLabel={t('marketing.home.progress.after')}
            className="border-gold-500/50"
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
          <p className="mt-2 font-body text-sm text-cream-100/70">{t('marketing.home.progress.compareCaption')}</p>
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
          <div key={lvl.id} className="flex flex-col items-center gap-4 text-center">
            <div className="aspect-[3/4] w-full border border-gold-500 bg-white p-4 [border-radius:50%_50%_0_0/10rem_10rem_0_0]">
              <img src={DENSITY_LEVEL_PHOTOS[lvl.id]} alt="" className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="u-caps font-body text-sm text-foreground">{pickLocalized(lvl.title, cl)}</h3>
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
          <div key={pack.id} className="flex flex-col items-center gap-4 text-center">
            <div className="aspect-[3/4] w-full border border-gold-500 bg-white p-4 [border-radius:50%_50%_0_0/10rem_10rem_0_0]">
              <img src={pack.image} alt={t('marketing.home.gray.mediaAlt')} className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="u-caps font-body text-sm text-foreground">{pack.label}</h3>
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
function FinalCta() {
  const t = useT();
  const withLocale = useLocalizedPath();
  return (
    <Section tone="teal" width="readable" className="border-b border-gold-500 text-center">
      <div className="flex flex-col items-center gap-5">
        <DisplayTitle as="h2" step="xl" onDark align="center">
          {t('marketing.home.finalCta.heading')}
        </DisplayTitle>
        <Prose onDark size="lg" className="mx-auto text-center">
          {t('marketing.home.finalCta.body')}
        </Prose>
        <Button
          to={withLocale(PATHS.analysis)}
          size="lg"
          caps
          className="bg-gold-500 text-ink text-xs md:text-sm font-bold hover:bg-gold-600"
        >
          {t('marketing.nav.cta')}
        </Button>
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
      <PersonalizedSystem />
      <ProgressSection />
      <DensitySystem />
      <GraySystem />
      <FinalCta />
    </>
  );
}

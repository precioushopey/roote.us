import { useT, useContentLocale } from '@/i18n/LocaleProvider';
import {
  Section,
  DisplayTitle,
  Prose,
  Eyebrow,
  Button,
} from '@/app/components/roote';
import { EXTERNAL_ASSESSMENT_URL } from '@/app/paths';
import { homeFaq } from '@/content/faqs';
import { pickLocalized } from '@/content/localized';
import type { MessageKey } from '@/i18n/messages';
import scienceOversight from '@/assets/scans/science-oversight.png';
import scanBaseline from '@/assets/scans/scan-baseline.png';
import scanFinal from '@/assets/scans/scan-final.png';
import scanProgress from '@/assets/scans/scan-progress.png';
import scanExampleFront from '@/assets/scans/scan-example-front.png';
import scanExampleTop from '@/assets/scans/scan-example-top.png';
import scanExampleCrown from '@/assets/scans/scan-example-crown.png';
import scanExampleHairline from '@/assets/scans/scan-example-hairline.png';
import scanAppCompare from '@/assets/scans/scan-app-compare.png';
import concernThinning from '@/assets/concerns/concern-thinning.png';

const PHOTO_ANGLES = ['front', 'top', 'crown', 'hairline'] as const;

/** Simple fine-line illustrations (not photos) for each guided angle —
 *  matches the diagnostic-card illustration style already used elsewhere
 *  (see docs/image-generation-prompts.txt); each already draws the dotted
 *  framing guide, so it replaces the plain <ScanGuide> SVG rather than
 *  pairing with it. */
const SCAN_EXAMPLE_PHOTOS: Record<(typeof PHOTO_ANGLES)[number], string> = {
  front: scanExampleFront,
  top: scanExampleTop,
  crown: scanExampleCrown,
  hairline: scanExampleHairline,
};

/** Phases 1 and 3 reuse the real baseline/final scan crops already used on
 *  Home; phase 2 uses a matching mid-progress crop (see
 *  docs/image-generation-prompts.txt for its prompt). */
const PHASE_PHOTOS: Record<number, string> = {
  1: scanBaseline,
  2: scanProgress,
  3: scanFinal,
};

const MECHANISMS: Array<{ titleKey: MessageKey; bodyKey: MessageKey }> = [
  { titleKey: 'marketing.sci.mechanism.dhtTitle', bodyKey: 'marketing.sci.mechanism.dhtBody' },
  { titleKey: 'marketing.sci.mechanism.regrowthTitle', bodyKey: 'marketing.sci.mechanism.regrowthBody' },
  { titleKey: 'marketing.sci.mechanism.pigmentTitle', bodyKey: 'marketing.sci.mechanism.pigmentBody' },
  { titleKey: 'marketing.sci.mechanism.conditioningTitle', bodyKey: 'marketing.sci.mechanism.conditioningBody' },
];

/** Same 3 dimensions as the "sample hair profile" card on Home
 *  (rowDensity/rowPattern/rowProgression) — described here instead of shown
 *  as data, since there's no analysis provider connected to fill real values
 *  (see marketing.home.analysis.disclaimer). Describes what a scan measures,
 *  never a result. Density and Pattern each need a real close-up scalp/hair
 *  photo to read clearly — scan-final.png (a genuine top-down density crop,
 *  also used on Home) fits "density" far better than step-2-scan.png's
 *  illustrated-card flat-lay did, and reads consistently next to
 *  concern-thinning.png's real macro hairline crop for "pattern".
 *  Progression uses scan-app-compare.png, a phone screen showing two
 *  anonymized scalp-scan thumbnails side by side. */
const MEASURES: Array<{ titleKey: MessageKey; bodyKey: MessageKey; image: string; imageAltKey: MessageKey }> = [
  {
    titleKey: 'marketing.home.analysis.rowDensity',
    bodyKey: 'marketing.aiSection.measures.densityBody',
    image: scanFinal,
    imageAltKey: 'marketing.aiSection.measures.densityMediaAlt',
  },
  {
    titleKey: 'marketing.home.analysis.rowPattern',
    bodyKey: 'marketing.aiSection.measures.patternBody',
    image: concernThinning,
    imageAltKey: 'marketing.magazine.whyMediaAlt',
  },
  {
    titleKey: 'marketing.home.analysis.rowProgression',
    bodyKey: 'marketing.aiSection.measures.progressionBody',
    image: scanAppCompare,
    imageAltKey: 'marketing.aiSection.measures.progressionMediaAlt',
  },
];

/**
 * "AI Section" (nav: marketing.nav.aiSection) — an informational explainer for
 * how the free AI hair scan/report actually works, built from real copy already
 * approved elsewhere in the app (howItWorks.*, sci.*, sys.*, and the FAQ i18n
 * namespaces — never new claims), some of it since absorbed from the now-removed
 * standalone /how-it-works, /science, and /system pages. Was previously a live
 * HairHealth.ai Landbot chat embed; that surface is unrelated and still reachable
 * via the "Start free hair analysis" CTAs (EXTERNAL_ASSESSMENT_URL) — this page
 * explains the process, it doesn't run it.
 */
export function HairScan() {
  const t = useT();
  const cl = useContentLocale();

  const whatPhotos = homeFaq('what-photos');

  const phases = [
    {
      n: 1,
      action: t('marketing.howItWorks.timeline.m1Action'),
      duration: t('marketing.howItWorks.timeline.m1'),
      bullets: [t('marketing.howItWorks.timeline.m1Bullet1'), t('marketing.howItWorks.timeline.m1Bullet2')],
    },
    {
      n: 2,
      action: t('marketing.howItWorks.timeline.m3Action'),
      duration: t('marketing.howItWorks.timeline.m3'),
      bullets: [t('marketing.howItWorks.timeline.m3Bullet1'), t('marketing.howItWorks.timeline.m3Bullet2')],
    },
    {
      n: 3,
      action: t('marketing.howItWorks.timeline.m6Action'),
      duration: t('marketing.howItWorks.timeline.m6'),
      bullets: [t('marketing.howItWorks.timeline.m6Bullet1'), t('marketing.howItWorks.timeline.m6Bullet2')],
    },
  ];

  return (
    <>
      <Section tone="teal" width="content" animate={false} className="py-12 md:py-24 text-center">
        <DisplayTitle as="h1" step="xl" align="center" className="mx-auto !font-medium max-w-2xl">
          {t('marketing.aiSection.hero.title')}
        </DisplayTitle>
        <Prose size="lg" className="mx-auto mt-4 max-w-2xl text-center text-ink-foreground/75">
          {t('marketing.aiSection.hero.body')}
        </Prose>
        <div className="mt-6 flex justify-center">
          <Button to={EXTERNAL_ASSESSMENT_URL} external size="lg" caps className="w-full text-sm sm:w-auto">
            {t('marketing.nav.cta')}
          </Button>
        </div>
      </Section>

      <Section tone="cream" width="content">
        <Eyebrow>{t('marketing.aiSection.scan.eyebrow')}</Eyebrow>
        <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
          {t('marketing.aiSection.scan.heading')}
        </DisplayTitle>
        <Prose size="lg" className="mt-4 max-w-2xl">
          {t('marketing.howItWorks.step1.body')}
        </Prose>
        {whatPhotos ? (
          <Prose className="mt-3 max-w-2xl text-muted-foreground">{pickLocalized(whatPhotos.a, cl)}</Prose>
        ) : null}
        <div className="mt-10 grid gap-6 sm:grid-cols-4">
          {PHOTO_ANGLES.map((angle) => (
            <div key={angle} className="flex flex-col items-center gap-3 text-center">
              <img src={SCAN_EXAMPLE_PHOTOS[angle]} alt="" aria-hidden className="aspect-square w-full rounded-sm object-cover" />
              <p className="font-body text-sm font-medium text-foreground">{t(`photo.angle.${angle}` as MessageKey)}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="cream" width="content">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>{t('marketing.sci.mechanism.eyebrow')}</Eyebrow>
            <DisplayTitle as="h2" step="lg" className="mt-2 max-w-lg">
              {t('marketing.sci.mechanism.heading')}
            </DisplayTitle>
            <Prose size="lg" className="mt-4 max-w-lg">
              {t('marketing.howItWorks.step3.body')} {t('marketing.sci.oversightBody')}
            </Prose>
          </div>
          <img
            src={scienceOversight}
            alt={t('marketing.sci.oversightMediaAlt')}
            className="aspect-[4/3] w-full rounded-sm object-cover"
          />
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MECHANISMS.map((m) => (
            <div key={m.titleKey} className="flex flex-col gap-2 rounded-sm bg-card p-6">
              <p className="font-display text-md text-foreground">{t(m.titleKey)}</p>
              <Prose className="mt-1">{t(m.bodyKey)}</Prose>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="cream" width="content">
        <DisplayTitle as="h2" step="lg" className="max-w-2xl">
          {t('marketing.howItWorks.timeline.title')}
        </DisplayTitle>
        <Prose size="lg" className="mt-4 max-w-2xl">
          {t('marketing.howItWorks.timeline.shedding')}
        </Prose>
        <ol className="relative mt-12 grid gap-10 sm:grid-cols-3">
          <span aria-hidden className="absolute start-[10%] end-[10%] top-5 hidden h-px bg-accent/40 sm:block" />
          {phases.map((phase) => (
            <li key={phase.action} className="relative flex flex-col gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-accent bg-background font-display text-sm text-accent">
                {String(phase.n).padStart(2, '0')}
              </span>
              <div>
                <p className="font-display text-lg font-medium text-foreground">{phase.action}</p>
                <p className="font-body text-sm font-semibold uppercase text-accent">{phase.duration}</p>
              </div>
              <img src={PHASE_PHOTOS[phase.n]} alt="" aria-hidden className="aspect-square w-full rounded-sm object-cover" />
              <ul className="flex flex-col gap-1.5 font-body text-sm text-muted-foreground">
                {phase.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="cream" width="content">
        <Eyebrow>{t('marketing.home.analysis.eyebrow')}</Eyebrow>
        <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
          {t('marketing.home.analysis.heading')}
        </DisplayTitle>
        <Prose size="lg" className="mt-4 max-w-2xl">
          {t('marketing.aiSection.measures.intro')}
        </Prose>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {MEASURES.map((m) => (
            <div key={m.titleKey} className="flex flex-col gap-3">
              <img
                src={m.image}
                alt={t(m.imageAltKey)}
                className="aspect-[4/3] w-full rounded-sm object-cover"
              />
              <div>
                <p className="font-display text-md text-foreground">{t(m.titleKey)}</p>
                <Prose className="mt-1">{t(m.bodyKey)}</Prose>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="teal" width="readable" className="border-b border-accent text-center">
        <div className="flex flex-col items-center gap-5">
          <DisplayTitle as="h2" step="lg" align="center">
            {t('marketing.aiSection.cta.heading')}
          </DisplayTitle>
          <Prose size="lg" className="mx-auto text-center text-ink-foreground/75">
            {t('marketing.aiSection.cta.body')}
          </Prose>
          <Button to={EXTERNAL_ASSESSMENT_URL} external size="lg" caps className="w-full text-sm sm:w-auto">
            {t('marketing.nav.cta')}
          </Button>
        </div>
      </Section>
    </>
  );
}

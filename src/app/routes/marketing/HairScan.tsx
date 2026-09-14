import { useT, useLocale } from '@/i18n/LocaleProvider';
import {
  Section,
  SectionIntro,
  Button,
  Hero,
  CtaSection,
  ScanMesh,
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
  const cl = useLocale().locale;

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
      <Hero
        title={t('marketing.aiSection.hero.title')}
        body={t('marketing.aiSection.hero.body')}
        cta={
          <Button to={EXTERNAL_ASSESSMENT_URL} external caps className="w-full sm:w-auto">
            {t('marketing.nav.cta')}
          </Button>
        }
      />

      <Section tone="cream" width="content" gap={12}>
        <SectionIntro
          eyebrow={t('marketing.aiSection.scan.eyebrow')}
          title={t('marketing.aiSection.scan.heading')}
          body={<>{t('marketing.howItWorks.step1.body')} {whatPhotos ? pickLocalized(whatPhotos.a, cl) : null}</>}
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {PHOTO_ANGLES.map((angle) => (
            <div key={angle} className="flex flex-col items-center gap-4 text-center">
              <div className="relative aspect-square w-full">
                <img src={SCAN_EXAMPLE_PHOTOS[angle]} alt="" aria-hidden loading="lazy" className="h-full w-full rounded-sm object-cover" />
                <ScanMesh className="absolute inset-0 h-full w-full" />
              </div>
              <p className="u-caps text-center font-body text-sm font-medium text-foreground">{t(`photo.angle.${angle}` as MessageKey)}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="cream" width="content" gap={12} className="-mt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <SectionIntro
            eyebrow={t('marketing.sci.mechanism.eyebrow')}
            title={t('marketing.sci.mechanism.heading')}
            body={<>{t('marketing.howItWorks.step3.body')} {t('marketing.sci.oversightBody')}</>}
          />
          <img
            src={scienceOversight}
            alt={t('marketing.sci.oversightMediaAlt')}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-sm object-cover"
          />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {MECHANISMS.map((m) => (
            <div key={m.titleKey} className="flex flex-col gap-1 sm:place-content-between rounded-sm bg-card p-6">
              <p className="font-display text-lg md:text-xl text-foreground">{t(m.titleKey)}</p>
              <p className="font-body text-sm md:text-base text-muted-foreground">{t(m.bodyKey)}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="cream" width="content" gap={12} className="-mt-24">
        <SectionIntro
          title={t('marketing.howItWorks.timeline.title')}
          body={t('marketing.howItWorks.timeline.shedding')}
        />
        <ol className="relative grid gap-8 sm:grid-cols-3">
          {/* Spans circle 1's center to circle 3's center exactly: each circle
              sits flush at its column's start (radius 1.25rem = h-10/2), and
              grid-cols-3 + gap-12 (3rem) fixes the other two centers at
              W/3 + 2.25rem and 2W/3 + 3.25rem — each circle's own opaque fill
              masks the segment directly behind it. */}
          <span aria-hidden className="absolute start-5 end-[calc(33.333%-3.25rem)] top-5 hidden h-px bg-accent/40 sm:block" />
          {phases.map((phase) => (
            <li key={phase.action} className="relative flex flex-col gap-4">
              <div className="flex flex-row sm:flex-col items-center sm:items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center self-start rounded-full border border-accent bg-background font-display text-lg text-accent">
                  {phase.n}
                </span>
                <div className="flex flex-col gap-1">
                  <p className="font-display text-lg md:text-xl text-foreground">{phase.action}</p>
                  <p className="font-body text-sm font-semibold uppercase text-accent">{phase.duration}</p>
                </div>
              </div>
              <img src={PHASE_PHOTOS[phase.n]} alt="" aria-hidden loading="lazy" className="aspect-square w-full rounded-sm object-cover" />
              <ul className="flex flex-col gap-2 font-body text-sm md:text-base text-muted-foreground">
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

      <Section tone="cream" width="content" gap={12} className="-mt-24">
        <SectionIntro
          eyebrow={t('marketing.home.analysis.eyebrow')}
          title={t('marketing.home.analysis.heading')}
          body={t('marketing.aiSection.measures.intro')}
        />
        <div className="grid gap-8 sm:grid-cols-3">
          {MEASURES.map((m) => (
            <div key={m.titleKey} className="flex flex-col gap-4">
              <img
                src={m.image}
                alt={t(m.imageAltKey)}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-sm object-cover"
              />
              <div className="flex flex-col gap-1">
                <p className="font-display text-lg md:text-xl text-foreground">{t(m.titleKey)}</p>
                <p className="font-body text-sm md:text-base text-muted-foreground">{t(m.bodyKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <CtaSection
        title={t('marketing.aiSection.cta.heading')}
        body={t('marketing.aiSection.cta.body')}
      />
    </>
  );
}

import { useT } from '@/i18n/LocaleProvider';
import { Link } from 'react-router';
import { Section } from '@/app/components/marketing/Section';
import { SectionHeading } from '@/app/components/marketing/SectionHeading';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { Prose } from '@/app/components/marketing/Prose';
import { Eyebrow } from '@/app/components/marketing/Eyebrow';
import { CtaButton } from '@/app/components/marketing/CtaButton';
import { CtaBand } from '@/app/components/marketing/CtaBand';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { rooteContent } from '@/content/roote.config';
import hairCuticle from '@/assets/hair-cuticle.jpg';
import scalpBefore from '@/assets/scalp-before.jpg';
import scalpAfter from '@/assets/scalp-after.jpg';

const ROLE_KEYS = {
  'regrowth-stimulant': 'marketing.science.ingredients.evidence.regrowth-stimulant',
  'dht-blocker': 'marketing.science.ingredients.evidence.dht-blocker',
  'dht-support': 'marketing.science.ingredients.evidence.dht-support',
  'proprietary-support': 'marketing.science.ingredients.evidence.proprietary-support',
} as const;

export function Science() {
  const t = useT();
  return (
    <>
      <Section tone="ink" className="overflow-hidden pt-28 text-center md:pt-32">
        <div className="relative flex flex-col items-center">
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 -z-10 aspect-square w-[85%] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-3xl"
          />
          <DisplayHeading as="h1" size="l" onInk text={t('marketing.science.hero.title')} className="mx-auto max-w-3xl" />
          <Prose size="l" onInk className="mx-auto mt-4 max-w-xl">{t('marketing.science.hero.body')}</Prose>
          <div className="mt-8">
            <CtaButton to="/diagnosis" size="lg" className="w-full sm:w-auto">{t('marketing.nav.cta')}</CtaButton>
          </div>
        </div>
      </Section>

      <Section className="overflow-hidden">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-4">
            <SectionHeading index="01" clamp="clamp(1.75rem, 6.5vw, 4.5rem)">
              {t('marketing.science.mechanism.title')}
            </SectionHeading>
            <Prose size="l" className="max-w-xl">{t('marketing.science.mechanism.body')}</Prose>
          </div>
          <img
            src={hairCuticle}
            alt={t('marketing.science.evidence.caption')}
            className="img-editorial w-full rounded-2xl object-cover shadow-lg lg:ms-auto lg:max-w-md"
          />
        </div>
      </Section>

      <Section className="border-t border-border">
        <SectionHeading
          index="02"
          clamp="clamp(1.75rem, 7vw, 5rem)"
          trailing={<Link to="/products"><Eyebrow>{t('marketing.nav.products')}</Eyebrow></Link>}
        >
          {t('marketing.science.ingredients.title')}
        </SectionHeading>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {rooteContent.formula.ingredients.map((ing) => (
            <div key={ing.key} className="rounded-xl border border-border bg-background p-6 text-start">
              <p className="font-display text-lg font-medium">{ing.name}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t(ROLE_KEYS[ing.role as keyof typeof ROLE_KEYS])}</p>
              <div className="mt-3">
                <PendingChip label={`${ing.key} dose`} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="ink">
        <SectionHeading index="03" onInk align="end" clamp="clamp(1.75rem, 7vw, 5rem)">
          {t('marketing.science.evidence.title')}
        </SectionHeading>
        <Prose size="l" onInk className="ms-auto mt-4 max-w-xl text-end">{t('marketing.science.evidence.body')}</Prose>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-6">
          <div className="relative">
            <img src={scalpBefore} alt={t('marketing.science.evidence.beforeLabel')} className="img-editorial aspect-[4/3] w-full rounded-xl object-cover" />
            <span className="absolute bottom-4 end-4 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-foreground shadow-sm">
              {t('marketing.science.evidence.beforeLabel')}
            </span>
          </div>
          <div className="relative">
            <img src={scalpAfter} alt={t('marketing.science.evidence.afterLabel')} className="img-editorial aspect-[4/3] w-full rounded-xl object-cover" />
            <span className="absolute bottom-4 end-4 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-foreground shadow-sm">
              {t('marketing.science.evidence.afterLabel')}
            </span>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-ink-foreground/60">{t('marketing.science.evidence.caption')}</p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <PendingChip label="participant count (n)" />
          <PendingChip label="improvement %" />
          <PendingChip label="study duration" />
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading index="04" clamp="clamp(1.75rem, 7vw, 5rem)">
          {t('marketing.science.advisory.title')}
        </SectionHeading>
        <Prose size="l" className="mt-4 max-w-xl">{t('marketing.science.advisory.body')}</Prose>
        <div className="mt-8 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          <PendingChip label="advisor 1" />
          <PendingChip label="advisor 2" />
          <PendingChip label="advisor 3" />
        </div>
      </Section>

      <CtaBand headingKey="marketing.science.cta.title" />
    </>
  );
}

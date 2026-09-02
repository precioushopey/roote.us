import { useT } from '@/i18n/LocaleProvider';
import { Section } from '@/app/components/marketing/Section';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { Prose } from '@/app/components/marketing/Prose';
import { CtaBand } from '@/app/components/marketing/CtaBand';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { rooteContent } from '@/content/roote.config';
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
      <Section tone="ink" className="pt-28 text-center md:pt-32">
        <DisplayHeading as="h1" size="l" onInk text={t('marketing.science.hero.title')} className="mx-auto max-w-3xl" />
        <Prose size="l" onInk className="mx-auto mt-4 max-w-xl">{t('marketing.science.hero.body')}</Prose>
      </Section>

      <Section>
        <DisplayHeading as="h2" size="m" text={t('marketing.science.mechanism.title')} />
        <Prose size="l" className="mt-4 max-w-2xl">{t('marketing.science.mechanism.body')}</Prose>
      </Section>

      <Section className="border-t border-border">
        <DisplayHeading as="h2" size="m" text={t('marketing.science.ingredients.title')} />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {rooteContent.formula.ingredients.map((ing) => (
            <div key={ing.key} className="rounded-xl border border-border p-6 text-start">
              <p className="font-display text-lg font-medium">{ing.name}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t(ROLE_KEYS[ing.role as keyof typeof ROLE_KEYS])}</p>
              <div className="mt-3">
                <PendingChip label={`${ing.key} dose`} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="border-t border-border">
        <DisplayHeading as="h2" size="m" text={t('marketing.science.evidence.title')} />
        <Prose size="l" className="mt-4 max-w-2xl">{t('marketing.science.evidence.body')}</Prose>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <PendingChip label="participant count (n)" />
          <PendingChip label="improvement %" />
          <PendingChip label="study duration" />
        </div>
      </Section>

      <Section className="border-t border-border">
        <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4">
          <div className="relative">
            <img src={scalpBefore} alt={t('marketing.science.evidence.beforeLabel')} className="img-editorial aspect-square w-full rounded-xl object-cover" />
            <span className="absolute bottom-3 start-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium uppercase tracking-wide shadow-sm">
              {t('marketing.science.evidence.beforeLabel')}
            </span>
          </div>
          <div className="relative">
            <img src={scalpAfter} alt={t('marketing.science.evidence.afterLabel')} className="img-editorial aspect-square w-full rounded-xl object-cover" />
            <span className="absolute bottom-3 start-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium uppercase tracking-wide shadow-sm">
              {t('marketing.science.evidence.afterLabel')}
            </span>
          </div>
        </div>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">{t('marketing.science.evidence.caption')}</p>
      </Section>

      <Section className="border-t border-border text-center">
        <DisplayHeading as="h2" size="m" text={t('marketing.science.advisory.title')} />
        <Prose size="l" className="mx-auto mt-4 max-w-xl">{t('marketing.science.advisory.body')}</Prose>
        <div className="mx-auto mt-8 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
          <PendingChip label="advisor 1" />
          <PendingChip label="advisor 2" />
          <PendingChip label="advisor 3" />
        </div>
      </Section>

      <CtaBand headingKey="marketing.science.cta.title" />
    </>
  );
}

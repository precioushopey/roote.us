import { Link } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import type { MessageKey } from '@/i18n/messages';
import { rooteContent } from '@/content/roote.config';
import { Section } from '@/app/components/marketing/Section';
import { DISPLAY_CLAMP } from '@/app/components/marketing/displayScale';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { Prose } from '@/app/components/marketing/Prose';

const SECTION_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6'] as const;

export function Privacy() {
  const t = useT();
  const withLocale = useLocalizedPath();
  return (
    <>
      <Section tone="ink" className="overflow-hidden pt-28 text-center md:pt-32">
        <div className="relative flex flex-col items-center">
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 -z-10 aspect-square w-[85%] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-3xl"
          />
          <DisplayHeading as="h1" clamp={DISPLAY_CLAMP} onInk text={t('marketing.legal.privacy.title')} className="mx-auto max-w-3xl uppercase" />
          <Prose size="l" onInk className="mx-auto mt-4 max-w-2xl">{t('marketing.legal.privacy.intro')}</Prose>
          <p className="mt-3 text-xs text-ink-foreground/60">
            {t('marketing.legal.updated')}: {rooteContent.company.legalUpdated}
          </p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          {SECTION_KEYS.map((s, i) => (
            <div key={s} className="border-b border-border pb-8 last:border-b-0">
              <div className="flex items-baseline gap-3">
                <span aria-hidden className="text-sm tracking-[0.18em] text-accent">0{i + 1}</span>
                <p className="font-display text-lg font-medium">{t(`marketing.legal.privacy.${s}` as MessageKey)}</p>
              </div>
              <Prose className="mt-3">{t(`marketing.legal.privacy.${s}.body` as MessageKey)}</Prose>
              {s === 's6' && (
                <Prose className="mt-2">
                  <Link to={withLocale('/terms')} className="text-accent underline">{t('marketing.legal.company.title')}</Link>
                </Prose>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section tone="ink">
        <div className="mx-auto max-w-3xl">
          <Prose onInk className="text-xs">{t('marketing.legal.company.reviewNote')}</Prose>
        </div>
      </Section>
    </>
  );
}

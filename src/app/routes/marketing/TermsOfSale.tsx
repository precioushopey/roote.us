import { useT } from '@/i18n/LocaleProvider';
import type { MessageKey } from '@/i18n/messages';
import { rooteContent } from '@/content/roote.config';
import { Section } from '@/app/components/marketing/Section';
import { DISPLAY_CLAMP } from '@/app/components/marketing/displayScale';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { SectionHeading } from '@/app/components/marketing/SectionHeading';
import { Prose } from '@/app/components/marketing/Prose';
import { CompanyDetails } from '@/app/components/marketing/CompanyDetails';

const SECTION_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12'] as const;

export function TermsOfSale() {
  const t = useT();
  return (
    <>
      <Section tone="ink" className="overflow-hidden pt-28 text-center md:pt-32">
        <div className="relative flex flex-col items-center">
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 -z-10 aspect-square w-[85%] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-3xl"
          />
          <DisplayHeading as="h1" clamp={DISPLAY_CLAMP} onInk text={t('marketing.legalSale.title')} className="mx-auto max-w-3xl uppercase" />
          <Prose size="l" onInk className="mx-auto mt-4 max-w-2xl">{t('marketing.legalSale.intro')}</Prose>
          <p className="mt-3 text-xs text-ink-foreground/60">
            {t('marketing.legal.updated')}: {rooteContent.company.legalUpdated}
          </p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <SectionHeading clamp={DISPLAY_CLAMP}>{t('marketing.legal.company.title')}</SectionHeading>
          <Prose>{t('marketing.legal.company.intro')}</Prose>
          <CompanyDetails />
        </div>
      </Section>

      <Section tone="ink">
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          {SECTION_KEYS.map((s, i) => (
            <div key={s} className="border-b border-ink-foreground/15 pb-8 last:border-b-0">
              <div className="flex items-baseline gap-3">
                <span aria-hidden className="text-sm tracking-[0.18em] text-accent">{String(i + 1).padStart(2, '0')}</span>
                <p className="font-display text-lg font-medium text-ink-foreground">
                  {t(`marketing.legalSale.${s}.title` as MessageKey)}
                </p>
              </div>
              <Prose onInk className="mt-3">{t(`marketing.legalSale.${s}.body` as MessageKey)}</Prose>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          <Prose>{t('marketing.legalSale.contact')}</Prose>
          <Prose className="text-xs">{t('marketing.legal.company.reviewNote')}</Prose>
        </div>
      </Section>
    </>
  );
}

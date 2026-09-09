import { useT } from '@/i18n/LocaleProvider';
import type { MessageKey } from '@/i18n/messages';
import { rooteContent } from '@/content/roote.config';
import { Section, DisplayTitle, Prose, Button, LegalNotice } from '@/app/components/roote';
import { CompanyDetails } from '@/app/components/marketing/CompanyDetails';
import { EXTERNAL_ASSESSMENT_URL } from '@/app/paths';

const SECTION_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12'] as const;

export function TermsOfSale() {
  const t = useT();
  return (
    <>
      <Section tone="teal" width="content" animate={false} className="py-12 md:py-24 text-center">
        <DisplayTitle as="h1" step="lg" align="center" className="mx-auto !font-medium max-w-2xl">
          {t('marketing.legalSale.title')}
        </DisplayTitle>
        <Prose size="lg" className="mx-auto mt-4 max-w-2xl text-center text-ink-foreground/75">{t('marketing.legalSale.intro')}</Prose>
        <p className="mt-3 font-body text-sm text-ink-foreground/75">
          {t('marketing.legal.updated')}: {rooteContent.company.legalUpdated}
        </p>
        <div className="mt-6 flex justify-center">
          <Button to={EXTERNAL_ASSESSMENT_URL} external size="lg" caps className="w-full text-sm sm:w-auto">
            {t('marketing.nav.cta')}
          </Button>
        </div>
      </Section>

      <Section tone="cream" width="content">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <DisplayTitle as="h2" step="md">{t('marketing.legal.company.title')}</DisplayTitle>
          <Prose>{t('marketing.legal.company.intro')}</Prose>
          <CompanyDetails />
        </div>
      </Section>

      <Section tone="teal" width="content">
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          {SECTION_KEYS.map((s, i) => (
            <div key={s} className="flex gap-4 border-b border-ink-foreground/15 pb-8 last:border-b-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent font-display text-sm text-accent">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <p className="font-display text-lg font-medium text-ink-foreground">
                  {t(`marketing.legalSale.${s}.title` as MessageKey)}
                </p>
                <Prose className="mt-3 text-ink-foreground/75">{t(`marketing.legalSale.${s}.body` as MessageKey)}</Prose>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="cream" width="content">
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          <Prose>{t('marketing.legalSale.contact')}</Prose>
          <LegalNotice reviewRequired>{t('marketing.legal.company.reviewNote')}</LegalNotice>
        </div>
      </Section>
    </>
  );
}

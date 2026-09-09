import { Link } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import type { MessageKey } from '@/i18n/messages';
import { rooteContent } from '@/content/roote.config';
import { Section, DisplayTitle, Prose, Button, LegalNotice } from '@/app/components/roote';
import { CompanyDetails } from '@/app/components/marketing/CompanyDetails';
import { EXTERNAL_ASSESSMENT_URL } from '@/app/paths';

const SECTION_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6'] as const;

export function Terms() {
  const t = useT();
  const withLocale = useLocalizedPath();
  return (
    <>
      <Section tone="teal" width="content" animate={false} className="py-12 md:py-24 text-center">
        <DisplayTitle as="h1" step="lg" align="center" className="mx-auto !font-medium max-w-2xl">
          {t('marketing.legal.terms.title')}
        </DisplayTitle>
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
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          {SECTION_KEYS.map((s, i) => (
            <div key={s} className="flex gap-4 border-b border-border pb-8 last:border-b-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent font-display text-sm text-accent">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <p className="font-display text-lg font-medium text-foreground">{t(`marketing.legal.terms.${s}` as MessageKey)}</p>
                <Prose className="mt-3">{t(`marketing.legal.terms.${s}.body` as MessageKey)}</Prose>
                {s === 's4' && (
                  <Prose className="mt-2">
                    <Link to={withLocale('/terms-of-sale')} className="text-accent underline">{t('marketing.footer.termsOfSale')}</Link>
                  </Prose>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="teal" width="content">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <DisplayTitle as="h2" step="md">{t('marketing.legal.company.title')}</DisplayTitle>
          <Prose className="text-ink-foreground/75">{t('marketing.legal.company.intro')}</Prose>
          <CompanyDetails onInk />
          <LegalNotice reviewRequired>{t('marketing.legal.company.reviewNote')}</LegalNotice>
        </div>
      </Section>
    </>
  );
}

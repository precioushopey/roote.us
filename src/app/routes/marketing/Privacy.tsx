import { Link } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import type { MessageKey } from '@/i18n/messages';
import { rooteContent } from '@/content/roote.config';
import { Section, DisplayTitle, Prose, Eyebrow, LegalNotice } from '@/app/components/roote';

const SECTION_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6'] as const;

export function Privacy() {
  const t = useT();
  const withLocale = useLocalizedPath();
  return (
    <>
      <Section tone="teal" width="content" animate={false} className="text-center">
        <Eyebrow className="rounded-full border border-accent px-4 py-1.5">
          {t('marketing.footer.legal')}
        </Eyebrow>
        <DisplayTitle as="h1" step="lg" align="center" className="mx-auto mt-2 max-w-2xl">
          {t('marketing.legal.privacy.title')}
        </DisplayTitle>
        <Prose size="lg" className="mx-auto mt-4 text-center">{t('marketing.legal.privacy.intro')}</Prose>
        <p className="mt-3 font-body text-xs text-muted-foreground">
          {t('marketing.legal.updated')}: {rooteContent.company.legalUpdated}
        </p>
      </Section>

      <Section tone="cream" width="content">
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          {SECTION_KEYS.map((s, i) => (
            <div key={s} className="flex gap-4 border-b border-border pb-8 last:border-b-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent font-display text-sm text-accent">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <p className="font-display text-lg font-medium text-foreground">{t(`marketing.legal.privacy.${s}` as MessageKey)}</p>
                <Prose className="mt-3">{t(`marketing.legal.privacy.${s}.body` as MessageKey)}</Prose>
                {s === 's6' && (
                  <Prose className="mt-2">
                    <Link to={withLocale('/terms')} className="text-accent underline">{t('marketing.legal.company.title')}</Link>
                  </Prose>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="teal" width="content">
        <div className="mx-auto max-w-3xl">
          <LegalNotice reviewRequired>{t('marketing.legal.company.reviewNote')}</LegalNotice>
        </div>
      </Section>
    </>
  );
}

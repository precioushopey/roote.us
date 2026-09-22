import { Link } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import type { MessageKey } from '@/i18n/messages';
import { rooteContent } from '@/content/roote.config';
import { Section, Prose, SectionIntro, Button, Hero } from '@/app/components/roote';
import { PATHS } from '@/app/paths';
import { COOKIES_META, getLegalBody } from '@/content/legal';
import { pickLocalized } from '@/content/localized';

const SECTION_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6'] as const;

/**
 * Privacy Policy — absorbs the former standalone /cookies page as a final
 * sub-group (5-page legal IA, 2026-09-14), restarting its own clause count.
 */
export function Privacy() {
  const t = useT();
  const cl = useLocale().locale;
  const withLocale = useLocalizedPath();
  const cookieSections = getLegalBody('cookies');

  return (
    <>
      <Hero
        title={t('marketing.legal.privacy.title')}
        body={t('marketing.legal.privacy.intro')}
        meta={
          <p className="font-body text-sm text-ink-foreground">
            {t('marketing.legal.updated')}: {rooteContent.company.legalUpdated}
          </p>
        }
        cta={
          <Button to={withLocale(PATHS.analysis)} caps className="w-full sm:w-auto">
            {t('marketing.nav.cta')}
          </Button>
        }
      />

      <Section tone="cream" width="content">
        <div className="mx-auto flex max-w-3xl flex-col gap-12">
          {SECTION_KEYS.map((s, i) => (
            <div key={s} className="flex gap-4 border-b border-border pb-8 last:border-b-0">
              <span className="shrink-0 font-display text-lg lg:text-xl text-accent">{i + 1}.</span>
              <div className="flex flex-col gap-2">
                <p className="font-display text-lg md:text-xl text-foreground">{t(`marketing.legal.privacy.${s}` as MessageKey)}</p>
                <Prose>{t(`marketing.legal.privacy.${s}.body` as MessageKey)}</Prose>
                {s === 's6' && (
                  <Prose>
                    <Link to={withLocale('/terms')} className="text-accent underline">{t('marketing.legal.company.title')}</Link>
                  </Prose>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="cream" width="content" className="-mt-24">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <SectionIntro
            titleStep="md"
            title={pickLocalized(COOKIES_META.title, cl)}
            body={pickLocalized(COOKIES_META.blurb, cl)}
          />
          <div className="flex flex-col gap-12">
            {cookieSections.map((s, i) => (
              <div key={s.id} className="flex gap-4 border-b border-border pb-8 last:border-b-0">
                <span className="shrink-0 font-display text-lg lg:text-xl text-accent">{i + 1}.</span>
                <div className="flex flex-col gap-2">
                  <p className="font-display text-lg md:text-xl text-foreground">{pickLocalized(s.heading, cl)}</p>
                  <Prose>{pickLocalized(s.body, cl)}</Prose>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}

import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import type { MessageKey } from '@/i18n/messages';
import { rooteContent } from '@/content/roote.config';
import { Section, Prose, SectionIntro, Button, Hero } from '@/app/components/roote';
import { CompanyDetails } from '@/app/components/marketing/CompanyDetails';
import { PATHS } from '@/app/paths';
import { ACCESSIBILITY_META, getLegalBody } from '@/content/legal';
import { pickLocalized } from '@/content/localized';

const SECTION_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6'] as const;
const SALE_SECTION_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12'] as const;

/** A numbered clause row — the shared visual unit every sub-group below uses
 *  (General Terms, Terms of Sale, Accessibility), each restarting its own
 *  1..n count since they read as distinct policies merged onto one page. */
function Clause({ n, title, body }: { n: number; title: React.ReactNode; body: React.ReactNode }) {
  return (
    <div className="flex gap-4 border-b border-border pb-8 last:border-b-0">
      <span className="shrink-0 font-display text-lg lg:text-xl text-accent">{n}.</span>
      <div className="flex flex-col gap-2">
        <p className="font-display text-lg md:text-xl text-foreground">{title}</p>
        <Prose>{body}</Prose>
      </div>
    </div>
  );
}

/**
 * Terms of Service — absorbs the former standalone /terms-of-sale and
 * /accessibility pages as two additional sub-groups (5-page legal IA,
 * 2026-09-14). Each keeps its own heading/intro and restarts its own clause
 * numbering rather than continuing one long flat count.
 */
export function Terms() {
  const t = useT();
  const cl = useLocale().locale;
  const withLocale = useLocalizedPath();
  const accessibilitySections = getLegalBody('accessibility');

  return (
    <>
      <Hero
        title={t('marketing.legal.terms.title')}
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
            <Clause
              key={s}
              n={i + 1}
              title={t(`marketing.legal.terms.${s}` as MessageKey)}
              body={t(`marketing.legal.terms.${s}.body` as MessageKey)}
            />
          ))}
        </div>
      </Section>

      <Section id="terms-of-sale" tone="cream" width="content" className="-mt-24">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <SectionIntro titleStep="md" title={t('marketing.legalSale.title')} body={t('marketing.legalSale.intro')} />
          <div className="flex flex-col gap-12">
            {SALE_SECTION_KEYS.map((s, i) => (
              <Clause
                key={s}
                n={i + 1}
                title={t(`marketing.legalSale.${s}.title` as MessageKey)}
                body={t(`marketing.legalSale.${s}.body` as MessageKey)}
              />
            ))}
          </div>
          <Prose>{t('marketing.legalSale.contact')}</Prose>
        </div>
      </Section>

      <Section tone="cream" width="content" className="-mt-24">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <SectionIntro
            titleStep="md"
            title={pickLocalized(ACCESSIBILITY_META.title, cl)}
            body={pickLocalized(ACCESSIBILITY_META.blurb, cl)}
          />
          <div className="flex flex-col gap-12">
            {accessibilitySections.map((s, i) => (
              <Clause key={s.id} n={i + 1} title={pickLocalized(s.heading, cl)} body={pickLocalized(s.body, cl)} />
            ))}
          </div>
        </div>
      </Section>

      <Section tone="teal" width="content" className="-mt-24">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <SectionIntro onInk titleStep="md" title={t('marketing.legal.company.title')} body={t('marketing.legal.company.intro')} />
          <CompanyDetails onInk />
        </div>
      </Section>
    </>
  );
}

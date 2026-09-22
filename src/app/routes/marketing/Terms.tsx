import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { rooteContent } from '@/content/roote.config';
import { Section, Prose, SectionIntro, Button, Hero } from '@/app/components/roote';
import { CompanyDetails } from '@/app/components/marketing/CompanyDetails';
import { PATHS } from '@/app/paths';
import { ACCESSIBILITY_META, getLegalBody } from '@/content/legal';
import { pickLocalized } from '@/content/localized';

/** A numbered clause row — the shared visual unit every sub-group below uses
 *  (Terms & Conditions, Accessibility), each restarting its own 1..n count
 *  since they read as distinct policies merged onto one page. */
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
 * Terms & Conditions — absorbs the /accessibility page as an additional
 * sub-group (5-page legal IA, 2026-09-14). Main clause content comes from
 * the ROOTÉ Master Legal Pack (2026-09-22) via `content/legal.ts` LEGAL_BODIES
 * — it already folds in what used to be the separate Terms of Sale content,
 * so that sub-group and its i18n keys are retired. Accessibility keeps its
 * own heading/intro and restarts its own clause numbering.
 */
export function Terms() {
  const t = useT();
  const cl = useLocale().locale;
  const withLocale = useLocalizedPath();
  const termsSections = getLegalBody('terms');
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
          {termsSections.map((s, i) => (
            <Clause key={s.id} n={i + 1} title={pickLocalized(s.heading, cl)} body={pickLocalized(s.body, cl)} />
          ))}
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

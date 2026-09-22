import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { Section, Button, Accordion, Hero, CtaSection } from '@/app/components/roote';
import { PATHS } from '@/app/paths';
import { pickLocalized } from '@/content/localized';
import { HOME_FAQS } from '@/content/faqs';

export function Faq() {
  const t = useT();
  const cl = useLocale().locale;
  const withLocale = useLocalizedPath();
  return (
    <>
      <Hero
        title={t('marketing.faq.hero.title')}
        body={t('marketing.faq.hero.body')}
        cta={
          <Button to={withLocale(PATHS.analysis)} caps className="w-full sm:w-auto">
            {t('marketing.nav.cta')}
          </Button>
        }
      />

      <Section tone="cream" width="readable">
        <Accordion
          items={HOME_FAQS.map((f) => ({
            id: f.id,
            title: pickLocalized(f.q, cl),
            body: pickLocalized(f.a, cl),
          }))}
        />
      </Section>

      <CtaSection
        title={t('marketing.faq.support.title')}
        body={t('marketing.faq.cta.body')}
      />
    </>
  );
}

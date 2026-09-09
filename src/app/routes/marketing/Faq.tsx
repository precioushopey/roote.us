import { useT, useContentLocale } from '@/i18n/LocaleProvider';
import { Section, DisplayTitle, Prose, Button, Accordion } from '@/app/components/roote';
import { EXTERNAL_ASSESSMENT_URL } from '@/app/paths';
import { pickLocalized } from '@/content/localized';
import { HOME_FAQS } from '@/content/faqs';

export function Faq() {
  const t = useT();
  const cl = useContentLocale();
  return (
    <>
      <Section tone="teal" width="content" animate={false} className="py-12 md:py-24 text-center">
        <DisplayTitle as="h1" step="lg" align="center" className="mx-auto !font-medium max-w-2xl">
          {t('marketing.faq.hero.title')}
        </DisplayTitle>
        <Prose size="lg" className="mx-auto mt-4 max-w-2xl text-center text-ink-foreground/75">
          {t('marketing.faq.hero.body')}
        </Prose>
        <div className="mt-6 flex justify-center">
          <Button to={EXTERNAL_ASSESSMENT_URL} external size="lg" caps className="w-full text-sm sm:w-auto">
            {t('marketing.nav.cta')}
          </Button>
        </div>
      </Section>

      <Section tone="cream" width="readable">
        <Accordion
          items={HOME_FAQS.map((f) => ({
            id: f.id,
            title: pickLocalized(f.q, cl),
            body: pickLocalized(f.a, cl),
          }))}
        />
      </Section>

      <Section tone="teal" width="readable" className="border-b border-accent text-center">
        <div className="flex flex-col items-center gap-5">
          <DisplayTitle as="h2" step="xl" align="center">
            {t('marketing.faq.support.title')}
          </DisplayTitle>
          <Prose size="lg" className="mx-auto text-center text-ink-foreground/75">
            {t('marketing.faq.cta.body')}
          </Prose>
          <Button to={EXTERNAL_ASSESSMENT_URL} external size="lg" caps className="w-full text-sm font-bold sm:w-auto">
            {t('marketing.nav.cta')}
          </Button>
        </div>
      </Section>
    </>
  );
}

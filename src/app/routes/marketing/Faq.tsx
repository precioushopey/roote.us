import { useT, useContentLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { Section, DisplayTitle, Prose, Eyebrow, Button, Accordion } from '@/app/components/roote';
import { PATHS } from '@/app/paths';
import { pickLocalized } from '@/content/localized';
import { HOME_FAQS } from '@/content/faqs';

export function Faq() {
  const t = useT();
  const cl = useContentLocale();
  const withLocale = useLocalizedPath();
  return (
    <>
      <Section tone="teal" width="content" animate={false} className="text-center">
        <Eyebrow onDark>{t('marketing.home.faq.eyebrow')}</Eyebrow>
        <DisplayTitle as="h1" step="lg" onDark align="center" className="mx-auto mt-2 max-w-2xl">
          {t('marketing.faq.hero.title')}
        </DisplayTitle>
        <Prose onDark size="lg" className="mx-auto mt-4 text-center">
          {t('marketing.faq.hero.body')}
        </Prose>
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

      <Section tone="grid" width="readable" className="text-center">
        <DisplayTitle as="h2" step="md" align="center">
          {t('marketing.faq.support.title')}
        </DisplayTitle>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button to={withLocale(PATHS.support)} variant="secondary">
            {t('marketing.faq.support.cta')}
          </Button>
          <Button to={withLocale(PATHS.analysis)} caps>
            {t('marketing.nav.cta')}
          </Button>
        </div>
      </Section>
    </>
  );
}

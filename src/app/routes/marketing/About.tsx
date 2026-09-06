import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { Section } from '@/app/components/marketing/Section';
import { DISPLAY_CLAMP } from '@/app/components/marketing/displayScale';
import { SectionHeading } from '@/app/components/marketing/SectionHeading';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { Prose } from '@/app/components/marketing/Prose';
import { CtaButton } from '@/app/components/marketing/CtaButton';
import heroPeople from '@/assets/hero-people.png';

export function About() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const values = [
    { title: t('marketing.about.values.v1.title'), body: t('marketing.about.values.v1.body') },
    { title: t('marketing.about.values.v2.title'), body: t('marketing.about.values.v2.body') },
    { title: t('marketing.about.values.v3.title'), body: t('marketing.about.values.v3.body') },
  ];

  return (
    <>
      <Section tone="ink" className="overflow-hidden pt-28 text-center md:pt-32">
        <div className="relative flex flex-col items-center">
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 -z-10 aspect-square w-[85%] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-3xl"
          />
          <DisplayHeading as="h1" clamp={DISPLAY_CLAMP} onInk text={t('marketing.about.hero.title')} className="mx-auto max-w-3xl uppercase" />
          <Prose size="l" onInk className="mx-auto mt-4 max-w-xl">{t('marketing.about.mission.body')}</Prose>
          <div className="mt-8">
            <CtaButton to={withLocale('/analysis')} size="lg" className="w-full sm:w-auto">{t('marketing.nav.cta')}</CtaButton>
          </div>
        </div>
      </Section>

      <Section className="overflow-hidden">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-4">
            <SectionHeading index="01" clamp={DISPLAY_CLAMP}>
              {t('marketing.about.story.title')}
            </SectionHeading>
            <Prose size="l" className="max-w-xl">{t('marketing.about.story.body')}</Prose>
          </div>
          <img
            src={heroPeople}
            alt=""
            className="img-editorial w-full rounded-2xl object-cover lg:ms-auto lg:max-w-md"
          />
        </div>
      </Section>

      <Section tone="ink">
        <SectionHeading index="02" onInk align="end" clamp={DISPLAY_CLAMP}>
          {t('marketing.about.values.title')}
        </SectionHeading>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="rounded-xl border border-ink-foreground/15 bg-ink-foreground/5 p-6 text-start">
              <p className="font-display text-lg font-medium text-ink-foreground">{v.title}</p>
              <Prose onInk className="mt-2">{v.body}</Prose>
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <CtaButton to={withLocale('/analysis')} size="lg" className="w-full sm:w-auto">{t('marketing.home.how.getStarted')}</CtaButton>
        </div>
      </Section>
    </>
  );
}

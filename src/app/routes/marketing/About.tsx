import { useT } from '@/i18n/LocaleProvider';
import { Section } from '@/app/components/marketing/Section';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { Prose } from '@/app/components/marketing/Prose';
import { CtaBand } from '@/app/components/marketing/CtaBand';
import { PendingChip } from '@/app/components/brand/PendingChip';

export function About() {
  const t = useT();
  const values = [
    { title: t('marketing.about.values.v1.title'), body: t('marketing.about.values.v1.body') },
    { title: t('marketing.about.values.v2.title'), body: t('marketing.about.values.v2.body') },
    { title: t('marketing.about.values.v3.title'), body: t('marketing.about.values.v3.body') },
  ];

  return (
    <>
      <Section tone="ink" className="pt-28 text-center md:pt-32">
        <DisplayHeading as="h1" size="l" onInk text={t('marketing.about.hero.title')} className="mx-auto max-w-3xl" />
        <Prose size="l" onInk className="mx-auto mt-4 max-w-xl">{t('marketing.about.mission.body')}</Prose>
      </Section>

      <Section>
        <DisplayHeading as="h2" size="m" text={t('marketing.about.story.title')} />
        <Prose size="l" className="mt-4 max-w-2xl">{t('marketing.about.story.body')}</Prose>
      </Section>

      <Section className="border-t border-border">
        <DisplayHeading as="h2" size="m" text={t('marketing.about.team.title')} />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="rounded-xl border border-border p-6 text-center">
              <PendingChip label={`team member ${n}`} />
            </div>
          ))}
        </div>
      </Section>

      <Section className="border-t border-border">
        <DisplayHeading as="h2" size="m" text={t('marketing.about.values.title')} className="text-center" />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="text-start">
              <p className="font-display text-lg font-medium">{v.title}</p>
              <Prose className="mt-2">{v.body}</Prose>
            </div>
          ))}
        </div>
      </Section>

      <Section className="border-t border-border text-center">
        <DisplayHeading as="h2" size="m" text={t('marketing.about.press.title')} />
        <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <PendingChip key={n} label={`press logo ${n}`} />
          ))}
        </div>
      </Section>

      <Section className="border-t border-border text-center">
        <DisplayHeading as="h2" size="m" text={t('marketing.about.careers.title')} />
        <Prose size="l" className="mx-auto mt-4 max-w-xl">{t('marketing.about.careers.body')}</Prose>
        <div className="mt-4">
          <PendingChip label="careers link" />
        </div>
      </Section>

      <CtaBand headingKey="marketing.about.cta.title" />
    </>
  );
}

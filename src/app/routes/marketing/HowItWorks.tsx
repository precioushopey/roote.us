import { useT } from '@/i18n/LocaleProvider';
import { Section } from '@/app/components/marketing/Section';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { Prose } from '@/app/components/marketing/Prose';
import { ArrowLink } from '@/app/components/marketing/ArrowLink';
import { CtaBand } from '@/app/components/marketing/CtaBand';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { rooteContent } from '@/content/roote.config';

export function HowItWorks() {
  const t = useT();
  const steps = [
    { n: '01', title: t('marketing.howItWorks.step1.title'), body: t('marketing.howItWorks.step1.body') },
    { n: '02', title: t('marketing.howItWorks.step2.title'), body: t('marketing.howItWorks.step2.body') },
    { n: '03', title: t('marketing.howItWorks.step3.title'), body: t('marketing.howItWorks.step3.body') },
    { n: '04', title: t('marketing.howItWorks.step4.title'), body: t('marketing.howItWorks.step4.body') },
  ];
  const kit = [...rooteContent.treatments.core, ...rooteContent.treatments.supporting];

  return (
    <>
      <Section tone="ink" className="pt-28 text-center md:pt-32">
        <DisplayHeading as="h1" size="l" onInk text={t('marketing.howItWorks.hero.title')} className="mx-auto max-w-3xl" />
        <Prose size="l" onInk className="mx-auto mt-4 max-w-xl">{t('marketing.howItWorks.hero.body')}</Prose>
      </Section>

      <Section>
        <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li key={s.n} className="flex flex-col gap-2">
              <span className="text-2xl tracking-[0.18em] text-accent">{s.n}</span>
              <p className="font-display text-lg font-medium">{s.title}</p>
              <Prose>{s.body}</Prose>
            </li>
          ))}
        </ol>
      </Section>

      <Section className="border-t border-border">
        <DisplayHeading as="h2" size="m" text={t('marketing.howItWorks.kit.title')} className="text-center" />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {kit.map((item) => (
            <div key={item.key} className="rounded-xl border border-border p-6 text-start">
              <p className="font-display text-base font-medium">{item.name.en}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="border-t border-border text-center">
        <DisplayHeading as="h2" size="m" text={t('marketing.howItWorks.timeline.title')} />
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
          {[t('marketing.howItWorks.timeline.m1'), t('marketing.howItWorks.timeline.m3'), t('marketing.howItWorks.timeline.m6')].map((label) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <p className="text-sm font-medium">{label}</p>
              <PendingChip label={`outcome at ${label}`} />
            </div>
          ))}
        </div>
        <Prose className="mx-auto mt-6 max-w-xl">{t('marketing.howItWorks.timeline.shedding')}</Prose>
      </Section>

      <Section className="border-t border-border text-center">
        <DisplayHeading as="h2" size="m" text={t('marketing.howItWorks.support.title')} />
        <Prose size="l" className="mx-auto mt-4 max-w-xl">{t('marketing.howItWorks.support.body')}</Prose>
      </Section>

      <Section className="border-t border-border text-center">
        <DisplayHeading as="h2" size="m" text={t('marketing.howItWorks.faq.title')} />
        <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-6 text-start">
          <div>
            <p className="font-medium">{t('marketing.howItWorks.faq.q1')}</p>
            <Prose className="mt-1">{t('marketing.howItWorks.faq.a1')}</Prose>
          </div>
          <div>
            <p className="font-medium">{t('marketing.howItWorks.faq.q2')}</p>
            <Prose className="mt-1">{t('marketing.howItWorks.faq.a2')}</Prose>
          </div>
        </div>
        <div className="mt-8">
          <ArrowLink to="/faq">{t('marketing.howItWorks.faqCta')}</ArrowLink>
        </div>
      </Section>

      <CtaBand headingKey="marketing.howItWorks.cta.title" />
    </>
  );
}

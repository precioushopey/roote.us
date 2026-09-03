import { useT } from '@/i18n/LocaleProvider';
import { Section } from '@/app/components/marketing/Section';
import { DISPLAY_CLAMP } from '@/app/components/marketing/displayScale';
import { SectionHeading } from '@/app/components/marketing/SectionHeading';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { Prose } from '@/app/components/marketing/Prose';
import { CtaButton } from '@/app/components/marketing/CtaButton';

function QaGroup({ index, title, items }: { index: string; title: string; items: { q: string; a: string }[] }) {
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span aria-hidden className="text-sm tracking-[0.18em] text-accent">{index}</span>
        <p className="font-display text-lg font-medium">{title}</p>
      </div>
      <div className="mt-4 flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.q} className="border-b border-border pb-4">
            <p className="font-medium">{item.q}</p>
            <Prose className="mt-1">{item.a}</Prose>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Faq() {
  const t = useT();

  return (
    <>
      <Section tone="ink" className="overflow-hidden pt-28 text-center md:pt-32">
        <div className="relative flex flex-col items-center">
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 -z-10 aspect-square w-[85%] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-3xl"
          />
          <DisplayHeading as="h1" clamp={DISPLAY_CLAMP} onInk text={t('marketing.faq.hero.title')} className="mx-auto max-w-3xl uppercase" />
          <Prose size="l" onInk className="mx-auto mt-4 max-w-xl">{t('marketing.faq.hero.body')}</Prose>
        </div>
      </Section>

      <Section>
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
          <QaGroup
            index="01"
            title={t('marketing.faq.category.gettingStarted')}
            items={[
              { q: t('marketing.faq.gettingStarted.q1'), a: t('marketing.faq.gettingStarted.a1') },
              { q: t('marketing.faq.gettingStarted.q2'), a: t('marketing.faq.gettingStarted.a2') },
            ]}
          />
          <QaGroup
            index="02"
            title={t('marketing.faq.category.plan')}
            items={[{ q: t('marketing.faq.plan.q1'), a: t('marketing.faq.plan.a1') }]}
          />
          <QaGroup
            index="03"
            title={t('marketing.faq.category.ingredients')}
            items={[{ q: t('marketing.faq.ingredients.q1'), a: t('marketing.faq.ingredients.a1') }]}
          />
        </div>
      </Section>

      <Section tone="ink">
        <SectionHeading index="04" onInk align="end" clamp={DISPLAY_CLAMP}>
          {t('marketing.faq.support.title')}
        </SectionHeading>
        <div className="mt-8 flex justify-end">
          <CtaButton to="/support" size="lg" className="w-full sm:w-auto">{t('marketing.faq.support.cta')}</CtaButton>
        </div>
      </Section>
    </>
  );
}

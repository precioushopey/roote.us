import { useT } from '@/i18n/LocaleProvider';
import { Section } from '@/app/components/marketing/Section';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { Prose } from '@/app/components/marketing/Prose';
import { ArrowLink } from '@/app/components/marketing/ArrowLink';

function QaGroup({ title, items }: { title: string; items: { q: string; a: string }[] }) {
  return (
    <div>
      <p className="font-display text-lg font-medium">{title}</p>
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
      <Section className="pt-28 text-center md:pt-32">
        <DisplayHeading as="h1" size="l" text={t('marketing.faq.hero.title')} className="mx-auto max-w-3xl" />
        <Prose size="l" className="mx-auto mt-4 max-w-xl">{t('marketing.faq.hero.body')}</Prose>
      </Section>

      <Section className="border-t border-border">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
          <QaGroup
            title={t('marketing.faq.category.gettingStarted')}
            items={[
              { q: t('marketing.faq.gettingStarted.q1'), a: t('marketing.faq.gettingStarted.a1') },
              { q: t('marketing.faq.gettingStarted.q2'), a: t('marketing.faq.gettingStarted.a2') },
            ]}
          />
          <QaGroup
            title={t('marketing.faq.category.plan')}
            items={[{ q: t('marketing.faq.plan.q1'), a: t('marketing.faq.plan.a1') }]}
          />
          <QaGroup
            title={t('marketing.faq.category.ingredients')}
            items={[{ q: t('marketing.faq.ingredients.q1'), a: t('marketing.faq.ingredients.a1') }]}
          />
        </div>
      </Section>

      <Section className="border-t border-border text-center">
        <DisplayHeading as="h2" size="m" text={t('marketing.faq.support.title')} />
        <div className="mt-6">
          <ArrowLink to="/support">{t('marketing.faq.support.cta')}</ArrowLink>
        </div>
      </Section>
    </>
  );
}

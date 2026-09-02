import { useT } from '@/i18n/LocaleProvider';
import { Section } from '@/app/components/marketing/Section';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { Prose } from '@/app/components/marketing/Prose';
import { CtaButton } from '@/app/components/marketing/CtaButton';
import { ArrowLink } from '@/app/components/marketing/ArrowLink';
import { CtaBand } from '@/app/components/marketing/CtaBand';
import { PendingChip } from '@/app/components/brand/PendingChip';

export function Products() {
  const t = useT();
  const components = [
    { id: 'topical', title: t('marketing.products.topical.title'), body: t('marketing.products.topical.body') },
    { id: 'routine', title: t('marketing.products.supplement.title'), body: t('marketing.products.supplement.body') },
    { id: 'cleanser', title: t('marketing.products.shampoo.title'), body: t('marketing.products.shampoo.body') },
  ];

  return (
    <>
      <Section tone="ink" className="pt-28 text-center md:pt-32">
        <DisplayHeading as="h1" size="l" onInk text={t('marketing.products.hero.title')} className="mx-auto max-w-3xl" />
        <Prose size="l" onInk className="mx-auto mt-4 max-w-xl">{t('marketing.products.hero.body')}</Prose>
        <div className="mt-8">
          <CtaButton to="/diagnosis" size="lg">{t('marketing.nav.cta')}</CtaButton>
        </div>
      </Section>

      {components.map((c) => (
        <Section key={c.id} id={c.id} className="border-t border-border">
          <DisplayHeading as="h2" size="s" text={c.title} />
          <Prose size="l" className="mt-3 max-w-xl">{c.body}</Prose>
          <div className="mt-4">
            <PendingChip label={`${c.id} unit price`} />
          </div>
        </Section>
      ))}

      <Section className="border-t border-border">
        <DisplayHeading as="h2" size="m" text={t('marketing.products.customized.title')} />
        <Prose size="l" className="mt-4 max-w-2xl">{t('marketing.products.customized.body')}</Prose>
      </Section>

      <Section className="border-t border-border">
        <DisplayHeading as="h2" size="m" text={t('marketing.products.subscription.title')} />
        <Prose size="l" className="mt-4 max-w-xl">{t('marketing.products.subscription.body')}</Prose>
        <div className="mt-4 flex items-center gap-3">
          <PendingChip label="reorder cadence" />
          <PendingChip label="reorder price" />
        </div>
        <div className="mt-6">
          <ArrowLink to="/start">{t('marketing.nav.cta')}</ArrowLink>
        </div>
      </Section>


      <CtaBand headingKey="marketing.products.cta.title" />
    </>
  );
}

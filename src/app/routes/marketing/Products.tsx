import { useT } from '@/i18n/LocaleProvider';
import { Link } from 'react-router';
import { Section } from '@/app/components/marketing/Section';
import { SectionHeading } from '@/app/components/marketing/SectionHeading';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { Prose } from '@/app/components/marketing/Prose';
import { Eyebrow } from '@/app/components/marketing/Eyebrow';
import { CtaButton } from '@/app/components/marketing/CtaButton';
import { ArrowLink } from '@/app/components/marketing/ArrowLink';
import { CtaBand } from '@/app/components/marketing/CtaBand';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { rooteContent } from '@/content/roote.config';
import productPhoto from '@/assets/product.png';
import productBg from '@/assets/product_bg.jpg';
import scanDevice from '@/assets/scan-device.jpg';
import productLineup from '@/assets/product-lineup.png';
import minoxidilPhoto from '@/assets/PRODUCTS/minoxidil_roote_product_image_2026.png';
import finasteridePhoto from '@/assets/PRODUCTS/finaesteride_roote_product_image_2026.png';
import azelaicPhoto from '@/assets/PRODUCTS/azelaic acid_roote_product_image_2026.png';
import abnPhoto from '@/assets/PRODUCTS/ABN Complex_roote_product_image_2026.png';

const INGREDIENT_PHOTOS: Record<string, string> = {
  minoxidil: minoxidilPhoto,
  finasteride: finasteridePhoto,
  azelaic: azelaicPhoto,
  abn: abnPhoto,
};

const ROLE_KEYS = {
  'regrowth-stimulant': 'marketing.home.products.role.regrowth-stimulant',
  'dht-blocker': 'marketing.home.products.role.dht-blocker',
  'dht-support': 'marketing.home.products.role.dht-support',
  'proprietary-support': 'marketing.home.products.role.proprietary-support',
} as const;

export function Products() {
  const t = useT();
  const components = [
    { id: 'topical', photo: productBg, title: t('marketing.products.topical.title'), body: t('marketing.products.topical.body') },
    { id: 'routine', photo: scanDevice, title: t('marketing.products.supplement.title'), body: t('marketing.products.supplement.body') },
    { id: 'cleanser', photo: productPhoto, title: t('marketing.products.shampoo.title'), body: t('marketing.products.shampoo.body') },
  ];

  return (
    <>
      <Section tone="ink" className="overflow-hidden pt-28 text-center md:pt-32">
        <div className="relative flex flex-col items-center">
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 -z-10 aspect-square w-[85%] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-3xl"
          />
          <DisplayHeading as="h1" size="l" onInk text={t('marketing.products.hero.title')} className="mx-auto max-w-3xl" />
          <Prose size="l" onInk className="mx-auto mt-4 max-w-xl">{t('marketing.products.hero.body')}</Prose>
          <div className="mt-8">
            <CtaButton to="/diagnosis" size="lg" className="w-full sm:w-auto">{t('marketing.nav.cta')}</CtaButton>
          </div>
        </div>
      </Section>

      <Section className="overflow-hidden">
        <SectionHeading
          index="01"
          clamp="clamp(1.75rem, 7vw, 5rem)"
          trailing={<Link to="/science"><Eyebrow>{t('marketing.nav.science')}</Eyebrow></Link>}
        >
          {t('marketing.products.kit.title')}
        </SectionHeading>
        <div className="mt-12 flex flex-col gap-14">
          {components.map((c, i) => {
            const flipped = i % 2 === 1;
            return (
              <div key={c.id} id={c.id} className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
                <img
                  src={c.photo}
                  alt=""
                  className={`img-editorial w-full rounded-2xl object-cover lg:max-w-md ${flipped ? 'lg:order-2 lg:ms-auto' : ''}`}
                />
                <div className={`flex flex-col items-start gap-3 ${flipped ? 'lg:order-1' : ''}`}>
                  <span className="text-xs font-medium tracking-[0.18em] text-accent">0{i + 1}</span>
                  <p className="font-display text-2xl font-medium">{c.title}</p>
                  <Prose size="l" className="max-w-xl">{c.body}</Prose>
                  <PendingChip label={`${c.id} unit price`} />
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section className="border-t border-border">
        <SectionHeading index="02" clamp="clamp(1.75rem, 6.5vw, 4.5rem)">
          {t('marketing.science.ingredients.title')}
        </SectionHeading>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {rooteContent.formula.ingredients.map((ing) => (
            <div key={ing.key} className="overflow-hidden rounded-xl border border-border bg-background text-start">
              <img
                src={INGREDIENT_PHOTOS[ing.key]}
                alt=""
                className="img-editorial aspect-square w-full object-cover"
              />
              <div className="p-6">
                <p className="font-display text-lg font-medium">{ing.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.1em] text-muted-foreground">
                  {t(ROLE_KEYS[ing.role as keyof typeof ROLE_KEYS])}
                </p>
                {ing.percentage != null && (
                  <p className="mt-2 text-sm text-foreground">{ing.percentage}%</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="ink" className="overflow-hidden">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-4">
            <SectionHeading index="03" onInk clamp="clamp(1.75rem, 6.5vw, 4.5rem)">
              {t('marketing.products.customized.title')}
            </SectionHeading>
            <Prose size="l" onInk className="max-w-xl">{t('marketing.products.customized.body')}</Prose>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div aria-hidden className="absolute inset-0 -z-10 scale-90 rounded-full bg-accent/40 blur-3xl" />
            <img src={productLineup} alt="" className="img-editorial w-full rounded-2xl object-cover" />
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading index="04" align="end" clamp="clamp(1.75rem, 7vw, 5rem)">
          {t('marketing.products.subscription.title')}
        </SectionHeading>
        <Prose size="l" className="ms-auto mt-4 max-w-xl text-end">{t('marketing.products.subscription.body')}</Prose>
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <PendingChip label="reorder cadence" />
          <PendingChip label="reorder price" />
        </div>
        <div className="mt-6 flex justify-end">
          <ArrowLink to="/start">{t('marketing.nav.cta')}</ArrowLink>
        </div>
      </Section>

      <CtaBand headingKey="marketing.products.cta.title" />
    </>
  );
}

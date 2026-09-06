import { Link } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { Section } from '@/app/components/marketing/Section';
import { DISPLAY_CLAMP } from '@/app/components/marketing/displayScale';
import { SectionHeading } from '@/app/components/marketing/SectionHeading';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { Prose } from '@/app/components/marketing/Prose';
import { Eyebrow } from '@/app/components/marketing/Eyebrow';
import { ArrowLink } from '@/app/components/marketing/ArrowLink';
import { CtaButton } from '@/app/components/marketing/CtaButton';
import { CtaBand } from '@/app/components/marketing/CtaBand';
import { rooteContent } from '@/content/roote.config';
import stepQuiz from '@/assets/step-quiz.jpg';
import stepPhotoScan from '@/assets/step-photo-scan.jpg';
import scanDevice from '@/assets/scan-device.jpg';
import productBg from '@/assets/product_bg.jpg';
import productPhoto from '@/assets/product.png';

// A representative showcase set for anonymous visitors (pre-assessment) — not
// concern-specific. The customer's actual plan (Density vs. Gray vs. both) is
// resolved by the recommendation engine after the assessment (PO #15).
const KIT_KEYS = ['density-10', 'regrowth-shampoo', 'gray-serum'] as const;
const KIT_PHOTOS: Record<string, string> = {
  'density-10': productBg,
  'regrowth-shampoo': productPhoto,
  'gray-serum': scanDevice,
};

export function HowItWorks() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const steps = [
    { photo: stepQuiz, title: t('marketing.howItWorks.step1.title'), body: t('marketing.howItWorks.step1.body') },
    { photo: stepPhotoScan, title: t('marketing.howItWorks.step2.title'), body: t('marketing.howItWorks.step2.body') },
    { photo: scanDevice, title: t('marketing.howItWorks.step3.title'), body: t('marketing.howItWorks.step3.body') },
    { photo: productBg, title: t('marketing.howItWorks.step4.title'), body: t('marketing.howItWorks.step4.body') },
  ];
  const kit = KIT_KEYS.map((key) => ({ key, ...rooteContent.treatmentRegistry[key] }));

  return (
    <>
      <Section tone="ink" className="overflow-hidden pt-28 text-center md:pt-32">
        <div className="relative flex flex-col items-center">
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 -z-10 aspect-square w-[85%] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-3xl"
          />
          <DisplayHeading as="h1" clamp={DISPLAY_CLAMP} onInk text={t('marketing.howItWorks.hero.title')} className="mx-auto max-w-3xl uppercase" />
          <Prose size="l" onInk className="mx-auto mt-4 max-w-xl">{t('marketing.howItWorks.hero.body')}</Prose>
          <div className="mt-8">
            <CtaButton to={withLocale('/analysis')} size="lg" className="w-full sm:w-auto">{t('marketing.nav.cta')}</CtaButton>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading
          index="01"
          clamp={DISPLAY_CLAMP}
          trailing={<Link to={withLocale('/products')}><Eyebrow>{t('marketing.nav.products')}</Eyebrow></Link>}
        >
          {t('marketing.nav.howItWorks')}
        </SectionHeading>
        <ol className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-3">
              <img src={step.photo} alt="" className="img-editorial aspect-square w-full rounded-xl object-cover" />
              <div className="flex flex-row items-baseline gap-2 sm:flex-col sm:gap-1">
                <span className="text-xs font-medium tracking-[0.18em] text-accent">0{i + 1}</span>
                <p className="font-display text-lg font-medium">{step.title}</p>
              </div>
              <Prose>{step.body}</Prose>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="ink">
        <SectionHeading index="02" onInk align="end" clamp={DISPLAY_CLAMP}>
          {t('marketing.howItWorks.kit.title')}
        </SectionHeading>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {kit.map((item) => (
            <div
              key={item.key}
              className="overflow-hidden rounded-xl border border-ink-foreground/15 bg-ink-foreground/5 text-start"
            >
              <img
                src={KIT_PHOTOS[item.key]}
                alt=""
                className="img-editorial aspect-[4/3] w-full object-cover"
              />
              <p className="p-6 font-display text-base font-medium text-ink-foreground">{item.name.en}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading index="03" clamp={DISPLAY_CLAMP}>
          {t('marketing.howItWorks.faq.title')}
        </SectionHeading>
        <div className="mt-10 flex max-w-2xl flex-col gap-6 text-start">
          <div className="border-b border-border pb-4">
            <p className="font-medium">{t('marketing.howItWorks.faq.q1')}</p>
            <Prose className="mt-1">{t('marketing.howItWorks.faq.a1')}</Prose>
          </div>
          <div className="border-b border-border pb-4">
            <p className="font-medium">{t('marketing.howItWorks.faq.q2')}</p>
            <Prose className="mt-1">{t('marketing.howItWorks.faq.a2')}</Prose>
          </div>
        </div>
        <div className="mt-8">
          <ArrowLink to={withLocale('/faq')}>{t('marketing.howItWorks.faqCta')}</ArrowLink>
        </div>
      </Section>

      <CtaBand headingKey="marketing.howItWorks.cta.title" />
    </>
  );
}

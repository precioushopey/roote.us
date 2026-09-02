import { useT } from '@/i18n/LocaleProvider';
import { Section } from '@/app/components/marketing/Section';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { Prose } from '@/app/components/marketing/Prose';
import { CtaBand } from '@/app/components/marketing/CtaBand';
import { PendingChip } from '@/app/components/brand/PendingChip';
import scalpBefore from '@/assets/scalp-before.jpg';
import scalpAfter from '@/assets/scalp-after.jpg';

export function Results() {
  const t = useT();
  return (
    <>
      <Section tone="ink" className="pt-28 text-center md:pt-32">
        <DisplayHeading as="h1" size="l" onInk text={t('marketing.results.hero.title')} className="mx-auto max-w-3xl" />
        <Prose size="l" onInk className="mx-auto mt-4 max-w-xl">{t('marketing.results.hero.body')}</Prose>
      </Section>

      <Section className="text-center">
        <DisplayHeading as="h2" size="m" text={t('marketing.results.rating.title')} />
        <div className="mx-auto mt-4 flex max-w-xs items-center justify-center gap-3">
          <PendingChip label="average rating" />
          <PendingChip label="review count" />
        </div>
      </Section>

      <Section className="border-t border-border">
        <DisplayHeading as="h2" size="m" text={t('marketing.results.gallery.title')} className="text-center" />
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="relative">
              <img src={n % 2 ? scalpBefore : scalpAfter} alt="" className="img-editorial aspect-square w-full rounded-xl object-cover" />
              <div className="absolute bottom-3 start-3">
                <PendingChip label={`timeline ${n}`} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="border-t border-border">
        <DisplayHeading as="h2" size="m" text={t('marketing.results.testimonials.title')} className="text-center" />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-xl border border-border p-6 text-start">
              <PendingChip label={`testimonial ${n} quote`} />
              <div className="mt-3 flex flex-col gap-1">
                <PendingChip label={`testimonial ${n} author`} />
                <PendingChip label={`testimonial ${n} result`} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="border-t border-border text-center">
        <DisplayHeading as="h2" size="m" text={t('marketing.results.timeline.title')} />
        <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          <PendingChip label="1 month outcome" />
          <PendingChip label="3 month outcome" />
          <PendingChip label="6 month outcome" />
        </div>
      </Section>

      <Section className="border-t border-border text-center">
        <DisplayHeading as="h2" size="m" text={t('marketing.results.press.title')} />
        <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <PendingChip key={n} label={`press logo ${n}`} />
          ))}
        </div>
      </Section>

      <CtaBand headingKey="marketing.results.cta.title" />
    </>
  );
}

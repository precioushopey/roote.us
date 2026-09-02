import { useT } from '@/i18n/LocaleProvider';
import { Section } from '@/app/components/marketing/Section';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { Prose } from '@/app/components/marketing/Prose';
import { CtaBand } from '@/app/components/marketing/CtaBand';
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

      <Section>
        <DisplayHeading as="h2" size="m" text={t('marketing.results.gallery.title')} className="text-center" />
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
          {[scalpBefore, scalpAfter, scalpBefore, scalpAfter, scalpBefore, scalpAfter].map((src, i) => (
            <img key={i} src={src} alt="" className="img-editorial aspect-square w-full rounded-xl object-cover" />
          ))}
        </div>
      </Section>

      <CtaBand headingKey="marketing.results.cta.title" />
    </>
  );
}

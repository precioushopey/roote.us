import { useT } from '@/i18n/LocaleProvider';
import { Section } from '@/app/components/marketing/Section';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { PendingChip } from '@/app/components/brand/PendingChip';

const SECTION_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6'] as const;

export function Terms() {
  const t = useT();
  return (
    <>
      <Section tone="ink" className="overflow-hidden pt-28 text-center md:pt-32">
        <div className="relative flex flex-col items-center">
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 -z-10 aspect-square w-[85%] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-3xl"
          />
          <DisplayHeading as="h1" size="l" onInk text={t('marketing.legal.terms.title')} className="mx-auto max-w-3xl" />
          <p className="mt-3 flex items-center gap-2 text-xs text-ink-foreground/60">
            {t('marketing.legal.updated')}: <PendingChip label="terms last-updated date" />
          </p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          {SECTION_KEYS.map((s, i) => (
            <div key={s} className="border-b border-border pb-8 last:border-b-0">
              <div className="flex items-baseline gap-3">
                <span aria-hidden className="text-sm tracking-[0.18em] text-accent">0{i + 1}</span>
                <p className="font-display text-lg font-medium">{t(`marketing.legal.terms.${s}` as never)}</p>
              </div>
              <div className="mt-3">
                <PendingChip label={`terms ${s} body`} />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

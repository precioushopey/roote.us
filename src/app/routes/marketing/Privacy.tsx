import { useT } from '@/i18n/LocaleProvider';
import { Section } from '@/app/components/marketing/Section';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { PendingChip } from '@/app/components/brand/PendingChip';

const SECTION_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6'] as const;

export function Privacy() {
  const t = useT();
  return (
    <Section className="pt-28 md:pt-32">
      <div className="mx-auto max-w-3xl">
        <DisplayHeading as="h1" size="l" text={t('marketing.legal.privacy.title')} />
        <p className="mt-2 text-xs text-muted-foreground">
          {t('marketing.legal.updated')}: <PendingChip label="privacy last-updated date" />
        </p>
        <div className="mt-10 flex flex-col gap-8">
          {SECTION_KEYS.map((s) => (
            <div key={s}>
              <p className="font-display text-lg font-medium">{t(`marketing.legal.privacy.${s}` as never)}</p>
              <div className="mt-2">
                <PendingChip label={`privacy ${s} body`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

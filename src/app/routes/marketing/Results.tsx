import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { Section, DisplayTitle, Prose, Eyebrow, Button, MediaPlaceholder, Card } from '@/app/components/roote';
import { PATHS } from '@/app/paths';
import type { MessageKey } from '@/i18n/messages';

const SLOTS: Array<{ titleKey: MessageKey; alt: string; label: string }> = [
  {
    titleKey: 'marketing.results.slot1',
    alt: 'Reserved for a verified ROOTÉ before-and-after result',
    label: 'Verified ROOTÉ before/after — reserved',
  },
  {
    titleKey: 'marketing.results.slot2',
    alt: 'Reserved for a verified ROOTÉ customer progress series',
    label: 'Verified ROOTÉ customer progress — reserved',
  },
  {
    titleKey: 'marketing.results.slot3',
    alt: 'Reserved for clinical or study evidence for this formulation',
    label: 'Clinical / study evidence — reserved',
  },
];

/** Brief §12 / §22: until real evidence exists, this page is an honest empty
 *  state. No fabricated testimonials, no borrowed reviews. */
export function Results() {
  const t = useT();
  const withLocale = useLocalizedPath();
  return (
    <>
      <Section tone="teal" width="content" animate={false} className="text-center">
        <Eyebrow onDark>{t('marketing.nav.results')}</Eyebrow>
        <DisplayTitle as="h1" step="lg" onDark align="center" className="mx-auto mt-2 max-w-2xl">
          {t('marketing.results.heading')}
        </DisplayTitle>
        <Prose onDark size="lg" className="mx-auto mt-4 text-center">
          {t('marketing.results.body')}
        </Prose>
      </Section>

      <Section tone="cream" width="content">
        <div className="grid gap-6 md:grid-cols-3">
          {SLOTS.map((s) => (
            <Card key={s.titleKey} padded={false} className="overflow-hidden">
              <MediaPlaceholder tone="card" ratio="4 / 3" rounded="none" alt={s.alt} label={s.label} />
              <div className="p-5">
                <p className="font-body text-sm font-medium text-foreground">{t(s.titleKey)}</p>
                <p className="mt-1 font-body text-xs text-muted-foreground">{t('marketing.results.empty')}</p>
              </div>
            </Card>
          ))}
        </div>
        <p className="mt-8 max-w-2xl font-body text-sm text-muted-foreground">{t('marketing.results.disclosure')}</p>
      </Section>

      <Section tone="teal" width="readable" className="text-center">
        <DisplayTitle as="h2" step="lg" onDark align="center">
          {t('marketing.results.ctaHeading')}
        </DisplayTitle>
        <div className="mt-6 flex justify-center">
          <Button to={withLocale(PATHS.analysis)} size="lg" caps>
            {t('marketing.nav.cta')}
          </Button>
        </div>
      </Section>
    </>
  );
}

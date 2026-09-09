import { useT } from '@/i18n/LocaleProvider';
import { rooteContent } from '@/content/roote.config';
import { cn } from '@/app/components/ui/utils';

const c = rooteContent.company;

/**
 * The legal-entity block shown on /terms and /terms-of-sale. Locale-invariant
 * facts come from `rooteContent.company`; labels + the localized entity-type and
 * country strings are i18n keys (`marketing.legal.company.*`).
 *
 * Rows whose value is a proper noun / number / address (`ltr: true`) are forced
 * to `dir="ltr"` so they don't bidi-reorder inside the RTL (Hebrew) layout —
 * e.g. "91 ENTERPRISE LLC" and "+1 (310) 651-7283".
 */
export function CompanyDetails({ onInk = false }: { onInk?: boolean }) {
  const t = useT();

  const rows: Array<{ label: string; value: string; ltr?: boolean }> = [
    { label: t('marketing.legal.company.legalNameLabel'), value: c.legalName, ltr: true },
    { label: t('marketing.legal.company.entityTypeLabel'), value: t('marketing.legal.company.entityType') },
    { label: t('marketing.legal.company.countryLabel'), value: t('marketing.legal.company.country') },
    { label: t('marketing.legal.company.regNumberLabel'), value: c.registrationNumber, ltr: true },
    { label: t('marketing.legal.company.einLabel'), value: c.ein, ltr: true },
    { label: t('marketing.legal.company.incorporatedLabel'), value: c.incorporated, ltr: true },
    { label: t('marketing.legal.company.representativeLabel'), value: c.representative, ltr: true },
    { label: t('marketing.legal.company.addressLabel'), value: c.address.join(', '), ltr: true },
  ];

  const dt = cn(
    'text-sm uppercase',
    onInk ? 'text-ink-foreground' : 'text-muted-foreground',
  );
  const dd = cn('text-sm', onInk ? 'text-ink-foreground' : 'text-foreground');
  const link = cn('underline', onInk ? 'text-ink-foreground' : 'text-accent');

  return (
    <dl className="grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-[max-content_1fr]">
      {rows.map(({ label, value, ltr }) => (
        <div key={label} className="flex flex-col gap-0.5 sm:contents">
          <dt className={cn(dt, 'sm:py-0.5')}>{label}</dt>
          <dd className={dd} dir={ltr ? 'ltr' : undefined}>{value}</dd>
        </div>
      ))}
      <div className="flex flex-col gap-0.5 sm:contents">
        <dt className={cn(dt, 'sm:py-0.5')}>{t('marketing.legal.company.emailLabel')}</dt>
        <dd className={dd} dir="ltr">
          <a href={`mailto:${c.support.email}`} className={link}>{c.support.email}</a>
        </dd>
      </div>
      <div className="flex flex-col gap-0.5 sm:contents">
        <dt className={cn(dt, 'sm:py-0.5')}>{t('marketing.legal.company.phoneLabel')}</dt>
        <dd className={dd} dir="ltr">
          <a href={c.support.phoneHref} className={link}>{c.support.phone}</a>
        </dd>
      </div>
    </dl>
  );
}

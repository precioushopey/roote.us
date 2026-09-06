import { useState } from 'react';
import { cn } from '@/app/components/ui/utils';
import { Modal } from './Overlay';
import { LOCALES, ENABLED_LOCALES, COUNTRY_DEFAULTS, type LocaleCode } from '@/i18n/locales';

type Props = {
  country: string;
  locale: LocaleCode;
  onChangeCountry: (country: string) => void;
  onChangeLocale: (locale: LocaleCode) => void;
  /** trigger + dialog labels (already localized) */
  labels: { open: string; title: string; region: string; language: string; done: string };
  className?: string;
  /** Icon-only trigger (no "US · English" text) — for tight header layouts. */
  compact?: boolean;
};

/**
 * Country + language picker (brief §24, §28). Presentational + controlled — WP2
 * wires it to `LocaleProvider` and a persisted country. Manual choice always
 * wins over any geo default. Only `ENABLED_LOCALES` are offered (scaffold
 * locales stay hidden unless `VITE_I18N_SHOW_SCAFFOLDS=1`).
 */
export function CountryLanguageSelector({
  country,
  locale,
  onChangeCountry,
  onChangeLocale,
  labels,
  className,
  compact = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const current = LOCALES[locale];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          compact
            ? 'inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:text-foreground'
            : 'inline-flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground',
          className,
        )}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        {!compact && (
          <>
            <span>{country}</span>
            <span aria-hidden>·</span>
            <span>{current.label}</span>
          </>
        )}
        <span className="sr-only">{labels.open}</span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={labels.title}>
        <fieldset className="mb-5">
          <legend className="u-caps mb-2 font-body text-2xs font-semibold text-muted-foreground">
            {labels.region}
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(COUNTRY_DEFAULTS).map((c) => (
              <button
                key={c.country}
                type="button"
                aria-pressed={c.country === country}
                onClick={() => onChangeCountry(c.country)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-start font-body text-sm',
                  c.country === country ? 'border-deep-800 bg-cream-100' : 'border-border',
                )}
              >
                {c.label}
                <span className="ms-1 text-xs text-muted-foreground">{c.currency}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="u-caps mb-2 font-body text-2xs font-semibold text-muted-foreground">
            {labels.language}
          </legend>
          <div className="flex flex-wrap gap-2">
            {ENABLED_LOCALES.map((code) => (
              <button
                key={code}
                type="button"
                aria-pressed={code === locale}
                onClick={() => onChangeLocale(code)}
                className={cn(
                  'rounded-full border px-4 py-1.5 font-body text-sm',
                  code === locale ? 'border-deep-800 bg-deep-950 text-cream-100' : 'border-border text-muted-foreground',
                )}
              >
                {LOCALES[code].label}
              </button>
            ))}
          </div>
        </fieldset>
      </Modal>
    </>
  );
}

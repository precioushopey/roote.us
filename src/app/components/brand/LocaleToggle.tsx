import { useLocale } from '@/i18n/LocaleProvider';
import { cn } from '@/app/components/ui/utils';

export function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  const next = locale === 'he' ? 'en' : 'he';
  const label = next === 'he' ? 'עברית' : 'English';
  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      className={cn('text-sm underline underline-offset-4 text-muted-foreground', className)}
      aria-label={`Switch language to ${label}`}
    >
      {label}
    </button>
  );
}

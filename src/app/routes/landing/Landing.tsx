import { Link } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { LocaleToggle } from '@/app/components/brand/LocaleToggle';

export function Landing() {
  const t = useT();
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Wordmark />
        <LocaleToggle />
      </header>
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">{t('landing.eyebrow')}</p>
        <h1 className="text-5xl sm:text-6xl">
          <Wordmark />
        </h1>
        <Link
          to="/diagnosis"
          className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-8 py-4 text-sm tracking-wide"
        >
          {t('landing.cta')}
        </Link>
      </div>
    </main>
  );
}

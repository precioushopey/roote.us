import { Link } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';

export function ReportNotFound() {
  const t = useT();
  const withLocale = useLocalizedPath();
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-medium">{t('report.notFound.title')}</h1>
      <p className="text-sm text-muted-foreground">{t('report.notFound.body')}</p>
      <Link to={withLocale('/analysis')} className="rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground">
        {t('report.notFound.cta')}
      </Link>
    </main>
  );
}

// src/app/routes/start/SuccessStep.tsx
import { Link } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';

export function SuccessStep() {
  const t = useT();
  const session = useSession();
  const program = session.program;
  if (!program) return null; // StartLayout's guard already ensures this

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
      <h1 className="text-xl font-medium">{t('start.success.title')}</h1>
      <p className="text-sm text-muted-foreground">#{program.orderId}</p>
      <p className="text-sm">{t('report.duration.label', { days: program.durationDays })} · {program.startDate}</p>
      <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
        <li>{t('start.success.point1')}</li>
        <li>{t('start.success.point2')}</li>
        <li>{t('start.success.point3')}</li>
      </ul>
      <Link to="/app" className="rounded-md bg-primary px-8 py-4 text-sm text-primary-foreground">
        {t('start.success.cta')}
      </Link>
    </div>
  );
}

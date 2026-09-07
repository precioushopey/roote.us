import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { DisplayTitle, Button } from '@/app/components/roote';

export function SuccessStep() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const session = useSession();
  const program = session.program;
  if (!program) return null;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 text-center">
      <DisplayTitle as="h1" step="sm" align="center">
        {t('start.success.title')}
      </DisplayTitle>
      <p className="font-body text-sm text-muted-foreground">
        #{program.orderId} · {t('report.duration.label', { days: program.durationDays })} · {program.startDate}
      </p>
      <ul className="flex flex-col gap-2 font-body text-sm text-muted-foreground">
        <li>{t('start.success.point1')}</li>
        <li>{t('start.success.point2')}</li>
        <li>{t('start.success.point3')}</li>
      </ul>
      <Button to={withLocale('/account')} size="lg" caps>
        {t('start.success.cta')}
      </Button>
    </div>
  );
}

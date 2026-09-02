import { Link } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { isoToday, programDay } from './programProgress';

const RESCAN_UNLOCK_DAY = 90;

export function AppRescan() {
  const t = useT();
  const program = useSession().program!;
  const day = programDay(program, isoToday());
  const unlocked = day >= RESCAN_UNLOCK_DAY;

  return (
    <div data-animate className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-medium">{t('app.rescan.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('app.rescan.subtitle')}</p>
      </header>

      <div className="rounded-xl border border-border p-5">
        <p className="text-sm">
          {unlocked
            ? t('app.rescan.ready')
            : t('app.rescan.locked', { days: RESCAN_UNLOCK_DAY - day })}
        </p>
      </div>

      <Link
        to="/diagnosis"
        aria-disabled={!unlocked}
        className={
          unlocked
            ? 'inline-flex w-full items-center justify-center rounded-full bg-primary px-8 py-4 text-sm text-primary-foreground sm:w-auto sm:self-start'
            : 'pointer-events-none inline-flex w-full items-center justify-center rounded-full bg-muted px-8 py-4 text-sm text-muted-foreground sm:w-auto sm:self-start'
        }
      >
        {t('app.rescan.cta')}
      </Link>

      <p className="text-xs text-muted-foreground">{t('app.rescan.note')}</p>
    </div>
  );
}

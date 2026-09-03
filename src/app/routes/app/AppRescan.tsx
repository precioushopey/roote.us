import { useMemo } from 'react';
import { Link } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import type { AngleKey } from '@/store/sessionStore';
import { isoToday, programDay } from './programProgress';

const RESCAN_UNLOCK_DAY = 90;
const ANGLES: AngleKey[] = ['front', 'top', 'crown', 'hairline'];

export function AppRescan() {
  const t = useT();
  const session = useSession();
  const program = session.program!;
  const day = programDay(program, isoToday());
  const unlocked = day >= RESCAN_UNLOCK_DAY;

  const baseline = useMemo(() => {
    const map = new Map<AngleKey, string>();
    for (const p of session.diagnosis.photos) map.set(p.angleKey, p.thumb);
    return map;
  }, [session.diagnosis.photos]);

  const latest = useMemo(() => {
    const map = new Map<AngleKey, string>();
    for (const p of program.progressPhotos) map.set(p.angleKey as AngleKey, p.thumb);
    return map;
  }, [program.progressPhotos]);

  return (
    <div data-animate className="flex max-w-2xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-medium lg:text-4xl">{t('app.rescan.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('app.rescan.subtitle')}</p>
      </header>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <p className="text-sm">
          {unlocked
            ? t('app.rescan.ready')
            : t('app.rescan.locked', { days: RESCAN_UNLOCK_DAY - day })}
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-medium">{t('app.rescan.compare.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('app.rescan.compare.body')}</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {ANGLES.map((angle) => (
            <div key={angle} className="rounded-xl border border-border bg-card p-3 shadow-sm">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                {t(`photo.angle.${angle}` as never)}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: t('app.rescan.compare.baseline'), src: baseline.get(angle) },
                  { label: t('app.rescan.compare.latest'), src: latest.get(angle) },
                ].map((cell) => (
                  <div key={cell.label} className="flex flex-col gap-1">
                    {cell.src ? (
                      <img src={cell.src} alt="" className="img-editorial aspect-square w-full rounded-lg object-cover" />
                    ) : (
                      <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-border text-[11px] text-muted-foreground">
                        {t('app.progress.compare.empty')}
                      </div>
                    )}
                    <span className="text-center text-[11px] uppercase tracking-wide text-muted-foreground">
                      {cell.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

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

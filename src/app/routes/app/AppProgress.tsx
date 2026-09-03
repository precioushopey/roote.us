import { useMemo } from 'react';
import { useT } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { PhotoUpload } from '@/app/components/diagnosis/PhotoUpload';
import type { AngleKey } from '@/store/sessionStore';
import { isoToday } from './programProgress';

const ANGLES: AngleKey[] = ['front', 'top', 'crown', 'hairline'];

export function AppProgress() {
  const t = useT();
  const session = useSession();
  const program = session.program!;

  const baseline = useMemo(() => {
    const map = new Map<AngleKey, string>();
    for (const p of session.diagnosis.photos) map.set(p.angleKey, p.thumb);
    return map;
  }, [session.diagnosis.photos]);

  const latestByAngle = useMemo(() => {
    const map = new Map<AngleKey, string>();
    for (const p of program.progressPhotos) map.set(p.angleKey as AngleKey, p.thumb);
    return map;
  }, [program.progressPhotos]);

  const byDate = useMemo(() => {
    const groups = new Map<string, typeof program.progressPhotos>();
    for (const p of program.progressPhotos) {
      groups.set(p.isoDate, [...(groups.get(p.isoDate) ?? []), p]);
    }
    return [...groups.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [program.progressPhotos]);

  return (
    <div data-animate className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-medium lg:text-4xl">{t('app.progress.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('app.progress.subtitle')}</p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-medium">{t('app.progress.add.title')}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {ANGLES.map((angle) => (
            <PhotoUpload
              key={angle}
              angleKey={angle}
              onAdd={(ref) =>
                session.addProgramPhoto({
                  id: ref.id,
                  isoDate: isoToday(),
                  angleKey: angle,
                  blobId: ref.blobId,
                  thumb: ref.thumb,
                })
              }
              onRemove={() => {}}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-medium">{t('app.progress.compare.title')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ANGLES.map((angle) => (
            <div key={angle} className="rounded-xl border border-border bg-card p-3 shadow-sm">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                {t(`photo.angle.${angle}` as never)}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: t('marketing.home.research.beforeLabel'), src: baseline.get(angle) },
                  { label: t('marketing.home.research.afterLabel'), src: latestByAngle.get(angle) },
                ].map((cell) => (
                  <div key={cell.label} className="flex flex-col gap-1">
                    {cell.src ? (
                      <img src={cell.src} alt="" className="img-editorial aspect-square w-full rounded-lg object-cover" />
                    ) : (
                      <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-border text-[11px] text-muted-foreground">
                        {t('app.progress.compare.empty')}
                      </div>
                    )}
                    <span className="text-center text-[11px] uppercase tracking-wide text-muted-foreground">{cell.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {byDate.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-medium">{t('app.progress.timeline.title')}</h2>
          {byDate.map(([date, photos]) => (
            <div key={date} className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">{date}</p>
              <div className="flex gap-2 overflow-x-auto">
                {photos.map((p) => (
                  <img
                    key={p.id}
                    src={p.thumb}
                    alt=""
                    className="img-editorial h-24 w-24 shrink-0 rounded-lg object-cover"
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

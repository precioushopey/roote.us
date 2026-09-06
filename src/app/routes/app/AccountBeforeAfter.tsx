import { useEffect, useMemo, useState } from 'react';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useTracking } from '@/store/tracking';
import { DisplayTitle, Prose, Button, SegmentedControl, BeforeAfterSlider } from '@/app/components/roote';
import { PHOTO_VIEWS, type PhotoView, type HairPhoto } from '@/domain/tracking/types';
import { track } from '@/analytics/analytics';
import { PATHS } from '@/app/paths';
import type { MessageKey } from '@/i18n/messages';
import { useUserProgram } from './useUserProgram';

type Mode = 'slider' | 'sideBySide' | 'timeline';

const VIEW_KEY: Record<PhotoView, MessageKey> = {
  front: 'photo.angle.front',
  top: 'photo.angle.top',
  crown: 'photo.angle.crown',
  hairline: 'photo.angle.hairline',
};

function Frame({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="block h-full w-full object-cover" />;
}

/**
 * Before / after tracker (spec §8). Baseline photos vs. a chosen checkpoint, in
 * three comparison styles across the four views. The slider is a native range
 * input, so pointer, touch, and keyboard all work. Photos are shown as captured —
 * no filtering or enhancement.
 */
export function AccountBeforeAfter() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const session = useSession();
  const tracking = useTracking();
  const view = useUserProgram();

  const [mode, setMode] = useState<Mode>('slider');
  const [viewSel, setViewSel] = useState<PhotoView>('front');
  const [compareId, setCompareId] = useState<string | null>(null);

  useEffect(() => {
    track('before_after_viewed');
  }, []);

  const baselinePhotos = useMemo((): Partial<Record<PhotoView, HairPhoto>> => {
    const map: Partial<Record<PhotoView, HairPhoto>> = {};
    for (const p of tracking.photos) if (p.checkpointId === 'baseline-d0') map[p.view] = p;
    for (const dp of session.diagnosis.photos) {
      if (!map[dp.angleKey]) {
        map[dp.angleKey] = {
          id: dp.id,
          checkpointId: 'baseline-d0',
          view: dp.angleKey,
          capturedAt: session.program?.startDate ?? dp.id,
          blobId: dp.blobId,
          thumb: dp.thumb,
        };
      }
    }
    return map;
  }, [tracking.photos, session.diagnosis.photos, session.program?.startDate]);

  if (!view) return null;
  const { userProgram: up } = view;

  const dayLabel = (n: number) => t('marketing.sys.day', { n });
  const photoFor = (checkpointId: string, v: PhotoView) =>
    tracking.photos.find((p) => p.checkpointId === checkpointId && p.view === v);

  const comparable = up.checkpoints.filter(
    (c) => c.type !== 'baseline' && tracking.photos.some((p) => p.checkpointId === c.id),
  );

  if (comparable.length === 0) {
    return (
      <div data-animate className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <DisplayTitle as="h1" step="sm">
            {t('app.beforeAfter.title')}
          </DisplayTitle>
          <Prose size="sm">{t('app.beforeAfter.body')}</Prose>
        </header>
        <Prose size="sm">{t('app.beforeAfter.empty')}</Prose>
        <Button to={withLocale(PATHS.accountSection('photos'))} variant="secondary" className="w-fit">
          {t('app.beforeAfter.addPhotos')}
        </Button>
      </div>
    );
  }

  const compareCp = comparable.find((c) => c.id === compareId) ?? comparable[comparable.length - 1];
  const beforePhoto = baselinePhotos[viewSel];
  const afterPhoto = photoFor(compareCp.id, viewSel);
  const viewName = t(VIEW_KEY[viewSel]);

  return (
    <div data-animate className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <DisplayTitle as="h1" step="sm">
          {t('app.beforeAfter.title')}
        </DisplayTitle>
        <Prose size="sm">{t('app.beforeAfter.body')}</Prose>
      </header>

      <div className="flex flex-wrap gap-3">
        <SegmentedControl<PhotoView>
          label={t('app.beforeAfter.viewLabel')}
          value={viewSel}
          onChange={setViewSel}
          options={PHOTO_VIEWS.map((v) => ({ value: v, label: t(VIEW_KEY[v]) }))}
        />
        <SegmentedControl<Mode>
          label={t('app.beforeAfter.modeLabel')}
          value={mode}
          onChange={setMode}
          options={[
            { value: 'slider', label: t('app.beforeAfter.mode.slider') },
            { value: 'sideBySide', label: t('app.beforeAfter.mode.sideBySide') },
            { value: 'timeline', label: t('app.beforeAfter.mode.timeline') },
          ]}
        />
      </div>

      {comparable.length > 1 && (
        <SegmentedControl
          label={t('app.beforeAfter.compareLabel')}
          value={compareCp.id}
          onChange={setCompareId}
          options={comparable.map((c) => ({ value: c.id, label: dayLabel(c.day) }))}
          className="w-fit"
        />
      )}

      {mode === 'timeline' ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[
            { key: 'baseline', label: t('app.baseline.badge'), photo: beforePhoto },
            ...comparable.map((c) => ({ key: c.id, label: dayLabel(c.day), photo: photoFor(c.id, viewSel) })),
          ].map((col) => (
            <figure key={col.key} className="w-40 shrink-0">
              <div className="aspect-square w-full overflow-hidden rounded-lg border border-border bg-cream-100">
                {col.photo ? (
                  <Frame src={col.photo.thumb} alt={`${viewName} — ${col.label}`} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-2 text-center font-body text-2xs text-muted-foreground">
                    {t('app.photos.notYet')}
                  </div>
                )}
              </div>
              <figcaption className="mt-1 font-body text-2xs text-muted-foreground">{col.label}</figcaption>
            </figure>
          ))}
        </div>
      ) : !beforePhoto ? (
        <Prose size="sm">{t('app.beforeAfter.missingBaseline')}</Prose>
      ) : !afterPhoto ? (
        <Prose size="sm">{t('app.beforeAfter.missingCompare')}</Prose>
      ) : mode === 'slider' ? (
        <BeforeAfterSlider
          before={<Frame src={beforePhoto.thumb} alt={`${viewName} — ${t('app.baseline.badge')}`} />}
          after={<Frame src={afterPhoto.thumb} alt={`${viewName} — ${dayLabel(compareCp.day)}`} />}
          beforeLabel={t('app.baseline.badge')}
          afterLabel={dayLabel(compareCp.day)}
          ariaLabel={t('app.beforeAfter.reveal')}
          className="max-w-md"
        />
      ) : (
        <div className="grid max-w-lg grid-cols-2 gap-3">
          {[
            { label: t('app.baseline.badge'), photo: beforePhoto },
            { label: dayLabel(compareCp.day), photo: afterPhoto },
          ].map((cell) => (
            <figure key={cell.label}>
              <div className="aspect-square w-full overflow-hidden rounded-lg border border-border bg-cream-100">
                <Frame src={cell.photo.thumb} alt={`${viewName} — ${cell.label}`} />
              </div>
              <figcaption className="mt-1 font-body text-2xs text-muted-foreground">{cell.label}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

import { Navigate, useNavigate } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { DisplayTitle, Prose, Button, ConsentPanel } from '@/app/components/roote';
import { PhotoUpload } from '@/app/components/diagnosis/PhotoUpload';
import { track } from '@/analytics/analytics';
import { PATHS } from '@/app/paths';
import { redirectForAnalysisStep } from './guards';
import type { AngleKey } from '@/store/sessionStore';

const ANGLES: AngleKey[] = ['front', 'top', 'crown', 'hairline'];

/** Step 4 — guided photos + explicit consent before any upload (brief §12, §26). */
export function PhotosScreen() {
  const t = useT();
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const session = useSession();

  const redirect = redirectForAnalysisStep('photos', session);
  if (redirect) return <Navigate to={withLocale(redirect)} replace />;

  const byAngle = (a: AngleKey) => session.diagnosis.photos.find((p) => p.angleKey === a);
  const have = ANGLES.filter((a) => byAngle(a)).length;
  const consented = session.diagnosis.photoConsent;
  const canContinue = have === ANGLES.length && consented;

  return (
    <section data-animate className="flex flex-col gap-6">
      <div>
        <DisplayTitle as="h1" step="md">
          {t('analysis.photos.title')}
        </DisplayTitle>
        <Prose className="mt-3">{t('analysis.photos.body')}</Prose>
      </div>

      <ConsentPanel
        checked={consented}
        onChange={(v) => session.setPhotoConsent(v)}
        label={t('analysis.consent.label')}
        summary={t('analysis.consent.summary')}
        details={t('analysis.consent.details')}
      />

      <div className="grid grid-cols-2 gap-4">
        {ANGLES.map((a) => (
          <PhotoUpload
            key={a}
            angleKey={a}
            value={byAngle(a)}
            onAdd={(ref) => {
              if (!byAngle(a)) track('photo_uploaded', { angle: a });
              session.addPhoto(ref);
            }}
            onRemove={(id) => session.removePhoto(id)}
          />
        ))}
      </div>

      {!canContinue && (
        <p className="font-body text-sm text-muted-foreground">
          {!consented
            ? t('analysis.photos.needConsent')
            : t('analysis.photos.needAll', { have, total: ANGLES.length })}
        </p>
      )}

      <Button
        block
        disabled={!canContinue}
        onClick={() => {
          track('photo_upload_started');
          navigate(withLocale(PATHS.analysisStep('scanning')));
        }}
      >
        {t('common.continue')}
      </Button>
    </section>
  );
}

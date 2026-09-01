import { Navigate, useNavigate } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { PhotoUpload } from '@/app/components/diagnosis/PhotoUpload';
import { redirectForStep } from './guards';
import type { AngleKey } from '@/store/sessionStore';

const ANGLES: AngleKey[] = ['front', 'top', 'crown', 'hairline'];

export function PhotosStep() {
  const t = useT();
  const navigate = useNavigate();
  const session = useSession();
  const redirect = redirectForStep('photos', session);
  if (redirect) return <Navigate to={redirect} replace />;

  const byAngle = (a: AngleKey) => session.diagnosis.photos.find((p) => p.angleKey === a);
  const canContinue = session.diagnosis.photos.length >= 1;

  return (
    <section className="mx-auto max-w-lg flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl">{t('diagnosis.photos.title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('diagnosis.photos.howto')}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {ANGLES.map((a) => (
          <PhotoUpload
            key={a}
            angleKey={a}
            value={byAngle(a)}
            onAdd={(ref) => session.addPhoto(ref)}
            onRemove={(id) => session.removePhoto(id)}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{t('diagnosis.photos.privacy')}</p>
      {/* TODO: confirm with client — minimum required photo count (currently >= 1 of 4). */}
      <button
        type="button"
        disabled={!canContinue}
        onClick={() => navigate('/diagnosis/analyzing')}
        className="rounded-md bg-primary text-primary-foreground px-8 py-4 text-sm tracking-wide disabled:opacity-40"
      >
        {t('common.continue')}
      </button>
    </section>
  );
}

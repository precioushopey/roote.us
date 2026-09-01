import { useNavigate } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';

export function IntroStep() {
  const t = useT();
  const navigate = useNavigate();
  const points = [t('diagnosis.intro.point1'), t('diagnosis.intro.point2'), t('diagnosis.intro.point3')];
  return (
    <section className="mx-auto max-w-md text-center flex flex-col gap-8">
      <h1 className="text-2xl">{t('diagnosis.intro.title')}</h1>
      <ul className="grid gap-3">
        {points.map((p) => (
          <li key={p} className="rounded-lg border border-border bg-card px-4 py-3 text-sm">{p}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => navigate('/diagnosis/gender')}
        className="rounded-md bg-primary text-primary-foreground px-8 py-4 text-sm tracking-wide"
      >
        {t('common.start')}
      </button>
    </section>
  );
}

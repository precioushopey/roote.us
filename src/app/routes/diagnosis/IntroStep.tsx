import { useNavigate } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { funnelHeading, funnelPrimaryBtn } from '@/app/components/funnel/funnelStyles';

export function IntroStep() {
  const t = useT();
  const navigate = useNavigate();
  const points = [t('diagnosis.intro.point1'), t('diagnosis.intro.point2'), t('diagnosis.intro.point3')];
  return (
    <section data-animate className="mx-auto flex max-w-md flex-col gap-8 text-center">
      <h1 className={funnelHeading}>{t('diagnosis.intro.title')}</h1>
      <ul className="grid gap-3 text-start">
        {points.map((p) => (
          <li key={p} className="rounded-xl border border-border bg-background px-4 py-3.5 text-sm">
            {p}
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => navigate('/diagnosis/gender')} className={funnelPrimaryBtn}>
        {t('common.start')}
      </button>
    </section>
  );
}

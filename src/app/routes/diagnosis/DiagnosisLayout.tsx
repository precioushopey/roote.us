import { Outlet, useLocation } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { ProgressRail } from '@/app/components/brand/ProgressRail';
import { DIAGNOSIS_STEPS } from './guards';

export function DiagnosisLayout() {
  const t = useT();
  const { pathname } = useLocation();
  const seg = pathname.split('/')[2] ?? 'intro';
  const current = Math.max(0, DIAGNOSIS_STEPS.indexOf(seg as never));
  const labels = [
    t('diagnosis.rail.intro'), t('diagnosis.rail.gender'), t('diagnosis.rail.photos'),
    t('diagnosis.rail.analysis'), t('diagnosis.rail.results'),
  ];
  return (
    <>
      <div className="px-6 pb-2">
        <ProgressRail steps={labels} current={current} />
      </div>
      <main className="flex-1 px-6 py-6">
        <Outlet />
      </main>
    </>
  );
}

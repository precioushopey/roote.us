// src/app/routes/start/StartLayout.tsx
import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useAuth } from '@/store/auth';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { LocaleToggle } from '@/app/components/brand/LocaleToggle';
import { ProgressRail } from '@/app/components/brand/ProgressRail';
import { redirectForStartStep, START_STEPS, type StartStep } from './guards';
import { seedDiagnosisAndReport } from '@/store/devSeed';

export function StartLayout() {
  const t = useT();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const session = useSession();
  const auth = useAuth();

  const seg = pathname.split('/')[2]; // undefined for /start, 'plan' | 'checkout' | 'success' otherwise
  const step: StartStep = (START_STEPS as readonly string[]).includes(seg ?? '') ? (seg as StartStep) : 'account';
  const current = START_STEPS.indexOf(step);

  const queryReportId = searchParams.get('report');
  const reportId = queryReportId ?? session.reportId;

  if (!reportId) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-muted-foreground">{t('start.noReport.body')}</p>
        {import.meta.env.DEV && (
          <button
            type="button"
            className="rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground"
            onClick={() => {
              const seed = seedDiagnosisAndReport();
              session.setAnalysis(seed.analysis);
              session.setReportId(seed.reportId);
            }}
          >
            {t('start.noReport.devSeedCta')}
          </button>
        )}
      </div>
    );
  }

  const redirect = redirectForStartStep(step, session, auth.email);
  if (redirect) return <Navigate to={redirect} replace />;

  const labels = [t('start.rail.account'), t('start.rail.plan'), t('start.rail.payment')];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Wordmark />
        <LocaleToggle />
      </header>
      <div className="px-6 pb-2">
        <ProgressRail steps={labels} current={Math.max(0, Math.min(2, current))} />
      </div>
      <main className="flex-1 px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}

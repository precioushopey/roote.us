// src/app/routes/start/StartLayout.tsx
import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useAuth } from '@/store/auth';
import { Stepper, Button } from '@/app/components/roote';
import { redirectForStartStep, START_STEPS, type StartStep } from './guards';
import { seedDiagnosisAndReport } from '@/store/devSeed';
import { useDocumentMeta } from '@/seo/useDocumentMeta';

export function StartLayout() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const session = useSession();
  const auth = useAuth();
  useDocumentMeta();

  const seg = pathname.split('/')[3]; // ['', localeRegion, 'program', step] — undefined for /program itself, 'plan' | 'checkout' | 'success' otherwise
  const step: StartStep = (START_STEPS as readonly string[]).includes(seg ?? '') ? (seg as StartStep) : 'account';
  const current = START_STEPS.indexOf(step);

  const queryReportId = searchParams.get('report');
  const resolved =
    !!session.reportId &&
    !!session.analysis &&
    (!queryReportId || queryReportId === session.reportId);

  if (!resolved) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <p className="font-body text-sm text-muted-foreground">{t('start.noReport.body')}</p>
        {import.meta.env.DEV && (
          <Button
            onClick={() => {
              const seed = seedDiagnosisAndReport();
              session.setAnalysis(seed.analysis);
              session.setReportId(seed.reportId);
            }}
          >
            {t('start.noReport.devSeedCta')}
          </Button>
        )}
      </div>
    );
  }

  const redirect = redirectForStartStep(step, session, auth.email);
  if (redirect) return <Navigate to={withLocale(redirect)} replace />;

  const steps = [
    { id: 'account', label: t('start.rail.account') },
    { id: 'plan', label: t('start.rail.plan') },
    { id: 'payment', label: t('start.rail.payment') },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-6">
      <div className="py-6">
        <Stepper steps={steps} current={Math.max(0, Math.min(2, current))} label={t('common.progressLabel')} />
      </div>
      <main className="flex-1 pb-16 pt-4">
        <Outlet />
      </main>
    </div>
  );
}

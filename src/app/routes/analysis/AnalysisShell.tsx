import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useT, useContentLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useRevealOnRoute } from '@/app/lib/useRevealOnRoute';
import { useDocumentMeta } from '@/seo/useDocumentMeta';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { LocaleToggle } from '@/app/components/brand/LocaleToggle';
import { Button, Stepper, Modal } from '@/app/components/roote';
import { packagingFor } from '@/domain/recommendation/recommend';
import { pickLocalized } from '@/content/localized';
import { ASSESSMENT_STEPS } from '@/content/assessment';
import { RAIL_STEPS, backPathForAnalysisStep, type AnalysisStep } from './guards';
import { PATHS } from '@/app/paths';

/**
 * Chrome for the Free Hair Analysis (brief §12): wordmark home, a progress rail,
 * and the locale toggle. `data-pack` themes the packaging mockups from the
 * gender step — presentation only.
 */
export function AnalysisShell() {
  const t = useT();
  const cl = useContentLocale();
  const withLocale = useLocalizedPath();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const session = useSession();
  useRevealOnRoute();
  useDocumentMeta();
  const [confirmingStartOver, setConfirmingStartOver] = useState(false);
  // Set on confirm, cleared once the reset actually runs (see effect below) —
  // resetting diagnosis immediately would still leave the outgoing screen (e.g.
  // GoalScreen) mounted for one more render, and its own guard would see the
  // now-empty diagnosis and self-redirect before our navigate() lands, racing
  // us to the wrong step. Deferring the reset until we're actually on 'intro'
  // (which has no guard) avoids that race.
  const [pendingStartOverReset, setPendingStartOverReset] = useState(false);

  // Robust to any number of leading segments (e.g. the `/:localeRegion` prefix in
  // production vs. a bare mount in tests) — find 'analysis' and read the segment after it.
  const segments = pathname.split('/').filter(Boolean);
  const seg = (segments[segments.indexOf('analysis') + 1] || 'intro') as AnalysisStep;
  const railIndex = RAIL_STEPS.indexOf(seg as (typeof RAIL_STEPS)[number]);
  const showRail = railIndex >= 0;
  const backPath = showRail ? backPathForAnalysisStep(seg) : null;

  const steps = ASSESSMENT_STEPS.filter((s) => s.onRail).map((s) => ({
    id: s.id,
    label: pickLocalized(s.label, cl),
  }));

  const pack = session.diagnosis.gender ? packagingFor(session.diagnosis.gender) : undefined;

  useEffect(() => {
    if (pendingStartOverReset && seg === 'intro') {
      session.resetDiagnosis();
      setPendingStartOverReset(false);
    }
  }, [pendingStartOverReset, seg, session]);

  function confirmStartOver() {
    setConfirmingStartOver(false);
    setPendingStartOverReset(true);
    navigate(withLocale(PATHS.analysis));
  }

  return (
    <div data-pack={pack} className="flex min-h-screen flex-col bg-background font-body text-foreground">
      <header className="sticky top-0 z-40 border-b border-transparent">
        <div className="glass mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
          <Link to={withLocale(PATHS.home)} aria-label="ROOTÉ">
            <Wordmark className="w-24" />
          </Link>
          <LocaleToggle />
        </div>
      </header>

      {showRail && (
        <div className="mx-auto w-full max-w-3xl px-6 py-5">
          <Stepper steps={steps} current={railIndex} label={t('common.progressLabel')} />
          <div className="mt-3 flex items-center justify-between">
            {backPath ? (
              <Button variant="ghost" size="sm" to={withLocale(backPath)}>
                {t('common.back')}
              </Button>
            ) : (
              <span />
            )}
            <Button variant="ghost" size="sm" onClick={() => setConfirmingStartOver(true)}>
              {t('common.startOver')}
            </Button>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 pb-16 pt-4">
        <Outlet />
      </main>

      <Modal
        open={confirmingStartOver}
        onClose={() => setConfirmingStartOver(false)}
        title={t('analysis.nav.startOverTitle')}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setConfirmingStartOver(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" size="sm" onClick={confirmStartOver}>
              {t('analysis.nav.startOverConfirm')}
            </Button>
          </>
        }
      >
        <p className="font-body text-sm text-muted-foreground">{t('analysis.nav.startOverBody')}</p>
      </Modal>
    </div>
  );
}

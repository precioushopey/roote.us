import { useState } from 'react';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useTracking } from '@/store/tracking';
import { DisplayTitle, Prose, Eyebrow, Card, Button, RadioCard, LegalNotice } from '@/app/components/roote';
import { qualitativeMetrics } from '@/domain/tracking/metrics';
import { track } from '@/analytics/analytics';
import { PATHS } from '@/app/paths';
import { METRIC_LABEL, METRIC_LABEL_FALLBACK } from './metricLabels';
import { useUserProgram } from './useUserProgram';

type Path = 'continue' | 'maintain' | 'review';

/**
 * "Review My Next Program" (PO decision #19). A completed customer does NOT drop
 * into the generic plan picker — they land here: their carried-forward hair
 * profile, then a choice of how to continue. Clinician review still applies where
 * required; ROOTÉ does not pick the path for them.
 */
export function AccountRenew() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const session = useSession();
  const tracking = useTracking();
  const view = useUserProgram();
  const [path, setPath] = useState<Path>('continue');

  if (!view) return null;
  const { userProgram: up } = view;

  const finalScan = [...tracking.scans].reverse().find((s) => s.type === 'final');
  const profileMetrics =
    finalScan?.metrics ??
    qualitativeMetrics({
      analysis: session.analysis,
      grayProfile: session.grayProfile,
      provider: 'mock',
      isMock: true,
      capturedAt: `${up.startDate}T00:00:00Z`,
    });

  return (
    <div data-animate className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Eyebrow>{t('app.renew.eyebrow')}</Eyebrow>
        <DisplayTitle as="h1" step="sm">
          {t('app.renew.title')}
        </DisplayTitle>
        <Prose size="sm">{t('app.renew.body')}</Prose>
      </header>

      <Card>
        <p className="u-caps font-body text-2xs font-semibold text-muted-foreground">
          {t('app.renew.profileTitle')}
        </p>
        <dl className="mt-3 divide-y divide-border/60">
          {profileMetrics.map((m) => (
            <div key={m.key} className="flex items-baseline justify-between gap-4 py-2">
              <dt className="font-body text-sm text-muted-foreground">
                {t(METRIC_LABEL[m.key] ?? METRIC_LABEL_FALLBACK)}
              </dt>
              <dd className="font-display text-sm text-foreground">{t(m.status as 'severity.mild')}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 font-body text-2xs text-muted-foreground">{t('app.renew.profileNote')}</p>
      </Card>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-display text-md text-foreground">{t('app.renew.chooseTitle')}</legend>
        {(['continue', 'maintain', 'review'] as Path[]).map((p) => (
          <RadioCard
            key={p}
            name="renew-path"
            value={p}
            checked={path === p}
            onChange={() => setPath(p)}
            title={t(`app.renew.path.${p}.title` as 'app.renew.path.continue.title')}
            description={t(`app.renew.path.${p}.body` as 'app.renew.path.continue.body')}
          />
        ))}
      </fieldset>

      <LegalNotice reviewRequired>{t('app.renew.reviewNote')}</LegalNotice>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          to={withLocale(path === 'review' ? PATHS.analysis : PATHS.programPlan)}
          onClick={() => track('next_program_started', { from: 'renew', path })}
        >
          {path === 'review' ? t('app.renew.cta.review') : t('app.renew.cta.default')}
        </Button>
        <Button to={withLocale(PATHS.account)} variant="ghost">
          {t('app.renew.cta.later')}
        </Button>
      </div>
    </div>
  );
}

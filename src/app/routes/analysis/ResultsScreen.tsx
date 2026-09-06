import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useT, useContentLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { DisplayTitle, Button, ScanCard, LegalNotice } from '@/app/components/roote';
import { rooteContent } from '@/content/roote.config';
import { track } from '@/analytics/analytics';
import { PATHS } from '@/app/paths';
import { redirectForAnalysisStep } from './guards';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Step 7 — result reveal + email gate (brief §12). The card shows word-band
 *  levels / a stage, never a fabricated percentage. */
export function ResultsScreen() {
  const t = useT();
  const cl = useContentLocale();
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const session = useSession();
  const [email, setEmail] = useState('');
  const [wantResults, setWantResults] = useState(true); // operational — pre-checked
  const [wantMarketing, setWantMarketing] = useState(false); // optional — never blocks (PO #11)
  const [error, setError] = useState<string | null>(null);

  const redirect = redirectForAnalysisStep('results', session);
  if (redirect) return <Navigate to={withLocale(redirect)} replace />;

  const gray = session.grayProfile;
  const analysis = session.analysis;
  const isGrayOnly = session.diagnosis.concern === 'gray';

  const rows = isGrayOnly && gray
    ? [
        { label: t('analysis.results.rowStage'), value: t(`analysis.results.grayStage.${gray.stage}` as 'analysis.results.grayStage.early') },
        { label: t('analysis.results.rowArea'), value: t(gray.visibleAreaKey as 'gray.area.temples') },
        { label: t('analysis.results.rowPace'), value: t(gray.paceKey as 'gray.pace.slow') },
      ]
    : analysis
      ? [
          { label: t('analysis.results.rowDensity'), value: null, pendingLabel: 'density' },
          { label: t('analysis.results.rowPattern'), value: t(`severity.${analysis.severityBand}` as 'severity.mild') },
          { label: t('analysis.results.rowProgression'), value: t(analysis.summaryPlainKey as 'summary.norwood.mild') },
        ]
      : [];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError(t('ready.email.invalid'));
      return;
    }
    if (!wantResults) {
      setError(t('analysis.results.consentResultsRequired'));
      return;
    }
    session.setEmail(email);
    session.setMarketingConsent(wantMarketing);
    track('email_result_submitted', { marketing: wantMarketing });
    navigate(withLocale(PATHS.report(session.reportId!)));
  }

  return (
    <section data-animate className="flex flex-col gap-6">
      <DisplayTitle as="h1" step="md">
        {t('analysis.results.title')}
      </DisplayTitle>

      <ScanCard title={t('analysis.results.cardTitle')} rows={rows} />

      <LegalNotice>{rooteContent.disclaimers.demo[cl]}</LegalNotice>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <label htmlFor="results-email" className="font-body text-sm font-medium">
          {t('analysis.results.emailLabel')}
        </label>
        <input
          id="results-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          className="rounded-md border border-input bg-input-background px-3 py-2.5 text-sm outline-none focus:border-accent"
          placeholder="you@example.com"
        />
        {error && (
          <p role="alert" className="font-body text-xs text-destructive">
            {error}
          </p>
        )}
        <label className="flex items-start gap-2 font-body text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={wantResults}
            onChange={(e) => {
              setWantResults(e.target.checked);
              setError(null);
            }}
            className="mt-0.5 h-3.5 w-3.5 accent-[var(--primary)]"
          />
          <span>{t('analysis.results.consentResults')}</span>
        </label>
        <label className="flex items-start gap-2 font-body text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={wantMarketing}
            onChange={(e) => setWantMarketing(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 accent-[var(--primary)]"
          />
          <span>{t('analysis.results.consentMarketing')}</span>
        </label>
        <Button block type="submit" caps>
          {t('analysis.results.emailCta')}
        </Button>
        <p className="font-body text-xs text-muted-foreground">{t('analysis.results.consentLine')}</p>
      </form>
    </section>
  );
}

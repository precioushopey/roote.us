import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useT, useContentLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { DisplayTitle, Prose } from '@/app/components/roote';
import { pickLocalized } from '@/content/localized';
import { SCAN_CATEGORIES } from '@/content/assessment';
import { useReducedMotion } from '@/app/lib/useReducedMotion';
import { track } from '@/analytics/analytics';
import { PATHS } from '@/app/paths';
import { redirectForAnalysisStep } from './guards';

/**
 * Step 5 — the "Analyzing your hair…" state. The categories tick through while
 * the assessment prepares; then the questionnaire runs. Announced via
 * `aria-live`. No claim that analysis has actually happened.
 */
export function ScanningScreen() {
  const t = useT();
  const cl = useContentLocale();
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const session = useSession();
  const reduce = useReducedMotion();
  const [done, setDone] = useState(reduce ? SCAN_CATEGORIES.length : 0);

  const redirect = redirectForAnalysisStep('scanning', session);

  useEffect(() => {
    track('analysis_processing');
  }, []);

  useEffect(() => {
    if (redirect) return;
    if (done >= SCAN_CATEGORIES.length) {
      const id = setTimeout(() => navigate(withLocale(PATHS.analysisStep('questions'))), reduce ? 0 : 500);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setDone((d) => d + 1), reduce ? 0 : 650);
    return () => clearTimeout(id);
  }, [done, redirect, reduce, navigate, withLocale]);

  if (redirect) return <Navigate to={withLocale(redirect)} replace />;

  const pct = Math.round((done / SCAN_CATEGORIES.length) * 100);

  return (
    <section data-animate className="flex flex-col gap-8">
      <DisplayTitle as="h1" step="md">
        {t('analysis.scanning.title')}
      </DisplayTitle>
      <Prose>{t('analysis.scanning.body')}</Prose>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${Math.max(8, pct)}%` }} />
        </div>
        <ul aria-live="polite" className="mt-4 grid gap-2 font-body text-sm">
          {SCAN_CATEGORIES.map((c, i) => (
            <li key={i} className={i < done ? 'text-foreground' : 'text-muted-foreground'}>
              <span aria-hidden className={i < done ? 'text-accent' : ''}>{i < done ? '✓ ' : '• '}</span>
              {pickLocalized(c, cl)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

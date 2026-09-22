import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { Sparkles } from 'lucide-react';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { DisplayTitle, Prose } from '@/app/components/roote';
import { pickLocalized } from '@/content/localized';
import { SCAN_CATEGORIES } from '@/content/assessment';
import { useReducedMotion } from '@/app/lib/useReducedMotion';
import { track } from '@/analytics/analytics';
import { PATHS } from '@/app/paths';
import { redirectForAnalysisStep } from './guards';
import { cn } from '@/app/components/ui/utils';

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Step 5 — the "Analyzing your hair…" state. The categories tick through while
 * the assessment prepares; then the questionnaire runs. Announced via
 * `aria-live`. No claim that analysis has actually happened.
 */
export function ScanningScreen() {
  const t = useT();
  const cl = useLocale().locale;
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

      <div className="flex flex-col items-center py-2">
        <div className="relative h-36 w-36">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="var(--border)" strokeWidth="6" />
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - Math.max(8, pct) / 100)}
              className="transition-[stroke-dashoffset] duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles
              aria-hidden
              className={cn('h-10 w-10 text-accent', !reduce && 'animate-pulse')}
              strokeWidth={1.5}
            />
          </div>
        </div>
        <p className="mt-3 font-body text-sm text-muted-foreground">{t('analysis.scanning.percent', { pct })}</p>
      </div>
      <ul aria-live="polite" className="flex w-fit flex-col items-start gap-2 self-center font-body text-sm">
        {SCAN_CATEGORIES.map((c, i) => (
          <li key={i} className={i < done ? 'text-foreground' : 'text-muted-foreground'}>
            <span aria-hidden className={i < done ? 'text-accent' : ''}>{i < done ? '✓ ' : '• '}</span>
            {pickLocalized(c, cl)}
          </li>
        ))}
      </ul>
    </section>
  );
}

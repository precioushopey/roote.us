import { useState } from 'react';
import { Navigate, useNavigate, useOutletContext } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { DisplayTitle, RadioCard } from '@/app/components/roote';
import { pickLocalized } from '@/content/localized';
import { YES_NO_OPTIONS } from '@/content/assessment';
import { track } from '@/analytics/analytics';
import { PATHS } from '@/app/paths';
import { redirectForAnalysisStep, backPathForAnalysisStep } from './guards';
import { QuizFooterNav } from './QuizFooterNav';

/** v3.1 §3 Step 3A — only reachable when Step 3 = Yes; see redirectForAnalysisStep.
 *  Choosing an option advances immediately (2026-09-22 auto-advance removal
 *  reverted for this step per user request); Next stays as a manual
 *  fallback for revisiting a prior answer without re-clicking it. */
export function SatisfactionScreen() {
  const t = useT();
  const cl = useLocale().locale;
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const session = useSession();
  const { requestStartOver } = useOutletContext<{ requestStartOver: () => void }>();
  const stored = session.diagnosis.answers.satisfied_previous_products;
  const [selected, setSelected] = useState<'yes' | 'no' | null>(stored === undefined ? null : stored ? 'yes' : 'no');

  const redirect = redirectForAnalysisStep('satisfaction', session);
  if (redirect) return <Navigate to={withLocale(redirect)} replace />;

  function proceed(picked?: 'yes' | 'no') {
    const value = picked ?? selected;
    if (!value) return;
    session.setAnswer('satisfied_previous_products', value === 'yes');
    track('question_answered', { id: 'satisfied_previous_products' });
    navigate(withLocale(PATHS.analysisStep('goal')));
  }

  function choose(value: 'yes' | 'no') {
    setSelected(value);
    proceed(value);
  }

  return (
    <section data-animate className="flex flex-col gap-8">
      <DisplayTitle as="h1" step="md">
        {t('analysis.satisfaction.title')}
      </DisplayTitle>
      <div className="grid gap-4">
        {YES_NO_OPTIONS.map((o) => (
          <RadioCard
            key={o.value}
            name="satisfaction"
            value={o.value}
            checked={selected === o.value}
            onChange={() => choose(o.value)}
            title={pickLocalized(o.label, cl)}
          />
        ))}
      </div>
      <QuizFooterNav
        backPath={backPathForAnalysisStep('satisfaction', session)}
        onStartOver={requestStartOver}
        onNext={() => proceed()}
        nextDisabled={!selected}
      />
    </section>
  );
}

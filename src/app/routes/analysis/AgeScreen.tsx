import { useState } from 'react';
import { Navigate, useNavigate, useOutletContext } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { DisplayTitle, RadioCard } from '@/app/components/roote';
import { pickLocalized } from '@/content/localized';
import { AGE_RANGE_OPTIONS } from '@/content/assessment';
import { track } from '@/analytics/analytics';
import { PATHS } from '@/app/paths';
import { redirectForAnalysisStep, backPathForAnalysisStep } from './guards';
import { QuizFooterNav } from './QuizFooterNav';
import type { AgeRange } from '@/domain/analysis/types';

/** v3.1 §3 Step 2 — profile context only, single-select. Choosing an option
 *  advances immediately (2026-09-22 auto-advance removal reverted for this
 *  step per user request); Next stays as a manual fallback for revisiting a
 *  prior answer without re-clicking it. */
export function AgeScreen() {
  const t = useT();
  const cl = useLocale().locale;
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const session = useSession();
  const { requestStartOver } = useOutletContext<{ requestStartOver: () => void }>();
  const [selected, setSelected] = useState<AgeRange | null>(session.diagnosis.answers.age_range ?? null);

  const redirect = redirectForAnalysisStep('age', session);
  if (redirect) return <Navigate to={withLocale(redirect)} replace />;

  function proceed(picked?: AgeRange) {
    const value = picked ?? selected;
    if (!value) return;
    session.setAnswer('age_range', value);
    track('question_answered', { id: 'age_range' });
    navigate(withLocale(PATHS.analysisStep('previous-products')));
  }

  function choose(value: AgeRange) {
    setSelected(value);
    proceed(value);
  }

  return (
    <section data-animate className="flex flex-col gap-8">
      <DisplayTitle as="h1" step="md">
        {t('analysis.age.title')}
      </DisplayTitle>
      <div className="grid gap-4">
        {AGE_RANGE_OPTIONS.map((o) => (
          <RadioCard
            key={o.value}
            name="ageRange"
            value={o.value}
            checked={selected === o.value}
            onChange={() => choose(o.value)}
            title={pickLocalized(o.label, cl)}
          />
        ))}
      </div>
      <QuizFooterNav
        backPath={backPathForAnalysisStep('age', session)}
        onStartOver={requestStartOver}
        onNext={() => proceed()}
        nextDisabled={!selected}
      />
    </section>
  );
}

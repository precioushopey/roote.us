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

/** v3.1 §3 Step 3 — "Have you tried hair-loss products before?" Yes routes to
 *  the conditional satisfaction screen; No skips straight to Goal. Choosing
 *  an option advances immediately (2026-09-22 auto-advance removal reverted
 *  for this step per user request); Next stays as a manual fallback for
 *  revisiting a prior answer without re-clicking it. */
export function PreviousProductsScreen() {
  const t = useT();
  const cl = useLocale().locale;
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const session = useSession();
  const { requestStartOver } = useOutletContext<{ requestStartOver: () => void }>();
  const stored = session.diagnosis.answers.previous_hair_products;
  const [selected, setSelected] = useState<'yes' | 'no' | null>(stored === undefined ? null : stored ? 'yes' : 'no');

  const redirect = redirectForAnalysisStep('previous-products', session);
  if (redirect) return <Navigate to={withLocale(redirect)} replace />;

  function proceed(picked?: 'yes' | 'no') {
    const value = picked ?? selected;
    if (!value) return;
    session.setAnswer('previous_hair_products', value === 'yes');
    track('question_answered', { id: 'previous_hair_products' });
    navigate(withLocale(PATHS.analysisStep(value === 'yes' ? 'satisfaction' : 'goal')));
  }

  function choose(value: 'yes' | 'no') {
    setSelected(value);
    proceed(value);
  }

  return (
    <section data-animate className="flex flex-col gap-8">
      <DisplayTitle as="h1" step="md">
        {t('analysis.previousProducts.title')}
      </DisplayTitle>
      <div className="grid gap-4">
        {YES_NO_OPTIONS.map((o) => (
          <RadioCard
            key={o.value}
            name="previousProducts"
            value={o.value}
            checked={selected === o.value}
            onChange={() => choose(o.value)}
            title={pickLocalized(o.label, cl)}
          />
        ))}
      </div>
      <QuizFooterNav
        backPath={backPathForAnalysisStep('previous-products', session)}
        onStartOver={requestStartOver}
        onNext={() => proceed()}
        nextDisabled={!selected}
      />
    </section>
  );
}

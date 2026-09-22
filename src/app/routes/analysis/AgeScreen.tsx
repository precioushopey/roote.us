import { Navigate, useNavigate } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { DisplayTitle, RadioCard } from '@/app/components/roote';
import { pickLocalized } from '@/content/localized';
import { AGE_RANGE_OPTIONS } from '@/content/assessment';
import { track } from '@/analytics/analytics';
import { PATHS } from '@/app/paths';
import { redirectForAnalysisStep } from './guards';
import type { AgeRange } from '@/domain/analysis/types';

/** v3.1 §3 Step 2 — profile context only, single-select, auto-advance. */
export function AgeScreen() {
  const t = useT();
  const cl = useLocale().locale;
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const session = useSession();

  const redirect = redirectForAnalysisStep('age', session);
  if (redirect) return <Navigate to={withLocale(redirect)} replace />;

  const choose = (value: AgeRange) => {
    session.setAnswer('age_range', value);
    track('question_answered', { id: 'age_range' });
    navigate(withLocale(PATHS.analysisStep('previous-products')));
  };

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
            checked={session.diagnosis.answers.age_range === o.value}
            onChange={() => choose(o.value)}
            title={pickLocalized(o.label, cl)}
          />
        ))}
      </div>
    </section>
  );
}

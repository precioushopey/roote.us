import { Navigate, useNavigate } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { DisplayTitle, RadioCard } from '@/app/components/roote';
import { pickLocalized } from '@/content/localized';
import { YES_NO_OPTIONS } from '@/content/assessment';
import { track } from '@/analytics/analytics';
import { PATHS } from '@/app/paths';
import { redirectForAnalysisStep } from './guards';

/** v3.1 §3 Step 3A — only reachable when Step 3 = Yes; see redirectForAnalysisStep. */
export function SatisfactionScreen() {
  const t = useT();
  const cl = useLocale().locale;
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const session = useSession();

  const redirect = redirectForAnalysisStep('satisfaction', session);
  if (redirect) return <Navigate to={withLocale(redirect)} replace />;

  const choose = (value: 'yes' | 'no') => {
    session.setAnswer('satisfied_previous_products', value === 'yes');
    track('question_answered', { id: 'satisfied_previous_products' });
    navigate(withLocale(PATHS.analysisStep('goal')));
  };

  const current = session.diagnosis.answers.satisfied_previous_products;

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
            checked={current === (o.value === 'yes')}
            onChange={() => choose(o.value)}
            title={pickLocalized(o.label, cl)}
          />
        ))}
      </div>
    </section>
  );
}

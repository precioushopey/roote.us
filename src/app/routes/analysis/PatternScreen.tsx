import { Navigate, useNavigate } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { DisplayTitle, Button } from '@/app/components/roote';
import { pickLocalized } from '@/content/localized';
import { MALE_PATTERN_OPTIONS, FEMALE_PATTERN_OPTIONS } from '@/content/assessment';
import { track } from '@/analytics/analytics';
import { PATHS } from '@/app/paths';
import { redirectForAnalysisStep } from './guards';
import type { PatternCode } from '@/domain/recommendation/types';
import { cn } from '@/app/components/ui/utils';

/**
 * v3.1 §3 Step 5 — only reachable when Hair Goal = Hair Growth (see
 * redirectForAnalysisStep). Unlike every other single-select question in
 * this flow, this one does NOT auto-advance — v3.1 §6 is explicit that the
 * visitor should be able to review their image choice before continuing,
 * so this renders its own explicit Continue button instead of navigating
 * inside `choose`.
 */
export function PatternScreen() {
  const t = useT();
  const cl = useLocale().locale;
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const session = useSession();

  const redirect = redirectForAnalysisStep('pattern', session);
  if (redirect) return <Navigate to={withLocale(redirect)} replace />;
  if (session.diagnosis.gender !== 'male' && session.diagnosis.gender !== 'female') {
    return <Navigate to={withLocale(PATHS.analysisStep('photos'))} replace />;
  }

  const options = session.diagnosis.gender === 'female' ? FEMALE_PATTERN_OPTIONS : MALE_PATTERN_OPTIONS;
  const current = session.diagnosis.answers.hair_pattern_id;

  const choose = (value: PatternCode) => {
    session.setAnswer('hair_pattern_id', value);
    track('question_answered', { id: 'hair_pattern_id' });
  };

  const proceed = () => {
    navigate(withLocale(PATHS.analysisStep('photos')));
  };

  return (
    <section data-animate className="flex flex-col gap-8">
      <DisplayTitle as="h1" step="md">
        {t('analysis.pattern.title')}
      </DisplayTitle>
      <div className="grid grid-cols-2 gap-4">
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              'flex cursor-pointer flex-col gap-2 rounded-sm border border-border bg-card p-4 text-center transition-colors',
              'hover:ring-1 hover:ring-deep-700 has-[:checked]:ring-1 has-[:checked]:ring-deep-800 has-[:checked]:bg-cream-100',
              'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
            )}
          >
            <input
              type="radio"
              name="pattern"
              value={o.value}
              checked={current === o.value}
              onChange={() => choose(o.value)}
              className="peer sr-only"
            />
            <img src={o.imageSrc} alt={pickLocalized(o.label, cl)} loading="lazy" className="aspect-square w-full rounded-sm object-contain" />
            <span className="font-body text-sm text-foreground">{pickLocalized(o.label, cl)}</span>
          </label>
        ))}
      </div>
      <Button block disabled={!current} onClick={proceed}>
        {t('common.continue')}
      </Button>
    </section>
  );
}

import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useT, useContentLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { DisplayTitle, Prose, Button, RadioCard } from '@/app/components/roote';
import { pickLocalized } from '@/content/localized';
import { GENDER_OPTIONS, PACKAGING_OPTIONS, HAIR_GOAL_OPTIONS } from '@/content/assessment';
import { track } from '@/analytics/analytics';
import { PATHS } from '@/app/paths';
import { redirectForAnalysisStep } from './guards';
import type { Gender, HairGoal } from '@/domain/analysis/types';

/* --- 1 · Intro ------------------------------------------------------------ */
export function IntroScreen() {
  const t = useT();
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  return (
    <section data-animate className="flex flex-col gap-8 text-center">
      <DisplayTitle as="h1" step="md" align="center">
        {t('analysis.intro.title')}
      </DisplayTitle>
      <ul className="mx-auto grid max-w-sm gap-3 text-start">
        {['analysis.intro.point1', 'analysis.intro.point2', 'analysis.intro.point3'].map((k) => (
          <li key={k} className="rounded-xl border border-border bg-card px-4 py-3.5 font-body text-sm">
            {t(k as 'analysis.intro.point1')}
          </li>
        ))}
      </ul>
      <div className="flex flex-col items-center gap-3">
        <Button
          onClick={() => {
            track('analysis_started');
            navigate(withLocale(PATHS.analysisStep('gender')));
          }}
          size="lg"
          caps
        >
          {t('analysis.intro.cta')}
        </Button>
        <p className="font-body text-xs text-muted-foreground">{t('analysis.intro.consentHint')}</p>
      </div>
    </section>
  );
}

/* --- 2 · Gender (packaging personalization only) ---------------------- */
export function GenderScreen() {
  const t = useT();
  const cl = useContentLocale();
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const session = useSession();
  // shown after "Prefer not to say" — pick a packaging look before continuing (PO #24)
  const [needPackaging, setNeedPackaging] = useState(false);

  const redirect = redirectForAnalysisStep('gender', session);
  if (redirect) return <Navigate to={withLocale(redirect)} replace />;

  const choose = (g: Gender) => {
    session.setGender(g);
    track('gender_selected', { gender: g });
    if (g === 'unspecified') {
      setNeedPackaging(true);
      return;
    }
    navigate(withLocale(PATHS.analysisStep('goal')));
  };

  const choosePackaging = (p: 'men' | 'women') => {
    session.setPackagingPreference(p);
    navigate(withLocale(PATHS.analysisStep('goal')));
  };

  return (
    <section data-animate className="flex flex-col gap-8">
      <DisplayTitle as="h1" step="md">
        {t('analysis.gender.title')}
      </DisplayTitle>
      <Prose>{t('analysis.gender.note')}</Prose>
      {needPackaging ? (
        <>
          <h2 className="font-display text-md text-foreground">{t('analysis.gender.packagingTitle')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {PACKAGING_OPTIONS.map((o) => (
              <RadioCard
                key={o.value}
                name="packaging"
                value={o.value}
                checked={session.diagnosis.packagingPreference === o.value}
                onChange={() => choosePackaging(o.value)}
                title={pickLocalized(o.label, cl)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {GENDER_OPTIONS.map((o) => (
            <RadioCard
              key={o.value}
              name="gender"
              value={o.value}
              checked={session.diagnosis.gender === o.value}
              onChange={() => choose(o.value)}
              title={pickLocalized(o.label, cl)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* --- 3 · Hair Goal (client-confirmed 2026-09-07) ----------------------- */
export function GoalScreen() {
  const t = useT();
  const cl = useContentLocale();
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const session = useSession();

  const redirect = redirectForAnalysisStep('goal', session);
  if (redirect) return <Navigate to={withLocale(redirect)} replace />;

  const choose = (g: HairGoal) => {
    session.setHairGoal(g);
    track('hair_goal_selected', { hairGoal: g });
    navigate(withLocale(PATHS.analysisStep('photos')));
  };

  return (
    <section data-animate className="flex flex-col gap-8">
      <DisplayTitle as="h1" step="md">
        {t('analysis.goal.title')}
      </DisplayTitle>
      <div className="grid gap-3">
        {HAIR_GOAL_OPTIONS.map((o) => (
          <RadioCard
            key={o.value}
            name="hairGoal"
            value={o.value}
            checked={session.diagnosis.hairGoal === o.value}
            onChange={() => choose(o.value)}
            title={pickLocalized(o.title, cl)}
            description={pickLocalized(o.description, cl)}
          />
        ))}
      </div>
    </section>
  );
}

import { useState } from 'react';
import { Navigate, useNavigate, useOutletContext } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { DisplayTitle, Prose, Button, RadioCard } from '@/app/components/roote';
import { pickLocalized } from '@/content/localized';
import { GENDER_OPTIONS, PACKAGING_OPTIONS, HAIR_GOAL_OPTIONS } from '@/content/assessment';
import { track } from '@/analytics/analytics';
import { PATHS } from '@/app/paths';
import { redirectForAnalysisStep, backPathForAnalysisStep } from './guards';
import { QuizFooterNav } from './QuizFooterNav';
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
      <ul className="flex flex-col gap-4 text-start sm:flex-row">
        {['analysis.intro.point1', 'analysis.intro.point2', 'analysis.intro.point3'].map((k) => (
          <li key={k} className="flex-1 rounded-xl border border-border bg-card px-4 py-3.5 font-body text-sm">
            {t(k as 'analysis.intro.point1')}
          </li>
        ))}
      </ul>
      <div className="flex flex-col items-center gap-4">
        <Button
          onClick={() => {
            track('analysis_started');
            navigate(withLocale(PATHS.analysisStep('gender')));
          }}
          caps
          block
        >
          {t('analysis.intro.cta')}
        </Button>
        <p className="font-body text-sm text-muted-foreground">{t('analysis.intro.consentHint')}</p>
      </div>
    </section>
  );
}

/* --- 2 · Gender (packaging personalization only) ---------------------- */
export function GenderScreen() {
  const t = useT();
  const cl = useLocale().locale;
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const session = useSession();
  const { requestStartOver } = useOutletContext<{ requestStartOver: () => void }>();
  // shown after "Prefer not to say" — pick a packaging look before continuing (PO #24)
  const [needPackaging, setNeedPackaging] = useState(false);
  const [selectedGender, setSelectedGender] = useState<Gender | null>(session.diagnosis.gender ?? null);
  const [selectedPackaging, setSelectedPackaging] = useState<'men' | 'women' | null>(
    session.diagnosis.packagingPreference ?? null,
  );

  const redirect = redirectForAnalysisStep('gender', session);
  if (redirect) return <Navigate to={withLocale(redirect)} replace />;

  function proceedGender(picked?: Gender) {
    const value = picked ?? selectedGender;
    if (!value) return;
    session.setGender(value);
    track('gender_selected', { gender: value });
    if (value === 'unspecified') {
      setNeedPackaging(true);
      return;
    }
    navigate(withLocale(PATHS.analysisStep('age')));
  }

  function chooseGender(value: Gender) {
    setSelectedGender(value);
    proceedGender(value);
  }

  function proceedPackaging(picked?: 'men' | 'women') {
    const value = picked ?? selectedPackaging;
    if (!value) return;
    session.setPackagingPreference(value);
    navigate(withLocale(PATHS.analysisStep('age')));
  }

  function choosePackaging(value: 'men' | 'women') {
    setSelectedPackaging(value);
    proceedPackaging(value);
  }

  return (
    <section data-animate className="flex flex-col gap-8">
      <DisplayTitle as="h1" step="md">
        {t('analysis.gender.title')}
      </DisplayTitle>
      <Prose>{t('analysis.gender.note')}</Prose>
      {needPackaging ? (
        <>
          <h2 className="font-display text-md text-foreground">{t('analysis.gender.packagingTitle')}</h2>
          <div className="grid gap-4">
            {PACKAGING_OPTIONS.map((o) => (
              <RadioCard
                key={o.value}
                name="packaging"
                value={o.value}
                checked={selectedPackaging === o.value}
                onChange={() => choosePackaging(o.value)}
                title={pickLocalized(o.label, cl)}
              />
            ))}
          </div>
          <QuizFooterNav
            onBack={() => setNeedPackaging(false)}
            onStartOver={requestStartOver}
            onNext={() => proceedPackaging()}
            nextDisabled={!selectedPackaging}
          />
        </>
      ) : (
        <>
          <div className="grid gap-4">
            {GENDER_OPTIONS.map((o) => (
              <RadioCard
                key={o.value}
                name="gender"
                value={o.value}
                checked={selectedGender === o.value}
                onChange={() => chooseGender(o.value)}
                title={pickLocalized(o.label, cl)}
              />
            ))}
          </div>
          <QuizFooterNav
            backPath={backPathForAnalysisStep('gender', session)}
            onStartOver={requestStartOver}
            onNext={() => proceedGender()}
            nextDisabled={!selectedGender}
          />
        </>
      )}
    </section>
  );
}

/* --- 3 · Hair Goal (client-confirmed 2026-09-07) ----------------------- */
export function GoalScreen() {
  const t = useT();
  const cl = useLocale().locale;
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const session = useSession();
  const { requestStartOver } = useOutletContext<{ requestStartOver: () => void }>();
  const [selected, setSelected] = useState<HairGoal | null>(session.diagnosis.hairGoal ?? null);

  const redirect = redirectForAnalysisStep('goal', session);
  if (redirect) return <Navigate to={withLocale(redirect)} replace />;

  function proceed(picked?: HairGoal) {
    const value = picked ?? selected;
    if (!value) return;
    session.setHairGoal(value);
    track('hair_goal_selected', { hairGoal: value });
    navigate(withLocale(PATHS.analysisStep(value === 'hair-growth' ? 'pattern' : 'photos')));
  }

  function choose(value: HairGoal) {
    setSelected(value);
    proceed(value);
  }

  return (
    <section data-animate className="flex flex-col gap-8">
      <DisplayTitle as="h1" step="md">
        {t('analysis.goal.title')}
      </DisplayTitle>
      <div className="grid gap-4">
        {HAIR_GOAL_OPTIONS.map((o) => (
          <RadioCard
            key={o.value}
            name="hairGoal"
            value={o.value}
            checked={selected === o.value}
            onChange={() => choose(o.value)}
            title={pickLocalized(o.title, cl)}
            description={pickLocalized(o.description, cl)}
          />
        ))}
      </div>
      <QuizFooterNav
        backPath={backPathForAnalysisStep('goal', session)}
        onStartOver={requestStartOver}
        onNext={() => proceed()}
        nextDisabled={!selected}
      />
    </section>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useOutletContext } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { DisplayTitle, RadioCard } from '@/app/components/roote';
import { pickLocalized } from '@/content/localized';
import { questionsForHairGoal } from '@/content/assessment';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import { deriveGrayProfile, type GrayAnswers } from '@/domain/analysis/grayProfile';
import { getAnalysisProvider } from '@/domain/analysis/provider';
import { getBlob } from '@/store/persistence';
import { track } from '@/analytics/analytics';
import { PATHS } from '@/app/paths';
import { redirectForAnalysisStep, backPathForAnalysisStep } from './guards';
import { QuizFooterNav } from './QuizFooterNav';
import type { Answers, HealthCondition } from '@/domain/analysis/types';
import type { PhotoRef } from '@/store/sessionStore';

/** Gray-neutral thinning answers — keeps `session.analysis` populated on the
 *  gray-only path so the report/program stay reachable (WP6 renders gray content
 *  from `session.grayProfile`). */
const THINNING_NEUTRAL: Answers = {
  q1_area: 'hairline',
  q2_onset: 'lt-6mo',
  q3_prior: 'never',
  q4_family: 'no',
  q13_progression: 'gradual',
};
const GRAY_DEFAULTS: GrayAnswers = {
  g1_onset: 'lt-1y',
  g2_area: 'crown',
  g3_pace: 'steady',
  g4_color: 'no',
};

async function loadPhotoBlobs(photos: PhotoRef[]) {
  const out: { angleKey: string; blob: Blob }[] = [];
  for (const p of photos) {
    try {
      const blob = await getBlob(p.blobId);
      if (blob) out.push({ angleKey: p.angleKey, blob });
    } catch {
      /* skip */
    }
  }
  return out;
}

/** Step 6 — one question per screen (brief §12), except Health History which is
 *  multi-select. Hair-Growth-style or gray branch set by Hair Goal. Picking a
 *  single-select option writes it immediately and advances the pagination
 *  on its own (2026-09-22 auto-advance removal reverted per user request);
 *  Health History (multi-select) still needs the shared QuizFooterNav's
 *  explicit Next, since picking one option there shouldn't move on before
 *  the visitor can pick more. The advance itself is deferred to an effect
 *  (`autoAdvance`) rather than fired inline from `pick`, because the last
 *  question's advance runs analysis off `session.diagnosis.answers` — that
 *  needs to observe the just-dispatched answer, which isn't visible until
 *  after this render's session update commits. Back moves within this
 *  screen's own pagination once you're past the first question; at the
 *  first question it's the route-level Back to `photos`. */
export function QuestionsScreen() {
  const t = useT();
  const cl = useLocale().locale;
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const session = useSession();
  const { requestStartOver } = useOutletContext<{ requestStartOver: () => void }>();
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const finishedRef = useRef(false);

  const redirect = redirectForAnalysisStep('questions', session);

  const hairGoal = session.diagnosis.hairGoal ?? 'other';
  const questions = useMemo(() => questionsForHairGoal(hairGoal), [hairGoal]);

  useEffect(() => {
    if (!autoAdvance) return;
    setAutoAdvance(false);
    void advance();
    // `advance` closes over the latest `i`/`session` each render and is only
    // acted on the render after `pick()` flips `autoAdvance` — see comment above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAdvance]);

  if (redirect) return <Navigate to={withLocale(redirect)} replace />;
  if (session.analysis || session.grayProfile) {
    return <Navigate to={withLocale(PATHS.analysisStep('results'))} replace />;
  }

  const q = questions[Math.min(i, questions.length - 1)];
  const isGrayId = (id: string) => id.startsWith('g');
  const isHealthHistory = q.id === 'health_history';

  const currentValue = isHealthHistory
    ? undefined
    : isGrayId(q.id)
      ? (session.diagnosis.grayAnswers as Record<string, string>)[q.id]
      : (session.diagnosis.answers as Record<string, string>)[q.id];

  async function finish() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setBusy(true);
    const gender = session.diagnosis.gender!;
    const reportId = crypto.randomUUID();

    try {
      if (hairGoal === 'slow-graying') {
        const ga = { ...GRAY_DEFAULTS, ...(session.diagnosis.grayAnswers as Partial<GrayAnswers>) } as GrayAnswers;
        session.setGrayProfile(deriveGrayProfile({ answers: ga }));
        session.setAnalysis(deriveAnalysis({ gender, hairGoal, answers: THINNING_NEUTRAL }));
      } else {
        const images = await loadPhotoBlobs(session.diagnosis.photos);
        const answers = session.diagnosis.answers as Answers;
        const { analysis } = await getAnalysisProvider().analyze({ gender, hairGoal, answers, images });
        session.setAnalysis(analysis);
      }
    } catch {
      session.setAnalysis(deriveAnalysis({ gender, hairGoal, answers: session.diagnosis.answers as Answers }));
    }

    session.setReportId(reportId);
    track('analysis_completed', { hairGoal });
    navigate(withLocale(PATHS.analysisStep('results')));
  }

  function pick(value: string) {
    if (isGrayId(q.id)) {
      session.setGrayAnswer(q.id as keyof GrayAnswers, value as never);
    } else {
      session.setAnswer(q.id as keyof Answers, value as never);
    }
    track('question_answered', { id: q.id });
    setAutoAdvance(true);
  }

  function toggleHealth(value: string) {
    session.toggleHealthHistory(value as HealthCondition);
    track('question_answered', { id: q.id });
  }

  async function advance() {
    if (i < questions.length - 1) setI(i + 1);
    else await finish();
  }

  const canAdvanceHealth = isHealthHistory && session.diagnosis.healthHistory.length > 0;
  const nextDisabled = busy || (isHealthHistory ? !canAdvanceHealth : currentValue === undefined);

  return (
    <section data-animate className="flex flex-col gap-8">
      <span className="font-body text-sm text-muted-foreground">
        {t('q.counter', { index: i + 1, total: questions.length })}
      </span>

      <DisplayTitle as="h2" step="sm">
        {pickLocalized(q.prompt, cl)}
      </DisplayTitle>

      {isHealthHistory ? (
        <div className="grid gap-4">
          {q.options.map((o) => (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 font-body text-sm"
            >
              <input
                type="checkbox"
                checked={session.diagnosis.healthHistory.includes(o.value as HealthCondition)}
                onChange={() => toggleHealth(o.value)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              {pickLocalized(o.label, cl)}
            </label>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {q.options.map((o) => (
            <RadioCard
              key={o.value}
              name={q.id}
              value={o.value}
              checked={currentValue === o.value}
              onChange={pick}
              title={pickLocalized(o.label, cl)}
            />
          ))}
        </div>
      )}

      <QuizFooterNav
        {...(i > 0 ? { onBack: () => setI(i - 1) } : { backPath: backPathForAnalysisStep('questions', session) })}
        onStartOver={requestStartOver}
        onNext={() => void advance()}
        nextDisabled={nextDisabled}
        nextLabel={busy ? t('analysis.finalizing') : t('common.continue')}
      />
    </section>
  );
}

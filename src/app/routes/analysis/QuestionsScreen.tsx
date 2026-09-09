import { useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useT, useContentLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { DisplayTitle, RadioCard, Button } from '@/app/components/roote';
import { pickLocalized } from '@/content/localized';
import { questionsForHairGoal } from '@/content/assessment';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import { deriveGrayProfile, type GrayAnswers } from '@/domain/analysis/grayProfile';
import { getAnalysisProvider } from '@/domain/analysis/provider';
import { getBlob } from '@/store/persistence';
import { track } from '@/analytics/analytics';
import { PATHS } from '@/app/paths';
import { redirectForAnalysisStep } from './guards';
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
 *  multi-select with an explicit Continue. Hair-Growth-style or gray branch set
 *  by Hair Goal. */
export function QuestionsScreen() {
  const t = useT();
  const cl = useContentLocale();
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const session = useSession();
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const finishedRef = useRef(false);

  const redirect = redirectForAnalysisStep('questions', session);

  const hairGoal = session.diagnosis.hairGoal ?? 'other';
  const questions = useMemo(() => questionsForHairGoal(hairGoal), [hairGoal]);

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

  const answered = questions.every((qq) =>
    qq.id === 'health_history'
      ? session.diagnosis.healthHistory.length > 0
      : isGrayId(qq.id)
        ? (session.diagnosis.grayAnswers as Record<string, string>)[qq.id] !== undefined
        : (session.diagnosis.answers as Record<string, string>)[qq.id] !== undefined,
  );

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
    if (i < questions.length - 1) setI(i + 1);
    else void finish();
  }

  function toggleHealth(value: string) {
    session.toggleHealthHistory(value as HealthCondition);
    track('question_answered', { id: q.id });
  }

  const isLast = i === questions.length - 1;
  const canAdvanceHealth = isHealthHistory && session.diagnosis.healthHistory.length > 0;

  return (
    <section data-animate className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        {i > 0 && (
          <button
            type="button"
            onClick={() => setI(i - 1)}
            className="font-body text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <span aria-hidden className="inline-block rtl:rotate-180">&larr;</span> {t('common.back')}
          </button>
        )}
        <span className="font-body text-sm text-muted-foreground">
          {t('q.counter', { index: i + 1, total: questions.length })}
        </span>
      </div>

      <DisplayTitle as="h2" step="sm">
        {pickLocalized(q.prompt, cl)}
      </DisplayTitle>

      {isHealthHistory ? (
        <div className="grid gap-3">
          {q.options.map((o) => (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 font-body text-sm"
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
        <div className="grid gap-3">
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

      {isHealthHistory && (
        <Button block disabled={!canAdvanceHealth || busy} onClick={() => (isLast ? void finish() : setI(i + 1))}>
          {busy ? t('analysis.finalizing') : t('common.continue')}
        </Button>
      )}

      {!isHealthHistory && answered && isLast && (
        <Button block disabled={busy} onClick={() => void finish()}>
          {busy ? t('analysis.finalizing') : t('common.continue')}
        </Button>
      )}
    </section>
  );
}

import { useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useT, useLocale } from '@/i18n/LocaleProvider';
import { useReducedMotion } from '@/app/lib/useReducedMotion';
import { useSession } from '@/store/sessionStore';
import { redirectForStep } from './guards';
import { QUESTIONS } from '@/app/components/diagnosis/questions';
import { QuestionCard } from '@/app/components/diagnosis/QuestionCard';
import { AnalyzingStrip } from '@/app/components/diagnosis/AnalyzingStrip';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import { analyzeHair } from '@/domain/analysis/analyzeHair';
import { isHairhealthConfigured } from '@/domain/analysis/hairhealthAdapter';
import { getBlob } from '@/store/persistence';
import type { Answers } from '@/domain/analysis/types';
import type { PhotoRef } from '@/store/sessionStore';

async function loadPhotoBlobs(photos: PhotoRef[]): Promise<{ angleKey: string; blob: Blob }[]> {
  const out: { angleKey: string; blob: Blob }[] = [];
  for (const p of photos) {
    try {
      const blob = await getBlob(p.blobId);
      if (blob) out.push({ angleKey: p.angleKey, blob });
    } catch {
      /* skip unreadable blob */
    }
  }
  return out;
}

export function AnalyzingStep() {
  const t = useT();
  const { locale } = useLocale();
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const session = useSession();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const finishedRef = useRef(false);

  // Forward progression enters from the trailing edge (right in LTR, left in RTL);
  // going back reverses it.
  const baseEnterX = locale === 'he' ? -28 : 28;
  const enterX = reduceMotion ? 0 : baseEnterX * direction;
  const enterTransition = { duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] as const };

  // keep latest diagnosis data reachable from the strip's onComplete callback
  const latest = useRef(session.diagnosis);
  latest.current = session.diagnosis;

  const answers = session.diagnosis.answers;
  const allAnswered = useMemo(
    () => QUESTIONS.every((q) => answers[q.id] !== undefined),
    [answers],
  );

  const redirect = redirectForStep('analyzing', session);
  if (redirect) return <Navigate to={redirect} replace />;

  const current = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];

  const onSelect = (id: keyof Answers, value: string) => {
    session.setAnswer(id, value as Answers[typeof id]);
    setDirection(1);
    setStep((s) => Math.min(s + 1, QUESTIONS.length));
  };

  const onBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  };

  const finish = () => {
    if (finishedRef.current) return;
    const d = latest.current;
    if (!d.gender) return;
    finishedRef.current = true;
    const gender = d.gender;
    const answers = d.answers as Answers;
    session.setReportId(crypto.randomUUID());

    // Local/demo path stays synchronous. Only reach for hairhealth.ai when it is
    // actually configured, then navigate once the result (or fallback) is in.
    if (!isHairhealthConfigured()) {
      session.setAnalysis(deriveAnalysis({ gender, answers }));
      navigate('/diagnosis/ready');
      return;
    }
    void (async () => {
      let analysis;
      try {
        const photos = await loadPhotoBlobs(d.photos);
        analysis = (await analyzeHair({ gender, answers, photos })).analysis;
      } catch {
        analysis = deriveAnalysis({ gender, answers });
      }
      session.setAnalysis(analysis);
      navigate('/diagnosis/ready');
    })();
  };

  return (
    <section data-animate className="mx-auto flex max-w-md flex-col gap-8">
      {/* Hold the analysis until the user is actually on the finalizing screen, so
          stepping back to review an answer doesn't complete + navigate away. */}
      <AnalyzingStrip
        running
        gateReady={allAnswered && step >= QUESTIONS.length}
        onComplete={finish}
      />
      {step < QUESTIONS.length ? (
        <motion.div
          key={step}
          initial={reduceMotion ? false : { opacity: 0, x: enterX }}
          animate={{ opacity: 1, x: 0 }}
          transition={enterTransition}
        >
          <QuestionCard
            question={current}
            index={step}
            total={QUESTIONS.length}
            value={answers[current.id] as string | undefined}
            onSelect={onSelect}
            onBack={step > 0 ? onBack : undefined}
          />
        </motion.div>
      ) : (
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={enterTransition}
          className="text-center text-sm text-muted-foreground"
        >
          {t('analysis.finalizing')}
        </motion.p>
      )}
    </section>
  );
}

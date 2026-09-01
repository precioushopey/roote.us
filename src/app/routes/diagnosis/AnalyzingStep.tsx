import { useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useSession } from '@/store/sessionStore';
import { redirectForStep } from './guards';
import { QUESTIONS } from '@/app/components/diagnosis/questions';
import { QuestionCard } from '@/app/components/diagnosis/QuestionCard';
import { AnalyzingStrip } from '@/app/components/diagnosis/AnalyzingStrip';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import type { Answers } from '@/domain/analysis/types';

export function AnalyzingStep() {
  const navigate = useNavigate();
  const session = useSession();
  const [step, setStep] = useState(0);
  const finishedRef = useRef(false);

  // keep latest diagnosis data reachable from the strip's onComplete callback
  const latest = useRef(session.diagnosis);
  latest.current = session.diagnosis;

  const redirect = redirectForStep('analyzing', session);
  if (redirect) return <Navigate to={redirect} replace />;

  const answers = session.diagnosis.answers;
  const allAnswered = useMemo(
    () => QUESTIONS.every((q) => answers[q.id] !== undefined),
    [answers],
  );

  const current = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];

  const onSelect = (id: keyof Answers, value: string) => {
    session.setAnswer(id, value as Answers[typeof id]);
    setStep((s) => Math.min(s + 1, QUESTIONS.length));
  };

  const finish = () => {
    if (finishedRef.current) return;
    const d = latest.current;
    if (!d.gender) return;
    finishedRef.current = true;
    const analysis = deriveAnalysis({ gender: d.gender, answers: d.answers as Answers });
    session.setAnalysis(analysis);
    session.setReportId(crypto.randomUUID());
    navigate('/diagnosis/ready');
  };

  return (
    <section className="mx-auto max-w-md flex flex-col gap-6">
      <AnalyzingStrip running gateReady={allAnswered} onComplete={finish} />
      {step < QUESTIONS.length ? (
        <QuestionCard
          question={current}
          index={step}
          total={QUESTIONS.length}
          value={answers[current.id] as string | undefined}
          onSelect={onSelect}
        />
      ) : (
        <p className="text-center text-sm text-muted-foreground">{/* finalizing */}</p>
      )}
    </section>
  );
}

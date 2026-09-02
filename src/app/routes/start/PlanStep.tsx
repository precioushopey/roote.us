// src/app/routes/start/PlanStep.tsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useT, useLocale } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { buildReport } from '@/domain/report/buildReport';
import { rooteContent } from '@/content/roote.config';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { isPending } from '@/content/pending';
import type { ProgramDurationDays } from '@/domain/program/types';

export function PlanStep() {
  const t = useT();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const session = useSession();

  const model = useMemo(() => {
    if (!session.analysis || !session.reportId) return null;
    return buildReport({
      diagnosis: session.diagnosis,
      analysis: session.analysis,
      content: rooteContent,
      locale,
      reportId: session.reportId,
    });
  }, [session.diagnosis, session.analysis, session.reportId, locale]);

  const [selected, setSelected] = useState<ProgramDurationDays | null>(
    session.draftDurationDays ?? (model ? (model.recommendedDuration.days as ProgramDurationDays) : null),
  );

  if (!model) return null; // StartLayout already guarantees a resolvable report before rendering this

  function choose(days: ProgramDurationDays) {
    setSelected(days);
    session.setDraftDurationDays(days);
  }

  function handleContinue() {
    const days = selected ?? (model!.recommendedDuration.days as ProgramDurationDays);
    session.setDraftDurationDays(days);
    navigate('/start/checkout');
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="rounded-lg border border-accent bg-accent/5 p-4">
        <span className="w-fit rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-accent-foreground">
          {model.plan.matchedToScanBadge}
        </span>
        <ul className="mt-2 flex flex-col gap-1 text-sm">
          {model.plan.core.map((tr, i) => (
            <li key={i}>{isPending(tr.name) ? <PendingChip label={tr.name.label} /> : tr.name}</li>
          ))}
        </ul>
      </div>

      <fieldset className="flex flex-col gap-2" role="radiogroup" aria-label={t('start.plan.durationLegend')}>
        <legend className="text-sm font-medium">{t('start.plan.durationLegend')}</legend>
        {model.pricing.compareAll.map((row) => (
          <label
            key={row.days}
            className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm has-[:checked]:border-accent"
          >
            <span className="flex items-center gap-2">
              <input
                type="radio"
                role="radio"
                name="duration"
                checked={selected === row.days}
                onChange={() => choose(row.days as ProgramDurationDays)}
              />
              {row.label}
              {row.isRecommended && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] text-accent-foreground">
                  {t('start.plan.recommendedBadge')}
                </span>
              )}
            </span>
            {isPending(row.price) ? <PendingChip label={row.price.label} /> : <span>{row.price.formatted}</span>}
          </label>
        ))}
      </fieldset>

      <button type="button" onClick={handleContinue} className="rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground">
        {t('start.plan.continue')}
      </button>
    </div>
  );
}

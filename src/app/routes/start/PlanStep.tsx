import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { buildReport } from '@/domain/report/buildReport';
import { recommend } from '@/domain/recommendation/recommend';
import { rooteContent } from '@/content/roote.config';
import { isPending } from '@/content/pending';
import { pickLocalized } from '@/content/localized';
import { PROGRAM_DURATIONS, DURATION_TIER_LABEL } from '@/content/programs';
import { DisplayTitle, Prose, Button, ProgramCard, Badge, PendingChip } from '@/app/components/roote';
import { track } from '@/analytics/analytics';
import type { ProgramDurationDays } from '@/domain/program/types';

const TIER_BY_DAYS = Object.fromEntries(PROGRAM_DURATIONS.map((d) => [d.days, d.tier]));

export function PlanStep() {
  const t = useT();
  const { contentLocale } = useLocale();
  const withLocale = useLocalizedPath();
  const navigate = useNavigate();
  const session = useSession();

  const model = useMemo(() => {
    if (!session.analysis || !session.reportId) return null;
    return buildReport({
      diagnosis: session.diagnosis,
      analysis: session.analysis,
      content: rooteContent,
      locale: contentLocale,
      reportId: session.reportId,
    });
  }, [session.diagnosis, session.analysis, session.reportId, contentLocale]);

  const rec = useMemo(() => {
    if (!session.analysis || !session.diagnosis.gender) return null;
    return recommend({
      concern: session.diagnosis.concern ?? 'thinning',
      gender: session.diagnosis.gender,
      severityBand: session.analysis.severityBand,
      planEmphasis: session.analysis.planEmphasis,
      recommendedDurationDays: session.analysis.recommendedDurationDays,
    });
  }, [session.analysis, session.diagnosis.concern, session.diagnosis.gender]);

  const [selected, setSelected] = useState<ProgramDurationDays | null>(
    session.draftDurationDays ?? (model ? (model.recommendedDuration.days as ProgramDurationDays) : null),
  );

  if (!model) return null;

  const includes = [
    ...model.plan.core.map((c) => (isPending(c.name) ? t('app.task.pendingName') : c.name)),
    ...model.plan.supporting.map((s) => (isPending(s.name) ? t('app.task.pendingName') : s.name)),
  ];

  function choose(days: ProgramDurationDays) {
    setSelected(days);
    session.setDraftDurationDays(days);
    track('program_duration_selected', { days });
  }

  function handleContinue() {
    const days = selected ?? (model!.recommendedDuration.days as ProgramDurationDays);
    session.setDraftDurationDays(days);
    navigate(withLocale('/program/checkout'));
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <DisplayTitle as="h1" step="sm">
          {t('start.plan.durationLegend')}
        </DisplayTitle>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone="gold">{model.plan.matchedToScanBadge}</Badge>
          {rec?.requiresMedicalReview && <Badge tone="review">{t('program.plan.reviewRequired')}</Badge>}
        </div>
        <Prose className="mt-3">{model.recommendedDuration.rationaleNote}</Prose>
      </div>

      <div
        role="radiogroup"
        aria-label={t('start.plan.durationLegend')}
        className="grid gap-4 md:grid-cols-3"
      >
        {model.pricing.compareAll.map((row) => {
          const tier = TIER_BY_DAYS[row.days] ?? 'personalized';
          return (
            <ProgramCard
              key={row.days}
              durationLabel={row.label}
              tierLabel={
                row.isRecommended
                  ? t('start.plan.recommendedBadge')
                  : pickLocalized(DURATION_TIER_LABEL[tier], contentLocale)
              }
              emphasised={row.isRecommended}
              selected={selected === row.days}
              priceLabel={isPending(row.price) ? null : row.price.formatted}
              perDayLabel={isPending(model.pricing.perDay) ? null : model.pricing.perDay.formatted}
              includes={includes}
              onSelect={() => choose(row.days as ProgramDurationDays)}
              selectLabel={selected === row.days ? t('common.continue') : t('start.plan.continue')}
            />
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-cream-100 p-4 text-sm text-muted-foreground">
        {t('program.plan.priceNote')} <PendingChip label="program pricing" />
      </div>

      <Button block onClick={handleContinue} disabled={!selected}>
        {t('start.plan.continue')}
      </Button>
    </div>
  );
}

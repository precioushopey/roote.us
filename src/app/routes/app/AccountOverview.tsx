import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { DisplayTitle, Prose, Button, Card, Badge, ProgramProgressBar, Stat } from '@/app/components/roote';
import { PATHS } from '@/app/paths';
import { checkpointState } from '@/domain/tracking/checkpoints';
import type { ProgramStatus, CheckpointType } from '@/domain/tracking/types';
import type { MessageKey } from '@/i18n/messages';
import { useUserProgram } from './useUserProgram';

// PO #16: no red / error styling for routine adherence — success / info / neutral only
const STATUS_TONE: Record<ProgramStatus, 'success' | 'info' | 'neutral'> = {
  'on-track': 'success',
  'keep-going': 'info',
  'catch-up': 'neutral',
  complete: 'neutral',
};
const STATUS_KEY: Record<ProgramStatus, MessageKey> = {
  'on-track': 'app.status.onTrack',
  'keep-going': 'app.status.keepGoing',
  'catch-up': 'app.status.catchUp',
  complete: 'app.status.complete',
};
const CHECKPOINT_KEY: Record<CheckpointType, MessageKey> = {
  baseline: 'app.checkpoint.baseline',
  photo: 'app.checkpoint.photo',
  scan: 'app.checkpoint.scan',
  'final-scan': 'app.checkpoint.finalScan',
};

export function AccountOverview() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const view = useUserProgram();
  if (!view) return null;
  const { userProgram: up } = view;
  const dayLabel = (n: number) => t('marketing.sys.day', { n });

  const next = up.nextCheckpoint;

  return (
    <div data-animate className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <p className="u-caps font-body text-sm font-semibold text-accent">{t('app.overview.eyebrow')}</p>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <DisplayTitle as="h1" step="sm">
            {t('app.overview.dayOf', { day: up.currentDay, total: up.durationDays })}
          </DisplayTitle>
          <Badge tone={STATUS_TONE[up.status]}>{t(STATUS_KEY[up.status])}</Badge>
        </div>
        <Prose size="sm">
          {t('app.overview.completedRemaining', { done: up.daysCompleted, left: up.daysRemaining })}
        </Prose>
        <ProgramProgressBar
          currentDay={up.currentDay}
          durationDays={up.durationDays}
          dayLabel={dayLabel}
          checkpoints={up.checkpoints
            .filter((c) => c.type !== 'baseline')
            .map((c) => ({ day: c.day, done: !!c.completedDate }))}
        />
      </header>

      {up.status === 'complete' && (
        <Card tone="cream">
          <p className="font-display text-md text-foreground">{t('app.overview.programComplete')}</p>
          <Prose size="sm" className="mt-1">
            {t('app.overview.programCompleteBody')}
          </Prose>
          <Button to={withLocale(PATHS.accountSection('results'))} size="sm" className="mt-3">
            {t('app.overview.viewResults')}
          </Button>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Button to={withLocale(PATHS.accountSection('today'))} caps>
          {t('app.overview.continueToday')}
        </Button>
        <Button to={withLocale(PATHS.accountSection('progress'))} variant="secondary">
          {t('app.overview.viewProgress')}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <Stat
            label={t('app.overview.nextCheckpoint')}
            value={
              next
                ? `${t(CHECKPOINT_KEY[next.type])} · ${dayLabel(next.day)}`
                : t('app.overview.allCheckpointsDone')
            }
          />
          {next && (
            <p className="mt-1 font-body text-sm text-muted-foreground">
              {t(`app.checkpoint.state.${checkpointState(next, up.currentDay)}` as 'app.checkpoint.state.due')}
            </p>
          )}
        </Card>
        <Card>
          <Stat
            label={t('app.today.adherence.label')}
            value={`${up.adherencePct}%`}
            hint={t('app.today.adherence.note')}
          />
        </Card>
        <Card>
          <Stat
            label={t('app.today.nextOrder.label')}
            value={up.reorderDate}
            hint={up.reorderDue ? t('app.overview.reorderDue') : t('app.today.nextOrder.note')}
          />
        </Card>
      </div>

      {up.reorderDue && (
        <Card tone="cream">
          <p className="font-display text-md text-foreground">{t('app.today.reorder.title')}</p>
          <Prose size="sm" className="mt-1">
            {t('app.today.reorder.body')}
          </Prose>
          <Button to={withLocale(PATHS.programCheckout)} size="sm" className="mt-3">
            {t('app.today.reorder.cta')}
          </Button>
        </Card>
      )}
    </div>
  );
}

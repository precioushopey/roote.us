import { useState } from 'react';
import { Link } from 'react-router';
import { Check, ArrowRight, Sunrise, Moon, Droplet } from 'lucide-react';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { DisplayTitle, Card, Badge, Button, ProgramProgressBar, SegmentedControl } from '@/app/components/roote';
import { PATHS } from '@/app/paths';
import { track } from '@/analytics/analytics';
import { checkpointState } from '@/domain/tracking/checkpoints';
import { pickLocalized } from '@/content/localized';
import { HAIR_GOAL_OPTIONS } from '@/content/assessment';
import type { ProgramStatus, CheckpointType, TimeOfDay, TreatmentTask, TaskStatus } from '@/domain/tracking/types';
import type { MessageKey } from '@/i18n/messages';
import { useSession } from '@/store/sessionStore';
import { useTracking } from '@/store/tracking';
import { useUserProgram } from './useUserProgram';
import { useUpcomingReminders } from './useUpcomingReminders';
import { AccountPageHeader } from './AccountPageHeader';

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
// Where "learn more" on the next-checkpoint card should land — baseline/scan/
// final-scan all live under Progress's "scans" tab, photo checkpoints under
// its "photos" tab (AccountProgress.tsx).
const CHECKPOINT_TAB: Record<CheckpointType, 'photos' | 'scans'> = {
  baseline: 'scans',
  photo: 'photos',
  scan: 'scans',
  'final-scan': 'scans',
};
const CHECKPOINT_KEY: Record<CheckpointType, MessageKey> = {
  baseline: 'app.checkpoint.baseline',
  photo: 'app.checkpoint.photo',
  scan: 'app.checkpoint.scan',
  'final-scan': 'app.checkpoint.finalScan',
};

const SLOT_KEY: Record<TimeOfDay, MessageKey> = {
  morning: 'app.today.slot.morning',
  evening: 'app.today.slot.evening',
  shampoo: 'app.today.slot.shampoo',
};

const SLOT_ICON: Record<TimeOfDay, typeof Sunrise> = {
  morning: Sunrise,
  evening: Moon,
  shampoo: Droplet,
};

const SLOTS: TimeOfDay[] = ['morning', 'evening', 'shampoo'];

/** Circular readout for `adherencePct` (real, already-computed data) — the
 *  page's one "at a glance" visual, standing in for a fabricated AI score. */
function AdherenceRing({ pct, label, hint }: { pct: number; label: string; hint?: string }) {
  const size = 96;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = c - (clamped / 100) * c;
  return (
    <div className="flex flex-col items-center gap-2 text-center sm:items-end sm:text-end">
      <div role="img" aria-label={`${label}: ${clamped}%`} className="relative" style={{ width: size, height: size }}>
        <svg aria-hidden width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-cream-200" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="fill-none stroke-accent"
          />
        </svg>
        <div aria-hidden className="absolute inset-0 flex items-center justify-center font-display text-xl text-foreground">
          {clamped}%
        </div>
      </div>
      <div>
        <p className="u-caps font-body text-sm font-semibold text-muted-foreground">{label}</p>
        {hint ? <p className="mt-0.5 font-body text-sm text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}

function TaskRow({
  task,
  onSet,
}: {
  task: TreatmentTask;
  onSet: (status: TaskStatus) => void;
}) {
  const t = useT();
  const doneStyle = task.status === 'done';
  const skippedStyle = task.status === 'skipped';
  return (
    <li className="flex items-start gap-4 rounded-lg border border-border bg-card p-4">
      <button
        type="button"
        aria-pressed={doneStyle}
        aria-label={doneStyle ? t('app.today.markPending') : t('app.today.markDone')}
        onClick={() => onSet(doneStyle ? 'pending' : 'done')}
        className={
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-xs border ' +
          (doneStyle ? 'border-deep-800 bg-deep-800 text-cream-50' : 'border-border')
        }
      >
        {doneStyle && <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={
            'font-body text-sm text-foreground ' +
            (doneStyle ? 'line-through opacity-70 ' : '') +
            (skippedStyle ? 'opacity-60' : '')
          }
        >
          {task.name}
        </p>
        <p className="mt-0.5 font-body text-sm text-muted-foreground">
          {t(task.doseLabel as MessageKey)} · {task.frequencyLabel}
        </p>
        {!doneStyle && (
          <button
            type="button"
            onClick={() => onSet(skippedStyle ? 'pending' : 'skipped')}
            className="mt-1 font-body text-sm text-muted-foreground underline"
          >
            {skippedStyle ? t('app.today.unskip') : t('app.today.skip')}
          </button>
        )}
      </div>
    </li>
  );
}

export function AccountToday() {
  const t = useT();
  const { locale: cl } = useLocale();
  const withLocale = useLocalizedPath();
  const session = useSession();
  const tracking = useTracking();
  const view = useUserProgram();
  // PO #22: surface the next couple of upcoming reminders here (full list lives under Profile)
  const nextReminders = useUpcomingReminders().slice(0, 2);

  const availableSlots = view ? SLOTS.filter((s) => view.routine[s].length > 0) : [];
  const [activeSlot, setActiveSlot] = useState<TimeOfDay | null>(null);
  const slot = activeSlot && availableSlots.includes(activeSlot) ? activeSlot : (availableSlots[0] ?? null);

  if (!view) return null;
  const { userProgram: up, routine, today, treatments } = view;
  const dayLabel = (n: number) => t('marketing.sys.day', { n });
  const next = up.nextCheckpoint;
  const primaryTreatment = treatments.core[0];

  const setStatus = (task: TreatmentTask, status: TaskStatus) => {
    tracking.setTaskStatus(today, task.key, status);
    if (status === 'done') track('treatment_marked_complete', { key: task.key });
    // keep the legacy session log roughly in sync for any old readers
    if (status === 'done') session.toggleProgramTask(today, task.key);
  };

  const total = SLOTS.reduce((n, s) => n + routine[s].length, 0);
  const done = SLOTS.reduce((n, s) => n + routine[s].filter((x) => x.status === 'done').length, 0);
  const nextTask = SLOTS.flatMap((s) => routine[s].map((task) => ({ task, slot: s }))).find(
    (x) => x.task.status === 'pending',
  );

  const goal = HAIR_GOAL_OPTIONS.find((g) => g.value === session.diagnosis.hairGoal);

  return (
    <div data-animate className="flex flex-col gap-4 md:gap-8">
      <AccountPageHeader eyebrow={t('app.nav.today')} title={t('app.today.greeting')} />

      <Card tone="cream" className="flex flex-col gap-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col-reverse items-start gap-4">
              {primaryTreatment && (
                <DisplayTitle as="h2" step="sm" className="min-w-0 flex-1">
                  {primaryTreatment.name}
                </DisplayTitle>
              )}
              <Badge tone="neutral" className="w-fit shrink-0">
                {t('report.duration.label', { days: up.durationDays })}
              </Badge>
            </div>
            {primaryTreatment && <p className="font-body text-sm text-muted-foreground">{primaryTreatment.usage}</p>}
          </div>
          <AdherenceRing pct={up.adherencePct} label={t('app.today.adherence.label')} hint={t('app.today.adherence.note')} />
        </div>

        <div className="flex flex-col gap-2 border-t border-border/60 pt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <p className="font-body text-sm font-medium text-foreground">
              {t('app.overview.dayOf', { day: up.currentDay, total: up.durationDays })}
            </p>
            <Badge tone={STATUS_TONE[up.status]} className="text-xs sm:text-sm">{t(STATUS_KEY[up.status])}</Badge>
          </div>
          <p className="font-body text-sm text-muted-foreground">
            {t('app.overview.completedRemaining', { done: up.daysCompleted, left: up.daysRemaining })}
          </p>
          <ProgramProgressBar
            currentDay={up.currentDay}
            durationDays={up.durationDays}
            dayLabel={dayLabel}
            checkpoints={up.checkpoints
              .filter((c) => c.type !== 'baseline')
              .map((c) => ({ day: c.day, done: !!c.completedDate }))}
          />
        </div>
      </Card>

      {up.status === 'complete' && (
        <Card tone="cream">
          <p className="font-display text-md text-foreground">{t('app.overview.programComplete')}</p>
          <p className="mt-1 font-body text-sm text-muted-foreground">{t('app.overview.programCompleteBody')}</p>
          <Button to={withLocale(PATHS.accountSection('results'))} className="mt-3">
            {t('app.overview.viewResults')}
          </Button>
        </Card>
      )}

      {up.reorderDue && (
        <Card tone="cream">
          <p className="font-display text-md text-foreground">{t('app.today.reorder.title')}</p>
          <p className="mt-1 font-body text-sm text-muted-foreground">{t('app.today.reorder.body')}</p>
          <Button to={withLocale(PATHS.programCheckout)} className="mt-3">
            {t('app.today.reorder.cta')}
          </Button>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to={withLocale(`${PATHS.accountSection('progress')}?tab=${next ? CHECKPOINT_TAB[next.type] : 'scans'}`)}
          className="rounded-sm bg-card p-6 text-card-foreground outline-none transition-colors hover:bg-cream-100 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-start justify-between gap-4">
            <p className="u-caps font-body text-sm font-semibold text-muted-foreground">
              {t('app.overview.nextCheckpoint')}
            </p>
            <ArrowRight aria-hidden strokeWidth={1.6} className="h-4 w-4 shrink-0 text-muted-foreground rtl:-scale-x-100" />
          </div>
          <p className="mt-1.5 font-display text-xl text-foreground">
            {next ? `${t(CHECKPOINT_KEY[next.type])} · ${dayLabel(next.day)}` : t('app.overview.allCheckpointsDone')}
          </p>
          {next && (
            <p className="mt-1 font-body text-sm text-muted-foreground">
              {t(`app.checkpoint.state.${checkpointState(next, up.currentDay)}` as 'app.checkpoint.state.due')}
            </p>
          )}
        </Link>
        <Link
          to={withLocale(PATHS.accountSection('profile'))}
          className="rounded-sm bg-card p-6 text-card-foreground outline-none transition-colors hover:bg-cream-100 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-start justify-between gap-4">
            <p className="u-caps font-body text-sm font-semibold text-muted-foreground">
              {t('app.today.nextOrder.label')}
            </p>
            <ArrowRight aria-hidden strokeWidth={1.6} className="h-4 w-4 shrink-0 text-muted-foreground rtl:-scale-x-100" />
          </div>
          <p className="mt-1.5 font-display text-xl text-foreground">{up.reorderDate}</p>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            {up.reorderDue ? t('app.overview.reorderDue') : t('app.today.nextOrder.note')}
          </p>
        </Link>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <Card className="flex min-w-0 flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-md text-foreground">{t('app.today.title')}</h2>
            <span className="font-body text-sm text-muted-foreground">
              {done}/{total}
            </span>
          </div>

          {availableSlots.length > 0 ? (
            <>
              <SegmentedControl<TimeOfDay>
                label={t('app.today.title')}
                value={slot ?? availableSlots[0]}
                onChange={setActiveSlot}
                className="w-fit"
                options={availableSlots.map((s) => {
                  const Icon = SLOT_ICON[s];
                  return {
                    value: s,
                    label: (
                      <span className="flex items-center gap-1.5">
                        <Icon aria-hidden className="h-4 w-4" strokeWidth={1.75} />
                        {t(SLOT_KEY[s])}
                      </span>
                    ),
                  };
                })}
              />

              {slot && (
                <ul className="flex flex-col gap-2">
                  {routine[slot].map((task) => (
                    <TaskRow key={task.key} task={task} onSet={(s) => setStatus(task, s)} />
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div className="flex flex-col items-start gap-2">
              <p className="font-body text-sm text-muted-foreground">{t('app.today.empty.body')}</p>
              <Link to={withLocale(PATHS.accountSection('program'))} className="font-body text-sm text-accent underline">
                {t('app.today.empty.cta')}
              </Link>
            </div>
          )}

          {goal && (
            <p className="font-body text-sm text-muted-foreground">
              {t('app.today.goalLabel')}: <span className="text-foreground">{pickLocalized(goal.title, cl)}</span>
            </p>
          )}
        </Card>

        <div className="flex flex-col gap-4 md:gap-8 lg:sticky lg:top-10 lg:self-start">
          {nextTask && (
            <button
              type="button"
              onClick={() => setActiveSlot(nextTask.slot)}
              className="flex items-center justify-between gap-4 rounded-sm bg-cream-100 p-5 text-start transition-colors hover:bg-cream-200"
            >
              <div>
                <p className="u-caps font-body text-sm font-semibold text-muted-foreground">
                  {t('app.today.nextTask.label')}
                </p>
                <p className="mt-1 font-display text-md text-foreground">{nextTask.task.name}</p>
              </div>
            </button>
          )}

          {nextReminders.length > 0 && (
            <Card>
              <p className="u-caps font-body text-sm font-semibold text-muted-foreground">
                {t('app.reminders.upcoming')}
              </p>
              <ul className="mt-2 flex flex-col gap-2">
                {nextReminders.map((r) => (
                  <li key={r.id} className="flex items-baseline justify-between gap-4 font-body text-sm">
                    <span className="text-foreground">{t(r.labelKey as MessageKey)}</span>
                    <span className="text-sm text-muted-foreground">{r.dueDate}</span>
                  </li>
                ))}
              </ul>
              <Link to={withLocale('/account/reminders')} className="mt-2 inline-block font-body text-sm text-accent underline">
                {t('app.reminders.manage')}
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

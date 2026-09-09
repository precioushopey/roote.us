import { Link } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { DisplayTitle, Card } from '@/app/components/roote';
import { track } from '@/analytics/analytics';
import { generateReminders } from '@/domain/tracking/reminders';
import { rooteContent } from '@/content/roote.config';
import type { TimeOfDay, TreatmentTask, TaskStatus } from '@/domain/tracking/types';
import type { MessageKey } from '@/i18n/messages';
import { useSession } from '@/store/sessionStore';
import { useTracking } from '@/store/tracking';
import { useUserProgram } from './useUserProgram';

const shiftIso = (iso: string, delta: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
};

const SLOT_KEY: Record<TimeOfDay, MessageKey> = {
  morning: 'app.today.slot.morning',
  evening: 'app.today.slot.evening',
  shampoo: 'app.today.slot.shampoo',
};

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
    <li className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
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
        {doneStyle && (
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden>
            <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
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
  const withLocale = useLocalizedPath();
  const session = useSession();
  const tracking = useTracking();
  const view = useUserProgram();
  if (!view) return null;
  const { userProgram: up, routine, today } = view;

  const setStatus = (task: TreatmentTask, status: TaskStatus) => {
    tracking.setTaskStatus(today, task.key, status);
    if (status === 'done') track('treatment_marked_complete', { key: task.key });
    // keep the legacy session log roughly in sync for any old readers
    if (status === 'done') session.toggleProgramTask(today, task.key);
  };

  const slots: TimeOfDay[] = ['morning', 'evening', 'shampoo'];
  const total = slots.reduce((n, s) => n + routine[s].length, 0);
  const done = slots.reduce((n, s) => n + routine[s].filter((x) => x.status === 'done').length, 0);

  // PO #22: surface the next couple of upcoming reminders here (full list lives under Profile)
  const nextReminders = generateReminders({
    checkpoints: up.checkpoints,
    endDate: up.endDate,
    reorderDates: rooteContent.reorderReminderLeadDays.map((d) => shiftIso(up.endDate, -d)),
    skipped: tracking.skippedCheckpoints,
    settings: tracking.reminderSettings,
  })
    .filter((r) => r.enabled && r.dueDate >= today)
    .slice(0, 2);

  return (
    <div data-animate className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="u-caps font-body text-sm font-semibold text-accent">
          {t('app.today.dayLabel', { day: up.currentDay, total: up.durationDays })}
        </p>
        <div className="flex items-baseline justify-between">
          <DisplayTitle as="h1" step="sm">
            {t('app.today.title')}
          </DisplayTitle>
          <span className="font-body text-sm text-muted-foreground">
            {done}/{total}
          </span>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {slots.map((slot) =>
          routine[slot].length === 0 ? null : (
            <section key={slot} className="flex flex-col gap-2">
              <h2 className="u-caps font-body text-sm font-semibold text-muted-foreground">{t(SLOT_KEY[slot])}</h2>
              <ul className="flex flex-col gap-2">
                {routine[slot].map((task) => (
                  <TaskRow key={task.key} task={task} onSet={(s) => setStatus(task, s)} />
                ))}
              </ul>
            </section>
          ),
        )}
      </div>

      <Card tone="cream">
        <p className="font-body text-sm text-foreground">
          {t('app.today.adherence.label')}: {up.adherencePct}%
        </p>
        <p className="mt-1 font-body text-sm text-muted-foreground">{t('app.today.adherence.note')}</p>
      </Card>

      {nextReminders.length > 0 && (
        <Card>
          <p className="u-caps font-body text-sm font-semibold text-muted-foreground">
            {t('app.reminders.upcoming')}
          </p>
          <ul className="mt-2 flex flex-col gap-1">
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
  );
}

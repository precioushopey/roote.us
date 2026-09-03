import { Link } from 'react-router';
import { useT, useLocale } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import {
  adherencePct,
  dailyTasks,
  daysRemaining,
  isoToday,
  isReorderDue,
  programDay,
  reorderDate,
  resolvePlanTreatments,
  tasksDoneOn,
} from './programProgress';

function Kpi({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-medium">{value}</p>
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

export function AppToday() {
  const t = useT();
  const { locale } = useLocale();
  const session = useSession();
  const program = session.program!;
  const today = isoToday();

  const day = programDay(program, today);
  const remaining = daysRemaining(program, today);
  const pct = Math.round((day / program.durationDays) * 100);
  const tasks = dailyTasks(resolvePlanTreatments(t, locale));
  const done = tasksDoneOn(program, today);
  const adherence = adherencePct(program);
  const reorderDue = isReorderDue(program, today);

  return (
    <div data-animate className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
          {t('app.today.dayLabel', { day, total: program.durationDays })}
        </p>
        <h1 className="font-display text-3xl font-medium lg:text-4xl">{t('app.today.title')}</h1>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-sm text-muted-foreground">
          {t('app.today.remaining', { days: remaining, end: program.endDate })}
        </p>
      </header>

      {/* KPI strip */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Kpi label={t('app.today.checklist.title')} value={`${done.size}/${tasks.length}`} />
        <Kpi
          label={t('app.today.adherence.label')}
          value={`${adherence}%`}
          note={t('app.today.adherence.note')}
        />
        <Kpi
          label={t('app.today.nextOrder.label')}
          value={reorderDate(program)}
          note={t('app.today.nextOrder.note')}
        />
      </section>

      {/* Main dashboard grid */}
      <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
        <section className="flex flex-col gap-3 lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl font-medium">{t('app.today.checklist.title')}</h2>
            <span className="text-sm text-muted-foreground">
              {done.size}/{tasks.length}
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {tasks.map((task) => {
              const checked = done.has(task.key);
              return (
                <li key={task.key}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent/5">
                    <input
                      type="checkbox"
                      className="mt-1 size-4"
                      checked={checked}
                      onChange={() => session.toggleProgramTask(today, task.key)}
                    />
                    <span className="flex flex-col gap-1">
                      <span className={checked ? 'font-medium line-through' : 'font-medium'}>{task.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {task.usage} · {task.frequency}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="flex flex-col gap-4 lg:col-span-1">
          {reorderDue && (
            <div className="flex flex-col gap-3 rounded-xl border border-accent bg-accent/5 p-5">
              <p className="font-display text-lg font-medium">{t('app.today.reorder.title')}</p>
              <p className="text-sm text-muted-foreground">{t('app.today.reorder.body')}</p>
              <Link
                to="/start/plan"
                className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
              >
                {t('app.today.reorder.cta')}
              </Link>
            </div>
          )}

          {/* TODO: notification backend not built — no scheduling / push / email delivery exists yet.
              `Program.reminders` + `session.setProgramReminders` are wired but unused. When a
              provider is chosen, add a per-task time picker here and drop the "coming soon" note. */}
          <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="font-display text-lg font-medium">{t('app.today.reminders.title')}</p>
            <p className="text-sm text-muted-foreground">{t('app.today.reminders.body')}</p>
            <p className="inline-flex w-fit rounded-full bg-accent/12 px-2.5 py-1 text-xs font-medium text-accent">
              {t('app.today.reminders.comingSoon')}
            </p>
          </section>

          <div className="flex flex-col gap-2">
            <Link to="/app/progress" className="text-sm text-accent underline">
              {t('app.today.link.progress')}
            </Link>
            <Link to="/app/care" className="text-sm text-accent underline">
              {t('app.today.link.care')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useT } from '@/i18n/LocaleProvider';
import { useTracking } from '@/store/tracking';
import { DisplayTitle, Prose, Card } from '@/app/components/roote';
import {
  REMINDER_TYPES,
  REMINDER_LABEL_KEY,
  generateReminders,
  isReminderEnabled,
} from '@/domain/tracking/reminders';
import { rooteContent } from '@/content/roote.config';
import type { MessageKey } from '@/i18n/messages';
import { useUserProgram } from './useUserProgram';

const shiftIso = (iso: string, delta: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
};

/**
 * Reminders (spec §15). The data model + the surface only — no delivery. Every
 * reminder category can be turned on or off; the "Coming up" list is derived
 * from the program's checkpoints and reorder window.
 */
export function AccountReminders() {
  const t = useT();
  const tracking = useTracking();
  const view = useUserProgram();
  if (!view) return null;
  const { userProgram: up } = view;

  const upcoming = generateReminders({
    checkpoints: up.checkpoints,
    endDate: up.endDate,
    reorderDates: rooteContent.reorderReminderLeadDays.map((d) => shiftIso(up.endDate, -d)),
    skipped: tracking.skippedCheckpoints,
    settings: tracking.reminderSettings,
  }).filter((r) => r.enabled);

  return (
    <div data-animate className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <DisplayTitle as="h1" step="sm">
          {t('app.reminders.title')}
        </DisplayTitle>
        <Prose size="sm">{t('app.reminders.subtitle')}</Prose>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-md text-foreground">{t('app.reminders.upcoming')}</h2>
        {upcoming.length === 0 ? (
          <Prose size="sm">{t('app.reminders.none')}</Prose>
        ) : (
          <ul className="flex flex-col divide-y divide-border/60 rounded-lg border border-border bg-card">
            {upcoming.map((r) => (
              <li key={r.id} className="flex items-baseline justify-between gap-4 px-4 py-3">
                <span className="font-body text-sm text-foreground">{t(r.labelKey as MessageKey)}</span>
                <span className="font-body text-2xs text-muted-foreground">{r.dueDate}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-md text-foreground">{t('app.reminders.settingsTitle')}</h2>
        <ul className="flex flex-col gap-2">
          {REMINDER_TYPES.map((type) => {
            const on = isReminderEnabled(type, tracking.reminderSettings);
            return (
              <li key={type}>
                <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3">
                  <span className="font-body text-sm text-foreground">{t(REMINDER_LABEL_KEY[type] as MessageKey)}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-body text-2xs text-muted-foreground">
                      {on ? t('app.reminders.on') : t('app.reminders.off')}
                    </span>
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={(e) => tracking.setReminder(type, e.target.checked)}
                      className="h-4 w-4 accent-[var(--primary)]"
                    />
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        <Card tone="cream">
          <p className="font-body text-2xs text-muted-foreground">{t('app.reminders.deliveryNote')}</p>
        </Card>
      </section>
    </div>
  );
}

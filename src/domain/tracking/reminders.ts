import type { ProgressCheckpoint, Reminder, ReminderType, TrackingState } from './types';

/**
 * Reminder generation (spec §15). Pure — derives the reminder list from the
 * program + its checkpoints + the reorder window. Delivery (push / email / SMS)
 * is a separate, later concern; this is the data + UI model.
 */

export const REMINDER_TYPES: ReminderType[] = [
  'daily-treatment',
  'shampoo-day',
  'supplement',
  'progress-photo',
  'progress-scan',
  'final-scan',
  'reorder',
  'shipment',
  'program-completion',
];

export const REMINDER_LABEL_KEY: Record<ReminderType, string> = {
  'daily-treatment': 'app.reminders.type.dailyTreatment',
  'shampoo-day': 'app.reminders.type.shampooDay',
  supplement: 'app.reminders.type.supplement',
  'progress-photo': 'app.reminders.type.progressPhoto',
  'progress-scan': 'app.reminders.type.progressScan',
  'final-scan': 'app.reminders.type.finalScan',
  reorder: 'app.reminders.type.reorder',
  shipment: 'app.reminders.type.shipment',
  'program-completion': 'app.reminders.type.programCompletion',
};

/** Reminders on by default. */
const DEFAULT_ENABLED: Partial<Record<ReminderType, boolean>> = {
  'daily-treatment': true,
  'shampoo-day': true,
  supplement: true,
  'progress-photo': true,
  'progress-scan': true,
  'final-scan': true,
  reorder: true,
  shipment: false,
  'program-completion': true,
};

export function isReminderEnabled(type: ReminderType, settings: TrackingState['reminderSettings']): boolean {
  return settings[type] ?? DEFAULT_ENABLED[type] ?? false;
}

export function generateReminders(input: {
  checkpoints: ProgressCheckpoint[];
  endDate: string;
  /** reorder nudge dates — PO #20: end−14 and end−7 (the end−21 dashboard card is separate) */
  reorderDates: string[];
  /** checkpointIds the user skipped — no reminder for those (PO #17) */
  skipped?: readonly string[];
  settings: TrackingState['reminderSettings'];
}): Reminder[] {
  const { checkpoints, endDate, reorderDates, skipped = [], settings } = input;
  const out: Reminder[] = [];
  const add = (type: ReminderType, dueDate: string, idSuffix = '') =>
    out.push({
      id: `${type}${idSuffix}`,
      type,
      dueDate,
      labelKey: REMINDER_LABEL_KEY[type],
      enabled: isReminderEnabled(type, settings),
    });

  for (const cp of checkpoints) {
    if (cp.completedDate || skipped.includes(cp.id)) continue;
    if (cp.type === 'photo') add('progress-photo', cp.scheduledDate, `-${cp.id}`);
    if (cp.type === 'scan') add('progress-scan', cp.scheduledDate, `-${cp.id}`);
    if (cp.type === 'final-scan') add('final-scan', cp.scheduledDate);
  }
  reorderDates.forEach((d, i) => add('reorder', d, reorderDates.length > 1 ? `-${i}` : ''));
  add('program-completion', endDate);

  return out.sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
}

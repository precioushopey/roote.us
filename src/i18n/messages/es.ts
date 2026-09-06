import type { MessageKey } from './en';

/**
 * Spanish — MACHINE-DRAFT SCAFFOLD. Not translated.
 *
 * Registered in the locale registry so the i18n pipeline (language picker,
 * es routing) is exercised end to end. Every key falls back to
 * English at runtime (see LocaleProvider `t()`), so this map is intentionally
 * empty and is excluded from the messages.test.ts key-parity check.
 *
 * A professional translation pass fills this in; only keys that also exist in
 * `en` are permitted (messages.test.ts enforces the "no stray keys" rule).
 */
export const es: Partial<Record<MessageKey, string>> = {};

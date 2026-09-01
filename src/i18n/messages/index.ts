import { en } from './en';
import { he } from './he';

export type Locale = 'en' | 'he';
export type { MessageKey } from './en';
export const messages = { en, he } as const;
export const DEFAULT_LOCALE: Locale = 'he';
export const LOCALES: Locale[] = ['he', 'en'];

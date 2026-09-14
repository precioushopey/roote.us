import { LOCALES, type LocaleCode } from '@/i18n/locales';

export type Money = { amount: number; currency: string; formatted: string };

export function formatMoney(amount: number, currency: string, locale: LocaleCode): Money {
  const formatted = new Intl.NumberFormat(LOCALES[locale].bcp47, {
    style: 'currency',
    currency,
  }).format(amount);
  return { amount, currency, formatted };
}

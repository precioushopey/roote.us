export type Money = { amount: number; currency: string; formatted: string };

export function formatMoney(amount: number, currency: string, locale: 'en' | 'he'): Money {
  const intlLocale = locale === 'he' ? 'he-IL' : 'en-US';
  const formatted = new Intl.NumberFormat(intlLocale, { style: 'currency', currency }).format(amount);
  return { amount, currency, formatted };
}

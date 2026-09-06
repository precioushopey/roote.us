import { useState } from 'react';
import { Link } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import type { MessageKey } from '@/i18n/messages';
import { CARE_MESSAGES, isoToday, programDay } from './programProgress';

export function AppCare() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const program = useSession().program!;
  const day = programDay(program, isoToday());
  const [sent, setSent] = useState(false);

  const unlocked = CARE_MESSAGES.filter((m) => m.day <= day);

  return (
    <div data-animate className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-medium lg:text-4xl">{t('app.care.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('app.care.subtitle')}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
        <section className="flex flex-col gap-3">
          {unlocked.map((m) => (
            <article key={m.key} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-accent">
                {t('app.care.dayTag', { day: m.day })}
              </p>
              <p className="mt-1 text-sm">{t(m.key as MessageKey)}</p>
            </article>
          ))}
        </section>

        <div className="flex flex-col gap-4 lg:sticky lg:top-10 lg:self-start">
          <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-display text-lg font-medium">{t('app.care.compose.title')}</h2>
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <textarea
                required
                rows={4}
                className="rounded-md border border-input bg-input-background px-3 py-2 text-sm outline-none focus:border-accent"
                aria-label={t('app.care.compose.title')}
              />
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
              >
                {t('app.care.compose.send')}
              </button>
              {sent && <p role="status" className="text-sm text-muted-foreground">{t('app.care.compose.stub')}</p>}
            </form>
          </section>

          <Link
            to={withLocale('/account/rescan')}
            className="rounded-xl border border-border bg-card p-4 text-sm text-accent underline shadow-sm"
          >
            {t('app.care.rescanLink')}
          </Link>
        </div>
      </div>
    </div>
  );
}

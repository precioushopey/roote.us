import { useT, useLocale } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { resolvePlanTreatments } from './programProgress';
import type { MessageKey } from '@/i18n/messages';

export function AppPlan() {
  const t = useT();
  const { locale } = useLocale();
  const program = useSession().program!;
  const a = program.analysisSnapshot;
  const plan = resolvePlanTreatments(t, locale);

  return (
    <div data-animate className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
          {t('report.section.plan.matchedBadge')}
        </p>
        <h1 className="font-display text-3xl font-medium lg:text-4xl">{t('report.section.plan.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t(`scale.${a.scale}.label` as MessageKey)} · {t(`severity.${a.severityBand}` as MessageKey)}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-6">
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-medium">{t('report.plan.core.title')}</h2>
          {plan.core.map((tr) => (
            <div key={tr.key} className="rounded-xl border border-accent bg-accent/5 p-4 shadow-sm">
              <p className="font-medium">{tr.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{tr.usage}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('report.plan.applicationFrequencyLabel')}: {tr.frequency}
                {tr.appliesToLabels.length ? ` · ${t('report.plan.appliesToLabel')}: ${tr.appliesToLabels.join(', ')}` : ''}
              </p>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-medium">{t('report.plan.supporting.title')}</h2>
          {plan.supporting.map((tr) => (
            <div key={tr.key} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="font-medium">{tr.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{tr.usage}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('report.plan.applicationFrequencyLabel')}: {tr.frequency}
              </p>
            </div>
          ))}
        </section>
      </div>

      <section className="rounded-xl border border-border bg-card p-5 text-center shadow-sm">
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
          {t('report.section.duration.title')}
        </p>
        <p className="mt-1 font-display text-2xl font-medium">
          {t('report.duration.label', { days: program.durationDays })}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {program.startDate} → {program.endDate}
        </p>
      </section>
    </div>
  );
}

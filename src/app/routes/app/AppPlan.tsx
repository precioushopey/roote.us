import { useT, useLocale } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { TREATMENT_PHOTOS } from '@/content/treatmentPhotos';
import { resolvePlanTreatments, planKeysForProgram, type ResolvedTreatment } from './programProgress';
import { AccountPageHeader } from './AccountPageHeader';
import type { MessageKey } from '@/i18n/messages';

/* One plan card: product photo beside the name/usage/frequency copy. A
   treatment with no photo (the scalp-care routine) renders text-only. */
function TreatmentCard({ tr, core }: { tr: ResolvedTreatment; core: boolean }) {
  const t = useT();
  const photo = TREATMENT_PHOTOS[tr.key];
  return (
    <div
      className={`flex items-center gap-4 rounded-xl border p-4 shadow-sm ${
        core ? 'border-accent bg-accent/5' : 'border-border bg-card'
      }`}
    >
      {photo && <img src={photo} alt="" loading="lazy" className="h-24 w-24 shrink-0 object-contain sm:h-28 sm:w-28" />}
      <div className="min-w-0">
        <p className="font-medium">{tr.name}</p>
        <p className="mt-1 text-sm text-muted-foreground">{tr.usage}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('report.plan.applicationFrequencyLabel')}: {tr.frequency}
          {core && tr.appliesToLabels.length
            ? ` · ${t('report.plan.appliesToLabel')}: ${tr.appliesToLabels.join(', ')}`
            : ''}
        </p>
      </div>
    </div>
  );
}

export function AppPlan() {
  const t = useT();
  const { locale } = useLocale();
  const session = useSession();
  const program = session.program!;
  const a = program.analysisSnapshot;
  const planKeys = planKeysForProgram(session.diagnosis, a);
  const plan = resolvePlanTreatments(t, locale, planKeys);

  return (
    <div data-animate className="flex flex-col gap-4 md:gap-8">
      <AccountPageHeader eyebrow={t('app.nav.plan')} title={t('report.section.plan.title')} />

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase text-accent">
          {t('report.section.plan.matchedBadge')}
        </p>
        <p className="text-sm text-muted-foreground">
          {t(`scale.${a.scale}.label` as MessageKey)} · {t(`severity.${a.severityBand}` as MessageKey)}
        </p>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 lg:gap-8">
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-medium">{t('report.plan.core.title')}</h2>
          {plan.core.map((tr) => (
            <TreatmentCard key={tr.key} tr={tr} core />
          ))}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-medium">{t('report.plan.supporting.title')}</h2>
          {plan.supporting.map((tr) => (
            <TreatmentCard key={tr.key} tr={tr} core={false} />
          ))}
        </section>
      </div>

      <section className="rounded-xl border border-border bg-card p-5 text-center shadow-sm">
        <p className="text-sm font-medium uppercase text-muted-foreground">
          {t('report.section.duration.title')}
        </p>
        <p className="mt-1 font-display text-2xl font-medium">
          {t('report.duration.label', { days: program.durationDays })}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {program.startDate} → {program.endDate}
        </p>
      </section>
    </div>
  );
}

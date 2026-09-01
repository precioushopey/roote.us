import type { ReportModel } from '@/domain/report/types';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { isPending } from '@/content/pending';

function MoneyOrPending({ value }: { value: ReportModel['pricing']['price'] }) {
  return isPending(value) ? <PendingChip label={value.label} /> : <span>{value.formatted}</span>;
}

function TextOrPending({ value }: { value: string | { __pending: true; label: string } }) {
  return isPending(value) ? <PendingChip label={value.label} /> : <span>{value}</span>;
}

export function ReportPlan({ model }: { model: ReportModel }) {
  const p = model.plan;
  return (
    <section className="flex flex-col gap-3 px-4 py-4">
      <span className="w-fit rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-accent-foreground">
        {p.matchedToScanBadge}
      </span>
      {p.core.map((tr, i) => (
        <div key={i} className="rounded-lg border border-accent bg-accent/5 p-3">
          <p className="font-medium"><TextOrPending value={tr.name} /></p>
          <p className="text-sm text-muted-foreground">{tr.usage}</p>
          <p className="text-xs text-muted-foreground">{tr.frequency} · {tr.appliesToLabels.join(', ')}</p>
        </div>
      ))}
      {p.supporting.map((tr, i) => (
        <div key={i} className="rounded-lg border border-border p-3">
          <p className="font-medium"><TextOrPending value={tr.name} /></p>
          <p className="text-sm text-muted-foreground">{tr.usage}</p>
          <p className="text-xs text-muted-foreground">{tr.frequency}</p>
        </div>
      ))}
      {p.formula && (
        <div className="text-xs text-muted-foreground">
          <p>{p.formula.ingredients.map((i) => i.name).join(' · ')}</p>
          <p className="mt-1"><TextOrPending value={p.formula.statusLabel} /></p>
        </div>
      )}
    </section>
  );
}

export function ReportDuration({ model }: { model: ReportModel }) {
  return (
    <section className="flex flex-col items-center gap-1 px-4 py-6 text-center">
      <p className="text-2xl font-medium">{model.recommendedDuration.label}</p>
      <p className="text-xs text-muted-foreground">{model.recommendedDuration.rationaleNote}</p>
    </section>
  );
}

export function ReportPricing({ model }: { model: ReportModel }) {
  return (
    <section className="flex flex-col gap-3 px-4 py-4">
      <div className="rounded-lg border border-accent p-4 text-center">
        <p className="text-lg font-medium"><MoneyOrPending value={model.pricing.price} /></p>
        <p className="text-xs text-muted-foreground"><MoneyOrPending value={model.pricing.perDay} /></p>
      </div>
      <div className="grid gap-1">
        {model.pricing.compareAll.map((row) => (
          <div key={row.days} className="flex items-center justify-between text-xs">
            <span>{row.label}{row.isRecommended && ' ★'}</span>
            <MoneyOrPending value={row.price} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ReportClaims({ model }: { model: ReportModel }) {
  return (
    <section className="grid grid-cols-3 gap-2 px-4 py-4">
      {model.claims.map((c) => (
        <div key={c.key} className="rounded-lg border border-border p-2 text-center">
          <p className="text-[10px] uppercase text-muted-foreground">{c.label}</p>
          <p className="mt-1 text-sm"><TextOrPending value={c.valueLabel} /></p>
        </div>
      ))}
    </section>
  );
}

export function ReportCta({ model }: { model: ReportModel }) {
  return (
    <section className="px-4 py-6 text-center">
      <a
        href={model.cta.href}
        className="inline-flex items-center rounded-md bg-primary px-8 py-4 text-sm font-medium text-primary-foreground"
      >
        {model.cta.label}
      </a>
    </section>
  );
}

export function ReportFooter({ model }: { model: ReportModel }) {
  return (
    <footer className="flex flex-col gap-1 border-t border-border px-4 py-4 text-[10px] text-muted-foreground">
      <p><TextOrPending value={model.disclaimers.medical} /></p>
      <p><TextOrPending value={model.disclaimers.notADiagnosis} /></p>
      <p>{model.disclaimers.demo}</p>
      <p><TextOrPending value={model.disclaimers.formulaPending} /></p>
    </footer>
  );
}

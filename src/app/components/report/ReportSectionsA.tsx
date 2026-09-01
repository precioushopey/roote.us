import type { ReportModel } from '@/domain/report/types';
import { Wordmark } from '@/app/components/brand/Wordmark';

export function ReportHeader({ model }: { model: ReportModel }) {
  return (
    <header className="flex flex-col items-center gap-2 py-6 text-center">
      <Wordmark className="text-2xl" />
      <h1 className="text-lg font-medium">Personalized Hair Report</h1>
      <p className="text-xs text-muted-foreground">
        {model.meta.scaleLine}
      </p>
      <p className="text-[11px] text-muted-foreground">
        #{model.meta.reportId} · {new Date(model.meta.generatedAt).toLocaleDateString(model.meta.locale === 'he' ? 'he-IL' : 'en-US')}
      </p>
      <p className="rounded border border-dashed border-accent px-2 py-1 text-[11px] text-accent">{model.meta.demoDisclaimer}</p>
    </header>
  );
}

export function ReportPhotos({ model }: { model: ReportModel }) {
  return (
    <section className="grid grid-cols-2 gap-3 px-4 py-4">
      {model.photos.map((p) => (
        <figure key={p.angleKey} className="flex flex-col gap-1">
          <img src={p.dataUrl} alt={p.caption} className="h-28 w-full rounded-lg object-cover" />
          <figcaption className="text-center text-xs text-muted-foreground">{p.caption}</figcaption>
        </figure>
      ))}
    </section>
  );
}

export function ReportAnalysis({ model }: { model: ReportModel }) {
  const a = model.analysis;
  return (
    <section className="flex flex-col gap-4 px-4 py-4">
      <p className="text-xs text-muted-foreground">{a.scaleLabel}</p>
      <div className="flex flex-wrap gap-1">
        {a.scaleStrip.map((s) => (
          <span
            key={s.stageKey}
            className={
              'flex h-8 w-8 items-center justify-center rounded-full border text-xs ' +
              (s.isCurrent ? 'border-accent bg-accent/20 font-medium' : 'border-border text-muted-foreground')
            }
          >
            {s.stageKey}
          </span>
        ))}
      </div>
      <div className="grid gap-2">
        {a.flagged.map((f) => (
          <div key={f.zoneLabel} className="rounded-lg border border-border p-3 text-sm">
            <p className="font-medium">{f.zoneLabel}</p>
            <p className="text-xs text-muted-foreground">{f.severityLabel} — {f.note}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {a.densityMap.map((d) => (
          <div key={d.zoneLabel} className="text-xs">
            <p>{d.zoneLabel}</p>
            <p className="text-muted-foreground">{d.levelLabel}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-1">
        {a.metrics.map((m) => (
          <div key={m.label} className="flex items-center justify-between text-xs">
            <span>{m.label}</span>
            <span className="text-muted-foreground">{m.valueLabel}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ReportHairLossType({ model }: { model: ReportModel }) {
  return (
    <section className="px-4 py-4">
      <h2 className="text-base font-medium">{model.hairLossType.title}</h2>
      <div className="mt-2 flex flex-wrap gap-1">
        {model.hairLossType.areaLabels.map((label) => (
          <span key={label} className="rounded-full bg-secondary px-2 py-1 text-xs">{label}</span>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{model.hairLossType.patternNote}</p>
    </section>
  );
}

export function ReportCurrentSituation({ model }: { model: ReportModel }) {
  return (
    <section className="flex flex-col gap-2 px-4 py-4">
      {model.currentSituation.paragraphs.map((p, i) => (
        <p key={i} className="text-sm text-muted-foreground">{p}</p>
      ))}
    </section>
  );
}

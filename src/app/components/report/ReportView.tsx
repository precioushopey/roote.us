import type { ReactNode } from 'react';
import type { ReportModel } from '@/domain/report/types';
import { isPending } from '@/content/pending';
import { useRevealOnRoute } from '@/app/lib/useRevealOnRoute';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { Prose } from '@/app/components/marketing/Prose';
import { CtaButton } from '@/app/components/marketing/CtaButton';

function TextOrPending({ value }: { value: string | { __pending: true; label: string } }) {
  return isPending(value) ? <PendingChip label={value.label} /> : <span>{value}</span>;
}

function Band({ tone = 'light', children }: { tone?: 'light' | 'ink'; children: ReactNode }) {
  return (
    <section
      data-animate
      className={
        tone === 'ink'
          ? 'bg-ink py-16 text-ink-foreground md:py-20'
          : 'border-t border-border bg-grid-lines py-14 md:py-16'
      }
    >
      <div className="mx-auto max-w-3xl px-6">{children}</div>
    </section>
  );
}

export function ReportView({ model }: { model: ReportModel }) {
  useRevealOnRoute();
  return (
    <main className="bg-background font-body text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center px-6 py-3">
          <Wordmark className="w-24" />
        </div>
      </header>
      <p className="bg-ink py-1.5 text-center text-[10px] tracking-[0.22em] text-ink-foreground/80">
        {model.ribbon.toUpperCase()}
      </p>

      {/* Cover */}
      <Band>
        <p className="font-body text-xs font-medium uppercase tracking-[0.18em] text-accent">
          {model.titles.cover}
        </p>
        <DisplayHeading as="h1" size="l" text={model.intro.greeting} className="mt-3" />
        <Prose size="l" className="mt-4 max-w-xl">{model.intro.body}</Prose>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: model.analysis.scaleLabel, value: model.hairLossType.title },
            { label: model.titles.scan, value: model.hairLossType.areaLabels.join(', ') || '—' },
            { label: model.titles.program, value: model.recommendedDuration.label },
          ].map((cell) => (
            <div key={cell.label} className="rounded-xl border border-border bg-background p-4">
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{cell.label}</p>
              <p className="mt-1 font-display text-lg font-medium">{cell.value}</p>
            </div>
          ))}
        </div>
      </Band>

      {/* Your scan */}
      <Band>
        <p className="font-body text-xs font-medium uppercase tracking-[0.18em] text-accent">{model.titles.scan}</p>
        <DisplayHeading as="h2" size="m" text={model.titles.analysis} className="mt-2" />
        {model.photos.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {model.photos.map((p) => (
              <figure key={p.angleKey} className="flex flex-col gap-1">
                <img src={p.dataUrl} alt={p.caption} className="img-editorial aspect-square w-full rounded-lg object-cover" />
                <figcaption className="text-center text-[11px] text-muted-foreground">{p.caption}</figcaption>
              </figure>
            ))}
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-1.5">
          {model.analysis.scaleStrip.map((st) => (
            <span
              key={st.stageKey}
              className={
                'flex h-8 w-8 items-center justify-center rounded-full border text-xs ' +
                (st.isCurrent ? 'border-accent bg-accent/15 font-medium text-accent' : 'border-border text-muted-foreground')
              }
            >
              {st.stageKey}
            </span>
          ))}
        </div>
        <div className="mt-4 grid gap-2">
          {model.analysis.flagged.map((f) => (
            <div key={f.zoneLabel} className="rounded-xl border border-border bg-background p-3">
              <p className="font-medium">{f.zoneLabel}</p>
              <p className="text-sm text-muted-foreground">{f.severityLabel}: {f.note}</p>
            </div>
          ))}
        </div>
        {model.currentSituation.paragraphs.map((p, i) => (
          <Prose key={i} className="mt-4 max-w-xl">{p}</Prose>
        ))}
      </Band>

      {/* Your regimen */}
      <Band tone="ink">
        <span className="inline-block rounded-full bg-accent px-3 py-1 text-[11px] font-medium tracking-wide text-accent-foreground">
          {model.regimen.badge}
        </span>
        <DisplayHeading as="h2" size="m" onInk text={model.regimen.title} className="mt-3" />
        <div className="mt-10 flex flex-col gap-12">
          {model.regimen.items.map((it, idx) => (
            <div key={it.key} className="grid grid-cols-1 items-start gap-6 sm:grid-cols-[160px_1fr]">
              <div className={idx % 2 ? 'sm:order-2' : ''}>
                {it.photo ? (
                  <img src={it.photo} alt="" className="img-editorial aspect-[4/5] w-full rounded-xl object-cover" />
                ) : (
                  <div className="aspect-[4/5] w-full rounded-xl border border-ink-foreground/15 bg-ink-foreground/5" />
                )}
              </div>
              <div className={idx % 2 ? 'sm:order-1' : ''}>
                <p className="font-display text-xl font-medium text-ink-foreground">
                  {isPending(it.name) ? <PendingChip label={it.name.label} /> : it.name}
                </p>
                <p className="text-xs uppercase tracking-[0.12em] text-ink-foreground/60">{it.form}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {it.addressesLabels.map((tag) => (
                    <span key={tag} className="rounded-full border border-ink-foreground/25 px-2.5 py-0.5 text-[11px] text-ink-foreground/85">
                      {tag}
                    </span>
                  ))}
                </div>
                {it.mechanism.map((m, i) => (
                  <Prose key={i} onInk className="mt-3">{m}</Prose>
                ))}
                <p className="mt-3 text-xs text-ink-foreground/70">{it.howToLabel}</p>
                {it.appliesToLabel && (
                  <p className="text-xs text-ink-foreground/70">
                    {model.plan.labels.appliesTo}: {it.appliesToLabel}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-accent">
                  {it.badges.map((b) => (
                    <span key={b}>· {b}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Band>

      {/* The actives */}
      <Band>
        <DisplayHeading as="h2" size="m" text={model.actives.title} />
        <Prose className="mt-3 max-w-xl">{model.actives.note}</Prose>
        <div className="mt-8 flex flex-col gap-5">
          {model.actives.items.map((a) => (
            <div key={a.key} className="flex items-center gap-4">
              {a.photo ? (
                <img src={a.photo} alt="" className="img-editorial h-16 w-16 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="h-16 w-16 shrink-0 rounded-lg border border-border bg-background" />
              )}
              <div>
                <p className="font-medium">
                  {a.name}
                  {a.percentageLabel ? <span className="ms-2 text-sm text-muted-foreground">{a.percentageLabel}</span> : null}
                </p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-accent">{a.roleLabel}</p>
                <p className="text-sm text-muted-foreground">{a.mechanism}</p>
              </div>
            </div>
          ))}
        </div>
      </Band>

      {/* What to expect */}
      <Band tone="ink">
        <DisplayHeading as="h2" size="m" onInk text={model.expect.title} />
        <Prose size="l" onInk className="mt-3 max-w-xl">{model.expect.intro}</Prose>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {model.expect.stats.map((st, i) => (
            <div key={i} className="rounded-xl border border-ink-foreground/15 bg-ink-foreground/5 p-4">
              <p className="font-display text-2xl font-medium text-ink-foreground">
                <TextOrPending value={st.value} />
              </p>
              <p className="mt-1 text-[11px] text-ink-foreground/60">{st.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {model.expect.timeline.map((tl, i) => (
            <div key={i} className="rounded-xl border border-ink-foreground/15 bg-ink-foreground/5 p-4">
              <p className="font-medium text-ink-foreground">{tl.label}</p>
              <div className="mt-1"><PendingChip label={tl.outcome.label} /></div>
            </div>
          ))}
        </div>
        <Prose onInk className="mt-4 max-w-xl">{model.expect.note}</Prose>
      </Band>

      {/* Your program */}
      <Band>
        <DisplayHeading as="h2" size="m" text={model.titles.program} className="text-center" />
        <p className="mt-4 text-center font-display text-4xl font-medium">{model.recommendedDuration.label}</p>
        <p className="mt-1 text-center text-sm text-muted-foreground">{model.recommendedDuration.rationaleNote}</p>
        <div className="mx-auto mt-8 max-w-md rounded-xl border border-border bg-background p-5">
          <p className="text-xs font-medium">{model.pricing.compareTitle}</p>
          <div className="mt-3 flex flex-col gap-1.5">
            {model.pricing.compareAll.map((r) => (
              <div key={r.days} className="flex items-center justify-between text-sm">
                <span>
                  {r.label}
                  {r.isRecommended && <span className="ms-2 text-xs text-accent">{model.pricing.recommendedBadge}</span>}
                </span>
                {isPending(r.price) ? <PendingChip label={r.price.label} /> : <span>{r.price.formatted}</span>}
              </div>
            ))}
          </div>
        </div>
      </Band>

      {/* FAQ */}
      <Band>
        <DisplayHeading as="h2" size="m" text={model.faq.title} />
        <div className="mt-6 flex flex-col">
          {model.faq.items.map((q, i) => (
            <div key={i} className="border-t border-border py-4 first:border-t-0">
              <p className="font-medium">{q.q}</p>
              <Prose className="mt-1">{q.a}</Prose>
            </div>
          ))}
        </div>
      </Band>

      {/* CTA */}
      <section data-animate className="bg-ink py-16 text-center text-ink-foreground md:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <DisplayHeading as="h2" size="m" onInk text={model.intro.greeting} className="mx-auto" />
          <div className="mt-8">
            <CtaButton to={model.cta.href} size="lg" className="w-full sm:w-auto">
              {model.cta.label}
            </CtaButton>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-1 text-[11px] text-muted-foreground">
          <p><TextOrPending value={model.disclaimers.medical} /></p>
          <p><TextOrPending value={model.disclaimers.notADiagnosis} /></p>
          <p><TextOrPending value={model.disclaimers.demo} /></p>
          <p><TextOrPending value={model.disclaimers.formulaPending} /></p>
          <p className="mt-1">
            #{model.meta.reportId} ·{' '}
            {new Date(model.meta.generatedAt).toLocaleDateString(model.meta.locale === 'he' ? 'he-IL' : 'en-US')}
          </p>
        </div>
      </footer>
    </main>
  );
}

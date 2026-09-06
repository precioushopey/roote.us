import type { ReportModel } from '@/domain/report/types';
import type { GrayProfile } from '@/domain/analysis/grayProfile';
import type { RecommendationOutcome } from '@/domain/recommendation/types';
import { isPending } from '@/content/pending';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useRevealOnRoute } from '@/app/lib/useRevealOnRoute';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { Button, Badge, LegalNotice } from '@/app/components/roote';
import { buildRootePdf } from '@/pdf/reportPdf';

function Val({ value }: { value: string | { __pending: true; label: string } }) {
  return isPending(value) ? <PendingChip label={value.label} /> : <>{value}</>;
}

/** A numbered block in the report. The report reads like a medical summary —
 *  plain, sequential, PDF-ready — not a marketing page. */
function Sec({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border py-8 first:border-t-0">
      <div className="mb-4 flex items-baseline gap-3">
        <span aria-hidden className="font-body text-sm text-accent">
          {String(n).padStart(2, '0')}
        </span>
        <h2 className="font-display text-lg text-foreground">{title}</h2>
      </div>
      <div className="font-body text-sm leading-[1.65] text-muted-foreground">{children}</div>
    </section>
  );
}

const LEVEL_FILL = { low: 1, medium: 2, high: 3 } as const;

export function ReportView({
  model,
  grayProfile,
  recommendation,
}: {
  model: ReportModel;
  grayProfile?: GrayProfile | null;
  recommendation?: RecommendationOutcome | null;
}) {
  const t = useT();
  const withLocale = useLocalizedPath();
  useRevealOnRoute();

  const generated = new Date(model.meta.generatedAt).toLocaleDateString(
    model.meta.locale === 'he' ? 'he-IL' : 'en-US',
  );

  let n = 0;
  const next = () => (n += 1);

  const pdfText = (v: string | { __pending: true; label: string }) => (isPending(v) ? `[pending: ${v.label}]` : v);
  function downloadPdf() {
    void buildRootePdf({
      title: t('report.pdf.title'),
      subtitle: `#${model.meta.reportId.slice(0, 8)} · ${generated} · ${model.meta.scaleLine}`,
      sections: [
        { heading: model.titles.analysis, lines: [model.hairLossType.patternNote, ...model.currentSituation.paragraphs] },
        {
          heading: model.titles.analysis,
          rows: model.analysis.metrics.map((m): [string, string] => [m.label, m.valueLabel]),
        },
        {
          heading: model.titles.plan,
          lines: [
            ...model.plan.core.map((c) => `${pdfText(c.name)} — ${c.usage} · ${c.frequency}`),
            ...model.plan.supporting.map((s) => `${pdfText(s.name)} — ${s.usage} · ${s.frequency}`),
          ],
        },
      ],
      disclaimer: pdfText(model.meta.demoDisclaimer),
      filename: 'roote-personalized-hair-report.pdf',
    });
  }

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <header className="glass sticky top-0 z-40 border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
          <Wordmark className="w-24" />
          <span className="font-body text-2xs text-muted-foreground">
            #{model.meta.reportId.slice(0, 8)} · {generated}
          </span>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-10">
        <p className="u-caps font-body text-2xs font-semibold text-muted-foreground">{model.titles.cover}</p>
        <h1 className="text-display mt-2 text-foreground" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
          {model.intro.greeting}
        </h1>
        <p className="mt-3 max-w-xl font-body text-md text-muted-foreground">{model.intro.body}</p>
        <p className="mt-2 font-body text-xs text-muted-foreground">{model.meta.scaleLine}</p>
        <div className="mt-4">
          <Button onClick={downloadPdf} variant="secondary" size="sm">
            {t('report.pdf.download')}
          </Button>
        </div>

        {/* 1 — Your photos */}
        {model.photos.length > 0 && (
          <Sec n={next()} title={model.titles.photos}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {model.photos.map((p) => (
                <figure key={p.angleKey} className="flex flex-col gap-1">
                  <img src={p.dataUrl} alt={p.caption} className="aspect-square w-full rounded-lg object-cover" />
                  <figcaption className="text-center text-2xs text-muted-foreground">{p.caption}</figcaption>
                </figure>
              ))}
            </div>
          </Sec>
        )}

        {/* 2 — Analysis summary */}
        <Sec n={next()} title={model.titles.analysis}>
          <p>{model.hairLossType.patternNote}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {model.analysis.scaleStrip.map((st) => (
              <span
                key={st.stageKey}
                className={
                  'flex h-8 w-8 items-center justify-center rounded-full border text-xs ' +
                  (st.isCurrent ? 'border-accent bg-accent/15 font-medium text-deep-900' : 'border-border text-muted-foreground')
                }
              >
                {st.stageKey}
              </span>
            ))}
          </div>
        </Sec>

        {/* 3 — Concern / pattern */}
        <Sec n={next()} title={model.titles.hairLossType}>
          <p className="font-body text-foreground">{model.hairLossType.title}</p>
          {model.hairLossType.areaLabels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {model.hairLossType.areaLabels.map((a) => (
                <Badge key={a} tone="neutral">{a}</Badge>
              ))}
            </div>
          )}
        </Sec>

        {/* 4 — Current situation */}
        <Sec n={next()} title={model.titles.currentSituation}>
          {model.currentSituation.paragraphs.map((p, i) => (
            <p key={i} className={i > 0 ? 'mt-2' : ''}>{p}</p>
          ))}
        </Sec>

        {/* 5 — Key observations */}
        <Sec n={next()} title={t('report.section.observations')}>
          <ul className="flex flex-col gap-2">
            {model.analysis.flagged.map((f) => (
              <li key={f.zoneLabel} className="rounded-lg border border-border bg-card p-3 text-foreground">
                <span className="font-medium">{f.zoneLabel}</span>
                <span className="text-muted-foreground"> — {f.severityLabel}: {f.note}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2">
            {model.analysis.metrics.map((m) => (
              <div key={m.label} className="flex items-center justify-between gap-4 py-1">
                <span>{m.label}</span>
                <span className="flex items-center gap-1" aria-label={m.valueLabel}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={'h-1.5 w-6 rounded-full ' + (i < LEVEL_FILL[m.level] ? 'bg-accent' : 'bg-border')} />
                  ))}
                </span>
              </div>
            ))}
          </div>
        </Sec>

        {/* Gray branch — inserted only for a pigmentation concern */}
        {grayProfile && (
          <Sec n={next()} title={t('report.gray.title')}>
            <div className="grid gap-2 sm:grid-cols-3">
              <div>
                <p className="text-2xs uppercase tracking-wide">{t('report.gray.stage')}</p>
                <p className="font-body text-foreground">{t(`analysis.results.grayStage.${grayProfile.stage}` as 'analysis.results.grayStage.early')}</p>
              </div>
              <div>
                <p className="text-2xs uppercase tracking-wide">{t('report.gray.area')}</p>
                <p className="font-body text-foreground">{t(grayProfile.visibleAreaKey as 'gray.area.temples')}</p>
              </div>
              <div>
                <p className="text-2xs uppercase tracking-wide">{t('report.gray.pace')}</p>
                <p className="font-body text-foreground">{t(grayProfile.paceKey as 'gray.pace.slow')}</p>
              </div>
            </div>
            <p className="mt-3">{t('report.gray.routineBody')}</p>
          </Sec>
        )}

        {/* 6 — Personalized treatment plan */}
        <Sec n={next()} title={model.titles.plan}>
          <p className="text-foreground">
            <Badge tone="gold">{model.plan.matchedToScanBadge}</Badge>
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {model.plan.core.map((it, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4">
                <p className="font-body font-medium text-foreground">
                  {isPending(it.name) ? <PendingChip label={it.name.label} /> : it.name}
                </p>
                <p className="mt-1">{it.usage}</p>
              </div>
            ))}
          </div>
        </Sec>

        {/* 7 — Products included · 8 — Application frequency */}
        <Sec n={next()} title={t('report.section.productsIncluded')}>
          <ul className="flex flex-col gap-2">
            {model.plan.core.map((it, i) => (
              <li key={`c${i}`} className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-foreground">{isPending(it.name) ? <PendingChip label={it.name.label} /> : it.name}</span>
                <span className="text-2xs text-muted-foreground">
                  {model.plan.labels.applicationFrequency}: {it.frequency}
                </span>
              </li>
            ))}
          </ul>
        </Sec>

        {/* 9 — Supporting treatment */}
        {model.plan.supporting.length > 0 && (
          <Sec n={next()} title={model.plan.labels.supporting}>
            <ul className="flex flex-col gap-2">
              {model.plan.supporting.map((it, i) => (
                <li key={`s${i}`} className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-foreground">{isPending(it.name) ? <PendingChip label={it.name.label} /> : it.name}</span>
                  <span className="text-2xs text-muted-foreground">{it.usage} · {it.frequency}</span>
                </li>
              ))}
            </ul>
          </Sec>
        )}

        {/* 10 — Recommended program duration */}
        <Sec n={next()} title={model.titles.program}>
          <p className="font-display text-2xl text-foreground">{model.recommendedDuration.label}</p>
          <p className="mt-1">{model.recommendedDuration.rationaleNote}</p>
        </Sec>

        {/* 11 — Pricing */}
        <Sec n={next()} title={model.titles.pricing}>
          <div className="flex flex-col gap-1.5">
            {model.pricing.compareAll.map((r) => (
              <div key={r.days} className="flex items-center justify-between">
                <span>
                  {r.label}
                  {r.isRecommended && <span className="ms-2 text-2xs text-deep-800">{model.pricing.recommendedBadge}</span>}
                </span>
                {isPending(r.price) ? <PendingChip label={r.price.label} /> : <span className="text-foreground">{r.price.formatted}</span>}
              </div>
            ))}
          </div>
        </Sec>

        {/* 12 — Safety / eligibility */}
        <Sec n={next()} title={t('report.section.safety')}>
          {recommendation?.requiresMedicalReview ? (
            <p className="text-foreground">{t('report.safety.reviewRequired')}</p>
          ) : (
            <p>{t('report.safety.notRequired')}</p>
          )}
          {recommendation?.strongerTierNote && <p className="mt-2">{t('report.safety.strongerTier')}</p>}
          <LegalNotice reviewRequired className="mt-4">
            <span className="block"><Val value={model.disclaimers.medical} /></span>
            <span className="mt-1 block"><Val value={model.disclaimers.notADiagnosis} /></span>
          </LegalNotice>
        </Sec>

        {/* 13 — CTA */}
        <div className="mt-10 rounded-2xl bg-ink p-8 text-center text-ink-foreground">
          <p className="text-display text-cream-100" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
            {model.intro.greeting}
          </p>
          <Button to={withLocale(model.cta.href)} size="lg" caps className="mt-6">
            {model.cta.label}
          </Button>
        </div>

        <footer className="mt-8 flex flex-col gap-1 border-t border-border pt-6 text-2xs text-muted-foreground">
          <p><Val value={model.disclaimers.demo} /></p>
          <p><Val value={model.disclaimers.formulaPending} /></p>
          <p className="mt-1">#{model.meta.reportId} · {generated}</p>
        </footer>
      </article>
    </div>
  );
}

import { useEffect } from 'react';
import { Check } from 'lucide-react';
import type { ReportModel } from '@/domain/report/types';
import type { GrayProfile } from '@/domain/analysis/grayProfile';
import type { RecommendationOutcome } from '@/domain/recommendation/types';
import type { ProgramDurationDays } from '@/domain/program/types';
import { isPending } from '@/content/pending';
import { LOCALES } from '@/i18n/locales';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useRevealOnRoute } from '@/app/lib/useRevealOnRoute';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { MediaPlaceholder } from '@/app/components/media/MediaPlaceholder';
import { Button, Badge, LegalNotice } from '@/app/components/roote';
import { buildRootePdf } from '@/pdf/reportPdf';

function Val({ value }: { value: string | { __pending: true; label: string } }) {
  return isPending(value) ? <PendingChip label={value.label} /> : <>{value}</>;
}

function nameLabel(name: string | { __pending: true; label: string }): string {
  return isPending(name) ? name.label : name;
}

/** A regimen item's product photo, or a `MediaPlaceholder` when the SKU has
 *  no final packaging photography yet (see `content/treatmentPhotos.ts`). */
function RegimenPhoto({
  photo,
  alt,
  className,
}: {
  photo?: string;
  alt: string;
  className: string;
}) {
  return photo ? (
    <img src={photo} alt="" loading="lazy" className={className} />
  ) : (
    <MediaPlaceholder alt={alt} label={`${alt}: product photography`} ratio="1" className={className} />
  );
}

/** A numbered block in the report. The report reads like a medical summary —
 *  plain, sequential, PDF-ready — not a marketing page. */
function Sec({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border py-8 first:border-t-0">
      <div className="mb-4 flex items-baseline gap-4">
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
  const session = useSession();
  useRevealOnRoute();

  const generated = new Date(model.meta.generatedAt).toLocaleDateString(LOCALES[model.meta.locale].bcp47);

  // The report already recommends exactly one program duration (section 10)
  // — Pricing (section 11) confirms pricing for that one program, not a
  // comparison of every alternative. Persist it as the draft duration so
  // the funnel downstream (still untouched here, on purpose) already has
  // it once the visitor proceeds to checkout.
  const recommendedDays = model.recommendedDuration.days as ProgramDurationDays;
  useEffect(() => {
    session.setDraftDurationDays(recommendedDays);
  }, [recommendedDays]);

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
            ...model.plan.core.map((c) => `${pdfText(c.name)}: ${c.usage} · ${c.frequency}`),
            ...model.plan.supporting.map((s) => `${pdfText(s.name)}: ${s.usage} · ${s.frequency}`),
          ],
        },
      ],
      disclaimer: pdfText(model.meta.demoDisclaimer),
      filename: 'roote-personalized-hair-report.pdf',
    });
  }

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <header className="bg-white sticky top-0 z-40 border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
          <Wordmark className="w-24" />
          <span className="font-body text-sm text-muted-foreground">
            #{model.meta.reportId.slice(0, 8)} · {generated}
          </span>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-10">
        <p className="u-caps font-body text-sm font-semibold text-muted-foreground">{model.titles.cover}</p>
        <h1 className="display-heading mt-2 text-foreground" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
          {model.intro.greeting}
        </h1>
        <p className="mt-3 max-w-xl font-body text-md text-muted-foreground">{model.intro.body}</p>
        <p className="mt-2 font-body text-sm text-muted-foreground">{model.meta.scaleLine}</p>
        <div className="mt-4 mb-6">
          <Button onClick={downloadPdf} variant="secondary">
            {t('report.pdf.download')}
          </Button>
        </div>

        {/* 1 — Your photos */}
        {model.photos.length > 0 && (
          <Sec n={next()} title={model.titles.photos}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {model.photos.map((p) => (
                <figure key={p.angleKey} className="flex flex-col gap-2">
                  <img src={p.dataUrl} alt={p.caption} loading="lazy" className="aspect-square w-full rounded-sm object-cover" />
                  <figcaption className="text-center text-sm text-muted-foreground">{p.caption}</figcaption>
                </figure>
              ))}
            </div>
          </Sec>
        )}

        {/* 2 — Analysis summary */}
        <Sec n={next()} title={model.titles.analysis}>
          <p>{model.hairLossType.patternNote}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {model.analysis.scaleStrip.map((st) => (
              <span
                key={st.stageKey}
                className={
                  'flex h-8 w-8 items-center justify-center rounded-full border text-sm ' +
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
            <div className="mt-2 flex flex-wrap gap-2">
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
                <span className="text-muted-foreground">, {f.severityLabel}: {f.note}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2">
            {model.analysis.metrics.map((m) => (
              <div key={m.label} className="flex items-center justify-between gap-4 py-1">
                <span>{m.label}</span>
                <span className="flex items-center gap-2" aria-label={m.valueLabel}>
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
                <p className="text-sm uppercase">{t('report.gray.stage')}</p>
                <p className="font-body text-foreground">{t(`analysis.results.grayStage.${grayProfile.stage}` as 'analysis.results.grayStage.early')}</p>
              </div>
              <div>
                <p className="text-sm uppercase">{t('report.gray.area')}</p>
                <p className="font-body text-foreground">{t(grayProfile.visibleAreaKey as 'gray.area.temples')}</p>
              </div>
              <div>
                <p className="text-sm uppercase">{t('report.gray.pace')}</p>
                <p className="font-body text-foreground">{t(grayProfile.paceKey as 'gray.pace.slow')}</p>
              </div>
            </div>
            <p className="mt-3">{t('report.gray.routineBody')}</p>
          </Sec>
        )}

        {/* What to expect — outcome stats + timeline. Already-computed, already
             PENDING-guarded (buildReport.ts): nothing here is an invented number,
             every unconfirmed value renders as a PendingChip via <Val>. */}
        <Sec n={next()} title={model.expect.title}>
          <p>{model.expect.intro}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {model.expect.stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-border bg-card p-3">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 font-display text-lg text-foreground"><Val value={s.value} /></p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {model.expect.timeline.map((row, i) => (
              <div key={i} className="flex items-center justify-between gap-4 border-t border-border pt-2 first:border-t-0 first:pt-0">
                <span className="text-foreground">{row.label}</span>
                <Val value={row.outcome} />
              </div>
            ))}
          </div>
          <p className="mt-4">{model.expect.note}</p>
        </Sec>

        {/* 6 — Personalized treatment plan, or a review notice when the
             recommendation engine held the product (client-confirmed states:
             requires-review / professional-review-recommended / confirmed-but-
             not-yet-production-active). No automatic recommendation is invented
             in the meantime. */}
        {!model.plan.isStandard && model.plan.reviewMessage && (
          <Sec n={next()} title={model.titles.plan}>
            <p className="text-foreground">{model.plan.reviewMessage}</p>
          </Sec>
        )}

        {model.plan.isStandard && (
          <>
            {/* 6 — Personalized treatment plan, as a regimen: real product photos,
                 mechanism-of-action copy, and how-to-apply instructions (richer
                 than the plain name+usage list this replaced — same underlying
                 treatments, via model.regimen instead of model.plan.core). */}
            <Sec n={next()} title={model.regimen.title}>
              <p className="text-foreground">
                <Badge tone="gold">{model.regimen.badge}</Badge>
              </p>
              <div className="mt-4 flex flex-col gap-4">
                {model.regimen.items.map((it) => (
                  <div key={it.key} className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row">
                    <RegimenPhoto
                      photo={it.photo}
                      alt={nameLabel(it.name)}
                      className="aspect-square w-full shrink-0 self-start rounded-sm object-cover sm:w-1/4"
                    />
                    <div className="min-w-0">
                      <p className="font-body font-medium text-foreground">
                        {isPending(it.name) ? <PendingChip label={it.name.label} /> : it.name}
                      </p>
                      <p className="mt-1">{it.howToLabel}</p>
                      {it.mechanism.length > 0 && (
                        <ul className="mt-2 flex flex-col gap-1">
                          {it.mechanism.map((m, mi) => (
                            <li key={mi}>{m}</li>
                          ))}
                        </ul>
                      )}
                      {(it.addressesLabels.length > 0 || it.badges.length > 0) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {[...it.addressesLabels, ...it.badges].map((label) => (
                            <Badge key={label} tone="neutral">{label}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Sec>

            {/* 7 — Products included · 8 — Application frequency. Photos come
                 from model.regimen.items — built from the same core-treatment
                 list in the same order as model.plan.core, so index i lines
                 up between the two (regimen.items is [...core, ...supporting],
                 core first). */}
            <Sec n={next()} title={t('report.section.productsIncluded')}>
              <ul className="flex flex-col gap-3">
                {model.plan.core.map((it, i) => {
                  const photo = model.regimen.items[i]?.photo;
                  return (
                    <li key={`c${i}`} className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-3">
                        <RegimenPhoto photo={photo} alt={nameLabel(it.name)} className="h-10 w-10 shrink-0 rounded-sm object-cover" />
                        <span className="text-foreground">{isPending(it.name) ? <PendingChip label={it.name.label} /> : it.name}</span>
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {model.plan.labels.applicationFrequency}: {it.frequency}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Sec>
          </>
        )}

        {/* 9 — Supporting treatment. Photos from model.regimen.items again —
             supporting items sit right after core in that array, so offset
             by core's length to line up the same index. */}
        {model.plan.isStandard && model.plan.supporting.length > 0 && (
          <Sec n={next()} title={model.plan.labels.supporting}>
            <ul className="flex flex-col gap-3">
              {model.plan.supporting.map((it, i) => {
                const photo = model.regimen.items[model.plan.core.length + i]?.photo;
                return (
                  <li key={`s${i}`} className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-3">
                      <RegimenPhoto photo={photo} alt={nameLabel(it.name)} className="h-10 w-10 shrink-0 rounded-sm object-cover" />
                      <span className="text-foreground">{isPending(it.name) ? <PendingChip label={it.name.label} /> : it.name}</span>
                    </span>
                    <span className="text-sm text-muted-foreground">{it.usage} · {it.frequency}</span>
                  </li>
                );
              })}
            </ul>
          </Sec>
        )}

        {/* 10 — Your Program: duration + products + pricing in one card
             (was two separate numbered sections — "the name and days,
             then products, then a features checklist, then the total
             price" all read as one recommendation now, not a duration
             pick followed by a separate price lookup). */}
        {model.plan.isStandard && (
          <Sec n={next()} title={model.titles.program}>
            <div className="overflow-hidden rounded-2xl border border-border">
              <div className="bg-ink px-5 py-6 text-ink-foreground">
                <span className="u-caps inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  {t('start.plan.recommendedBadge')}
                </span>
                <p className="mt-3 font-display text-2xl">{model.recommendedDuration.label}</p>
                <p className="mt-1 text-sm">{model.recommendedDuration.rationaleNote}</p>
              </div>

              <div className="bg-card px-5 py-6">
                {model.regimen.items.length > 0 && (
                  <div className="flex flex-col gap-3">
                    {model.regimen.items.map((it) => (
                      <div key={it.key} className="flex items-center gap-3">
                        <RegimenPhoto photo={it.photo} alt={nameLabel(it.name)} className="h-12 w-12 shrink-0 rounded-sm object-cover" />
                        <span className="font-body text-foreground">
                          {isPending(it.name) ? <PendingChip label={it.name.label} /> : it.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <ul className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                  {t('report.pricing.features').split('|').map((f) => (
                    <li key={f} className="flex items-center gap-2 text-foreground">
                      <Check aria-hidden className="h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="font-body text-foreground">{t('report.pricing.totalLabel')}</span>
                  {isPending(model.pricing.price) ? (
                    <PendingChip label={model.pricing.price.label} />
                  ) : (
                    <span className="font-display text-lg text-foreground">{model.pricing.price.formatted}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-border bg-cream-100 p-4 text-sm text-muted-foreground">
              {t('program.plan.priceNote')} <PendingChip label="program pricing" />
            </div>
            <Button to={withLocale(model.cta.href)} block caps className="mt-4">
              {model.cta.label}
            </Button>
          </Sec>
        )}

        {/* 12 — Safety / eligibility */}
        <Sec n={next()} title={t('report.section.safety')}>
          {model.plan.isStandard && (
            recommendation?.requiresMedicalReview ? (
              <p className="text-foreground">{t('report.safety.reviewRequired')}</p>
            ) : (
              <p>{t('report.safety.notRequired')}</p>
            )
          )}
          <LegalNotice className="mt-4">
            <span className="block"><Val value={model.disclaimers.medical} /></span>
            <span className="mt-1 block"><Val value={model.disclaimers.notADiagnosis} /></span>
          </LegalNotice>
        </Sec>

        {/* 13 — CTA, review-required plans only. Standard plans get their CTA
             folded into the Pricing section above (choosing a duration IS
             the action) — no second "start" prompt needed for them. */}
        {!model.plan.isStandard && (
          <div className="mt-10 rounded-2xl bg-ink p-8 text-center text-ink-foreground">
            <p className="display-heading" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
              {model.intro.greeting}
            </p>
            <Button to={withLocale(model.cta.href)} caps className="mt-6">
              {model.cta.label}
            </Button>
          </div>
        )}

        <footer className="mt-8 flex flex-col gap-2 border-t border-border pt-6 text-sm text-muted-foreground">
          <p><Val value={model.disclaimers.demo} /></p>
          <p><Val value={model.disclaimers.formulaPending} /></p>
          <p className="mt-1">#{model.meta.reportId} · {generated}</p>
        </footer>
      </article>
    </div>
  );
}

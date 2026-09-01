import { rooteContent } from '@/content/roote.config';
import { PENDING, isPending, collectPending, type PendingMarker } from '@/content/pending';
import { messages } from '@/i18n/messages';
import { interpolate } from '@/i18n/interpolate';
import type { HairAnalysis } from '@/domain/analysis/types';
import type { SessionState } from '@/store/sessionStore';
import { formatMoney, type Money } from './money';
import type { ReportModel } from './types';

type Locale = 'en' | 'he';
type LocalizedText = { en: string; he: string };

function t(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const table = messages[locale] as Record<string, string>;
  const raw = table[key] ?? (messages.en as Record<string, string>)[key] ?? key;
  return interpolate(raw, vars);
}

/** A LocalizedText whose value for this locale is empty is just as unresolved as a null price. */
function resolveLocalized(text: LocalizedText, locale: Locale, label: string): string | PendingMarker {
  const value = text[locale];
  return value ? value : PENDING(label);
}

const ALL_ZONES = ['frontal-hairline', 'temples', 'mid-scalp', 'crown-vertex'] as const;
const SCALE_BOUNDS = { norwood: 7, ludwig: 3 } as const;

function buildScaleStrip(scale: HairAnalysis['scale'], stage: number) {
  const max = SCALE_BOUNDS[scale];
  return Array.from({ length: max }, (_, i) => {
    const n = i + 1;
    return { stageKey: `S${n}`, label: String(n), isCurrent: n === stage };
  });
}

export function buildReport(input: {
  diagnosis: SessionState['diagnosis'];
  analysis: HairAnalysis;
  content: typeof rooteContent;
  locale: Locale;
  reportId: string;
}): ReportModel {
  const { diagnosis, analysis, content, locale, reportId } = input;
  const dir: 'ltr' | 'rtl' = locale === 'he' ? 'rtl' : 'ltr';

  const scaleLabel = t(locale, `scale.${analysis.scale}.label`);
  const scaleLine = t(locale, 'ready.teaser', {
    scale: scaleLabel,
    severity: t(locale, `severity.${analysis.severityBand}`),
    zones: analysis.flaggedZones.length,
  });
  const demoDisclaimer = content.disclaimers.demo[locale];

  const photos = diagnosis.photos.map((p) => ({
    angleKey: p.angleKey,
    dataUrl: p.thumb,
    caption: t(locale, `photo.angle.${p.angleKey}`),
  }));

  const flaggedZoneSet = new Set(analysis.flaggedZones.map((z) => z.zone));
  const scaleStrip = buildScaleStrip(analysis.scale, analysis.stage);
  const flagged = analysis.flaggedZones.map((z) => ({
    zoneLabel: t(locale, `zone.${z.zone}`),
    severityLabel: t(locale, `severity.${z.severity}`),
    note: t(locale, z.noteKey),
  }));
  const densityMap = analysis.densityByZone.map((d) => ({
    zoneLabel: t(locale, `zone.${d.zone}`),
    level: d.level,
    levelLabel: t(locale, `level.${d.level}`),
  }));
  const metrics = analysis.metrics.map((m) => ({
    label: t(locale, `metric.${m.key}`),
    valueLabel: t(locale, `level.${m.level}`),
    level: m.level,
  }));

  const hairLossType = {
    title: scaleLine,
    areaLabels: ALL_ZONES.filter((z) => flaggedZoneSet.has(z)).map((z) => t(locale, `zone.${z}`)),
    patternNote: t(locale, analysis.summaryPlainKey),
  };

  const currentSituation = {
    paragraphs: [t(locale, analysis.summaryPlainKey), t(locale, 'report.currentSituation.nextStep')],
  };

  const core = content.treatments.core.map((tr) => ({
    name: resolveLocalized(tr.name, locale, `${tr.key} name (${locale})`),
    usage: t(locale, tr.usageKey),
    frequency: t(locale, tr.frequencyKey),
    appliesToLabels: tr.appliesToZones.map((z) => t(locale, `zone.${z}`)),
  }));
  const supporting = content.treatments.supporting.map((tr) => ({
    name: resolveLocalized(tr.name, locale, `${tr.key} name (${locale})`),
    usage: t(locale, tr.usageKey),
    frequency: t(locale, tr.frequencyKey),
  }));
  const formula = {
    ingredients: content.formula.ingredients.map((ing) => ({
      name: ing.name,
      percentage: content.formula.displayPercentagesPublicly ? ing.percentage : undefined,
      roleLabel: ing.role,
    })),
    statusLabel: resolveLocalized(content.disclaimers.formulaPending, locale, 'formula status'),
  };

  const recommendedDuration = {
    days: analysis.recommendedDurationDays,
    label: t(locale, 'report.duration.label', { days: analysis.recommendedDurationDays }),
    rationaleNote: t(locale, 'report.duration.rationale', {
      severity: t(locale, `severity.${analysis.severityBand}`),
      emphasis: t(locale, `report.emphasis.${analysis.planEmphasis}`),
    }),
  };

  function priceFor(days: number): Money | PendingMarker {
    const row = content.programDurations.find((d) => d.days === days);
    if (!row || row.price === null) return PENDING(`pricing — ${days} days`);
    return formatMoney(row.price, content.currency, locale);
  }
  function perDayFor(days: number): Money | PendingMarker {
    const row = content.programDurations.find((d) => d.days === days);
    if (!row || row.perDayFrom === null) return PENDING(`per-day pricing — ${days} days`);
    return formatMoney(row.perDayFrom, content.currency, locale);
  }

  const pricing = {
    duration: { days: recommendedDuration.days, label: recommendedDuration.label },
    price: priceFor(recommendedDuration.days),
    perDay: perDayFor(recommendedDuration.days),
    compareAll: content.programDurations.map((d) => ({
      days: d.days,
      label: t(locale, 'report.duration.label', { days: d.days }),
      price: priceFor(d.days),
      isRecommended: d.days === recommendedDuration.days,
    })),
  };

  const claims: ReportModel['claims'] = [
    {
      key: 'effectiveness',
      label: t(locale, 'report.claims.effectiveness.label'),
      valueLabel: content.claims.effectiveness.value === null ? PENDING('effectiveness %') : String(content.claims.effectiveness.value),
    },
    {
      key: 'timeToVisibleResults',
      label: t(locale, 'report.claims.timeToVisibleResults.label'),
      valueLabel: content.claims.timeToVisibleResults.value === null ? PENDING('time to visible results') : String(content.claims.timeToVisibleResults.value),
    },
    {
      key: 'doctorFollowUpCost',
      label: t(locale, 'report.claims.doctorFollowUpCost.label'),
      valueLabel: content.claims.doctorFollowUpCost.value === null ? PENDING('doctor follow-up cost') : String(content.claims.doctorFollowUpCost.value),
    },
  ];

  const disclaimers = {
    medical: resolveLocalized(content.disclaimers.medical, locale, 'medical disclaimer'),
    notADiagnosis: resolveLocalized(content.disclaimers.notADiagnosis, locale, 'not-a-diagnosis disclaimer'),
    demo: demoDisclaimer,
    formulaPending: resolveLocalized(content.disclaimers.formulaPending, locale, 'formula-pending disclaimer'),
  };

  const model: ReportModel = {
    meta: { reportId, generatedAt: new Date().toISOString(), locale, dir, scaleLine, demoDisclaimer },
    photos,
    analysis: { scaleLabel, scaleStrip, flagged, densityMap, metrics },
    hairLossType,
    currentSituation,
    plan: { matchedToScanBadge: t(locale, 'report.section.plan.matchedBadge'), core, supporting, formula },
    recommendedDuration,
    pricing,
    claims,
    cta: { label: t(locale, 'report.cta.label'), href: `/start?report=${reportId}` },
    disclaimers,
    pending: [],
  };

  model.pending = collectPending(model);
  return model;
}

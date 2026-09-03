import { rooteContent } from '@/content/roote.config';
import { PENDING, collectPending, type PendingMarker } from '@/content/pending';
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
  /** Optional map of asset URLs keyed by treatment/ingredient key, for product photos. */
  assets?: Record<string, string>;
}): ReportModel {
  const { diagnosis, analysis, content, locale, reportId, assets = {} } = input;
  const dir: 'ltr' | 'rtl' = locale === 'he' ? 'rtl' : 'ltr';

  const scaleLabel = t(locale, `scale.${analysis.scale}.label`);
  const scaleLine = t(locale, 'ready.teaser', {
    scale: scaleLabel,
    severity: t(locale, `severity.${analysis.severityBand}`),
    zones: analysis.flaggedZones.length,
  });
  const demoDisclaimer = resolveLocalized(content.disclaimers.demo, locale, 'demo disclaimer');

  const titles = {
    header: t(locale, 'report.header.title'),
    cover: t(locale, 'report.section.cover.title'),
    scan: t(locale, 'report.section.scan.title'),
    photos: t(locale, 'report.section.photos.title'),
    analysis: t(locale, 'report.section.analysis.title'),
    hairLossType: t(locale, 'report.section.hairLossType.title'),
    currentSituation: t(locale, 'report.section.currentSituation.title'),
    plan: t(locale, 'report.section.plan.title'),
    duration: t(locale, 'report.section.duration.title'),
    program: t(locale, 'report.section.program.title'),
    pricing: t(locale, 'report.section.pricing.title'),
    claims: t(locale, 'report.section.claims.title'),
  };

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

  const areaLabels = ALL_ZONES.filter((z) => flaggedZoneSet.has(z)).map((z) => t(locale, `zone.${z}`));
  const hairLossType = {
    // I4/R24: a composed *type label* from the already-localized severity band, not the scale
    // line (which meta.scaleLine already carries). The affected areas are shown once, as the
    // structured `areaLabels` element below — not concatenated in here as well.
    title: t(locale, 'report.hairLossType.typeLabel', {
      band: t(locale, `severity.${analysis.severityBand}`),
    }),
    areaLabels,
    // I4/R26 (option A): prior-treatment + family-history context, distinct from
    // currentSituation.paragraphs[0] (which is the summaryPlainKey line).
    patternNote: analysis.notes.map((k) => t(locale, k)).join(' '),
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
  const planLabels = {
    core: t(locale, 'report.plan.core.title'),
    supporting: t(locale, 'report.plan.supporting.title'),
    applicationFrequency: t(locale, 'report.plan.applicationFrequencyLabel'),
    appliesTo: t(locale, 'report.plan.appliesToLabel'),
  };
  const formula = {
    ingredients: content.formula.ingredients.map((ing) => ({
      name: ing.name,
      percentage: content.formula.displayPercentagesPublicly ? ing.percentage : undefined,
      // M6 (folded into I2): resolve the kebab role key to a localized functional label.
      roleLabel: t(locale, `role.${ing.role}`),
    })),
    statusLabel: resolveLocalized(content.disclaimers.formulaPending, locale, 'formula status'),
  };

  // --- Kit-style presentation groups (regimen blocks, active spotlights, expectations, FAQ) ---

  const matchedBadge = t(locale, 'report.section.plan.matchedBadge');
  const regimenBadges = t(locale, 'report.regimen.badges').split('|').filter(Boolean);

  const coreItems = content.treatments.core.map((tr): ReportModel['regimen']['items'][number] => ({
    key: tr.key,
    kind: 'core',
    name: resolveLocalized(tr.name, locale, `${tr.key} name (${locale})`),
    form: t(locale, `report.treatment.${tr.key}.form`),
    photo: assets[tr.key],
    addressesLabels: t(locale, `report.treatment.${tr.key}.addresses`).split('|').filter(Boolean),
    mechanism: [
      t(locale, `report.treatment.${tr.key}.mechanism1`),
      t(locale, `report.treatment.${tr.key}.mechanism2`),
    ].filter((s) => s && !s.startsWith('report.treatment.')),
    howToLabel: t(locale, 'report.regimen.howToApply', { frequency: t(locale, tr.frequencyKey) }),
    appliesToLabel: tr.appliesToZones.map((z) => t(locale, `zone.${z}`)).join(', '),
    badges: regimenBadges,
  }));
  const supportingItems = content.treatments.supporting.map((tr): ReportModel['regimen']['items'][number] => ({
    key: tr.key,
    kind: 'supporting',
    name: resolveLocalized(tr.name, locale, `${tr.key} name (${locale})`),
    form: t(locale, `report.treatment.${tr.key}.form`),
    photo: assets[tr.key],
    addressesLabels: t(locale, `report.treatment.${tr.key}.addresses`).split('|').filter(Boolean),
    mechanism: [t(locale, `report.treatment.${tr.key}.mechanism1`)].filter(
      (s) => s && !s.startsWith('report.treatment.'),
    ),
    howToLabel: t(locale, 'report.regimen.howToUse', { frequency: t(locale, tr.frequencyKey) }),
    badges: regimenBadges,
  }));

  const regimen = {
    badge: matchedBadge,
    title: t(locale, 'report.regimen.title'),
    items: [...coreItems, ...supportingItems],
  };

  const actives = {
    title: t(locale, 'report.actives.title'),
    note: t(locale, 'report.actives.note'),
    items: content.formula.ingredients.map((ing): ReportModel['actives']['items'][number] => ({
      key: ing.key,
      name: ing.name,
      roleLabel: t(locale, `role.${ing.role}`),
      mechanism: t(locale, `marketing.science.ingredients.evidence.${ing.role}`),
      photo: assets[ing.key],
      percentageLabel:
        content.formula.displayPercentagesPublicly && ing.percentage != null ? `${ing.percentage}%` : undefined,
    })),
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
    if (!row || row.price === null) return PENDING(`pricing: ${days} days`);
    return formatMoney(row.price, content.currency, locale);
  }
  function perDayFor(days: number): Money | PendingMarker {
    const row = content.programDurations.find((d) => d.days === days);
    if (!row || row.perDayFrom === null) return PENDING(`per-day pricing: ${days} days`);
    return formatMoney(row.perDayFrom, content.currency, locale);
  }

  const pricing = {
    duration: { days: recommendedDuration.days, label: recommendedDuration.label },
    price: priceFor(recommendedDuration.days),
    perDay: perDayFor(recommendedDuration.days),
    perDayLabel: t(locale, 'report.pricing.perDayLabel'),
    compareTitle: t(locale, 'report.pricing.compareTitle'),
    recommendedBadge: t(locale, 'report.pricing.recommendedBadge'),
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

  const expect_ = {
    title: t(locale, 'report.expect.title'),
    intro: t(locale, 'report.expect.intro'),
    stats: claims.map((c) => ({ label: c.label, value: c.valueLabel })),
    note: t(locale, 'marketing.howItWorks.timeline.shedding'),
    timeline: (['m1', 'm3', 'm6'] as const).map((k) => ({
      label: t(locale, `marketing.howItWorks.timeline.${k}`),
      outcome: PENDING(`reported change at ${k}`),
    })),
  };

  const faq = {
    title: t(locale, 'report.faq.title'),
    items: [
      { q: t(locale, 'marketing.howItWorks.faq.q1'), a: t(locale, 'marketing.howItWorks.faq.a1') },
      { q: t(locale, 'marketing.faq.plan.q1'), a: t(locale, 'marketing.faq.plan.a1') },
      { q: t(locale, 'marketing.howItWorks.faq.q2'), a: t(locale, 'marketing.howItWorks.faq.a2') },
      { q: t(locale, 'marketing.faq.ingredients.q1'), a: t(locale, 'marketing.faq.ingredients.a1') },
    ],
  };

  const model: ReportModel = {
    meta: { reportId, generatedAt: new Date().toISOString(), locale, dir, scaleLine, demoDisclaimer },
    titles,
    ribbon: t(locale, 'report.ribbon'),
    intro: { greeting: t(locale, 'report.intro.greeting'), body: t(locale, 'report.intro.body') },
    photos,
    analysis: { scaleLabel, scaleStrip, flagged, densityMap, metrics },
    hairLossType,
    currentSituation,
    plan: { matchedToScanBadge: matchedBadge, labels: planLabels, core, supporting, formula },
    regimen,
    actives,
    expect: expect_,
    faq,
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

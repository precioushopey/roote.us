import type { PendingMarker } from '@/content/pending';
import type { Money } from './money';

export type Resolved<T extends string> = T | PendingMarker;

/** One treatment presented as a product/regimen block (photo, tags, mechanism, how-to, badges). */
export type ReportRegimenItem = {
  key: string;
  kind: 'core' | 'supporting';
  name: Resolved<string>;
  form: string;
  photo?: string;
  addressesLabels: string[];
  mechanism: string[];
  howToLabel: string;
  appliesToLabel?: string;
  badges: string[];
};

/** One active-ingredient spotlight. */
export type ReportActive = {
  key: string;
  name: string;
  roleLabel: string;
  mechanism: string;
  photo?: string;
  percentageLabel?: string;
};

export type ReportModel = {
  meta: {
    reportId: string;
    generatedAt: string;          // ISO string
    locale: 'en' | 'he';
    dir: 'ltr' | 'rtl';
    scaleLine: string;             // e.g. "Norwood–Hamilton scale · Moderate pattern · 2 area(s) flagged"
    demoDisclaimer: Resolved<string>;
  };
  // Section / header headings, resolved inside buildReport so no renderer touches i18n.
  titles: {
    header: string;
    cover: string;
    scan: string;
    photos: string;
    analysis: string;
    hairLossType: string;
    currentSituation: string;
    plan: string;
    duration: string;
    program: string;
    pricing: string;
    claims: string;
  };
  ribbon: string;
  intro: { greeting: string; body: string };
  photos: { angleKey: 'front' | 'top' | 'crown' | 'hairline'; dataUrl: string; caption: string }[];
  analysis: {
    scaleLabel: string;
    scaleStrip: { stageKey: string; label: string; isCurrent: boolean }[];
    flagged: { zoneLabel: string; severityLabel: string; note: string }[];
    densityMap: { zoneLabel: string; level: 'low' | 'medium' | 'high'; levelLabel: string }[];
    metrics: { label: string; valueLabel: string; level: 'low' | 'medium' | 'high' }[];
  };
  hairLossType: { title: string; areaLabels: string[]; patternNote: string };
  currentSituation: { paragraphs: string[] };
  plan: {
    matchedToScanBadge: string;
    labels: { core: string; supporting: string; applicationFrequency: string; appliesTo: string };
    core: { name: Resolved<string>; usage: string; frequency: string; appliesToLabels: string[] }[];
    supporting: { name: Resolved<string>; usage: string; frequency: string }[];
    formula: { ingredients: { name: string; percentage?: number; roleLabel: string }[]; statusLabel: Resolved<string> } | null;
  };
  regimen: { badge: string; title: string; items: ReportRegimenItem[] };
  actives: { title: string; note: string; items: ReportActive[] };
  expect: {
    title: string;
    intro: string;
    stats: { label: string; value: Resolved<string> }[];
    note: string;
    timeline: { label: string; outcome: PendingMarker }[];
  };
  faq: { title: string; items: { q: string; a: string }[] };
  recommendedDuration: { days: number; label: string; rationaleNote: string };
  pricing: {
    duration: { days: number; label: string };
    price: Money | PendingMarker;
    perDay: Money | PendingMarker;
    perDayLabel: string;
    compareTitle: string;
    recommendedBadge: string;
    compareAll: { days: number; label: string; price: Money | PendingMarker; isRecommended: boolean }[];
  };
  claims: { key: 'effectiveness' | 'timeToVisibleResults' | 'doctorFollowUpCost'; label: string; valueLabel: string | PendingMarker }[];
  cta: { label: string; href: string };
  disclaimers: {
    medical: Resolved<string>;
    notADiagnosis: Resolved<string>;
    demo: Resolved<string>;
    formulaPending: Resolved<string>;
  };
  pending: { path: string; label: string }[];
};

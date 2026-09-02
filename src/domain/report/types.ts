import type { PendingMarker } from '@/content/pending';
import type { Money } from './money';

export type Resolved<T extends string> = T | PendingMarker;

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
    photos: string;
    analysis: string;
    hairLossType: string;
    currentSituation: string;
    plan: string;
    duration: string;
    pricing: string;
    claims: string;
  };
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

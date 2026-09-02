import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { registerReportFonts } from './fonts';
import { isPending, type PendingMarker } from '@/content/pending';
import type { ReportModel } from '@/domain/report/types';

registerReportFonts();

const COLORS = {
  background: '#F9F6EF', foreground: '#2A2320', primary: '#745F50', accent: '#8D7766',
  muted: '#6E635A', border: '#E4D9C8', card: '#FFFFFF',
};

const styles = StyleSheet.create({
  page: { backgroundColor: COLORS.background, color: COLORS.foreground, fontFamily: 'Libre Franklin', fontSize: 10, padding: 28 },
  pageHe: { fontFamily: 'Heebo' },
  header: { alignItems: 'center', marginBottom: 16, textAlign: 'center' },
  wordmark: { fontSize: 20, letterSpacing: 2, color: COLORS.primary, marginBottom: 4 },
  h1: { fontSize: 14, fontWeight: 700, marginBottom: 4 },
  muted: { color: COLORS.muted, fontSize: 9 },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 11, fontWeight: 700, marginBottom: 6, color: COLORS.primary },
  subTitle: { fontSize: 10, fontWeight: 700, marginTop: 4, marginBottom: 3 },
  row: { flexDirection: 'row', gap: 8 },
  photoBox: { width: 100, height: 90, borderRadius: 4, marginBottom: 4 },
  card: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, padding: 8, marginBottom: 6 },
  pill: { borderWidth: 1, borderColor: COLORS.accent, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 8, fontSize: 8, color: COLORS.accent, alignSelf: 'flex-start', marginBottom: 6 },
  chip: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, paddingVertical: 2, paddingHorizontal: 6, fontSize: 8, color: COLORS.muted },
  chipCurrent: { borderColor: COLORS.accent, backgroundColor: '#EFE7DB', color: COLORS.accent, fontWeight: 700 },
  pending: { borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.accent, borderRadius: 3, paddingVertical: 1, paddingHorizontal: 3, fontSize: 8, color: COLORS.accent },
  footer: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8, marginTop: 12 },
  ctaBox: { backgroundColor: COLORS.primary, borderRadius: 6, paddingVertical: 10, alignItems: 'center', marginVertical: 12 },
  ctaText: { color: COLORS.background, fontSize: 12, fontWeight: 700 },
});

// @react-pdf/layout reads `direction` (and derives text alignment from it) ONLY off a <Text>
// node's own resolved style — it is not in react-pdf's inheritable-property sets, so setting it
// on <Page> is a no-op. For an RTL model we therefore spread it (plus an explicit right align)
// into every text node. LTR renders with the bare <Text> import, byte-for-byte unchanged.
const RTL_TEXT_STYLE = { direction: 'rtl', textAlign: 'right' } as const;

function makeText(isRtl: boolean): typeof Text {
  if (!isRtl) return Text;
  const RtlText = (props: Record<string, unknown>) => {
    const { style, ...rest } = props as { style?: unknown };
    const merged = style == null
      ? RTL_TEXT_STYLE
      : Array.isArray(style)
        ? [RTL_TEXT_STYLE, ...style]
        : [RTL_TEXT_STYLE, style];
    return <Text style={merged as never} {...rest} />;
  };
  return RtlText as unknown as typeof Text;
}

export function ReportDocument({ model }: { model: ReportModel }) {
  const isRtl = model.meta.dir === 'rtl';
  const isHe = model.meta.locale === 'he';
  const dirStyle = { direction: isRtl ? 'rtl' : 'ltr' } as const;
  const langStyle = isHe ? styles.pageHe : {};
  const T = makeText(isRtl);
  const rowStyle = isRtl ? [styles.row, { flexDirection: 'row-reverse' as const }] : styles.row;

  const Pending = ({ value }: { value: PendingMarker }) => (
    <T style={styles.pending}>[PENDING: {value.label}]</T>
  );
  const TextOrPending = ({ value }: { value: string | PendingMarker }) =>
    isPending(value) ? <Pending value={value} /> : <T>{value}</T>;

  return (
    <Document>
      <Page size="A4" style={[styles.page, langStyle, dirStyle]}>
        <View style={styles.header}>
          <T style={styles.wordmark}>ROOTÉ</T>
          <T style={styles.h1}>{model.titles.header}</T>
          <T style={styles.muted}>{model.meta.scaleLine}</T>
          <T style={styles.muted}>#{model.meta.reportId}</T>
          {isPending(model.meta.demoDisclaimer)
            ? <Pending value={model.meta.demoDisclaimer} />
            : <T style={[styles.pending, { marginTop: 4 }]}>{model.meta.demoDisclaimer}</T>}
        </View>

        <View style={styles.section}>
          <T style={styles.sectionTitle}>{model.titles.photos}</T>
          <View style={rowStyle}>
            {model.photos.map((p) => (
              <View key={p.angleKey}>
                <Image src={p.dataUrl} style={styles.photoBox} />
                <T style={styles.muted}>{p.caption}</T>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <T style={styles.sectionTitle}>{model.titles.analysis}</T>
          <T style={styles.muted}>{model.analysis.scaleLabel}</T>
          <View style={[rowStyle, { flexWrap: 'wrap', marginTop: 4, marginBottom: 4 }]}>
            {model.analysis.scaleStrip.map((s) => (
              <T key={s.stageKey} style={[styles.chip, s.isCurrent && styles.chipCurrent]}>{s.stageKey}</T>
            ))}
          </View>
          {model.analysis.flagged.map((f, i) => (
            <View key={i} style={styles.card}>
              <T style={{ fontWeight: 700 }}>{f.zoneLabel}</T>
              <T style={styles.muted}>{f.severityLabel}: {f.note}</T>
            </View>
          ))}
          {model.analysis.densityMap.map((d, i) => (
            <View key={`density-${i}`} style={rowStyle}>
              <T style={{ flex: 1 }}>{d.zoneLabel}</T>
              <T style={styles.muted}>{d.levelLabel}</T>
            </View>
          ))}
          {model.analysis.metrics.map((m, i) => (
            <View key={`metric-${i}`} style={rowStyle}>
              <T style={{ flex: 1 }}>{m.label}</T>
              <T style={styles.muted}>{m.valueLabel}</T>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <T style={styles.sectionTitle}>{model.titles.hairLossType}</T>
          <T>{model.hairLossType.title}</T>
          <T style={styles.muted}>{model.hairLossType.areaLabels.join(' · ')}</T>
          <T style={styles.muted}>{model.hairLossType.patternNote}</T>
        </View>

        <View style={styles.section}>
          <T style={styles.sectionTitle}>{model.titles.currentSituation}</T>
          {model.currentSituation.paragraphs.map((p, i) => (
            <T key={i} style={styles.muted}>{p}</T>
          ))}
        </View>

        <View style={styles.section}>
          <T style={styles.sectionTitle}>{model.titles.plan}</T>
          <T style={styles.pill}>{model.plan.matchedToScanBadge}</T>

          <T style={styles.subTitle}>{model.plan.labels.core}</T>
          {model.plan.core.map((tr, i) => (
            <View key={i} style={styles.card}>
              <TextOrPending value={tr.name} />
              <T style={styles.muted}>{tr.usage}</T>
              <T style={styles.muted}>
                {model.plan.labels.applicationFrequency}: {tr.frequency} · {model.plan.labels.appliesTo}: {tr.appliesToLabels.join(', ')}
              </T>
            </View>
          ))}

          <T style={styles.subTitle}>{model.plan.labels.supporting}</T>
          {model.plan.supporting.map((tr, i) => (
            <View key={i} style={styles.card}>
              <TextOrPending value={tr.name} />
              <T style={styles.muted}>{tr.usage}</T>
              <T style={styles.muted}>{model.plan.labels.applicationFrequency}: {tr.frequency}</T>
            </View>
          ))}

          {model.plan.formula && (
            <View style={{ marginTop: 4 }}>
              {model.plan.formula.ingredients.map((ing, i) => (
                <T key={i} style={styles.muted}>
                  {ing.name}: {ing.roleLabel}{ing.percentage != null ? ` (${ing.percentage}%)` : ''}
                </T>
              ))}
              <View style={{ marginTop: 2 }}>
                <TextOrPending value={model.plan.formula.statusLabel} />
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <T style={styles.sectionTitle}>{model.titles.duration}</T>
          <T style={{ fontSize: 16, fontWeight: 700 }}>{model.recommendedDuration.label}</T>
          <T style={styles.muted}>{model.recommendedDuration.rationaleNote}</T>
        </View>

        <View style={styles.section}>
          <T style={styles.sectionTitle}>{model.titles.pricing}</T>
          <View style={rowStyle}>
            <TextOrPending value={isPending(model.pricing.price) ? model.pricing.price : model.pricing.price.formatted} />
          </View>
          {isPending(model.pricing.perDay)
            ? <Pending value={model.pricing.perDay} />
            : <T style={styles.muted}>{model.pricing.perDay.formatted} {model.pricing.perDayLabel}</T>}
          <T style={[styles.muted, { marginTop: 4 }]}>{model.pricing.compareTitle}</T>
          {model.pricing.compareAll.map((row) => (
            <View key={row.days} style={rowStyle}>
              <T style={{ flex: 1 }}>{row.label}{row.isRecommended ? ` · ${model.pricing.recommendedBadge}` : ''}</T>
              <TextOrPending value={isPending(row.price) ? row.price : row.price.formatted} />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <T style={styles.sectionTitle}>{model.titles.claims}</T>
          <View style={rowStyle}>
            {model.claims.map((c) => (
              <View key={c.key} style={[styles.card, { flex: 1 }]}>
                <T style={styles.muted}>{c.label}</T>
                <TextOrPending value={c.valueLabel} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.ctaBox}>
          <T style={styles.ctaText}>{model.cta.label}</T>
        </View>

        <View style={styles.footer}>
          <TextOrPending value={model.disclaimers.medical} />
          <TextOrPending value={model.disclaimers.notADiagnosis} />
          <TextOrPending value={model.disclaimers.demo} />
          <TextOrPending value={model.disclaimers.formulaPending} />
        </View>
      </Page>
    </Document>
  );
}

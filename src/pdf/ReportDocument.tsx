import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { registerReportFonts } from './fonts';
import { isPending } from '@/content/pending';
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
  row: { flexDirection: 'row', gap: 8 },
  photoBox: { width: 100, height: 90, borderRadius: 4, marginBottom: 4 },
  card: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, padding: 8, marginBottom: 6 },
  pill: { borderWidth: 1, borderColor: COLORS.accent, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 8, fontSize: 8, color: COLORS.accent, alignSelf: 'flex-start', marginBottom: 6 },
  pending: { borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.accent, borderRadius: 3, paddingVertical: 1, paddingHorizontal: 3, fontSize: 8, color: COLORS.accent },
  footer: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8, marginTop: 12 },
  ctaBox: { backgroundColor: COLORS.primary, borderRadius: 6, paddingVertical: 10, alignItems: 'center', marginVertical: 12 },
  ctaText: { color: COLORS.background, fontSize: 12, fontWeight: 700 },
});

function Pending({ value }: { value: { __pending: true; label: string } }) {
  return <Text style={styles.pending}>[PENDING: {value.label}]</Text>;
}

function TextOrPending({ value }: { value: string | { __pending: true; label: string } }) {
  return isPending(value) ? <Pending value={value} /> : <Text>{value}</Text>;
}

export function ReportDocument({ model }: { model: ReportModel }) {
  const isRtl = model.meta.dir === 'rtl';
  const dirStyle = { direction: isRtl ? 'rtl' : 'ltr' } as const;
  const langStyle = isRtl ? styles.pageHe : {};

  return (
    <Document>
      <Page size="A4" style={[styles.page, langStyle, dirStyle]}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>ROOTÉ</Text>
          <Text style={styles.h1}>Personalized Hair Report</Text>
          <Text style={styles.muted}>{model.meta.scaleLine}</Text>
          <Text style={styles.muted}>#{model.meta.reportId}</Text>
          <Text style={[styles.pending, { marginTop: 4 }]}>{model.meta.demoDisclaimer}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Photos</Text>
          <View style={styles.row}>
            {model.photos.map((p) => (
              <View key={p.angleKey}>
                <Image src={p.dataUrl} style={styles.photoBox} />
                <Text style={styles.muted}>{p.caption}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Analysis</Text>
          {model.analysis.flagged.map((f, i) => (
            <View key={i} style={styles.card}>
              <Text style={{ fontWeight: 700 }}>{f.zoneLabel}</Text>
              <Text style={styles.muted}>{f.severityLabel} — {f.note}</Text>
            </View>
          ))}
          {model.analysis.metrics.map((m, i) => (
            <View key={i} style={styles.row}>
              <Text style={{ flex: 1 }}>{m.label}</Text>
              <Text style={styles.muted}>{m.valueLabel}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hair Loss Type</Text>
          <Text>{model.hairLossType.title}</Text>
          <Text style={styles.muted}>{model.hairLossType.areaLabels.join(' · ')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Situation</Text>
          {model.currentSituation.paragraphs.map((p, i) => (
            <Text key={i} style={styles.muted}>{p}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Personalized Treatment Plan</Text>
          <Text style={styles.pill}>{model.plan.matchedToScanBadge}</Text>
          {model.plan.core.map((tr, i) => (
            <View key={i} style={styles.card}>
              <TextOrPending value={tr.name} />
              <Text style={styles.muted}>{tr.usage}</Text>
              <Text style={styles.muted}>{tr.frequency} · {tr.appliesToLabels.join(', ')}</Text>
            </View>
          ))}
          {model.plan.supporting.map((tr, i) => (
            <View key={i} style={styles.card}>
              <TextOrPending value={tr.name} />
              <Text style={styles.muted}>{tr.usage} · {tr.frequency}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Program Duration</Text>
          <Text style={{ fontSize: 16, fontWeight: 700 }}>{model.recommendedDuration.label}</Text>
          <Text style={styles.muted}>{model.recommendedDuration.rationaleNote}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.row}>
            <TextOrPending value={isPending(model.pricing.price) ? model.pricing.price : model.pricing.price.formatted} />
          </View>
          {model.pricing.compareAll.map((row) => (
            <View key={row.days} style={styles.row}>
              <Text style={{ flex: 1 }}>{row.label}{row.isRecommended ? ' ★' : ''}</Text>
              <TextOrPending value={isPending(row.price) ? row.price : row.price.formatted} />
            </View>
          ))}
        </View>

        <View style={styles.row}>
          {model.claims.map((c) => (
            <View key={c.key} style={[styles.card, { flex: 1 }]}>
              <Text style={styles.muted}>{c.label}</Text>
              <TextOrPending value={c.valueLabel} />
            </View>
          ))}
        </View>

        <View style={styles.ctaBox}>
          <Text style={styles.ctaText}>{model.cta.label}</Text>
        </View>

        <View style={styles.footer}>
          <TextOrPending value={model.disclaimers.medical} />
          <TextOrPending value={model.disclaimers.notADiagnosis} />
          <Text style={styles.muted}>{model.disclaimers.demo}</Text>
          <TextOrPending value={model.disclaimers.formulaPending} />
        </View>
      </Page>
    </Document>
  );
}

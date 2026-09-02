// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';
import { Font, pdf } from '@react-pdf/renderer';
import { ReportDocument } from './ReportDocument';
import { buildReport } from '@/domain/report/buildReport';
import { rooteContent } from '@/content/roote.config';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import type { Answers, Gender } from '@/domain/analysis/types';
import type { SessionState } from '@/store/sessionStore';
import type { ReportModel } from '@/domain/report/types';

vi.mock('./fonts', () => ({ registerReportFonts: () => {} }));

const require = createRequire(import.meta.url);
Font.register({
  family: 'Libre Franklin',
  fonts: [
    { src: require.resolve('@expo-google-fonts/libre-franklin/400Regular/LibreFranklin_400Regular.ttf'), fontWeight: 400 },
    { src: require.resolve('@expo-google-fonts/libre-franklin/700Bold/LibreFranklin_700Bold.ttf'), fontWeight: 700 },
  ],
});
Font.register({
  family: 'Heebo',
  fonts: [
    { src: require.resolve('@expo-google-fonts/heebo/400Regular/Heebo_400Regular.ttf'), fontWeight: 400 },
    { src: require.resolve('@expo-google-fonts/heebo/700Bold/Heebo_700Bold.ttf'), fontWeight: 700 },
  ],
});

const ONE_PX_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

function persona(gender: Gender, answers: Answers, locale: 'en' | 'he' = 'en') {
  const diagnosis: SessionState['diagnosis'] = {
    gender,
    photos: [{ id: 'p1', angleKey: 'front', thumb: ONE_PX_PNG, blobId: 'b1' }],
    answers,
  };
  const analysis = deriveAnalysis({ gender, answers });
  return buildReport({ diagnosis, analysis, content: rooteContent, locale, reportId: 'rep-pdf' });
}

async function toBytes(node: any): Promise<Buffer> {
  const stream = await pdf(node).toBuffer();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

/**
 * Inflate the PDF's page *content* streams — the ones carrying text-positioning (`cm`, `Td`)
 * and glyph-show (`TJ`) operators — and concatenate them. Those are deterministic for a given
 * model. Everything else is skipped on purpose: document metadata (CreationDate / file ID)
 * lives in uncompressed trailer objects, and the embedded font *subset* programs carry the
 * TrueType `head` table's created/modified timestamps, so they differ between two renders of
 * the identical model. A content stream is recognised by containing a `BT` text block plus
 * `Tf`/`TJ` operators; a font program never does.
 */
function contentStreams(buf: Buffer): string {
  const parts: string[] = [];
  let i = 0;
  for (;;) {
    const s = buf.indexOf('stream', i);
    if (s === -1) break;
    let start = s + 'stream'.length;
    if (buf[start] === 0x0d) start += 1;
    if (buf[start] === 0x0a) start += 1;
    const e = buf.indexOf('endstream', start);
    if (e === -1) break;
    try {
      const text = zlib.inflateSync(buf.subarray(start, e)).toString('latin1');
      if (text.includes('BT') && text.includes(' Tf') && text.includes(' TJ')) parts.push(text);
    } catch {
      /* not a flate stream (image bytes) — skip */
    }
    i = e + 'endstream'.length;
  }
  return parts.join('\n');
}

const countTJ = (buf: Buffer) => (contentStreams(buf).match(/ TJ\b/g) ?? []).length;

const personas = [
  { name: 'mild male hairline', gender: 'male' as const, answers: { q1_area: 'hairline', q2_onset: 'lt-1y', q3_prior: 'never', q4_family: 'no', q5_goal: 'stop' } as Answers },
  { name: 'established male entire-scalp', gender: 'male' as const, answers: { q1_area: 'entire-scalp', q2_onset: 'gt-5y', q3_prior: 'no-success', q4_family: 'yes', q5_goal: 'both' } as Answers },
  { name: 'mild female crown', gender: 'female' as const, answers: { q1_area: 'crown', q2_onset: 'lt-1y', q3_prior: 'partial', q4_family: 'not-sure', q5_goal: 'regrow' } as Answers },
];

describe('ReportDocument (PDF)', () => {
  // Real font embedding + A4 layout via @react-pdf/renderer is slow, and gets slower still under
  // full-suite parallel load (many Vitest workers competing for CPU) — the default 5000ms timeout
  // is comfortable in isolation but flakes under `pnpm test`. 20s gives real headroom either way.
  it.each(personas)('renders to a non-empty buffer for $name', async ({ gender, answers }) => {
    const model = persona(gender, answers);
    const full = await toBytes(<ReportDocument model={model} />);
    expect(full.length).toBeGreaterThan(1000);
    expect(full.subarray(0, 4).toString()).toBe('%PDF');
  }, 20000);

  // I1 — the PDF must actually honour dir === 'rtl'. @react-pdf/layout reads `direction` (and
  // derives text alignment from it) only off a <Text> node's own resolved style, never inherited
  // from <Page>. Before the fix, a genuine he-locale model rendered byte-for-byte identically to
  // the same Hebrew text laid out LTR. This asserts the RTL layout is now really different — and
  // that the content stream is deterministic, so that difference is signal, not metadata noise.
  it('right-aligns / RTL-orders every text node for a real he-locale model (I1)', async () => {
    const heModel = persona('male', { q1_area: 'hairline', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'no', q5_goal: 'both' } as Answers, 'he');

    // Sanity: this really is a Hebrew document. The previous test patched meta onto an `en`
    // model, so the document under test contained zero Hebrew characters.
    expect(heModel.meta.dir).toBe('rtl');
    expect(heModel.meta.scaleLine).toMatch(/[֐-׿]/);
    expect(heModel.titles.plan).toMatch(/[֐-׿]/);

    const heLtr: ReportModel = { ...heModel, meta: { ...heModel.meta, dir: 'ltr' } };

    const rtlA = await toBytes(<ReportDocument model={heModel} />);
    const rtlB = await toBytes(<ReportDocument model={heModel} />);
    const ltr = await toBytes(<ReportDocument model={heLtr} />);

    expect(rtlA.subarray(0, 4).toString()).toBe('%PDF');

    const rtlTextA = contentStreams(rtlA);
    const rtlTextB = contentStreams(rtlB);
    const ltrText = contentStreams(ltr);

    // Same Hebrew text + same embedded Heebo font both times: the content stream is deterministic.
    expect(rtlTextA).toBe(rtlTextB);
    // ...and RTL vs LTR now genuinely differ (this equality held before the fix).
    expect(rtlTextA).not.toBe(ltrText);
    expect(rtlTextA.length).not.toBe(ltrText.length);
  }, 20000);

  // I2 — the PDF must carry the customer's stage strip, per-zone density map, the formula's
  // actives (name + role) and the per-day price. Removing those fields from the model must
  // visibly reduce the text drawn into the document.
  it('includes the stage strip, density map, formula actives and per-day price (I2)', async () => {
    const model = persona('male', { q1_area: 'entire-scalp', q2_onset: 'gt-5y', q3_prior: 'no-success', q4_family: 'yes', q5_goal: 'both' } as Answers);
    expect(model.analysis.scaleStrip.length).toBeGreaterThan(0);
    expect(model.analysis.densityMap).toHaveLength(4);
    expect(model.plan.formula?.ingredients.length).toBe(4);
    // roleLabel must be a resolved label, never the raw kebab key (M6).
    for (const ing of model.plan.formula!.ingredients) {
      expect(ing.roleLabel).not.toMatch(/-/);
      expect(ing.roleLabel.length).toBeGreaterThan(0);
    }

    const stripped: ReportModel = {
      ...model,
      analysis: { ...model.analysis, scaleStrip: [], densityMap: [] },
      plan: { ...model.plan, formula: null },
    };
    const full = await toBytes(<ReportDocument model={model} />);
    const less = await toBytes(<ReportDocument model={stripped} />);
    expect(countTJ(full)).toBeGreaterThan(countTJ(less));

    // Per-day price: a resolved figure renders differently from the PENDING marker.
    const withPerDay: ReportModel = {
      ...model,
      pricing: { ...model.pricing, perDay: { amount: 1.5, currency: 'ILS', formatted: 'NIS 1.50' } },
    };
    const pendingPerDay = contentStreams(await toBytes(<ReportDocument model={model} />));
    const resolvedPerDay = contentStreams(await toBytes(<ReportDocument model={withPerDay} />));
    expect(pendingPerDay).not.toBe(resolvedPerDay);
  }, 20000);

  // I3 — every section heading comes from the model (buildReport resolves them from i18n); the
  // PDF must not hardcode English. A he model's headings must reach the document as Hebrew.
  it('takes all section headings from model.titles, not hardcoded strings (I3)', async () => {
    const en = persona('male', { q1_area: 'hairline', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'no', q5_goal: 'both' } as Answers, 'en');
    const he = persona('male', { q1_area: 'hairline', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'no', q5_goal: 'both' } as Answers, 'he');
    expect(en.titles.claims).toBe('Effectiveness & Expectations');
    expect(he.titles.claims).toMatch(/[֐-׿]/);
    // The two documents differ because the headings (and all other copy) are localised.
    const enText = contentStreams(await toBytes(<ReportDocument model={en} />));
    const heText = contentStreams(await toBytes(<ReportDocument model={he} />));
    expect(enText).not.toBe(heText);
  }, 20000);
});

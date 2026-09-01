// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { createRequire } from 'node:module';
import { Font, pdf } from '@react-pdf/renderer';
import { ReportDocument } from './ReportDocument';
import { buildReport } from '@/domain/report/buildReport';
import { rooteContent } from '@/content/roote.config';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import type { Answers, Gender } from '@/domain/analysis/types';
import type { SessionState } from '@/store/sessionStore';

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

function persona(gender: Gender, answers: Answers) {
  const diagnosis: SessionState['diagnosis'] = {
    gender,
    photos: [{ id: 'p1', angleKey: 'front', thumb: ONE_PX_PNG, blobId: 'b1' }],
    answers,
  };
  const analysis = deriveAnalysis({ gender, answers });
  return buildReport({ diagnosis, analysis, content: rooteContent, locale: 'en', reportId: 'rep-pdf' });
}

const personas = [
  { name: 'mild male hairline', gender: 'male' as const, answers: { q1_area: 'hairline', q2_onset: 'lt-1y', q3_prior: 'never', q4_family: 'no', q5_goal: 'stop' } as Answers },
  { name: 'established male entire-scalp', gender: 'male' as const, answers: { q1_area: 'entire-scalp', q2_onset: 'gt-5y', q3_prior: 'no-success', q4_family: 'yes', q5_goal: 'both' } as Answers },
  { name: 'mild female crown', gender: 'female' as const, answers: { q1_area: 'crown', q2_onset: 'lt-1y', q3_prior: 'partial', q4_family: 'not-sure', q5_goal: 'regrow' } as Answers },
];

describe('ReportDocument (PDF)', () => {
  it.each(personas)('renders to a non-empty buffer for $name', async ({ gender, answers }) => {
    const model = persona(gender, answers);
    const buffer = await pdf(<ReportDocument model={model} />).toBuffer();
    const chunks: Buffer[] = [];
    for await (const chunk of buffer) chunks.push(chunk as Buffer);
    const full = Buffer.concat(chunks);
    expect(full.length).toBeGreaterThan(1000);
    expect(full.subarray(0, 4).toString()).toBe('%PDF');
  });

  it('renders the Hebrew locale without throwing', async () => {
    const model = persona('male', { q1_area: 'hairline', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'no', q5_goal: 'both' } as Answers);
    const heModel = { ...model, meta: { ...model.meta, locale: 'he' as const, dir: 'rtl' as const } };
    const buffer = await pdf(<ReportDocument model={heModel} />).toBuffer();
    const chunks: Buffer[] = [];
    for await (const chunk of buffer) chunks.push(chunk as Buffer);
    expect(Buffer.concat(chunks).length).toBeGreaterThan(1000);
  });
});

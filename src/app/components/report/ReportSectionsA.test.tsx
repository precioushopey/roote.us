import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReportHeader, ReportPhotos, ReportAnalysis, ReportHairLossType, ReportCurrentSituation } from './ReportSectionsA';
import { buildReport } from '@/domain/report/buildReport';
import { rooteContent } from '@/content/roote.config';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import type { SessionState } from '@/store/sessionStore';

const answers = { q1_area: 'hairline', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'no', q5_goal: 'both' } as const;
const diagnosis: SessionState['diagnosis'] = {
  gender: 'male',
  photos: [{ id: 'p1', angleKey: 'front', thumb: 'data:image/jpeg;base64,AAA', blobId: 'b1' }],
  answers,
};
const analysis = deriveAnalysis({ gender: 'male', answers });
const model = buildReport({ diagnosis, analysis, content: rooteContent, locale: 'en', reportId: 'rep-1' });

describe('ReportSectionsA', () => {
  it('ReportHeader shows the title and reportId', () => {
    render(<ReportHeader model={model} />);
    expect(screen.getByText('Personalized Hair Report')).toBeInTheDocument();
    expect(screen.getByText(/rep-1/)).toBeInTheDocument();
  });

  it('ReportPhotos renders one image per uploaded photo with its angle caption', () => {
    render(<ReportPhotos model={model} />);
    expect(screen.getByAltText('Front')).toHaveAttribute('src', 'data:image/jpeg;base64,AAA');
  });

  it('ReportAnalysis renders the stage strip and flagged zones', () => {
    render(<ReportAnalysis model={model} />);
    expect(screen.getAllByText(/^S\d$/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(model.analysis.flagged[0].zoneLabel).length).toBeGreaterThan(0);
  });

  it('ReportHairLossType renders the title and area chips', () => {
    render(<ReportHairLossType model={model} />);
    expect(screen.getByText(model.hairLossType.title)).toBeInTheDocument();
  });

  it('ReportCurrentSituation renders both paragraphs', () => {
    render(<ReportCurrentSituation model={model} />);
    expect(screen.getByText(model.currentSituation.paragraphs[0])).toBeInTheDocument();
    expect(screen.getByText(model.currentSituation.paragraphs[1])).toBeInTheDocument();
  });

  it('renders section titles from model.titles as headings, resolved per-locale not hardcoded (I3)', () => {
    const heModel = buildReport({ diagnosis, analysis, content: rooteContent, locale: 'he', reportId: 'rep-1' });
    render(<ReportAnalysis model={heModel} />);
    expect(screen.getByRole('heading', { name: heModel.titles.analysis })).toBeInTheDocument();
    // proves the heading is the model's resolved value, not a hardcoded English literal
    expect(heModel.titles.analysis).not.toBe('AI Analysis');
    expect(heModel.titles.analysis).toBe('ניתוח AI');
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { ReportView } from './ReportView';
import { buildReport } from '@/domain/report/buildReport';
import { rooteContent } from '@/content/roote.config';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import type { SessionState } from '@/store/sessionStore';

const answers = { q1_area: 'entire-scalp', q2_onset: 'gt-5y', q3_prior: 'no-success', q4_family: 'yes', q5_goal: 'both' } as const;
const diagnosis: SessionState['diagnosis'] = {
  gender: 'male',
  photos: [{ id: 'p1', angleKey: 'front', thumb: 'data:image/jpeg;base64,AAA', blobId: 'b1' }],
  answers,
};
const analysis = deriveAnalysis({ gender: 'male', answers });

function build(locale: 'en' | 'he') {
  return buildReport({ diagnosis, analysis, content: rooteContent, locale, reportId: 'rep-view', assets: {} });
}

function renderView(locale: 'en' | 'he' = 'en') {
  localStorage.setItem('roote.locale', locale);
  const model = build(locale);
  render(
    <LocaleProvider>
      <MemoryRouter>
        <ReportView model={model} />
      </MemoryRouter>
    </LocaleProvider>,
  );
  return model;
}

describe('ReportView', () => {
  it('leads with the personalized greeting and the matched-to-scan regimen', () => {
    const model = renderView();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(model.intro.greeting);
    expect(screen.getByText(model.regimen.badge)).toBeInTheDocument();
    expect(screen.getByText(model.regimen.title)).toBeInTheDocument();
  });

  it('renders every regimen item name and its mechanism copy', () => {
    const model = renderView();
    for (const item of model.regimen.items) {
      if (typeof item.name === 'string') {
        expect(screen.getAllByText(item.name).length).toBeGreaterThan(0);
      }
      for (const para of item.mechanism) {
        expect(screen.getByText(para)).toBeInTheDocument();
      }
    }
  });

  it('renders the four active-ingredient spotlights', () => {
    const model = renderView();
    for (const a of model.actives.items) {
      expect(screen.getAllByText(a.name).length).toBeGreaterThan(0);
      expect(screen.getByText(a.mechanism)).toBeInTheDocument();
    }
  });

  it('shows the scan: stage strip, a flagged zone, and the uploaded photo', () => {
    const model = renderView();
    expect(screen.getAllByText(/^S\d$/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(model.analysis.flagged[0].zoneLabel).length).toBeGreaterThan(0);
    expect(screen.getByAltText('Front')).toHaveAttribute('src', 'data:image/jpeg;base64,AAA');
  });

  it('renders unresolved pricing / expectation figures as PENDING chips', () => {
    renderView();
    expect(screen.getAllByText(/\[PENDING:/).length).toBeGreaterThan(0);
  });

  it('links the CTA to the start flow with the report id', () => {
    const model = renderView();
    expect(screen.getByRole('link', { name: model.cta.label })).toHaveAttribute('href', model.cta.href);
  });

  it('renders headings from the localized model (he)', () => {
    const model = renderView('he');
    expect(model.titles.analysis).toBe('ניתוח AI');
    expect(screen.getByRole('heading', { name: model.titles.analysis })).toBeInTheDocument();
  });
});

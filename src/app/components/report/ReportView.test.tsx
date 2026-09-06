import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { ReportView } from './ReportView';
import { buildReport } from '@/domain/report/buildReport';
import { rooteContent } from '@/content/roote.config';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import { recommend } from '@/domain/recommendation/recommend';
import { deriveGrayProfile, type GrayAnswers } from '@/domain/analysis/grayProfile';
import type { SessionState } from '@/store/sessionStore';

const answers = { q1_area: 'entire-scalp', q2_onset: 'gt-5y', q3_prior: 'no-success', q4_family: 'yes', q5_goal: 'both' } as const;
const diagnosis: Pick<SessionState['diagnosis'], 'gender' | 'concern' | 'photos' | 'answers'> = {
  gender: 'male',
  concern: 'thinning',
  photos: [{ id: 'p1', angleKey: 'front', thumb: 'data:image/jpeg;base64,AAA', blobId: 'b1' }],
  answers,
};
const analysis = deriveAnalysis({ gender: 'male', answers });
const rec = recommend({
  concern: 'thinning',
  gender: 'male',
  severityBand: analysis.severityBand,
  planEmphasis: analysis.planEmphasis,
  recommendedDurationDays: analysis.recommendedDurationDays,
});

function build(locale: 'en' | 'he') {
  return buildReport({ diagnosis, analysis, content: rooteContent, locale, reportId: 'rep-view' });
}

function renderView(locale: 'en' | 'he' = 'en', gray = false) {
  const model = build(locale);
  const region = locale === 'he' ? 'he-il' : 'en-us';
  render(
    <MemoryRouter>
      <LocaleProvider localeRegion={region}>
        <ReportView
          model={model}
          recommendation={rec}
          grayProfile={
            gray
              ? deriveGrayProfile({
                  answers: { g1_onset: '1-5y', g2_area: 'crown', g3_pace: 'steady', g4_color: 'no', g5_goal: 'both' } as GrayAnswers,
                })
              : null
          }
        />
      </LocaleProvider>
    </MemoryRouter>,
  );
  return model;
}

describe('ReportView', () => {
  it('leads with the personalized greeting and a numbered medical-summary layout', () => {
    const model = renderView();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(model.intro.greeting);
    expect(screen.getByText(model.plan.matchedToScanBadge)).toBeInTheDocument();
    // numbered sections
    expect(screen.getByRole('heading', { name: model.titles.plan })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: model.titles.pricing })).toBeInTheDocument();
  });

  it('lists the personalized plan treatments (not a marketing regimen block)', () => {
    const model = renderView();
    for (const it of model.plan.core) {
      if (typeof it.name === 'string') expect(screen.getAllByText(it.name).length).toBeGreaterThan(0);
    }
  });

  it('shows the scan stage strip and the uploaded photo', () => {
    renderView();
    expect(screen.getAllByText(/^S\d$/).length).toBeGreaterThan(0);
    expect(screen.getByAltText('Front')).toHaveAttribute('src', 'data:image/jpeg;base64,AAA');
  });

  it('renders unresolved pricing figures as PENDING chips, never invented numbers', () => {
    renderView();
    expect(screen.getAllByText(/\[PENDING:/).length).toBeGreaterThan(0);
  });

  it('states the medical-review requirement for a Density plan', () => {
    renderView();
    expect(screen.getByText(/prescription-strength component/i)).toBeInTheDocument();
  });

  it('adds a gray profile section only when a gray profile is supplied', () => {
    renderView('en', false);
    expect(screen.queryByRole('heading', { name: 'Gray profile' })).not.toBeInTheDocument();
    document.body.innerHTML = '';
    renderView('en', true);
    expect(screen.getByRole('heading', { name: 'Gray profile' })).toBeInTheDocument();
  });

  it('links the CTA to the program flow with the report id', () => {
    const model = renderView();
    expect(screen.getByRole('link', { name: model.cta.label })).toHaveAttribute('href', `/en-us${model.cta.href}`);
    expect(model.cta.href).toContain('/program?report=');
  });

  it('renders headings from the localized model (he)', () => {
    const model = renderView('he');
    expect(screen.getByRole('heading', { name: model.titles.analysis })).toBeInTheDocument();
  });
});

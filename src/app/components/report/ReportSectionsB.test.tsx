import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReportPlan, ReportDuration, ReportPricing, ReportClaims, ReportCta, ReportFooter } from './ReportSectionsB';
import { buildReport } from '@/domain/report/buildReport';
import { rooteContent } from '@/content/roote.config';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import type { SessionState } from '@/store/sessionStore';

const answers = { q1_area: 'hairline', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'no', q5_goal: 'both' } as const;
const diagnosis: SessionState['diagnosis'] = { gender: 'male', photos: [], answers };
const analysis = deriveAnalysis({ gender: 'male', answers });
const model = buildReport({ diagnosis, analysis, content: rooteContent, locale: 'en', reportId: 'rep-2' });

describe('ReportSectionsB', () => {
  it('ReportPlan shows the matched badge and the core treatment', () => {
    render(<ReportPlan model={model} />);
    expect(screen.getByText('MATCHED TO YOUR SCAN')).toBeInTheDocument();
    expect(screen.getByText(model.plan.core[0].usage)).toBeInTheDocument();
  });

  it('ReportDuration shows the recommended days and rationale', () => {
    render(<ReportDuration model={model} />);
    expect(screen.getByText(model.recommendedDuration.label)).toBeInTheDocument();
    expect(screen.getByText(model.recommendedDuration.rationaleNote)).toBeInTheDocument();
  });

  it('ReportPricing renders a PENDING chip for the unresolved price', () => {
    render(<ReportPricing model={model} />);
    expect(screen.getAllByText(/\[PENDING:/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(model.pricing.compareAll[0].label).length).toBeGreaterThan(0);
  });

  it('ReportClaims renders all three stat tiles as PENDING', () => {
    render(<ReportClaims model={model} />);
    expect(screen.getAllByText(/\[PENDING:/).length).toBe(3);
  });

  it('ReportCta renders a link to the start flow', () => {
    render(<ReportCta model={model} />);
    const link = screen.getByRole('link', { name: 'Start My Program' });
    expect(link).toHaveAttribute('href', model.cta.href);
  });

  it('ReportFooter shows the demo and formulaPending disclaimers as real text, and a PENDING chip for the empty-he medical disclaimer', () => {
    render(<ReportFooter model={model} />);
    expect(screen.getByText(model.disclaimers.demo)).toBeInTheDocument();
  });
});

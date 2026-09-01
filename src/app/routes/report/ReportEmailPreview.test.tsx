import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { ReportEmailPreview } from './ReportEmailPreview';
import { buildReport } from '@/domain/report/buildReport';
import { rooteContent } from '@/content/roote.config';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import type { SessionState } from '@/store/sessionStore';

const answers = { q1_area: 'hairline', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'no', q5_goal: 'both' } as const;
const diagnosis: SessionState['diagnosis'] = { gender: 'male', photos: [], answers };
const analysis = deriveAnalysis({ gender: 'male', answers });
const model = buildReport({ diagnosis, analysis, content: rooteContent, locale: 'en', reportId: 'rep-3' });

describe('ReportEmailPreview', () => {
  it('renders the subject, intro, and a link to the full report', () => {
    localStorage.setItem('roote.locale', 'en');
    render(<LocaleProvider><ReportEmailPreview model={model} /></LocaleProvider>);
    expect(screen.getByText('Your ROOTÉ Hair Analysis Report')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View my full report' })).toHaveAttribute('href', `/report/${model.meta.reportId}`);
  });
});

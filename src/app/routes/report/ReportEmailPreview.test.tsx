import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { ReportEmailPreview } from './ReportEmailPreview';
import { buildReport } from '@/domain/report/buildReport';
import { rooteContent } from '@/content/roote.config';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import type { SessionState } from '@/store/sessionStore';

const answers = { q1_area: 'hairline', q2_onset: '1-3y', q3_prior: 'never', q4_family: 'no', q13_progression: 'gradual' } as const;
const diagnosis: Pick<SessionState['diagnosis'], 'gender' | 'hairGoal' | 'photos' | 'answers'> = {
  gender: 'male',
  hairGoal: 'stop-loss',
  photos: [],
  answers,
};
const analysis = deriveAnalysis({ gender: 'male', hairGoal: 'stop-loss', answers });
const model = buildReport({ diagnosis, analysis, content: rooteContent, locale: 'en', reportId: 'rep-3' });

describe('ReportEmailPreview', () => {
  it('renders the subject, intro, and a link to the full report', () => {
    render(
      <MemoryRouter>
        <LocaleProvider localeRegion="en-us">
          <ReportEmailPreview model={model} />
        </LocaleProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Your Hair Analysis Report')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View my full report' })).toHaveAttribute('href', `/report/${model.meta.reportId}`);
  });
});

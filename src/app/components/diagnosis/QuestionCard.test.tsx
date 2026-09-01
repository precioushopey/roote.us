import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { QUESTIONS } from './questions';
import { QuestionCard } from './QuestionCard';

describe('questions data', () => {
  it('has the five brief questions with the expected ids and option values', () => {
    expect(QUESTIONS.map((q) => q.id)).toEqual(['q1_area', 'q2_onset', 'q3_prior', 'q4_family', 'q5_goal']);
    expect(QUESTIONS[0].options.map((o) => o.value)).toEqual(['hairline', 'crown', 'entire-scalp']);
    expect(QUESTIONS[1].options.map((o) => o.value)).toEqual(['lt-1y', '1-5y', 'gt-5y']);
    expect(QUESTIONS[4].options.map((o) => o.value)).toEqual(['stop', 'regrow', 'both']);
  });
});

describe('QuestionCard', () => {
  it('reports the selected option value', async () => {
    const onSelect = vi.fn();
    render(
      <LocaleProvider>
        <QuestionCard question={QUESTIONS[0]} index={0} total={5} value={undefined} onSelect={onSelect} />
      </LocaleProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: /crown|קודקוד/i }));
    expect(onSelect).toHaveBeenCalledWith('q1_area', 'crown');
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { AnalyzingStrip } from './AnalyzingStrip';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const wrap = (ui: React.ReactNode) => render(<LocaleProvider>{ui}</LocaleProvider>);

describe('AnalyzingStrip', () => {
  it('does not complete until the gate is ready, even after all facets elapse', () => {
    const onComplete = vi.fn();
    const { rerender } = wrap(
      <AnalyzingStrip running gateReady={false} onComplete={onComplete} facetMs={100} />,
    );
    // Advance one facetMs-sized step at a time — each act() call lets exactly one
    // render+effect cycle complete and register the next timer, so the chain cascades.
    for (let i = 0; i < 6; i++) act(() => vi.advanceTimersByTime(100));
    expect(onComplete).not.toHaveBeenCalled();

    rerender(<LocaleProvider><AnalyzingStrip running gateReady onComplete={onComplete} facetMs={100} /></LocaleProvider>);
    for (let i = 0; i < 6; i++) act(() => vi.advanceTimersByTime(100));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('renders the five analysis facets', () => {
    wrap(<AnalyzingStrip running gateReady={false} onComplete={vi.fn()} facetMs={100} />);
    expect(screen.getByText(/density|צפיפות/i)).toBeInTheDocument();
    expect(screen.getByText(/scalp|קרקפת/i)).toBeInTheDocument();
  });
});

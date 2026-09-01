import { describe, it, expect } from 'vitest';
import { rooteContent } from './roote.config';
import { collectPending, isPending, PENDING } from './pending';

describe('PENDING helpers', () => {
  it('PENDING() makes a recognisable marker', () => {
    const m = PENDING('pricing — 180 days');
    expect(isPending(m)).toBe(true);
    expect(m.label).toBe('pricing — 180 days');
  });

  it('collectPending finds nulls with dotted paths', () => {
    const found = collectPending({ a: { b: null }, c: [1, null] });
    expect(found.map((f) => f.path)).toEqual(['a.b', 'c.1']);
  });

  it('collectPending finds explicit markers', () => {
    const found = collectPending({ x: PENDING('effectiveness %') });
    expect(found).toEqual([{ path: 'x', label: 'effectiveness %' }]);
  });
});

describe('roote.config', () => {
  it('has all five program durations', () => {
    expect(rooteContent.programDurations.map((d) => d.days)).toEqual([90, 120, 180, 270, 360]);
  });

  it('stores the proposed formula with proposed status, no public percentages by default', () => {
    expect(rooteContent.formula.displayPercentagesPublicly).toBe(false);
    expect(rooteContent.formula.ingredients.map((i) => i.name)).toEqual([
      'Minoxidil', 'Finasteride', 'Azelaic Acid', 'ABN Complex™',
    ]);
    expect(rooteContent.formula.ingredients.every((i) => i.status === 'proposed')).toBe(true);
  });

  it('every price and headline claim is unresolved (null) — none invented', () => {
    const pending = collectPending(rooteContent).map((p) => p.path);
    expect(pending).toEqual(expect.arrayContaining([
      'programDurations.0.price',
      'programDurations.2.price',
      'programDurations.4.price',
      'claims.effectiveness.value',
      'claims.timeToVisibleResults.value',
      'claims.rescanWindow.value',
      'claims.doctorFollowUpCost.value',
    ]));
  });
});

import { describe, it, expect } from 'vitest';
import { lsGet, lsSet, lsRemove, putBlob, getBlob, deleteBlob } from './persistence';

describe('localStorage helpers', () => {
  it('round-trips JSON with a prefix and honours the fallback', () => {
    expect(lsGet('session', { a: 1 })).toEqual({ a: 1 });
    lsSet('session', { a: 2 });
    expect(lsGet('session', { a: 1 })).toEqual({ a: 2 });
    expect(localStorage.getItem('roote.session')).toBe('{"a":2}');
    lsRemove('session');
    expect(lsGet('session', null)).toBeNull();
  });

  it('returns the fallback on corrupt JSON', () => {
    localStorage.setItem('roote.broken', '{not json');
    expect(lsGet('broken', 'fallback')).toBe('fallback');
  });
});

describe('IndexedDB blob store', () => {
  it('stores, reads, and deletes a blob by id', async () => {
    const blob = new Blob(['hello'], { type: 'text/plain' });
    await putBlob('photo-1', blob);
    const got = await getBlob('photo-1');
    expect(got).toBeInstanceOf(Blob);
    expect(await got!.text()).toBe('hello');
    await deleteBlob('photo-1');
    expect(await getBlob('photo-1')).toBeUndefined();
  });
});

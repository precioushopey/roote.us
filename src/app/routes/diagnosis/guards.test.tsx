import { describe, it, expect } from 'vitest';
import { redirectForStep } from './guards';
import type { SessionState } from '@/store/sessionStore';

const empty: SessionState = {
  diagnosis: { gender: null, photos: [], answers: {} },
  analysis: null, reportId: null, account: { email: null }, program: null,
};
const withGender: SessionState = { ...empty, diagnosis: { ...empty.diagnosis, gender: 'male' } };
const withPhoto: SessionState = {
  ...withGender,
  diagnosis: { ...withGender.diagnosis, photos: [{ id: 'p', angleKey: 'front', thumb: 't', blobId: 'b' }] },
};

describe('redirectForStep', () => {
  it('intro and gender are always reachable', () => {
    expect(redirectForStep('intro', empty)).toBeNull();
    expect(redirectForStep('gender', empty)).toBeNull();
  });
  it('photos needs a gender', () => {
    expect(redirectForStep('photos', empty)).toBe('/diagnosis/gender');
    expect(redirectForStep('photos', withGender)).toBeNull();
  });
  it('analyzing needs gender + at least one photo', () => {
    expect(redirectForStep('analyzing', withGender)).toBe('/diagnosis/photos');
    expect(redirectForStep('analyzing', withPhoto)).toBeNull();
  });
  it('ready needs an analysis', () => {
    expect(redirectForStep('ready', withPhoto)).toBe('/diagnosis/analyzing');
  });
});

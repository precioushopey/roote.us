import type { SessionState } from '@/store/sessionStore';

export const DIAGNOSIS_STEPS = ['intro', 'gender', 'photos', 'analyzing', 'ready'] as const;
export type DiagnosisStep = (typeof DIAGNOSIS_STEPS)[number];

export function redirectForStep(step: DiagnosisStep, s: SessionState): string | null {
  const hasGender = s.diagnosis.gender !== null;
  const hasPhoto = s.diagnosis.photos.length >= 1;
  const hasAnalysis = s.analysis !== null;

  switch (step) {
    case 'intro':
    case 'gender':
      return null;
    case 'photos':
      return hasGender ? null : '/diagnosis/gender';
    case 'analyzing':
      if (!hasGender) return '/diagnosis/gender';
      return hasPhoto ? null : '/diagnosis/photos';
    case 'ready':
      return hasAnalysis ? null : '/diagnosis/analyzing';
    default:
      return null;
  }
}

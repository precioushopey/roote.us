import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { lsGet, lsSet } from './persistence';
import type { HairAnalysis, Gender, HairGoal, HealthCondition, Answers } from '@/domain/analysis/types';
import type { GrayAnswers, GrayProfile } from '@/domain/analysis/grayProfile';
import type { Program, ProgramDurationDays, ProgressPhoto, Reminder } from '@/domain/program/types';

export type AngleKey = 'front' | 'top' | 'crown' | 'hairline';
export type PhotoRef = { id: string; angleKey: AngleKey; thumb: string; blobId: string };

export type SessionState = {
  diagnosis: {
    gender: Gender | null;
    /** packaging look chosen when gender is 'unspecified' (PO #24) — presentation only */
    packagingPreference?: 'men' | 'women';
    hairGoal: HairGoal | null;
    photos: PhotoRef[];
    answers: Partial<Answers>;
    grayAnswers: Partial<GrayAnswers>;
    /** client-confirmed multi-select, None-exclusive (enforced in `setHealthHistory`) */
    healthHistory: HealthCondition[];
    /** explicit photo-upload consent (brief §26) */
    photoConsent: boolean;
  };
  analysis: HairAnalysis | null;
  grayProfile: GrayProfile | null;
  reportId: string | null;
  /** `marketingConsent` is separate + optional — never a condition of the report (PO #11) */
  account: { email: string | null; marketingConsent: boolean };
  draftDurationDays: ProgramDurationDays | null;
  program: Program | null;
};

const EMPTY: SessionState = {
  diagnosis: {
    gender: null, hairGoal: null, photos: [], answers: {}, grayAnswers: {}, healthHistory: [], photoConsent: false,
  },
  analysis: null,
  grayProfile: null,
  reportId: null,
  account: { email: null, marketingConsent: false },
  draftDurationDays: null,
  program: null,
};

type Action =
  | { type: 'HYDRATE'; state: SessionState }
  | { type: 'SET_GENDER'; gender: Gender }
  | { type: 'SET_PACKAGING_PREFERENCE'; value: 'men' | 'women' }
  | { type: 'SET_HAIR_GOAL'; hairGoal: HairGoal }
  | { type: 'SET_MARKETING_CONSENT'; value: boolean }
  | { type: 'ADD_PHOTO'; photo: PhotoRef }
  | { type: 'REMOVE_PHOTO'; id: string }
  | { type: 'SET_ANSWER'; key: keyof Answers; value: Answers[keyof Answers] }
  | { type: 'SET_GRAY_ANSWER'; key: keyof GrayAnswers; value: GrayAnswers[keyof GrayAnswers] }
  | { type: 'TOGGLE_HEALTH_HISTORY'; value: HealthCondition }
  | { type: 'SET_PHOTO_CONSENT'; value: boolean }
  | { type: 'SET_ANALYSIS'; analysis: HairAnalysis }
  | { type: 'SET_GRAY_PROFILE'; profile: GrayProfile }
  | { type: 'SET_REPORT_ID'; id: string }
  | { type: 'SET_EMAIL'; email: string }
  | { type: 'SET_DRAFT_DURATION'; days: ProgramDurationDays }
  | { type: 'SET_PROGRAM'; program: Program }
  | { type: 'TOGGLE_PROGRAM_TASK'; isoDate: string; taskKey: string }
  | { type: 'ADD_PROGRAM_PHOTO'; photo: ProgressPhoto }
  | { type: 'SET_PROGRAM_REMINDERS'; reminders: Reminder[] }
  | { type: 'RESET' }
  | { type: 'RESET_DIAGNOSIS' };

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;
    case 'SET_GENDER':
      return { ...state, diagnosis: { ...state.diagnosis, gender: action.gender } };
    case 'SET_PACKAGING_PREFERENCE':
      return { ...state, diagnosis: { ...state.diagnosis, packagingPreference: action.value } };
    case 'SET_HAIR_GOAL':
      return { ...state, diagnosis: { ...state.diagnosis, hairGoal: action.hairGoal } };
    case 'TOGGLE_HEALTH_HISTORY': {
      const current = state.diagnosis.healthHistory;
      // Client rule: "None" clears every other condition; picking any other
      // condition automatically un-selects "None." Directional, so this has to
      // know which value was just clicked — a plain set-union can't express it.
      const next = action.value === 'none'
        ? (current.includes('none') ? [] : ['none' as const])
        : current.includes(action.value)
          ? current.filter((v) => v !== action.value && v !== 'none')
          : [...current.filter((v) => v !== 'none'), action.value];
      return { ...state, diagnosis: { ...state.diagnosis, healthHistory: next } };
    }
    case 'SET_MARKETING_CONSENT':
      return { ...state, account: { ...state.account, marketingConsent: action.value } };
    case 'SET_GRAY_ANSWER':
      return {
        ...state,
        diagnosis: {
          ...state.diagnosis,
          grayAnswers: { ...state.diagnosis.grayAnswers, [action.key]: action.value },
        },
      };
    case 'SET_PHOTO_CONSENT':
      return { ...state, diagnosis: { ...state.diagnosis, photoConsent: action.value } };
    case 'SET_GRAY_PROFILE':
      return { ...state, grayProfile: action.profile };
    case 'ADD_PHOTO':
      return {
        ...state,
        diagnosis: {
          ...state.diagnosis,
          photos: [
            ...state.diagnosis.photos.filter((p) => p.angleKey !== action.photo.angleKey),
            action.photo,
          ],
        },
      };
    case 'REMOVE_PHOTO':
      return {
        ...state,
        diagnosis: { ...state.diagnosis, photos: state.diagnosis.photos.filter((p) => p.id !== action.id) },
      };
    case 'SET_ANSWER':
      return {
        ...state,
        diagnosis: { ...state.diagnosis, answers: { ...state.diagnosis.answers, [action.key]: action.value } },
      };
    case 'SET_ANALYSIS':
      return { ...state, analysis: action.analysis };
    case 'SET_REPORT_ID':
      return { ...state, reportId: action.id };
    case 'SET_EMAIL':
      return { ...state, account: { ...state.account, email: action.email } };
    case 'SET_DRAFT_DURATION':
      return { ...state, draftDurationDays: action.days };
    case 'SET_PROGRAM':
      return { ...state, program: action.program };
    case 'TOGGLE_PROGRAM_TASK': {
      if (!state.program) return state;
      const done = state.program.completionLog[action.isoDate] ?? [];
      const next = done.includes(action.taskKey)
        ? done.filter((k) => k !== action.taskKey)
        : [...done, action.taskKey];
      return {
        ...state,
        program: {
          ...state.program,
          completionLog: { ...state.program.completionLog, [action.isoDate]: next },
        },
      };
    }
    case 'ADD_PROGRAM_PHOTO': {
      if (!state.program) return state;
      return {
        ...state,
        program: { ...state.program, progressPhotos: [...state.program.progressPhotos, action.photo] },
      };
    }
    case 'SET_PROGRAM_REMINDERS': {
      if (!state.program) return state;
      return { ...state, program: { ...state.program, reminders: action.reminders } };
    }
    case 'RESET':
      return EMPTY;
    // "Start over" on the assessment only — unlike RESET, leaves account/program/
    // draftDurationDays untouched, so it's safe to offer mid-flow even for a
    // returning customer who already has a purchased program.
    case 'RESET_DIAGNOSIS':
      return { ...state, diagnosis: EMPTY.diagnosis, analysis: null, grayProfile: null, reportId: null };
    default:
      return state;
  }
}

const SessionContext = createContext<
  (SessionState & {
    setGender: (g: Gender) => void;
    setPackagingPreference: (value: 'men' | 'women') => void;
    setHairGoal: (goal: HairGoal) => void;
    setMarketingConsent: (value: boolean) => void;
    addPhoto: (p: PhotoRef) => void;
    removePhoto: (id: string) => void;
    setAnswer: <K extends keyof Answers>(key: K, value: Answers[K]) => void;
    setGrayAnswer: <K extends keyof GrayAnswers>(key: K, value: GrayAnswers[K]) => void;
    toggleHealthHistory: (value: HealthCondition) => void;
    setPhotoConsent: (value: boolean) => void;
    setAnalysis: (a: HairAnalysis) => void;
    setGrayProfile: (p: GrayProfile) => void;
    setReportId: (id: string) => void;
    setEmail: (email: string) => void;
    setDraftDurationDays: (days: ProgramDurationDays) => void;
    setProgram: (program: Program) => void;
    toggleProgramTask: (isoDate: string, taskKey: string) => void;
    addProgramPhoto: (photo: ProgressPhoto) => void;
    setProgramReminders: (reminders: Reminder[]) => void;
    reset: () => void;
    resetDiagnosis: () => void;
  }) | null
>(null);

const STORAGE_KEY = 'session';

/** Merge a persisted session over the current defaults so older stored shapes
 *  (before `concern` / `grayAnswers` / `photoConsent` / `grayProfile`) hydrate
 *  cleanly. */
function hydrate(): SessionState {
  const stored = lsGet<Partial<SessionState>>(STORAGE_KEY, EMPTY);
  return {
    ...EMPTY,
    ...stored,
    diagnosis: { ...EMPTY.diagnosis, ...(stored.diagnosis ?? {}) },
    account: { ...EMPTY.account, ...(stored.account ?? {}) },
  };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, EMPTY, hydrate);

  useEffect(() => {
    lsSet(STORAGE_KEY, state);
  }, [state]);

  const value = useMemo(
    () => ({
      ...state,
      setGender: (gender: Gender) => dispatch({ type: 'SET_GENDER', gender }),
      setPackagingPreference: (value: 'men' | 'women') =>
        dispatch({ type: 'SET_PACKAGING_PREFERENCE', value }),
      setHairGoal: (hairGoal: HairGoal) => dispatch({ type: 'SET_HAIR_GOAL', hairGoal }),
      setMarketingConsent: (value: boolean) => dispatch({ type: 'SET_MARKETING_CONSENT', value }),
      addPhoto: (photo: PhotoRef) => dispatch({ type: 'ADD_PHOTO', photo }),
      removePhoto: (id: string) => dispatch({ type: 'REMOVE_PHOTO', id }),
      setAnswer: <K extends keyof Answers>(key: K, value: Answers[K]) =>
        dispatch({ type: 'SET_ANSWER', key, value }),
      setGrayAnswer: <K extends keyof GrayAnswers>(key: K, value: GrayAnswers[K]) =>
        dispatch({ type: 'SET_GRAY_ANSWER', key, value }),
      toggleHealthHistory: (value: HealthCondition) => dispatch({ type: 'TOGGLE_HEALTH_HISTORY', value }),
      setPhotoConsent: (value: boolean) => dispatch({ type: 'SET_PHOTO_CONSENT', value }),
      setAnalysis: (analysis: HairAnalysis) => dispatch({ type: 'SET_ANALYSIS', analysis }),
      setGrayProfile: (profile: GrayProfile) => dispatch({ type: 'SET_GRAY_PROFILE', profile }),
      setReportId: (id: string) => dispatch({ type: 'SET_REPORT_ID', id }),
      setEmail: (email: string) => dispatch({ type: 'SET_EMAIL', email }),
      setDraftDurationDays: (days: ProgramDurationDays) => dispatch({ type: 'SET_DRAFT_DURATION', days }),
      setProgram: (program: Program) => dispatch({ type: 'SET_PROGRAM', program }),
      toggleProgramTask: (isoDate: string, taskKey: string) =>
        dispatch({ type: 'TOGGLE_PROGRAM_TASK', isoDate, taskKey }),
      addProgramPhoto: (photo: ProgressPhoto) => dispatch({ type: 'ADD_PROGRAM_PHOTO', photo }),
      setProgramReminders: (reminders: Reminder[]) =>
        dispatch({ type: 'SET_PROGRAM_REMINDERS', reminders }),
      reset: () => dispatch({ type: 'RESET' }),
      resetDiagnosis: () => dispatch({ type: 'RESET_DIAGNOSIS' }),
    }),
    [state],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const c = useContext(SessionContext);
  if (!c) throw new Error('useSession must be used within <SessionProvider>');
  return c;
}

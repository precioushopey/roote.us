import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { lsGet, lsSet } from './persistence';
import type { HairAnalysis, Gender, Answers } from '@/domain/analysis/types';

export type AngleKey = 'front' | 'top' | 'crown' | 'hairline';
export type PhotoRef = { id: string; angleKey: AngleKey; thumb: string; blobId: string };

export type SessionState = {
  diagnosis: { gender: Gender | null; photos: PhotoRef[]; answers: Partial<Answers> };
  analysis: HairAnalysis | null;
  reportId: string | null;
  account: { email: string | null };
  program: null;
};

const EMPTY: SessionState = {
  diagnosis: { gender: null, photos: [], answers: {} },
  analysis: null,
  reportId: null,
  account: { email: null },
  program: null,
};

type Action =
  | { type: 'HYDRATE'; state: SessionState }
  | { type: 'SET_GENDER'; gender: Gender }
  | { type: 'ADD_PHOTO'; photo: PhotoRef }
  | { type: 'REMOVE_PHOTO'; id: string }
  | { type: 'SET_ANSWER'; key: keyof Answers; value: Answers[keyof Answers] }
  | { type: 'SET_ANALYSIS'; analysis: HairAnalysis }
  | { type: 'SET_REPORT_ID'; id: string }
  | { type: 'SET_EMAIL'; email: string }
  | { type: 'RESET' };

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;
    case 'SET_GENDER':
      return { ...state, diagnosis: { ...state.diagnosis, gender: action.gender } };
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
      return { ...state, account: { email: action.email } };
    case 'RESET':
      return EMPTY;
    default:
      return state;
  }
}

const SessionContext = createContext<
  (SessionState & {
    setGender: (g: Gender) => void;
    addPhoto: (p: PhotoRef) => void;
    removePhoto: (id: string) => void;
    setAnswer: <K extends keyof Answers>(key: K, value: Answers[K]) => void;
    setAnalysis: (a: HairAnalysis) => void;
    setReportId: (id: string) => void;
    setEmail: (email: string) => void;
    reset: () => void;
  }) | null
>(null);

const STORAGE_KEY = 'session';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, EMPTY, () => lsGet<SessionState>(STORAGE_KEY, EMPTY));

  useEffect(() => {
    lsSet(STORAGE_KEY, state);
  }, [state]);

  const value = useMemo(
    () => ({
      ...state,
      setGender: (gender: Gender) => dispatch({ type: 'SET_GENDER', gender }),
      addPhoto: (photo: PhotoRef) => dispatch({ type: 'ADD_PHOTO', photo }),
      removePhoto: (id: string) => dispatch({ type: 'REMOVE_PHOTO', id }),
      setAnswer: <K extends keyof Answers>(key: K, value: Answers[K]) =>
        dispatch({ type: 'SET_ANSWER', key, value }),
      setAnalysis: (analysis: HairAnalysis) => dispatch({ type: 'SET_ANALYSIS', analysis }),
      setReportId: (id: string) => dispatch({ type: 'SET_REPORT_ID', id }),
      setEmail: (email: string) => dispatch({ type: 'SET_EMAIL', email }),
      reset: () => dispatch({ type: 'RESET' }),
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

import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { lsGet, lsSet } from './persistence';
import {
  EMPTY_TRACKING,
  type HairPhoto,
  type HairScan,
  type ReminderType,
  type TaskStatus,
  type TrackingState,
} from '@/domain/tracking/types';

/**
 * Persisted tracking state — the localStorage/IndexedDB stand-in for a backend
 * (spec §16). Photo + scan *blobs* live in IndexedDB (`store/persistence`);
 * this holds the JSON: task log, photo/scan refs, checkpoint completion,
 * reminder settings.
 */
const STORAGE_KEY = 'tracking';

type Action =
  | { type: 'HYDRATE'; state: TrackingState }
  | { type: 'INIT_FOR_PROGRAM'; programId: string; taskLog?: TrackingState['taskLog']; photos?: HairPhoto[] }
  | { type: 'SET_TASK'; isoDate: string; taskKey: string; status: TaskStatus }
  | { type: 'ADD_PHOTO'; photo: HairPhoto }
  | { type: 'REMOVE_PHOTO'; id: string }
  | { type: 'ADD_SCAN'; scan: HairScan }
  | { type: 'COMPLETE_CHECKPOINT'; checkpointId: string; isoDate: string }
  | { type: 'SKIP_CHECKPOINT'; checkpointId: string; skipped: boolean }
  | { type: 'SET_REMINDER'; reminderType: ReminderType; enabled: boolean }
  | { type: 'RESET' };

function reducer(state: TrackingState, action: Action): TrackingState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;
    case 'INIT_FOR_PROGRAM':
      return {
        ...EMPTY_TRACKING,
        programId: action.programId,
        taskLog: action.taskLog ?? {},
        photos: action.photos ?? [],
      };
    case 'SET_TASK': {
      const day = { ...(state.taskLog[action.isoDate] ?? {}), [action.taskKey]: action.status };
      return { ...state, taskLog: { ...state.taskLog, [action.isoDate]: day } };
    }
    case 'ADD_PHOTO':
      return {
        ...state,
        photos: [...state.photos.filter((p) => !(p.checkpointId === action.photo.checkpointId && p.view === action.photo.view)), action.photo],
      };
    case 'REMOVE_PHOTO':
      return { ...state, photos: state.photos.filter((p) => p.id !== action.id) };
    case 'ADD_SCAN':
      return { ...state, scans: [...state.scans, action.scan] };
    case 'COMPLETE_CHECKPOINT':
      return {
        ...state,
        checkpointLog: { ...state.checkpointLog, [action.checkpointId]: action.isoDate },
        skippedCheckpoints: state.skippedCheckpoints.filter((id) => id !== action.checkpointId),
      };
    case 'SKIP_CHECKPOINT':
      return {
        ...state,
        skippedCheckpoints: action.skipped
          ? [...new Set([...state.skippedCheckpoints, action.checkpointId])]
          : state.skippedCheckpoints.filter((id) => id !== action.checkpointId),
      };
    case 'SET_REMINDER':
      return { ...state, reminderSettings: { ...state.reminderSettings, [action.reminderType]: action.enabled } };
    case 'RESET':
      return EMPTY_TRACKING;
    default:
      return state;
  }
}

type Ctx = TrackingState & {
  initForProgram: (programId: string, taskLog?: TrackingState['taskLog'], photos?: HairPhoto[]) => void;
  setTaskStatus: (isoDate: string, taskKey: string, status: TaskStatus) => void;
  addPhoto: (photo: HairPhoto) => void;
  removePhoto: (id: string) => void;
  addScan: (scan: HairScan) => void;
  completeCheckpoint: (checkpointId: string, isoDate: string) => void;
  skipCheckpoint: (checkpointId: string, skipped: boolean) => void;
  setReminder: (reminderType: ReminderType, enabled: boolean) => void;
  reset: () => void;
};

const TrackingContext = createContext<Ctx | null>(null);

export function TrackingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, EMPTY_TRACKING, () => ({
    ...EMPTY_TRACKING,
    ...lsGet<Partial<TrackingState>>(STORAGE_KEY, EMPTY_TRACKING),
  }));

  useEffect(() => {
    lsSet(STORAGE_KEY, state);
  }, [state]);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      initForProgram: (programId, taskLog, photos) =>
        dispatch({ type: 'INIT_FOR_PROGRAM', programId, taskLog, photos }),
      setTaskStatus: (isoDate, taskKey, status) => dispatch({ type: 'SET_TASK', isoDate, taskKey, status }),
      addPhoto: (photo) => dispatch({ type: 'ADD_PHOTO', photo }),
      removePhoto: (id) => dispatch({ type: 'REMOVE_PHOTO', id }),
      addScan: (scan) => dispatch({ type: 'ADD_SCAN', scan }),
      completeCheckpoint: (checkpointId, isoDate) =>
        dispatch({ type: 'COMPLETE_CHECKPOINT', checkpointId, isoDate }),
      skipCheckpoint: (checkpointId, skipped) =>
        dispatch({ type: 'SKIP_CHECKPOINT', checkpointId, skipped }),
      setReminder: (reminderType, enabled) => dispatch({ type: 'SET_REMINDER', reminderType, enabled }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    [state],
  );

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>;
}

export function useTracking(): Ctx {
  const c = useContext(TrackingContext);
  if (!c) throw new Error('useTracking must be used within <TrackingProvider>');
  return c;
}

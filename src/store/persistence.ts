const LS_PREFIX = 'roote.';

export function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function lsSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    // Quota or serialization failure — surfaced to callers via console; higher
    // layers (sessionStore) decide what to evict.
    console.warn('[roote] lsSet failed for', key, err);
  }
}

export function lsRemove(key: string): void {
  try { localStorage.removeItem(LS_PREFIX + key); } catch { /* ignore */ }
}

const DB_NAME = 'roote';
const DB_VERSION = 1;
const STORE = 'blobs';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      }),
  );
}

type StoredBlob = { buffer: ArrayBuffer; type: string };

export async function putBlob(id: string, blob: Blob): Promise<void> {
  const buffer = await blob.arrayBuffer();
  await tx('readwrite', (s) => s.put({ buffer, type: blob.type }, id));
}

export async function getBlob(id: string): Promise<Blob | undefined> {
  const rec = await tx<StoredBlob | undefined>('readonly', (s) => s.get(id) as IDBRequest<StoredBlob | undefined>);
  if (!rec) return undefined;
  return new Blob([rec.buffer], { type: rec.type });
}

export async function deleteBlob(id: string): Promise<void> {
  await tx('readwrite', (s) => s.delete(id));
}

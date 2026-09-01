import { useId, useState, type ChangeEvent } from 'react';
import { useT } from '@/i18n/LocaleProvider';
import { downscaleImage } from './downscaleImage';
import { putBlob, deleteBlob } from '@/store/persistence';
import type { AngleKey, PhotoRef } from '@/store/sessionStore';

const MAX_BYTES = 15 * 1024 * 1024;

export function PhotoUpload({
  angleKey, value, onAdd, onRemove,
}: {
  angleKey: AngleKey;
  value?: PhotoRef;
  onAdd: (ref: PhotoRef) => void;
  onRemove: (id: string) => void;
}) {
  const t = useT();
  const inputId = useId();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null);
    if (!file.type.startsWith('image/')) { setError(t('photo.error.type')); return; }
    if (file.size > MAX_BYTES) { setError(t('photo.error.size')); return; }
    setBusy(true);
    try {
      const { blob, dataUrl } = await downscaleImage(file);
      const { dataUrl: thumb } = await downscaleImage(file, { maxEdge: 256, quality: 0.6 });
      const id = crypto.randomUUID();
      await putBlob(id, blob);
      if (value) {
        await deleteBlob(value.blobId).catch(() => {});
      }
      onAdd({ id, angleKey, thumb, blobId: id });
    } catch {
      setError(t('photo.error.generic'));
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    if (!value) return;
    try {
      await deleteBlob(value.blobId);
    } catch {
      // best-effort cleanup — still remove from state so the UI isn't stuck
    }
    onRemove(value.id);
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-xs font-medium text-muted-foreground">
        {t(`photo.angle.${angleKey}` as never)}
      </label>
      {value ? (
        <div className="relative">
          <img src={value.thumb} alt={t(`photo.angle.${angleKey}` as never)} className="h-32 w-full rounded-lg object-cover" />
          <button type="button" onClick={handleRemove} className="absolute end-2 top-2 rounded bg-background/80 px-2 py-1 text-xs">
            {t('common.remove')}
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex h-32 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground"
        >
          {busy ? t('photo.uploading') : t('photo.add')}
        </label>
      )}
      <input
        id={inputId}
        type="file"
        accept="image/*"
        capture
        className="sr-only"
        onChange={handleChange}
      />
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

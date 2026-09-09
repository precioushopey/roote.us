import { useId, useState, type ChangeEvent } from 'react';
import { useT } from '@/i18n/LocaleProvider';
import { downscaleImage } from '@/app/components/diagnosis/downscaleImage';
import { putBlob } from '@/store/persistence';
import { ScanGuide } from '@/app/components/roote';
import type { PhotoView } from '@/domain/tracking/types';

const MAX_BYTES = 15 * 1024 * 1024;

/**
 * One guided photo slot (spec §5): the framing silhouette + the previous
 * checkpoint's photo as a faint ghost overlay, so later shots line up with the
 * baseline. Photos are downscaled client-side; the blob goes to IndexedDB and
 * the caller stores the ref.
 */
export function GuidedPhotoCapture({
  view,
  label,
  instruction,
  currentThumb,
  ghostThumb,
  onCaptured,
  onRemove,
}: {
  view: PhotoView;
  label: string;
  instruction: string;
  currentThumb?: string;
  /** previous checkpoint's photo for this view, shown ghosted */
  ghostThumb?: string;
  onCaptured: (ref: { blobId: string; thumb: string }) => void;
  onRemove?: () => void;
}) {
  const t = useT();
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null);
    if (!file.type.startsWith('image/')) return setError(t('photo.error.type'));
    if (file.size > MAX_BYTES) return setError(t('photo.error.size'));
    setBusy(true);
    try {
      const { blob } = await downscaleImage(file);
      const { dataUrl: thumb } = await downscaleImage(file, { maxEdge: 256, quality: 0.6 });
      const blobId = crypto.randomUUID();
      await putBlob(blobId, blob);
      onCaptured({ blobId, thumb });
    } catch {
      setError(t('photo.error.generic'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-cream-100">
        {currentThumb ? (
          <img src={currentThumb} alt={label} className="h-full w-full object-cover" />
        ) : (
          <>
            {ghostThumb && (
              <img src={ghostThumb} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-25" />
            )}
            <ScanGuide angle={view} className="absolute inset-0 h-full w-full p-3" />
          </>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-cream-50/70 font-body text-sm text-muted-foreground">
            {t('photo.uploading')}
          </div>
        )}
      </div>
      <p className="font-body text-sm text-muted-foreground">{instruction}</p>
      {error && (
        <p role="alert" className="font-body text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <label
          htmlFor={inputId}
          className="cursor-pointer font-body text-sm font-medium text-deep-800 underline underline-offset-4"
        >
          {currentThumb ? t('photo.retake') : t('photo.add')}
        </label>
        <input id={inputId} type="file" accept="image/*" capture="user" onChange={handleChange} className="sr-only" />
        {currentThumb && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="font-body text-sm text-muted-foreground underline"
          >
            {t('common.remove')}
          </button>
        )}
      </div>
    </div>
  );
}

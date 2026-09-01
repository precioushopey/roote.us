export function computeDownscaledSize(w: number, h: number, maxEdge: number): { width: number; height: number } {
  const longEdge = Math.max(w, h);
  if (longEdge <= maxEdge) return { width: Math.round(w), height: Math.round(h) };
  const scale = maxEdge / longEdge;
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

export async function downscaleImage(
  file: Blob,
  opts: { maxEdge?: number; quality?: number } = {},
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  const maxEdge = opts.maxEdge ?? 1200;
  const quality = opts.quality ?? 0.72;

  const bitmap = await createImageBitmap(file);
  const { width, height } = computeDownscaledSize(bitmap.width, bitmap.height, maxEdge);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/jpeg', quality),
  );
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });

  return { blob, dataUrl, width, height };
}

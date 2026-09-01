import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider } from '@/i18n/LocaleProvider';

vi.mock('./downscaleImage', () => ({
  computeDownscaledSize: (w: number, h: number) => ({ width: w, height: h }),
  downscaleImage: vi.fn(async () => ({
    blob: new Blob(['x'], { type: 'image/jpeg' }),
    dataUrl: 'data:image/jpeg;base64,AAAA',
    width: 10, height: 10,
  })),
}));

vi.mock('@/store/persistence', () => ({
  putBlob: vi.fn(async () => {}),
  deleteBlob: vi.fn(async () => {}),
}));

import { PhotoUpload } from './PhotoUpload';

const wrap = (ui: React.ReactNode) => render(<LocaleProvider>{ui}</LocaleProvider>);

describe('PhotoUpload', () => {
  it('accepts an image, downscales it, and reports a PhotoRef', async () => {
    const onAdd = vi.fn();
    wrap(<PhotoUpload angleKey="front" onAdd={onAdd} onRemove={vi.fn()} />);
    const input = screen.getByLabelText(/front|קדמי/i) as HTMLInputElement;
    const file = new File(['bytes'], 'front.jpg', { type: 'image/jpeg' });
    await userEvent.upload(input, file);
    expect(onAdd).toHaveBeenCalledTimes(1);
    const ref = onAdd.mock.calls[0][0];
    expect(ref).toMatchObject({ angleKey: 'front', thumb: 'data:image/jpeg;base64,AAAA' });
    expect(ref.blobId).toBe(ref.id);
  });

  it('rejects a non-image file with an inline message', async () => {
    const onAdd = vi.fn();
    wrap(<PhotoUpload angleKey="front" onAdd={onAdd} onRemove={vi.fn()} />);
    const input = screen.getByLabelText(/front|קדמי/i) as HTMLInputElement;
    await userEvent.upload(input, new File(['x'], 'notes.txt', { type: 'text/plain' }));
    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

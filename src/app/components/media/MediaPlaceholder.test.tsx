import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MediaPlaceholder } from './MediaPlaceholder';

describe('MediaPlaceholder', () => {
  it('exposes its alt text as an accessible image', () => {
    render(<MediaPlaceholder alt="Close-up of a hairline, no face" label="dev note" ratio="4 / 5" />);
    expect(screen.getByRole('img', { name: 'Close-up of a hairline, no face' })).toBeInTheDocument();
  });

  it('reserves space with a fixed aspect ratio (no layout shift)', () => {
    render(<MediaPlaceholder alt="a" label="b" ratio="16 / 9" />);
    const el = screen.getByRole('img');
    expect(el.style.aspectRatio).toBe('16 / 9');
  });

  it('tags the kind for downstream tooling / audits', () => {
    render(<MediaPlaceholder alt="a" label="b" kind="animation" />);
    expect(screen.getByRole('img')).toHaveAttribute('data-media-placeholder', 'animation');
  });

  it('shows the art-direction note in dev builds', () => {
    render(<MediaPlaceholder alt="a" label="men's dark-teal system, studio light" />);
    // vitest runs with import.meta.env.DEV = true
    expect(screen.getByText("men's dark-teal system, studio light")).toBeInTheDocument();
  });
});

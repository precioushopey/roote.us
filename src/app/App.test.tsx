import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App shell', () => {
  it('renders the landing route with localized CTA and a working language toggle', async () => {
    render(<App />);
    expect(screen.getAllByRole('img', { name: 'ROOTÉ' }).length).toBeGreaterThan(0);
    // default he — the landing page repeats its CTA in several sections, so expect at least one
    expect(screen.getAllByRole('link', { name: /אבחון שיער חינם/ }).length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole('button', { name: /Switch language/i }));
    expect(screen.getAllByRole('link', { name: /Start Free Diagnosis/i }).length).toBeGreaterThan(0);
  });
});

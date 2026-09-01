import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App shell', () => {
  it('renders the landing route with localized CTA and a working language toggle', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /ROOTÉ/ })).toBeInTheDocument();
    // default he
    expect(screen.getByRole('link', { name: /אבחון שיער חינם/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Switch language/i }));
    expect(screen.getByRole('link', { name: /Start Free Diagnosis/i })).toBeInTheDocument();
  });
});

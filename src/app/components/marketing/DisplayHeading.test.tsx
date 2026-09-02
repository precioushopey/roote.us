import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DisplayHeading } from './DisplayHeading';

describe('DisplayHeading', () => {
  it('renders the given tag and solid text', () => {
    render(<DisplayHeading as="h1" size="xl" text="Regrowth, tailored to you" />);
    const h = screen.getByRole('heading', { level: 1 });
    expect(h).toHaveTextContent('Regrowth, tailored to you');
    expect(h.className).toContain('font-display');
  });
  it('renders the ghost word decoratively (aria-hidden)', () => {
    render(<DisplayHeading as="h2" text="Backed by" ghost="science" />);
    const ghost = screen.getByText('science');
    expect(ghost).toHaveAttribute('aria-hidden', 'true');
    expect(ghost.className).toContain('text-accent-ghost');
    // the accessible name is just the solid text
    expect(screen.getByRole('heading', { level: 2 })).toHaveAccessibleName('Backed by');
  });
});

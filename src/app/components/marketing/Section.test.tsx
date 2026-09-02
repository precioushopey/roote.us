import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Section } from './Section';
import { Eyebrow } from './Eyebrow';

describe('Section', () => {
  it('renders children inside a section with the given id', () => {
    render(<Section id="science"><p>body</p></Section>);
    const section = document.getElementById('science');
    expect(section?.tagName).toBe('SECTION');
    expect(screen.getByText('body')).toBeInTheDocument();
  });
  it('renders the index numeral when provided', () => {
    render(<Section index="02"><p>b</p></Section>);
    expect(screen.getByText('02')).toHaveAttribute('aria-hidden', 'true');
  });
  it('applies the ink tone classes', () => {
    render(<Section tone="ink"><p>b</p></Section>);
    expect(document.querySelector('section')?.className).toContain('bg-ink');
  });
});

it('Eyebrow renders uppercase tracked label', () => {
  render(<Eyebrow>Our Science</Eyebrow>);
  expect(screen.getByText('Our Science').className).toContain('uppercase');
});

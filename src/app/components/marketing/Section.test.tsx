import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Section } from './Section';
import { Eyebrow } from './Eyebrow';
import { Prose } from './Prose';

describe('Section', () => {
  it('renders children inside a section with the given id', () => {
    render(<Section id="science"><p>body</p></Section>);
    const section = document.getElementById('science');
    expect(section?.tagName).toBe('SECTION');
    expect(screen.getByText('body')).toBeInTheDocument();
  });
  it('renders the index numeral when provided', () => {
    render(<Section index="02"><p>b</p></Section>);
    const numeral = screen.getByText('02');
    expect(numeral).toHaveAttribute('aria-hidden', 'true');
    expect(numeral.className).toContain('text-2xl');
  });
  it('applies the ink tone classes', () => {
    render(<Section tone="ink"><p>b</p></Section>);
    expect(document.querySelector('section')?.className).toContain('bg-ink');
  });
  it('merges a caller className with the tone classes via cn (override wins)', () => {
    render(<Section tone="light" className="py-0"><p>b</p></Section>);
    const section = document.querySelector('section');
    // tailwind-merge resolves the py-* conflict in favor of the later class
    expect(section?.className).toContain('py-0');
    expect(section?.className).not.toMatch(/\bpy-20\b/);
  });
  it('the inner wrapper establishes its own stacking context for the motif', () => {
    render(<Section motif><p>b</p></Section>);
    const wrapper = document.querySelector('section > div');
    expect(wrapper?.className).toContain('isolate');
  });
});

it('Eyebrow renders uppercase tracked label', () => {
  render(<Eyebrow>Our Science</Eyebrow>);
  expect(screen.getByText('Our Science').className).toContain('uppercase');
});

it('Eyebrow uses ink-foreground tone when onInk', () => {
  render(<Eyebrow onInk>Our Science</Eyebrow>);
  expect(screen.getByText('Our Science').className).toContain('text-ink-foreground');
});

it('Prose uses ink-foreground tone when onInk', () => {
  render(<Prose onInk>ink text</Prose>);
  expect(screen.getByText('ink text').className).toContain('text-ink-foreground');
});

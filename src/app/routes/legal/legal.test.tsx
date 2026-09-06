import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { LegalPageView } from './LegalPageView';
import { LEGAL_PAGES, getLegalBody } from '@/content/legal';
import { containsForbiddenClaim } from '@/content/claims';
import { pickLocalized } from '@/content/localized';

function renderPage(slug: string, locale: 'en' | 'he' = 'en') {
  const region = locale === 'he' ? 'he-il' : 'en-us';
  render(
    <MemoryRouter>
      <LocaleProvider localeRegion={region}>
        <LegalPageView slug={slug} />
      </LocaleProvider>
    </MemoryRouter>,
  );
}

describe('legal pages', () => {
  it('renders each of the nine policy pages with its title and a review notice', () => {
    for (const p of LEGAL_PAGES) {
      renderPage(p.slug);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(pickLocalized(p.title, 'en'));
      expect(screen.getByText(/draft for the preview build/i)).toBeInTheDocument();
      document.body.innerHTML = '';
    }
  });

  it('every drafted section carries no forbidden marketing claim', () => {
    for (const p of LEGAL_PAGES) {
      for (const s of getLegalBody(p.slug)) {
        expect(containsForbiddenClaim(pickLocalized(s.body, 'en')), `${p.slug}/${s.id}`).toBe(false);
      }
    }
  });

  it('flags every unresolved specific with a [TODO: confirm] marker somewhere in the set', () => {
    // pages that necessarily contain operator-set specifics
    for (const slug of ['shipping', 'returns', 'subscription-terms', 'privacy']) {
      const text = getLegalBody(slug)
        .map((s) => pickLocalized(s.body, 'en'))
        .join(' ');
      expect(text, slug).toMatch(/\[TODO: confirm/);
    }
  });

  it('renders in Hebrew', () => {
    renderPage('medical-disclaimer', 'he');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('הבהרה רפואית');
  });
});

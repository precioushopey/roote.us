import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useContentLocale } from '@/i18n/LocaleProvider';
import { metaForPath, fullTitle } from './meta';
import { pickLocalized } from '@/content/localized';
import logo from '@/assets/logo.png';

const SITE_ORIGIN = 'https://roote.us';
/** Wide wordmark (~1400×435), not a 1200×630 crop — good enough for a `summary` Twitter
 *  card until a dedicated social-share image exists (SEO-AUDIT.md H5). */
const SHARE_IMAGE = `${SITE_ORIGIN}${logo}`;

function upsertMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Sets document title + description + canonical + OpenGraph on route change from
 * the `ROUTE_META` table. No framework dependency. `index.html` keeps
 * `noindex,nofollow` for the concept build, so this is inert for crawlers but
 * ready for launch.
 */
export function useDocumentMeta() {
  const { pathname } = useLocation();
  const cl = useContentLocale();

  useEffect(() => {
    const meta = metaForPath(pathname);
    const title = fullTitle(pickLocalized(meta.title, cl));
    const description = pickLocalized(meta.description, cl);
    const canonical = `${SITE_ORIGIN}${pathname === '/' ? '' : pathname}`;

    document.title = title;
    upsertMeta('meta[name="description"]', 'name', 'description', description);
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
    upsertMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'ROOTÉ');
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', SHARE_IMAGE);
    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary');
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', SHARE_IMAGE);
    upsertCanonical(canonical);
  }, [pathname, cl]);
}

import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useLocale } from '@/i18n/LocaleProvider';
import { SHIPPED_LOCALES, COUNTRY_DEFAULTS } from '@/i18n/locales';
import { formatLocaleRegion } from '@/i18n/localeRegion';
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

function upsertHreflangAlternates(bareLogicalPath: string) {
  document.head.querySelectorAll('link[data-roote-hreflang]').forEach((el) => el.remove());
  const suffix = bareLogicalPath === '/' ? '' : bareLogicalPath;
  for (const locale of SHIPPED_LOCALES) {
    for (const country of Object.keys(COUNTRY_DEFAULTS)) {
      const region = formatLocaleRegion(locale, country);
      appendAlternate(region, `${SITE_ORIGIN}/${region}${suffix}`);
    }
  }
  appendAlternate('x-default', `${SITE_ORIGIN}${suffix}`);
}

function appendAlternate(hreflang: string, href: string) {
  const el = document.createElement('link');
  el.setAttribute('rel', 'alternate');
  el.setAttribute('hreflang', hreflang);
  el.setAttribute('href', href);
  el.setAttribute('data-roote-hreflang', '');
  document.head.appendChild(el);
}

/**
 * Sets document title + description + canonical + OpenGraph + hreflang on
 * route change from the `ROUTE_META` table. `metaForPath` operates on the
 * bare logical path (locale-region prefix stripped) — it never sees the
 * region segment. `index.html` keeps `noindex,nofollow` for the concept
 * build, so this is inert for crawlers but ready for launch.
 */
export function useDocumentMeta() {
  const { pathname } = useLocation();
  const { contentLocale, localeRegion } = useLocale();

  useEffect(() => {
    const bareLogicalPath = pathname.slice(`/${localeRegion}`.length) || '/';
    const meta = metaForPath(bareLogicalPath);
    const title = fullTitle(pickLocalized(meta.title, contentLocale));
    const description = pickLocalized(meta.description, contentLocale);
    const canonical = `${SITE_ORIGIN}${pathname}`;

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
    upsertHreflangAlternates(bareLogicalPath);
  }, [pathname, contentLocale, localeRegion]);
}

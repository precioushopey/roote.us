import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useLocale } from '@/i18n/LocaleProvider';
import { ENABLED_LOCALES } from '@/i18n/locales';
import { metaForPath, fullTitle } from './meta';
import { pickLocalized } from '@/content/localized';
import shareImage from '@/assets/OpenGraph Banner.png';

const SITE_ORIGIN = 'https://roote.us';
/** Dedicated 1232×630 social-share banner (SEO-AUDIT.md H5's flagged follow-up — was the
 *  wordmark logo, a summary_large_image-shaped crop now exists). */
const SHARE_IMAGE = `${SITE_ORIGIN}${shareImage}`;

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
  for (const locale of ENABLED_LOCALES) {
    appendAlternate(locale, `${SITE_ORIGIN}/${locale}${suffix}`);
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
 * bare logical path (locale prefix stripped) — it never sees the
 * locale segment. `index.html` keeps `noindex,nofollow` for the concept
 * build, so this is inert for crawlers but ready for launch.
 */
export function useDocumentMeta() {
  const { pathname } = useLocation();
  const { locale } = useLocale();

  useEffect(() => {
    const bareLogicalPath = pathname.slice(`/${locale}`.length) || '/';
    const meta = metaForPath(bareLogicalPath);
    const title = fullTitle(pickLocalized(meta.title, locale));
    const description = pickLocalized(meta.description, locale);
    const canonical = `${SITE_ORIGIN}${pathname}`;

    document.title = title;
    upsertMeta('meta[name="description"]', 'name', 'description', description);
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
    upsertMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'ROOTÉ');
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', SHARE_IMAGE);
    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', SHARE_IMAGE);
    upsertCanonical(canonical);
    upsertHreflangAlternates(bareLogicalPath);
  }, [pathname, locale]);
}

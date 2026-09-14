import type { RouteObject } from 'react-router';
import { MarketingShell } from '@/app/components/shell/MarketingShell';
import { Home } from './Home';
import { Magazine } from './Magazine';
import { HairScan } from './HairScan';
import { Products } from './Products';
import { ProductDetail } from './ProductDetail';
import { Faq } from './Faq';
import { Support } from './Support';
import { Terms } from './Terms';
import { Privacy } from './Privacy';
import { SolutionPage, SolutionsIndex } from './SolutionPage';
import { LoginPage } from '@/app/routes/auth/LoginPage';
import { SignUpPage } from '@/app/routes/auth/SignUpPage';
import { BagPage } from '@/app/routes/bag/BagPage';
import { BagCheckout } from '@/app/routes/bag/BagCheckout';
import { BagSuccess } from '@/app/routes/bag/BagSuccess';
import { LegalPageView } from '@/app/routes/legal/LegalPageView';
import { LocalizedNavigate } from '@/app/LocaleGate';

/** Legal slugs handled by the generic registry view (Terms / Privacy keep their
 *  own richer drafts). */
const REGISTRY_LEGAL = ['shipping', 'subscription-terms', 'medical-disclaimer'];

/** Retired legal slugs (5-page consolidation, 2026-09-14) — each merged into
 *  one of the 5 survivors above; these keep the old URL alive as a redirect
 *  for bookmarks/links rather than a bare 404. */
const RETIRED_LEGAL_REDIRECTS: Array<[from: string, to: string]> = [
  ['returns', '/shipping'],
  ['cancellation', '/shipping'],
  ['accessibility', '/terms'],
  ['cookies', '/privacy'],
  ['terms-of-sale', '/terms'],
];

export const marketingRoutes: RouteObject = {
  element: <MarketingShell />,
  children: [
    { index: true, element: <Home /> },
    { path: 'magazine', element: <Magazine /> },
    { path: 'hair-scan', element: <HairScan /> },

    { path: 'solutions', element: <SolutionsIndex /> },
    { path: 'solutions/thinning', element: <SolutionPage slug="thinning" /> },
    { path: 'solutions/gray-hair', element: <SolutionPage slug="gray-hair" /> },

    { path: 'faq', element: <Faq /> },
    { path: 'support', element: <Support /> },
    { path: 'login', element: <LoginPage /> },
    { path: 'signup', element: <SignUpPage /> },

    { path: 'products', element: <Products /> },
    { path: 'products/:slug', element: <ProductDetail /> },

    // Legal (brief §25) — compressed to 5 pages, 2026-09-14
    { path: 'terms', element: <Terms /> },
    { path: 'privacy', element: <Privacy /> },
    ...REGISTRY_LEGAL.map((slug) => ({ path: slug, element: <LegalPageView slug={slug} /> })),
    ...RETIRED_LEGAL_REDIRECTS.map(([from, to]) => ({
      path: from,
      element: <LocalizedNavigate to={to} replace />,
    })),

    // Shop cart (secondary surface)
    { path: 'bag', element: <BagPage /> },
    { path: 'bag/checkout', element: <BagCheckout /> },
    { path: 'bag/success', element: <BagSuccess /> },
  ],
};

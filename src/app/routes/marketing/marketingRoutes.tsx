import type { RouteObject } from 'react-router';
import { MarketingShell } from '@/app/components/shell/MarketingShell';
import { Home } from './Home';
import { Magazine } from './Magazine';
import { HowItWorks } from './HowItWorks';
import { Science } from './Science';
import { Products } from './Products';
import { ProductDetail } from './ProductDetail';
import { About } from './About';
import { Faq } from './Faq';
import { Support } from './Support';
import { Terms } from './Terms';
import { TermsOfSale } from './TermsOfSale';
import { Privacy } from './Privacy';
import { SolutionPage, SolutionsIndex } from './SolutionPage';
import { SystemPage } from './SystemPage';
import { BagPage } from '@/app/routes/bag/BagPage';
import { BagCheckout } from '@/app/routes/bag/BagCheckout';
import { BagSuccess } from '@/app/routes/bag/BagSuccess';
import { LegalPageView } from '@/app/routes/legal/LegalPageView';

/** Legal slugs handled by the generic registry view (Terms / Privacy keep their
 *  own richer drafts until WP9 consolidates). */
const REGISTRY_LEGAL = [
  'shipping',
  'returns',
  'cancellation',
  'subscription-terms',
  'medical-disclaimer',
  'accessibility',
  'cookies',
];

export const marketingRoutes: RouteObject = {
  element: <MarketingShell />,
  children: [
    { index: true, element: <Home /> },
    { path: 'how-it-works', element: <HowItWorks /> },
    { path: 'magazine', element: <Magazine /> },

    { path: 'solutions', element: <SolutionsIndex /> },
    { path: 'solutions/thinning', element: <SolutionPage slug="thinning" /> },
    { path: 'solutions/gray-hair', element: <SolutionPage slug="gray-hair" /> },

    { path: 'science', element: <Science /> },
    { path: 'system', element: <SystemPage /> },

    { path: 'about', element: <About /> },
    { path: 'faq', element: <Faq /> },
    { path: 'support', element: <Support /> },

    { path: 'products', element: <Products /> },
    { path: 'products/:slug', element: <ProductDetail /> },

    // Legal (brief §25)
    { path: 'terms', element: <Terms /> },
    { path: 'terms-of-sale', element: <TermsOfSale /> },
    { path: 'privacy', element: <Privacy /> },
    ...REGISTRY_LEGAL.map((slug) => ({ path: slug, element: <LegalPageView slug={slug} /> })),

    // Shop cart (secondary surface)
    { path: 'bag', element: <BagPage /> },
    { path: 'bag/checkout', element: <BagCheckout /> },
    { path: 'bag/success', element: <BagSuccess /> },
  ],
};

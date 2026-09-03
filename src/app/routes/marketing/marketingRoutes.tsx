import type { RouteObject } from 'react-router';
import { MarketingShell } from '@/app/components/shell/MarketingShell';
import { Home } from './Home';
import { HowItWorks } from './HowItWorks';
import { Science } from './Science';
import { Products } from './Products';
import { About } from './About';
import { Faq } from './Faq';
import { Support } from './Support';
import { Terms } from './Terms';
import { TermsOfSale } from './TermsOfSale';
import { Privacy } from './Privacy';
import { BagPage } from '@/app/routes/bag/BagPage';
import { BagCheckout } from '@/app/routes/bag/BagCheckout';
import { BagSuccess } from '@/app/routes/bag/BagSuccess';

export const marketingRoutes: RouteObject = {
  element: <MarketingShell />,
  children: [
    { index: true, element: <Home /> },
    { path: 'how-it-works', element: <HowItWorks /> },
    { path: 'science', element: <Science /> },
    { path: 'products', element: <Products /> },
    { path: 'about', element: <About /> },
    { path: 'faq', element: <Faq /> },
    { path: 'support', element: <Support /> },
    { path: 'terms', element: <Terms /> },
    { path: 'terms-of-sale', element: <TermsOfSale /> },
    { path: 'privacy', element: <Privacy /> },
    { path: 'bag', element: <BagPage /> },
    { path: 'bag/checkout', element: <BagCheckout /> },
    { path: 'bag/success', element: <BagSuccess /> },
  ],
};

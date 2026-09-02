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
import { Privacy } from './Privacy';

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
    { path: 'privacy', element: <Privacy /> },
  ],
};

import type { RouteObject } from 'react-router';
import { MarketingShell } from '@/app/components/shell/MarketingShell';
import { Home } from './Home';
import { HowItWorks } from './HowItWorks';
import { Science } from './Science';
import { Products } from './Products';
import { Results } from './Results';
import { About } from './About';
import { Faq } from './Faq';
import { Support } from './Support';
import { BlogIndex } from './BlogIndex';
import { BlogPost } from './BlogPost';
import { Terms } from './Terms';
import { Privacy } from './Privacy';

export const marketingRoutes: RouteObject = {
  element: <MarketingShell />,
  children: [
    { index: true, element: <Home /> },
    { path: 'how-it-works', element: <HowItWorks /> },
    { path: 'science', element: <Science /> },
    { path: 'products', element: <Products /> },
    { path: 'results', element: <Results /> },
    { path: 'about', element: <About /> },
    { path: 'faq', element: <Faq /> },
    { path: 'support', element: <Support /> },
    { path: 'blog', element: <BlogIndex /> },
    { path: 'blog/:slug', element: <BlogPost /> },
    { path: 'terms', element: <Terms /> },
    { path: 'privacy', element: <Privacy /> },
  ],
};

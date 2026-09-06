import { Outlet, useLocation } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { useRevealOnRoute } from '@/app/lib/useRevealOnRoute';
import { useDocumentMeta } from '@/seo/useDocumentMeta';
import { Header } from './Header';
import { Footer } from './Footer';
import { AnalysisPrompt } from './AnalysisPrompt';

export function MarketingShell() {
  const t = useT();
  const { pathname } = useLocation();
  useRevealOnRoute();
  useDocumentMeta();
  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t('marketing.a11y.skipToContent')}
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <Footer />
      {pathname === '/' && <AnalysisPrompt />}
    </div>
  );
}

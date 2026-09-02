import { Outlet } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';

export function MarketingShell() {
  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

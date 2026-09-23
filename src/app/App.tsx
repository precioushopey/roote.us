import { createBrowserRouter, RouterProvider } from 'react-router';
import { SessionProvider } from '@/store/sessionStore';
import { AuthProvider } from '@/store/auth';
import { CartProvider } from '@/store/cart';
import { TrackingProvider } from '@/store/tracking';
import { ToastProvider } from '@/app/components/roote';
import { LocaleGate, BareOrLegacyPathRedirect, LocalizedNavigate } from './LocaleGate';
import { ReportPage } from './routes/report/ReportPage';
import { FunnelShell } from './components/shell/FunnelShell';
import { AccountRescan } from './routes/app/AccountRescan';
import { marketingRoutes } from './routes/marketing/marketingRoutes';
import { analysisRoutes } from './routes/analysis/analysisRoutes';
import { StartLayout } from './routes/start/StartLayout';
import { PlanStep } from './routes/start/PlanStep';
import { CheckoutStep } from './routes/start/CheckoutStep';
import { SuccessStep } from './routes/start/SuccessStep';
import { AppShell } from './routes/app/AppShell';
import { AccountToday } from './routes/app/AccountToday';
import { AccountBaseline } from './routes/app/AccountBaseline';
import { AccountProgress } from './routes/app/AccountProgress';
import { AccountResults } from './routes/app/AccountResults';
import { AccountRenew } from './routes/app/AccountRenew';
import { AccountReminders } from './routes/app/AccountReminders';
import { AppPlan } from './routes/app/AppPlan';
import { AppOrders } from './routes/app/AppOrders';
import { AppProfile } from './routes/app/AppProfile';

const router = createBrowserRouter([
  {
    path: '/:locale',
    element: <LocaleGate />,
    children: [
      marketingRoutes,
      analysisRoutes,
      {
        element: <FunnelShell />,
        children: [
          { path: 'account/hairhealth-rescan', element: <AccountRescan /> },
          {
            path: 'program',
            element: <StartLayout />,
            children: [
              { index: true, element: null }, // forwards via StartLayout (guards.ts 'entry')
              { path: 'plan', element: <PlanStep /> },
              { path: 'checkout', element: <CheckoutStep /> },
              { path: 'success', element: <SuccessStep /> },
            ],
          },
        ],
      },
      {
        path: 'account',
        element: <AppShell />,
        children: [
          { index: true, element: <AccountToday /> },
          { path: 'program', element: <AppPlan /> },
          { path: 'baseline', element: <AccountBaseline /> },
          { path: 'progress', element: <AccountProgress /> },
          { path: 'results', element: <AccountResults /> },
          { path: 'renew', element: <AccountRenew /> },
          { path: 'reminders', element: <AccountReminders /> },
          { path: 'orders', element: <AppOrders /> },
          { path: 'profile', element: <AppProfile /> },
          // Nav consolidation (2026-09-11): Overview folded into Today (index);
          // Photos/Scans/Before & After folded into Progress as tabs; Orders/
          // Subscription folded into Profile. Old URLs keep working.
          // 2026-09-23: Orders un-folded back into its own page (real route
          // above, not a redirect anymore) — Care took over the redirect
          // instead, since its content moved into Profile.
          { path: 'today', element: <LocalizedNavigate to="/account" replace /> },
          { path: 'photos', element: <LocalizedNavigate to="/account/progress?tab=photos" replace /> },
          { path: 'scans', element: <LocalizedNavigate to="/account/progress?tab=scans" replace /> },
          { path: 'progress/before-after', element: <LocalizedNavigate to="/account/progress?tab=beforeAfter" replace /> },
          { path: 'care', element: <LocalizedNavigate to="/account/profile" replace /> },
          { path: 'subscription', element: <LocalizedNavigate to="/account/profile" replace /> },
          // WP2-era sub-segment names
          { path: 'plan', element: <LocalizedNavigate to="/account/program" replace /> },
          { path: 'rescan', element: <LocalizedNavigate to="/account/progress?tab=scans" replace /> },
        ],
      },
      { path: 'report/:reportId', element: <ReportPage /> },
    ],
  },
  { path: '*', element: <BareOrLegacyPathRedirect /> },
]);

export default function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <CartProvider>
          <TrackingProvider>
            <ToastProvider>
              <RouterProvider router={router} />
            </ToastProvider>
          </TrackingProvider>
        </CartProvider>
      </SessionProvider>
    </AuthProvider>
  );
}

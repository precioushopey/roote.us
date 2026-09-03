import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { AuthProvider } from '@/store/auth';
import { CartProvider } from '@/store/cart';
import { ReportPage } from './routes/report/ReportPage';
import { LoginPage } from './routes/auth/LoginPage';
import { FunnelShell } from './components/shell/FunnelShell';
import { marketingRoutes } from './routes/marketing/marketingRoutes';
import { DiagnosisLayout } from './routes/diagnosis/DiagnosisLayout';
import { IntroStep } from './routes/diagnosis/IntroStep';
import { GenderStep } from './routes/diagnosis/GenderStep';
import { PhotosStep } from './routes/diagnosis/PhotosStep';
import { AnalyzingStep } from './routes/diagnosis/AnalyzingStep';
import { ReadyStep } from './routes/diagnosis/ReadyStep';
import { StartLayout } from './routes/start/StartLayout';
import { AccountStep } from './routes/start/AccountStep';
import { PlanStep } from './routes/start/PlanStep';
import { CheckoutStep } from './routes/start/CheckoutStep';
import { SuccessStep } from './routes/start/SuccessStep';
import { AppShell } from './routes/app/AppShell';
import { AppToday } from './routes/app/AppToday';
import { AppPlan } from './routes/app/AppPlan';
import { AppProgress } from './routes/app/AppProgress';
import { AppCare } from './routes/app/AppCare';
import { AppRescan } from './routes/app/AppRescan';
import { AppProfile } from './routes/app/AppProfile';

const router = createBrowserRouter([
  marketingRoutes,
  {
    element: <FunnelShell />,
    children: [
      { path: '/login', element: <LoginPage /> },
      {
        path: '/diagnosis',
        element: <DiagnosisLayout />,
        children: [
          { index: true, element: <IntroStep /> },
          { path: 'intro', element: <IntroStep /> },
          { path: 'gender', element: <GenderStep /> },
          { path: 'photos', element: <PhotosStep /> },
          { path: 'analyzing', element: <AnalyzingStep /> },
          { path: 'ready', element: <ReadyStep /> },
        ],
      },
      {
        path: '/start',
        element: <StartLayout />,
        children: [
          { index: true, element: <AccountStep /> },
          { path: 'plan', element: <PlanStep /> },
          { path: 'checkout', element: <CheckoutStep /> },
          { path: 'success', element: <SuccessStep /> },
        ],
      },
    ],
  },
  {
    path: '/app',
    element: <AppShell />,
    children: [
      { index: true, element: <AppToday /> },
      { path: 'plan', element: <AppPlan /> },
      { path: 'progress', element: <AppProgress /> },
      { path: 'care', element: <AppCare /> },
      { path: 'rescan', element: <AppRescan /> },
      { path: 'profile', element: <AppProfile /> },
    ],
  },
  { path: '/report/:reportId', element: <ReportPage /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default function App() {
  return (
    <LocaleProvider>
      <AuthProvider>
        <SessionProvider>
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </SessionProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}

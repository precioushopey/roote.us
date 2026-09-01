import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { AuthProvider } from '@/store/auth';
import { Landing } from './routes/landing/Landing';
import { ReportPage } from './routes/report/ReportPage';
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

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
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
  { path: '/report/:reportId', element: <ReportPage /> },
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
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default function App() {
  return (
    <LocaleProvider>
      <AuthProvider>
        <SessionProvider>
          <RouterProvider router={router} />
        </SessionProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}

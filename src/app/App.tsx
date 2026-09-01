import { createBrowserRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { Landing } from './routes/landing/Landing';
import { ReportPlaceholder } from './routes/report/ReportPlaceholder';

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/report/:reportId', element: <ReportPlaceholder /> },
]);

export default function App() {
  return (
    <LocaleProvider>
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </LocaleProvider>
  );
}

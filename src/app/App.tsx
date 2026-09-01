import { createBrowserRouter, RouterProvider } from 'react-router';
import { Landing } from './routes/landing/Landing';

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

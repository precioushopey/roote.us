import { Navigate, type RouteObject } from 'react-router';
import { AnalysisShell } from './AnalysisShell';
import { IntroScreen, GenderScreen, ConcernScreen } from './Steps1to3';
import { PhotosScreen } from './PhotosScreen';
import { ScanningScreen } from './ScanningScreen';
import { QuestionsScreen } from './QuestionsScreen';
import { ResultsScreen } from './ResultsScreen';

/** `/analysis` — the Free Hair Analysis flow (brief §12). */
export const analysisRoutes: RouteObject = {
  path: 'analysis',
  element: <AnalysisShell />,
  children: [
    { index: true, element: <IntroScreen /> },
    { path: 'gender', element: <GenderScreen /> },
    { path: 'concern', element: <ConcernScreen /> },
    { path: 'photos', element: <PhotosScreen /> },
    { path: 'scanning', element: <ScanningScreen /> },
    { path: 'questions', element: <QuestionsScreen /> },
    { path: 'results', element: <ResultsScreen /> },
    // WP2-era aliases
    { path: 'intro', element: <Navigate to="/analysis" replace /> },
    { path: 'analyzing', element: <Navigate to="/analysis/scanning" replace /> },
    { path: 'ready', element: <Navigate to="/analysis/results" replace /> },
  ],
};

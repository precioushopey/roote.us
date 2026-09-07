import { type RouteObject } from 'react-router';
import { LocalizedNavigate } from '@/app/LocaleGate';
import { AnalysisShell } from './AnalysisShell';
import { IntroScreen, GenderScreen, GoalScreen } from './Steps1to3';
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
    { path: 'goal', element: <GoalScreen /> },
    // legacy path alias — old shared links / bookmarks used "concern"
    { path: 'concern', element: <LocalizedNavigate to="/analysis/goal" replace /> },
    { path: 'photos', element: <PhotosScreen /> },
    { path: 'scanning', element: <ScanningScreen /> },
    { path: 'questions', element: <QuestionsScreen /> },
    { path: 'results', element: <ResultsScreen /> },
    // WP2-era aliases
    { path: 'intro', element: <LocalizedNavigate to="/analysis" replace /> },
    { path: 'analyzing', element: <LocalizedNavigate to="/analysis/scanning" replace /> },
    { path: 'ready', element: <LocalizedNavigate to="/analysis/results" replace /> },
  ],
};

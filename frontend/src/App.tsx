import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'

const ExplorerPage = lazy(() =>
  import('./pages/ExplorerPage').then((module) => ({ default: module.ExplorerPage })),
)
const OverviewPage = lazy(() =>
  import('./pages/OverviewPage').then((module) => ({ default: module.OverviewPage })),
)
const RankingPage = lazy(() =>
  import('./pages/RankingPage').then((module) => ({ default: module.RankingPage })),
)
const ComparisonPage = lazy(() =>
  import('./pages/ComparisonPage').then((module) => ({ default: module.ComparisonPage })),
)
const AssistantPage = lazy(() =>
  import('./pages/AssistantPage').then((module) => ({ default: module.AssistantPage })),
)
const AnalyticsPage = lazy(() =>
  import('./pages/AnalyticsPage').then((module) => ({ default: module.AnalyticsPage })),
)
const MicrogravityLabPage = lazy(() =>
  import('./pages/MicrogravityLabPage').then((module) => ({ default: module.MicrogravityLabPage })),
)
const FlameLabPage = lazy(() =>
  import('./pages/FlameLabPage').then((module) => ({ default: module.FlameLabPage })),
)
const GravityComparisonPage = lazy(() =>
  import('./pages/GravityComparisonPage').then((module) => ({ default: module.GravityComparisonPage })),
)
const EmergencySimulatorPage = lazy(() =>
  import('./pages/EmergencySimulatorPage').then((module) => ({ default: module.EmergencySimulatorPage })),
)
const HabitatExplorerPage = lazy(() =>
  import('./pages/HabitatExplorerPage').then((module) => ({ default: module.HabitatExplorerPage })),
)
const ImageAnalyzerPage = lazy(() =>
  import('./pages/ImageAnalyzerPage').then((module) => ({ default: module.ImageAnalyzerPage })),
)
const MissionIntelligencePage = lazy(() =>
  import('./pages/MissionIntelligencePage').then((module) => ({ default: module.MissionIntelligencePage })),
)
const ReportsPage = lazy(() =>
  import('./pages/ReportsPage').then((module) => ({ default: module.ReportsPage })),
)

function PageLoader() {
  return <div aria-live="polite" className="page-loading" role="status">Loading research view...</div>
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route element={<Suspense fallback={<PageLoader />}><OverviewPage /></Suspense>} index />
        <Route element={<Suspense fallback={<PageLoader />}><ExplorerPage /></Suspense>} path="explorer" />
        <Route element={<Suspense fallback={<PageLoader />}><RankingPage /></Suspense>} path="ranking" />
        <Route element={<Suspense fallback={<PageLoader />}><ComparisonPage /></Suspense>} path="compare" />
        <Route element={<Suspense fallback={<PageLoader />}><AssistantPage /></Suspense>} path="assistant" />
        <Route element={<Suspense fallback={<PageLoader />}><AnalyticsPage /></Suspense>} path="analytics" />
        <Route element={<Suspense fallback={<PageLoader />}><FlameLabPage /></Suspense>} path="lab" />
        <Route element={<Suspense fallback={<PageLoader />}><GravityComparisonPage /></Suspense>} path="gravity" />
        <Route element={<Suspense fallback={<PageLoader />}><EmergencySimulatorPage /></Suspense>} path="emergency" />
        <Route element={<Suspense fallback={<PageLoader />}><HabitatExplorerPage /></Suspense>} path="habitat" />
        <Route element={<Suspense fallback={<PageLoader />}><ImageAnalyzerPage /></Suspense>} path="image-analyzer" />
        <Route element={<Suspense fallback={<PageLoader />}><MicrogravityLabPage /></Suspense>} path="concept-lab" />
        <Route element={<Suspense fallback={<PageLoader />}><MissionIntelligencePage /></Suspense>} path="missions" />
        <Route element={<Suspense fallback={<PageLoader />}><ReportsPage /></Suspense>} path="reports" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App

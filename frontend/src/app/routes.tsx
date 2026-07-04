import React from 'react';
import { createBrowserRouter, Outlet } from 'react-router';
import { LayoutWrapper } from './components/Layout/LayoutWrapper';

// Public page
import Home from './pages/Home';

// App pages (inside sidebar layout)
import Dashboard from './pages/Dashboard';
import Recommendations from './pages/Recommendations';
import UniversityShortlist from './pages/UniversityShortlist';
import CountryComparison from './pages/CountryComparison';
import DocumentChecklist from './pages/DocumentChecklist';
import SopGenerator from './pages/SopGenerator';
import LORGenerator from './pages/LORGenerator';
import ResumeBuilder from './pages/ResumeBuilder';
import Roadmap from './pages/Roadmap';
import VisaMockInterview from './pages/VisaMockInterview';
import Profile from './pages/Profile';

// Layout route: wraps all app pages with sidebar + top nav
function AppLayout() {
  return (
    <LayoutWrapper>
      <Outlet />
    </LayoutWrapper>
  );
}

const routes = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/recommendations', element: <Recommendations /> },
      { path: '/universities', element: <UniversityShortlist /> },
      { path: '/compare-countries', element: <CountryComparison /> },
      { path: '/documents', element: <DocumentChecklist /> },
      { path: '/sop-generator', element: <SopGenerator /> },
      { path: '/lor-generator', element: <LORGenerator /> },
      { path: '/resume-builder', element: <ResumeBuilder /> },
      { path: '/roadmap', element: <Roadmap /> },
      { path: '/visa-mock-interview', element: <VisaMockInterview /> },
      { path: '/profile', element: <Profile /> },
    ],
  },
]);

export default routes;
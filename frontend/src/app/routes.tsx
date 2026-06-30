import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CountryComparison from "./pages/CountryComparison";
import UniversityShortlist from "./pages/UniversityShortlist";
import DocumentChecklist from "./pages/DocumentChecklist";
import Roadmap from "./pages/Roadmap";
import Recommendations from "./pages/Recommendations";
import ScholarshipSuggestions from "./pages/ScholarshipSuggestions";
import ApplicationTracker from "./pages/ApplicationTracker";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "dashboard", Component: Dashboard },
      { path: "profile", Component: Profile },
      { path: "compare-countries", Component: CountryComparison },
      { path: "universities", Component: UniversityShortlist },
      { path: "recommendations", Component: Recommendations },
      { path: "documents", Component: DocumentChecklist },
      { path: "roadmap", Component: Roadmap },
      { path: "scholarships", Component: ScholarshipSuggestions },
      { path: "applications", Component: ApplicationTracker },
    ],
  },
]);

import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CountryComparison from "./pages/CountryComparison";
import UniversityShortlist from "./pages/UniversityShortlist";
import DocumentChecklist from "./pages/DocumentChecklist";
import Roadmap from "./pages/Roadmap";

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
      { path: "documents", Component: DocumentChecklist },
      { path: "roadmap", Component: Roadmap },
    ],
  },
]);

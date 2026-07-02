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
import ResumeBuilder from "./pages/ResumeBuilder";
import SopGenerator from "./pages/SopGenerator";
import LORGenerator from "./pages/LORGenerator";
import VisaMockInterview from "./pages/VisaMockInterview";

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
      { path: "sop-generator", Component: SopGenerator },
      { path: "lor-generator", Component: LORGenerator },
      { path: "resume-builder", Component: ResumeBuilder },
      { path: "visa-mock-interview", Component: VisaMockInterview },
      { path: "roadmap", Component: Roadmap },
    ],
  },
]);
import { Outlet, Link, useLocation } from "react-router";
import { GraduationCap, Home, User, Globe, Building2, FileCheck, Map, Menu, X, Sparkles, Award, ClipboardList } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function Root() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/",                  label: "Home",            icon: Home },
    { path: "/dashboard",         label: "Dashboard",       icon: GraduationCap },
    { path: "/profile",           label: "Profile",         icon: User },
    { path: "/recommendations",   label: "Recommendations", icon: Sparkles },
    { path: "/compare-countries", label: "Compare",         icon: Globe },
    { path: "/universities",      label: "Universities",    icon: Building2 },
    { path: "/documents",         label: "Documents",       icon: FileCheck },
    { path: "/roadmap",           label: "Roadmap",         icon: Map },
    { path: "/scholarships",      label: "Scholarships",    icon: Award },      
    { path: "/applications",      label: "Applications",    icon: ClipboardList }, 
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#e8f1ff_0%,#f7fbff_44%,#eef5ff_100%)]">
      <nav className="relative z-50 px-3 pt-3 sm:px-4 lg:px-5">
        <div className="mx-auto max-w-[1500px] rounded-t-[28px] border-x border-t border-white/80 bg-white/95 shadow-[0_18px_55px_rgba(37,99,235,0.12)] backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex min-h-[82px] items-center justify-between gap-4 py-3">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-[54px] w-[54px] items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-lg shadow-blue-200/90">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <div>
                  <span className="block text-xl leading-6 text-slate-950">StudyAbroad</span>
                  <span className="block text-xs uppercase tracking-[0.26em] text-slate-500">
                    Planner
                  </span>
                </div>
              </Link>
            </div>

            <div className="hidden items-center gap-6 xl:flex">
              <div className="flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all ${
                        isActive
                          ? item.path === "/recommendations"
                            ? "bg-purple-600 text-white shadow-[0_10px_22px_rgba(124,58,237,0.25)]"
                            : "bg-blue-600 text-white shadow-[0_10px_22px_rgba(37,99,235,0.25)]"
                          : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <div className="ml-1 h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=faces&fit=crop&w=120&h=120"
                    alt="Profile avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center xl:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:text-slate-900"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-slate-200 xl:hidden"
            >
              <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
                <div className="space-y-2 rounded-[24px] bg-white p-3 shadow-sm">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-colors ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-slate-700 hover:bg-blue-50"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </nav>

      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </motion.div>
    </div>
  );
}
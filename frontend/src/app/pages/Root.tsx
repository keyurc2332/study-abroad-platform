import { Outlet, Link, useLocation } from "react-router";
import { GraduationCap, Home, User, Globe, Building2, FileCheck, Map, Menu, X, Sparkles, FileText, Briefcase, ChevronDown, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function Root() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/",                label: "Home",            icon: Home },
  ];

  const navGroups = [
    {
      label: "Explore",
      items: [
        { path: "/dashboard", label: "Dashboard", icon: GraduationCap },
        { path: "/universities", label: "Universities", icon: Building2 },
        { path: "/compare-countries", label: "Compare", icon: Globe },
      ],
    },
    {
      label: "Documents",
      items: [
        { path: "/documents", label: "Documents", icon: FileCheck },
        { path: "/sop-generator", label: "SOP", icon: FileText },
        { path: "/lor-generator", label: "LOR", icon: FileText },
        { path: "/resume-builder", label: "Resume", icon: Briefcase },
      ],
    },
    {
      label: "More",
      items: [
        { path: "/recommendations", label: "Recommendations", icon: Sparkles },
        { path: "/roadmap", label: "Roadmap", icon: Map },
        { path: "/visa-mock-interview", label: "Visa Mock Interview", icon: User },
      ],
    },
  ];

  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    }
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    // close open groups on route change
    setOpenGroup(null);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#e8f1ff_0%,#f7fbff_44%,#eef5ff_100%)]">
      <nav className="relative z-50 px-3 py-3 sm:px-4 lg:px-5">
        <div className="mx-auto max-w-[1500px] rounded-[28px] border border-white/80 bg-white/95 shadow-[0_18px_55px_rgba(37,99,235,0.12)] backdrop-blur-xl">
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

            <div className="hidden items-center gap-4 xl:flex" ref={navRef}>
              <nav role="navigation" aria-label="Primary navigation" className="flex items-center gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
                        isActive ? "bg-blue-600 text-white shadow-[0_10px_22px_rgba(37,99,235,0.25)]" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {navGroups.map((group) => (
                  <div key={group.label} className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenGroup(openGroup === group.label ? null : group.label);
                      }}
                      aria-expanded={openGroup === group.label}
                      aria-controls={`group-${group.label}`}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                    >
                      <span>{group.label}</span>
                      <ChevronDown className="h-4 w-4" aria-hidden />
                    </button>

                    {openGroup === group.label && (
                      <div id={`group-${group.label}`} role="menu" className="absolute left-0 mt-2 w-48 rounded-md border border-slate-100 bg-white shadow-lg z-50 py-1">
                        {group.items.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setOpenGroup(null)}
                            role="menuitem"
                            className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <item.icon className="h-4 w-4 text-slate-500" aria-hidden />
                            <span>{item.label}</span>
                            <ChevronRight className="ml-auto h-4 w-4 text-slate-300" aria-hidden />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              <div className="flex items-center gap-2">
                <div className="ml-1 h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=faces&fit=crop&w=120&h=120"
                    alt="User avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center xl:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
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
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm ${location.pathname === "/" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-blue-50"}`}
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </Link>

                  {navGroups.map((group) => (
                    <details key={group.label} className="rounded-2xl" onClick={(e) => e.stopPropagation()}>
                      <summary className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-700 hover:bg-blue-50">
                        <span className="font-medium">{group.label}</span>
                        <ChevronDown className="ml-auto h-4 w-4 text-slate-400" />
                      </summary>
                      <div className="mt-2 space-y-1 px-2">
                        {group.items.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block rounded-lg px-3 py-2 text-sm ${location.pathname === item.path ? "bg-blue-50 text-slate-900" : "text-slate-700 hover:bg-slate-50"}`}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="h-4 w-4 text-slate-500" />
                              <span>{item.label}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </details>
                  ))}

                  <div className="mt-2 border-t pt-3">
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm ${location.pathname === "/profile" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-blue-50"}`}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </div>
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

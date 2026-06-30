import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  FileCheck,
  Globe,
  Map,
  TrendingUp,
  User,
} from "lucide-react";
import {
  STORAGE_KEYS,
  defaultActivities,
  defaultComparisonCountries,
  defaultDocuments,
  defaultProfile,
  defaultRoadmap,
  defaultShortlistedUniversityIds,
  formatDeadline,
  formatRelativeTime,
  countryData,
  universities,
  usePersistentState,
} from "../data/studyAbroadData";

export default function Dashboard() {
  const [profile] = usePersistentState(STORAGE_KEYS.profile, defaultProfile);
  const [shortlisted] = usePersistentState(
    STORAGE_KEYS.shortlistedUniversityIds,
    defaultShortlistedUniversityIds,
  );
  const [documents] = usePersistentState(STORAGE_KEYS.documents, defaultDocuments);
  const [selectedCountries] = usePersistentState(
    STORAGE_KEYS.comparisonCountries,
    defaultComparisonCountries,
  );
  const [roadmap] = usePersistentState(STORAGE_KEYS.roadmap, defaultRoadmap);
  const [activities] = usePersistentState(STORAGE_KEYS.activities, defaultActivities);
  const validSelectedCountries = selectedCountries.filter((country) => country in countryData);

  const completedRequiredDocuments = documents.filter(
    (document) => document.required && document.status === "completed",
  ).length;
  const requiredDocuments = documents.filter((document) => document.required).length;
  const documentProgress = Math.round(
    (completedRequiredDocuments / Math.max(requiredDocuments, 1)) * 100,
  );

  const completedRoadmapPhases = roadmap.filter((milestone) => milestone.status === "completed").length;
  const roadmapProgress = Math.round((completedRoadmapPhases / Math.max(roadmap.length, 1)) * 100);
  const nextRoadmapMilestone =
    roadmap.find((milestone) => milestone.status === "in-progress") ?? roadmap[0];

  const upcomingDeadlines = universities
    .filter((university) => shortlisted.includes(String(university.id)))
    .sort(
      (left, right) =>
        new Date(left.applicationDeadline).getTime() - new Date(right.applicationDeadline).getTime(),
    )
    .slice(0, 3)
    .map((university) => ({
      university: university.shortName,
      task: "Application submission",
      date: university.applicationDeadline,
    }));

  const stats = [
    {
      label: "Countries explored",
      value: validSelectedCountries.length,
      helper: `${validSelectedCountries.slice(0, 3).join(", ") || "No countries selected yet"}`,
      icon: Globe,
      color: "bg-sky-100 text-sky-700",
    },
    {
      label: "Universities shortlisted",
      value: shortlisted.length,
      helper: `${Math.max(0, 10 - shortlisted.length)} spots left in your target shortlist`,
      icon: Building2,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Required documents ready",
      value: `${completedRequiredDocuments}/${requiredDocuments}`,
      helper: `${documentProgress}% complete`,
      icon: FileCheck,
      color: "bg-amber-100 text-amber-700",
    },
    {
      label: "Roadmap progress",
      value: `${roadmapProgress}%`,
      helper: nextRoadmapMilestone?.title ?? "Journey not started",
      icon: TrendingUp,
      color: "bg-violet-100 text-violet-700",
    },
  ];

  const quickActions = [
    {
      title: "Update profile",
      description: "Keep your goals and preferences current.",
      icon: User,
      link: "/profile",
      color: "from-sky-600 to-blue-700",
    },
    {
      title: "Compare countries",
      description: "Review costs, visa timelines, and work options.",
      icon: Globe,
      link: "/compare-countries",
      color: "from-emerald-600 to-teal-700",
    },
    {
      title: "Manage documents",
      description: "Track required uploads and missing paperwork.",
      icon: FileCheck,
      link: "/documents",
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "Review roadmap",
      description: "Move the next milestone forward.",
      icon: Map,
      link: "/roadmap",
      color: "from-violet-600 to-fuchsia-700",
    },
  ];

  const priorityChecklist = [
    {
      label: "Profile completed",
      done: Boolean(profile.fullName && profile.email && profile.fieldOfStudy),
    },
    {
      label: "At least 2 countries compared",
      done: validSelectedCountries.length >= 2,
    },
    {
      label: "5 universities shortlisted",
      done: shortlisted.length >= 5,
    },
    {
      label: "All required documents uploaded",
      done: completedRequiredDocuments === requiredDocuments,
    },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_45%,#f8fafc_100%)] py-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-[28px] bg-slate-950 text-white shadow-[0_20px_70px_rgba(15,23,42,0.25)]"
        >
          <img
            src="https://images.unsplash.com/photo-1665317034392-cf5f4f487cd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBzdHVkeWluZyUyMGFicm9hZCUyMGNhbXB1c3xlbnwxfHx8fDE3NzY2NzAzODZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Students preparing for study abroad"
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.3),transparent_40%),linear-gradient(135deg,rgba(15,23,42,0.9),rgba(37,99,235,0.78))]" />
          <div className="relative grid gap-6 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.4fr_0.9fr] lg:items-end">
            <div className="max-w-2xl">
              <p className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-sky-100">
                Student dashboard
              </p>
              <h1 className="text-3xl leading-tight sm:text-4xl lg:text-5xl">
                Welcome back, {profile.fullName.split(" ")[0]}.
              </h1>
              <p className="mt-3 max-w-xl text-sm text-slate-200 sm:text-base">
                Your dashboard now reflects your actual shortlist, documents, roadmap, and country comparisons so you can pick up exactly where you left off.
              </p>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-sky-100">Next milestone</p>
                <p className="mt-2 text-lg">{nextRoadmapMilestone?.title ?? "Start your roadmap"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-sky-100">Preferred destinations</p>
                <p className="mt-2 text-sm text-slate-100">
                  {profile.preferredCountries.join(", ") || "Add countries in your profile"}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.article
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="rounded-[24px] border border-slate-200/70 bg-white/90 p-5 shadow-sm backdrop-blur"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-2xl text-slate-900 sm:text-3xl">{stat.value}</span>
                </div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-2 text-sm text-slate-700">{stat.helper}</p>
              </motion.article>
            );
          })}
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <motion.section
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="space-y-6"
          >
            <div>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl text-slate-900">Quick actions</h2>
                  <p className="text-sm text-slate-600">Jump straight into the next meaningful step.</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;

                  return (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.2 + index * 0.08 }}
                    >
                      <Link
                        to={action.link}
                        className={`group block rounded-[24px] bg-gradient-to-br ${action.color} p-5 text-white shadow-lg transition-transform hover:-translate-y-1`}
                      >
                        <Icon className="h-8 w-8" />
                        <h3 className="mt-5 text-lg">{action.title}</h3>
                        <p className="mt-2 text-sm text-white/80">{action.description}</p>
                        <span className="mt-4 inline-flex items-center gap-2 text-sm text-white/90">
                          Open
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200/70 bg-white/90 p-5 shadow-sm">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl text-slate-900">Recent activity</h2>
                  <p className="text-sm text-slate-600">The dashboard updates as you work across the app.</p>
                </div>
                <Link to="/profile" className="self-start text-sm text-blue-700 hover:text-blue-800 sm:self-auto">
                  View profile
                </Link>
              </div>
              <div className="space-y-4">
                {activities.slice(0, 5).map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.06 }}
                    className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-900">{activity.action}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatRelativeTime(activity.createdAt)}</p>
                    </div>
                    <Link to={activity.path} className="shrink-0 self-start text-xs text-blue-700 hover:text-blue-800">
                      Open
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="rounded-[24px] border border-slate-200/70 bg-white/90 p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl text-slate-900">Upcoming deadlines</h2>
                <Link to="/universities" className="self-start text-sm text-blue-700 hover:text-blue-800 sm:self-auto">
                  Manage shortlist
                </Link>
              </div>
              <div className="space-y-4">
                {upcomingDeadlines.length > 0 ? (
                  upcomingDeadlines.map((deadline, index) => (
                    <motion.div
                      key={`${deadline.university}-${deadline.date}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.35 + index * 0.08 }}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-slate-900">{deadline.university}</p>
                          <p className="mt-1 text-xs text-slate-600">{deadline.task}</p>
                          <p className="mt-2 text-xs text-blue-700">{formatDeadline(deadline.date)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-600">
                    Shortlist a university to surface your next application deadline here.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[24px] bg-[linear-gradient(145deg,#0f172a,#1d4ed8)] p-5 text-white shadow-[0_20px_60px_rgba(29,78,216,0.28)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg">Journey health</h3>
                  <p className="mt-1 text-sm text-blue-100">A quick snapshot of what still needs attention.</p>
                </div>
                <span className="text-3xl">{roadmapProgress}%</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${roadmapProgress}%` }}
                  transition={{ duration: 0.9, delay: 0.2 }}
                  className="h-full rounded-full bg-white"
                />
              </div>
              <div className="mt-5 space-y-3">
                {priorityChecklist.map((item) => (
                  <div key={item.label} className={`flex items-center gap-3 text-sm ${item.done ? "text-white" : "text-blue-100"}`}>
                    {item.done ? (
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <div className="h-4 w-4 flex-shrink-0 rounded-full border border-white/70" />
                    )}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}

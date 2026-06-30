import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle, ArrowRight, BookOpen, CheckCircle, ChevronDown,
  DollarSign, ExternalLink, Globe, GraduationCap, MapPin,
  RefreshCw, Search, Sparkles, Star, Target, TrendingUp, User,
} from "lucide-react";
import { getRecommendations, type RecommendedUniversity, type RecommendationResponse } from "../services/api";
import { STORAGE_KEYS, defaultProfile, usePersistentState } from "../data/studyAbroadData";

function isProfileComplete(p: any) {
  return !!(p.gpa && p.desiredDegree && p.fieldOfStudy && p.budgetRange && p.preferredCountries?.length);
}

// ── Admit bar ─────────────────────────────────────────────────────────────────
function AdmitBar({ label, range, category }: { label: string; range: string; category: string }) {
  const fill: Record<string,string> = { safe: "bg-emerald-500", match: "bg-amber-400", reach: "bg-rose-500" };
  const width: Record<string,string> = { High:"75%", Moderate:"55%", Fair:"35%", Low:"18%", "Very Low":"6%" };
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
        <span>Admit probability</span>
        <span className="font-medium text-slate-700">{label} · {range}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100">
        <motion.div initial={{ width: 0 }} animate={{ width: width[label] ?? "20%" }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className={`h-1.5 rounded-full ${fill[category] ?? "bg-blue-500"}`} />
      </div>
    </div>
  );
}

// ── University card ───────────────────────────────────────────────────────────
function UniCard({ uni, index }: { uni: RecommendedUniversity; index: number }) {
  const [open, setOpen] = useState(false);
  const catStyle: Record<string,string> = {
    safe:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    match: "bg-amber-50 text-amber-700 border-amber-200",
    reach: "bg-rose-50 text-rose-700 border-rose-200",
  };
  const catLabel = { safe: "Safe Pick", match: "Good Match", reach: "Reach" };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">

      {/* Top accent line by category */}
      <div className={`h-1 w-full ${uni.category === "safe" ? "bg-emerald-500" : uni.category === "match" ? "bg-amber-400" : "bg-rose-500"}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${catStyle[uni.category]}`}>
                {catLabel[uni.category]}
              </span>
              {uni.tier && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                  {uni.tier}
                </span>
              )}
              {uni.geminiEnhanced && (
                <span className="flex items-center gap-1 rounded-full bg-purple-50 border border-purple-100 px-2.5 py-0.5 text-xs text-purple-700">
                  <Sparkles className="h-3 w-3" /> AI
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold text-slate-900 leading-snug">{uni.universityName}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{uni.name}</p>
          </div>
          {uni.ranking && (
            <div className="flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700 shrink-0">
              <Star className="h-3 w-3" /> #{uni.ranking}
            </div>
          )}
        </div>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            {uni.city}, {uni.country}
          </span>
          <span className="flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-slate-400" />
            ${uni.totalFirstYearCostUSD?.toLocaleString()}/yr
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
            {uni.researchIntensity}
          </span>
        </div>

        {/* GPA + score */}
        {uni.typicalGPARange && (
          <p className="mt-2.5 text-xs text-slate-400">
            Typical GPA: <span className="font-medium text-slate-600">{uni.typicalGPARange}</span>
            <span className="mx-2">·</span>
            Match score: <span className="font-medium text-slate-600">{uni.score}/100</span>
          </p>
        )}

        {/* Admit probability bar */}
        {uni.admitProbability && (
          <AdmitBar label={uni.admitProbability.label} range={uni.admitProbability.range} category={uni.admitProbability.category} />
        )}

        {/* Gemini insight */}
        {uni.keyInsight && (
          <div className="mt-3 rounded-xl bg-purple-50 border border-purple-100 p-3">
            <p className="text-xs font-medium text-purple-700 mb-1 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> AI Insight
            </p>
            <p className="text-xs text-purple-800 leading-relaxed">{uni.keyInsight}</p>
          </div>
        )}

        {/* Expand toggle */}
        {(uni.riskFactors?.length || uni.strengthFactors?.length || uni.recommendationNote) && (
          <button onClick={() => setOpen(!open)}
            className="mt-3 flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors">
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
            {open ? "Less detail" : "More detail"}
          </button>
        )}

        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mt-3 space-y-3">
                {uni.strengthFactors?.length ? (
                  <div>
                    <p className="text-xs font-medium text-emerald-700 mb-1.5">✓ Strengths</p>
                    {uni.strengthFactors.map((s, i) => <p key={i} className="text-xs text-slate-600 ml-3">· {s}</p>)}
                  </div>
                ) : null}
                {uni.riskFactors?.length ? (
                  <div>
                    <p className="text-xs font-medium text-rose-600 mb-1.5">! Risks</p>
                    {uni.riskFactors.map((r, i) => <p key={i} className="text-xs text-slate-600 ml-3">· {r}</p>)}
                  </div>
                ) : null}
                {uni.recommendationNote && (
                  <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
                    <p className="text-xs font-medium text-blue-700 mb-1">💡 Tip</p>
                    <p className="text-xs text-blue-800">{uni.recommendationNote}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="flex gap-2">
            {uni.stemDesignated && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">STEM OPT</span>}
            {uni.funded && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">Funded</span>}
            {uni.deadlineFall && <span className="text-xs text-slate-400">Due: {uni.deadlineFall}</span>}
          </div>
          {uni.officialURL && (
            <a href={uni.officialURL} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700 transition-colors">
              Apply <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ── Incomplete profile gate ───────────────────────────────────────────────────
function IncompleteGate({ profile }: { profile: any }) {
  const missing = [];
  if (!profile.gpa) missing.push("GPA");
  if (!profile.fieldOfStudy) missing.push("Field of Study");
  if (!profile.budgetRange) missing.push("Budget");
  if (!profile.preferredCountries?.length) missing.push("Preferred Countries");

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50">
        <User className="h-10 w-10 text-blue-500" />
      </div>
      <h2 className="text-2xl text-slate-900 mb-2">Complete your profile first</h2>
      <p className="text-slate-500 max-w-md mb-2">
        We need a few details to find the right universities for you.
      </p>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {missing.map(m => (
          <span key={m} className="rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-sm text-orange-700">
            Missing: {m}
          </span>
        ))}
      </div>
      <Link to="/profile"
        className="flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-3 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors">
        Complete Profile <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Recommendations() {
  const [profile] = usePersistentState(STORAGE_KEYS.profile, defaultProfile);
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"buckets" | "all">("buckets");
  const [goals, setGoals] = useState({ wantResearch: false, wantPR: false, wantAffordable: false, wantIndustry: false });

  const complete = isProfileComplete(profile);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRecommendations(profile, goals, { useGemini: true });
      setData(res);
    } catch {
      setError("Cannot connect to backend. Make sure it's running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (complete) fetch(); }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f0f5ff_0%,#f8fafc_60%)] py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-600 mb-1">AI-Powered</p>
          <h1 className="text-3xl text-slate-900">University Recommendations</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Based on your profile · {profile.gpa} GPA · {profile.desiredDegree} · {profile.fieldOfStudy}
          </p>
        </motion.div>

        {/* Profile gate */}
        {!complete && <IncompleteGate profile={profile} />}

        {complete && (
          <>
            {/* Goals + controls */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-3xl bg-white border border-slate-200/70 p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-700 mb-3">Refine by goal</p>
              <div className="flex flex-wrap items-center gap-3">
                {[
                  { key: "wantResearch",   label: "Research Focus", icon: BookOpen },
                  { key: "wantPR",         label: "PR Pathway",     icon: Globe },
                  { key: "wantAffordable", label: "Affordable",     icon: DollarSign },
                  { key: "wantIndustry",   label: "Industry Jobs",  icon: TrendingUp },
                ].map(({ key, label, icon: Icon }) => (
                  <button key={key}
                    onClick={() => setGoals(g => ({ ...g, [key]: !g[key as keyof typeof g] }))}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-all ${
                      goals[key as keyof typeof goals]
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                    }`}>
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </button>
                ))}
                <button onClick={fetch} disabled={loading}
                  className="ml-auto flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60 shadow-sm transition-colors">
                  {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                  {loading ? "Loading..." : "Update"}
                </button>
              </div>
            </motion.div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-rose-800">Connection error</p>
                  <p className="text-sm text-rose-700 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse">
                    <div className="h-3 w-20 rounded bg-slate-100 mb-3" />
                    <div className="h-5 w-2/3 rounded bg-slate-100 mb-2" />
                    <div className="h-3 w-1/2 rounded bg-slate-100 mb-4" />
                    <div className="h-2 w-full rounded bg-slate-100 mb-1" />
                    <div className="h-2 w-4/5 rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            )}

            {/* Results */}
            {data && !loading && (
              <>
                {/* Stats bar */}
                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: "Total Matches", value: data.total, icon: GraduationCap, color: "text-blue-500 bg-blue-50" },
                    { label: "Avg Cost/Year", value: `$${data.summary.avgCost?.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
                    { label: "Safe Picks", value: data.safe.length, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
                    { label: "Reach Schools", value: data.reach.length, icon: Target, color: "text-rose-500 bg-rose-50" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="rounded-2xl bg-white border border-slate-200/70 p-4 shadow-sm">
                      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-xl mb-2 ${color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-xl font-semibold text-slate-900">{value}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Tab toggle */}
                <div className="mb-6 flex gap-2">
                  {(["buckets", "all"] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                        tab === t ? "bg-blue-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"
                      }`}>
                      {t === "buckets" ? "By Category" : "All Results"}
                    </button>
                  ))}
                  {data.geminiUsed && (
                    <span className="ml-auto flex items-center gap-1.5 text-xs text-purple-600">
                      <Sparkles className="h-3.5 w-3.5" /> AI Enhanced
                    </span>
                  )}
                </div>

                {tab === "buckets" ? (
                  <div className="space-y-10">
                    {[
                      { title: "Safe Picks", subtitle: "High confidence — strong match for your profile", unis: data.safe, color: "text-emerald-700", dot: "bg-emerald-500" },
                      { title: "Good Matches", subtitle: "Competitive but achievable with a strong application", unis: data.match, color: "text-amber-700", dot: "bg-amber-400" },
                      { title: "Reach Schools", subtitle: "Ambitious — apply if you want to aim high", unis: data.reach, color: "text-rose-700", dot: "bg-rose-500" },
                    ].filter(s => s.unis.length > 0).map(({ title, subtitle, unis, color, dot }) => (
                      <div key={title}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`h-3 w-3 rounded-full ${dot}`} />
                          <div>
                            <h2 className={`text-lg font-semibold ${color}`}>{title}</h2>
                            <p className="text-sm text-slate-500">{subtitle}</p>
                          </div>
                          <span className="ml-auto rounded-full bg-white border border-slate-200 px-3 py-0.5 text-sm text-slate-600">{unis.length}</span>
                        </div>
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                          {unis.map((u, i) => <UniCard key={u.id} uni={u} index={i} />)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {data.results.map((u, i) => <UniCard key={u.id} uni={u} index={i} />)}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
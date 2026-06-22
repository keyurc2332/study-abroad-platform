import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Award, BookOpen, Calendar, DollarSign, ExternalLink,
  Filter, Globe, Loader2, RefreshCw, Search, Sparkles, Star, TrendingUp,
} from "lucide-react";
import { STORAGE_KEYS, defaultProfile, usePersistentState } from "../data/studyAbroadData";

interface ExternalScholarship {
  id: string;
  name: string;
  country: string;
  amount: string;
  amountUSD: number;
  deadline: string;
  eligibility: string[];
  fields: string[];
  levels: string[];
  link: string;
  competitive: string;
  description: string;
  // AI fields
  aiEnhanced?: boolean;
  matchScore?: number | null;
  matchLabel?: string | null;
  eligibilityNote?: string | null;
  tip?: string | null;
  priority?: string | null;
}

interface UniScholarship {
  id: string;
  name: string;
  country: string;
  city: string;
  ranking: number | null;
  tier: string | null;
  website: string | null;
  fulbrightEligible: boolean | null;
  cheveningEligible: boolean | null;
  daadEligible: boolean | null;
  commonwealthEligible: boolean | null;
  programs: { name: string; field: string; level: string; funded: boolean; stipendUSD: number | null }[];
}

interface ScholarshipResponse {
  success: boolean;
  external: ExternalScholarship[];
  universities: UniScholarship[];
  total: number;
  aiUsed: boolean;
}

const COMPETITIVE_COLOR: Record<string, string> = {
  "Extremely High": "text-red-700 bg-red-50 border-red-200",
  "Very High":      "text-orange-700 bg-orange-50 border-orange-200",
  "High":           "text-amber-700 bg-amber-50 border-amber-200",
  "Medium":         "text-green-700 bg-green-50 border-green-200",
};

const PRIORITY_COLOR: Record<string, string> = {
  "High":   "bg-emerald-500",
  "Medium": "bg-amber-400",
  "Low":    "bg-slate-300",
};

const FLAGS: Record<string, string> = {
  USA: "🇺🇸", UK: "🇬🇧", Canada: "🇨🇦", Australia: "🇦🇺",
  Germany: "🇩🇪", Europe: "🇪🇺", Multiple: "🌍",
};

export default function ScholarshipSuggestions() {
  const [profile] = usePersistentState(STORAGE_KEYS.profile, defaultProfile);
  const [data, setData] = useState<ScholarshipResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("All");
  const [tab, setTab] = useState<"external" | "universities">("external");

  const level = profile.desiredDegree === "Master's" ? "MS"
    : profile.desiredDegree === "Bachelor's" ? "UG" : "PhD";

  const fetchScholarships = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ nationality: "India", level, useAI: "true" });
      const res = await fetch(`/api/v1/scholarships?${params}`);
      const json = await res.json();
      if (json.success) setData(json);
      else setError("Failed to load scholarships");
    } catch {
      setError("Cannot connect to backend. Make sure it's running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchScholarships(); }, []);

  const filteredExternal = (data?.external || []).filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchCountry = filterCountry === "All" || s.country === filterCountry;
    return matchSearch && matchCountry;
  });

  const countries = [...new Set((data?.external || []).map(s => s.country))];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f0f5ff_0%,#f8fafc_60%)] py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-600 mb-1">AI-Powered</p>
          <h1 className="text-3xl text-slate-900">Scholarship Suggestions</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Matched to your profile · {profile.desiredDegree} · {profile.fieldOfStudy || "All fields"}
            {data?.aiUsed && (
              <span className="ml-2 inline-flex items-center gap-1 text-purple-600">
                <Sparkles className="h-3.5 w-3.5" /> AI match scores active
              </span>
            )}
          </p>
        </motion.div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "External Scholarships", value: data?.external.length ?? "—", icon: Award, color: "text-purple-600 bg-purple-50" },
            { label: "Universities with Aid", value: data?.universities.length ?? "—", icon: Globe, color: "text-blue-500 bg-blue-50" },
            { label: "Total Opportunities", value: data?.total ?? "—", icon: Sparkles, color: "text-emerald-600 bg-emerald-50" },
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

        {/* Search + Filter */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-3xl bg-white border border-slate-200/70 p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search scholarships..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none">
              <option value="All">All Countries</option>
              {countries.map(c => <option key={c} value={c}>{FLAGS[c] ?? "🌍"} {c}</option>)}
            </select>
            <button onClick={fetchScholarships} disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm text-white hover:bg-blue-700 disabled:opacity-60 transition-colors">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </button>
          </div>
        </motion.div>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-slate-500">Finding scholarships · AI analysis in progress...</p>
            </div>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Tabs */}
            <div className="mb-6 flex gap-2">
              {[
                { key: "external", label: `External Scholarships (${filteredExternal.length})` },
                { key: "universities", label: `University Aid (${data.universities.length})` },
              ].map(({ key, label }) => (
                <button key={key} onClick={() => setTab(key as any)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                    tab === key ? "bg-blue-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"
                  }`}>
                  {label}
                </button>
              ))}
            </div>

            {/* External Scholarships */}
            {tab === "external" && (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredExternal.map((s, i) => (
                  <motion.article key={s.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
                    <div className={`h-1 w-full ${
                      s.priority === "High" ? "bg-emerald-500" :
                      s.priority === "Medium" ? "bg-amber-400" : "bg-slate-200"
                    }`} />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="text-lg">{FLAGS[s.country] ?? "🌍"}</span>
                            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${COMPETITIVE_COLOR[s.competitive] ?? "text-slate-600 bg-slate-50 border-slate-200"}`}>
                              {s.competitive} competition
                            </span>
                            {s.aiEnhanced && s.priority && (
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${PRIORITY_COLOR[s.priority] ?? "bg-slate-400"}`}>
                                {s.priority} Priority
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-semibold text-slate-900 leading-snug">{s.name}</h3>
                          <p className="text-sm text-slate-500 mt-1">{s.description}</p>
                        </div>
                        {/* AI match score */}
                        {s.matchScore != null && (
                          <div className="flex flex-col items-center rounded-2xl bg-purple-50 border border-purple-100 px-3 py-2 shrink-0">
                            <span className="text-lg font-bold text-purple-700">{s.matchScore}</span>
                            <span className="text-xs text-purple-500">match</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <DollarSign className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <span className="font-medium text-emerald-700">{s.amount}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          Deadline: <span className="font-medium">{s.deadline}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <BookOpen className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          {s.levels.join(", ")} · {s.fields.slice(0, 2).join(", ")}
                        </div>
                      </div>

                      {/* AI eligibility note */}
                      {s.eligibilityNote && (
                        <div className="mb-3 rounded-xl bg-purple-50 border border-purple-100 p-3 text-xs text-purple-800">
                          <p className="font-medium mb-0.5 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> AI Assessment
                          </p>
                          <p>{s.eligibilityNote}</p>
                        </div>
                      )}

                      {/* AI tip */}
                      {s.tip && (
                        <div className="mb-3 rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-800">
                          <p className="font-medium mb-0.5">💡 Tip</p>
                          <p>{s.tip}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {s.eligibility.slice(0, 3).map(e => (
                          <span key={e} className="rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-xs text-blue-700">{e}</span>
                        ))}
                      </div>

                      {s.matchLabel && (
                        <p className="mb-3 text-xs font-medium text-slate-600">
                          Match: <span className="text-purple-700">{s.matchLabel}</span>
                        </p>
                      )}

                      <a href={s.link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 py-2.5 text-sm text-white hover:bg-blue-700 transition-colors">
                        Apply Now <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </motion.article>
                ))}
                {filteredExternal.length === 0 && (
                  <div className="col-span-3 text-center py-16 text-slate-400">No scholarships match your filters.</div>
                )}
              </div>
            )}

            {/* University Aid */}
            {tab === "universities" && (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {data.universities.map((u, i) => (
                  <motion.article key={u.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">{FLAGS[u.country] ?? "🌍"} {u.name}</h3>
                        <p className="text-sm text-slate-500">{u.city}, {u.country}</p>
                      </div>
                      {u.ranking && (
                        <span className="flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-xs text-amber-700 shrink-0">
                          <Star className="h-3 w-3" /> #{u.ranking}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {u.fulbrightEligible && <span className="rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-xs text-blue-700">Fulbright</span>}
                      {u.cheveningEligible && <span className="rounded-full bg-purple-50 border border-purple-100 px-2 py-0.5 text-xs text-purple-700">Chevening</span>}
                      {u.daadEligible && <span className="rounded-full bg-yellow-50 border border-yellow-100 px-2 py-0.5 text-xs text-yellow-700">DAAD</span>}
                      {u.commonwealthEligible && <span className="rounded-full bg-green-50 border border-green-100 px-2 py-0.5 text-xs text-green-700">Commonwealth</span>}
                    </div>
                    {u.programs.filter(p => p.funded).length > 0 && (
                      <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-100 mb-3">
                        <p className="font-medium mb-1">✓ Funded programs available</p>
                        {u.programs.filter(p => p.funded).slice(0, 2).map(p => (
                          <p key={p.name} className="text-emerald-700">
                            {p.name}{p.stipendUSD ? ` · $${p.stipendUSD.toLocaleString()}/yr` : ""}
                          </p>
                        ))}
                      </div>
                    )}
                    {u.website && (
                      <a href={u.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-200 py-2 text-sm text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
                        Visit University <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </motion.article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
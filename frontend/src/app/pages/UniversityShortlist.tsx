import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, useCallback } from "react";
import {
  Building2, DollarSign, ExternalLink, Globe,
  Heart, Loader2, MapPin, Search, Sparkles, Star,
  SlidersHorizontal, X, TrendingUp, GraduationCap,
} from "lucide-react";
import { STORAGE_KEYS, appendActivity, usePersistentState } from "../data/studyAbroadData";

interface Program {
  name: string;
  field: string;
  level: string;
  tuitionUSD: number | null;
  deadlineFall: string | null;
  stemDesignated: boolean;
  funded: boolean;
}

interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  state: string | null;
  ranking: number | null;
  acceptanceRate: number | null;
  website: string | null;
  tier: string | null;
  competitivenessScore: number | null;
  typicalGPAMin: number | null;
  typicalGPAMax: number | null;
  researchIntensity: string | null;
  jobMarketScore: number | null;
  programs: Program[];
}

interface ApiResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  universities: University[];
  countries: string[];
}

const FLAGS: Record<string, string> = {
  USA: "🇺🇸", UK: "🇬🇧", Canada: "🇨🇦",
  Australia: "🇦🇺", Germany: "🇩🇪", France: "🇫🇷",
  Netherlands: "🇳🇱", Ireland: "🇮🇪", Singapore: "🇸🇬",
  "New Zealand": "🇳🇿",
};

const TIER_STYLE: Record<string, string> = {
  ELITE:      "bg-purple-50 text-purple-700 border-purple-200",
  TOP:        "bg-blue-50 text-blue-700 border-blue-200",
  STRONG:     "bg-indigo-50 text-indigo-700 border-indigo-200",
  GOOD:       "bg-emerald-50 text-emerald-700 border-emerald-200",
  ACCESSIBLE: "bg-slate-50 text-slate-600 border-slate-200",
};

function UniCard({
  uni, index, isShortlisted, onToggle,
}: {
  uni: University;
  index: number;
  isShortlisted: boolean;
  onToggle: (id: string, name: string) => void;
}) {
  const fields = [...new Set((uni.programs || []).map(p => p.field).filter(Boolean))].slice(0, 3);
  const minTuition = (uni.programs || []).reduce((min, p) =>
    p.tuitionUSD && p.tuitionUSD < (min ?? Infinity) ? p.tuitionUSD : min, null as number | null);
  const hasStem = (uni.programs || []).some(p => p.stemDesignated);
  const hasFunded = (uni.programs || []).some(p => p.funded);
  const topDeadline = (uni.programs || []).find(p => p.deadlineFall)?.deadlineFall;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.5) }}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      <div className={`h-1 w-full ${
        uni.tier === "ELITE" ? "bg-purple-500" :
        uni.tier === "TOP" ? "bg-blue-500" :
        uni.tier === "STRONG" ? "bg-indigo-500" :
        uni.tier === "GOOD" ? "bg-emerald-500" : "bg-slate-200"
      }`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {uni.tier && (
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${TIER_STYLE[uni.tier] ?? TIER_STYLE.ACCESSIBLE}`}>
                  {uni.tier}
                </span>
              )}
              {hasStem && <span className="rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-xs text-blue-700">STEM</span>}
              {hasFunded && <span className="rounded-full bg-green-50 border border-green-100 px-2 py-0.5 text-xs text-green-700">Funded</span>}
            </div>
            <h3 className="text-base font-semibold text-slate-900 leading-snug">
              {FLAGS[uni.country] ?? "🌍"} {uni.name}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3 flex-shrink-0" /> {uni.city}, {uni.country}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {uni.ranking && (
              <div className="flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-xs text-amber-700">
                <Star className="h-3 w-3" /> #{uni.ranking}
              </div>
            )}
            <button
              onClick={() => onToggle(uni.id, uni.name)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                isShortlisted ? "bg-red-500 text-white" : "bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500"
              }`}
            >
              <Heart className="h-4 w-4" fill={isShortlisted ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
          {minTuition != null && (
            <span className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-slate-400" />
              From ${minTuition.toLocaleString()}/yr
            </span>
          )}
          {uni.acceptanceRate != null && (
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
              {uni.acceptanceRate}% accept
            </span>
          )}
          {uni.researchIntensity && (
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-slate-400" />
              {uni.researchIntensity}
            </span>
          )}
        </div>

        {uni.typicalGPAMin != null && uni.typicalGPAMax != null && (
          <p className="text-xs text-slate-400 mb-3">
            Typical GPA: <span className="font-medium text-slate-600">{uni.typicalGPAMin}–{uni.typicalGPAMax}</span>
          </p>
        )}

        {fields.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {fields.map(f => (
              <span key={f} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{f}</span>
            ))}
            {(uni.programs || []).length > 3 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
                +{uni.programs.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          {topDeadline && (
            <p className="text-xs text-slate-400">Due: <span className="text-slate-600">{topDeadline}</span></p>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {uni.website && (
              <a href={uni.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
                <ExternalLink className="h-3 w-3" /> Visit
              </a>
            )}
            <button onClick={() => onToggle(uni.id, uni.name)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                isShortlisted ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-blue-600 text-white hover:bg-blue-700"
              }`}>
              {isShortlisted ? "Shortlisted ✓" : "Shortlist"}
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function UniversityShortlist() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const LIMIT = 18;

  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedTier, setSelectedTier] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  // Safe shortlist — always a string array
  const [shortlistedRaw, setShortlisted] = usePersistentState<any>(
    STORAGE_KEYS.shortlistedUniversityIds, []
  );
  const shortlisted: string[] = Array.isArray(shortlistedRaw)
    ? shortlistedRaw.filter((x: any) => typeof x === "string")
    : [];

  const fetchUniversities = useCallback(async (p = 0, reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(p),
        limit: String(LIMIT),
        ...(selectedCountry !== "All" && { country: selectedCountry }),
        ...(selectedTier !== "All" && { tier: selectedTier }),
        ...(search && { search }),
      });

      const res = await fetch(`/api/v1/universities?${params}`);
      const data: ApiResponse = await res.json();

      if (data.success) {
        setUniversities(prev => (reset || p === 0) ? (data.universities || []) : [...prev, ...(data.universities || [])]);
        setTotal(data.total ?? 0);
        if (p === 0 && data.countries?.length > 0) setCountries(data.countries);
      }
    } catch (err) {
      console.error("Failed to fetch universities:", err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCountry, selectedTier]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchUniversities(0, true);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, selectedCountry, selectedTier]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchUniversities(next, false);
  };

  const toggleShortlist = (id: string, name: string) => {
    const isIn = shortlisted.includes(id);
    setShortlisted(isIn ? shortlisted.filter(s => s !== id) : [...shortlisted, id]);
    appendActivity({
      action: isIn ? `Removed ${name} from shortlist` : `Shortlisted ${name}`,
      path: "/universities",
      type: "university",
    });
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCountry("All");
    setSelectedTier("All");
  };

  const hasFilters = search || selectedCountry !== "All" || selectedTier !== "All";
  const hasMore = universities.length < total;
  const shortlistCount = shortlisted.length;
  const uniCount = universities.length;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f0f5ff_0%,#f8fafc_60%)] py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-600 mb-1">
            {total > 0 ? `${total.toLocaleString()} Universities` : "Loading..."}
          </p>
          <h1 className="text-3xl text-slate-900">University Shortlist</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Browse real universities from our database · {shortlistCount} shortlisted
          </p>
        </motion.div>

        {/* Search + Filters */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-3xl bg-white border border-slate-200/70 p-4 shadow-sm sm:p-5">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search universities or cities..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                showFilters || hasFilters ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"
              }`}>
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="mt-4 flex flex-wrap gap-3">
                  <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none">
                    <option value="All">All Countries</option>
                    {countries.map(c => <option key={c} value={c}>{FLAGS[c] ?? "🌍"} {c}</option>)}
                  </select>
                  <select value={selectedTier} onChange={e => setSelectedTier(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none">
                    <option value="All">All Tiers</option>
                    {["ELITE", "TOP", "STRONG", "GOOD", "ACCESSIBLE"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {hasFilters && (
                    <button onClick={clearFilters}
                      className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100 transition-colors">
                      <X className="h-3.5 w-3.5" /> Clear
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "Total Found", value: total > 0 ? total.toLocaleString() : "—", icon: Building2, color: "text-blue-500 bg-blue-50" },
            { label: "Shortlisted", value: shortlistCount, icon: Heart, color: "text-red-500 bg-red-50" },
            { label: "Showing", value: uniCount, icon: GraduationCap, color: "text-emerald-600 bg-emerald-50" },
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

        {/* Shortlisted banner */}
        {shortlistCount > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5" fill="white" />
                <div>
                  <p className="text-sm font-medium">{shortlistCount} universities shortlisted</p>
                  <p className="text-xs text-blue-200">These appear on your Dashboard with deadlines</p>
                </div>
              </div>
              <button onClick={() => setShortlisted([])}
                className="rounded-xl bg-white/20 px-3 py-1.5 text-xs hover:bg-white/30 transition-colors">
                Clear all
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading skeleton */}
        {loading && uniCount === 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse">
                <div className="h-3 w-16 rounded bg-slate-100 mb-3" />
                <div className="h-5 w-3/4 rounded bg-slate-100 mb-2" />
                <div className="h-3 w-1/2 rounded bg-slate-100 mb-4" />
                <div className="h-2 w-full rounded bg-slate-100 mb-2" />
                <div className="h-2 w-4/5 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        {uniCount > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {universities.map((uni, i) => (
              <UniCard key={uni.id} uni={uni} index={i}
                isShortlisted={shortlisted.includes(uni.id)}
                onToggle={toggleShortlist}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && uniCount === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Building2 className="h-16 w-16 text-slate-200 mb-4" />
            <p className="text-slate-500">No universities found. Try adjusting your filters.</p>
            {hasFilters && (
              <button onClick={clearFilters}
                className="mt-4 rounded-xl bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700">
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Load more */}
        {hasMore && !loading && (
          <div className="mt-8 flex justify-center">
            <button onClick={loadMore}
              className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-8 py-3 text-sm text-slate-700 hover:border-blue-400 hover:text-blue-600 shadow-sm transition-colors">
              Load more universities
            </button>
          </div>
        )}

        {loading && uniCount > 0 && (
          <div className="mt-8 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        )}

      </div>
    </div>
  );
}
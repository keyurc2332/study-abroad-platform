import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2, Calendar, CheckCircle, ChevronDown, Clock,
  ExternalLink, Loader2, MapPin, Plus, Search, Star,
  Trash2, TrendingUp, X, XCircle,
} from "lucide-react";

interface University {
  name: string;
  country: string;
  city: string;
  ranking: number | null;
  tier: string | null;
  website: string | null;
}

interface Application {
  id: string;
  universityId: string;
  programId: string | null;
  status: string;
  deadline: string | null;
  notes: string | null;
  createdAt: string;
  university: University;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  shortlisted: { label: "Shortlisted", color: "text-slate-600", bg: "bg-slate-100", icon: <Star className="h-3.5 w-3.5" /> },
  applying:    { label: "Applying",    color: "text-blue-700",  bg: "bg-blue-50",   icon: <Clock className="h-3.5 w-3.5" /> },
  applied:     { label: "Applied",     color: "text-indigo-700",bg: "bg-indigo-50", icon: <CheckCircle className="h-3.5 w-3.5" /> },
  interview:   { label: "Interview",   color: "text-amber-700", bg: "bg-amber-50",  icon: <TrendingUp className="h-3.5 w-3.5" /> },
  offer:       { label: "Offer 🎉",    color: "text-emerald-700",bg: "bg-emerald-50",icon: <CheckCircle className="h-3.5 w-3.5" /> },
  rejected:    { label: "Rejected",    color: "text-red-700",   bg: "bg-red-50",    icon: <XCircle className="h-3.5 w-3.5" /> },
};

const STATUSES = Object.keys(STATUS_CONFIG);

const FLAGS: Record<string, string> = {
  USA: "🇺🇸", UK: "🇬🇧", Canada: "🇨🇦",
  Australia: "🇦🇺", Germany: "🇩🇪",
};

export default function ApplicationTracker() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Add modal state
  const [showAdd, setShowAdd] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [addResults, setAddResults] = useState<any[]>([]);
  const [addLoading, setAddLoading] = useState(false);
  const [selectedUni, setSelectedUni] = useState<any | null>(null);
  const [newDeadline, setNewDeadline] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/applications");
      const data = await res.json();
      if (data.success) setApplications(data.applications);
      else setError("Failed to load applications");
    } catch {
      setError("Cannot connect to backend. Make sure it's running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  // Search universities to add
  useEffect(() => {
    if (!addSearch || addSearch.length < 2) { setAddResults([]); return; }
    const timer = setTimeout(async () => {
      setAddLoading(true);
      try {
        const res = await fetch(`/api/v1/universities?search=${encodeURIComponent(addSearch)}&limit=8`);
        const data = await res.json();
        if (data.success) setAddResults(data.universities || []);
      } catch { setAddResults([]); }
      setAddLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [addSearch]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/v1/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setApplications(prev => prev.map(a => a.id === id ? data.application : a));
      }
    } catch { console.error("Update failed"); }
  };

  const deleteApplication = async (id: string) => {
    try {
      await fetch(`/api/v1/applications/${id}`, { method: "DELETE" });
      setApplications(prev => prev.filter(a => a.id !== id));
    } catch { console.error("Delete failed"); }
  };

  const addApplication = async () => {
    if (!selectedUni) return;
    setAddingId(selectedUni.id);
    try {
      const res = await fetch("/api/v1/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          universityId: selectedUni.name,
          deadline: newDeadline || null,
          notes: newNotes || null,
          status: "shortlisted",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setApplications(prev => [data.application, ...prev]);
        setShowAdd(false);
        setSelectedUni(null);
        setAddSearch("");
        setNewDeadline("");
        setNewNotes("");
      } else {
        alert(data.message || "Failed to add");
      }
    } catch { alert("Failed to connect"); }
    setAddingId(null);
  };

  const filtered = applications.filter(a => {
    const matchSearch = !search || a.university.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = applications.filter(a => a.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f0f5ff_0%,#f8fafc_60%)] py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-blue-600 mb-1">Phase 2</p>
            <h1 className="text-3xl text-slate-900">Application Tracker</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Track your applications across {applications.length} universities
            </p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors">
            <Plus className="h-4 w-4" /> Add University
          </button>
        </motion.div>

        {/* Status pipeline */}
        <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {STATUSES.map(s => {
            const cfg = STATUS_CONFIG[s];
            return (
              <button key={s} onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
                className={`rounded-2xl border p-3 text-center transition-all ${
                  filterStatus === s ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-blue-200"
                }`}>
                <p className="text-xl font-semibold text-slate-900">{statusCounts[s] || 0}</p>
                <p className={`text-xs mt-0.5 font-medium ${cfg.color}`}>{cfg.label}</p>
              </button>
            );
          })}
        </div>

        {/* Search bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search universities..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Empty state */}
        {!loading && applications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Building2 className="h-16 w-16 text-slate-200 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">No applications yet</h3>
            <p className="text-sm text-slate-500 mb-6">Click "Add University" to start tracking your applications</p>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm text-white hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Add Your First University
            </button>
          </div>
        )}

        {/* Applications list */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((app, i) => {
              const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.shortlisted;
              const isDeadlineSoon = app.deadline &&
                new Date(app.deadline).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000;

              return (
                <motion.div key={app.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    {/* University info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-slate-900">
                          {FLAGS[app.university.country] ?? "🌍"} {app.university.name}
                        </h3>
                        {app.university.ranking && (
                          <span className="flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                            <Star className="h-2.5 w-2.5" />#{app.university.ranking}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {app.university.city}, {app.university.country}
                      </p>
                      {app.deadline && (
                        <p className={`mt-1 text-xs flex items-center gap-1.5 ${isDeadlineSoon ? "text-red-600 font-medium" : "text-slate-400"}`}>
                          <Calendar className="h-3.5 w-3.5" />
                          Deadline: {new Date(app.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          {isDeadlineSoon && " ⚠️ Soon!"}
                        </p>
                      )}
                      {app.notes && (
                        <p className="mt-1.5 text-xs text-slate-500 italic">"{app.notes}"</p>
                      )}
                    </div>

                    {/* Status + actions */}
                    <div className="flex items-center gap-3">
                      {/* Status dropdown */}
                      <div className="relative">
                        <select
                          value={app.status}
                          onChange={e => updateStatus(app.id, e.target.value)}
                          className={`appearance-none rounded-xl border px-3 py-2 pr-7 text-xs font-medium cursor-pointer transition-colors ${cfg.bg} ${cfg.color} border-current/20 focus:outline-none`}
                        >
                          {STATUSES.map(s => (
                            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none opacity-50" />
                      </div>

                      {app.university.website && (
                        <a href={app.university.website} target="_blank" rel="noopener noreferrer"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}

                      <button onClick={() => deleteApplication(app.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && applications.length > 0 && (
          <div className="text-center py-16 text-slate-400">No applications match your filter.</div>
        )}

        {/* Add University Modal */}
        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-slate-900">Add University to Tracker</h3>
                  <button onClick={() => setShowAdd(false)} className="rounded-xl p-2 hover:bg-slate-100 transition-colors">
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="text" value={addSearch} onChange={e => { setAddSearch(e.target.value); setSelectedUni(null); }}
                    placeholder="Search university name..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                    autoFocus
                  />
                </div>

                {/* Results */}
                {addLoading && <div className="text-center py-4"><Loader2 className="h-5 w-5 animate-spin text-blue-600 mx-auto" /></div>}
                {addResults.length > 0 && !selectedUni && (
                  <div className="mb-4 rounded-2xl border border-slate-200 overflow-hidden max-h-60 overflow-y-auto">
                    {addResults.map(u => (
                      <button key={u.id} onClick={() => { setSelectedUni(u); setAddSearch(u.name); setAddResults([]); }}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{FLAGS[u.country] ?? "🌍"} {u.name}</p>
                          <p className="text-xs text-slate-500">{u.city}, {u.country}</p>
                        </div>
                        {u.ranking && <span className="text-xs text-amber-600">#{u.ranking}</span>}
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected + extra fields */}
                {selectedUni && (
                  <div className="mb-4 rounded-2xl bg-blue-50 border border-blue-100 p-4">
                    <p className="text-sm font-medium text-blue-800">{FLAGS[selectedUni.country] ?? "🌍"} {selectedUni.name}</p>
                    <p className="text-xs text-blue-600">{selectedUni.city}, {selectedUni.country}</p>
                  </div>
                )}

                <div className="space-y-3 mb-5">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1.5">Application Deadline (optional)</label>
                    <input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1.5">Notes (optional)</label>
                    <input type="text" value={newNotes} onChange={e => setNewNotes(e.target.value)}
                      placeholder="e.g. Contact prof by Oct 1"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowAdd(false)}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={addApplication} disabled={!selectedUni || !!addingId}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm text-white hover:bg-blue-700 disabled:opacity-60 transition-colors">
                    {addingId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Add to Tracker
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
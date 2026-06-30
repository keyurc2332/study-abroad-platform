import { motion } from "framer-motion";
import { useState, type ChangeEvent, type ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight, BookOpen, Briefcase, Calendar, Edit2,
  GraduationCap, Mail, Phone, Save, Sparkles, User, X,
} from "lucide-react";
import {
  STORAGE_KEYS, appendActivity, defaultProfile,
  type ProfileData, usePersistentState,
} from "../data/studyAbroadData";

const COUNTRIES = ["United States", "United Kingdom", "Canada", "Australia", "Germany", "Japan"];
const DEGREES   = ["Bachelor's", "Master's", "PhD", "Diploma"];
const FIELDS    = ["Computer Science","Artificial Intelligence","Data Science","Engineering","Business","Finance","Medicine","Law","Architecture","Arts & Design"];
const BUDGETS   = ["Under $20,000","$20,000 - $40,000","$40,000 - $60,000","$60,000 - $80,000","Over $80,000"];
const LANG_TESTS = ["IELTS 6.0","IELTS 6.5","IELTS 7.0","IELTS 7.5","IELTS 8.0","TOEFL 80","TOEFL 90","TOEFL 100","TOEFL 110","Duolingo 110","Duolingo 125","PTE 58","PTE 65"];

function isProfileComplete(p: ProfileData) {
  return !!(p.fullName && p.gpa && p.desiredDegree && p.fieldOfStudy && p.budgetRange && p.preferredCountries.length);
}

export default function Profile() {
  const [profile, setProfile] = usePersistentState(STORAGE_KEYS.profile, defaultProfile);
  const [draft, setDraft] = useState<ProfileData>(profile);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setDraft({ ...draft, [e.target.name]: e.target.value });
  };

  const toggleCountry = (c: string) => {
    const has = draft.preferredCountries.includes(c);
    setDraft({ ...draft, preferredCountries: has ? draft.preferredCountries.filter(x => x !== c) : [...draft.preferredCountries, c] });
  };

  const handleSave = () => {
    setProfile(draft);
    setIsEditing(false);
    appendActivity({ action: "Updated profile preferences", path: "/profile", type: "profile" });
  };

  const active = isEditing ? draft : profile;
  const complete = isProfileComplete(profile);
  const initials = profile.fullName.split(" ").map(n => n[0]).join("").slice(0, 2);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f0f5ff_0%,#f8fafc_60%)] py-6 sm:py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-blue-600 mb-1">Your Profile</p>
            <h1 className="text-3xl text-slate-900">Study Preferences</h1>
            <p className="mt-1.5 text-sm text-slate-500">Tell us about yourself so we can find the best universities for you.</p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button onClick={() => { setDraft(profile); setIsEditing(false); }}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <X className="h-4 w-4" /> Cancel
                </button>
                <button onClick={handleSave}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors">
                  <Save className="h-4 w-4" /> Save
                </button>
              </>
            ) : (
              <button onClick={() => { setDraft(profile); setIsEditing(true); }}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors">
                <Edit2 className="h-4 w-4" /> Edit Profile
              </button>
            )}
          </div>
        </motion.div>

        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-blue-900 p-6 text-white shadow-xl">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-2xl font-semibold backdrop-blur">
              {initials || <User className="h-8 w-8" />}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl text-white">{active.fullName || "Your Name"}</h2>
              <p className="text-sm text-blue-200">{active.currentEducation || "Add your education"}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {active.desiredDegree && <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs">{active.desiredDegree}</span>}
                {active.fieldOfStudy && <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs">{active.fieldOfStudy}</span>}
                {active.gpa && <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs">GPA: {active.gpa}</span>}
              </div>
            </div>
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ${complete ? "bg-green-500/20 text-green-300" : "bg-orange-500/20 text-orange-300"}`}>
              <div className={`h-1.5 w-1.5 rounded-full ${complete ? "bg-green-400" : "bg-orange-400"}`} />
              {complete ? "Profile complete" : "Incomplete"}
            </div>
          </div>
        </motion.div>

        <div className="space-y-5">

          {/* Personal Info */}
          <Section title="Personal Information" icon={<User className="h-4 w-4" />} delay={0.15}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name">
                <Input name="fullName" value={active.fullName} onChange={handleChange} disabled={!isEditing} placeholder="Aarav Sharma" icon={<User className="h-4 w-4" />} />
              </Field>
              <Field label="Email Address">
                <Input name="email" value={active.email} onChange={handleChange} disabled={!isEditing} type="email" placeholder="you@email.com" icon={<Mail className="h-4 w-4" />} />
              </Field>
              <Field label="Phone Number">
                <Input name="phone" value={active.phone} onChange={handleChange} disabled={!isEditing} type="tel" placeholder="+91 98765 43210" icon={<Phone className="h-4 w-4" />} />
              </Field>
              <Field label="Date of Birth">
                <Input name="dateOfBirth" value={active.dateOfBirth} onChange={handleChange} disabled={!isEditing} type="date" icon={<Calendar className="h-4 w-4" />} />
              </Field>
            </div>
          </Section>

          {/* Academic Info */}
          <Section title="Academic Background" icon={<GraduationCap className="h-4 w-4" />} delay={0.2}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Current Education">
                <Input name="currentEducation" value={active.currentEducation} onChange={handleChange} disabled={!isEditing} placeholder="B.Tech Computer Science" icon={<BookOpen className="h-4 w-4" />} />
              </Field>
              <Field label="GPA / Percentage">
                <Input name="gpa" value={active.gpa} onChange={handleChange} disabled={!isEditing} placeholder="8.4/10 or 85%" icon={<GraduationCap className="h-4 w-4" />} />
              </Field>
              <Field label="Target Degree">
                {isEditing ? (
                  <select name="desiredDegree" value={active.desiredDegree} onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100">
                    {DEGREES.map(d => <option key={d}>{d}</option>)}
                  </select>
                ) : (
                  <Input name="desiredDegree" value={active.desiredDegree} onChange={handleChange} disabled={true} />
                )}
              </Field>
              <Field label="Field of Study">
                {isEditing ? (
                  <select name="fieldOfStudy" value={active.fieldOfStudy} onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100">
                    <option value="">Select field...</option>
                    {FIELDS.map(f => <option key={f}>{f}</option>)}
                  </select>
                ) : (
                  <Input name="fieldOfStudy" value={active.fieldOfStudy} onChange={handleChange} disabled={true} />
                )}
              </Field>
              <Field label="English Proficiency">
                {isEditing ? (
                  <select name="englishProficiency" value={active.englishProficiency} onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100">
                    <option value="">Select test score...</option>
                    {LANG_TESTS.map(t => <option key={t}>{t}</option>)}
                  </select>
                ) : (
                  <Input name="englishProficiency" value={active.englishProficiency} onChange={handleChange} disabled={true} />
                )}
              </Field>
              <Field label="Work Experience">
                <Input name="workExperience" value={active.workExperience} onChange={handleChange} disabled={!isEditing} placeholder="e.g. 2 years, None" icon={<Briefcase className="h-4 w-4" />} />
              </Field>
            </div>
          </Section>

          {/* Study Preferences */}
          <Section title="Study Preferences" icon={<Sparkles className="h-4 w-4" />} delay={0.25}>
            <div className="space-y-5">
              <Field label="Preferred Countries">
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {COUNTRIES.map(c => {
                    const checked = active.preferredCountries.includes(c);
                    return (
                      <button key={c} type="button"
                        disabled={!isEditing}
                        onClick={() => isEditing && toggleCountry(c)}
                        className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm text-left transition-all ${
                          checked ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"
                        } ${isEditing ? "cursor-pointer hover:border-blue-400" : "opacity-80"}`}>
                        <div className={`h-4 w-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${checked ? "border-blue-500 bg-blue-500" : "border-slate-300"}`}>
                          {checked && <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 fill-white"><path d="M1 4l2.5 2.5L9 1"/></svg>}
                        </div>
                        {c}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Annual Budget (USD)">
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                    {BUDGETS.map(b => (
                      <button key={b} type="button" onClick={() => setDraft({ ...draft, budgetRange: b })}
                        className={`rounded-xl border px-3 py-2.5 text-xs text-center transition-all ${
                          draft.budgetRange === b ? "border-blue-500 bg-blue-50 text-blue-700 font-medium" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                        }`}>
                        {b}
                      </button>
                    ))}
                  </div>
                ) : (
                  <Input name="budgetRange" value={active.budgetRange} onChange={handleChange} disabled={true} />
                )}
              </Field>
            </div>
          </Section>

        </div>

        {/* CTA to Recommendations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="mt-8 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-xl shadow-blue-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg">Ready to see your matches?</h3>
              <p className="mt-1 text-sm text-blue-100">
                {complete
                  ? "Your profile is complete — view AI-powered university recommendations."
                  : "Complete your profile above to get personalized university recommendations."}
              </p>
            </div>
            <button
              onClick={() => { if (complete) navigate("/recommendations"); }}
              disabled={!complete}
              className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-medium whitespace-nowrap transition-all ${
                complete
                  ? "bg-white text-blue-700 hover:bg-blue-50 shadow-lg cursor-pointer"
                  : "bg-white/20 text-white/60 cursor-not-allowed"
              }`}>
              <Sparkles className="h-4 w-4" />
              Get Recommendations
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {!complete && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-blue-200">
              {!profile.gpa && <span className="rounded-full bg-white/10 px-2.5 py-1">+ Add GPA</span>}
              {!profile.fieldOfStudy && <span className="rounded-full bg-white/10 px-2.5 py-1">+ Add field of study</span>}
              {!profile.budgetRange && <span className="rounded-full bg-white/10 px-2.5 py-1">+ Add budget</span>}
              {!profile.preferredCountries.length && <span className="rounded-full bg-white/10 px-2.5 py-1">+ Select countries</span>}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}

function Section({ title, icon, children, delay = 0 }: { title: string; icon: ReactNode; children: ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">{icon}</div>
        <h3 className="text-base font-medium text-slate-900">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-600">{label}</label>
      {children}
    </div>
  );
}

function Input({ icon, disabled, ...props }: { icon?: ReactNode; disabled?: boolean; [k: string]: any }) {
  return (
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
      <input
        {...props}
        disabled={disabled}
        className={`w-full rounded-xl border border-slate-200 py-3 text-sm text-slate-800 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 ${icon ? "pl-9 pr-4" : "px-4"} ${disabled ? "bg-slate-50 text-slate-600" : "bg-white"}`}
      />
    </div>
  );
}
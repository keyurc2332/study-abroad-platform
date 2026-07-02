import { motion } from "motion/react";
import { Briefcase, Check, Clock, DollarSign, Globe2, GraduationCap, TrendingUp, X } from "lucide-react";
import {
  STORAGE_KEYS,
  appendActivity,
  countryData,
  defaultComparisonCountries,
  usePersistentState,
} from "../data/studyAbroadData";

type CountryName = keyof typeof countryData;

const availableCountries = Object.keys(countryData) as CountryName[];

const comparisonCategories = [
  { key: "tuitionRange", label: "Tuition Fees", icon: DollarSign },
  { key: "livingCost", label: "Living Cost", icon: DollarSign },
  { key: "studyDuration", label: "Study Duration", icon: Clock },
  { key: "languageRequirement", label: "Language Requirement", icon: Globe2 },
  { key: "workOpportunities", label: "Work Opportunities", icon: Briefcase },
  { key: "postStudyWork", label: "Post-Study Work", icon: TrendingUp },
] as const;

export default function CountryComparison() {
  const [selectedCountries, setSelectedCountries] = usePersistentState(
    STORAGE_KEYS.comparisonCountries,
    defaultComparisonCountries,
  );
  const validSelectedCountries = selectedCountries.filter(
    (country): country is CountryName => country in countryData,
  );

  const toggleCountry = (country: CountryName) => {
    if (validSelectedCountries.includes(country)) {
      const nextCountries = validSelectedCountries.filter((item) => item !== country);
      setSelectedCountries(nextCountries);
      appendActivity({
        action: `Removed ${country} from country comparison`,
        path: "/compare-countries",
        type: "comparison",
      });
      return;
    }

    if (validSelectedCountries.length >= 3) {
      return;
    }

    const nextCountries = [...validSelectedCountries, country];
    setSelectedCountries(nextCountries);
    appendActivity({
      action: `Compared ${nextCountries.join(", ")}`,
      path: "/compare-countries",
      type: "comparison",
    });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f3f7ff_55%,#f8fafc_100%)] py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <div className="overflow-hidden rounded-[28px] bg-slate-950 text-white shadow-[0_20px_70px_rgba(15,23,42,0.18)]">
            <div className="bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.25),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.18),transparent_28%),linear-gradient(135deg,#0f172a,#1d4ed8)] px-5 py-8 sm:px-8 sm:py-10">
              <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-sky-100">
                Destination planner
              </p>
              <h1 className="mt-4 max-w-2xl text-3xl leading-tight sm:text-4xl">
                Compare study destinations without fighting the layout.
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">
                Pick up to three countries, scan the key tradeoffs fast, and keep your dashboard in sync while you decide.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 rounded-[28px] border border-slate-200/70 bg-white/90 p-4 shadow-sm backdrop-blur sm:p-6"
        >
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg text-slate-900">Select Countries to Compare</h2>
              <p className="text-sm text-slate-600">Choose up to three destinations.</p>
            </div>
            <div className="inline-flex self-start rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
              {validSelectedCountries.length}/3 selected
            </div>
          </div>

          {validSelectedCountries.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {validSelectedCountries.map((country) => (
                <button
                  key={country}
                  onClick={() => toggleCountry(country)}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 transition-colors hover:bg-blue-100"
                >
                  <span>{country}</span>
                  <X className="h-4 w-4" />
                </button>
              ))}
            </div>
          )}

          <div className="mb-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Compare</p>
              <p className="mt-2 text-sm text-slate-700">Tuition, living costs, visa timing, and work options.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Best on mobile</p>
              <p className="mt-2 text-sm text-slate-700">Cards stack cleanly on smaller screens instead of forcing a wide table.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Saved state</p>
              <p className="mt-2 text-sm text-slate-700">Your picks persist and feed back into the dashboard.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {availableCountries.map((country) => {
              const isSelected = validSelectedCountries.includes(country);
              const info = countryData[country];

              return (
                <button
                  key={country}
                  onClick={() => toggleCountry(country)}
                  className={`group relative overflow-hidden rounded-[24px] border p-4 text-left transition-all ${
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-200"
                      : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
                  }`}
                >
                  <div className="absolute right-4 top-4">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
                        isSelected
                          ? "border-white/20 bg-white/10 text-white"
                          : "border-slate-200 bg-slate-50 text-transparent group-hover:text-slate-400"
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] opacity-80">{info.countryCode}</div>
                  <div className="mt-6 text-base">{country}</div>
                  <div className={`mt-3 text-sm ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                    {info.studyDuration}
                  </div>
                  <div className={`mt-1 text-sm ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                    {info.postStudyWork} post-study work
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {validSelectedCountries.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="hidden overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-5 text-left text-sm text-slate-900">Category</th>
                      {validSelectedCountries.map((country) => (
                        <th key={country} className="px-6 py-4">
                          <div className="flex flex-col items-center">
                            <div className="relative mb-3 h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg shadow-slate-200">
                              <img
                                src={countryData[country].image}
                                alt={country}
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white/85 px-2 py-1 text-xs text-slate-900">
                                {countryData[country].countryCode}
                              </span>
                            </div>
                            <span className="text-sm text-slate-900">{country}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {comparisonCategories.map((category, index) => {
                      const Icon = category.icon;
                      return (
                        <motion.tr
                          key={category.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.25 + index * 0.08 }}
                          className="hover:bg-slate-50/80"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-900">
                              <Icon className="h-4 w-4 text-blue-600" />
                              {category.label}
                            </div>
                          </td>
                          {validSelectedCountries.map((country) => {
                            const value = countryData[country][category.key];
                            return (
                              <td key={country} className="px-6 py-4 text-sm text-slate-700">
                                <div className="rounded-2xl bg-slate-50 px-4 py-3">{value}</div>
                              </td>
                            );
                          })}
                        </motion.tr>
                      );
                    })}
                    <tr className="hover:bg-slate-50/80">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-900">
                          <GraduationCap className="h-4 w-4 text-blue-600" />
                          Top Universities
                        </div>
                      </td>
                      {validSelectedCountries.map((country) => (
                        <td key={country} className="px-6 py-4 text-sm text-slate-700">
                          <div className="space-y-2 rounded-2xl bg-slate-50 p-4">
                            {countryData[country].topUniversities.map((university) => (
                              <div key={university}>{university}</div>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-4 lg:hidden">
              {validSelectedCountries.map((country, countryIndex) => (
                <motion.article
                  key={country}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.25 + countryIndex * 0.08 }}
                  className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-sm"
                >
                  <div className="relative h-40">
                    <img
                      src={countryData[country].image}
                      alt={country}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-[0.2em]">
                        {countryData[country].countryCode}
                      </span>
                      <h3 className="mt-3 text-xl">{country}</h3>
                    </div>
                  </div>
                  <div className="space-y-4 p-4 sm:p-5">
                    {comparisonCategories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <div key={category.key} className="rounded-2xl bg-slate-50 p-4">
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Icon className="h-4 w-4 text-blue-600" />
                            {category.label}
                          </div>
                          <p className="mt-2 text-sm text-slate-900">{countryData[country][category.key]}</p>
                        </div>
                      );
                    })}
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                        Top Universities
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {countryData[country].topUniversities.map((university) => (
                          <span
                            key={university}
                            className="rounded-full bg-white px-3 py-1 text-xs text-slate-700"
                          >
                            {university}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-[28px] border border-dashed border-slate-200 bg-white/90 p-12 text-center shadow-sm"
          >
            <Globe2 className="mx-auto mb-4 h-16 w-16 text-slate-300" />
            <p className="text-slate-600">Select at least one country to start comparing.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

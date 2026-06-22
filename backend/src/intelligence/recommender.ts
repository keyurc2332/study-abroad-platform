import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export interface ProfileInput {
  level: "UG" | "MS" | "PhD";
  budgetUSD: number;
  nationality?: string;
  gpa?: number;
  gradeSystem?: string;
  highSchoolGPA?: number;
  ieltsScore?: number;
  toeflScore?: number;
  pteScore?: number;
  duolingoScore?: number;
  greScore?: number;
  satScore?: number;
  actScore?: number;
  preferredCountries?: string[];
  targetFields?: string[];
  wantFunded?: boolean;
  minStipendUSD?: number;
  requireStemOpt?: boolean;
  requireCoop?: boolean;
  requireEnglishOnly?: boolean;
  wantPR?: boolean;
  wantResearch?: boolean;
  wantIndustry?: boolean;
  wantAffordable?: boolean;
  page?: number;
  limit?: number;
}

function normalizeGPA(gpa: number, system: string): number {
  switch (system) {
    case "percentage":
      if (gpa >= 90) return 4.0; if (gpa >= 85) return 3.9;
      if (gpa >= 80) return 3.7; if (gpa >= 75) return 3.5;
      if (gpa >= 70) return 3.3; if (gpa >= 65) return 3.0;
      if (gpa >= 60) return 2.7; return 2.0;
    case "10.0": case "10": return Math.min(4.0, (gpa / 10) * 4.0);
    case "german":
      if (gpa <= 1.3) return 4.0; if (gpa <= 1.7) return 3.7;
      if (gpa <= 2.0) return 3.3; if (gpa <= 2.3) return 3.0;
      if (gpa <= 2.7) return 2.7; return 2.0;
    default: return Math.min(4.0, gpa);
  }
}

function meetsLanguage(prog: any, input: ProfileInput) {
  const checks = [
    { score: input.ieltsScore,    req: prog.ieltsMin },
    { score: input.toeflScore,    req: prog.toeflMin },
    { score: input.pteScore,      req: prog.pteMin },
    { score: input.duolingoScore, req: prog.duolingoMin },
  ].filter((c) => c.score !== undefined && c.req != null);
  if (!checks.length) return { meets: true, gap: 0 };
  for (const c of checks) if (c.score! >= c.req!) return { meets: true, gap: 0 };
  const gaps = checks.map((c) => ((c.req! - c.score!) / c.req!) * 100);
  return { meets: false, gap: Math.min(...gaps) };
}

// Admit probability: combines score + school competitiveness
function admitProbability(score: number, cs: number): {
  label: string; range: string; category: "safe" | "match" | "reach";
} {
  // Competitiveness penalty: harder schools require higher scores for same probability
  const adjusted = score - (cs - 5) * 3;
  if (adjusted >= 82) return { label: "High",     range: "65–85%", category: "safe"  };
  if (adjusted >= 70) return { label: "Moderate", range: "40–65%", category: "safe"  };
  if (adjusted >= 58) return { label: "Fair",     range: "25–40%", category: "match" };
  if (adjusted >= 46) return { label: "Low",      range: "10–25%", category: "match" };
  return                     { label: "Very Low", range: "< 10%",  category: "reach" };
}

function scoreProgram(prog: any, uni: any, input: ProfileInput): number {
  const studentGPA = input.gpa
    ? normalizeGPA(input.gpa, input.gradeSystem ?? "4.0")
    : null;

  const w = {
    academic:   input.wantResearch   ? 35 : 30,
    budget:     input.wantAffordable ? 30 : 25,
    preference: 20,
    ranking:    input.wantResearch ? 20 : input.wantIndustry ? 10 : 15,
    features:   input.wantPR || input.wantIndustry ? 15 : 10,
  };
  const totalW = Object.values(w).reduce((a, b) => a + b, 0);
  const pct = (pts: number, max: number, weight: number) =>
    (pts / max) * (weight / totalW) * 100;

  let score = 0;

  // ── 1. ACADEMIC ──────────────────────────────────────────────────────────
  let acad = 0;

  const lang = meetsLanguage(prog, input);
  if (lang.meets) acad += 10; else if (lang.gap <= 8) acad += 4;

  const cs        = uni.competitivenessScore ?? 5;
  const typMin    = uni.typicalGPAMin ?? null;
  const typMax    = uni.typicalGPAMax ?? null;

  if (prog.level === "UG") {
    const hsGPA = input.highSchoolGPA, req = prog.highSchoolGPA;
    if (hsGPA && req) {
      if (hsGPA >= req + 0.3) acad += 14;
      else if (hsGPA >= req)  acad += 11;
      else if (hsGPA >= req - 0.2) acad += 5;
    } else acad += 8;
  } else if (studentGPA !== null) {
    if (typMin !== null && typMax !== null) {
      const midpoint = (typMin + typMax) / 2;
      if (studentGPA >= typMax + 0.1)     acad += 14; // clearly above range
      else if (studentGPA >= midpoint)    acad += 11; // upper half of range
      else if (studentGPA >= typMin)      acad += 8;  // lower half of range
      else if (studentGPA >= typMin-0.15) acad += 4;  // slightly below — ambitious
      else if (studentGPA >= typMin-0.35) acad += 1;  // reach territory
      // below typMin-0.35 → 0 pts
    } else if (prog.minGPA) {
      const gap = studentGPA - prog.minGPA;
      if (gap >= 0.4)       acad += 14;
      else if (gap >= 0.2)  acad += 11;
      else if (gap >= 0)    acad += 8;
      else if (gap >= -0.2) acad += 4;
      else if (gap >= -0.4) acad += 1;
    } else {
      acad += 8;
    }
    // PhD penalty for unknown research profile at elite schools
    if (prog.level === "PhD" && cs >= 8) acad = Math.min(acad, 9);
  } else {
    acad += 7;
  }

  // GRE
  if (prog.greRequired) {
    const minGRE = uni.typicalGREMin ?? prog.minGRE ?? 312;
    if (input.greScore) {
      if (input.greScore >= minGRE)          acad += 6;
      else if (input.greScore >= minGRE - 8) acad += 3;
    } else acad += 2;
  } else acad += 6;

  score += pct(acad, 30, w.academic);

  // ── 2. BUDGET ────────────────────────────────────────────────────────────
  let budget = 0;
  const totalCost = prog.totalFirstYearCostUSD ?? 0;

  if (prog.funded && prog.level === "PhD" && prog.stipendUSD) {
    const netCost = prog.netCostAfterFundingUSD ?? 0;
    const ratio   = netCost / Math.max(input.budgetUSD, 1);
    if (ratio <= 0.05)      budget = 30;
    else if (ratio <= 0.15) budget = 26;
    else if (ratio <= 0.3)  budget = 22;
    else if (ratio <= 0.5)  budget = 16;
    else                    budget = 10;
  } else if (totalCost <= 0) {
    budget = 12;
  } else {
    const ratio = totalCost / input.budgetUSD;
    if (ratio <= 0.6)       budget = 30;
    else if (ratio <= 0.75) budget = 24;
    else if (ratio <= 0.9)  budget = 18;
    else if (ratio <= 1.0)  budget = 12;
    else if (ratio <= 1.15) budget = 4;
    else                    budget = 0;
  }
  score += pct(budget, 30, w.budget);

  // ── 3. PREFERENCE ────────────────────────────────────────────────────────
  let pref = 0;
  if (!input.targetFields?.length) {
    pref += 9;
  } else {
    const pf    = (prog.field ?? "").toLowerCase();
    const exact = input.targetFields.some((f) => f.toLowerCase() === pf);
    const part  = input.targetFields.some(
      (f) => pf.includes(f.toLowerCase()) || f.toLowerCase().includes(pf)
    );
    if (exact) pref += 12; else if (part) pref += 7;
  }
  if (!input.preferredCountries?.length) pref += 6;
  else pref += input.preferredCountries.some((c) => c === uni.country) ? 8 : 1;

  score += pct(pref, 20, w.preference);

  // ── 4. RANKING ───────────────────────────────────────────────────────────
  let rankScore = 0;
  const rank = uni.ranking;
  if (!rank)            rankScore += 5;
  else if (rank <= 10)  rankScore += 10;
  else if (rank <= 25)  rankScore += 9;
  else if (rank <= 50)  rankScore += 8;
  else if (rank <= 100) rankScore += 7;
  else if (rank <= 200) rankScore += 5;
  else if (rank <= 400) rankScore += 3;
  else                  rankScore += 2;

  if (studentGPA !== null && typMin !== null) {
    const mid = (typMin + (typMax ?? typMin + 0.3)) / 2;
    if (studentGPA >= mid)     rankScore += 5;
    else if (studentGPA >= typMin) rankScore += 2;
  } else rankScore += 2;

  score += pct(rankScore, 15, w.ranking);

  // ── 5. FEATURES ──────────────────────────────────────────────────────────
  let feat = 0;
  const psw = prog.postStudyWorkMonths ?? uni.postStudyWorkMonths ?? 0;
  if (psw >= 36) feat += 3; else if (psw >= 24) feat += 2; else if (psw >= 12) feat += 1;

  const prScore = uni.prPathwayScore ?? 3;
  if (input.wantPR) feat += Math.round((prScore / 10) * 5);
  else feat += prScore >= 8 ? 2 : prScore >= 6 ? 1 : 0;

  if (input.wantIndustry) feat += Math.round(((uni.jobMarketScore ?? 5) / 10) * 3);

  if (uni.pgwpEligible && uni.country === "Canada") feat += 1;
  if (prog.stemDesignated) feat += 1;
  if (prog.coopAvailable)  feat += 1;

  if (input.wantResearch) {
    const ri = uni.researchIntensity ?? "";
    if (ri === "Very High") feat += 3; else if (ri === "High") feat += 1;
  }

  if (prog.scholarships || prog.cheveningEligible || prog.daadEligible) feat += 1;

  // Germany affordability bonus
  if (uni.country === "Germany" && input.wantAffordable) feat += 4;

  if (prog.level === "PhD") {
    if (prog.funded && prog.stipendUSD) {
      feat += prog.stipendUSD >= (input.minStipendUSD ?? 18000) ? 5 : 2;
    }
    if (input.wantFunded && !prog.funded) feat = Math.max(0, feat - 8);
  }

  score += pct(Math.min(feat, 20), 20, w.features);
  return Math.min(100, Math.round(score));
}

export async function recommendUniversities(input: ProfileInput) {
  const page  = input.page  ?? 0;
  const limit = Math.min(input.limit ?? 20, 50);

  const where: any = {
    level: input.level,
    ...(input.budgetUSD ? { totalFirstYearCostUSD: { lte: input.budgetUSD * 1.5 } } : {}),
    ...(input.targetFields?.length ? { field: { in: input.targetFields } } : {}),
    ...(input.requireStemOpt     ? { stemDesignated: true } : {}),
    ...(input.requireCoop        ? { coopAvailable: true }  : {}),
    ...(input.requireEnglishOnly ? { language: "English" }  : {}),
    ...(input.wantFunded && input.level === "PhD" ? { funded: true } : {}),
    university: input.preferredCountries?.length
      ? { country: { in: input.preferredCountries } }
      : undefined,
  };

  const programs = await prisma.program.findMany({
    where,
    include: {
      university: {
        select: {
          id: true, name: true, country: true, city: true, state: true,
          ranking: true, acceptanceRate: true, website: true,
          campusType: true, postStudyWorkMonths: true,
          competitivenessScore: true,
          typicalGPAMin: true, typicalGPAMax: true, typicalGREMin: true,
          tier: true, researchIntensity: true,
          prPathwayScore: true, jobMarketScore: true,
          pgwpEligible: true, assistantshipAvailable: true,
        },
      },
    },
    take: 3000,
  });

  const scored = programs
    .map((prog) => {
      const raw   = scoreProgram(prog, prog.university, input);
      const cs    = (prog.university as any).competitivenessScore ?? 5;
      const admit = admitProbability(raw, cs);
      return { prog, score: raw, admit };
    })
    .sort((a, b) => b.score - a.score);

  const withCat = scored.map(({ prog, score, admit }) => ({
    ...prog,
    universityName:       prog.university.name,
    country:              prog.university.country,
    city:                 prog.university.city,
    state:                (prog.university as any).state,
    ranking:              prog.university.ranking,
    acceptanceRate:       prog.university.acceptanceRate,
    website:              prog.university.website,
    tier:                 (prog.university as any).tier,
    competitivenessScore: (prog.university as any).competitivenessScore,
    typicalGPARange:      (prog.university as any).typicalGPAMin
      ? `${(prog.university as any).typicalGPAMin}–${(prog.university as any).typicalGPAMax}`
      : null,
    prPathwayScore:       (prog.university as any).prPathwayScore,
    jobMarketScore:       (prog.university as any).jobMarketScore,
    researchIntensity:    (prog.university as any).researchIntensity,
    score,
    admitProbability:     admit,
    category:             admit.category,
  }));

  const total = withCat.length;
  const paged = withCat.slice(page * limit, page * limit + limit);

  return {
    total, page, limit,
    results: paged,
    reach: withCat.filter((u) => u.category === "reach").slice(0, 5),
    match: withCat.filter((u) => u.category === "match").slice(0, 5),
    safe:  withCat.filter((u) => u.category === "safe").slice(0, 5),
    summary: {
      eligible:    withCat.filter((u) => u.category !== "reach").length,
      avgCost:     Math.round(
        withCat
          .filter((u) => u.totalFirstYearCostUSD && u.category !== "reach")
          .reduce((s, u) => s + (u.totalFirstYearCostUSD ?? 0), 0) /
        Math.max(1, withCat.filter((u) => u.category !== "reach").length)
      ),
      countries:   [...new Set(withCat.map((u) => u.country))],
      goalsApplied: {
        wantPR:         input.wantPR         ?? false,
        wantResearch:   input.wantResearch   ?? false,
        wantIndustry:   input.wantIndustry   ?? false,
        wantAffordable: input.wantAffordable ?? false,
      },
    },
  };
}
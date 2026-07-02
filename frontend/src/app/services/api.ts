/**
 * api.ts — Central API client for Study Abroad Platform
 * Place in: src/app/services/api.ts
 *
 * All calls go to the Node.js backend at localhost:5000
 */

const BASE_URL = "/api/v1";

// ── Types matching our backend response ──────────────────────────────────────

export interface AdmitProbability {
  label: "Very Low" | "Low" | "Fair" | "Moderate" | "High";
  range: string;
  category: "reach" | "match" | "safe";
}

export interface RecommendedUniversity {
  id: string;
  universityId: string;
  universityName: string;
  country: string;
  city: string;
  state: string;
  ranking: number | null;
  website: string;
  tier: string;
  competitivenessScore: number;
  typicalGPARange: string | null;
  researchIntensity: string;
  prPathwayScore: number;
  jobMarketScore: number;
  score: number;
  category: "reach" | "match" | "safe";
  admitProbability: AdmitProbability;
  // Gemini-enhanced fields (present when geminiUsed=true)
  geminiEnhanced?: boolean;
  keyInsight?: string;
  riskFactors?: string[];
  strengthFactors?: string[];
  recommendationNote?: string;
  // Program fields
  name: string;
  field: string;
  level: string;
  tuitionUSD: number;
  totalFirstYearCostUSD: number;
  durationMonths: number;
  funded: boolean;
  stipendUSD: number | null;
  stemDesignated: boolean;
  deadlineFall: string | null;
  officialURL: string;
  ieltsMin: number | null;
  toeflMin: number | null;
  greRequired: boolean;
}

export interface RecommendationResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  geminiUsed: boolean;
  results: RecommendedUniversity[];
  reach: RecommendedUniversity[];
  match: RecommendedUniversity[];
  safe: RecommendedUniversity[];
  summary: {
    eligible: number;
    avgCost: number;
    countries: string[];
    goalsApplied: {
      wantPR: boolean;
      wantResearch: boolean;
      wantIndustry: boolean;
      wantAffordable: boolean;
    };
  };
}

export interface RecommendationRequest {
  level: "UG" | "MS" | "PhD";
  budgetUSD: number;
  nationality?: string;
  gpa?: number;
  gradeSystem?: string;
  ieltsScore?: number;
  toeflScore?: number;
  greScore?: number;
  preferredCountries?: string[];
  targetFields?: string[];
  wantFunded?: boolean;
  wantPR?: boolean;
  wantResearch?: boolean;
  wantIndustry?: boolean;
  wantAffordable?: boolean;
  useGemini?: boolean;
  page?: number;
  limit?: number;
}

// ── Country map for display name → API name ──────────────────────────────────
const COUNTRY_MAP: Record<string, string> = {
  "United States": "USA",
  "United Kingdom": "UK",
  "Canada": "Canada",
  "Australia": "Australia",
  "Germany": "Germany",
  "USA": "USA",
  "UK": "UK",
};

const DEGREE_MAP: Record<string, "UG" | "MS" | "PhD"> = {
  "Bachelor's": "UG",
  "Master's": "MS",
  "PhD": "PhD",
  "UG": "UG",
  "MS": "MS",
};

// ── GPA parser: "8.4/10" → { gpa: 3.36, gradeSystem: "4.0" } ────────────────
function parseGPA(gpaString: string): { gpa: number; gradeSystem: string } {
  if (!gpaString) return { gpa: 3.0, gradeSystem: "4.0" };
  const str = gpaString.trim();

  if (str.includes("/10")) {
    const val = parseFloat(str);
    return { gpa: val, gradeSystem: "10.0" };
  }
  if (str.includes("%") || parseFloat(str) > 10) {
    return { gpa: parseFloat(str), gradeSystem: "percentage" };
  }
  return { gpa: parseFloat(str) || 3.0, gradeSystem: "4.0" };
}

// ── Budget parser: "$30,000 - $50,000" → 50000 ───────────────────────────────
function parseBudget(budgetString: string): number {
  if (!budgetString) return 50000;
  // Handle "Over $80,000" → 80000, "$40,000 - $60,000" → 60000
  const matches = budgetString.match(/[\d,]+/g);
  if (!matches) return 50000;
  const nums = matches.map(m => parseInt(m.replace(/,/g, ""))).filter(n => !isNaN(n));
  if (nums.length === 0) return 50000;
  return Math.max(...nums);
}

// ── IELTS/TOEFL parser from "IELTS 7.5" or "TOEFL 100" ──────────────────────
function parseLanguage(proficiency: string): { ieltsScore?: number; toeflScore?: number } {
  if (!proficiency) return {};
  const upper = proficiency.toUpperCase();
  const score = parseFloat(proficiency.replace(/[^0-9.]/g, ""));
  if (upper.includes("IELTS")) return { ieltsScore: score };
  if (upper.includes("TOEFL")) return { toeflScore: score };
  return {};
}



// ── Main API call: get recommendations from profile ──────────────────────────
export async function getRecommendations(
  profile: {
    gpa: string;
    desiredDegree: string;
    preferredCountries: string[];
    fieldOfStudy: string;
    budgetRange: string;
    englishProficiency: string;
    nationality?: string;
  },
  goals: {
    wantResearch?: boolean;
    wantPR?: boolean;
    wantAffordable?: boolean;
    wantIndustry?: boolean;
  } = {},
  options: { page?: number; useGemini?: boolean } = {}
): Promise<RecommendationResponse> {
  const { gpa, gradeSystem } = parseGPA(profile.gpa);
  const budgetUSD = parseBudget(profile.budgetRange);
  const langScores = parseLanguage(profile.englishProficiency);
  const level = DEGREE_MAP[profile.desiredDegree] ?? "MS";
  const countries = profile.preferredCountries
    .map((c) => COUNTRY_MAP[c] ?? c)
    .filter(Boolean);

  const body: RecommendationRequest = {
    level,
    budgetUSD,
    gpa,
    gradeSystem,
    ...langScores,
    preferredCountries: countries,
    targetFields: profile.fieldOfStudy ? [profile.fieldOfStudy] : [],
    nationality: profile.nationality ?? "India",
    wantResearch:   goals.wantResearch   ?? false,
    wantPR:         goals.wantPR         ?? false,
    wantAffordable: goals.wantAffordable ?? false,
    wantIndustry:   goals.wantIndustry   ?? false,
    useGemini:      options.useGemini    ?? true,
    page:           options.page         ?? 0,
    limit:          20,
  };
  console.log("API Request Body:", JSON.stringify(body, null, 2));

  const response = await fetch(`${BASE_URL}/recommendations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// ── Checklist ─────────────────────────────────────────────────────────────────
export async function getChecklist(params: {
  level: string;
  country: string;
  programType?: string;
}) {
  const response = await fetch(`${BASE_URL}/checklist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

// ── Country comparison ────────────────────────────────────────────────────────
export async function compareCountries(params: {
  countries: string[];
  level?: string;
  field?: string;
}) {
  const response = await fetch(`${BASE_URL}/countries/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}
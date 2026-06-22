import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface ChecklistInput {
  // Option A: program-specific (recommended — most accurate)
  programId?: string;

  // Option B: general (used when no specific program is selected yet)
  preferredCountries?: string[];
  targetDegree?: string;
  nationality?: string;
}

export interface ChecklistItem {
  id: string;
  category: string;
  task: string;
  detail: string;
  required: boolean;
  countries?: string[];
  priority: "high" | "medium" | "low";
}

// ─── DB-driven checklist for a specific program ───────────────────────────────

async function buildProgramChecklist(
  programId: string,
  nationality: string = ""
): Promise<ChecklistItem[]> {
  const prog = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      university: {
        select: { name: true, country: true, website: true },
      },
    },
  });

  if (!prog) return buildGeneralChecklist({ preferredCountries: [], targetDegree: "MS", nationality });

  const country = prog.university.country;
  const level   = prog.level;
  const items: ChecklistItem[] = [];
  let id = 1;

  const mk = (
    category: string,
    task: string,
    detail: string,
    priority: "high" | "medium" | "low" = "high",
    required = true
  ): ChecklistItem => ({
    id: String(id++),
    category,
    task,
    detail,
    required,
    priority,
  });

  // ── ALWAYS REQUIRED ────────────────────────────────────────────────────────

  items.push(mk("Documents", "Official transcripts", "All degrees and marksheets — must be officially attested/sent"));
  items.push(mk("Documents", "Valid passport", "Minimum 6 months validity beyond your intended stay"));
  items.push(mk("Documents", "Passport photographs", "2–4 recent passport-size photos"));

  // SOP vs Motivation Letter
  if (prog.sopRequired) {
    items.push(mk("Application", "Statement of Purpose (SOP)", `Required for ${prog.university.name}. Typically 500–1000 words.`));
  }
  if (prog.motivationLetterRequired) {
    items.push(mk("Application", "Motivation letter", "European universities call it motivation letter — 1–2 pages explaining your goals"));
  }
  if (prog.personalStatementRequired) {
    items.push(mk("Application", "UCAS personal statement", "4000 characters max. Submit via UCAS portal, not directly to university"));
  }

  // CV / Resume
  if (prog.resumeRequired !== false) {
    items.push(mk("Application", "CV / Resume", "Academic and work experience. Keep to 2 pages for most programs"));
  }

  // Letters of Recommendation
  if (prog.lorCount > 0) {
    items.push(mk(
      "References",
      `${prog.lorCount} Letters of Recommendation`,
      `Ask recommenders early — allow 4–6 weeks. ${level === "PhD" ? "At least 1 should be academic." : "Mix of academic and professional preferred."}`
    ));
  }

  // Financial documents
  if (prog.financialDocRequired) {
    items.push(mk("Financial", "Financial proof / bank statements", "Last 6 months. Shows sufficient funds to cover fees and living costs"));
  }

  // ── LANGUAGE TESTS ─────────────────────────────────────────────────────────

  if (prog.ieltsMin || prog.toeflMin) {
    items.push(mk(
      "Tests",
      "English proficiency test",
      [
        prog.ieltsMin    ? `IELTS ≥ ${prog.ieltsMin}` : null,
        prog.toeflMin    ? `TOEFL ≥ ${prog.toeflMin}` : null,
        prog.pteMin      ? `PTE ≥ ${prog.pteMin}`     : null,
        prog.duolingoMin ? `Duolingo ≥ ${prog.duolingoMin}` : null,
      ].filter(Boolean).join(" or ") + " — any one accepted"
    ));
  }

  // GRE
  if (prog.greRequired) {
    items.push(mk(
      "Tests",
      `GRE score${prog.minGRE ? ` (min ${prog.minGRE})` : ""}`,
      "Register early — test centres fill up. Score valid for 5 years."
    ));
  }

  // GMAT
  if (prog.gmatRequired) {
    items.push(mk(
      "Tests",
      `GMAT score${prog.gmatMinScore ? ` (min ${prog.gmatMinScore})` : ""}`,
      "Required for MBA programs. Register at mba.com"
    ));
  }

  // ── ADMISSION TEST (UK UG specific) ───────────────────────────────────────

  if (prog.admissionTestRequired) {
    items.push(mk(
      "Tests",
      `${prog.admissionTestRequired} admission test`,
      `Subject-specific admission test required by ${prog.university.name}`
    ));
  }

  // ── RESEARCH DOCUMENTS (PhD / research MS) ────────────────────────────────

  if (prog.researchProposalRequired) {
    items.push(mk(
      "Research",
      "Research proposal",
      "Typically 1000–3000 words. Outline research question, methodology, and significance"
    ));
  }

  if (prog.researchStatementRequired) {
    items.push(mk(
      "Research",
      "Research statement",
      "Describe past research experience and future research interests — different from SOP"
    ));
  }

  if (prog.advisorMatchRequired) {
    items.push(mk(
      "Research",
      "Contact potential supervisor before applying",
      "Email faculty whose research matches yours. A supervisor willing to take you significantly improves your chances",
      "high"
    ));
  }

  // Portfolio
  if (prog.portfolioRequired) {
    items.push(mk(
      "Application",
      "Portfolio",
      "Required for design, architecture, arts, and creative programs"
    ));
  }

  // Writing sample
  if (prog.writingSampleRequired) {
    items.push(mk(
      "Application",
      "Writing sample",
      "Academic writing — typically 10–20 pages. May be an essay or published paper"
    ));
  }

  // ── APPLICATION PORTAL ─────────────────────────────────────────────────────

  if (prog.ucasRequired) {
    items.push(mk(
      "Application",
      "Apply via UCAS (not directly to university)",
      "Register at ucas.com. Deadline: 25 January for most courses. Medicine/Oxford/Cambridge: 15 October"
    ));
  } else if (prog.uniAssistRequired) {
    items.push(mk(
      "Application",
      "Apply via uni-assist.de portal",
      "Germany's central application portal. Create account at uni-assist.de and submit documents there"
    ));
  } else {
    items.push(mk(
      "Application",
      `Apply directly via ${prog.university.name} website`,
      prog.university.website ? `Apply at ${prog.university.website}` : "Apply on the university's official website",
      "high"
    ));
  }

  // Application fee
  if (prog.applicationFee && prog.applicationFee > 0) {
    items.push(mk(
      "Application",
      `Application fee: $${prog.applicationFee.toLocaleString()}`,
      "Pay when submitting application. Usually non-refundable",
      "medium"
    ));
  }

  // Deadline
  if (prog.deadlineFall) {
    items.push(mk(
      "Application",
      `Application deadline: ${prog.deadlineFall}`,
      "Submit all documents before this date. Aim to apply 2 weeks early",
      "high"
    ));
  }

  // ── COUNTRY-SPECIFIC ────────────────────────────────────────────────────────

  // Germany
  if (country === "Germany") {
    if (prog.apsRequired) {
      items.push(mk(
        "Verification",
        "APS certificate (Akademische Prüfstelle)",
        "Mandatory for Indian students. Apply at German Consulate in India. Takes 4–8 weeks and costs ₹18,000",
        "high"
      ));
    }

    if (prog.apostilleRequired) {
      items.push(mk(
        "Verification",
        "Apostille all Indian documents",
        "Degree certificates, marksheets, and birth certificate need apostille from MEA (Ministry of External Affairs India)"
      ));
    }

    if (prog.blockedAccountRequired) {
      items.push(mk(
        "Financial",
        `Blocked account (Sperrkonto) — €${prog.blockedAccountAmountUSD ? Math.round(prog.blockedAccountAmountUSD / 1.09).toLocaleString() : "11,208"}`,
        "Open with Deutsche Bank, Coracle, Expatrio, or Fintiba. Required for German student visa. Process takes 2–4 weeks"
      ));
    }

    if (prog.germanLanguageRequired) {
      items.push(mk(
        "Tests",
        "German language certificate (B2 or C1)",
        "TestDaF or DSH exam. Required if program is German-taught"
      ));
    }

    items.push(mk(
      "Visa",
      "German student visa",
      "Apply at German Consulate/Embassy in India. Requires: APS, blocked account, admission letter, health insurance",
      "high"
    ));
  }

  // UK
  if (country === "UK") {
    items.push(mk(
      "Financial",
      "NHS Immigration Health Surcharge (IHS)",
      "£776 per year (2024 rate). Pay online at gov.uk when applying for Student visa. Cannot be skipped",
      "high"
    ));

    items.push(mk(
      "Visa",
      "UK Student visa (Tier 4)",
      "Apply after receiving CAS number from university. Requires: financial proof, IELTS, tuberculosis test (if applicable)",
      "high"
    ));
  }

  // Australia
  if (country === "Australia") {
    if (prog.oshcRequired) {
      items.push(mk(
        "Health",
        "OSHC — Overseas Student Health Cover",
        `Required before visa grant. ~$700/year. Purchase from Bupa, Medibank, Allianz, or AHM. Approx cost: $${prog.oshcCostUSD ?? 700}/yr`,
        "high"
      ));
    }

    if (level === "PhD" && prog.rtpEligible) {
      items.push(mk(
        "Scholarship",
        "RTP scholarship — auto-considered",
        "Research Training Program: covers tuition + stipend ~$29,000/yr. No separate application needed",
        "high"
      ));
    }

    items.push(mk(
      "Visa",
      "Australian Student visa (Subclass 500)",
      "Apply online via ImmiAccount. Requires: CoE from university, OSHC, financial proof, English test",
      "high"
    ));
  }

  // Canada
  if (country === "Canada") {
    items.push(mk(
      "Visa",
      "Canadian study permit",
      "Apply online at canada.ca. Processing: 4–12 weeks. Requires: acceptance letter, financial proof, clean criminal record",
      "high"
    ));

    if (prog.coopAvailable) {
      items.push(mk(
        "Work",
        "Co-op work permit (optional)",
        "Canada allows 20 hrs/week during study. After graduation: PGWP up to 3 years",
        "medium",
        false
      ));
    }
  }

  // USA
  if (country === "USA") {
    items.push(mk(
      "Visa",
      "F-1 student visa + SEVIS",
      "Pay $350 SEVIS fee at fmjfee.com, then schedule F-1 visa interview at US Embassy. Need I-20 from university first",
      "high"
    ));

    if (prog.stemDesignated) {
      items.push(mk(
        "Work",
        "STEM OPT extension eligible (36 months)",
        "This program qualifies for 36-month STEM OPT after graduation. Apply through DSO at your university",
        "medium",
        false
      ));
    }
  }

  // ── SCHOLARSHIPS ───────────────────────────────────────────────────────────

  if (prog.cheveningEligible && country === "UK") {
    items.push(mk(
      "Scholarship",
      "Apply for Chevening Scholarship",
      "UK government scholarship. Apply Oct–Nov for next September start. Fully funded: tuition + living + flights",
      "medium",
      false
    ));
  }

  if (prog.daadEligible && country === "Germany") {
    items.push(mk(
      "Scholarship",
      "Apply for DAAD scholarship",
      "Germany's main international scholarship. Various programmes — check daad.de for deadlines",
      "medium",
      false
    ));
  }

  if (prog.rtpEligible && country === "Australia" && level === "PhD") {
    items.push(mk(
      "Scholarship",
      "Apply for Commonwealth scholarship",
      "For students from eligible Commonwealth countries. Check scholarships.gov.au",
      "medium",
      false
    ));
  }

  return items;
}

// ─── General checklist (no programId) ────────────────────────────────────────

function buildGeneralChecklist(input: {
  preferredCountries?: string[];
  targetDegree?: string;
  nationality?: string;
}): ChecklistItem[] {
  const countries  = input.preferredCountries ?? [];
  const degree     = input.targetDegree ?? "MS";
  const items: ChecklistItem[] = [];
  let id = 1;

  const mk = (
    category: string,
    task: string,
    detail: string,
    priority: "high" | "medium" | "low" = "high",
    required = true,
    forCountries?: string[]
  ): ChecklistItem => ({
    id: String(id++),
    category,
    task,
    detail,
    required,
    priority,
    countries: forCountries,
  });

  items.push(mk("Documents", "Official transcripts", "All degrees with seal/signature"));
  items.push(mk("Documents", "Valid passport", "6+ months validity"));
  items.push(mk("Documents", "Passport photographs", "2–4 recent photos"));
  items.push(mk("Application", "Statement of Purpose / Motivation letter", "500–1000 words. Tailor to each university"));
  items.push(mk("Application", "CV / Resume", "Academic and professional experience"));
  items.push(mk("References", "Letters of Recommendation", `${degree === "PhD" ? "3" : "2"} letters — ask early`));
  items.push(mk("Financial", "Financial proof / bank statements", "Last 6 months"));

  if (countries.some((c) => ["USA","UK","Canada","Australia"].includes(c))) {
    items.push(mk("Tests", "English proficiency", "IELTS / TOEFL / PTE / Duolingo — one accepted at most universities", "high", true, ["USA","UK","Canada","Australia"]));
  }

  if (countries.includes("USA") && degree !== "UG") {
    items.push(mk("Tests", "GRE score", "Required by most USA MS/PhD programs. Register at ets.org", "high", true, ["USA"]));
  }

  if (countries.includes("Germany")) {
    items.push(mk("Verification", "APS certificate", "Mandatory for Indian students at German Consulate. 4–8 weeks", "high", true, ["Germany"]));
    items.push(mk("Financial", "Blocked account — €11,208", "Sperrkonto via Deutsche Bank / Expatrio / Fintiba", "high", true, ["Germany"]));
  }

  if (countries.includes("UK")) {
    items.push(mk("Financial", "NHS IHS surcharge — £776/year", "Pay at gov.uk when applying for student visa", "high", true, ["UK"]));
  }

  if (countries.includes("Australia")) {
    items.push(mk("Health", "OSHC health cover", "~$700/year. Required before Australian visa", "high", true, ["Australia"]));
  }

  if (degree === "PhD") {
    items.push(mk("Research", "Research proposal", "1000–3000 words — required for most PhD applications"));
    items.push(mk("Research", "Contact potential supervisors", "Email professors before applying", "high", true));
  }

  return items;
}

// ─── Main export (keeps same function name) ────────────────────────────────────

export async function generateChecklist(input: ChecklistInput): Promise<ChecklistItem[]> {
  if (input.programId) {
    return buildProgramChecklist(input.programId, input.nationality);
  }
  return buildGeneralChecklist(input);
}
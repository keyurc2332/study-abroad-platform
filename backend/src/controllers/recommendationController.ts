import { Request, Response } from "express";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Gemini AI - Generate recommendations from scratch ─────────────────────────
async function generateRecommendationsWithGemini(
  profile: any,
  topN = 30
): Promise<{ recommendations: any[]; success: boolean }> {

  if (!process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = "AIzaSyAJN_-tsPpF228e-cD_gfLFqY6uVyHRCL8";
  }

  const tmpInput  = path.join(os.tmpdir(), `gemini_rec_input_${Date.now()}.json`);
  const tmpOutput = path.join(os.tmpdir(), `gemini_rec_output_${Date.now()}.json`);

  fs.writeFileSync(tmpInput, JSON.stringify({
    profile,
    topN,
  }), "utf8");

  const possiblePaths = [
    path.join(process.cwd(), "gemini_recommendations.py"),
    path.join(__dirname, "../../gemini_recommendations.py"),
    path.join(__dirname, "../../../gemini_recommendations.py"),
  ];
  const scriptPath = possiblePaths.find(fs.existsSync);

  console.log("[Gemini Rec] CWD:", process.cwd());
  console.log("[Gemini Rec] Script found at:", scriptPath ?? "NOT FOUND");
  console.log("[Gemini Rec] GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);

  if (!scriptPath) {
    console.error("[Gemini Rec] ❌ Script not found. Searched:", possiblePaths);
    try { fs.unlinkSync(tmpInput); } catch {}
    return { recommendations: [], success: false };
  }

  return new Promise((resolve) => {
    // 90 second timeout (1 minute 30 seconds)
    const timer = setTimeout(() => {
      console.error("[Gemini Rec] ⏱ Timeout after 90s");
      cleanup();
      resolve({ recommendations: [], success: false });
    }, 90000);

    console.log("[Gemini Rec] Spawning Python...");

    const quotedScript = `"${scriptPath}"`;
    const quotedInput  = `"${tmpInput}"`;
    const quotedOutput = `"${tmpOutput}"`;

    const py = spawn(
      `python ${quotedScript} --input ${quotedInput} --output ${quotedOutput}`,
      [],
      { env: { ...process.env }, shell: true }
    );

    let stderr = "";
    py.stderr.on("data", (d) => {
      stderr += d.toString();
      process.stdout.write("[Gemini Rec PY] " + d.toString());
    });

    py.on("error", (err) => {
      console.error("[Gemini Rec] ❌ Spawn error:", err.message);
      clearTimeout(timer);
      cleanup();
      resolve({ recommendations: [], success: false });
    });

    py.on("close", (code) => {
      clearTimeout(timer);

      if (code !== 0) {
        console.error(`[Gemini Rec] ❌ Python exited with code ${code}`);
        console.error("[Gemini Rec] stderr:", stderr.slice(0, 500));
        cleanup();
        resolve({ recommendations: [], success: false });
        return;
      }

      console.log("[Gemini Rec] Python exited OK (code 0)");

      if (!fs.existsSync(tmpOutput)) {
        console.error("[Gemini Rec] ❌ Output file not created");
        cleanup();
        resolve({ recommendations: [], success: false });
        return;
      }

      try {
        const raw    = fs.readFileSync(tmpOutput, "utf8");
        const parsed = JSON.parse(raw);

        if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
          console.log(`[Gemini Rec] ✅ Generated ${parsed.recommendations.length} recommendations`);
          cleanup();
          resolve({ recommendations: parsed.recommendations, success: true });
        } else {
          console.error("[Gemini Rec] Invalid output format:", raw.slice(0, 200));
          cleanup();
          resolve({ recommendations: [], success: false });
        }
      } catch (e) {
        console.error("[Gemini Rec] JSON parse error:", e);
        cleanup();
        resolve({ recommendations: [], success: false });
      }
    });

    function cleanup() {
      try { if (fs.existsSync(tmpInput))  fs.unlinkSync(tmpInput);  } catch {}
      try { if (fs.existsSync(tmpOutput)) fs.unlinkSync(tmpOutput); } catch {}
    }
  });
}

// ── Fallback: Use database recommendations ──────────────────────────────────
async function getFallbackRecommendations(profile: any): Promise<any[]> {
  try {
    const { preferredCountries, targetFields, budgetUSD, level } = profile;

    const universities = await prisma.program.findMany({
      where: {
        AND: [
          preferredCountries?.length > 0 
            ? { university: { country: { in: preferredCountries } } }
            : {},
          targetFields?.length > 0
            ? { field: { in: targetFields } }
            : {},
          budgetUSD ? { tuitionUSD: { lte: budgetUSD } } : {},
          level ? { level } : {},
        ],
      },
      include: { university: true },
      take: 30,
    });

    // Distribute into categories based on competitiveness
    const universities_with_category = universities.map((prog, idx) => {
      let category = "safe";
      if (idx < 10) category = "safe";
      else if (idx < 20) category = "match";
      else category = "ambitious";

      return {
        universityName: prog.university.name,
        country: prog.university.country,
        programName: prog.name,
        tuitionUSD: prog.tuitionUSD,
        tier: prog.university.tier,
        category,
        studentFit: `${prog.university.name} is a great option for your ${level} in ${prog.field}.`,
        admitChance: category === "safe" ? "70%+" : category === "match" ? "40-70%" : "<40%",
        aiGenerated: false,
      };
    });

    return universities_with_category;
  } catch (error) {
    console.error("[Fallback] Error:", error);
    return [];
  }
}

// ── Main controller ───────────────────────────────────────────────────────────
export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const {
      level, budgetUSD, nationality,
      gpa, gradeSystem, highSchoolGPA,
      ieltsScore, toeflScore, pteScore, duolingoScore,
      greScore, satScore, actScore,
      preferredCountries, targetFields,
      wantFunded, minStipendUSD,
      requireStemOpt, requireCoop, requireEnglishOnly,
      wantPR, wantResearch, wantIndustry, wantAffordable,
      specialCategory,
      page = 0, limit = 20,
    } = req.body;

    // Validation
    if (!level || !["UG", "MS", "PhD"].includes(level)) {
      res.status(400).json({ success: false, error: 'level required: "UG", "MS", or "PhD"' });
      return;
    }
    if (!budgetUSD || Number(budgetUSD) <= 0) {
      res.status(400).json({ success: false, error: "budgetUSD required and must be positive" });
      return;
    }

    const profile = {
      level,
      budgetUSD: Number(budgetUSD),
      nationality: nationality ?? "India",
      gpa: gpa !== undefined ? Number(gpa) : undefined,
      gradeSystem: gradeSystem ?? "4.0",
      highSchoolGPA: highSchoolGPA !== undefined ? Number(highSchoolGPA) : undefined,
      ieltsScore: ieltsScore !== undefined ? Number(ieltsScore) : undefined,
      toeflScore: toeflScore !== undefined ? Number(toeflScore) : undefined,
      pteScore: pteScore !== undefined ? Number(pteScore) : undefined,
      duolingoScore: duolingoScore !== undefined ? Number(duolingoScore) : undefined,
      greScore: greScore !== undefined ? Number(greScore) : undefined,
      satScore: satScore !== undefined ? Number(satScore) : undefined,
      actScore: actScore !== undefined ? Number(actScore) : undefined,
      preferredCountries: preferredCountries ?? [],
      targetFields: targetFields ?? [],
      wantFunded: Boolean(wantFunded),
      minStipendUSD: minStipendUSD !== undefined ? Number(minStipendUSD) : undefined,
      requireStemOpt: Boolean(requireStemOpt),
      requireCoop: Boolean(requireCoop),
      requireEnglishOnly: Boolean(requireEnglishOnly),
      wantPR: Boolean(wantPR),
      wantResearch: Boolean(wantResearch),
      wantIndustry: Boolean(wantIndustry),
      wantAffordable: Boolean(wantAffordable),
      specialCategory: specialCategory ?? "General",
      page: Number(page),
      limit: Number(limit),
    };

    console.log("[Recommendations] Requesting AI generation...");

    // STEP 1: Try AI-generated recommendations (PRIMARY)
    const aiResult = await generateRecommendationsWithGemini(profile, 30);

    let recommendations = [];
    let aiUsed = false;

    if (aiResult.success && aiResult.recommendations.length > 0) {
      console.log("[Recommendations] ✅ AI generated successfully");
      recommendations = aiResult.recommendations;
      aiUsed = true;
    } else {
      console.log("[Recommendations] ⚠️ AI failed, using fallback DB");
      recommendations = await getFallbackRecommendations(profile);
    }

    // STEP 2: Split into categories (safe/match/ambitious)
    const safe = recommendations
      .filter((u: any) => u.category === "safe")
      .slice(0, 10);
    
    const match = recommendations
      .filter((u: any) => u.category === "match")
      .slice(0, 10);
    
    const ambitious = recommendations
      .filter((u: any) => u.category === "ambitious")
      .slice(0, 10);

    // STEP 3: Apply pagination
    const startIdx = profile.page * profile.limit;
    const endIdx = startIdx + profile.limit;
    const paginatedResults = recommendations.slice(startIdx, endIdx);

    res.json({
      success: true,
      aiGenerated: aiUsed,
      total: recommendations.length,
      page: profile.page,
      limit: profile.limit,
      results: paginatedResults,
      categories: {
        safe: safe.length,
        match: match.length,
        ambitious: ambitious.length,
      },
      safe,
      match,
      ambitious,
      summary: {
        totalRecommendations: recommendations.length,
        safeOptions: safe.length,
        matchOptions: match.length,
        ambitiousOptions: ambitious.length,
        message: `We found ${safe.length} safe choices, ${match.length} realistic targets, and ${ambitious.length} ambitious goals for you.`
      }
    });

  } catch (error) {
    console.error("[recommendations] Error:", error);
    res.status(500).json({ success: false, error: String(error) });
  }
};
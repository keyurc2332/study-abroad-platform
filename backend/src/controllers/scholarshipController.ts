import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { spawn } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const prisma = new PrismaClient();

const EXTERNAL_SCHOLARSHIPS = [
  {
    id: "fulbright",
    name: "Fulbright Foreign Student Program",
    country: "USA",
    amount: "Full funding (tuition + stipend + airfare)",
    amountUSD: 50000,
    deadline: "October 15",
    eligibility: ["India", "All nationalities"],
    fields: ["All fields"],
    levels: ["MS", "PhD"],
    link: "https://foreign.fulbrightonline.org",
    competitive: "Very High",
    description: "Prestigious US government scholarship for international students",
  },
  {
    id: "chevening",
    name: "Chevening Scholarship",
    country: "UK",
    amount: "Full funding (tuition + living + travel)",
    amountUSD: 45000,
    deadline: "November 5",
    eligibility: ["India", "Commonwealth nations"],
    fields: ["All fields"],
    levels: ["MS"],
    link: "https://www.chevening.org",
    competitive: "Very High",
    description: "UK government scholarship for future leaders",
  },
  {
    id: "daad",
    name: "DAAD Scholarship",
    country: "Germany",
    amount: "€934/month + travel allowance",
    amountUSD: 15000,
    deadline: "October 15",
    eligibility: ["India", "All nationalities"],
    fields: ["All fields"],
    levels: ["MS", "PhD"],
    link: "https://www.daad.de/en/study-and-research-in-germany/scholarships",
    competitive: "High",
    description: "German Academic Exchange Service scholarship",
  },
  {
    id: "commonwealth",
    name: "Commonwealth Scholarship",
    country: "UK",
    amount: "Full funding",
    amountUSD: 40000,
    deadline: "December 15",
    eligibility: ["India", "Commonwealth nations"],
    fields: ["STEM", "Development"],
    levels: ["MS", "PhD"],
    link: "https://cscuk.fcdo.gov.uk",
    competitive: "Very High",
    description: "For students from Commonwealth countries to study in the UK",
  },
  {
    id: "australia_awards",
    name: "Australia Awards Scholarship",
    country: "Australia",
    amount: "Full funding",
    amountUSD: 48000,
    deadline: "April 30",
    eligibility: ["India", "Select countries"],
    fields: ["All fields"],
    levels: ["MS", "PhD"],
    link: "https://www.australiaawardsindia.org",
    competitive: "High",
    description: "Australian government scholarship for international students",
  },
  {
    id: "vanier",
    name: "Vanier Canada Graduate Scholarship",
    country: "Canada",
    amount: "CAD $50,000/year for 3 years",
    amountUSD: 37000,
    deadline: "November 1",
    eligibility: ["All nationalities"],
    fields: ["Health", "Natural Sciences", "Social Sciences"],
    levels: ["PhD"],
    link: "https://vanier.gc.ca",
    competitive: "Very High",
    description: "Canada's most prestigious graduate scholarship",
  },
  {
    id: "gates_cambridge",
    name: "Gates Cambridge Scholarship",
    country: "UK",
    amount: "Full funding at Cambridge",
    amountUSD: 60000,
    deadline: "October 15",
    eligibility: ["All nationalities except UK"],
    fields: ["All fields"],
    levels: ["MS", "PhD"],
    link: "https://www.gatescambridge.org",
    competitive: "Extremely High",
    description: "Study at University of Cambridge with full funding",
  },
  {
    id: "erasmus_mundus",
    name: "Erasmus Mundus Joint Masters",
    country: "Europe",
    amount: "€1,400/month + tuition waiver",
    amountUSD: 25000,
    deadline: "January 15",
    eligibility: ["All nationalities"],
    fields: ["Multiple — depends on program"],
    levels: ["MS"],
    link: "https://erasmus-plus.ec.europa.eu",
    competitive: "High",
    description: "Study across multiple European universities",
  },
  {
    id: "inlaks",
    name: "Inlaks Shivdasani Foundation",
    country: "Multiple",
    amount: "Up to $100,000",
    amountUSD: 100000,
    deadline: "April 15",
    eligibility: ["India"],
    fields: ["All fields"],
    levels: ["MS", "PhD"],
    link: "https://www.inlaksfoundation.org",
    competitive: "Very High",
    description: "For exceptional Indian students to study at top global universities",
  },
  {
    id: "tata_trust",
    name: "Tata Trusts Scholarship",
    country: "Multiple",
    amount: "Full funding",
    amountUSD: 55000,
    deadline: "January 31",
    eligibility: ["India"],
    fields: ["STEM", "Social Sciences"],
    levels: ["MS", "PhD"],
    link: "https://www.tatatrusts.org",
    competitive: "Very High",
    description: "For Indian students at top US and UK universities",
  },
  {
    id: "stanford_knight_hennessy",
    name: "Knight-Hennessy Scholars (Stanford)",
    country: "USA",
    amount: "Full funding at Stanford",
    amountUSD: 90000,
    deadline: "October 12",
    eligibility: ["All nationalities"],
    fields: ["All fields"],
    levels: ["MS", "PhD"],
    link: "https://knight-hennessy.stanford.edu",
    competitive: "Extremely High",
    description: "Multi-year fellowship at Stanford University",
  },
  {
    id: "aga_khan",
    name: "Aga Khan Foundation Scholarship",
    country: "Multiple",
    amount: "50% grant + 50% loan",
    amountUSD: 30000,
    deadline: "March 31",
    eligibility: ["India", "Select developing countries"],
    fields: ["All fields"],
    levels: ["MS"],
    link: "https://www.akdn.org/our-agencies/aga-khan-foundation/international-scholarship-programme",
    competitive: "High",
    description: "For students from developing countries with financial need",
  },
];

async function generateScholarshipsWithAI(
  profile: Record<string, any>
): Promise<any> {
  return new Promise((resolve) => {
    try {
      const inputFile = path.join(os.tmpdir(), `scholarship_input_${Date.now()}.json`);
      const outputFile = path.join(os.tmpdir(), `scholarship_output_${Date.now()}.json`);

      fs.writeFileSync(inputFile, JSON.stringify(profile), "utf-8");

      const scriptPath = path.join(process.cwd(), "scholarship_ai.py");
      if (!fs.existsSync(scriptPath)) {
        console.log("[Scholarship AI] Script not found at", scriptPath);
        resolve(null);
        return;
      }

      // Windows uses 'python', Unix uses 'python3'
      const pythonCmd = process.platform === "win32" ? "python" : "python3";

      const py = spawn(
        pythonCmd,
        [scriptPath, inputFile, outputFile],
        { env: { ...process.env } }
      );

      let hasError = false;
      py.stderr.on("data", (d: Buffer) => {
        const msg = d.toString().trim();
        console.log("[Scholarship AI]", msg);
        if (msg.includes("Error") || msg.includes("error")) {
          hasError = true;
        }
      });

      py.on("close", (code: number) => {
        try {
          if (code === 0 && fs.existsSync(outputFile)) {
            const raw = fs.readFileSync(outputFile, "utf-8");
            const result = JSON.parse(raw);
            fs.unlinkSync(inputFile);
            fs.unlinkSync(outputFile);
            resolve(result);
          } else {
            resolve(null);
          }
        } catch (e) {
          console.error("[Scholarship AI] Parse error:", e);
          resolve(null);
        }
      });

      py.on("error", (err) => {
        console.error("[Scholarship AI] Process error:", err);
        resolve(null);
      });

      // Timeout after 60s
      setTimeout(() => {
        console.log("[Scholarship AI] Timeout - using fallback");
        py.kill();
        resolve(null);
      }, 60000);
    } catch (e) {
      console.error("[Scholarship AI] Exception:", e);
      resolve(null);
    }
  });
}

// Categorize scholarships based on match score
function categorizeScholarship(matchScore: number): "safe" | "match" | "ambitious" {
  if (matchScore >= 0.75) return "safe";
  if (matchScore >= 0.5) return "match";
  return "ambitious";
}

// Get special category benefits
function getSpecialCategoryBenefit(specialCategory: string): string {
  const benefits: Record<string, string> = {
    SC: "Scheduled Caste - Reserved seats in Indian institutions, preference in government scholarships",
    ST: "Scheduled Tribe - Tribal-specific scholarships, reserved seats in Indian universities",
    OBC: "Other Backward Class - Increasing global recognition, OBC-specific scholarships from Indian companies",
    Minority: "Minority - NGO-funded scholarships, community-based financial aid programs",
    PWD: "Person with Disability - Accessibility accommodations, disability-specific scholarships worldwide",
    NRI: "Non-Resident Indian - NRI quota scholarships, specific funds for diaspora students",
    EWS: "Economically Weaker Section - Income-based aid, financial need scholarships",
    General: "No special category - Merit-based scholarships only",
  };
  return benefits[specialCategory] || "Standard merit-based eligibility";
}

export const getScholarships = async (req: Request, res: Response) => {
  try {
    const {
      nationality = "India",
      level = "MS",
      country,
      field = "Computer Science",
      useAI = "true",
      specialCategory = "General",
    } = req.query;

    console.log(`[Scholarship] Fetching for level=${level}, specialCategory=${specialCategory}`);

    let scholarships: any[] = [];
    let aiGenerated = false;
    let fallbackUsed = false;

    // Try AI generation first
    if (useAI === "true") {
      const profile = {
        nationality: String(nationality),
        level: String(level),
        field: String(field),
        specialCategory: String(specialCategory),
        gpa: 3.7,
        greScore: 320,
        ieltsScore: 7.5,
        budgetUSD: 50000,
      };

      console.log("[Scholarship] Starting AI generation with special category context...");
      const aiResult = await generateScholarshipsWithAI(profile);

      if (aiResult && aiResult.scholarships && aiResult.scholarships.length > 0) {
        scholarships = aiResult.scholarships;
        aiGenerated = true;
        console.log(`[Scholarship] AI generated ${scholarships.length} scholarships`);
      } else {
        console.log("[Scholarship] AI generation failed or returned empty, using fallback");
        fallbackUsed = true;
      }
    } else {
      fallbackUsed = true;
    }

    // Fallback: Filter external scholarships
    if (scholarships.length === 0) {
      const filtered = EXTERNAL_SCHOLARSHIPS.filter((s) => {
        const matchLevel = s.levels.includes(String(level));
        const matchCountry =
          !country ||
          s.country === country ||
          s.country === "Multiple" ||
          s.country === "Europe";
        const matchNationality =
          s.eligibility.includes("All nationalities") ||
          s.eligibility.includes("All nationalities except UK") ||
          s.eligibility.includes(String(nationality));
        return matchLevel && matchCountry && matchNationality;
      });

      scholarships = filtered.map((s) => ({
        id: s.id,
        name: s.name,
        country: s.country,
        amount: s.amount,
        amountUSD: s.amountUSD,
        deadline: s.deadline,
        eligibility: s.eligibility.join(", "),
        matchScore: 0.6, // Default match for fallback
        matchLabel: "Potential Match",
        category: "match",
        priority: 10,
        link: s.link,
        description: s.description,
        specialCategoryBenefit: "Check eligibility individually",
        aiGenerated: false,
      }));

      console.log(`[Scholarship] Using fallback, found ${scholarships.length} scholarships`);
    }

    // Ensure all scholarships have required fields
    scholarships = scholarships.map((s) => ({
      ...s,
      matchScore: s.matchScore ?? 0.6,
      matchLabel: s.matchLabel ?? "Potential Match",
      category: categorizeScholarship(s.matchScore ?? 0.6),
      priority: s.priority ?? 10,
      specialCategoryBenefit: s.specialCategoryBenefit || getSpecialCategoryBenefit(String(specialCategory)),
      aiGenerated: s.aiGenerated ?? aiGenerated,
    }));

    // Sort by match score (descending) and priority
    scholarships.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return a.priority - b.priority;
    });

    // Categorize into buckets
    const categories = {
      safe: scholarships.filter((s) => s.category === "safe").length,
      match: scholarships.filter((s) => s.category === "match").length,
      ambitious: scholarships.filter((s) => s.category === "ambitious").length,
    };

    // Filter special category matches
    const specialCategoryMatches = scholarships.filter((s) => {
      const benefit = s.specialCategoryBenefit || "";
      return benefit && !benefit.includes("Check eligibility") && !benefit.includes("Merit-based");
    });

    const response = {
      success: true,
      aiGenerated,
      fallbackUsed,
      totalMatches: scholarships.length,
      scholarships,
      specialCategoryMatches,
      categories,
      summary: {
        specialCategoryCount: specialCategoryMatches.length,
        specialCategoryBenefit: getSpecialCategoryBenefit(String(specialCategory)),
        message: `Found ${scholarships.length} scholarships. ${specialCategoryMatches.length} have specific benefits for ${specialCategory} students.`,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("[Scholarship] Error:", error);
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
};

export default {
  getScholarships,
};
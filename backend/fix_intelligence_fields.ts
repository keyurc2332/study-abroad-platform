/**
 * fix_intelligence_fields.ts
 * 
 * Run this ONCE to correct intelligence fields in the DB
 * that weren't properly seeded.
 * 
 * Usage: npx ts-node fix_intelligence_fields.ts
 * OR add to package.json scripts and run: npm run fix:intelligence
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Correct intelligence data — verified manually
const UNIVERSITY_CORRECTIONS: Record<string, {
  competitivenessScore: number;
  typicalGPAMin: number;
  typicalGPAMax: number;
  typicalGREMin?: number;
  tier: string;
  researchIntensity: string;
  prPathwayScore: number;
  jobMarketScore: number;
}> = {
  // ── USA ELITE ────────────────────────────────────────────────────────────
  "Massachusetts Institute of Technology": { competitivenessScore: 10, typicalGPAMin: 3.85, typicalGPAMax: 4.0,  typicalGREMin: 330, tier: "ELITE", researchIntensity: "Very High", prPathwayScore: 3, jobMarketScore: 9 },
  "Stanford University":                   { competitivenessScore: 10, typicalGPAMin: 3.85, typicalGPAMax: 4.0,  typicalGREMin: 329, tier: "ELITE", researchIntensity: "Very High", prPathwayScore: 3, jobMarketScore: 9 },
  "Carnegie Mellon University":            { competitivenessScore: 10, typicalGPAMin: 3.75, typicalGPAMax: 4.0,  typicalGREMin: 325, tier: "ELITE", researchIntensity: "Very High", prPathwayScore: 3, jobMarketScore: 9 },
  "Harvard University":                    { competitivenessScore: 10, typicalGPAMin: 3.80, typicalGPAMax: 4.0,  typicalGREMin: 328, tier: "ELITE", researchIntensity: "Very High", prPathwayScore: 3, jobMarketScore: 9 },
  "California Institute of Technology":    { competitivenessScore: 10, typicalGPAMin: 3.85, typicalGPAMax: 4.0,  typicalGREMin: 330, tier: "ELITE", researchIntensity: "Very High", prPathwayScore: 3, jobMarketScore: 9 },
  "Cornell University":                    { competitivenessScore: 9,  typicalGPAMin: 3.70, typicalGPAMax: 3.95, typicalGREMin: 325, tier: "ELITE", researchIntensity: "Very High", prPathwayScore: 3, jobMarketScore: 9 },
  "Columbia University":                   { competitivenessScore: 9,  typicalGPAMin: 3.65, typicalGPAMax: 3.95, typicalGREMin: 323, tier: "ELITE", researchIntensity: "Very High", prPathwayScore: 3, jobMarketScore: 9 },
  "Princeton University":                  { competitivenessScore: 10, typicalGPAMin: 3.80, typicalGPAMax: 4.0,  typicalGREMin: 330, tier: "ELITE", researchIntensity: "Very High", prPathwayScore: 3, jobMarketScore: 9 },

  // ── USA TOP ───────────────────────────────────────────────────────────────
  "University of California Berkeley":     { competitivenessScore: 9,  typicalGPAMin: 3.70, typicalGPAMax: 3.95, typicalGREMin: 325, tier: "ELITE", researchIntensity: "Very High", prPathwayScore: 3, jobMarketScore: 9 },
  "Georgia Institute of Technology":       { competitivenessScore: 8,  typicalGPAMin: 3.60, typicalGPAMax: 3.90, typicalGREMin: 320, tier: "TOP",   researchIntensity: "Very High", prPathwayScore: 3, jobMarketScore: 9 },
  "University of Illinois Urbana-Champaign":{ competitivenessScore: 8, typicalGPAMin: 3.60, typicalGPAMax: 3.90, typicalGREMin: 320, tier: "TOP",   researchIntensity: "Very High", prPathwayScore: 3, jobMarketScore: 9 },
  "University of Michigan":                { competitivenessScore: 8,  typicalGPAMin: 3.60, typicalGPAMax: 3.90, typicalGREMin: 320, tier: "TOP",   researchIntensity: "High",      prPathwayScore: 3, jobMarketScore: 9 },
  "University of California Los Angeles":  { competitivenessScore: 8,  typicalGPAMin: 3.60, typicalGPAMax: 3.90, typicalGREMin: 320, tier: "TOP",   researchIntensity: "Very High", prPathwayScore: 3, jobMarketScore: 9 },
  "University of California San Diego":    { competitivenessScore: 8,  typicalGPAMin: 3.55, typicalGPAMax: 3.85, typicalGREMin: 318, tier: "TOP",   researchIntensity: "Very High", prPathwayScore: 3, jobMarketScore: 9 },
  "University of Washington":              { competitivenessScore: 8,  typicalGPAMin: 3.55, typicalGPAMax: 3.85, typicalGREMin: 318, tier: "TOP",   researchIntensity: "Very High", prPathwayScore: 3, jobMarketScore: 9 },
  "New York University":                   { competitivenessScore: 7,  typicalGPAMin: 3.45, typicalGPAMax: 3.80, typicalGREMin: 318, tier: "TOP",   researchIntensity: "High",      prPathwayScore: 3, jobMarketScore: 9 },
  "Duke University":                       { competitivenessScore: 8,  typicalGPAMin: 3.60, typicalGPAMax: 3.90, typicalGREMin: 320, tier: "TOP",   researchIntensity: "Very High", prPathwayScore: 3, jobMarketScore: 9 },
  "Rice University":                       { competitivenessScore: 8,  typicalGPAMin: 3.60, typicalGPAMax: 3.90, typicalGREMin: 320, tier: "TOP",   researchIntensity: "Very High", prPathwayScore: 3, jobMarketScore: 9 },

  // ── USA STRONG ────────────────────────────────────────────────────────────
  "Purdue University":                     { competitivenessScore: 7,  typicalGPAMin: 3.40, typicalGPAMax: 3.75, typicalGREMin: 315, tier: "STRONG", researchIntensity: "Very High", prPathwayScore: 3, jobMarketScore: 9 },
  "Texas A&M University":                  { competitivenessScore: 7,  typicalGPAMin: 3.40, typicalGPAMax: 3.75, typicalGREMin: 314, tier: "STRONG", researchIntensity: "Very High", prPathwayScore: 3, jobMarketScore: 9 },
  "University of Southern California":     { competitivenessScore: 7,  typicalGPAMin: 3.40, typicalGPAMax: 3.80, typicalGREMin: 315, tier: "STRONG", researchIntensity: "Very High", prPathwayScore: 3, jobMarketScore: 9 },
  "University of Wisconsin Madison":       { competitivenessScore: 7,  typicalGPAMin: 3.40, typicalGPAMax: 3.80, typicalGREMin: 315, tier: "STRONG", researchIntensity: "Very High", prPathwayScore: 3, jobMarketScore: 9 },
  "North Carolina State University":       { competitivenessScore: 6,  typicalGPAMin: 3.30, typicalGPAMax: 3.70, typicalGREMin: 313, tier: "STRONG", researchIntensity: "Very High", prPathwayScore: 3, jobMarketScore: 9 },
  "University of Maryland":                { competitivenessScore: 7,  typicalGPAMin: 3.40, typicalGPAMax: 3.80, typicalGREMin: 315, tier: "STRONG", researchIntensity: "Very High", prPathwayScore: 3, jobMarketScore: 9 },
  "Boston University":                     { competitivenessScore: 6,  typicalGPAMin: 3.30, typicalGPAMax: 3.70, typicalGREMin: 313, tier: "STRONG", researchIntensity: "High",      prPathwayScore: 3, jobMarketScore: 9 },
  "University of Virginia":                { competitivenessScore: 6,  typicalGPAMin: 3.30, typicalGPAMax: 3.70, typicalGREMin: 312, tier: "STRONG", researchIntensity: "High",      prPathwayScore: 3, jobMarketScore: 9 },
  "Ohio State University":                 { competitivenessScore: 6,  typicalGPAMin: 3.30, typicalGPAMax: 3.70, typicalGREMin: 312, tier: "STRONG", researchIntensity: "High",      prPathwayScore: 3, jobMarketScore: 8 },
  "University of Texas Austin":            { competitivenessScore: 7,  typicalGPAMin: 3.40, typicalGPAMax: 3.80, typicalGREMin: 315, tier: "STRONG", researchIntensity: "Very High", prPathwayScore: 3, jobMarketScore: 9 },
  "Virginia Tech":                         { competitivenessScore: 6,  typicalGPAMin: 3.30, typicalGPAMax: 3.70, typicalGREMin: 312, tier: "STRONG", researchIntensity: "High",      prPathwayScore: 3, jobMarketScore: 8 },
  "Michigan State University":             { competitivenessScore: 5,  typicalGPAMin: 3.20, typicalGPAMax: 3.60, typicalGREMin: 310, tier: "STRONG", researchIntensity: "High",      prPathwayScore: 3, jobMarketScore: 8 },
  "Penn State University":                 { competitivenessScore: 6,  typicalGPAMin: 3.30, typicalGPAMax: 3.70, typicalGREMin: 312, tier: "STRONG", researchIntensity: "High",      prPathwayScore: 3, jobMarketScore: 8 },
  "University of Minnesota Twin Cities":   { competitivenessScore: 6,  typicalGPAMin: 3.30, typicalGPAMax: 3.70, typicalGREMin: 312, tier: "STRONG", researchIntensity: "High",      prPathwayScore: 3, jobMarketScore: 8 },
  "University of Rochester":               { competitivenessScore: 6,  typicalGPAMin: 3.30, typicalGPAMax: 3.70, typicalGREMin: 312, tier: "STRONG", researchIntensity: "High",      prPathwayScore: 3, jobMarketScore: 8 },
  "Northeastern University":               { competitivenessScore: 6,  typicalGPAMin: 3.30, typicalGPAMax: 3.70, typicalGREMin: 312, tier: "STRONG", researchIntensity: "High",      prPathwayScore: 3, jobMarketScore: 9 },

  // ── USA GOOD/ACCESSIBLE ───────────────────────────────────────────────────
  "Arizona State University":              { competitivenessScore: 3,  typicalGPAMin: 2.85, typicalGPAMax: 3.20, typicalGREMin: 303, tier: "ACCESSIBLE", researchIntensity: "High",  prPathwayScore: 3, jobMarketScore: 8 },
  "University of Nebraska Lincoln":        { competitivenessScore: 3,  typicalGPAMin: 2.80, typicalGPAMax: 3.30, tier: "GOOD", researchIntensity: "High",  prPathwayScore: 3, jobMarketScore: 7 },
  "Kansas State University":               { competitivenessScore: 3,  typicalGPAMin: 2.80, typicalGPAMax: 3.30, tier: "GOOD", researchIntensity: "Medium", prPathwayScore: 3, jobMarketScore: 7 },
  "University of Alabama Birmingham":      { competitivenessScore: 2,  typicalGPAMin: 2.70, typicalGPAMax: 3.20, tier: "GOOD", researchIntensity: "Medium", prPathwayScore: 3, jobMarketScore: 6 },

  // ── CANADA ────────────────────────────────────────────────────────────────
  "University of Toronto":    { competitivenessScore: 8, typicalGPAMin: 3.60, typicalGPAMax: 3.90, tier: "ELITE",  researchIntensity: "Very High", prPathwayScore: 9, jobMarketScore: 8 },
  "University of British Columbia": { competitivenessScore: 8, typicalGPAMin: 3.55, typicalGPAMax: 3.85, tier: "ELITE", researchIntensity: "Very High", prPathwayScore: 9, jobMarketScore: 8 },
  "McGill University":        { competitivenessScore: 7, typicalGPAMin: 3.50, typicalGPAMax: 3.80, tier: "TOP",    researchIntensity: "Very High", prPathwayScore: 8, jobMarketScore: 8 },
  "University of Waterloo":   { competitivenessScore: 7, typicalGPAMin: 3.40, typicalGPAMax: 3.75, tier: "TOP",    researchIntensity: "Very High", prPathwayScore: 9, jobMarketScore: 8 },
  "University of Alberta":    { competitivenessScore: 6, typicalGPAMin: 3.20, typicalGPAMax: 3.60, tier: "STRONG", researchIntensity: "Very High", prPathwayScore: 9, jobMarketScore: 8 },
  "McMaster University":      { competitivenessScore: 6, typicalGPAMin: 3.20, typicalGPAMax: 3.60, tier: "STRONG", researchIntensity: "Very High", prPathwayScore: 9, jobMarketScore: 8 },
  "University of Calgary":    { competitivenessScore: 5, typicalGPAMin: 3.00, typicalGPAMax: 3.50, tier: "GOOD",   researchIntensity: "Very High", prPathwayScore: 9, jobMarketScore: 8 },
  "University of Ottawa":     { competitivenessScore: 5, typicalGPAMin: 3.00, typicalGPAMax: 3.50, tier: "GOOD",   researchIntensity: "Very High", prPathwayScore: 9, jobMarketScore: 8 },
  "Dalhousie University":     { competitivenessScore: 4, typicalGPAMin: 2.80, typicalGPAMax: 3.30, tier: "GOOD",   researchIntensity: "High",      prPathwayScore: 8, jobMarketScore: 7 },
  "Concordia University":     { competitivenessScore: 4, typicalGPAMin: 2.80, typicalGPAMax: 3.30, tier: "GOOD",   researchIntensity: "High",      prPathwayScore: 8, jobMarketScore: 7 },
  "University of Manitoba":   { competitivenessScore: 3, typicalGPAMin: 2.70, typicalGPAMax: 3.20, tier: "ACCESSIBLE", researchIntensity: "High",  prPathwayScore: 8, jobMarketScore: 7 },
  "Queen's University":       { competitivenessScore: 6, typicalGPAMin: 3.20, typicalGPAMax: 3.60, tier: "STRONG", researchIntensity: "High",      prPathwayScore: 9, jobMarketScore: 8 },
  "Western University":       { competitivenessScore: 5, typicalGPAMin: 3.00, typicalGPAMax: 3.50, tier: "GOOD",   researchIntensity: "High",      prPathwayScore: 9, jobMarketScore: 8 },
  "Simon Fraser University":  { competitivenessScore: 6, typicalGPAMin: 3.20, typicalGPAMax: 3.60, tier: "STRONG", researchIntensity: "High",      prPathwayScore: 9, jobMarketScore: 8 },

  // ── UK ────────────────────────────────────────────────────────────────────
  "University of Oxford":     { competitivenessScore: 10, typicalGPAMin: 3.85, typicalGPAMax: 4.0,  tier: "ELITE", researchIntensity: "Very High", prPathwayScore: 4, jobMarketScore: 8 },
  "University of Cambridge":  { competitivenessScore: 10, typicalGPAMin: 3.85, typicalGPAMax: 4.0,  tier: "ELITE", researchIntensity: "Very High", prPathwayScore: 4, jobMarketScore: 8 },
  "Imperial College London":  { competitivenessScore: 9,  typicalGPAMin: 3.70, typicalGPAMax: 3.95, tier: "ELITE", researchIntensity: "Very High", prPathwayScore: 4, jobMarketScore: 8 },
  "University College London":{ competitivenessScore: 8,  typicalGPAMin: 3.50, typicalGPAMax: 3.85, tier: "TOP",   researchIntensity: "Very High", prPathwayScore: 4, jobMarketScore: 8 },
  "University of Edinburgh":  { competitivenessScore: 7,  typicalGPAMin: 3.40, typicalGPAMax: 3.75, tier: "TOP",   researchIntensity: "Very High", prPathwayScore: 4, jobMarketScore: 7 },
  "King's College London":    { competitivenessScore: 7,  typicalGPAMin: 3.30, typicalGPAMax: 3.70, tier: "TOP",   researchIntensity: "Very High", prPathwayScore: 4, jobMarketScore: 7 },

  // ── GERMANY ───────────────────────────────────────────────────────────────
  "Technical University of Munich":        { competitivenessScore: 8, typicalGPAMin: 3.50, typicalGPAMax: 3.85, tier: "ELITE",  researchIntensity: "Very High", prPathwayScore: 6, jobMarketScore: 7 },
  "RWTH Aachen University":                { competitivenessScore: 7, typicalGPAMin: 3.30, typicalGPAMax: 3.70, tier: "TOP",    researchIntensity: "Very High", prPathwayScore: 6, jobMarketScore: 7 },
  "Heidelberg University":                 { competitivenessScore: 7, typicalGPAMin: 3.30, typicalGPAMax: 3.70, tier: "TOP",    researchIntensity: "Very High", prPathwayScore: 6, jobMarketScore: 7 },

  // ── AUSTRALIA ─────────────────────────────────────────────────────────────
  "University of Melbourne":               { competitivenessScore: 7, typicalGPAMin: 3.30, typicalGPAMax: 3.70, tier: "TOP",   researchIntensity: "Very High", prPathwayScore: 7, jobMarketScore: 7 },
  "Australian National University":        { competitivenessScore: 7, typicalGPAMin: 3.30, typicalGPAMax: 3.70, tier: "TOP",   researchIntensity: "Very High", prPathwayScore: 7, jobMarketScore: 7 },
  "University of Sydney":                  { competitivenessScore: 7, typicalGPAMin: 3.30, typicalGPAMax: 3.70, tier: "TOP",   researchIntensity: "Very High", prPathwayScore: 7, jobMarketScore: 7 },
  "University of New South Wales":         { competitivenessScore: 7, typicalGPAMin: 3.30, typicalGPAMax: 3.70, tier: "TOP",   researchIntensity: "Very High", prPathwayScore: 7, jobMarketScore: 7 },
};

async function fixIntelligenceFields() {
  console.log("🔧 Fixing intelligence fields in DB...\n");

  let updated = 0;
  let skipped = 0;

  for (const [uniName, data] of Object.entries(UNIVERSITY_CORRECTIONS)) {
    try {
      const result = await prisma.university.updateMany({
        where: { name: uniName },
        data: {
          competitivenessScore: data.competitivenessScore,
          typicalGPAMin:        data.typicalGPAMin,
          typicalGPAMax:        data.typicalGPAMax,
          typicalGREMin:        data.typicalGREMin ?? null,
          tier:                 data.tier,
          researchIntensity:    data.researchIntensity,
          prPathwayScore:       data.prPathwayScore,
          jobMarketScore:       data.jobMarketScore,
        },
      });

      if (result.count > 0) {
        console.log(`✅ ${uniName}: ${result.count} record(s) updated`);
        updated += result.count;
      } else {
        skipped++;
      }
    } catch (err) {
      console.error(`❌ ${uniName}:`, err);
    }
  }

  console.log(`\n✅ Done: ${updated} records updated, ${skipped} universities not found in DB`);
  await prisma.$disconnect();
}

fixIntelligenceFields().catch(console.error);
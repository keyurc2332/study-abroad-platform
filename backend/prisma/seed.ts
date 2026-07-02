import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// ── Helpers ──────────────────────────────────────────────────────────────────

function bool(v: unknown, fallback = false): boolean {
  if (v === null || v === undefined) return fallback;
  return Boolean(v);
}

function int(v: unknown, fallback: number | null = null): number | null {
  if (v === null || v === undefined) return fallback;
  const n = Number(v);
  return isNaN(n) ? fallback : Math.round(n);
}

function float(v: unknown, fallback: number | null = null): number | null {
  if (v === null || v === undefined) return fallback;
  const n = Number(v);
  return isNaN(n) ? fallback : n;
}

function str(v: unknown, fallback: string | null = null): string | null {
  if (v === null || v === undefined) return fallback;
  return String(v);
}

function strArr(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x)).filter(Boolean);
}

// ── Data directory ────────────────────────────────────────────────────────────
// Place JSON files in backend/data/ (same directory as this file's parent)
const DATA_DIR = path.join(__dirname, "..", "data");

const FILES = [
  { file: "universities_usa_ug.json",       country: "USA",       level: "UG"  },
  { file: "universities_usa_ms.json",       country: "USA",       level: "MS"  },
  { file: "universities_usa_phd.json",      country: "USA",       level: "PhD" },
  { file: "universities_uk_ug.json",        country: "UK",        level: "UG"  },
  { file: "universities_uk_ms.json",        country: "UK",        level: "MS"  },
  { file: "universities_uk_phd.json",       country: "UK",        level: "PhD" },
  { file: "universities_canada_ug.json",    country: "Canada",    level: "UG"  },
  { file: "universities_canada_ms.json",    country: "Canada",    level: "MS"  },
  { file: "universities_canada_phd.json",   country: "Canada",    level: "PhD" },
  { file: "universities_australia_ug.json", country: "Australia", level: "UG"  },
  { file: "universities_australia_ms.json", country: "Australia", level: "MS"  },
  { file: "universities_australia_phd.json",country: "Australia", level: "PhD" },
  { file: "universities_germany_ug.json",   country: "Germany",   level: "UG"  },
  { file: "universities_germany_ms.json",   country: "Germany",   level: "MS"  },
  { file: "universities_germany_phd.json",  country: "Germany",   level: "PhD" },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting seed...\n");

  let totalUnis = 0;
  let totalProgs = 0;

  for (const { file, country, level } of FILES) {
    const filePath = path.join(DATA_DIR, file);

    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠️  Missing: ${file} — skipping`);
      continue;
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const universities: any[] = JSON.parse(raw);

    console.log(`📂 ${file} — ${universities.length} unis`);

    for (const uni of universities) {
      // ── Upsert University ────────────────────────────────────────────────
      const uniId: string = uni.id;
      if (!uniId) {
        console.warn(`    ⚠️  University missing id — skipping`);
        continue;
      }

      await prisma.university.upsert({
        where: { id: uniId },
        update: {
          name:           uni.name,
          country,
          city:           uni.city,
          state:          str(uni.state),
          level,
          ranking:        int(uni.ranking),
          acceptanceRate: float(uni.acceptanceRate),
          website:        str(uni.website),
          campusType:     str(uni.campusType) as any,

          estimatedLivingCostUSD:  int(uni.estimatedLivingCostUSD),
          healthInsuranceCostUSD:  int(uni.healthInsuranceCostUSD),
          postStudyWorkMonths:     int(uni.postStudyWorkMonths),
          workHoursAllowed:        int(uni.workHoursAllowed),

          nhsIhsSurchargeUSD:      int(uni.nhsIhsSurchargeUSD),
          blockedAccountRequired:  uni.blockedAccountRequired ?? null,
          blockedAccountAmountUSD: int(uni.blockedAccountAmountUSD),
          apsRequired:             uni.apsRequired ?? null,
          uniAssistRequired:       uni.uniAssistRequired ?? null,
          studyPermitRequired:     uni.studyPermitRequired ?? null,
          f1VisaRequired:          uni.f1VisaRequired ?? null,
          oshcRequired:            uni.oshcRequired ?? null,

          cheveningEligible:    uni.cheveningEligible ?? null,
          daadEligible:         uni.daadEligible ?? null,
          rtpEligible:          uni.rtpEligible ?? null,
          commonwealthEligible: uni.commonwealthEligible ?? null,
          fulbrightEligible:    uni.fulbrightEligible ?? null,

          competitivenessScore:   int(uni.competitivenessScore),
          typicalGPAMin:          float(uni.typicalGPAMin),
          typicalGPAMax:          float(uni.typicalGPAMax),
          typicalGREMin:          int(uni.typicalGREMin),
          tier:                   str(uni.tier),
          researchIntensity:      str(uni.researchIntensity),
          prPathwayScore:         int(uni.prPathwayScore),
          jobMarketScore:         int(uni.jobMarketScore),
          pgwpEligible:           uni.pgwpEligible ?? null,
          assistantshipAvailable: uni.assistantshipAvailable ?? null,
          rollingAdmissions:      uni.rollingAdmissions ?? null,
          publicUniversity:       uni.publicUniversity ?? null,

          dataSource:   str(uni.dataSource),
          lastVerified: str(uni.lastVerified),
        },
        create: {
          id:             uniId,
          name:           uni.name,
          country,
          city:           uni.city,
          state:          str(uni.state),
          level,
          ranking:        int(uni.ranking),
          acceptanceRate: float(uni.acceptanceRate),
          website:        str(uni.website),
          campusType:     str(uni.campusType) as any,

          estimatedLivingCostUSD:  int(uni.estimatedLivingCostUSD),
          healthInsuranceCostUSD:  int(uni.healthInsuranceCostUSD),
          postStudyWorkMonths:     int(uni.postStudyWorkMonths),
          workHoursAllowed:        int(uni.workHoursAllowed),

          nhsIhsSurchargeUSD:      int(uni.nhsIhsSurchargeUSD),
          blockedAccountRequired:  uni.blockedAccountRequired ?? null,
          blockedAccountAmountUSD: int(uni.blockedAccountAmountUSD),
          apsRequired:             uni.apsRequired ?? null,
          uniAssistRequired:       uni.uniAssistRequired ?? null,
          studyPermitRequired:     uni.studyPermitRequired ?? null,
          f1VisaRequired:          uni.f1VisaRequired ?? null,
          oshcRequired:            uni.oshcRequired ?? null,

          cheveningEligible:    uni.cheveningEligible ?? null,
          daadEligible:         uni.daadEligible ?? null,
          rtpEligible:          uni.rtpEligible ?? null,
          commonwealthEligible: uni.commonwealthEligible ?? null,
          fulbrightEligible:    uni.fulbrightEligible ?? null,

          competitivenessScore:   int(uni.competitivenessScore),
          typicalGPAMin:          float(uni.typicalGPAMin),
          typicalGPAMax:          float(uni.typicalGPAMax),
          typicalGREMin:          int(uni.typicalGREMin),
          tier:                   str(uni.tier),
          researchIntensity:      str(uni.researchIntensity),
          prPathwayScore:         int(uni.prPathwayScore),
          jobMarketScore:         int(uni.jobMarketScore),
          pgwpEligible:           uni.pgwpEligible ?? null,
          assistantshipAvailable: uni.assistantshipAvailable ?? null,
          rollingAdmissions:      uni.rollingAdmissions ?? null,
          publicUniversity:       uni.publicUniversity ?? null,

          dataSource:   str(uni.dataSource),
          lastVerified: str(uni.lastVerified),
        },
      });

      totalUnis++;

      // ── Delete + Recreate Programs (clean upsert) ─────────────────────────
      await prisma.program.deleteMany({ where: { universityId: uniId } });

      const programs: any[] = uni.programs ?? [];

      for (const prog of programs) {
        await prisma.program.create({
          data: {
            universityId: uniId,

            level,
            name:          prog.name,
            degree:        prog.degree ?? "",
            field:         prog.field  ?? "",
            durationMonths: int(prog.durationMonths) ?? 12,
            language:      str(prog.language),
            campusType:    str(prog.campusType),

            tuitionUSD:              int(prog.tuitionUSD),
            applicationFee:          int(prog.applicationFee),
            estimatedLivingCostUSD:  int(prog.estimatedLivingCostUSD),
            healthInsuranceCostUSD:  int(prog.healthInsuranceCostUSD),
            nhsIhsSurchargeUSD:      int(prog.nhsIhsSurchargeUSD),
            semesterContributionUSD: int(prog.semesterContributionUSD),
            totalFirstYearCostUSD:   int(prog.totalFirstYearCostUSD),
            netCostAfterFundingUSD:  int(prog.netCostAfterFundingUSD),

            ieltsMin:    float(prog.ieltsMin),
            toeflMin:    int(prog.toeflMin),
            pteMin:      int(prog.pteMin),
            duolingoMin: int(prog.duolingoMin),

            minGPA:             float(prog.minGPA),
            highSchoolGPA:      float(prog.highSchoolGPA),
            satMin:             int(prog.satMin),
            actMin:             int(prog.actMin),
            greRequired:        bool(prog.greRequired),
            minGRE:             int(prog.minGRE),
            gmatRequired:       bool(prog.gmatRequired),
            gmatMinScore:       int(prog.gmatMinScore),
            workExperienceYears: int(prog.workExperienceYears) ?? 0,

            funded:     prog.funded ?? null,
            stipendUSD: int(prog.stipendUSD),

            sopRequired:               bool(prog.sopRequired, true),
            motivationLetterRequired:  bool(prog.motivationLetterRequired),
            resumeRequired:            bool(prog.resumeRequired, true),
            lorCount:                  int(prog.lorCount) ?? 2,
            transcriptRequired:        bool(prog.transcriptRequired, true),
            financialDocRequired:      bool(prog.financialDocRequired, true),
            researchStatementRequired: bool(prog.researchStatementRequired),
            researchProposalRequired:  bool(prog.researchProposalRequired),
            advisorMatchRequired:      bool(prog.advisorMatchRequired),
            portfolioRequired:         bool(prog.portfolioRequired),
            writingSampleRequired:     bool(prog.writingSampleRequired),
            personalStatementRequired: bool(prog.personalStatementRequired),
            admissionTestRequired:     str(prog.admissionTestRequired),

            applicationPortal: str(prog.applicationPortal),
            ucasRequired:      bool(prog.ucasRequired),
            deadlineFall:      str(prog.deadlineFall),
            deadlineWinter:    str(prog.deadlineWinter),
            intakeMonths:      strArr(prog.intakeMonths),

            apostilleRequired:       bool(prog.apostilleRequired),
            apsRequired:             bool(prog.apsRequired),
            uniAssistRequired:       bool(prog.uniAssistRequired),
            blockedAccountRequired:  bool(prog.blockedAccountRequired),
            blockedAccountAmountUSD: int(prog.blockedAccountAmountUSD),
            germanLanguageRequired:  bool(prog.germanLanguageRequired),
            oshcRequired:            prog.oshcRequired ?? null,
            oshcCostUSD:             int(prog.oshcCostUSD),

            postStudyWorkMonths: int(prog.postStudyWorkMonths),
            workHoursAllowed:    int(prog.workHoursAllowed),
            stemDesignated:      prog.stemDesignated ?? null,
            optEligibleMonths:   int(prog.optEligibleMonths),

            scholarships:         bool(prog.scholarships),
            cheveningEligible:    bool(prog.cheveningEligible),
            daadEligible:         bool(prog.daadEligible),
            rtpEligible:          prog.rtpEligible ?? null,
            commonwealthEligible: bool(prog.commonwealthEligible),
            fulbrightEligible:    bool(prog.fulbrightEligible),

            coopAvailable:      bool(prog.coopAvailable),
            internshipIncluded: bool(prog.internshipIncluded),
            thesisRequired:     bool(prog.thesisRequired),
            researchAreas:      strArr(prog.researchAreas),

            officialURL:  str(prog.officialURL),
            dataSource:   str(prog.dataSource),
            lastVerified: str(prog.lastVerified),
            notes:        str(prog.notes),
          },
        });

        totalProgs++;
      }
    }

    console.log(`  ✅ Done\n`);
  }

  console.log(`\n🎉 Seed complete!`);
  console.log(`   Universities: ${totalUnis}`);
  console.log(`   Programs:     ${totalProgs}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
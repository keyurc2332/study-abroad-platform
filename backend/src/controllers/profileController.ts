import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createProfile = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name:  data.name,
        profile: {
          create: {
            // Academic background
            gpa:                data.gpa,
            gradeSystem:        data.gradeSystem,
            targetDegree:       data.targetDegree,
            targetFields:       data.targetFields       ?? [],
            preferredCountries: data.preferredCountries ?? [],
            undergraduateField: data.undergraduateField ?? null,

            // Budget & timeline
            budgetUSD:    data.budgetUSD,
            intakeYear:   data.intakeYear,
            intakeSeason: data.intakeSeason,

            // Test scores (all optional)
            ieltsScore:    data.ieltsScore    ?? null,
            toeflScore:    data.toeflScore    ?? null,
            pteScore:      data.pteScore      ?? null,
            duolingoScore: data.duolingoScore ?? null,
            greScore:      data.greScore      ?? null,
            satScore:      data.satScore      ?? null,
            actScore:      data.actScore      ?? null,

            // Background
            workExYears: data.workExYears ?? 0,
            nationality: data.nationality ?? "",
            specialCategory: data.specialCategory ?? "General",
          },
        },
      },
      include: { profile: true },
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error("[profile] Create error:", error);
    res.status(500).json({ success: false, error: String(error) });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    const user = await prisma.user.findUnique({
      where:   { email: String(email) },
      include: { profile: true },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    const data = req.body;

    const user = await prisma.user.findUnique({
      where: { email: String(email) },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      res.status(404).json({ success: false, message: "User or profile not found" });
      return;
    }

    const updated = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        ...(data.gpa               !== undefined && { gpa:               data.gpa               }),
        ...(data.gradeSystem       !== undefined && { gradeSystem:       data.gradeSystem       }),
        ...(data.targetDegree      !== undefined && { targetDegree:      data.targetDegree      }),
        ...(data.targetFields      !== undefined && { targetFields:      data.targetFields      }),
        ...(data.preferredCountries !== undefined && { preferredCountries: data.preferredCountries }),
        ...(data.budgetUSD         !== undefined && { budgetUSD:         data.budgetUSD         }),
        ...(data.intakeYear        !== undefined && { intakeYear:        data.intakeYear        }),
        ...(data.intakeSeason      !== undefined && { intakeSeason:      data.intakeSeason      }),
        ...(data.ieltsScore        !== undefined && { ieltsScore:        data.ieltsScore        }),
        ...(data.toeflScore        !== undefined && { toeflScore:        data.toeflScore        }),
        ...(data.pteScore          !== undefined && { pteScore:          data.pteScore          }),
        ...(data.duolingoScore     !== undefined && { duolingoScore:     data.duolingoScore     }),
        ...(data.greScore          !== undefined && { greScore:          data.greScore          }),
        ...(data.satScore          !== undefined && { satScore:          data.satScore          }),
        ...(data.actScore          !== undefined && { actScore:          data.actScore          }),
        ...(data.workExYears       !== undefined && { workExYears:       data.workExYears       }),
        ...(data.nationality       !== undefined && { nationality:       data.nationality       }),
        ...(data.specialCategory   !== undefined && { specialCategory:   data.specialCategory   }),
      },
    });

    res.json({ success: true, profile: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
};
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createProfile = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        profile: {
          create: {
            gpa: data.gpa,
            gradeSystem: data.gradeSystem,
            targetDegree: data.targetDegree,
            targetFields: data.targetFields,
            preferredCountries: data.preferredCountries,
            budgetUSD: data.budgetUSD,
            intakeYear: data.intakeYear,
            intakeSeason: data.intakeSeason,
            workExYears: data.workExYears,
            nationality: data.nationality,
          },
        },
      },
      include: { profile: true },
    });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    const user = await prisma.user.findUnique({
      where: { email: String(email) },
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
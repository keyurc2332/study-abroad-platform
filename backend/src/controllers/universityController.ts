import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUniversities = async (req: Request, res: Response) => {
  try {
    const { country, maxBudget, minBudget, search } = req.query;

    const universities = await prisma.university.findMany({
      where: {
        ...(country && { country: String(country) }),
        ...(maxBudget && { tuitionUSD: { lte: Number(maxBudget) } }),
        ...(minBudget && { tuitionUSD: { gte: Number(minBudget) } }),
        ...(search && {
          name: { contains: String(search), mode: "insensitive" },
        }),
      },
      orderBy: { ranking: "asc" },
    });

    res.json({ success: true, count: universities.length, universities });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
};

export const getUniversityById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const university = await prisma.university.findUnique({
      where: { id: String(id) },
    });

    if (!university) {
      res.status(404).json({ success: false, message: "University not found" });
      return;
    }

    res.json({ success: true, university });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
};
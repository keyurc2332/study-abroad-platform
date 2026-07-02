import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUniversities = async (req: Request, res: Response) => {
  try {
    const {
      country,
      search,
      tier,
      field,
      minBudget,
      maxBudget,
      page = "0",
      limit = "20",
    } = req.query;

    const skip = Number(page) * Number(limit);

    const where: any = {
      ...(country && country !== "All" && { country: String(country) }),
      ...(tier && { tier: String(tier) }),
      ...(search && {
        OR: [
          { name: { contains: String(search), mode: "insensitive" } },
          { city: { contains: String(search), mode: "insensitive" } },
        ],
      }),
      // Only include universities that have at least one program
      programs: { some: {} },
    };

    const [total, universities] = await Promise.all([
      prisma.university.count({ where }),
      prisma.university.findMany({
        where,
        orderBy: [{ ranking: "asc" }],
        skip,
        take: Number(limit),
        include: {
          programs: {
            take: 3,
            select: {
              name: true,
              field: true,
              level: true,
              tuitionUSD: true,
              deadlineFall: true,
              stemDesignated: true,
              funded: true,
            },
          },
        },
      }),
    ]);

    // Get unique countries for filter dropdown
    const countries = await prisma.university.findMany({
      select: { country: true },
      distinct: ["country"],
      orderBy: { country: "asc" },
    });

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      universities,
      countries: countries.map((c) => c.country),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
};

export const getUniversityById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const university = await prisma.university.findUnique({
      where: { id: String(id) },
      include: { programs: true },
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
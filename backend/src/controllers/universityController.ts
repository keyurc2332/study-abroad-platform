import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUniversities = async (req: Request, res: Response) => {
  try {
    const { country, search, tier, page = "0", limit = "18" } = req.query;

    const skip = Number(page) * Number(limit);

    const where: any = {
      ...(country && country !== "All" && { country: String(country) }),
      ...(tier && tier !== "All" && { tier: String(tier) }),
      ...(search && {
        OR: [
          { name: { contains: String(search), mode: "insensitive" } },
          { city: { contains: String(search), mode: "insensitive" } },
        ],
      }),
    };

    // Fetch more than needed so we can deduplicate by name
    const raw = await prisma.university.findMany({
      where,
      orderBy: [{ ranking: "asc" }],
      skip,
      take: Number(limit) * 4, // fetch extra to account for duplicates
      include: {
        programs: {
          take: 5,
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
    });

    // Deduplicate by university name (keep first occurrence)
    const seen = new Set<string>();
    const universities = raw.filter(u => {
      if (seen.has(u.name)) return false;
      seen.add(u.name);
      return true;
    }).slice(0, Number(limit));

    // Get total unique count
    const allRaw = await prisma.university.findMany({
      where,
      select: { name: true },
    });
    const uniqueNames = new Set(allRaw.map(u => u.name));
    const total = uniqueNames.size;

    // Get unique countries for filter
    const countryRows = await prisma.university.findMany({
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
      countries: countryRows.map(c => c.country),
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
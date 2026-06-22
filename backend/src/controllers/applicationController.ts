import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_USER_ID = "default_user";

async function ensureUser() {
  const existing = await prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } });
  if (!existing) {
    await prisma.user.create({
      data: {
        id: DEFAULT_USER_ID,
        email: "student@studyabroad.app",
        name: "Student",
      },
    });
  }
}

export const getApplications = async (req: Request, res: Response) => {
  try {
    await ensureUser();
    const applications = await prisma.application.findMany({
      where: { userId: DEFAULT_USER_ID },
      include: {
        university: {
          select: {
            name: true,
            country: true,
            city: true,
            ranking: true,
            tier: true,
            website: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
};

export const createApplication = async (req: Request, res: Response) => {
  try {
    await ensureUser();
    const { universityId, programId, status, deadline, notes } = req.body;

    if (!universityId) {
      res.status(400).json({ success: false, message: "universityId is required" });
      return;
    }

    const university = await prisma.university.findFirst({
      where: { name: { contains: universityId, mode: "insensitive" } },
    });

    if (!university) {
      res.status(404).json({ success: false, message: "University not found" });
      return;
    }

    const existing = await prisma.application.findFirst({
      where: { userId: DEFAULT_USER_ID, universityId: university.id },
    });

    if (existing) {
      res.status(409).json({ success: false, message: "Already tracking this university" });
      return;
    }

    const application = await prisma.application.create({
      data: {
        userId: DEFAULT_USER_ID,
        universityId: university.id,
        programId: programId ?? null,
        status: status ?? "shortlisted",
        deadline: deadline ? new Date(deadline) : null,
        notes: notes ?? null,
      },
      include: {
        university: {
          select: {
            name: true,
            country: true,
            city: true,
            ranking: true,
            tier: true,
            website: true,
          },
        },
      },
    });

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
};

export const updateApplication = async (req: Request, res: Response) => {
  try {
    const appId = String(req.params.id);
    const { status, deadline, notes } = req.body;

    const application = await prisma.application.update({
      where: { id: appId },
      data: {
        ...(status && { status }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        university: {
          select: {
            name: true,
            country: true,
            city: true,
            ranking: true,
            tier: true,
            website: true,
          },
        },
      },
    });

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
};

export const deleteApplication = async (req: Request, res: Response) => {
  try {
    const appId = String(req.params.id);
    await prisma.application.delete({ where: { id: appId } });
    res.json({ success: true, message: "Application removed" });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
};
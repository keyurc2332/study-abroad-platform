import { Request, Response } from "express";
import { generateChecklist } from "../intelligence/checklist";

export const getChecklist = async (req: Request, res: Response) => {
  try {
    const {
      programId,           // specific program — most accurate
      preferredCountries,  // fallback if no programId
      targetDegree,
      nationality,
    } = req.body;

    const checklist = await generateChecklist({
      programId,
      preferredCountries,
      targetDegree,
      nationality,
    });

    res.json({
      success: true,
      count: checklist.length,
      programId: programId ?? null,
      checklist,
    });
  } catch (error) {
    console.error("[checklist] Error:", error);
    res.status(500).json({ success: false, error: String(error) });
  }
};
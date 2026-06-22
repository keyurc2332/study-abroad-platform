// File: src/routes/resume.ts

import { Router, Request, Response } from "express";
import {
  saveResume,
  generateResume,
  getResume,
  getResumeSuggestionsHandler,
  deleteResume,
} from "../controllers/resumeController";

const router = Router();

/**
 * @POST /api/v1/resume/save
 * Save resume data without AI generation
 * Body: ResumeData with email
 */
router.post("/save", async (req: Request, res: Response) => {
  await saveResume(req, res);
});

/**
 * @POST /api/v1/resume/generate
 * Generate AI-powered resume with Gemini enhancements
 * Body: ResumeData with email
 */
router.post("/generate", async (req: Request, res: Response) => {
  await generateResume(req, res);
});

/**
 * @GET /api/v1/resume/:email
 * Get saved resume by email
 */
router.get("/:email", async (req: Request, res: Response) => {
  await getResume(req, res);
});

/**
 * @POST /api/v1/resume/suggestions
 * Get AI improvement suggestions for resume
 * Body: ResumeData with email
 */
router.post("/suggestions", async (req: Request, res: Response) => {
  await getResumeSuggestionsHandler(req, res);
});

/**
 * @DELETE /api/v1/resume/:email
 * Delete resume by email
 */
router.delete("/:email", async (req: Request, res: Response) => {
  await deleteResume(req, res);
});

export default router;
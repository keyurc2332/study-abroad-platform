import { Router, Request, Response } from "express";
import { generateAiDocument } from "../controllers/aiDocumentController";

const router = Router();

router.post("/generate", async (req: Request, res: Response) => {
  await generateAiDocument(req, res);
});

export default router;

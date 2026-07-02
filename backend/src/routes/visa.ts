import { Router } from "express";
import {
  startInterview,
  sendMessage,
  getInterview,
  endInterview,
} from "../controllers/visaController";

const router = Router();

// Start new interview
router.post("/start", startInterview);

// Send message (ask/answer)
router.post("/chat", sendMessage);

// Get interview details
router.get("/:sessionId", getInterview);

// End interview
router.post("/end", endInterview);

export default router;
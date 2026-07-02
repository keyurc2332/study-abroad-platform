import { Router } from "express";
import { getChecklist } from "../controllers/checklistController";

const router = Router();

router.post("/", getChecklist);

export default router;
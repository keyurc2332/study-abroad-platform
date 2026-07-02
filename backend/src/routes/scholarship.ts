import { Router } from "express";
import { getScholarships } from "../controllers/scholarshipController";

const router = Router();
router.get("/", getScholarships);

export default router;
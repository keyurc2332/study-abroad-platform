import { Router } from "express";
import { getUniversities, getUniversityById } from "../controllers/universityController";

const router = Router();

router.get("/", getUniversities);
router.get("/:id", getUniversityById);

export default router;
import { Router } from "express";
import { createProfile, getProfile, updateProfile } from "../controllers/profileController";

const router = Router();

router.post("/", createProfile);
router.get("/", getProfile);
router.put("/", updateProfile);

export default router;
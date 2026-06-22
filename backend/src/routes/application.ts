import { Router } from "express";
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from "../controllers/applicationController";

const router = Router();
router.get("/", getApplications);
router.post("/", createApplication);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);

export default router;
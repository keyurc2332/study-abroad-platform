import { Router } from "express";
import { applyForLoan, getLoanStatus } from "../controllers/loanController";

const router = Router();

// Apply for loan
router.post("/apply", applyForLoan);

// Check application status
router.get("/status", getLoanStatus);

export default router;
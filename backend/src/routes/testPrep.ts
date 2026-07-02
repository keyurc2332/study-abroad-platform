import { Router } from "express";
import {
  getExams,
  getRoadmap,
  getQuestions,
  getQuestionById,
} from "../controllers/testPrepController";

const router = Router();

// List all exams
router.get("/exams", getExams);

// Get roadmap/topics for specific exam
router.get("/roadmap/:exam", getRoadmap);

// Get practice questions
router.get("/questions/:exam", getQuestions);

// Get specific question
router.get("/questions/:exam/:questionId", getQuestionById);

export default router;
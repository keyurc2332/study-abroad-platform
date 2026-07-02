import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "test-prep");

const EXAM_NAMES = ["SAT", "GRE", "IELTS", "GMAT"];

// Load JSON files
function loadExamData(examName: string, isSets: boolean = false) {
  try {
    const fileName = isSets ? `${examName.toLowerCase()}_sets.json` : `${examName}.json`;
    const filePath = path.join(DATA_DIR, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`[TestPrep] File not found: ${filePath}`);
      return isSets ? [] : { nodes: [] };
    }

    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`[TestPrep] Error loading ${examName}:`, error);
    return isSets ? [] : { nodes: [] };
  }
}

// Get all available exams
export const getExams = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      exams: EXAM_NAMES,
      message: "Available exams for test preparation",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
};

// Get roadmap/topics for an exam
export const getRoadmap = async (req: Request, res: Response) => {
  try {
    const { exam } = req.params;
    const examUpper = String(exam).toUpperCase();

    if (!EXAM_NAMES.includes(examUpper)) {
      res.status(404).json({
        success: false,
        message: `Exam ${exam} not found. Available: ${EXAM_NAMES.join(", ")}`,
      });
      return;
    }

    console.log(`[TestPrep] Loading roadmap for ${examUpper}`);
    const data = loadExamData(examUpper);

    // Get unique subjects from nodes
    const subjects = new Set<string>();
    const chapters = new Map<string, Set<string>>();
    const topics = new Map<string, Set<string>>();

    if (data.nodes && Array.isArray(data.nodes)) {
      data.nodes.forEach((node: any) => {
        if (node.subject) subjects.add(node.subject);
        if (node.chapter) {
          if (!chapters.has(node.subject)) chapters.set(node.subject, new Set());
          chapters.get(node.subject)!.add(node.chapter);
        }
        if (node.topic) {
          const key = `${node.subject}_${node.chapter}`;
          if (!topics.has(key)) topics.set(key, new Set());
          topics.get(key)!.add(node.topic);
        }
      });
    }

    res.json({
      success: true,
      exam: examUpper,
      totalTopics: data.nodes ? data.nodes.length : 0,
      subjects: Array.from(subjects),
      roadmap: data.nodes || [],
      summary: {
        bySubject: data.nodes?.length || 0,
        structure: "subject > chapter > topic > subtopic",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
};

// Get practice questions for an exam
export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { exam } = req.params;
    const { topic, limit = "20", skip = "0" } = req.query;

    const examUpper = String(exam).toUpperCase();

    if (!EXAM_NAMES.includes(examUpper)) {
      res.status(404).json({
        success: false,
        message: `Exam ${exam} not found. Available: ${EXAM_NAMES.join(", ")}`,
      });
      return;
    }

    console.log(`[TestPrep] Loading questions for ${examUpper}`);
    const allQuestions = loadExamData(examUpper, true);

    let filtered = allQuestions;

    // Filter by topic if provided
    if (topic) {
      filtered = allQuestions.filter((q: any) => 
        q.topic && q.topic.toLowerCase().includes(String(topic).toLowerCase())
      );
      console.log(`[TestPrep] Filtered to ${filtered.length} questions for topic: ${topic}`);
    }

    // Paginate
    const skipNum = parseInt(String(skip)) || 0;
    const limitNum = Math.min(parseInt(String(limit)) || 20, 100); // Max 100
    const paginated = filtered.slice(skipNum, skipNum + limitNum);

    res.json({
      success: true,
      exam: examUpper,
      topic: topic || "All",
      totalAvailable: filtered.length,
      returned: paginated.length,
      pagination: {
        skip: skipNum,
        limit: limitNum,
        hasMore: skipNum + limitNum < filtered.length,
      },
      questions: paginated,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
};

// Get specific question by ID
export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const { exam, questionId } = req.params;
    const examUpper = String(exam).toUpperCase();

    if (!EXAM_NAMES.includes(examUpper)) {
      res.status(404).json({
        success: false,
        message: `Exam ${exam} not found`,
      });
      return;
    }

    const allQuestions = loadExamData(examUpper, true);
    const question = allQuestions.find((q: any) => q.slotId === questionId);

    if (!question) {
      res.status(404).json({
        success: false,
        message: `Question ${questionId} not found`,
      });
      return;
    }

    res.json({
      success: true,
      exam: examUpper,
      question,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
};

export default {
  getExams,
  getRoadmap,
  getQuestions,
  getQuestionById,
};
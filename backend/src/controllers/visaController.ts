import { Request, Response } from "express";
import { spawn } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface VisaSessionData {
  email: string;
  interviewType: string;
  messages: ChatMessage[];
}

// Generate unique session ID
function generateSessionId(): string {
  return `VISA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Call Vertex AI for visa interview
async function callVertexAIForVisa(
  sessionData: VisaSessionData,
  userMessage: string
): Promise<any> {
  return new Promise((resolve) => {
    try {
      const inputFile = path.join(os.tmpdir(), `visa_input_${Date.now()}.json`);
      const outputFile = path.join(os.tmpdir(), `visa_output_${Date.now()}.json`);

      const payload = {
        email: sessionData.email,
        interviewType: sessionData.interviewType,
        conversationHistory: sessionData.messages,
        userMessage: userMessage,
      };

      fs.writeFileSync(inputFile, JSON.stringify(payload), "utf-8");

      const scriptPath = path.join(process.cwd(), "visa_interview.py");
      if (!fs.existsSync(scriptPath)) {
        console.log("[Visa] Script not found at", scriptPath);
        resolve(null);
        return;
      }

      const pythonCmd = process.platform === "win32" ? "python" : "python3";

      const py = spawn(pythonCmd, [scriptPath, inputFile, outputFile], {
        env: { ...process.env },
      });

      let hasError = false;
      py.stderr.on("data", (d: Buffer) => {
        const msg = d.toString().trim();
        console.log("[Visa AI]", msg);
        if (msg.includes("Error") || msg.includes("error")) {
          hasError = true;
        }
      });

      py.on("close", (code: number) => {
        try {
          if (code === 0 && fs.existsSync(outputFile)) {
            const raw = fs.readFileSync(outputFile, "utf-8");
            const result = JSON.parse(raw);
            fs.unlinkSync(inputFile);
            fs.unlinkSync(outputFile);
            resolve(result);
          } else {
            resolve(null);
          }
        } catch (e) {
          console.error("[Visa] Parse error:", e);
          resolve(null);
        }
      });

      py.on("error", (err) => {
        console.error("[Visa] Process error:", err);
        resolve(null);
      });

      // Timeout after 60s
      setTimeout(() => {
        console.log("[Visa] Timeout");
        py.kill();
        resolve(null);
      }, 60000);
    } catch (e) {
      console.error("[Visa] Exception:", e);
      resolve(null);
    }
  });
}

// Start new visa interview session
export const startInterview = async (req: Request, res: Response) => {
  try {
    const { email, interviewType = "USA" } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email required",
      });
      return;
    }

    const validTypes = ["USA", "UK", "Canada", "Germany", "Australia"];
    if (!validTypes.includes(interviewType)) {
      res.status(400).json({
        success: false,
        message: `Invalid interview type. Choose from: ${validTypes.join(", ")}`,
      });
      return;
    }

    console.log(`[Visa] Starting ${interviewType} interview for ${email}`);

    const sessionId = generateSessionId();

    // Create interview session
    const interview = await prisma.visaInterview.create({
      data: {
        email,
        interviewType,
        sessionId,
      },
    });

    // Initial greeting message
    const greetingMessage = await prisma.visaMessage.create({
      data: {
        interviewId: interview.id,
        role: "assistant",
        content: `Welcome to the ${interviewType} Visa Interview Preparation! 🎯

I'm your AI interview coach. I'll be asking you typical visa interview questions to help you prepare.

Let's start with some background questions. Take your time and answer thoughtfully.

Ready? Let's begin!`,
      },
    });

    res.json({
      success: true,
      sessionId: interview.id,
      interviewType,
      message: greetingMessage.content,
      nextStep: "Send your first message to start the interview",
    });
  } catch (error) {
    console.error("[Visa] Error:", error);
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
};

// Send message and get AI response
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      res.status(400).json({
        success: false,
        message: "sessionId and message required",
      });
      return;
    }

    console.log(`[Visa] Processing message for session ${sessionId}`);

    // Get interview session
    const interview = await prisma.visaInterview.findUnique({
      where: { id: String(sessionId) },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!interview) {
      res.status(404).json({
        success: false,
        message: "Interview session not found",
      });
      return;
    }

    if (interview.status !== "in_progress") {
      res.status(400).json({
        success: false,
        message: `Interview is ${interview.status}`,
      });
      return;
    }

    // Save user message
    await prisma.visaMessage.create({
      data: {
        interviewId: interview.id,
        role: "user",
        content: message,
      },
    });

    // Build conversation history
    const conversationHistory: ChatMessage[] = interview.messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));
    conversationHistory.push({
      role: "user",
      content: message,
    });

    // Call Vertex AI
    const sessionData: VisaSessionData = {
      email: interview.email,
      interviewType: interview.interviewType,
      messages: conversationHistory,
    };

    const aiResponse = await callVertexAIForVisa(sessionData, message);

    let assistantMessage = null;
    let answerEvaluation = null;

    if (aiResponse && aiResponse.response) {
      // Save assistant response
      assistantMessage = await prisma.visaMessage.create({
        data: {
          interviewId: interview.id,
          role: "assistant",
          content: aiResponse.response,
          questionNumber: aiResponse.questionNumber,
          difficulty: aiResponse.difficulty,
          category: aiResponse.category,
        },
      });

      // Save answer evaluation
      const userMessageRecord = await prisma.visaMessage.findFirst({
        where: {
          interviewId: interview.id,
          role: "user",
          content: message,
        },
      });

      if (userMessageRecord && aiResponse.evaluation) {
        await prisma.visaMessage.update({
          where: { id: userMessageRecord.id },
          data: {
            evaluation: aiResponse.evaluation.grade,
            feedback: aiResponse.evaluation.feedback,
            score: aiResponse.evaluation.score,
            suggestions: aiResponse.evaluation.suggestions,
          },
        });

        answerEvaluation = aiResponse.evaluation;
      }

      // Update interview scores
      const scoreMap: Record<string, number> = {
        Excellent: 1,
        Good: 0.75,
        Partial: 0.5,
        Weak: 0.25,
      };

      const scoreIncrement = scoreMap[aiResponse.evaluation.grade] || 0;
      if (scoreIncrement > 0) {
        await prisma.visaInterview.update({
          where: { id: interview.id },
          data: {
            totalQuestions: interview.totalQuestions + 1,
            correctAnswers:
              interview.correctAnswers + (scoreIncrement === 1 ? 1 : 0),
            partialAnswers:
              interview.partialAnswers + (scoreIncrement === 0.5 ? 1 : 0),
            incorrectAnswers:
              interview.incorrectAnswers + (scoreIncrement <= 0.25 ? 1 : 0),
          },
        });
      }
    } else {
      // Fallback response if AI fails
      const fallbackResponses = [
        "That's a great point! Can you tell me more about your experience with international travel and visa processes?",
        "I see. How does your academic background relate to your chosen field of study?",
        "Interesting! What are your long-term career goals after completing your studies?",
        "Thank you for sharing. How do you plan to finance your education and living expenses?",
        "Good perspective. What do you know about the visa requirements for your destination country?",
      ];

      const randomResponse =
        fallbackResponses[
          Math.floor(Math.random() * fallbackResponses.length)
        ];

      assistantMessage = await prisma.visaMessage.create({
        data: {
          interviewId: interview.id,
          role: "assistant",
          content: randomResponse,
        },
      });
    }

    res.json({
      success: true,
      sessionId: interview.id,
      assistantMessage: assistantMessage?.content,
      evaluation: answerEvaluation,
      totalQuestionsAsked: interview.totalQuestions + 1,
    });
  } catch (error) {
    console.error("[Visa] Error:", error);
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
};

// Get interview history
export const getInterview = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const interview = await prisma.visaInterview.findUnique({
      where: { id: String(sessionId) },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!interview) {
      res.status(404).json({
        success: false,
        message: "Interview not found",
      });
      return;
    }

    // Calculate overall score
    const totalQuestions = interview.totalQuestions || 1;
    const correctAnswers = interview.correctAnswers || 0;
    const partialAnswers = interview.partialAnswers || 0;
    const overallScore =
      ((correctAnswers * 1 + partialAnswers * 0.5) / totalQuestions) * 100;

    res.json({
      success: true,
      interview: {
        id: interview.id,
        email: interview.email,
        interviewType: interview.interviewType,
        status: interview.status,
        totalQuestions: interview.totalQuestions,
        correctAnswers: interview.correctAnswers,
        partialAnswers: interview.partialAnswers,
        incorrectAnswers: interview.incorrectAnswers,
        overallScore: overallScore.toFixed(2),
        createdAt: interview.createdAt,
        completedAt: interview.completedAt,
      },
      messages: interview.messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
};

// End interview and get summary
export const endInterview = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;

    const interview = await prisma.visaInterview.findUnique({
      where: { id: String(sessionId) },
      include: {
        messages: true,
      },
    });

    if (!interview) {
      res.status(404).json({
        success: false,
        message: "Interview not found",
      });
      return;
    }

    // Calculate final score
    const totalQuestions = Math.max(interview.totalQuestions, 1);
    const correctAnswers = interview.correctAnswers || 0;
    const partialAnswers = interview.partialAnswers || 0;
    const overallScore = Math.round(
      ((correctAnswers * 1 + partialAnswers * 0.5) / totalQuestions) * 100
    );

    // Generate feedback summary
    let summary = "";
    if (overallScore >= 80) {
      summary =
        "Excellent! You're well-prepared for your visa interview. Keep practicing and you'll do great!";
    } else if (overallScore >= 60) {
      summary =
        "Good effort! You have a solid understanding. Focus on the areas marked as weak for improvement.";
    } else {
      summary =
        "You need more practice. Review the feedback provided and try again to improve your score.";
    }

    // Update interview
    const updated = await prisma.visaInterview.update({
      where: { id: String(sessionId) },
      data: {
        status: "completed",
        completedAt: new Date(),
        overallScore: overallScore,
        strengths: "Demonstrated good communication skills",
        weaknesses: "Need to improve on specific country knowledge",
        recommendations: summary,
      },
    });

    res.json({
      success: true,
      summary: {
        interviewType: updated.interviewType,
        totalQuestions: updated.totalQuestions,
        correctAnswers: updated.correctAnswers,
        partialAnswers: updated.partialAnswers,
        incorrectAnswers: updated.incorrectAnswers,
        overallScore: updated.overallScore,
        feedback: updated.recommendations,
        status: "completed",
        completedAt: updated.completedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
};

export default {
  startInterview,
  sendMessage,
  getInterview,
  endInterview,
};
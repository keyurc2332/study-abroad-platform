// File: src/controllers/resumeController.ts
// FIXED VERSION - Replace your entire resumeController.ts with this

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ==========================================
// TYPE DEFINITIONS
// ==========================================

interface ResumeData {
  email: string;
  fullName: string;
  phone: string;
  linkedin?: string;
  github?: string;
  summary: string;
  education: Array<{
    institution: string;
    degree: string;
    dates: string;
    description?: string;
  }>;
  experience: Array<{
    role: string;
    company: string;
    dates: string;
    description?: string;
  }>;
  achievements: string[];
  extracurriculars: string[];
  skills: string[];
  languages: string[];
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Generate a professional resume text using Gemini AI
 */
async function generateResumeWithAI(data: ResumeData): Promise<{
  resumeText: string;
  optimizedSummary: string;
  suggestions: string[];
  aiOptimizedExperience: Array<{ original: string; optimized: string }>;
}> {
  try {
    // Prepare the data for Gemini
    const experienceText = data.experience
      .map(
        (exp) =>
          `- ${exp.role} at ${exp.company} (${exp.dates}): ${exp.description || "No description provided"}`
      )
      .join("\n");

    const educationText = data.education
      .map(
        (edu) =>
          `- ${edu.degree} from ${edu.institution} (${edu.dates}): ${edu.description || ""}`
      )
      .join("\n");

    const skillsText = data.skills.join(", ");
    const languagesText = data.languages.join(", ");
    const achievementsText = data.achievements
      .map((a) => `- ${a}`)
      .join("\n");
    const extracurricularsText = data.extracurriculars
      .map((e) => `- ${e}`)
      .join("\n");

    // Prompt for Gemini to generate professional resume
    const prompt = `
You are a professional resume writer for international students applying to study abroad programs.

Given the following information, please:
1. Generate a well-formatted, professional resume in plain text format
2. Provide an optimized professional summary (2-3 sentences)
3. List specific suggestions for improvement
4. Optimize each experience bullet point with action verbs and impact metrics

STUDENT INFORMATION:
Name: ${data.fullName}
Email: ${data.email}
Phone: ${data.phone}
LinkedIn: ${data.linkedin || "Not provided"}
GitHub: ${data.github || "Not provided"}

PROFESSIONAL SUMMARY:
${data.summary}

EDUCATION:
${educationText}

EXPERIENCE:
${experienceText}

SKILLS:
${skillsText}

LANGUAGES:
${languagesText}

ACHIEVEMENTS:
${achievementsText}

EXTRACURRICULARS:
${extracurricularsText}

Please provide your response in the following JSON format:
{
  "resumeText": "Full professional resume in plain text format with clear sections",
  "optimizedSummary": "Professional summary (2-3 sentences)",
  "suggestions": [
    "Suggestion 1 for improvement",
    "Suggestion 2 for improvement",
    "Suggestion 3 for improvement"
  ],
  "optimizedExperience": [
    {
      "original": "Original bullet point",
      "optimized": "Improved bullet point with action verbs"
    }
  ]
}

Make sure the resume is tailored for international student applications and emphasizes:
- Academic excellence
- Research and project experience
- Technical skills and programming languages
- International exposure and cultural awareness
- Leadership and extracurricular activities
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse Gemini response");
    }

    const aiResponse = JSON.parse(jsonMatch[0]);

    return {
      resumeText: aiResponse.resumeText || "",
      optimizedSummary: aiResponse.optimizedSummary || data.summary,
      suggestions: aiResponse.suggestions || [],
      aiOptimizedExperience: aiResponse.optimizedExperience || [],
    };
  } catch (error) {
    console.error("Error generating resume with AI:", error);
    // Fallback to basic resume generation without AI
    return {
      resumeText: buildBasicResume(data),
      optimizedSummary: data.summary,
      suggestions: ["Consider adding more action verbs to your experience bullets"],
      aiOptimizedExperience: [],
    };
  }
}

/**
 * Build a basic resume if AI fails
 */
function buildBasicResume(data: ResumeData): string {
  const lines: string[] = [];

  lines.push(`${data.fullName.toUpperCase()}`);
  lines.push(
    `${data.email} | ${data.phone}${data.linkedin ? " | " + data.linkedin : ""}${data.github ? " | " + data.github : ""}`
  );
  lines.push("");

  if (data.summary.trim()) {
    lines.push("PROFESSIONAL SUMMARY");
    lines.push(data.summary);
    lines.push("");
  }

  if (data.education.length > 0) {
    lines.push("EDUCATION");
    data.education.forEach((edu) => {
      lines.push(`${edu.institution}`);
      lines.push(`${edu.degree} | ${edu.dates}`);
      if (edu.description) {
        lines.push(edu.description);
      }
      lines.push("");
    });
  }

  if (data.experience.length > 0) {
    lines.push("EXPERIENCE");
    data.experience.forEach((exp) => {
      lines.push(`${exp.role}`);
      lines.push(`${exp.company} | ${exp.dates}`);
      if (exp.description) {
        lines.push(exp.description);
      }
      lines.push("");
    });
  }

  if (data.skills.length > 0) {
    lines.push("SKILLS");
    lines.push(data.skills.join(" • "));
    lines.push("");
  }

  if (data.languages.length > 0) {
    lines.push("LANGUAGES");
    lines.push(data.languages.join(", "));
    lines.push("");
  }

  if (data.achievements.length > 0) {
    lines.push("ACHIEVEMENTS");
    data.achievements.forEach((a) => {
      lines.push(`• ${a}`);
    });
    lines.push("");
  }

  if (data.extracurriculars.length > 0) {
    lines.push("EXTRACURRICULARS");
    data.extracurriculars.forEach((e) => {
      lines.push(`• ${e}`);
    });
  }

  return lines.join("\n");
}

/**
 * Get improvement suggestions using Gemini
 */
async function getResumeSuggestions(data: ResumeData): Promise<string[]> {
  try {
    const prompt = `
As a professional resume reviewer, analyze this resume and provide 5 specific, actionable suggestions for improvement for someone applying to study abroad programs:

Name: ${data.fullName}
Summary: ${data.summary}
Experience: ${data.experience.map((e) => e.description).join("; ")}
Skills: ${data.skills.join(", ")}

Provide suggestions that focus on:
1. International student applications
2. Academic and research experience
3. Technical skills demonstration
4. Global perspective and cultural awareness

Return ONLY a JSON array like: ["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"]
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const arrayMatch = responseText.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]);
    }

    return [
      "Add quantifiable results to your experience",
      "Include international projects or experiences",
      "Highlight research and academic achievements",
      "Demonstrate technical skills with specific tools/languages",
      "Show leadership through extracurricular activities",
    ];
  } catch (error) {
    console.error("Error getting suggestions:", error);
    return [
      "Add more details to your experience",
      "Include metrics and achievements",
      "Highlight relevant skills",
    ];
  }
}

// ==========================================
// ROUTE HANDLERS
// ==========================================

/**
 * POST /api/v1/resume/save
 * Save resume data (without generation)
 */
export async function saveResume(req: Request, res: Response) {
  try {
    const { email, ...resumeData }: { email: string } & Partial<ResumeData> = req.body;

    if (!email || !resumeData.fullName) {
      return res.status(400).json({
        success: false,
        error: "Email and fullName are required",
      });
    }

    // Upsert resume
    const resume = await prisma.resumeBuilder.upsert({
      where: { email },
      create: {
        email,
        fullName: resumeData.fullName || "",
        phoneNumber: resumeData.phone,
        linkedinUrl: resumeData.linkedin,
        githubUrl: resumeData.github,
        professionalSummary: resumeData.summary,

        educations: {
          create: (resumeData.education || []).map((edu) => ({
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.degree,
            dates: edu.dates,
            description: edu.description,
          })),
        },

        experiences: {
          create: (resumeData.experience || []).map((exp) => ({
            jobTitle: exp.role,
            company: exp.company,
            dates: exp.dates,
            description: exp.description || "",
          })),
        },

        skills: {
          create: (resumeData.skills || []).map((skill) => ({
            name: skill,
          })),
        },

        languages: {
          create: (resumeData.languages || []).map((lang) => ({
            name: lang,
          })),
        },

        achievements: {
          create: (resumeData.achievements || []).map((ach) => ({
            title: ach,
          })),
        },

        extracurriculars: {
          create: (resumeData.extracurriculars || []).map((extra) => ({
            title: extra,
          })),
        },
      },

      update: {
        fullName: resumeData.fullName || "",
        phoneNumber: resumeData.phone,
        linkedinUrl: resumeData.linkedin,
        githubUrl: resumeData.github,
        professionalSummary: resumeData.summary,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: "Resume saved successfully",
      resumeId: resume.id,
      email: resume.email,
    });
  } catch (error) {
    console.error("Error saving resume:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save resume",
    });
  }
}

/**
 * POST /api/v1/resume/generate
 * Generate AI-powered resume
 */
export async function generateResume(req: Request, res: Response) {
  try {
    const { email, ...resumeData }: { email: string } & Partial<ResumeData> = req.body;

    if (!email || !resumeData.fullName) {
      return res.status(400).json({
        success: false,
        error: "Email and fullName are required",
      });
    }

    // Ensure all required fields are present for AI
    const fullResumeData: ResumeData = {
      email,
      fullName: resumeData.fullName || "",
      phone: resumeData.phone || "",
      linkedin: resumeData.linkedin,
      github: resumeData.github,
      summary: resumeData.summary || "",
      education: resumeData.education || [],
      experience: resumeData.experience || [],
      skills: resumeData.skills || [],
      languages: resumeData.languages || [],
      achievements: resumeData.achievements || [],
      extracurriculars: resumeData.extracurriculars || [],
    };

    // Generate with AI
    const {
      resumeText,
      optimizedSummary,
      suggestions,
      aiOptimizedExperience,
    } = await generateResumeWithAI(fullResumeData);

    // Save to database
    const resume = await prisma.resumeBuilder.upsert({
      where: { email: String(email) },
      create: {
        email,
        fullName: resumeData.fullName || "",
        phoneNumber: resumeData.phone,
        linkedinUrl: resumeData.linkedin,
        githubUrl: resumeData.github,
        professionalSummary: resumeData.summary,
        optimizedSummary,
        resumeText,
        resumeJson: JSON.stringify(resumeData),
        aiSuggestions: JSON.stringify(suggestions),
        lastGeneratedAt: new Date(),

        educations: {
          create: (resumeData.education || []).map((edu) => ({
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.degree,
            dates: edu.dates,
            description: edu.description,
          })),
        },

        experiences: {
          create: (resumeData.experience || []).map((exp) => ({
            jobTitle: exp.role,
            company: exp.company,
            dates: exp.dates,
            description: exp.description || "",
            aiOptimized: aiOptimizedExperience.find(
              (opt) => opt.original === exp.description
            )?.optimized,
          })),
        },

        skills: {
          create: (resumeData.skills || []).map((skill) => ({
            name: skill,
          })),
        },

        languages: {
          create: (resumeData.languages || []).map((lang) => ({
            name: lang,
          })),
        },

        achievements: {
          create: (resumeData.achievements || []).map((ach) => ({
            title: ach,
          })),
        },

        extracurriculars: {
          create: (resumeData.extracurriculars || []).map((extra) => ({
            title: extra,
          })),
        },
      },

      update: {
        fullName: resumeData.fullName || "",
        phoneNumber: resumeData.phone,
        linkedinUrl: resumeData.linkedin,
        githubUrl: resumeData.github,
        professionalSummary: resumeData.summary,
        optimizedSummary,
        resumeText,
        resumeJson: JSON.stringify(resumeData),
        aiSuggestions: JSON.stringify(suggestions),
        lastGeneratedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: "Resume generated with AI enhancements",
      resumeId: resume.id,
      resumeText,
      optimizedSummary,
      suggestions,
      aiOptimizedExperience,
    });
  } catch (error) {
    console.error("Error generating resume:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate resume",
    });
  }
}

/**
 * GET /api/v1/resume/:email
 * Get saved resume
 */
export async function getResume(req: Request, res: Response) {
  try {
    const { email } = req.params;

    const resume = await prisma.resumeBuilder.findUnique({
      where: { email: String(email) },
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: "Resume not found",
      });
    }

    res.json({
      success: true,
      resume: {
        id: resume.id,
        email: resume.email,
        fullName: resume.fullName,
        phone: resume.phoneNumber,
        linkedin: resume.linkedinUrl,
        github: resume.githubUrl,
        summary: resume.professionalSummary,
        optimizedSummary: resume.optimizedSummary,
        resumeText: resume.resumeText,
        suggestions: resume.aiSuggestions
          ? JSON.parse(resume.aiSuggestions)
          : [],
        lastGeneratedAt: resume.lastGeneratedAt,
      },
    });
  } catch (error) {
    console.error("Error getting resume:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get resume",
    });
  }
}

/**
 * POST /api/v1/resume/suggestions
 * Get AI suggestions for resume improvement
 */
export async function getResumeSuggestionsHandler(
  req: Request,
  res: Response
) {
  try {
    const { email, ...resumeData }: { email: string } & Partial<ResumeData> = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    // Ensure all required fields are present
    const fullResumeData: ResumeData = {
      email,
      fullName: resumeData.fullName || "",
      phone: resumeData.phone || "",
      linkedin: resumeData.linkedin,
      github: resumeData.github,
      summary: resumeData.summary || "",
      education: resumeData.education || [],
      experience: resumeData.experience || [],
      skills: resumeData.skills || [],
      languages: resumeData.languages || [],
      achievements: resumeData.achievements || [],
      extracurriculars: resumeData.extracurriculars || [],
    };

    const suggestions = await getResumeSuggestions(fullResumeData);

    res.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("Error getting suggestions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get suggestions",
    });
  }
}

/**
 * DELETE /api/v1/resume/:email
 * Delete resume
 */
export async function deleteResume(req: Request, res: Response) {
  try {
    const { email } = req.params;

    await prisma.resumeBuilder.delete({
      where: { email: String(email) },
    });

    res.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting resume:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete resume",
    });
  }
}
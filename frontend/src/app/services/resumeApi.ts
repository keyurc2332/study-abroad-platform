// File: src/app/services/resumeApi.ts
// ADD THIS FILE to your frontend

/**
 * Resume API Client
 * Handles all resume generation and management API calls
 */

const BASE_URL = "/api/v1";

// ==========================================
// TYPES
// ==========================================

export interface ResumeData {
  fullName: string;
  email: string;
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

export interface GeneratedResume {
  resumeText: string;
  optimizedSummary: string;
  suggestions: string[];
  aiOptimizedExperience: Array<{ original: string; optimized: string }>;
  bulletPointTips?: string[];
  formatTips?: string[];
}

export interface ResumeSuggestions {
  overallFeedback: string;
  suggestions: string[];
  strengths: string[];
  areasForImprovement: string[];
}

export interface StudyAbroadTips {
  internationalFocus: string[];
  academicHighlights: string[];
  technicalSkills: string[];
  leadershipPoints: string[];
}

// ==========================================
// API FUNCTIONS
// ==========================================

/**
 * Save resume without AI generation
 * Useful for saving drafts frequently
 */
export async function saveResume(
  resumeData: ResumeData
): Promise<{ success: boolean; resumeId: string }> {
  const response = await fetch(`${BASE_URL}/resume/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resumeData),
  });

  if (!response.ok) {
    throw new Error(`Failed to save resume: ${response.status}`);
  }

  return response.json();
}

/**
 * Generate AI-powered professional resume
 * This uses Gemini to create optimized resume content
 */
export async function generateResume(
  resumeData: ResumeData
): Promise<{
  success: boolean;
  resumeText: string;
  optimizedSummary: string;
  suggestions: string[];
  aiOptimizedExperience: Array<{ original: string; optimized: string }>;
  bulletPointTips?: string[];
  formatTips?: string[];
}> {
  console.log("🚀 Generating resume with AI...");

  const response = await fetch(`${BASE_URL}/resume/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resumeData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to generate resume: ${response.status}`);
  }

  const result = await response.json();
  console.log("✅ Resume generated successfully!");
  return result;
}

/**
 * Fetch saved resume by email
 */
export async function fetchResume(email: string): Promise<{
  success: boolean;
  resume: ResumeData & {
    id: string;
    optimizedSummary?: string;
    resumeText?: string;
    suggestions?: string[];
    lastGeneratedAt?: string;
  };
}> {
  const response = await fetch(`${BASE_URL}/resume/${encodeURIComponent(email)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch resume: ${response.status}`);
  }

  return response.json();
}

/**
 * Get AI suggestions for resume improvement
 */
export async function getResumeSuggestions(
  resumeData: ResumeData
): Promise<ResumeSuggestions> {
  const response = await fetch(`${BASE_URL}/resume/suggestions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resumeData),
  });

  if (!response.ok) {
    throw new Error(`Failed to get suggestions: ${response.status}`);
  }

  const result = await response.json();
  return result.suggestions;
}

/**
 * Delete resume by email
 */
export async function deleteResume(email: string): Promise<{ success: boolean }> {
  const response = await fetch(`${BASE_URL}/resume/${encodeURIComponent(email)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete resume: ${response.status}`);
  }

  return response.json();
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Format resume data for API
 */
export function formatResumeForAPI(data: any): ResumeData {
  return {
    fullName: data.fullName || "",
    email: data.email || "",
    phone: data.phone || "",
    linkedin: data.linkedin || "",
    github: data.github || "",
    summary: data.summary || "",
    education: (data.education || []).map((edu: any) => ({
      institution: edu.institution || "",
      degree: edu.degree || "",
      dates: edu.dates || "",
      description: edu.description || "",
    })),
    experience: (data.experience || []).map((exp: any) => ({
      role: exp.role || "",
      company: exp.company || "",
      dates: exp.dates || "",
      description: exp.description || "",
    })),
    achievements: Array.isArray(data.achievements)
      ? data.achievements.filter((a: string) => a.trim())
      : [],
    extracurriculars: Array.isArray(data.extracurriculars)
      ? data.extracurriculars.filter((e: string) => e.trim())
      : [],
    skills: Array.isArray(data.skills)
      ? data.skills.filter((s: string) => s.trim())
      : [],
    languages: Array.isArray(data.languages)
      ? data.languages.filter((l: string) => l.trim())
      : [],
  };
}

/**
 * Convert API response to file download (text)
 */
export function downloadResumeAsText(resumeText: string, filename = "resume.txt") {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(resumeText)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Convert API response to markdown
 */
export function resumeToMarkdown(resumeData: ResumeData): string {
  const lines: string[] = [];

  lines.push(`# ${resumeData.fullName}`);
  lines.push(
    `${resumeData.email} | ${resumeData.phone}${
      resumeData.linkedin ? " | [LinkedIn](" + resumeData.linkedin + ")" : ""
    }${resumeData.github ? " | [GitHub](" + resumeData.github + ")" : ""}`
  );
  lines.push("");

  if (resumeData.summary?.trim()) {
    lines.push("## Professional Summary");
    lines.push(resumeData.summary);
    lines.push("");
  }

  if (resumeData.education.length > 0) {
    lines.push("## Education");
    resumeData.education.forEach((edu) => {
      lines.push(`- **${edu.degree}** from ${edu.institution} (${edu.dates})`);
      if (edu.description) {
        lines.push(`  ${edu.description}`);
      }
    });
    lines.push("");
  }

  if (resumeData.experience.length > 0) {
    lines.push("## Experience");
    resumeData.experience.forEach((exp) => {
      lines.push(`- **${exp.role}** at ${exp.company} (${exp.dates})`);
      if (exp.description) {
        lines.push(`  ${exp.description}`);
      }
    });
    lines.push("");
  }

  if (resumeData.skills.length > 0) {
    lines.push("## Skills");
    lines.push(resumeData.skills.join(", "));
    lines.push("");
  }

  if (resumeData.languages.length > 0) {
    lines.push("## Languages");
    lines.push(resumeData.languages.join(", "));
    lines.push("");
  }

  if (resumeData.achievements.length > 0) {
    lines.push("## Achievements");
    resumeData.achievements.forEach((a) => {
      lines.push(`- ${a}`);
    });
    lines.push("");
  }

  if (resumeData.extracurriculars.length > 0) {
    lines.push("## Extracurriculars");
    resumeData.extracurriculars.forEach((e) => {
      lines.push(`- ${e}`);
    });
  }

  return lines.join("\n");
}
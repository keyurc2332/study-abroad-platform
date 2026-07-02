// File: src/services/resumeService.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

interface ResumeData {
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

interface GeneratedResume {
  resumeText: string;
  optimizedSummary: string;
  suggestions: string[];
  aiOptimizedExperience: Array<{ original: string; optimized: string }>;
  bulletPointTips: string[];
  formatTips: string[];
}

class ResumeService {
  private model: any;

  constructor() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  /**
   * Format date ranges (handle various input formats)
   */
  private formatDateRange(dateStr: string): string {
    if (!dateStr) return "Present";
    
    // If already in format "2020 - 2022", return as is
    if (dateStr.includes("-")) return dateStr;
    
    // Convert single year to range
    if (dateStr.length === 4) return `${dateStr} - Present`;
    
    return dateStr;
  }

  /**
   * Build a formatted resume string from data
   */
  private buildFormattedResumeString(data: ResumeData): string {
    const lines: string[] = [];

    // Header
    lines.push(`${data.fullName.toUpperCase()}`);
    lines.push(
      `${data.email} | ${data.phone}${data.linkedin ? " | LinkedIn: " + data.linkedin : ""}${data.github ? " | GitHub: " + data.github : ""}`
    );
    lines.push("");

    // Summary
    if (data.summary?.trim()) {
      lines.push("PROFESSIONAL SUMMARY");
      lines.push(data.summary.trim());
      lines.push("");
    }

    // Education
    if (data.education.length > 0) {
      lines.push("EDUCATION");
      data.education.forEach((edu) => {
        if (edu.institution || edu.degree) {
          lines.push(`${edu.institution}`);
          lines.push(`${edu.degree} | ${this.formatDateRange(edu.dates)}`);
          if (edu.description?.trim()) {
            lines.push(`  ${edu.description.trim()}`);
          }
          lines.push("");
        }
      });
    }

    // Experience
    if (data.experience.length > 0) {
      lines.push("EXPERIENCE");
      data.experience.forEach((exp) => {
        if (exp.role || exp.company) {
          lines.push(`${exp.role}`);
          lines.push(
            `${exp.company} | ${this.formatDateRange(exp.dates)}`
          );
          if (exp.description?.trim()) {
            const bullets = exp.description
              .split("\n")
              .filter((b) => b.trim());
            if (bullets.length > 1) {
              bullets.forEach((b) => lines.push(`  ${b.trim()}`));
            } else {
              lines.push(`  ${exp.description.trim()}`);
            }
          }
          lines.push("");
        }
      });
    }

    // Skills
    if (data.skills.length > 0) {
      const cleanSkills = data.skills.filter((s) => s.trim());
      if (cleanSkills.length > 0) {
        lines.push("SKILLS");
        lines.push(cleanSkills.join(" • "));
        lines.push("");
      }
    }

    // Languages
    if (data.languages.length > 0) {
      const cleanLanguages = data.languages.filter((l) => l.trim());
      if (cleanLanguages.length > 0) {
        lines.push("LANGUAGES");
        lines.push(cleanLanguages.join(", "));
        lines.push("");
      }
    }

    // Achievements
    if (data.achievements.length > 0) {
      const cleanAchievements = data.achievements.filter((a) => a.trim());
      if (cleanAchievements.length > 0) {
        lines.push("ACHIEVEMENTS");
        cleanAchievements.forEach((a) => {
          lines.push(`  • ${a.trim()}`);
        });
        lines.push("");
      }
    }

    // Extracurriculars
    if (data.extracurriculars.length > 0) {
      const cleanExtra = data.extracurriculars.filter((e) => e.trim());
      if (cleanExtra.length > 0) {
        lines.push("EXTRACURRICULARS");
        cleanExtra.forEach((e) => {
          lines.push(`  • ${e.trim()}`);
        });
      }
    }

    return lines.filter((line) => line !== null).join("\n");
  }

  /**
   * Generate professional resume with AI enhancements
   */
  async generateProfessionalResume(data: ResumeData): Promise<GeneratedResume> {
    try {
      const formattedResume = this.buildFormattedResumeString(data);

      const prompt = `You are an expert resume writer specializing in helping international students applying to study abroad programs.

A student has provided their information. Your task is to:
1. Create a polished, ATS-friendly professional resume
2. Write an optimized professional summary (2-3 sentences, impactful)
3. Provide 5 specific improvement suggestions
4. Optimize experience bullet points with action verbs and quantifiable results
5. Provide tips for better resume formatting
6. Provide tips for stronger bullet points

CURRENT RESUME:
${formattedResume}

IMPORTANT GUIDELINES FOR INTERNATIONAL STUDENTS:
- Emphasize academic excellence and GPA
- Highlight research projects and publications
- Include any international experience or exchange programs
- Mention visa sponsorship skills if applicable
- Add competitive programming, hackathons, or tech competitions
- Include language proficiencies
- Show leadership in clubs/organizations
- Quantify achievements with numbers (increased by X%, led team of Y people, etc.)
- Use action verbs: Led, Developed, Implemented, Achieved, Designed, etc.

Please respond with ONLY valid JSON (no markdown, no code blocks):
{
  "resumeText": "Complete professional resume formatted nicely",
  "optimizedSummary": "2-3 sentence professional summary",
  "suggestions": [
    "Specific suggestion 1",
    "Specific suggestion 2",
    "Specific suggestion 3",
    "Specific suggestion 4",
    "Specific suggestion 5"
  ],
  "optimizedExperience": [
    {
      "original": "Original description from user",
      "optimized": "Improved version with action verbs and metrics"
    }
  ],
  "bulletPointTips": [
    "Tip 1 for writing better bullet points",
    "Tip 2 for writing better bullet points",
    "Tip 3 for writing better bullet points"
  ],
  "formatTips": [
    "Formatting tip 1",
    "Formatting tip 2",
    "Formatting tip 3"
  ]
}`;

      console.log("📝 Calling Gemini to generate resume...");
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      console.log("✅ Gemini response received");

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn("⚠️ Could not parse JSON from Gemini response");
        throw new Error("Failed to parse Gemini response as JSON");
      }

      const aiResponse = JSON.parse(jsonMatch[0]);

      return {
        resumeText: aiResponse.resumeText || formattedResume,
        optimizedSummary: aiResponse.optimizedSummary || data.summary,
        suggestions: Array.isArray(aiResponse.suggestions)
          ? aiResponse.suggestions
          : [],
        aiOptimizedExperience: Array.isArray(aiResponse.optimizedExperience)
          ? aiResponse.optimizedExperience
          : [],
        bulletPointTips: Array.isArray(aiResponse.bulletPointTips)
          ? aiResponse.bulletPointTips
          : [],
        formatTips: Array.isArray(aiResponse.formatTips)
          ? aiResponse.formatTips
          : [],
      };
    } catch (error) {
      console.error("❌ Error in generateProfessionalResume:", error);
      // Return fallback resume
      return {
        resumeText: this.buildFormattedResumeString(data),
        optimizedSummary: data.summary,
        suggestions: [
          "Add quantifiable metrics to your experience (increased by X%, led team of Y)",
          "Use strong action verbs: Led, Developed, Implemented, Achieved, Designed",
          "Highlight academic achievements, GPA, and honors",
          "Include international experience or exchange programs",
          "Add specific technical skills and tools used",
        ],
        aiOptimizedExperience: [],
        bulletPointTips: [
          "Start each bullet point with a strong action verb",
          "Quantify your accomplishments with numbers",
          "Focus on impact and results, not just tasks",
        ],
        formatTips: [
          "Keep resume to 1 page for undergraduates, 1-2 pages for graduates",
          "Use consistent formatting and spacing",
          "List achievements in reverse chronological order",
        ],
      };
    }
  }

  /**
   * Get detailed improvement suggestions
   */
  async getDetailedSuggestions(data: ResumeData): Promise<{
    overallFeedback: string;
    suggestions: string[];
    strengths: string[];
    areasForImprovement: string[];
  }> {
    try {
      const formattedResume = this.buildFormattedResumeString(data);

      const prompt = `You are an expert resume reviewer for international student applications to study abroad programs.

Review this resume and provide detailed feedback:

${formattedResume}

Provide your analysis in this EXACT JSON format (no markdown):
{
  "overallFeedback": "A 2-3 sentence overall assessment",
  "suggestions": [
    "Actionable suggestion 1",
    "Actionable suggestion 2",
    "Actionable suggestion 3",
    "Actionable suggestion 4",
    "Actionable suggestion 5"
  ],
  "strengths": [
    "Strength 1 of the resume",
    "Strength 2 of the resume",
    "Strength 3 of the resume"
  ],
  "areasForImprovement": [
    "Area 1 to improve",
    "Area 2 to improve",
    "Area 3 to improve"
  ]
}`;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        overallFeedback: "Resume shows good structure. Focus on quantifying achievements.",
        suggestions: [
          "Add measurable outcomes to each role",
          "Use more dynamic action verbs",
          "Highlight international or research experience",
          "Include technical skills section",
          "Quantify team sizes and project impacts",
        ],
        strengths: [
          "Clear education section",
          "Good experience background",
          "Relevant skills listed",
        ],
        areasForImprovement: [
          "Need more metrics and numbers",
          "Experience bullets could be more specific",
          "Consider adding certifications or awards",
        ],
      };
    } catch (error) {
      console.error("Error getting detailed suggestions:", error);
      throw error;
    }
  }

  /**
   * Generate specific tips for study abroad applications
   */
  async getStudyAbroadTips(data: ResumeData): Promise<{
    internationalFocus: string[];
    academicHighlights: string[];
    technicalSkills: string[];
    leadershipPoints: string[];
  }> {
    try {
      const prompt = `For a student applying to study abroad programs with this background:
- Name: ${data.fullName}
- Field of Study: ${data.experience[0]?.role || data.skills[0] || "General"}
- Skills: ${data.skills.slice(0, 5).join(", ")}

Provide specific resume tips in this JSON format:
{
  "internationalFocus": [
    "Tip 1 for highlighting international experience",
    "Tip 2 for showing global mindset",
    "Tip 3 for emphasizing cross-cultural skills"
  ],
  "academicHighlights": [
    "Tip 1 for academic achievements",
    "Tip 2 for research experience",
    "Tip 3 for academic competitions"
  ],
  "technicalSkills": [
    "Tip 1 for technical skills",
    "Tip 2 for programming languages",
    "Tip 3 for tools and frameworks"
  ],
  "leadershipPoints": [
    "Tip 1 for leadership roles",
    "Tip 2 for initiative",
    "Tip 3 for team management"
  ]
}`;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        internationalFocus: [
          "Mention any exchange programs or international conferences",
          "Highlight collaborations with international teams",
          "Include language proficiencies",
        ],
        academicHighlights: [
          "List GPA and honors if above 3.5",
          "Include relevant coursework for your target program",
          "Mention research papers or publications",
        ],
        technicalSkills: [
          "List programming languages in order of proficiency",
          "Include frameworks and tools specific to your field",
          "Mention certifications or completed courses",
        ],
        leadershipPoints: [
          "Highlight leadership roles in clubs or projects",
          "Show initiative by starting projects or organizations",
          "Mention mentoring or team leadership experience",
        ],
      };
    } catch (error) {
      console.error("Error getting study abroad tips:", error);
      throw error;
    }
  }
}

export default new ResumeService();
import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

type DocumentType = "resume" | "sop" | "lor";

type GenerateDocumentBody = {
  type?: DocumentType;
  fullName?: string;
  email?: string;
  targetCountry?: string;
  targetUniversity?: string;
  targetProgram?: string;
  currentEducation?: string;
  fieldOfStudy?: string;
  achievements?: string[] | string;
  projects?: string[] | string;
  experience?: string[] | string;
  skills?: string[] | string;
  recommenderName?: string;
  recommenderRole?: string;
  relationship?: string;
  tone?: string;
  prompt?: string;
};

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const model = genAI?.getGenerativeModel({ model: "gemini-2.5-flash" });

function listify(value: string[] | string | undefined): string {
  if (!value) return "Not provided";
  if (Array.isArray(value)) {
    const clean = value.map((item) => item.trim()).filter(Boolean);
    return clean.length ? clean.map((item) => `- ${item}`).join("\n") : "Not provided";
  }
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `- ${item}`)
    .join("\n") || "Not provided";
}

function buildPrompt(data: Required<Pick<GenerateDocumentBody, "type">> & GenerateDocumentBody) {
  const baseContext = `
STUDENT DETAILS
Name: ${data.fullName || "Not provided"}
Email: ${data.email || "Not provided"}
Target country: ${data.targetCountry || "Not provided"}
Target university: ${data.targetUniversity || "Not provided"}
Target program: ${data.targetProgram || "Not provided"}
Current education: ${data.currentEducation || "Not provided"}
Field of study: ${data.fieldOfStudy || "Not provided"}
Tone: ${data.tone || "confident, specific, polished, and natural"}

ACHIEVEMENTS
${listify(data.achievements)}

PROJECTS
${listify(data.projects)}

EXPERIENCE
${listify(data.experience)}

SKILLS
${listify(data.skills)}

CUSTOM USER PROMPT
${data.prompt || "No extra instruction."}
`;

  if (data.type === "resume") {
    return `
You are an expert resume writer for study-abroad applicants.

Generate a complete ATS-friendly resume from the basic information below.
If raw experience/project details are brief, turn them into strong resume bullets using action verbs.
Do not invent fake employers, scores, awards, metrics, dates, publications, or certifications.
If a metric is not provided, write impact clearly without a made-up number.
Use plain text with clear sections: Header, Summary, Education, Projects, Experience, Skills, Achievements.

${baseContext}

Return only the final resume text.
`;
  }

  if (data.type === "sop") {
    return `
You are an admissions writing coach for international study-abroad applications.

Generate a complete Statement of Purpose from the basic information below.
Make it personal, specific, and suitable for graduate/undergraduate admissions.
Use a strong structure: academic background, motivation, relevant projects/experience, why this program/university/country, future goals, closing.
Do not invent facts, awards, grades, internships, research, or personal hardships.
If university/program details are missing, keep that section adaptable without using placeholders.

${baseContext}

Return only the final SOP text.
`;
  }

  return `
You are drafting a Letter of Recommendation support draft for a recommender to review and edit.

Generate a polished LOR draft based on the basic information below.
Write from the recommender's perspective only as a draft, not as a final signed letter.
Do not invent private details, exact grades, rankings, or achievements not provided.
Use a credible structure: relationship context, academic/work strengths, specific examples, personal qualities, fit for the target program, recommendation closing.

RECOMMENDER DETAILS
Name: ${data.recommenderName || "Not provided"}
Role/title: ${data.recommenderRole || "Not provided"}
Relationship to student: ${data.relationship || "Not provided"}

${baseContext}

Return only the final LOR draft text.
`;
}

function fallbackDocument(data: Required<Pick<GenerateDocumentBody, "type">> & GenerateDocumentBody) {
  const name = data.fullName || "Student";
  const program = data.targetProgram || "the target program";
  const university = data.targetUniversity || "the university";

  if (data.type === "resume") {
    return `${name.toUpperCase()}
${data.email || ""}

PROFESSIONAL SUMMARY
Motivated ${data.fieldOfStudy || "student"} applicant targeting ${program}. Strong academic interest, project experience, and commitment to international study.

EDUCATION
${data.currentEducation || "Current education details not provided"}

PROJECTS
${listify(data.projects)}

EXPERIENCE
${listify(data.experience)}

SKILLS
${listify(data.skills)}

ACHIEVEMENTS
${listify(data.achievements)}`;
  }

  if (data.type === "sop") {
    return `I am ${name}, and I am applying to ${program} at ${university}. My academic background in ${data.fieldOfStudy || "my chosen field"} has shaped my interest in pursuing advanced international education.

${listify(data.projects)}

Through my academic work, projects, and experiences, I have developed a clearer understanding of my goals and the skills I need to build further. I am especially interested in ${program} because it aligns with my long-term academic and professional direction.

I hope to contribute curiosity, discipline, and a global perspective to the program while continuing to grow as a student and future professional.`;
  }

  return `To the Admissions Committee,

I am pleased to provide this recommendation draft for ${name}, who is applying to ${program} at ${university}. I have known the student in the capacity of ${data.relationship || "an academic/professional relationship"}.

${name} has demonstrated strong interest in ${data.fieldOfStudy || "their chosen field"}, along with commitment, curiosity, and the ability to work thoughtfully on academic and project-based tasks.

Based on the information provided, notable strengths include:
${listify(data.achievements)}

I believe ${name} has the motivation and potential to succeed in an international academic environment.`;
}

export async function generateAiDocument(req: Request, res: Response) {
  try {
    const body = req.body as GenerateDocumentBody;
    const type = body.type;

    if (!type || !["resume", "sop", "lor"].includes(type)) {
      return res.status(400).json({
        success: false,
        error: "type must be one of: resume, sop, lor",
      });
    }

    if (!body.fullName && !body.prompt) {
      return res.status(400).json({
        success: false,
        error: "Provide at least fullName or prompt",
      });
    }

    const normalized = { ...body, type };

    if (!model) {
      return res.json({
        success: true,
        generatedText: fallbackDocument(normalized),
        source: "fallback",
        warning: "GEMINI_API_KEY is not configured, so a basic template was generated.",
      });
    }

    const result = await model.generateContent(buildPrompt(normalized));
    const generatedText = result.response.text().trim();

    res.json({
      success: true,
      generatedText,
      source: "gemini",
    });
  } catch (error) {
    console.error("Error generating AI document:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate document",
    });
  }
}

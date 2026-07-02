export type AiDocumentType = "resume" | "sop" | "lor";

export type AiDocumentPayload = {
  type: AiDocumentType;
  fullName: string;
  email?: string;
  targetCountry?: string;
  targetUniversity?: string;
  targetProgram?: string;
  currentEducation?: string;
  fieldOfStudy?: string;
  achievements?: string;
  projects?: string;
  experience?: string;
  skills?: string;
  recommenderName?: string;
  recommenderRole?: string;
  relationship?: string;
  tone?: string;
  prompt?: string;
};

export type AiDocumentResponse = {
  success: boolean;
  generatedText: string;
  source?: "gemini" | "fallback";
  warning?: string;
  error?: string;
};

const BASE_URL = "/api/v1";

export async function generateAiDocument(payload: AiDocumentPayload): Promise<AiDocumentResponse> {
  const response = await fetch(`${BASE_URL}/ai-documents/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || `Failed to generate document: ${response.status}`);
  }

  return result;
}

export function downloadGeneratedDocument(text: string, filename: string) {
  const element = document.createElement("a");
  element.href = `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`;
  element.download = filename;
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

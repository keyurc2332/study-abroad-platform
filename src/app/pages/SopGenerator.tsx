import React, { useMemo } from "react";
import { jsPDF } from "jspdf";
import { usePersistentState, STORAGE_KEYS, defaultSopData, type SopData } from "../data/studyAbroadData";
import { Clipboard, Download, FilePlus } from "lucide-react";
import { appendActivity } from "../data/studyAbroadData";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm text-slate-700">
      <span className="mb-2 block text-sm font-semibold text-slate-900">{label}</span>
      {children}
    </label>
  );
}

function generateSop(data: SopData) {
  const parts: string[] = [];

  if (data.personalBrief?.trim()) {
    parts.push(data.personalBrief.trim());
  }

  if (data.academicBackground?.trim()) {
    parts.push(`Academic background: ${data.academicBackground.trim()}.`);
  }

  if (data.academicAchievements?.trim()) {
    parts.push(`Academic achievements: ${data.academicAchievements.trim()}.`);
  }

  if (data.projectsAndInternships?.trim()) {
    parts.push(`Projects and internships: ${data.projectsAndInternships.trim()}.`);
  }

  if (data.skills?.trim()) {
    parts.push(`Skills developed: ${data.skills.trim()}.`);
  }

  if (data.familyBackground?.trim()) {
    parts.push(`Family background: ${data.familyBackground.trim()}.`);
  }

  if (data.strengths?.trim()) {
    const ex = data.strengthExamples?.trim() ? ` For example, ${data.strengthExamples.trim()}.` : "";
    parts.push(`Strengths: ${data.strengths.trim()}.${ex}`);
  }

  if (data.uniqueAspects?.trim()) {
    parts.push(`Unique aspects: ${data.uniqueAspects.trim()}.`);
  }

  if (data.institutionsOfChoice?.trim()) {
    parts.push(`Institutes of choice: ${data.institutionsOfChoice.trim()}.`);
  }

  if (data.selectionFactors?.trim()) {
    parts.push(`Selection factors: ${data.selectionFactors.trim()}.`);
  }

  if (data.motivation?.trim()) {
    parts.push(`Motivation and goals: ${data.motivation.trim()}.`);
  }

  if (data.fiveYearPlan?.trim()) {
    parts.push(`Five-year plan: ${data.fiveYearPlan.trim()}.`);
  }

  if (data.tenYearPlan?.trim()) {
    parts.push(`Ten-year plan: ${data.tenYearPlan.trim()}.`);
  }

  if (data.extracurriculars?.trim()) {
    parts.push(`Extracurricular activities: ${data.extracurriculars.trim()}.`);
  }

  if (data.currentIndustry?.trim() || data.designationAndRole?.trim()) {
    parts.push(`Professional experience: ${[data.currentIndustry, data.designationAndRole].filter(Boolean).join(", ")}.`);
  }

  if (data.whyHigherEducation?.trim()) {
    parts.push(`Why higher education now: ${data.whyHigherEducation.trim()}.`);
  }

  if (data.workSummary?.trim()) {
    parts.push(`Work summary: ${data.workSummary.trim()}.`);
  }

  if (data.careerProgression?.trim()) {
    parts.push(`Career progression: ${data.careerProgression.trim()}.`);
  }

  if (data.standoutProjects?.trim()) {
    parts.push(`Standout projects: ${data.standoutProjects.trim()}.`);
  }

  if (data.professionalAccomplishments?.trim()) {
    parts.push(`Professional accomplishments: ${data.professionalAccomplishments.trim()}.`);
  }

  if (data.leadershipExperience?.trim()) {
    parts.push(`Leadership: ${data.leadershipExperience.trim()}.`);
  }

  if (data.overseasExperience?.trim()) {
    parts.push(`Overseas experience: ${data.overseasExperience.trim()}.`);
  }

  // Join into coherent paragraphs
  return parts.join("\n\n");
}

export default function SopGenerator() {
  const [data, setData] = usePersistentState<SopData>(STORAGE_KEYS.sopGenerator, defaultSopData);

  const sopText = useMemo(() => generateSop(data), [data]);

  const update = <K extends keyof SopData>(key: K, value: SopData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sopText);
      appendActivity({ action: "Copied SOP to clipboard", path: "/sop-generator", type: "document" });
    } catch {
      // ignore
    }
  };

  const exportToText = () => {
    const blob = new Blob([sopText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sop.txt";
    link.click();
    URL.revokeObjectURL(url);
    appendActivity({ action: "Exported SOP as text", path: "/sop-generator", type: "document" });
  };

  const exportToPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const maxWidth = pageWidth - margin * 2;
    let y = 60;
    doc.setFontSize(12);
    const paragraphs = sopText.split(/\n\n/);
    paragraphs.forEach((p) => {
      const lines = doc.splitTextToSize(p, maxWidth);
      doc.text(lines, margin, y);
      y += lines.length * 14 + 12;
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
    });
    doc.save("sop.pdf");
    appendActivity({ action: "Exported SOP as PDF", path: "/sop-generator", type: "document" });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-[28px] bg-white p-6 shadow-md">
          <h1 className="text-2xl font-semibold text-slate-900">SOP Generator</h1>
          <p className="mt-2 text-sm text-slate-600">Answer the prompts below and generate a tailored Statement of Purpose.</p>
        </div>

        <div className="space-y-6 rounded-[28px] bg-white p-6 shadow-md">
          <Field label="Personal brief (one paragraph)">
            <textarea value={data.personalBrief} onChange={(e) => update("personalBrief", e.target.value)} rows={3} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
          </Field>

          <Field label="Tell us about your Academic Background">
            <textarea value={data.academicBackground} onChange={(e) => update("academicBackground", e.target.value)} rows={3} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
          </Field>

          <Field label="Academic achievements / ranks">
            <textarea value={data.academicAchievements} onChange={(e) => update("academicAchievements", e.target.value)} rows={2} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
          </Field>

          <Field label="Projects / Internships (list activities)">
            <textarea value={data.projectsAndInternships} onChange={(e) => update("projectsAndInternships", e.target.value)} rows={3} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
          </Field>

          <Field label="Skills gained from academics & activities">
            <input value={data.skills} onChange={(e) => update("skills", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
          </Field>

          <Field label="Family background and influence">
            <textarea value={data.familyBackground} onChange={(e) => update("familyBackground", e.target.value)} rows={2} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
          </Field>

          <Field label="Strengths">
            <input value={data.strengths} onChange={(e) => update("strengths", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
          </Field>

          <Field label="Examples where you used these strengths">
            <textarea value={data.strengthExamples} onChange={(e) => update("strengthExamples", e.target.value)} rows={2} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
          </Field>

          <Field label="What makes you unique compared to peers">
            <textarea value={data.uniqueAspects} onChange={(e) => update("uniqueAspects", e.target.value)} rows={2} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
          </Field>

          <Field label="Institutes of your choice and why">
            <textarea value={data.institutionsOfChoice} onChange={(e) => update("institutionsOfChoice", e.target.value)} rows={2} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
          </Field>

          <Field label="Factors that matter in choosing destination / institution">
            <input value={data.selectionFactors} onChange={(e) => update("selectionFactors", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
          </Field>

          <Field label="What drives / motivates you">
            <textarea value={data.motivation} onChange={(e) => update("motivation", e.target.value)} rows={2} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Where do you see yourself in 5 years?">
              <input value={data.fiveYearPlan} onChange={(e) => update("fiveYearPlan", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
            </Field>
            <Field label="Where do you see yourself in 10 years?">
              <input value={data.tenYearPlan} onChange={(e) => update("tenYearPlan", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
            </Field>
          </div>

          <Field label="Extracurricular activities (clubs, NGOs, workplace)">
            <textarea value={data.extracurriculars} onChange={(e) => update("extracurriculars", e.target.value)} rows={2} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
          </Field>

          <Field label="Current industry / designation and role">
            <input value={data.currentIndustry} onChange={(e) => update("currentIndustry", e.target.value)} placeholder="Industry" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
            <input value={data.designationAndRole} onChange={(e) => update("designationAndRole", e.target.value)} placeholder="Designation / Role" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
          </Field>

          <Field label="Why do you need higher education now?">
            <textarea value={data.whyHigherEducation} onChange={(e) => update("whyHigherEducation", e.target.value)} rows={2} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
          </Field>

          <Field label="Work experience summary and progression">
            <textarea value={data.workSummary} onChange={(e) => update("workSummary", e.target.value)} rows={3} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
          </Field>

          <Field label="Projects where you outperformed / standout projects">
            <textarea value={data.standoutProjects} onChange={(e) => update("standoutProjects", e.target.value)} rows={2} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
          </Field>

          <Field label="Professional accomplishments / awards">
            <textarea value={data.professionalAccomplishments} onChange={(e) => update("professionalAccomplishments", e.target.value)} rows={2} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
          </Field>

          <Field label="Leadership experience">
            <textarea value={data.leadershipExperience} onChange={(e) => update("leadershipExperience", e.target.value)} rows={2} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
          </Field>

          <Field label="Overseas experience (if any)">
            <textarea value={data.overseasExperience} onChange={(e) => update("overseasExperience", e.target.value)} rows={2} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
          </Field>

          <div className="flex gap-3">
            <button type="button" onClick={copyToClipboard} className="inline-flex items-center gap-2 rounded-3xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
              <Clipboard className="h-4 w-4" />
              Copy SOP
            </button>
            <button type="button" onClick={exportToText} className="inline-flex items-center gap-2 rounded-3xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              <Download className="h-4 w-4" />
              Export Text
            </button>
            <button type="button" onClick={exportToPdf} className="inline-flex items-center gap-2 rounded-3xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
              <FilePlus className="h-4 w-4" />
              Export PDF
            </button>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold">Generated SOP</h3>
            <div className="mt-3 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900">{sopText || "Complete the form above and click copy/export to get your SOP."}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

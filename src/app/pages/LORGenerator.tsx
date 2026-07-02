import React, { useMemo } from "react";
import { jsPDF } from "jspdf";
import { usePersistentState, STORAGE_KEYS, defaultLorData, type LorData } from "../data/studyAbroadData";
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

function generateLor(data: LorData) {
  const lines: string[] = [];

  lines.push(`To the Admissions Committee,`);
  lines.push("");

  const introParts: string[] = [];
  if (data.recommenderName || data.recommenderPosition) {
    introParts.push(`${data.recommenderName}${data.recommenderPosition ? `, ${data.recommenderPosition}` : ""}`);
  }
  if (data.relationship) {
    introParts.push(`has known the candidate as ${data.relationship}`);
  }
  if (data.durationKnown) {
    introParts.push(`for ${data.durationKnown}`);
  }

  if (introParts.length) {
    lines.push(`${introParts.join(" ")}.`);
  } else {
    lines.push(`I am writing to recommend ${data.studentName} for admission to ${data.studentProgram} at ${data.studentInstitution}.`);
  }

  lines.push("");

  if (data.studentName && (data.studentProgram || data.studentInstitution)) {
    lines.push(`I am pleased to recommend ${data.studentName} for the ${data.studentProgram || "program"} at ${data.studentInstitution || "your institution"}.`);
  }

  if (data.strengths) {
    const ex = data.strengthExamples ? ` For example, ${data.strengthExamples}.` : "";
    lines.push(`${data.studentName || "The candidate"} has demonstrated ${data.strengths}.${ex}`);
  }

  if (data.specificProjects) {
    lines.push(`${data.studentName || "They"} worked on ${data.specificProjects}, which showcased their ability to apply knowledge and work collaboratively.`);
  }

  if (data.achievements) {
    lines.push(`Notable achievements include: ${data.achievements}.`);
  }

  lines.push("");

  lines.push(`I am confident that ${data.studentName || "the candidate"} will be an asset to your program and will continue to grow academically and professionally.`);

  if (data.closingRemarks) {
    lines.push("");
    lines.push(data.closingRemarks);
  }

  if (data.recommenderContact) {
    lines.push("");
    lines.push(`Sincerely,`);
    lines.push(data.recommenderName || "");
    if (data.recommenderPosition) lines.push(data.recommenderPosition);
    if (data.recommenderContact) lines.push(data.recommenderContact);
  }

  return lines.filter(Boolean).join("\n\n");
}

export default function LORGenerator() {
  const [data, setData] = usePersistentState<LorData>(STORAGE_KEYS.lorGenerator, defaultLorData);

  const lorText = useMemo(() => generateLor(data), [data]);

  const update = <K extends keyof LorData>(key: K, value: LorData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(lorText);
      appendActivity({ action: "Copied LOR to clipboard", path: "/lor-generator", type: "document" });
    } catch {
      // ignore
    }
  };

  const exportToText = () => {
    const blob = new Blob([lorText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lor.txt";
    link.click();
    URL.revokeObjectURL(url);
    appendActivity({ action: "Exported LOR as text", path: "/lor-generator", type: "document" });
  };

  const exportToPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const maxWidth = pageWidth - margin * 2;
    let y = 60;
    doc.setFontSize(12);
    const paragraphs = lorText.split(/\n\n/);
    paragraphs.forEach((p) => {
      const lines = doc.splitTextToSize(p, maxWidth);
      doc.text(lines, margin, y);
      y += lines.length * 14 + 12;
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
    });
    doc.save("lor.pdf");
    appendActivity({ action: "Exported LOR as PDF", path: "/lor-generator", type: "document" });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-[28px] bg-white p-6 shadow-md">
          <h1 className="text-2xl font-semibold text-slate-900">LOR Generator</h1>
          <p className="mt-2 text-sm text-slate-600">Fill in the recommender and student details to generate a professional letter of recommendation.</p>
        </div>

        <div className="space-y-6 rounded-[28px] bg-white p-6 shadow-md">
          <fieldset className="grid gap-4">
            <legend className="text-sm font-semibold text-slate-900">Recommender details</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Recommender name">
                <input placeholder="Dr. Rajesh Kumar" value={data.recommenderName} onChange={(e) => update("recommenderName", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
              </Field>
              <Field label="Position / Affiliation">
                <input placeholder="Professor of Computer Science" value={data.recommenderPosition} onChange={(e) => update("recommenderPosition", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Relationship to student">
                <input placeholder="Professor / Supervisor" value={data.relationship} onChange={(e) => update("relationship", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
              </Field>
              <Field label="Duration known">
                <input placeholder="e.g. 2 years" value={data.durationKnown} onChange={(e) => update("durationKnown", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
              </Field>
            </div>
          </fieldset>

          <fieldset className="grid gap-4">
            <legend className="text-sm font-semibold text-slate-900">Student details</legend>
            <Field label="Student name">
              <input placeholder="Aisha Patel" value={data.studentName} onChange={(e) => update("studentName", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Student program">
                <input placeholder="MSc Computer Science" value={data.studentProgram} onChange={(e) => update("studentProgram", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
              </Field>
              <Field label="Student institution">
                <input placeholder="Indian Institute of Technology" value={data.studentInstitution} onChange={(e) => update("studentInstitution", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
              </Field>
            </div>
          </fieldset>

          <fieldset className="grid gap-4">
            <legend className="text-sm font-semibold text-slate-900">Strengths & work</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Strengths (comma separated)">
                <input placeholder="Analytical, Collaborative, Self-motivated" value={data.strengths} onChange={(e) => update("strengths", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
              </Field>
              <Field label="Examples where strengths were demonstrated">
                <textarea placeholder="Describe instances where strengths were shown" value={data.strengthExamples} onChange={(e) => update("strengthExamples", e.target.value)} rows={2} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Achievements / awards">
                <input placeholder="Dean's list, Research grant" value={data.achievements} onChange={(e) => update("achievements", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
              </Field>
              <Field label="Specific projects / notable work">
                <textarea placeholder="Project title and role" value={data.specificProjects} onChange={(e) => update("specificProjects", e.target.value)} rows={2} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
              </Field>
            </div>
          </fieldset>

          <fieldset className="grid gap-4">
            <legend className="text-sm font-semibold text-slate-900">Closing</legend>
            <Field label="Closing remarks">
              <textarea placeholder="Any final recommendation or note" value={data.closingRemarks} onChange={(e) => update("closingRemarks", e.target.value)} rows={2} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
            </Field>

            <Field label="Recommender contact info">
              <input placeholder="email@institution.edu | +91 98765 43210" value={data.recommenderContact} onChange={(e) => update("recommenderContact", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" />
            </Field>
          </fieldset>

          <div className="flex gap-3">
            <button type="button" onClick={copyToClipboard} className="inline-flex items-center gap-2 rounded-3xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
              <Clipboard className="h-4 w-4" />
              Copy LOR
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
            <h3 className="text-lg font-semibold">Generated LOR</h3>
            <div className="mt-3 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900">{lorText || "Complete the form above and click copy/export to get your letter of recommendation."}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

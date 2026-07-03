import { useMemo } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { jsPDF } from "jspdf";
import {
  ArrowRight,
  Briefcase,
  Building,
  ClipboardList,
  Download,
  FilePlus,
  Sparkles,
  User,
} from "lucide-react";
import { appendActivity, defaultResumeBuilder, type ResumeBuilderData, STORAGE_KEYS, usePersistentState } from "../data/studyAbroadData";

const cleanList = (items: string[] = []) => items.map((item) => item.trim()).filter(Boolean);
const renderList = (items: string[]) => cleanList(items).join(", ");
const toUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

function buildResumeText(resume: ResumeBuilderData) {
  const cleanEducation = resume.education.filter(
    (item) => item.institution || item.degree || item.dates || item.description,
  );
  const cleanExperience = resume.experience.filter(
    (item) => item.role || item.company || item.dates || item.description,
  );

  const lines: string[] = [
    resume.fullName,
    [resume.email, resume.phone, resume.linkedin, resume.github].filter(Boolean).join(" | "),
  ];

  if (resume.summary?.trim()) {
    lines.push("", "PROFESSIONAL SUMMARY", resume.summary);
  }

  if (cleanEducation.length) {
    lines.push("", "EDUCATION");
    cleanEducation.forEach((item) => {
      lines.push(`${item.institution} | ${item.degree} | ${item.dates}`);
      if (item.description?.trim()) {
        lines.push(item.description);
      }
      lines.push("");
    });
  }

  if (cleanExperience.length) {
    lines.push("EXPERIENCE");
    cleanExperience.forEach((item) => {
      lines.push(`${item.role} | ${item.company} | ${item.dates}`);
      if (item.description?.trim()) {
        lines.push(item.description);
      }
      lines.push("");
    });
  }

  const achievements = cleanList(resume.achievements);
  if (achievements.length) {
    lines.push("ACHIEVEMENTS", ...achievements.map((item) => `- ${item}`), "");
  }

  const extracurriculars = cleanList(resume.extracurriculars);
  if (extracurriculars.length) {
    lines.push("EXTRACURRICULARS", ...extracurriculars.map((item) => `- ${item}`), "");
  }

  const skills = cleanList(resume.skills);
  if (skills.length) {
    lines.push("SKILLS", renderList(skills), "");
  }

  const languages = cleanList(resume.languages);
  if (languages.length) {
    lines.push("LANGUAGES", renderList(languages), "");
  }

  return lines.filter(Boolean).join("\n");
}

function buildResumePdf(doc: jsPDF, resume: ResumeBuilderData) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const maxWidth = pageWidth - margin * 2;
  let y = 50;

  const ensurePage = (height: number) => {
    if (y + height > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const addSectionTitle = (title: string) => {
    ensurePage(28);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(title.toUpperCase(), margin, y);
    const lineY = y + 4;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.8);
    doc.line(margin, lineY, pageWidth - margin, lineY);
    y += 16;
  };

  const addParagraph = (text: string, options: { indent?: number } = {}) => {
    if (!text?.trim()) {
      return;
    }
    const indent = options.indent ?? 0;
    const startX = margin + indent;
    const split = doc.splitTextToSize(text, maxWidth - indent);
    ensurePage(split.length * 12 + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(split, startX, y, { maxWidth: maxWidth - indent });
    y += split.length * 12 + 6;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(resume.fullName, pageWidth / 2, y, { align: "center" });
  y += 24;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const contactItems = [
    { text: resume.email, url: "" },
    { text: resume.phone, url: "" },
    { text: "LinkedIn", url: toUrl(resume.linkedin), visible: resume.linkedin },
    { text: "GitHub", url: toUrl(resume.github), visible: resume.github },
  ].filter((item) => item.visible?.trim() || (!("visible" in item) && item.text?.trim()));
  const separator = " | ";
  const totalContactWidth = contactItems.reduce((total, item, index) => {
    return total + doc.getTextWidth(item.text) + (index > 0 ? doc.getTextWidth(separator) : 0);
  }, 0);
  let contactX = (pageWidth - totalContactWidth) / 2;
  contactItems.forEach((item, index) => {
    if (index > 0) {
      doc.setTextColor(0, 0, 0);
      doc.text(separator, contactX, y);
      contactX += doc.getTextWidth(separator);
    }
    const textWidth = doc.getTextWidth(item.text);
    if (item.url) {
      doc.setTextColor(37, 99, 235);
      doc.text(item.text, contactX, y);
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.4);
      doc.line(contactX, y + 1.5, contactX + textWidth, y + 1.5);
      doc.link(contactX, y - 9, textWidth, 12, { url: item.url });
    } else {
      doc.setTextColor(0, 0, 0);
      doc.text(item.text, contactX, y);
    }
    contactX += textWidth;
  });
  doc.setTextColor(0, 0, 0);
  y += 18;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 24;

  if (resume.summary?.trim()) {
    addSectionTitle("Professional Summary");
    addParagraph(resume.summary);
  }

  const cleanEducation = resume.education.filter(
    (item) => item.institution || item.degree || item.dates || item.description,
  );
  if (cleanEducation.length) {
    addSectionTitle("Education");
    cleanEducation.forEach((item) => {
      ensurePage(60);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(item.institution, margin, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(item.dates, pageWidth - margin, y, { align: "right" });
      y += 14;
      addParagraph(`${item.degree}`, { indent: 0 });
      if (item.description?.trim()) {
        addParagraph(item.description, { indent: 12 });
      }
      y += 4;
    });
  }

  const cleanExperience = resume.experience.filter(
    (item) => item.role || item.company || item.dates || item.description,
  );
  if (cleanExperience.length) {
    addSectionTitle("Experience");
    cleanExperience.forEach((item) => {
      ensurePage(80);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(item.role, margin, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(item.dates, pageWidth - margin, y, { align: "right" });
      y += 14;
      addParagraph(item.company, { indent: 0 });
      if (item.description?.trim()) {
        addParagraph(item.description, { indent: 12 });
      }
      y += 4;
    });
  }

  const achievements = cleanList(resume.achievements);
  if (achievements.length) {
    addSectionTitle("Achievements");
    achievements.forEach((item) => {
      ensurePage(24);
      addParagraph(`- ${item}`, { indent: 12 });
    });
  }

  const extracurriculars = cleanList(resume.extracurriculars);
  if (extracurriculars.length) {
    addSectionTitle("Extracurriculars");
    extracurriculars.forEach((item) => {
      ensurePage(24);
      addParagraph(`- ${item}`, { indent: 12 });
    });
  }

  const skills = cleanList(resume.skills);
  if (skills.length) {
    addSectionTitle("Skills");
    addParagraph(renderList(skills));
  }

  const languages = cleanList(resume.languages);
  if (languages.length) {
    addSectionTitle("Languages");
    addParagraph(renderList(languages));
  }
}

export default function ResumeBuilder() {
  const [resume, setResume] = usePersistentState<ResumeBuilderData>(STORAGE_KEYS.resumeBuilder, defaultResumeBuilder);

  const safeResume = useMemo(
    () => ({
      ...defaultResumeBuilder,
      ...resume,
      achievements: resume.achievements ?? [],
      extracurriculars: resume.extracurriculars ?? [],
      github: resume.github ?? "",
      skills: resume.skills ?? [],
      languages: resume.languages ?? [],
    }),
    [resume],
  );

  const skillsText = useMemo(() => safeResume.skills.join(", "), [safeResume.skills]);
  const languagesText = useMemo(() => safeResume.languages.join(", "), [safeResume.languages]);

  const showSummary = Boolean(safeResume.summary?.trim());
  const showEducation = safeResume.education.some(
    (item) => item.institution || item.degree || item.dates || item.description,
  );
  const showExperience = safeResume.experience.some(
    (item) => item.role || item.company || item.dates || item.description,
  );
  const showAchievements = safeResume.achievements.length > 0;
  const showExtracurriculars = safeResume.extracurriculars.length > 0;
  const showSkills = safeResume.skills.length > 0;
  const showLanguages = safeResume.languages.length > 0;

  const updateField = <K extends keyof ResumeBuilderData>(field: K, value: ResumeBuilderData[K]) => {
    setResume((prev) => ({ ...prev, [field]: value }));
  };

  const updateEducation = (index: number, field: keyof ResumeBuilderData["education"][number], value: string) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)),
    }));
  };

  const updateExperience = (index: number, field: keyof ResumeBuilderData["experience"][number], value: string) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)),
    }));
  };

  const addEducation = () => {
    setResume((prev) => ({
      ...prev,
      education: [...prev.education, { institution: "", degree: "", dates: "", description: "" }],
    }));
  };

  const addExperience = () => {
    setResume((prev) => ({
      ...prev,
      experience: [...prev.experience, { role: "", company: "", dates: "", description: "" }],
    }));
  };

  const removeEducation = (index: number) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.filter((_, idx) => idx !== index),
    }));
  };

  const removeExperience = (index: number) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, idx) => idx !== index),
    }));
  };

  const setSkills = (value: string) => {
    setResume((prev) => ({ ...prev, skills: value.split(",").map((item) => item.trim()).filter(Boolean) }));
  };

  const setLanguages = (value: string) => {
    setResume((prev) => ({ ...prev, languages: value.split(",").map((item) => item.trim()).filter(Boolean) }));
  };

  const addAchievement = () => {
    setResume((prev) => ({
      ...prev,
      achievements: [...(prev.achievements ?? []), ""],
    }));
  };

  const updateAchievement = (index: number, value: string) => {
    setResume((prev) => ({
      ...prev,
      achievements: (prev.achievements ?? []).map((item, idx) => (idx === index ? value : item)),
    }));
  };

  const removeAchievement = (index: number) => {
    setResume((prev) => ({
      ...prev,
      achievements: (prev.achievements ?? []).filter((_, idx) => idx !== index),
    }));
  };

  const addExtracurricular = () => {
    setResume((prev) => ({
      ...prev,
      extracurriculars: [...(prev.extracurriculars ?? []), ""],
    }));
  };

  const updateExtracurricular = (index: number, value: string) => {
    setResume((prev) => ({
      ...prev,
      extracurriculars: (prev.extracurriculars ?? []).map((item, idx) => (idx === index ? value : item)),
    }));
  };

  const removeExtracurricular = (index: number) => {
    setResume((prev) => ({
      ...prev,
      extracurriculars: (prev.extracurriculars ?? []).filter((_, idx) => idx !== index),
    }));
  };

  const resetResume = () => {
    setResume(defaultResumeBuilder);
    appendActivity({ action: "Reset resume builder to defaults", path: "/resume-builder", type: "document" });
  };

  const exportToText = () => {
    const content = buildResumeText(safeResume);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "resume.txt";
    link.click();
    URL.revokeObjectURL(url);
    appendActivity({ action: "Exported resume as text file", path: "/resume-builder", type: "document" });
  };

  const exportToPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    buildResumePdf(doc, safeResume);
    doc.save("resume.pdf");
    appendActivity({ action: "Downloaded resume as PDF", path: "/resume-builder", type: "document" });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(buildResumeText(resume));
      appendActivity({ action: "Copied resume content to clipboard", path: "/resume-builder", type: "document" });
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6 rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Resume Builder</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
                Build a strong study-abroad resume fast.
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                Edit your resume, preview it instantly, and save your draft to local storage. Use the builder to prepare a polished CV for admissions and scholarship applications.
              </p>
                <div className="mt-4">
                  <div className="flex gap-3">
                    <Link to="/lor-generator" className="inline-flex items-center gap-2 rounded-3xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                      <FilePlus className="h-4 w-4" />
                      Generate LOR
                    </Link>
                    <Link to="/visa-mock-interview" className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900">
                      <User className="h-4 w-4" />
                      Visa Mock Interview
                    </Link>
                  </div>
                </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="space-y-6 rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Full name">
                <input
                  value={resume.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </FormField>
              <FormField label="Email">
                <input
                  value={resume.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </FormField>
              <FormField label="Phone">
                <input
                  value={resume.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </FormField>
              <FormField label="LinkedIn">
                <input
                  value={resume.linkedin}
                  onChange={(event) => updateField("linkedin", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </FormField>
              <FormField label="GitHub">
                <input
                  value={safeResume.github}
                  onChange={(event) => updateField("github", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </FormField>
            </div>

            <FormField label="Professional Summary">
              <textarea
                value={resume.summary}
                onChange={(event) => updateField("summary", event.target.value)}
                rows={4}
                className="min-h-[130px] w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </FormField>

            <div className="space-y-4">
              <SectionHeader title="Education" icon={Building} />
              {resume.education.map((item, index) => (
                <div key={index} className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-900">Entry {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="rounded-xl bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Institution">
                      <input
                        value={item.institution}
                        onChange={(event) => updateEducation(index, "institution", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </FormField>
                    <FormField label="Degree">
                      <input
                        value={item.degree}
                        onChange={(event) => updateEducation(index, "degree", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </FormField>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Dates">
                      <input
                        value={item.dates}
                        onChange={(event) => updateEducation(index, "dates", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </FormField>
                    <FormField label="Description">
                      <input
                        value={item.description}
                        onChange={(event) => updateEducation(index, "description", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </FormField>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addEducation}
                className="inline-flex items-center gap-2 rounded-3xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <FilePlus className="h-4 w-4" />
                Add Education
              </button>
            </div>

            <div className="space-y-4">
              <SectionHeader title="Experience" icon={Briefcase} />
              {resume.experience.map((item, index) => (
                <div key={index} className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-900">Entry {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="rounded-xl bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Role">
                      <input
                        value={item.role}
                        onChange={(event) => updateExperience(index, "role", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </FormField>
                    <FormField label="Company">
                      <input
                        value={item.company}
                        onChange={(event) => updateExperience(index, "company", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </FormField>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Dates">
                      <input
                        value={item.dates}
                        onChange={(event) => updateExperience(index, "dates", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </FormField>
                    <FormField label="Description">
                      <input
                        value={item.description}
                        onChange={(event) => updateExperience(index, "description", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </FormField>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addExperience}
                className="inline-flex items-center gap-2 rounded-3xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <FilePlus className="h-4 w-4" />
                Add Experience
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Skills (comma separated)">
                <input
                  value={skillsText}
                  onChange={(event) => setSkills(event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </FormField>
              <FormField label="Languages (comma separated)">
                <input
                  value={languagesText}
                  onChange={(event) => setLanguages(event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Achievements</p>
                    <p className="text-sm text-slate-500">Add one point per field.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addAchievement}
                    className="inline-flex items-center gap-2 rounded-3xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                  >
                    <FilePlus className="h-3.5 w-3.5" />
                    Add Achievement
                  </button>
                </div>
                <div className="space-y-3">
                  {(resume.achievements.length ? resume.achievements : [""]).map((item, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-3">
                      <textarea
                        value={item}
                        onChange={(event) => updateAchievement(index, event.target.value)}
                        placeholder="Built agent farm, led AI hackathon team"
                        rows={2}
                        className="min-h-[56px] flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                      <button
                        type="button"
                        onClick={() => removeAchievement(index)}
                        className="rounded-3xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Extracurriculars</p>
                    <p className="text-sm text-slate-500">Add one point per field.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addExtracurricular}
                    className="inline-flex items-center gap-2 rounded-3xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                  >
                    <FilePlus className="h-3.5 w-3.5" />
                    Add Activity
                  </button>
                </div>
                <div className="space-y-3">
                  {(resume.extracurriculars.length ? resume.extracurriculars : [""]).map((item, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-3">
                      <textarea
                        value={item}
                        onChange={(event) => updateExtracurricular(index, event.target.value)}
                        placeholder="Volunteer mentor, hackathon winner"
                        rows={2}
                        className="min-h-[56px] flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                      <button
                        type="button"
                        onClick={() => removeExtracurricular(index)}
                        className="rounded-3xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={resetResume}
                className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <Sparkles className="h-4 w-4" />
                Reset to Default
              </button>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-2 rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <ClipboardList className="h-4 w-4" />
                  Copy Resume
                </button>
                <button
                  type="button"
                  onClick={exportToPdf}
                  className="inline-flex items-center gap-2 rounded-3xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={exportToText}
                  className="inline-flex items-center gap-2 rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Download className="h-4 w-4" />
                  Export Text
                </button>
              </div>
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
          >
            <div className="mb-6 flex items-center gap-3 rounded-3xl bg-blue-600/10 p-4 text-blue-100">
              <User className="h-5 w-5" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Live Preview</p>
                <p className="text-sm text-slate-100">What your resume will look like</p>
              </div>
            </div>

            <div className="space-y-5 text-slate-100">
              <div>
                <p className="text-2xl font-semibold">{resume.fullName}</p>
                <p className="mt-2 text-sm text-slate-300">{resume.email} | {resume.phone}</p>
                <p className="text-sm text-slate-300">{safeResume.linkedin}</p>
                {safeResume.github && <p className="text-sm text-slate-300">{safeResume.github}</p>}
              </div>
              {showSummary && (
                <div>
                  <p className="mb-2 text-sm uppercase tracking-[0.24em] text-slate-400">Summary</p>
                  <p className="text-sm leading-6 text-slate-200">{safeResume.summary}</p>
                </div>
              )}
              {showEducation && (
                <div>
                  <p className="mb-3 text-sm uppercase tracking-[0.24em] text-slate-400">Education</p>
                  <div className="space-y-4">
                    {safeResume.education
                      .filter((item) => item.institution || item.degree || item.dates || item.description)
                      .map((item, index) => (
                        <div key={index} className="rounded-3xl bg-slate-900/80 p-4">
                          <p className="text-sm font-semibold text-white">{item.institution}</p>
                          <p className="mt-1 text-sm text-slate-300">{item.degree} · {item.dates}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              {showExperience && (
                <div>
                  <p className="mb-3 text-sm uppercase tracking-[0.24em] text-slate-400">Experience</p>
                  <div className="space-y-4">
                    {safeResume.experience
                      .filter((item) => item.role || item.company || item.dates || item.description)
                      .map((item, index) => (
                        <div key={index} className="rounded-3xl bg-slate-900/80 p-4">
                          <p className="text-sm font-semibold text-white">{item.role}</p>
                          <p className="mt-1 text-sm text-slate-300">{item.company} · {item.dates}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              {showAchievements && (
                <div>
                  <p className="mb-3 text-sm uppercase tracking-[0.24em] text-slate-400">Achievements</p>
                  <div className="space-y-3 rounded-3xl bg-slate-900/80 p-4">
                    <ul className="list-disc space-y-2 pl-5 text-sm text-slate-200">
                      {safeResume.achievements.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {showExtracurriculars && (
                <div>
                  <p className="mb-3 text-sm uppercase tracking-[0.24em] text-slate-400">Extracurriculars</p>
                  <div className="space-y-3 rounded-3xl bg-slate-900/80 p-4">
                    <ul className="list-disc space-y-2 pl-5 text-sm text-slate-200">
                      {safeResume.extracurriculars.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {(showSkills || showLanguages) && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {showSkills && (
                    <div className="rounded-3xl bg-slate-900/80 p-4">
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Skills</p>
                      <p className="mt-2 text-sm text-slate-200">{renderList(safeResume.skills)}</p>
                    </div>
                  )}
                  {showLanguages && (
                    <div className="rounded-3xl bg-slate-900/80 p-4">
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Languages</p>
                      <p className="mt-2 text-sm text-slate-200">{renderList(safeResume.languages)}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm text-slate-600">
      <span className="mb-2 block text-sm font-semibold text-slate-900">{label}</span>
      {children}
    </label>
  );
}

function SectionHeader({ title, icon: Icon }: { title: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-blue-600" />
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
    </div>
  );
}

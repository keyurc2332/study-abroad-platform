import { motion } from "framer-motion";
import { useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Copy,
  Download,
  FileText,
  Loader2,
  PenLine,
  Sparkles,
  Upload,
} from "lucide-react";
import {
  STORAGE_KEYS,
  appendActivity,
  defaultDocuments,
  defaultProfile,
  getDocumentStatusLabel,
  type DocumentItem,
  usePersistentState,
} from "../data/studyAbroadData";
import {
  downloadGeneratedDocument,
  generateAiDocument,
  type AiDocumentType,
} from "../services/aiDocumentApi";

type GeneratableDocument = {
  type: AiDocumentType;
  label: string;
  promptPlaceholder: string;
};

const GENERATABLE_DOCUMENTS: Record<string, GeneratableDocument> = {
  "Statement of Purpose": {
    type: "sop",
    label: "SOP",
    promptPlaceholder: "Example: Make it suitable for MS Computer Science in Canada and highlight AI projects.",
  },
  "Letters of Recommendation": {
    type: "lor",
    label: "LOR",
    promptPlaceholder: "Example: Draft it from my professor's perspective and emphasize research potential.",
  },
  "Resume/CV": {
    type: "resume",
    label: "Resume",
    promptPlaceholder: "Example: Turn my projects and internship into strong bullet points for admissions.",
  },
};

function getGeneratorConfig(documentName: string) {
  const exactMatch = GENERATABLE_DOCUMENTS[documentName];
  if (exactMatch) {
    return exactMatch;
  }

  const normalizedName = documentName.toLowerCase();

  if (normalizedName.includes("statement") || normalizedName.includes("sop")) {
    return GENERATABLE_DOCUMENTS["Statement of Purpose"];
  }

  if (normalizedName.includes("recommendation") || normalizedName.includes("lor")) {
    return GENERATABLE_DOCUMENTS["Letters of Recommendation"];
  }

  if (normalizedName.includes("resume") || normalizedName.includes("cv")) {
    return GENERATABLE_DOCUMENTS["Resume/CV"];
  }

  return null;
}

export default function DocumentChecklist() {
  const [documents, setDocuments] = usePersistentState(STORAGE_KEYS.documents, defaultDocuments);
  const [profile] = usePersistentState(STORAGE_KEYS.profile, defaultProfile);
  const [activeDocumentId, setActiveDocumentId] = useState<number | null>(null);
  const [prompt, setPrompt] = useState("");
  const [rawDetails, setRawDetails] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [generatorMessage, setGeneratorMessage] = useState("");
  const [generatorError, setGeneratorError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const activeDocument = useMemo(
    () => documents.find((document) => document.id === activeDocumentId) ?? null,
    [activeDocumentId, documents],
  );

  const activeGenerator = activeDocument ? getGeneratorConfig(activeDocument.name) : null;

  const toggleDocumentStatus = (id: number) => {
    let nextDocument: DocumentItem | undefined;

    const nextDocuments = documents.map((document) => {
      if (document.id !== id) {
        return document;
      }

      const statuses = ["not-started", "pending", "completed"] as const;
      const currentIndex = statuses.indexOf(document.status);
      const nextStatus = statuses[(currentIndex + 1) % statuses.length];

      nextDocument = {
        ...document,
        status: nextStatus,
        uploadDate: nextStatus === "completed" ? new Date().toISOString().split("T")[0] : null,
      };

      return nextDocument;
    });

    setDocuments(nextDocuments);

    if (nextDocument) {
      appendActivity({
        action: `Marked ${nextDocument.name} as ${getDocumentStatusLabel(nextDocument.status).toLowerCase()}`,
        path: "/documents",
        type: "document",
      });
    }
  };

  const completedCount = documents.filter((document) => document.status === "completed").length;
  const requiredCount = documents.filter((document) => document.required).length;
  const completedRequired = documents.filter(
    (document) => document.required && document.status === "completed",
  ).length;
  const progressPercentage = Math.round((completedRequired / Math.max(requiredCount, 1)) * 100);

  const downloadSummary = () => {
    const lines = [
      "Study Abroad Document Checklist",
      "",
      ...documents.map(
        (document) =>
          `${document.name}: ${getDocumentStatusLabel(document.status)}${
            document.uploadDate ? ` (${document.uploadDate})` : ""
          }`,
      ),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "study-abroad-documents.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const openGenerator = (document: DocumentItem) => {
    const config = getGeneratorConfig(document.name);
    setActiveDocumentId(document.id);
    setGeneratorMessage("");
    setGeneratorError("");
    setGeneratedText("");
    setPrompt(config?.promptPlaceholder.replace("Example: ", "") ?? "");
    setRawDetails("");
  };

  const markGeneratedDocumentReady = (documentId: number) => {
    const date = new Date().toISOString().split("T")[0];
    setDocuments((currentDocuments) =>
      currentDocuments.map((document) =>
        document.id === documentId
          ? { ...document, status: "completed", uploadDate: date }
          : document,
      ),
    );
  };

  const handleGenerate = async () => {
    if (!activeDocument || !activeGenerator) return;

    setGeneratorError("");
    setGeneratorMessage("");

    if (!profile.fullName.trim() && !prompt.trim() && !rawDetails.trim()) {
      setGeneratorError("Add a prompt or details so the AI has enough context.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAiDocument({
        type: activeGenerator.type,
        fullName: profile.fullName,
        email: profile.email,
        targetCountry: profile.preferredCountries[0] || "",
        targetProgram: [profile.desiredDegree, profile.fieldOfStudy].filter(Boolean).join(" "),
        currentEducation: profile.currentEducation,
        fieldOfStudy: profile.fieldOfStudy,
        experience: profile.workExperience,
        achievements: rawDetails,
        projects: rawDetails,
        skills: rawDetails,
        tone: "confident, specific, polished, and natural",
        prompt,
      });

      setGeneratedText(result.generatedText);
      setGeneratorMessage(
        result.warning ||
          `${activeGenerator.label} generated ${result.source === "fallback" ? "from a basic template" : "with AI"}.`,
      );
      appendActivity({
        action: `Generated ${activeGenerator.label}`,
        path: "/documents",
        type: "document",
      });
    } catch (error) {
      setGeneratorError(error instanceof Error ? error.message : "Failed to generate document.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyGenerated = async () => {
    if (!generatedText) return;
    await navigator.clipboard.writeText(generatedText);
    setGeneratorMessage("Copied to clipboard.");
  };

  const handleDownloadGenerated = () => {
    if (!generatedText || !activeDocument || !activeGenerator) return;
    const safeName =
      profile.fullName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") ||
      "study-abroad";
    downloadGeneratedDocument(generatedText, `${safeName}-${activeGenerator.type}.txt`);
    markGeneratedDocumentReady(activeDocument.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <div className="relative overflow-hidden rounded-[28px]">
            <img
              src="https://images.unsplash.com/photo-1641736494066-bd18237ede26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwcGFzc3BvcnQlMjBkb2N1bWVudHMlMjB0cmF2ZWx8ZW58MXx8fHwxNzc2Njc2NzU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Documents"
              className="h-56 w-full object-cover sm:h-64"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700/95 to-indigo-700/90" />
            <div className="absolute inset-0 flex items-center px-5 sm:px-8">
              <div className="max-w-2xl text-white">
                <h1 className="text-3xl sm:text-4xl">Document Checklist</h1>
                <p className="mt-3 text-sm text-blue-100 sm:text-base">
                  Track application documents, rotate status in one tap, and export a quick summary when needed.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 rounded-[24px] bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white shadow-lg sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl">{completedRequired} / {requiredCount}</h2>
              <p className="text-blue-100">Required documents completed</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-3xl">{progressPercentage}%</div>
              <p className="text-sm text-blue-100">Progress</p>
            </div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-blue-400">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="h-full bg-white"
            />
          </div>
          <div className="mt-4 flex flex-col gap-2 text-sm text-blue-100 sm:flex-row sm:items-center sm:justify-between">
            <span>{completedCount} total documents completed</span>
            <button
              onClick={downloadSummary}
              className="inline-flex items-center gap-2 self-start rounded-xl bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20"
            >
              <Download className="h-4 w-4" />
              Download Summary
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6 rounded-[24px] bg-white p-4 shadow-sm"
        >
          <div className="grid gap-3 text-sm sm:grid-cols-2 lg:flex lg:flex-wrap lg:gap-5">
            <Legend icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} label="Completed" />
            <Legend icon={<Circle className="h-4 w-4 text-yellow-600" />} label="In Progress" />
            <Legend icon={<Circle className="h-4 w-4 text-gray-400" />} label="Not Started" />
            <Legend icon={<AlertCircle className="h-4 w-4 text-red-600" />} label="Required" />
          </div>
        </motion.div>

        <div className="space-y-4">
          {documents.map((document, index) => (
            <DocumentCard
              key={document.id}
              document={document}
              index={index}
              activeDocumentId={activeDocumentId}
              activeGenerator={activeGenerator}
              prompt={prompt}
              rawDetails={rawDetails}
              generatedText={generatedText}
              generatorMessage={generatorMessage}
              generatorError={generatorError}
              isGenerating={isGenerating}
              onToggleStatus={toggleDocumentStatus}
              onOpenGenerator={openGenerator}
              onCloseGenerator={() => setActiveDocumentId(null)}
              onPromptChange={setPrompt}
              onRawDetailsChange={setRawDetails}
              onGeneratedTextChange={setGeneratedText}
              onGenerate={handleGenerate}
              onCopyGenerated={handleCopyGenerated}
              onDownloadGenerated={handleDownloadGenerated}
              onDownloadSummary={downloadSummary}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-8 rounded-[24px] border border-blue-200 bg-blue-50 p-5 sm:p-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <FileText className="h-6 w-6 flex-shrink-0 text-blue-600" />
            <div>
              <h3 className="text-gray-900">Document Preparation Tips</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li>Use PDF files whenever possible.</li>
                <li>Keep file sizes under 5MB per document.</li>
                <li>Translate non-English documents and notarize them when required.</li>
                <li>Keep backup copies in cloud storage and offline.</li>
                <li>Double-check university-specific requirements before submitting.</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

type DocumentCardProps = {
  document: DocumentItem;
  index: number;
  activeDocumentId: number | null;
  activeGenerator: GeneratableDocument | null;
  prompt: string;
  rawDetails: string;
  generatedText: string;
  generatorMessage: string;
  generatorError: string;
  isGenerating: boolean;
  onToggleStatus: (id: number) => void;
  onOpenGenerator: (document: DocumentItem) => void;
  onCloseGenerator: () => void;
  onPromptChange: (value: string) => void;
  onRawDetailsChange: (value: string) => void;
  onGeneratedTextChange: (value: string) => void;
  onGenerate: () => void;
  onCopyGenerated: () => void;
  onDownloadGenerated: () => void;
  onDownloadSummary: () => void;
};

function DocumentCard({
  document,
  index,
  activeDocumentId,
  activeGenerator,
  prompt,
  rawDetails,
  generatedText,
  generatorMessage,
  generatorError,
  isGenerating,
  onToggleStatus,
  onOpenGenerator,
  onCloseGenerator,
  onPromptChange,
  onRawDetailsChange,
  onGeneratedTextChange,
  onGenerate,
  onCopyGenerated,
  onDownloadGenerated,
  onDownloadSummary,
}: DocumentCardProps) {
  const generatorConfig = getGeneratorConfig(document.name);
  const isGeneratorOpen = activeDocumentId === document.id && activeGenerator;

  return (
    <motion.article
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: 0.2 + index * 0.04 }}
      className={`rounded-[24px] border p-4 shadow-sm transition-all hover:shadow-md sm:p-5 ${getStatusColor(
        document.status,
      )}`}
    >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <button
                  onClick={() => onToggleStatus(document.id)}
                  className="flex w-full items-center gap-3 rounded-xl bg-white/80 px-3 py-2 text-left hover:bg-white sm:w-auto sm:self-start"
                >
                  {getStatusIcon(document.status)}
                  <span className="text-sm text-gray-700">{getDocumentStatusLabel(document.status)}</span>
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="flex items-center gap-2 text-gray-900">
                        {document.name}
                        {document.required && <AlertCircle className="h-4 w-4 text-red-600" />}
                        {generatorConfig && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                            <Sparkles className="h-3 w-3" />
                            AI
                          </span>
                        )}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">{document.description}</p>
                    </div>
                    {document.uploadDate && (
                      <div className="text-sm text-gray-500 sm:text-right">
                        Uploaded on {new Date(document.uploadDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {generatorConfig && (
                      <button
                        onClick={() => onOpenGenerator(document)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white transition-colors hover:bg-slate-800 sm:w-auto"
                      >
                        <Sparkles className="h-4 w-4" />
                        Generate {generatorConfig.label} with AI
                      </button>
                    )}
                    <button
                      onClick={() => onToggleStatus(document.id)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 sm:w-auto"
                    >
                      <Upload className="h-4 w-4" />
                      {document.status === "completed" ? "Replace Document" : "Update Status"}
                    </button>
                    {document.status === "completed" && (
                      <button
                        onClick={onDownloadSummary}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto"
                      >
                        <Download className="h-4 w-4" />
                        Download Summary
                      </button>
                    )}
                  </div>

                  {isGeneratorOpen && activeGenerator && (
                    <div className="mt-5 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h4 className="flex items-center gap-2 text-sm font-medium text-slate-900">
                            <PenLine className="h-4 w-4 text-blue-600" />
                            Generate {activeGenerator.label}
                          </h4>
                          <p className="mt-1 text-sm text-slate-600">
                            Uses your profile plus any extra details below.
                          </p>
                        </div>
                        <button
                          onClick={onCloseGenerator}
                          className="self-start rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                        >
                          Close
                        </button>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="space-y-3">
                          <label className="block">
                            <span className="mb-2 block text-sm text-slate-600">Prompt</span>
                            <textarea
                              value={prompt}
                              onChange={(event) => onPromptChange(event.target.value)}
                              rows={4}
                              placeholder={activeGenerator.promptPlaceholder}
                              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            />
                          </label>
                          <label className="block">
                            <span className="mb-2 block text-sm text-slate-600">Basic info / rough points</span>
                            <textarea
                              value={rawDetails}
                              onChange={(event) => onRawDetailsChange(event.target.value)}
                              rows={6}
                              placeholder="Paste achievements, projects, internships, recommender details, or anything the AI should use. One point per line works best."
                              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            />
                          </label>
                          {generatorError && (
                            <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{generatorError}</p>
                          )}
                          {generatorMessage && (
                            <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-700">{generatorMessage}</p>
                          )}
                          <button
                            onClick={onGenerate}
                            disabled={isGenerating}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                          >
                            {isGenerating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                            {isGenerating ? "Generating..." : `Generate ${activeGenerator.label}`}
                          </button>
                        </div>

                        <div>
                          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-sm text-slate-600">Editable output</span>
                            <div className="flex gap-2">
                              <button
                                onClick={onCopyGenerated}
                                disabled={!generatedText}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:border-blue-300 hover:text-blue-700 disabled:opacity-50 sm:flex-none"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                Copy
                              </button>
                              <button
                                onClick={onDownloadGenerated}
                                disabled={!generatedText}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:border-blue-300 hover:text-blue-700 disabled:opacity-50 sm:flex-none"
                              >
                                <Download className="h-3.5 w-3.5" />
                                Download
                              </button>
                            </div>
                          </div>
                          <textarea
                            value={generatedText}
                            onChange={(event) => onGeneratedTextChange(event.target.value)}
                            rows={16}
                            placeholder={`Generated ${activeGenerator.label} will appear here.`}
                            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.article>
  );
}

function getStatusIcon(status: DocumentItem["status"]) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case "pending":
      return <Circle className="h-5 w-5 text-yellow-600" />;
    default:
      return <Circle className="h-5 w-5 text-gray-400" />;
  }
}

function getStatusColor(status: DocumentItem["status"]) {
  switch (status) {
    case "completed":
      return "border-green-200 bg-green-50";
    case "pending":
      return "border-yellow-200 bg-yellow-50";
    default:
      return "border-gray-200 bg-white";
  }
}

type LegendProps = {
  icon: ReactNode;
  label: string;
};

function Legend({ icon, label }: LegendProps) {
  return (
    <div className="flex items-center gap-2 text-gray-700">
      {icon}
      <span>{label}</span>
    </div>
  );
}

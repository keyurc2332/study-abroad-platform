import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Download,
  FileText,
  Upload,
} from "lucide-react";
import {
  STORAGE_KEYS,
  appendActivity,
  defaultDocuments,
  getDocumentStatusLabel,
  type DocumentItem,
  usePersistentState,
} from "../data/studyAbroadData";

export default function DocumentChecklist() {
  const [documents, setDocuments] = usePersistentState(STORAGE_KEYS.documents, defaultDocuments);

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
          <div className="flex flex-wrap gap-5 text-sm">
            <Legend icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} label="Completed" />
            <Legend icon={<Circle className="h-4 w-4 text-yellow-600" />} label="In Progress" />
            <Legend icon={<Circle className="h-4 w-4 text-gray-400" />} label="Not Started" />
            <Legend icon={<AlertCircle className="h-4 w-4 text-red-600" />} label="Required" />
          </div>
        </motion.div>

        <div className="space-y-4">
          {documents.map((document, index) => (
            <motion.article
              key={document.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.2 + index * 0.04 }}
              className={`rounded-[24px] border p-4 shadow-sm transition-all hover:shadow-md sm:p-5 ${getStatusColor(
                document.status,
              )}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <button
                  onClick={() => toggleDocumentStatus(document.id)}
                  className="flex items-center gap-3 self-start rounded-xl bg-white/80 px-3 py-2 text-left hover:bg-white"
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
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">{document.description}</p>
                    </div>
                    {document.uploadDate && (
                      <div className="text-sm text-gray-500">
                        Uploaded on {new Date(document.uploadDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => toggleDocumentStatus(document.id)}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                    >
                      <Upload className="h-4 w-4" />
                      {document.status === "completed" ? "Replace Document" : "Update Status"}
                    </button>
                    {document.status === "completed" && (
                      <button
                        onClick={downloadSummary}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <Download className="h-4 w-4" />
                        Download Summary
                      </button>
                    )}
                    {document.name === "Resume/CV" && (
                      <Link
                        to="/resume-builder"
                        className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 transition-colors hover:bg-blue-100"
                      >
                        <FileText className="h-4 w-4" />
                        Open Resume Builder
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-8 rounded-[24px] border border-blue-200 bg-blue-50 p-5 sm:p-6"
        >
          <div className="flex gap-3">
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

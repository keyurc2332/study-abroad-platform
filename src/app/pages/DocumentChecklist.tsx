import { motion } from "motion/react";
import { useState } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  Circle,
  Download,
  AlertCircle,
  Calendar,
} from "lucide-react";

export default function DocumentChecklist() {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Academic Transcripts",
      description: "Official transcripts from all institutions attended",
      status: "completed",
      required: true,
      uploadDate: "2026-04-01",
    },
    {
      id: 2,
      name: "Passport Copy",
      description: "Valid passport with at least 6 months validity",
      status: "completed",
      required: true,
      uploadDate: "2026-03-28",
    },
    {
      id: 3,
      name: "English Proficiency Test",
      description: "IELTS, TOEFL, or equivalent test scores",
      status: "completed",
      required: true,
      uploadDate: "2026-04-05",
    },
    {
      id: 4,
      name: "Statement of Purpose",
      description: "Personal essay explaining your academic goals",
      status: "completed",
      required: true,
      uploadDate: "2026-04-10",
    },
    {
      id: 5,
      name: "Letters of Recommendation",
      description: "2-3 letters from professors or employers",
      status: "completed",
      required: true,
      uploadDate: "2026-04-08",
    },
    {
      id: 6,
      name: "Resume/CV",
      description: "Updated resume highlighting relevant experience",
      status: "pending",
      required: true,
      uploadDate: null,
    },
    {
      id: 7,
      name: "Financial Documents",
      description: "Bank statements or sponsorship letters",
      status: "pending",
      required: true,
      uploadDate: null,
    },
    {
      id: 8,
      name: "Standardized Test Scores",
      description: "GRE/GMAT scores if required by university",
      status: "pending",
      required: false,
      uploadDate: null,
    },
    {
      id: 9,
      name: "Portfolio",
      description: "For creative or design programs",
      status: "pending",
      required: false,
      uploadDate: null,
    },
    {
      id: 10,
      name: "Copy of Degree Certificate",
      description: "Bachelor's degree or equivalent",
      status: "pending",
      required: true,
      uploadDate: null,
    },
    {
      id: 11,
      name: "Visa Application Form",
      description: "Completed visa application",
      status: "not-started",
      required: true,
      uploadDate: null,
    },
    {
      id: 12,
      name: "Medical Certificate",
      description: "Health clearance certificate",
      status: "not-started",
      required: true,
      uploadDate: null,
    },
  ]);

  const toggleDocumentStatus = (id: number) => {
    setDocuments(
      documents.map((doc) => {
        if (doc.id === id) {
          const statuses = ["not-started", "pending", "completed"];
          const currentIndex = statuses.indexOf(doc.status);
          const nextStatus = statuses[(currentIndex + 1) % statuses.length];
          return {
            ...doc,
            status: nextStatus,
            uploadDate: nextStatus === "completed" ? new Date().toISOString().split("T")[0] : null,
          };
        }
        return doc;
      })
    );
  };

  const completedCount = documents.filter((d) => d.status === "completed").length;
  const requiredCount = documents.filter((d) => d.required).length;
  const completedRequired = documents.filter((d) => d.required && d.status === "completed").length;
  const progressPercentage = Math.round((completedRequired / requiredCount) * 100);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Circle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-200";
      case "pending":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-white border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Image */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative h-48 rounded-lg overflow-hidden mb-6">
            <img 
              src="https://images.unsplash.com/photo-1641736494066-bd18237ede26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwcGFzc3BvcnQlMjBkb2N1bWVudHMlMjB0cmF2ZWx8ZW58MXx8fHwxNzc2Njc2NzU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Documents"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 flex items-center justify-center text-white">
              <div className="text-center">
                <h1 className="text-4xl mb-2">Document Checklist</h1>
                <p className="text-lg text-blue-100">Track your application documents and ensure everything is ready</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl mb-1">{completedRequired} / {requiredCount}</h2>
              <p className="text-blue-100">Required documents completed</p>
            </div>
            <div className="text-right">
              <div className="text-3xl">{progressPercentage}%</div>
              <p className="text-sm text-blue-100">Progress</p>
            </div>
          </div>
          <div className="h-3 bg-blue-400 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-white"
            />
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-4 mb-6"
        >
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-yellow-600" />
              <span className="text-gray-700">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">Not Started</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-gray-700">Required</span>
            </div>
          </div>
        </motion.div>

        {/* Document List */}
        <div className="space-y-4">
          {documents.map((document, index) => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
              className={`border rounded-lg p-5 transition-all hover:shadow-md ${getStatusColor(
                document.status
              )}`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleDocumentStatus(document.id)}
                  className="mt-1 hover:scale-110 transition-transform"
                >
                  {getStatusIcon(document.status)}
                </button>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-gray-900 flex items-center gap-2">
                        {document.name}
                        {document.required && (
                          <span className="text-red-600 text-xs">
                            <AlertCircle className="w-4 h-4" />
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{document.description}</p>
                    </div>
                  </div>

                  {document.uploadDate && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <Calendar className="w-3 h-3" />
                      Uploaded on {new Date(document.uploadDate).toLocaleDateString()}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {document.status === "completed" ? (
                      <>
                        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                          <Upload className="w-4 h-4" />
                          Replace
                        </button>
                      </>
                    ) : (
                      <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload Document
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8"
        >
          <div className="flex gap-3">
            <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="text-gray-900 mb-2">Document Preparation Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Ensure all documents are in PDF format</li>
                <li>• Keep file sizes under 5MB per document</li>
                <li>• Translate non-English documents and get them notarized</li>
                <li>• Make multiple copies and keep them in a secure location</li>
                <li>• Check specific university requirements as they may vary</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

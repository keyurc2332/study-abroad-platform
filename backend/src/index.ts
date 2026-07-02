import express from "express";
import cors from "cors";
import helmet from "helmet";
import fs from "fs";
import path from "path";
import profileRouter from "./routes/profile";
import universityRouter from "./routes/university";
import recommendationRouter from "./routes/recommendation";
import checklistRouter from "./routes/checklist";
import countryRouter from "./routes/country";
import dashboardRouter from "./routes/dashboard";
import scholarshipRouter from "./routes/scholarship";
import testPrepRouter from "./routes/testPrep";
import loanRouter from "./routes/loan";
import visaRouter from "./routes/visa";
import applicationRouter from "./routes/application";
import resumeRoutes from "./routes/resume";
import aiDocumentRouter from "./routes/aiDocument";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const frontendDistPath = [
  path.resolve(__dirname, "../../frontend/dist"),
  path.resolve(__dirname, "../../../frontend/dist"),
  path.resolve(process.cwd(), "../frontend/dist"),
].find((candidate) => fs.existsSync(path.join(candidate, "index.html")));

app.use(cors({ origin: "*" }));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json({ limit: "10mb" }));

app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/universities", universityRouter);
app.use("/api/v1/recommendations", recommendationRouter);
app.use("/api/v1/checklist", checklistRouter);
app.use("/api/v1/countries", countryRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/scholarships", scholarshipRouter);
app.use("/api/v1/test-prep", testPrepRouter); 
app.use("/api/v1/loans", loanRouter);
app.use("/api/v1/visa", visaRouter);
app.use("/api/v1/applications", applicationRouter);
app.use("/api/v1/resume", resumeRoutes); 
app.use("/api/v1/ai-documents", aiDocumentRouter);

app.get("/api/health", (req, res) => {
  res.json({ message: "Study Abroad API is running", version: "1.0.0" });
});

if (frontendDistPath) {
  app.use(express.static(frontendDistPath));
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.status(503).json({
      message: "Frontend build not found. Run `npm run build` in the frontend folder first.",
      api: "Study Abroad API is running",
      version: "1.0.0",
    });
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

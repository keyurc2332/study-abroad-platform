import express from "express";
import cors from "cors";
import helmet from "helmet";
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

import dotenv from "dotenv";
dotenv.config();

const app = express();

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


app.get("/", (req, res) => {
  res.json({ message: "Study Abroad API is running", version: "1.0.0" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
import express from "express";
import cors from "cors";
import helmet from "helmet";
import profileRouter from "./routes/profile";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/api/v1/profile", profileRouter);

app.get("/", (req, res) => {
  res.json({ message: "Study Abroad API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
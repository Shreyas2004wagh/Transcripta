import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import type { Request, Response } from "express";

import transcriptRoutes from "./routes/transcript";
import summarizeRoutes from "./routes/summarize";
import qnaRoutes from "./routes/qna";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const JSON_BODY_LIMIT = process.env.JSON_BODY_LIMIT || "1mb";
const DEFAULT_CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];
const ALLOWED_CORS_ORIGINS = (process.env.CORS_ORIGIN || DEFAULT_CORS_ORIGINS.join(","))
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_CORS_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS"));
    },
  })
);
app.use(express.json({ limit: JSON_BODY_LIMIT }));

app.use("/api/transcript", transcriptRoutes);
app.use("/api/summarize", summarizeRoutes);
app.use("/api/qna", qnaRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Transcripta backend running" });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

export default app;

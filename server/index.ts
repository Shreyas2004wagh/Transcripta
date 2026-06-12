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

app.use(cors());
app.use(express.json());

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

import express, { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();
const MAX_SUMMARY_CHARS = Number(process.env.MAX_SUMMARY_CHARS) || 120000;

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unknown error";

router.post("/", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Transcript text is required." });
    }

    if (text.length > MAX_SUMMARY_CHARS) {
      return res.status(413).json({
        error: "Transcript text is too long to summarize.",
        details: `Maximum supported length is ${MAX_SUMMARY_CHARS} characters.`,
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `Summarize the following YouTube video transcript. Provide a concise summary that captures the main points and key takeaways. Format the output with a main summary paragraph followed by a bulleted list of key points. Transcript:\n\n"${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    res.json({ summary });

  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({
      error: "Failed to generate summary from AI model.",
      details: getErrorMessage(error)
    });
  }
});

export default router;

import express, { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();
const MAX_QNA_TRANSCRIPT_CHARS = Number(process.env.MAX_QNA_TRANSCRIPT_CHARS) || 120000;
const MAX_QNA_QUESTION_CHARS = Number(process.env.MAX_QNA_QUESTION_CHARS) || 1000;

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unknown error";

// POST /api/qna - Answer a question based on a transcript
router.post("/", async (req: Request, res: Response) => {
  try {
    const { transcript, question } = req.body;

    if (
      !transcript ||
      !question ||
      typeof transcript !== "string" ||
      typeof question !== "string"
    ) {
      return res.status(400).json({ error: "Transcript and question are required." });
    }

    if (transcript.length > MAX_QNA_TRANSCRIPT_CHARS) {
      return res.status(413).json({
        error: "Transcript is too long for Q&A.",
        details: `Maximum supported transcript length is ${MAX_QNA_TRANSCRIPT_CHARS} characters.`,
      });
    }

    if (question.length > MAX_QNA_QUESTION_CHARS) {
      return res.status(413).json({
        error: "Question is too long.",
        details: `Maximum supported question length is ${MAX_QNA_QUESTION_CHARS} characters.`,
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
      You are an expert Q&A assistant. Your task is to answer the user's question based *only* on the provided video transcript.
      - Read the transcript carefully.
      - Answer the user's question concisely using only information found within the text.
      - If the answer is not present in the transcript, you must explicitly state: "The answer to that question isn't available in the video's transcript."
      - Do not use any external knowledge.

      ---
      TRANSCRIPT:
      """
      ${transcript}
      """
      ---
      QUESTION:
      "${question}"
      ---
      ANSWER:
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    res.json({ answer });

  } catch (error) {
    console.error("Gemini API Q&A error:", error);
    res.status(500).json({
      error: "Failed to get an answer from the AI model.",
      details: getErrorMessage(error)
    });
  }
});

export default router;

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

// POST /api/qna - Answer a question based on a transcript
router.post('/', async (req, res) => {
  try {
    const { transcript, question } = req.body;

    if (!transcript || !question) {
      return res.status(400).json({ error: 'Transcript and question are required.' });
    }

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
    console.error('Gemini API Q&A error:', error);
    res.status(500).json({
      error: 'Failed to get an answer from the AI model.',
      details: error.message
    });
  }
});

module.exports = router;
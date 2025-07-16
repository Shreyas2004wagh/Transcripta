const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Transcript text is required.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const prompt = `Summarize the following YouTube video transcript. Provide a concise summary that captures the main points and key takeaways. Format the output with a main summary paragraph followed by a bulleted list of key points. Transcript:\n\n"${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    res.json({ summary });

  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({
      error: 'Failed to generate summary from AI model.',
      details: error.message
    });
  }
});

module.exports = router;
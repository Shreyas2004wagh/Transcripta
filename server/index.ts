const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // <-- Add this line

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const transcriptRoutes = require('./routes/transcript');
const summarizeRoutes = require('./routes/summarize'); 
const qnaRoutes = require('./routes/qna');
app.use('/api/transcript', transcriptRoutes);
app.use('/api/summarize', summarizeRoutes); 
app.use('/api/qna', qnaRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Transcripta backend running 🚀' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

module.exports = app;
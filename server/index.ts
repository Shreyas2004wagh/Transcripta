import express from 'express';

const app = express();
const PORT = 3001;

app.get('/', (req, res) => {
  res.send('Transcripta backend running 🚀');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

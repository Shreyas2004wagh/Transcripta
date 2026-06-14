# Transcripta

Transcripta is a full-stack web app that extracts English transcripts from YouTube videos, makes the transcript searchable, generates an AI summary, and lets users ask questions about the video using the transcript as context.

The app has two parts:

- `client/`: React + Vite + Tailwind frontend.
- `server/`: Express + TypeScript API that calls `yt-dlp` for captions and Google Gemini for AI summary/Q&A.

## Features

- Extracts YouTube video metadata and English subtitles with `yt-dlp`.
- Displays video title, thumbnail, channel, duration, and timestamped transcript.
- Searches inside the transcript with highlighted matches.
- Generates a Gemini-powered summary from the transcript.
- Answers questions using only the extracted transcript.
- Supports configurable API URL and backend port through environment variables.

## Prerequisites

- Node.js 18 or newer.
- npm.
- A Google Gemini API key.
- `yt-dlp` available in one of these ways:
  - keep `server/yt-dlp.exe` in place,
  - install `yt-dlp` on your system PATH,
  - or set `YTDLP_PATH` in `server/.env`.

## Setup

Install and configure the backend:

```bash
cd server
npm install
copy .env.example .env
```

Edit `server/.env` and set:

```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
```

If `yt-dlp` is not in `server/yt-dlp.exe` or on your PATH, also set:

```env
YTDLP_PATH=C:\path\to\yt-dlp.exe
```

Install and configure the frontend:

```bash
cd ../client
npm install
copy .env.example .env.local
```

`client/.env.local` can usually stay as:

```env
VITE_API_BASE_URL=http://localhost:3001
```

## Running Locally

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

Open the Vite URL shown in the frontend terminal, usually:

```text
http://localhost:5173
```

## Production Build

Build and run the backend:

```bash
cd server
npm run build
npm start
```

Build and preview the frontend:

```bash
cd client
npm run build
npm run preview
```

For deployment, serve `client/dist` with your static hosting provider and run the Express server separately. Set `VITE_API_BASE_URL` to the deployed backend URL before building the frontend.

## Environment Variables

Backend (`server/.env`):

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `PORT` | No | `3001` | Express server port. |
| `GEMINI_API_KEY` | Yes | none | Google Gemini API key used for summary and Q&A. |
| `CORS_ORIGIN` | No | local Vite origins | Comma-separated list of frontend origins allowed to call the API. |
| `JSON_BODY_LIMIT` | No | `1mb` | Maximum accepted JSON request body size. |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | API rate-limit window in milliseconds. |
| `RATE_LIMIT_MAX_REQUESTS` | No | `60` | Maximum API requests allowed per IP per window. |
| `YTDLP_PATH` | No | auto-detected | Absolute path to `yt-dlp` or `yt-dlp.exe`. |

Frontend (`client/.env.local`):

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | No | `http://localhost:3001` | Backend API base URL used by the React app. |

## API Endpoints

Backend base URL: `http://localhost:3001`

- `GET /health`  
  Returns backend health status.

- `POST /api/transcript`  
  Body:
  ```json
  { "url": "https://www.youtube.com/watch?v=VIDEO_ID" }
  ```
  Returns video metadata, timestamped subtitles, and `fullText`.

- `POST /api/summarize`  
  Body:
  ```json
  { "text": "Transcript text..." }
  ```
  Returns a Gemini-generated summary.

- `POST /api/qna`  
  Body:
  ```json
  {
    "transcript": "Transcript text...",
    "question": "What is the main point?"
  }
  ```
  Returns an answer grounded in the transcript.

## Project Structure

```text
Transcripta/
  client/
    src/
      App.tsx
      main.tsx
    package.json
  server/
    routes/
      transcript.ts
      summarize.ts
      qna.ts
    index.ts
    yt-dlp.exe
    package.json
  README.md
```

## Troubleshooting

- `GEMINI_API_KEY is not configured.`  
  Create `server/.env` and add a valid Gemini API key.

- `Failed to extract transcript` or `yt-dlp` not found  
  Confirm `server/yt-dlp.exe` exists, install `yt-dlp` on PATH, or set `YTDLP_PATH`.

- `No English subtitles found for this video`  
  The video may not have English manual or auto-generated captions.

- Frontend cannot reach backend  
  Make sure the server is running on `PORT=3001`, or update `VITE_API_BASE_URL` in `client/.env.local`.

## Notes and Limitations

- Transcript extraction currently targets English subtitles only.
- The app does not store transcripts in a database.
- Q&A and summaries depend on the Gemini API and may fail if the key is missing, invalid, or rate-limited.
- Do not commit real `.env` files or API keys.

import { execFileSync } from "child_process";
import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

interface Subtitle {
  start: number;
  end: number;
  text: string;
}

interface VideoInfo {
  title?: string;
  duration?: number;
  uploader?: string;
  channel?: string;
  thumbnail?: string;
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
};

const getProcessErrorOutput = (error: unknown) => {
  if (
    error &&
    typeof error === "object" &&
    "stderr" in error &&
    Buffer.isBuffer((error as { stderr?: unknown }).stderr)
  ) {
    return (error as { stderr: Buffer }).stderr.toString("utf8").trim();
  }

  return getErrorMessage(error);
};

const resolveYtDlpPath = () => {
  if (process.env.YTDLP_PATH) {
    return process.env.YTDLP_PATH;
  }

  const candidates = [
    path.resolve(process.cwd(), "yt-dlp.exe"),
    path.resolve(__dirname, "..", "yt-dlp.exe"),
    path.resolve(__dirname, "..", "..", "yt-dlp.exe"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) || "yt-dlp";
};

const isValidYouTubeUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");
    return ["youtube.com", "m.youtube.com", "youtu.be"].includes(hostname);
  } catch {
    return false;
  }
};

const extractVideoId = (url: string) => {
  const patterns = [
    /youtube\.com\/watch\?.*[?&]?v=([^"&?/\s]{11})/,
    /youtube\.com\/embed\/([^"&?/\s]{11})/,
    /youtube\.com\/v\/([^"&?/\s]{11})/,
    /youtube\.com\/shorts\/([^"&?/\s]{11})/,
    /youtu\.be\/([^"&?/\s]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
};

const parseTimestamp = (timestamp: string) => {
  const cleanTimestamp = timestamp.split(/\s+/)[0];
  const parts = cleanTimestamp.split(":");
  const seconds = Number.parseFloat(parts[parts.length - 1] || "0");
  const minutes = Number.parseInt(parts[parts.length - 2] || "0", 10);
  const hours = Number.parseInt(parts[parts.length - 3] || "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
};

const formatTimestamp = (secondsValue = 0) => {
  const totalSeconds = Math.max(0, Math.floor(secondsValue));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const cleanSubtitleText = (text: string) =>
  text
    .replace(/<\d{2}:\d{2}:\d{2}\.\d{3}>/g, "")
    .replace(/<\/?c[^>]*>/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const parseSubtitles = (content: string) => {
  const lines = content.split(/\r?\n/);
  const subtitles: Subtitle[] = [];
  let currentSubtitle: Subtitle | null = null;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();

    if (
      !line ||
      line.startsWith("WEBVTT") ||
      line.startsWith("Kind:") ||
      line.startsWith("Language:")
    ) {
      continue;
    }

    if (line.includes("-->")) {
      const [start, end] = line.split("-->").map((timestamp) => timestamp.trim());
      currentSubtitle = {
        start: parseTimestamp(start),
        end: parseTimestamp(end),
        text: "",
      };
      continue;
    }

    if (currentSubtitle && !/^\d+$/.test(line)) {
      currentSubtitle.text += `${currentSubtitle.text ? " " : ""}${line}`;

      const nextLine = lines[i + 1]?.trim() || "";
      if (i === lines.length - 1 || !nextLine || nextLine.includes("-->")) {
        const text = cleanSubtitleText(currentSubtitle.text);
        if (text) {
          subtitles.push({ ...currentSubtitle, text });
        }
        currentSubtitle = null;
      }
    }
  }

  return subtitles;
};

const listSubtitleFiles = (tempDir: string, videoId: string) =>
  fs
    .readdirSync(tempDir)
    .filter((file) => file.startsWith(videoId) && file.endsWith(".vtt"));

const removeTempFiles = (tempDir: string, videoId: string) => {
  if (!fs.existsSync(tempDir)) {
    return;
  }

  for (const file of fs.readdirSync(tempDir)) {
    if (file.startsWith(videoId)) {
      fs.rmSync(path.join(tempDir, file), { force: true });
    }
  }
};

router.post("/", async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "YouTube URL is required" });
  }

  if (!isValidYouTubeUrl(url)) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    return res.status(400).json({ error: "Could not extract video ID from URL" });
  }

  const ytdlpPath = resolveYtDlpPath();
  if (process.env.YTDLP_PATH && !fs.existsSync(ytdlpPath)) {
    return res.status(500).json({
      error: "Configured yt-dlp executable was not found",
      details: `Expected at: ${ytdlpPath}`,
    });
  }

  const tempDir = path.resolve(process.cwd(), "temp");
  fs.mkdirSync(tempDir, { recursive: true });
  const outputPath = path.join(tempDir, `${videoId}.%(ext)s`);

  try {
    const infoOutput = execFileSync(
      ytdlpPath,
      ["--dump-json", "--no-download", url],
      { encoding: "utf8" }
    );
    const videoInfo = JSON.parse(infoOutput) as VideoInfo;

    execFileSync(
      ytdlpPath,
      [
        "--write-auto-sub",
        "--write-sub",
        "--sub-lang",
        "en",
        "--sub-format",
        "vtt",
        "--skip-download",
        "-o",
        outputPath,
        url,
      ],
      { encoding: "utf8" }
    );

    const subtitleFiles = listSubtitleFiles(tempDir, videoId);

    if (subtitleFiles.length === 0) {
      return res.status(404).json({
        error: "No English subtitles found for this video",
        videoInfo: {
          title: videoInfo.title,
          duration: videoInfo.duration,
          channel: videoInfo.uploader || videoInfo.channel,
        },
      });
    }

    const subtitlePath = path.join(tempDir, subtitleFiles[0]);
    const subtitleContent = fs.readFileSync(subtitlePath, "utf8");
    const subtitles = parseSubtitles(subtitleContent);
    const duration = Number(videoInfo.duration) || 0;

    return res.json({
      id: videoId,
      url,
      title: videoInfo.title || "Untitled video",
      duration,
      durationFormatted: formatTimestamp(duration),
      channel: videoInfo.uploader || videoInfo.channel || "Unknown channel",
      thumbnail: videoInfo.thumbnail || "",
      subtitles: subtitles.map((subtitle) => ({
        start: subtitle.start,
        end: subtitle.end,
        startFormatted: formatTimestamp(subtitle.start),
        endFormatted: formatTimestamp(subtitle.end),
        text: subtitle.text,
      })),
      fullText: subtitles.map((subtitle) => subtitle.text).join(" "),
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    const details = getProcessErrorOutput(error);
    console.error("Transcript extraction error:", details);

    if (details.includes("Video unavailable")) {
      return res.status(404).json({ error: "Video not found or unavailable" });
    }

    if (details.includes("Private video")) {
      return res.status(403).json({ error: "Video is private" });
    }

    return res.status(500).json({
      error: "Failed to extract transcript",
      details,
    });
  } finally {
    removeTempFiles(tempDir, videoId);
  }
});

router.get("/:id", (req: Request, res: Response) => {
  res.status(404).json({
    error: "Transcript not found",
    message: "Database integration is not implemented.",
  });
});

export default router;

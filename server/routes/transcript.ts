const express = require('express');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Path to yt-dlp.exe in the server directory
const YTDLP_PATH = 'C:\\Users\\SHREYAS WAGH\\OneDrive\\Desktop\\Transcripta\\server\\yt-dlp.exe';
console.log('Looking for yt-dlp.exe at:', YTDLP_PATH);
console.log('Current directory (__dirname):', __dirname);

// Helper function to validate YouTube URL
function isValidYouTubeUrl(url) {
  const regex = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)/;
  return regex.test(url);
}

// Helper function to extract video ID from YouTube URL
function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Helper function to parse VTT/SRT subtitle files
function parseSubtitles(content) {
  const lines = content.split('\n');
  const subtitles = [];
  let currentSubtitle = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and WebVTT header
    if (!line || line.startsWith('WEBVTT') || line.startsWith('Kind:') || line.startsWith('Language:')) {
      continue;
    }

    // Check if line contains timestamp (format: 00:00:00.000 --> 00:00:00.000)
    if (line.includes('-->')) {
      const [start, end] = line.split('-->').map(t => t.trim());
      currentSubtitle = {
        start: parseTimestamp(start),
        end: parseTimestamp(end),
        text: ''
      };
    } else if (currentSubtitle && line && !line.match(/^\d+$/)) {
      // This is subtitle text (skip sequence numbers)
      currentSubtitle.text += (currentSubtitle.text ? ' ' : '') + line;
      
      // Check if this is the end of current subtitle
      if (i === lines.length - 1 || lines[i + 1].trim() === '' || lines[i + 1].includes('-->')) {
        if (currentSubtitle.text) {
          subtitles.push(currentSubtitle);
          currentSubtitle = null;
        }
      }
    }
  }

  return subtitles;
}

// Helper function to parse timestamp to seconds
function parseTimestamp(timestamp) {
  const parts = timestamp.split(':');
  const seconds = parseFloat(parts[parts.length - 1]);
  const minutes = parseInt(parts[parts.length - 2] || 0);
  const hours = parseInt(parts[parts.length - 3] || 0);
  
  return hours * 3600 + minutes * 60 + seconds;
}

// Helper function to format seconds to readable timestamp
function formatTimestamp(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// POST /api/transcript - Extract transcript from YouTube URL
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    if (!isValidYouTubeUrl(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Could not extract video ID from URL' });
    }

    // Check if yt-dlp.exe exists
    if (!fs.existsSync(YTDLP_PATH)) {
      return res.status(500).json({ 
        error: 'yt-dlp.exe not found in server directory',
        details: `Expected at: ${YTDLP_PATH}`
      });
    }

    // Create temp directory for downloads
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const outputPath = path.join(tempDir, `${videoId}.%(ext)s`);

    try {
      // Download video info and subtitles using yt-dlp
      console.log('Fetching video info and subtitles...');
      
      // First, get video metadata
      const infoCommand = `"${YTDLP_PATH}" --dump-json --no-download "${url}"`;
      const infoOutput = execSync(infoCommand, { encoding: 'utf8' });
      const videoInfo = JSON.parse(infoOutput);

      // Download subtitles
      const subtitleCommand = `"${YTDLP_PATH}" --write-auto-sub --write-sub --sub-lang en --sub-format vtt --skip-download -o "${outputPath}" "${url}"`;
      execSync(subtitleCommand, { encoding: 'utf8' });

      // Find the downloaded subtitle file
      const subtitleFiles = fs.readdirSync(tempDir).filter(file => 
        file.startsWith(videoId) && file.endsWith('.vtt')
      );

      if (subtitleFiles.length === 0) {
        return res.status(404).json({ 
          error: 'No subtitles found for this video',
          videoInfo: {
            title: videoInfo.title,
            duration: videoInfo.duration,
            channel: videoInfo.uploader
          }
        });
      }

      // Read and parse the subtitle file
      const subtitleFile = subtitleFiles[0];
      const subtitlePath = path.join(tempDir, subtitleFile);
      const subtitleContent = fs.readFileSync(subtitlePath, 'utf8');
      
      const subtitles = parseSubtitles(subtitleContent);

      // Clean up temp files
      fs.unlinkSync(subtitlePath);

      // Format response
      const transcript = {
        id: videoId,
        url: url,
        title: videoInfo.title,
        duration: videoInfo.duration,
        durationFormatted: formatTimestamp(videoInfo.duration),
        channel: videoInfo.uploader,
        thumbnail: videoInfo.thumbnail,
        subtitles: subtitles.map(sub => ({
          start: sub.start,
          end: sub.end,
          startFormatted: formatTimestamp(sub.start),
          endFormatted: formatTimestamp(sub.end),
          text: sub.text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        })),
        fullText: subtitles.map(sub => sub.text).join(' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
        createdAt: new Date().toISOString()
      };

      res.json(transcript);

    } catch (ytdlError) {
      console.error('yt-dlp error:', ytdlError.message);
      
      if (ytdlError.message.includes('Video unavailable')) {
        return res.status(404).json({ error: 'Video not found or unavailable' });
      }
      
      if (ytdlError.message.includes('Private video')) {
        return res.status(403).json({ error: 'Video is private' });
      }

      return res.status(500).json({ 
        error: 'Failed to extract transcript',
        details: ytdlError.message 
      });
    }

  } catch (error) {
    console.error('Transcript extraction error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// GET /api/transcript/:id - Get cached transcript (placeholder for database integration)
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  // For now, return a placeholder response
  // In production, you'd query your database here
  res.status(404).json({ 
    error: 'Transcript not found',
    message: 'Database integration not implemented yet'
  });
});

module.exports = router;
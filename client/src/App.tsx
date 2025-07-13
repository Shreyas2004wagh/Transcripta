import React, { useState } from 'react';
import './App.css';

interface Subtitle {
  start: number;
  end: number;
  startFormatted: string;
  endFormatted: string;
  text: string;
}

interface TranscriptData {
  id: string;
  url: string;
  title: string;
  duration: number;
  durationFormatted: string;
  channel: string;
  thumbnail: string;
  subtitles: Subtitle[];
  fullText: string;
  createdAt: string;
}

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    setError(null);
    setTranscript(null);

    try {
      const response = await fetch('http://localhost:3001/api/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transcript');
      }

      setTranscript(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUrl('');
    setTranscript(null);
    setError(null);
    setSearchTerm('');
  };

  const filteredSubtitles = transcript?.subtitles.filter(sub =>
    sub.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-100 text-yellow-800 font-semibold rounded px-1">{part}</span>
      ) : part
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-50 to-gray-100 text-gray-800 font-sans">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-600 tracking-tight mb-2">Transcripta 🎥</h1>
          <p className="text-gray-500">AI-powered YouTube transcript summarizer</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                YouTube URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {loading ? 'Extracting...' : 'Extract Transcript'}
              </button>
              {(transcript || error) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Extracting transcript...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-8 flex items-center gap-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-4h2v2h-2v-2zm0-8h2v6h-2V6z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Transcript Display */}
        {transcript && (
          <div className="space-y-6">
            {/* Video Info */}
            <div className="bg-white rounded-xl shadow p-6 flex gap-4 items-start">
              <img
                src={transcript.thumbnail}
                alt={transcript.title}
                className="w-32 h-24 object-cover rounded-lg"
              />
              <div>
                <h2 className="text-xl font-semibold mb-1">{transcript.title}</h2>
                <p className="text-sm text-gray-600"><strong>Channel:</strong> {transcript.channel}</p>
                <p className="text-sm text-gray-600"><strong>Duration:</strong> {transcript.durationFormatted}</p>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center gap-4">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search transcript..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.5 4a7.5 7.5 0 010 15z" />
                    </svg>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {searchTerm ? `${filteredSubtitles?.length} results` : `${transcript.subtitles.length} segments`}
                </div>
              </div>
            </div>

            {/* Transcript */}
            <div className="bg-white rounded-xl shadow">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Transcript</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {(filteredSubtitles || transcript.subtitles).map((subtitle, i) => (
                  <div key={i} className="p-4 hover:bg-blue-50 transition-colors flex gap-4 items-start">
                    <button
                      onClick={() =>
                        window.open(`${transcript.url}&t=${Math.floor(subtitle.start)}s`, '_blank')
                      }
                      className="bg-blue-100 text-blue-700 text-xs font-mono px-2 py-1 rounded hover:bg-blue-200"
                    >
                      {subtitle.startFormatted}
                    </button>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {highlightText(subtitle.text, searchTerm)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Placeholder */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg shadow-inner">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🧠 AI Summary</h3>
              <p className="italic text-gray-600">
                AI summarization coming soon! This feature will use Gemini AI to intelligently summarize key insights.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

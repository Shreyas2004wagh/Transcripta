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
        headers: {
          'Content-Type': 'application/json',
        },
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

  const filteredSubtitles = transcript?.subtitles.filter(subtitle =>
    subtitle.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-semibold">{part}</span>
      ) : part
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Transcripta 🎥
            </h1>
            <p className="text-gray-600">
              AI-powered YouTube transcript extraction and summarization
            </p>
          </div>

          {/* URL Input Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Extracting...' : 'Extract Transcript'}
                </button>
                
                {(transcript || error) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Extracting transcript...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Transcript Display */}
          {transcript && (
            <div className="space-y-6">
              {/* Video Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start gap-4">
                  <img 
                    src={transcript.thumbnail} 
                    alt={transcript.title}
                    className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {transcript.title}
                    </h2>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Channel:</span> {transcript.channel}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Duration:</span> {transcript.durationFormatted}
                    </p>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search transcript..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    {searchTerm ? `${filteredSubtitles?.length} results` : `${transcript.subtitles.length} segments`}
                  </div>
                </div>
              </div>

              {/* Transcript Content */}
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Transcript</h3>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {(filteredSubtitles || transcript.subtitles).map((subtitle, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => window.open(`${transcript.url}&t=${Math.floor(subtitle.start)}s`, '_blank')}
                            className="text-blue-600 hover:text-blue-800 font-mono text-sm bg-blue-50 px-2 py-1 rounded"
                          >
                            {subtitle.startFormatted}
                          </button>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 leading-relaxed">
                            {highlightText(subtitle.text, searchTerm)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary placeholder */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600 italic">
                    AI summarization coming soon! This will use Gemini AI to generate intelligent summaries and highlights.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
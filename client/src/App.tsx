import React, { useState } from 'react';
import { 
  Search, 
  Play, 
  Clock, 
  User, 
  Download, 
  Sparkles, 
  AlertCircle,
  RotateCcw,
  ExternalLink
} from 'lucide-react';

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
        <span key={i} className="bg-gradient-to-r from-amber-200 to-amber-300 text-amber-900 font-semibold rounded-md px-2 py-1 shadow-sm">
          {part}
        </span>
      ) : part
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f1f5f9" fill-opacity="0.4"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50`}></div>
      
      <div className="relative container mx-auto px-6 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Play className="w-8 h-8 text-white" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Transcripta
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-2"></div>
            </div>
          </div>
          <p className="text-xl text-slate-600 font-medium">
            Transform YouTube videos into searchable transcripts with AI-powered insights
          </p>
        </div>

        {/* Form */}
        <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl border border-white/50 p-8 mb-12 hover:shadow-3xl transition-all duration-500">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="url" className="block text-lg font-semibold text-slate-700">
                YouTube URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  className="w-full px-6 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/90 backdrop-blur-sm placeholder-slate-400"
                  disabled={loading}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <ExternalLink className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-2xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Extract Transcript
                  </>
                )}
              </button>
              {(transcript || error) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-8 py-4 border-2 border-slate-300 rounded-2xl text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 rounded-full mx-auto mb-6"></div>
              <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <p className="text-xl text-slate-600 font-medium">Extracting transcript...</p>
            <p className="text-sm text-slate-500 mt-2">This may take a few moments</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="backdrop-blur-xl bg-red-50/90 border-2 border-red-200 text-red-800 rounded-2xl p-6 mb-8 flex items-center gap-4 shadow-xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Error occurred</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Transcript Display */}
        {transcript && (
          <div className="space-y-8">
            {/* Video Info */}
            <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-all duration-500">
              <div className="flex gap-6 items-start">
                <div className="relative group">
                  <img
                    src={transcript.thumbnail}
                    alt={transcript.title}
                    className="w-48 h-36 object-cover rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-2xl group-hover:bg-black/10 transition-all duration-300"></div>
                </div>
                <div className="flex-1 space-y-4">
                  <h2 className="text-2xl font-bold text-slate-800 leading-tight">{transcript.title}</h2>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-slate-600">
                      <User className="w-5 h-5 text-emerald-600" />
                      <span className="font-medium">{transcript.channel}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">{transcript.durationFormatted}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl border border-white/50 p-6">
              <div className="flex items-center gap-6">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search through the transcript..."
                    className="w-full pl-14 pr-6 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white/90 backdrop-blur-sm placeholder-slate-400"
                  />
                </div>
                <div className="px-6 py-4 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-2xl border border-emerald-200">
                  <div className="text-lg font-semibold text-slate-700">
                    {searchTerm ? filteredSubtitles?.length : transcript.subtitles.length}
                  </div>
                  <div className="text-sm text-slate-500">
                    {searchTerm ? 'results' : 'segments'}
                  </div>
                </div>
              </div>
            </div>

            {/* Transcript */}
            <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
              <div className="p-8 border-b border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-blue-50/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <Download className="w-7 h-7 text-blue-600" />
                    Transcript
                  </h3>
                  <div className="text-sm text-slate-500">
                    {(filteredSubtitles || transcript.subtitles).length} segments
                  </div>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <div className="divide-y divide-slate-100/50">
                  {(filteredSubtitles || transcript.subtitles).map((subtitle, i) => (
                    <div key={i} className="p-6 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 group">
                      <div className="flex gap-6 items-start">
                        <button
                          onClick={() =>
                            window.open(`${transcript.url}&t=${Math.floor(subtitle.start)}s`, '_blank')
                          }
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-mono px-4 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex-shrink-0 group-hover:scale-105"
                        >
                          {subtitle.startFormatted}
                        </button>
                        <p className="text-slate-700 leading-relaxed text-lg">
                          {highlightText(subtitle.text, searchTerm)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-purple-50/70 to-indigo-50/70 rounded-3xl shadow-2xl border border-purple-200/50 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">AI Summary</h3>
                  <p className="text-slate-600">Powered by advanced language models</p>
                </div>
              </div>
              <div className="p-6 bg-white/50 rounded-2xl border border-purple-200/50">
                <p className="text-lg text-slate-600 leading-relaxed">
                  🚀 <strong>Coming Soon!</strong> Our AI will analyze the transcript to provide key insights, 
                  main topics, and actionable takeaways. This feature will help you quickly understand 
                  the core message without watching the entire video.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
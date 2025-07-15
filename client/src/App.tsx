import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Play, 
  Clock, 
  User, 
  Download, 
  Sparkles, 
  AlertCircle,
  RotateCcw,
  ExternalLink,
  Zap,
  Star,
  ArrowRight,
  Video,
  FileText,
  Brain
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
  const [isVisible, setIsVisible] = useState(false);

  // Function to clean transcript text from XML markup and timing codes
  const cleanTranscriptText = (text: string): string => {
    return text
      // Remove timing codes like <00:00:00.400>
      .replace(/<\d{2}:\d{2}:\d{2}\.\d{3}>/g, '')
      // Remove <c> and </c> tags
      .replace(/<\/?c>/g, '')
      // Remove any other XML-like tags
      .replace(/<[^>]*>/g, '')
      // Clean up extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

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

      // Clean the transcript data
      const cleanedTranscript = {
        ...data,
        subtitles: data.subtitles?.map((subtitle: Subtitle) => ({
          ...subtitle,
          text: cleanTranscriptText(subtitle.text)
        })) || [],
        fullText: data.fullText ? cleanTranscriptText(data.fullText) : ''
      };
      
      setTranscript(cleanedTranscript);
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
        <span key={i} className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-300 text-amber-900 font-bold rounded-lg px-3 py-1 shadow-lg border border-yellow-400/50 animate-pulse">
          {part}
        </span>
      ) : part
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ultra Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-indigo-600/10 via-transparent to-cyan-600/10"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>

      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-20 mix-blend-soft-light" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }}></div>

      <div className={`relative container mx-auto px-6 py-12 max-w-6xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Premium Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-6 mb-8 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-500 border border-white/20">
                <Play className="w-10 h-10 text-white drop-shadow-lg" fill="currentColor" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-6xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent drop-shadow-2xl">
                Transcripta
              </h1>
              <div className="h-2 w-32 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full mt-3 shadow-lg"></div>
              <div className="flex items-center gap-2 mt-3 text-blue-200/80">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-semibold tracking-wider uppercase">AI-Powered</span>
              </div>
            </div>
          </div>
          <p className="text-2xl text-slate-300 font-medium leading-relaxed max-w-3xl mx-auto">
            Transform YouTube videos into{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">
              searchable transcripts
            </span>{' '}
            with premium AI-powered insights and lightning-fast processing
          </p>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {[
              { icon: Video, text: 'Video Analysis' },
              { icon: FileText, text: 'Smart Transcription' },
              { icon: Brain, text: 'AI Insights' },
              { icon: Star, text: 'Premium Quality' }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white/90 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <feature.icon className="w-4 h-4" />
                <span className="text-sm font-semibold">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Form */}
        <div className="backdrop-blur-2xl bg-white/5 rounded-3xl shadow-2xl border border-white/10 p-10 mb-12 hover:bg-white/10 transition-all duration-700 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl"></div>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          
          <form onSubmit={handleSubmit} className="space-y-8 relative">
            <div className="space-y-4">
              <label htmlFor="url" className="block text-xl font-bold text-white flex items-center gap-3">
                <ExternalLink className="w-6 h-6 text-blue-400" />
                YouTube URL
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  className="relative w-full px-8 py-5 text-lg border-2 border-white/20 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-white/40 transition-all duration-500 bg-white/10 backdrop-blur-md text-white placeholder-white/50 font-medium hover:bg-white/15"
                  disabled={loading}
                />
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                  <ExternalLink className="w-6 h-6 text-white/40 group-hover:text-white/60 transition-all duration-300" />
                </div>
              </div>
            </div>
            
            <div className="flex gap-6">
              <button
                type="submit"
                disabled={loading}
                className="relative flex-1 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-5 px-10 rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 font-bold text-lg shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-1 flex items-center justify-center gap-4 border border-white/20">
                  {loading ? (
                    <>
                      <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                        Extracting Magic...
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-7 h-7 animate-pulse" />
                      <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                        Extract Transcript
                      </span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </div>
              </button>
              
              {(transcript || error) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-500 to-slate-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-all duration-500"></div>
                  <div className="relative px-10 py-5 border-2 border-white/20 rounded-2xl text-white hover:bg-white/10 hover:border-white/30 transition-all duration-500 font-bold flex items-center gap-3 backdrop-blur-md">
                    <RotateCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                    Reset
                  </div>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Premium Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-24 h-24 border-4 border-white/20 rounded-full mx-auto"></div>
              <div className="w-24 h-24 border-4 border-transparent border-t-blue-400 border-r-purple-400 rounded-full animate-spin mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
              <div className="w-16 h-16 border-4 border-transparent border-t-pink-400 border-r-blue-400 rounded-full animate-spin mx-auto absolute top-4 left-1/2 transform -translate-x-1/2 animation-delay-150"></div>
            </div>
            <h3 className="text-2xl text-white font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI is analyzing your video...
            </h3>
            <p className="text-lg text-slate-300">This magical process takes just a few moments</p>
            <div className="mt-6 flex justify-center gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
          </div>
        )}

        {/* Premium Error */}
        {error && (
          <div className="backdrop-blur-2xl bg-red-500/10 border-2 border-red-400/30 text-red-100 rounded-3xl p-8 mb-10 flex items-center gap-6 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <div className="relative">
              <h3 className="font-bold text-xl mb-2 text-red-200">Oops! Something went wrong</h3>
              <p className="text-red-200/80 text-lg">{error}</p>
            </div>
          </div>
        )}

        {/* Premium Transcript Display */}
        {transcript && (
          <div className="space-y-10">
            {/* Premium Video Info */}
            <div className="backdrop-blur-2xl bg-white/5 rounded-3xl shadow-2xl border border-white/10 p-10 hover:bg-white/10 transition-all duration-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              
              <div className="relative flex gap-8 items-start">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition-all duration-500"></div>
                  <img
                    src={transcript.thumbnail}
                    alt={transcript.title}
                    className="relative w-64 h-48 object-cover rounded-3xl shadow-2xl group-hover:scale-105 transition-all duration-500 border border-white/20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-3xl"></div>
                </div>
                
                <div className="flex-1 space-y-6">
                  <h2 className="text-3xl font-bold text-white leading-tight">{transcript.title}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm font-medium">Channel</p>
                        <p className="text-white font-bold text-lg">{transcript.channel}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm font-medium">Duration</p>
                        <p className="text-white font-bold text-lg">{transcript.durationFormatted}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Search */}
            <div className="backdrop-blur-2xl bg-white/5 rounded-3xl shadow-2xl border border-white/10 p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5"></div>
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              
              <div className="relative flex items-center gap-8">
                <div className="relative flex-1 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
                  <div className="relative flex items-center">
                    <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/40 group-hover:text-white/60 transition-all duration-300">
                      <Search className="w-7 h-7" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search through the transcript with AI precision..."
                      className="relative w-full pl-16 pr-8 py-6 text-lg border-2 border-white/20 rounded-2xl focus:ring-4 focus:ring-emerald-500/30 focus:border-white/40 transition-all duration-500 bg-white/10 backdrop-blur-md text-white placeholder-white/50 font-medium hover:bg-white/15"
                    />
                  </div>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl border border-white/20 backdrop-blur-md">
                  <div className="text-center">
                    <div className="text-2xl font-black text-white mb-1">
                      {searchTerm ? filteredSubtitles?.length : transcript.subtitles.length}
                    </div>
                    <div className="text-sm text-white/60 font-semibold uppercase tracking-wider">
                      {searchTerm ? 'results' : 'segments'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Transcript */}
            <div className="backdrop-blur-2xl bg-white/5 rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 via-blue-500/5 to-purple-500/5"></div>
              
              <div className="relative p-10 border-b border-white/10 bg-gradient-to-r from-slate-900/50 to-blue-900/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-black text-white flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Download className="w-7 h-7 text-white" />
                    </div>
                    Transcript
                  </h3>
                  <div className="text-sm text-white/60 bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md font-semibold">
                    {(filteredSubtitles || transcript.subtitles).length} segments
                  </div>
                </div>
              </div>
              
              <div className="relative max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                <div className="divide-y divide-white/5">
                  {(filteredSubtitles || transcript.subtitles).map((subtitle, i) => (
                    <div key={i} className="p-8 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-500 group relative">
                      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                      
                      <div className="flex gap-8 items-start">
                        <button
                          onClick={() =>
                            window.open(`${transcript.url}&t=${Math.floor(subtitle.start)}s`, '_blank')
                          }
                          className="relative group/btn overflow-hidden flex-shrink-0"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-50 group-hover/btn:opacity-75 transition-all duration-300"></div>
                          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 border border-white/20 font-mono">
                            {subtitle.startFormatted}
                          </div>
                        </button>
                        
                        <p className="text-white/90 leading-relaxed text-lg font-medium group-hover:text-white transition-all duration-300">
                          {highlightText(subtitle.text, searchTerm)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Premium AI Summary */}
            <div className="backdrop-blur-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-indigo-500/10 rounded-3xl shadow-2xl border border-purple-400/20 p-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
              
              <div className="relative flex items-start gap-6 mb-8">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl border border-white/20">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white mb-2">AI Summary & Insights</h3>
                  <p className="text-white/70 text-lg">Powered by advanced neural networks</p>
                </div>
              </div>
              
              <div className="relative p-8 bg-white/5 rounded-2xl border border-purple-400/20 backdrop-blur-md">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center shadow-2xl animate-pulse">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-4">🚀 Coming Soon!</h4>
                    <p className="text-lg text-white/80 leading-relaxed max-w-2xl mx-auto">
                      Our advanced AI will analyze the transcript to provide <span className="text-purple-300 font-bold">key insights</span>, 
                      <span className="text-pink-300 font-bold"> main topics</span>, and <span className="text-indigo-300 font-bold">actionable takeaways</span>. 
                      This premium feature will help you quickly understand the core message without watching the entire video.
                    </p>
                  </div>
                  <div className="flex justify-center gap-3">
                    {['Key Points', 'Topic Analysis', 'Action Items', 'Summary'].map((feature, i) => (
                      <div key={i} className="px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm font-semibold border border-white/20">
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
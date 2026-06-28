'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { stories, CATEGORIES, Story } from './stories';

export default function AudioBookPage() {
  const [view, setView] = useState<'library' | 'player'>('library');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [speed, setSpeed] = useState(0.85);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  const isPlayingRef = useRef(false);
  const currentParagraphRef = useRef(0);
  const languageRef = useRef<'zh' | 'en'>('zh');
  const speedRef = useRef(0.85);
  const selectedStoryRef = useRef<Story | null>(null);
  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { selectedStoryRef.current = selectedStory; }, [selectedStory]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => setVoicesLoaded(true);
      window.speechSynthesis.onvoiceschanged = loadVoices;
      if (window.speechSynthesis.getVoices().length > 0) setVoicesLoaded(true);
    }
  }, []);

  const speakRef = useRef<(index: number) => void>();

  const _speak = useCallback((index: number) => {
    if (!isPlayingRef.current) return;
    const story = selectedStoryRef.current;
    if (!story) return;

    const paragraphs = languageRef.current === 'zh' ? story.paragraphsZh : story.paragraphsEn;
    if (index >= paragraphs.length) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setCurrentParagraph(0);
      currentParagraphRef.current = 0;
      return;
    }

    currentParagraphRef.current = index;
    setCurrentParagraph(index);

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(paragraphs[index]);
    utterance.lang = languageRef.current === 'zh' ? 'zh-CN' : 'en-US';
    utterance.rate = speedRef.current;
    utterance.pitch = 1.05;

    utterance.onend = () => {
      if (isPlayingRef.current) {
        speakRef.current?.(index + 1);
      }
    };
    utterance.onerror = () => {
      isPlayingRef.current = false;
      setIsPlaying(false);
    };

    synth.speak(utterance);
  }, []);

  speakRef.current = _speak;

  useEffect(() => {
    const el = paragraphRefs.current[currentParagraph];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentParagraph]);

  function handlePlay() {
    isPlayingRef.current = true;
    setIsPlaying(true);
    speakRef.current?.(currentParagraphRef.current);
  }

  function handlePause() {
    isPlayingRef.current = false;
    setIsPlaying(false);
    window.speechSynthesis.cancel();
  }

  function handleStop() {
    isPlayingRef.current = false;
    setIsPlaying(false);
    window.speechSynthesis.cancel();
    currentParagraphRef.current = 0;
    setCurrentParagraph(0);
  }

  function handleSelectStory(story: Story) {
    handleStop();
    setSelectedStory(story);
    selectedStoryRef.current = story;
    setCurrentParagraph(0);
    currentParagraphRef.current = 0;
    setView('player');
  }

  function handleBack() {
    handleStop();
    setView('library');
    setSelectedStory(null);
  }

  function handleLanguageToggle() {
    const wasPlaying = isPlayingRef.current;
    const savedParagraph = currentParagraphRef.current;
    handlePause();
    const newLang: 'zh' | 'en' = languageRef.current === 'zh' ? 'en' : 'zh';
    languageRef.current = newLang;
    setLanguage(newLang);
    if (wasPlaying) {
      setTimeout(() => {
        isPlayingRef.current = true;
        setIsPlaying(true);
        speakRef.current?.(savedParagraph);
      }, 150);
    }
  }

  function handleSpeedChange(newSpeed: number) {
    const wasPlaying = isPlayingRef.current;
    const savedParagraph = currentParagraphRef.current;
    handlePause();
    speedRef.current = newSpeed;
    setSpeed(newSpeed);
    if (wasPlaying) {
      setTimeout(() => {
        isPlayingRef.current = true;
        setIsPlaying(true);
        speakRef.current?.(savedParagraph);
      }, 150);
    }
  }

  function handleParagraphClick(index: number) {
    handlePause();
    currentParagraphRef.current = index;
    setCurrentParagraph(index);
  }

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis.cancel();
    };
  }, []);

  const filtered = filterCategory === 'all'
    ? stories
    : stories.filter(s => s.category === filterCategory);

  const paragraphs = selectedStory
    ? (language === 'zh' ? selectedStory.paragraphsZh : selectedStory.paragraphsEn)
    : [];

  const progress = paragraphs.length > 0 ? ((currentParagraph + 1) / paragraphs.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white relative overflow-hidden">
      {/* Stars background */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.7 + 0.1,
              animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: Math.random() * 3 + 's',
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.3); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      {view === 'library' ? (
        /* ==================== LIBRARY VIEW ==================== */
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="text-6xl mb-4" style={{ animation: 'float 3s ease-in-out infinite' }}>🌙</div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent mb-2">
              星梦有声书
            </h1>
            <p className="text-lg text-indigo-200 mb-1">Starlight Audiobook</p>
            <p className="text-sm text-indigo-300">选一个故事，让我们开始冒险吧！✨</p>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-8" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  filterCategory === cat.id
                    ? 'bg-white text-indigo-900 shadow-lg shadow-white/20 scale-105'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {cat.zh}
              </button>
            ))}
          </div>

          {/* Story Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(story => (
              <button
                key={story.id}
                onClick={() => handleSelectStory(story)}
                className="group text-left rounded-3xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-purple-500/20"
              >
                {/* Card cover */}
                <div className={`bg-gradient-to-br ${story.gradient} p-8 flex items-center justify-center relative overflow-hidden`}>
                  <div className="text-7xl" style={{ animation: 'float 4s ease-in-out infinite' }}>
                    {story.emoji}
                  </div>
                  <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white/90">
                    {story.categoryZh}
                  </div>
                </div>
                {/* Card body */}
                <div className="p-4">
                  <h2 className="text-lg font-bold text-white mb-1">{story.titleZh}</h2>
                  <p className="text-xs text-white/50 mb-2">{story.titleEn}</p>
                  <p className="text-sm text-white/70 leading-relaxed line-clamp-2">{story.descriptionZh}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs bg-white/10 rounded-full px-2 py-0.5 text-white/60">
                      📖 {story.paragraphsZh.length} 段
                    </span>
                    <span className="text-xs bg-white/10 rounded-full px-2 py-0.5 text-white/60">
                      🎧 约10-15分钟
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-white/40 text-lg">
              暂无此类故事 🌟
            </div>
          )}
        </div>
      ) : (
        /* ==================== PLAYER VIEW ==================== */
        <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 flex flex-col min-h-screen">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition rounded-full px-4 py-2 text-sm"
            >
              ← 书库
            </button>
            <button
              onClick={handleLanguageToggle}
              className="bg-white/10 hover:bg-white/20 transition rounded-full px-4 py-2 text-sm font-bold"
            >
              {language === 'zh' ? '🇨🇳 中文 → EN' : '🇺🇸 EN → 中文'}
            </button>
          </div>

          {selectedStory && (
            <>
              {/* Story header */}
              <div className="text-center mb-6">
                <div
                  className={`w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br ${selectedStory.gradient} flex items-center justify-center text-6xl mb-4 shadow-xl`}
                  style={{ animation: 'float 3s ease-in-out infinite' }}
                >
                  {selectedStory.emoji}
                </div>
                <h1 className="text-2xl font-bold text-white">
                  {language === 'zh' ? selectedStory.titleZh : selectedStory.titleEn}
                </h1>
                <p className="text-sm text-white/50 mt-1">
                  {language === 'zh' ? selectedStory.titleEn : selectedStory.titleZh}
                </p>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-white/40 mb-1">
                  <span>第 {currentParagraph + 1} 段 / 共 {paragraphs.length} 段</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mb-4">
                {/* Play controls */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <button
                    onClick={handleStop}
                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-lg"
                    title="停止"
                  >
                    ⏹
                  </button>
                  <button
                    onClick={isPlaying ? handlePause : handlePlay}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all duration-200 hover:scale-110 ${
                      isPlaying
                        ? 'bg-gradient-to-br from-pink-500 to-rose-600 shadow-pink-500/40'
                        : 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/40'
                    }`}
                    title={isPlaying ? '暂停' : '播放'}
                  >
                    {isPlaying ? '⏸' : '▶'}
                  </button>
                  <button
                    onClick={() => {
                      const next = Math.min(currentParagraph + 1, paragraphs.length - 1);
                      handleParagraphClick(next);
                    }}
                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-lg"
                    title="下一段"
                  >
                    ⏭
                  </button>
                </div>

                {/* Speed control */}
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs text-white/50">语速：</span>
                  {[
                    { label: '0.5x', value: 0.5 },
                    { label: '慢', value: 0.75 },
                    { label: '正常', value: 0.9 },
                    { label: '快', value: 1.1 },
                  ].map(s => (
                    <button
                      key={s.value}
                      onClick={() => handleSpeedChange(s.value)}
                      className={`px-3 py-1 rounded-full text-xs transition ${
                        speed === s.value
                          ? 'bg-purple-500 text-white font-bold'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Story text */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
                {paragraphs.map((para, idx) => (
                  <div
                    key={idx}
                    ref={el => { paragraphRefs.current[idx] = el; }}
                    onClick={() => handleParagraphClick(idx)}
                    className={`rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
                      idx === currentParagraph
                        ? 'bg-white/15 border border-white/30 shadow-lg shadow-purple-500/10'
                        : 'bg-white/3 hover:bg-white/8 border border-transparent'
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className={`text-xs mt-1 flex-shrink-0 w-5 text-center font-mono ${
                        idx === currentParagraph ? 'text-pink-300' : 'text-white/20'
                      }`}>
                        {idx === currentParagraph && isPlaying ? '▶' : idx + 1}
                      </span>
                      <p className={`leading-relaxed transition-all duration-300 ${
                        idx === currentParagraph
                          ? language === 'zh'
                            ? 'text-white text-lg font-medium'
                            : 'text-white text-base font-medium'
                          : language === 'zh'
                            ? 'text-white/50 text-base'
                            : 'text-white/50 text-sm'
                      }`}>
                        {para}
                      </p>
                    </div>
                  </div>
                ))}

                {/* End card */}
                {currentParagraph === paragraphs.length - 1 && !isPlaying && (
                  <div className="text-center py-6">
                    <div className="text-4xl mb-3">🌟</div>
                    <p className="text-white/60 text-sm">故事结束了！</p>
                    <p className="text-white/40 text-xs mt-1">The End</p>
                    <button
                      onClick={handleStop}
                      className="mt-4 bg-white/10 hover:bg-white/20 transition rounded-full px-5 py-2 text-sm"
                    >
                      重新开始 🔄
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

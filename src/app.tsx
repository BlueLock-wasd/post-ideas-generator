import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, ChevronDown, Copy, Check, RefreshCw, Loader2, Lightbulb, PenLine, X, History, Trash2 } from 'lucide-react';
import { tones, generateMultipleIdeas, generateMultipleCustomIdeas, type Idea, type Tone } from '@/data/ideaGenerator';
import AnimatedBackground from '@/components/AnimatedBackground';
import { generateAIIdeas } from '@/api';

const motivatingPhrases = [
  'Взял и сделал 🐱\u200d👤',
  'Время пришло ⚡',
  'Хватит думать — делай 🔥',
  'Просто начни 🚀',
  'Ты можешь 💪',
];

const quantityOptions = [1, 3, 5];

function pluralize(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'идея';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'идеи';
  return 'идей';
}

interface HistoryEntry {
  id: number;
  prompt: string;
  toneLabel: string;
  isCustom: boolean;
  ideas: Idea[];
  timestamp: number;
}

export default function App() {
  const [selectedTone, setSelectedTone] = useState<Tone>(tones[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentIdeas, setCurrentIdeas] = useState<Idea[]>([]);
  const [currentIdeaTone, setCurrentIdeaTone] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [count, setCount] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isHistoryHovered, setIsHistoryHovered] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyIdRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % motivatingPhrases.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGenerate = useCallback(() => {
    if (isGenerating) return;
    if (isCustomMode && !customPrompt.trim()) return;

    setIsDropdownOpen(false);
    setIsGenerating(true);
    setCopiedIndex(null);

    (async () => {
      try {
        let newIdeas: Idea[];
        let toneLabel: string;
        let promptForHistory: string;

        if (isCustomMode) {
          // ← Используем AI для кастомного режима
          newIdeas = await generateAIIdeas(selectedTone.label, quantity, customPrompt);
          toneLabel = `Свой промпт · ${selectedTone.label}`;
          promptForHistory = customPrompt.trim();
        } else {
          // ← Используем AI для обычного режима
          newIdeas = await generateAIIdeas(selectedTone.label, quantity);
          toneLabel = selectedTone.label;
          promptForHistory = selectedTone.label;
        }

        setCurrentIdeas(newIdeas);
        setCurrentIdeaTone(toneLabel);
        setCount((prev) => prev + newIdeas.length);

        const entry: HistoryEntry = {
          id: historyIdRef.current++,
          prompt: promptForHistory,
          toneLabel: selectedTone.label,
          isCustom: isCustomMode,
          ideas: newIdeas,
          timestamp: Date.now(),
        };
        setHistory((prev) => [entry, ...prev].slice(0, 20));
      } catch (error) {
        console.error('Ошибка генерации:', error);
        // Можно показать уведомление пользователю
      } finally {
        setIsGenerating(false);
      }
    })();
  }, [isGenerating, isCustomMode, customPrompt, selectedTone, quantity]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Enter' && !isGenerating && !isDropdownOpen) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          handleGenerate();
        } else {
          handleGenerate();
        }
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleGenerate, isGenerating, isDropdownOpen]);

  const handleCopy = useCallback((idea: Idea, index: number) => {
    navigator.clipboard.writeText(`${idea.title}\n\n${idea.description}`);
    setCopiedIndex(index);
    window.setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  const removeIdea = useCallback((index: number) => {
    setCurrentIdeas(prev => prev.filter((_, i) => i !== index));
  }, []);

  const restoreFromHistory = useCallback((entry: HistoryEntry) => {
    setCurrentIdeas(entry.ideas);
    setCurrentIdeaTone(entry.isCustom ? `Свой промпт · ${entry.toneLabel}` : entry.toneLabel);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b16] font-body text-white antialiased">
      <AnimatedBackground />

      {/* History panel — hidden until hover */}
      <div
        className="group fixed left-0 top-0 z-40 h-full"
        onMouseEnter={() => setIsHistoryHovered(true)}
        onMouseLeave={() => setIsHistoryHovered(false)}
      >
        {/* Hover trigger strip */}
        <div className="absolute left-0 top-1/2 h-32 w-1.5 -translate-y-1/2 rounded-r-full bg-white/5 transition-all duration-300 group-hover:bg-teal-400/40" />

        {/* Panel */}
        <div
          className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] transition-all duration-500 ${
            isHistoryHovered ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
          }`}
        >
          <div className="glass-strong h-full overflow-y-auto p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
                <History className="h-4 w-4 text-teal-400" />
                История промптов
              </div>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1 text-xs text-white/30 transition-colors hover:text-red-400"
                  title="Очистить историю"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Очистить
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="py-8 text-center text-xs text-white/25">
                История пуста
              </p>
            ) : (
              <div className="space-y-2">
                {history.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => restoreFromHistory(entry)}
                    className="w-full rounded-xl glass p-3 text-left transition-all hover:bg-white/5"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      {entry.isCustom ? (
                        <PenLine className="h-3 w-3 text-cyan-400" />
                      ) : (
                        <Lightbulb className="h-3 w-3 text-teal-400" />
                      )}
                      <span className="truncate text-xs font-medium text-white/70">
                        {entry.prompt}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/30">{entry.toneLabel}</span>
                      <span className="text-[10px] text-white/20">
                        {entry.ideas.length} {pluralize(entry.ideas.length)}
                      </span>
                    </div>
                    <p className="mt-1.5 truncate text-[11px] text-white/40">
                      {entry.ideas[0]?.title}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <div className="animate-fade-in mb-6 flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/60">
          <Sparkles className="h-3 w-3 text-teal-400" />
          Генератор идей для постов
        </div>

        <h1 className="animate-fade-in text-gradient-accent text-center font-display text-5xl font-bold leading-tight tracking-tight md:text-7xl">
          Если не ты, то кто?
        </h1>

        <p className="animate-fade-in mt-4 max-w-md text-center text-sm text-white/40 md:text-base">
          Выбери настроение — получи идею, которая зажжёт твой следующий пост
        </p>

        <div className="mt-12 w-full max-w-2xl">
          <div className="group relative rounded-3xl bg-gradient-to-r from-teal-500/20 via-cyan-500/10 to-blue-500/20 p-[1px] transition-all duration-500 hover:from-teal-500/40 hover:via-cyan-500/30 hover:to-blue-500/40">
            <div className="glass-strong rounded-3xl p-6 md:p-8">
              {/* Mode toggle + quantity selector */}
              <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsCustomMode(false);
                      setIsDropdownOpen(false);
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      !isCustomMode
                        ? 'bg-teal-500/15 text-teal-300'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    <Lightbulb className="h-3.5 w-3.5" />
                    По настроению
                  </button>
                  <button
                    onClick={() => {
                      setIsCustomMode(true);
                      setIsDropdownOpen(false);
                      setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      isCustomMode
                        ? 'bg-teal-500/15 text-teal-300'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    <PenLine className="h-3.5 w-3.5" />
                    Свой промпт
                  </button>
                </div>

                {/* Quantity selector */}
                <div className="flex items-center gap-1.5 rounded-lg glass px-1.5 py-1">
                  <span className="px-1 text-[10px] text-white/30">Кол-во</span>
                  {quantityOptions.map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuantity(q)}
                      className={`h-6 w-6 rounded-md text-xs font-semibold transition-all ${
                        quantity === q
                          ? 'bg-teal-500/20 text-teal-300'
                          : 'text-white/40 hover:text-white/70'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom prompt input */}
              {isCustomMode && (
                <div className="animate-fade-in mb-5">
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleGenerate();
                        }
                      }}
                      placeholder="О чём написать? Например: путешествия, кофе, стартап..."
                      className="w-full rounded-xl glass px-4 py-3 pr-10 text-sm text-white placeholder-white/30 outline-none transition-all focus:ring-1 focus:ring-teal-400/50"
                    />
                    {customPrompt && (
                      <button
                        onClick={() => setCustomPrompt('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center gap-5 md:flex-row md:justify-between">
                {/* Dropdown — high z-index so it renders above the results block */}
                <div ref={dropdownRef} className="relative w-full md:w-auto">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl glass px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:text-white md:w-auto"
                  >
                    <span className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-teal-400" />
                      {selectedTone.label}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-white/40 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-full top-0 z-[9999] ml-2 min-w-[180px] rounded-xl glass-strong p-1.5 shadow-2xl shadow-black/50">
                      {tones.map((tone) => (
                        <button
                          key={tone.id}
                          onClick={() => {
                            setSelectedTone(tone);
                            setIsDropdownOpen(false);
                          }}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                            tone.id === selectedTone.id
                              ? 'bg-teal-500/15 text-teal-300'
                              : 'text-white/60 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <Lightbulb className="h-3.5 w-3.5 flex-shrink-0 text-teal-400" />
                          <span className="flex-1 text-left break-words">{tone.label}</span>
                          {tone.id === selectedTone.id && (
                            <Check className="h-3.5 w-3.5 flex-shrink-0 text-teal-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center">
                  <span
                    key={phraseIndex}
                    className="animate-fade-in inline-block font-display text-lg font-medium md:text-xl"
                  >
                    {motivatingPhrases[phraseIndex]}
                  </span>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || (isCustomMode && !customPrompt.trim())}
                  className="animate-pulse-glow flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 px-8 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-teal-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 md:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Думаю...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Создать
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 w-full max-w-2xl space-y-4">
          {isGenerating ? (
            Array.from({ length: quantity }).map((_, i) => (
              <div key={i} className="shimmer-bg animate-shimmer h-40 rounded-2xl" />
            ))
          ) : currentIdeas.length > 0 ? (
            currentIdeas.map((idea, index) => (
              <div key={index} className="animate-fade-in-up glass rounded-2xl p-6 md:p-8">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-teal-500/15 px-3 py-1 text-xs font-medium text-teal-300">
                    {currentIdeaTone}
                    {currentIdeas.length > 1 && ` · ${index + 1}/${currentIdeas.length}`}
                  </span>
                  <div className="flex gap-2">
                    {/* Кнопка удаления (крестик) */}
                    <button
                      onClick={() => removeIdea(index)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg glass text-white/60 transition-all hover:bg-white/10 hover:text-white"
                      title="Удалить идею"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    {/* Кнопка копирования */}
                    <button
                      onClick={() => handleCopy(idea, index)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg glass text-white/60 transition-all hover:text-white"
                      title="Скопировать"
                    >
                      {copiedIndex === index ? <Check className="h-4 w-4 text-teal-400" /> : <Copy className="h-4 w-4" />}
                    </button>

                    {/* Кнопка "Ещё идею" (показывается, если только одна карточка) */}
                    {currentIdeas.length === 1 && (
                      <button
                        onClick={handleGenerate}
                        className="flex h-9 w-9 items-center justify-center rounded-lg glass text-white/60 transition-all hover:text-white"
                        title="Ещё идею"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="mb-3 font-display text-xl font-bold leading-snug md:text-2xl">
                  {idea.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/55 md:text-base">
                  {idea.description}
                </p>
                {copiedIndex === index && (
                  <p className="animate-fade-in mt-4 text-xs text-teal-400">
                    Скопировано в буфер обмена
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-sm text-white/25">
              {isCustomMode
                ? 'Напиши тему и нажми «Создать» — идея появится здесь'
                : 'Нажми «Создать» — и идея появится здесь'}
            </div>
          )}
        </div>

        {count > 0 && (
          <p className="mt-10 text-sm text-white/30">
            {count} {pluralize(count)} сгенерировано
          </p>
        )}

        <footer className="absolute bottom-6 left-0 right-0 text-center text-xs text-white/20">
          Создано для тех, кто делает
        </footer>
      </main>
    </div>
  );
}

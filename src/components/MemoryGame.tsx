import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Sparkles, Timer, Trophy, CheckCircle2, Award, Zap, Brain, Eye } from 'lucide-react';
import { formatTime, sound } from '../utils/puzzle';
import { UserAchievementStats, Achievement } from '../types';
import { ALL_ACHIEVEMENTS } from '../data/achievements';

interface MemoryCard {
  id: number;
  pairId: number;
  emoji: string;
  label: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MEMORY_THEMES = [
  { id: 1, emoji: '🦁', label: 'أسد' },
  { id: 2, emoji: '🐬', label: 'دلفين' },
  { id: 3, emoji: '🦅', label: 'صقر' },
  { id: 4, emoji: '🚀', label: 'صاروخ' },
  { id: 5, emoji: '🪐', label: 'كوكب' },
  { id: 6, emoji: '💎', label: 'ماس' },
  { id: 7, emoji: '⚡', label: 'برق' },
  { id: 8, emoji: '🔥', label: 'لهب' },
];

interface MemoryGameProps {
  soundEnabled: boolean;
  onUpdateAchievements: (updater: (prev: UserAchievementStats) => { updatedStats: UserAchievementStats; newlyEarned: Achievement[] }) => void;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({
  soundEnabled,
  onUpdateAchievements,
}) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [timeSeconds, setTimeSeconds] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [matchedCount, setMatchedCount] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize deck
  const initializeDeck = useCallback(() => {
    const deck: MemoryCard[] = [];
    let counter = 0;
    MEMORY_THEMES.forEach((item) => {
      // 2 cards per theme
      deck.push({
        id: counter++,
        pairId: item.id,
        emoji: item.emoji,
        label: item.label,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        id: counter++,
        pairId: item.id,
        emoji: item.emoji,
        label: item.label,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlippedIndices([]);
    setMoves(0);
    setTimeSeconds(0);
    setIsPlaying(false);
    setIsWon(false);
    setIsChecking(false);
    setMatchedCount(0);
  }, []);

  useEffect(() => {
    initializeDeck();
  }, [initializeDeck]);

  // Timer loop
  useEffect(() => {
    if (isPlaying && !isWon) {
      timerRef.current = setInterval(() => {
        setTimeSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isWon]);

  // Handle card tap
  const handleCardClick = (index: number) => {
    if (isChecking || isWon) return;
    const card = cards[index];
    if (card.isFlipped || card.isMatched) return;

    if (!isPlaying) {
      setIsPlaying(true);
    }

    if (soundEnabled) {
      sound.playMove();
    }

    const newFlipped = [...flippedIndices, index];
    const updatedCards = [...cards];
    updatedCards[index].isFlipped = true;
    setCards(updatedCards);
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      setIsChecking(true);
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.pairId === secondCard.pairId) {
        // Match!
        setTimeout(() => {
          if (soundEnabled) sound.playWin();
          setCards((prev) =>
            prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, isMatched: true } : c
            )
          );
          setFlippedIndices([]);
          setIsChecking(false);
          const newMatchedCount = matchedCount + 1;
          setMatchedCount(newMatchedCount);

          if (newMatchedCount === MEMORY_THEMES.length) {
            // Completed game
            setIsWon(true);
            setIsPlaying(false);
            confetti({
              particleCount: 70,
              spread: 90,
              origin: { y: 0.6 },
              colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
            });

            onUpdateAchievements((prev) => {
              const currentUnlocked = new Set(prev.unlockedIds);
              const newlyEarned: Achievement[] = [];
              const tryUnlock = (id: string) => {
                if (!currentUnlocked.has(id)) {
                  currentUnlocked.add(id);
                  const meta = ALL_ACHIEVEMENTS.find((a) => a.id === id);
                  if (meta) newlyEarned.push(meta);
                }
              };

              tryUnlock('first_win');
              tryUnlock('memory_master');
              if (timeSeconds < 45) tryUnlock('speed_demon_60s');

              return {
                updatedStats: {
                  ...prev,
                  totalWins: prev.totalWins + 1,
                  unlockedIds: Array.from(currentUnlocked),
                },
                newlyEarned,
              };
            });
          }
        }, 400);
      } else {
        // No match - flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedIndices([]);
          setIsChecking(false);
        }, 900);
      }
    }
  };

  // Peek all cards for 1.5 seconds (Hint feature)
  const [hintAvailable, setHintAvailable] = useState<boolean>(true);
  const handlePeekHint = () => {
    if (!hintAvailable || isChecking || isWon) return;
    setHintAvailable(false);
    if (soundEnabled) sound.playHint();
    
    // Temporarily flip unmatched
    setCards((prev) => prev.map((c) => ({ ...c, isFlipped: true })));
    setTimeout(() => {
      setCards((prev) =>
        prev.map((c) => ({
          ...c,
          isFlipped: c.isMatched,
        }))
      );
    }, 1200);
  };

  return (
    <div id="memory-game-container" className="w-full max-w-lg mx-auto space-y-4">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
              تطابق الذاكرة الصورية (Memory Match)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              اقلب البطاقات واعثر على الأزواج المتطابقة بأقل عدد محاولات
            </p>
          </div>
        </div>

        <button
          id="btn-memory-restart"
          type="button"
          onClick={() => {
            initializeDeck();
            setHintAvailable(true);
            if (soundEnabled) sound.playShuffle();
          }}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
          title="إعادة توزيع البطاقات"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-center">
          <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium">
            المحاولات
          </span>
          <span className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100">
            {moves}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-center">
          <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium">
            الوقت
          </span>
          <span className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100">
            {formatTime(timeSeconds)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-center">
          <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium">
            الأزواج المحلولة
          </span>
          <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {matchedCount} / {MEMORY_THEMES.length}
          </span>
        </div>
      </div>

      {/* Action Buttons: Peek Hint */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handlePeekHint}
          disabled={!hintAvailable || isWon}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
            hintAvailable && !isWon
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-60'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>كشف سريع (لمحة تلميح)</span>
        </button>

        <span className="text-xs text-slate-500 dark:text-slate-400">
          انقر على بطاقتين للبحث عن المطابقة
        </span>
      </div>

      {/* Grid of 16 cards (4x4) */}
      <div
        id="memory-board-grid"
        className="grid grid-cols-4 gap-2.5 sm:gap-3 bg-slate-200/60 dark:bg-slate-800/60 p-3 sm:p-4 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-inner"
      >
        {cards.map((card, index) => {
          const isFlippedOrMatched = card.isFlipped || card.isMatched;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleCardClick(index)}
              disabled={isFlippedOrMatched}
              className={`aspect-square rounded-xl text-2xl sm:text-3xl font-bold transition-all duration-300 flex flex-col items-center justify-center cursor-pointer select-none relative shadow-sm ${
                card.isMatched
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 dark:border-emerald-500 scale-95 opacity-90'
                  : isFlippedOrMatched
                  ? 'bg-white dark:bg-slate-700 border-2 border-purple-500 shadow-md transform rotate-y-180 scale-100'
                  : 'bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-800 text-white border border-indigo-400/40 hover:scale-102 hover:shadow-indigo-500/30'
              }`}
            >
              {isFlippedOrMatched ? (
                <div className="flex flex-col items-center animate-fade-in">
                  <span>{card.emoji}</span>
                  <span className="text-[10px] font-normal text-slate-500 dark:text-slate-300 mt-1">
                    {card.label}
                  </span>
                </div>
              ) : (
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white/70" />
              )}
            </button>
          );
        })}
      </div>

      {/* Victory Banner */}
      {isWon && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 rounded-2xl p-4 text-center space-y-2 animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>تهانينا! أكملت جميع أزواج الذاكرة بنجاح 🏆</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            أنهيت التحدي في <span className="font-bold font-mono">{moves}</span> محاولة و{' '}
            <span className="font-bold font-mono">{formatTime(timeSeconds)}</span>.
          </p>
          <button
            type="button"
            onClick={() => {
              initializeDeck();
              setHintAvailable(true);
            }}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer shadow-sm"
          >
            جولة جديدة
          </button>
        </div>
      )}
    </div>
  );
};

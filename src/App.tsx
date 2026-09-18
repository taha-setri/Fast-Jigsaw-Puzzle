import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sun, Moon, HelpCircle, ShieldCheck, Sparkles, Trophy, Award } from 'lucide-react';
import { NetworkBar } from './components/NetworkBar';
import { GameControls } from './components/GameControls';
import { StatsBar } from './components/StatsBar';
import { PuzzleBoard } from './components/PuzzleBoard';
import { WinModal } from './components/WinModal';
import { PreviewModal } from './components/PreviewModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { PrivacyModal } from './components/PrivacyModal';
import { CookieBanner } from './components/CookieBanner';
import { AchievementsModal } from './components/AchievementsModal';
import { GameSelectorTabs } from './components/GameSelectorTabs';
import { MemoryGame } from './components/MemoryGame';
import { PipesGame } from './components/PipesGame';
import { Footer } from './components/Footer';
import {
  ActiveGame,
  GridSize,
  GameMode,
  PuzzleImage,
  BestRecords,
  BestRecord,
  CookiePreferences,
  UserAchievementStats,
  Achievement,
} from './types';
import { PRESET_IMAGES } from './data/images';
import { ALL_ACHIEVEMENTS } from './data/achievements';
import {
  generateSolvableBoard,
  tryMoveTile,
  tryMoveDirection,
  isBoardSolved,
  findNextHintTileIndex,
  sound,
} from './utils/puzzle';

export default function App() {
  // Game Setup State
  const [activeGame, setActiveGame] = useState<ActiveGame>('sliding');
  const [size, setSize] = useState<GridSize>(3);
  const [mode, setMode] = useState<GameMode>('numbers');
  const [images, setImages] = useState<PuzzleImage[]>(PRESET_IMAGES);
  const [selectedImage, setSelectedImage] = useState<PuzzleImage>(PRESET_IMAGES[0]);
  const [showGuideNumbers, setShowGuideNumbers] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Board & Gameplay State
  const [board, setBoard] = useState<number[]>(() => generateSolvableBoard(3));
  const [moves, setMoves] = useState<number>(0);
  const [timeSeconds, setTimeSeconds] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  // Hint State (limited per game)
  const MAX_HINTS = 3;
  const [hintsRemaining, setHintsRemaining] = useState<number>(MAX_HINTS);
  const [highlightedHintIndex, setHighlightedHintIndex] = useState<number | null>(null);
  const [hintsUsedInCurrentGame, setHintsUsedInCurrentGame] = useState<number>(0);
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Achievements State
  const [achievementStats, setAchievementStats] = useState<UserAchievementStats>(() => {
    try {
      const saved = localStorage.getItem('sliding_puzzle_achievements');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return {
      totalWins: 0,
      unlockedIds: [],
      totalHintsUsed: 0,
      consecutiveWins: 0,
    };
  });
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<Achievement[]>([]);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState<boolean>(false);

  // Best Records from LocalStorage
  const [bestRecords, setBestRecords] = useState<BestRecords>(() => {
    try {
      const saved = localStorage.getItem('sliding_puzzle_records');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sliding_puzzle_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Cookies & Privacy Preferences
  const [cookiePreferences, setCookiePreferences] = useState<CookiePreferences>(() => {
    try {
      const saved = localStorage.getItem('puzzle_cookie_preferences');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return {
      essential: true,
      analytics: true,
      advertising: true,
      answered: false,
    };
  });

  // Modals visibility
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [isWinModalOpen, setIsWinModalOpen] = useState<boolean>(false);

  // Sync Dark Mode class to <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sliding_puzzle_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sliding_puzzle_theme', 'light');
    }
  }, [isDarkMode]);

  // Sync Sound
  useEffect(() => {
    sound.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Shared Achievement Updater for all games
  const handleUpdateAchievements = useCallback(
    (updater: (prev: UserAchievementStats) => { updatedStats: UserAchievementStats; newlyEarned: Achievement[] }) => {
      setAchievementStats((prev) => {
        const { updatedStats, newlyEarned } = updater(prev);
        if (newlyEarned.length > 0) {
          setNewlyUnlockedAchievements(newlyEarned);
        }
        try {
          localStorage.setItem('sliding_puzzle_achievements', JSON.stringify(updatedStats));
        } catch {
          // Ignore
        }
        return updatedStats;
      });
    },
    []
  );

  // Timer Interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && !isWon) {
      interval = setInterval(() => {
        setTimeSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isWon]);

  // Record Key for current grid & mode
  const recordKey = `${size}x${size}-${mode}`;
  const currentBest = bestRecords[recordKey];

  // Save Cookie Preferences
  const handleUpdateCookiePreferences = (newPrefs: CookiePreferences) => {
    setCookiePreferences(newPrefs);
    try {
      localStorage.setItem('puzzle_cookie_preferences', JSON.stringify(newPrefs));
    } catch {
      // Ignore
    }
  };

  // Clear hint helper
  const clearHintHighlight = () => {
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = null;
    }
    setHighlightedHintIndex(null);
  };

  // Re-generate board when size changes
  const handleSizeChange = (newSize: GridSize) => {
    if (newSize === size) return;
    setSize(newSize);
    setBoard(generateSolvableBoard(newSize));
    setMoves(0);
    setTimeSeconds(0);
    setHintsRemaining(MAX_HINTS);
    setHintsUsedInCurrentGame(0);
    clearHintHighlight();
    setIsPlaying(false);
    setIsWon(false);
    setIsNewRecord(false);
    setIsWinModalOpen(false);
  };

  // Switch Game Mode (numbers vs images)
  const handleModeChange = (newMode: GameMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    // Restart current board
    setMoves(0);
    setTimeSeconds(0);
    setHintsRemaining(MAX_HINTS);
    setHintsUsedInCurrentGame(0);
    clearHintHighlight();
    setIsPlaying(false);
    setIsWon(false);
    setIsNewRecord(false);
    setBoard(generateSolvableBoard(size));
  };

  // Shuffle board
  const handleShuffle = () => {
    const newBoard = generateSolvableBoard(size);
    setBoard(newBoard);
    setMoves(0);
    setTimeSeconds(0);
    setHintsRemaining(MAX_HINTS);
    setHintsUsedInCurrentGame(0);
    clearHintHighlight();
    setIsPlaying(false);
    setIsWon(false);
    setIsNewRecord(false);
    setIsWinModalOpen(false);
    sound.playShuffle();
  };

  // Restart to freshly shuffled board
  const handleRestart = () => {
    handleShuffle();
  };

  // Hint button handler
  const handleUseHint = () => {
    if (isWon || hintsRemaining <= 0) return;

    const nextIndex = findNextHintTileIndex(board, size);
    if (nextIndex === null) return;

    sound.playHint();
    setHintsRemaining((prev) => Math.max(0, prev - 1));
    setHintsUsedInCurrentGame((prev) => prev + 1);
    setHighlightedHintIndex(nextIndex);

    // Save total hints used stat
    setAchievementStats((prev) => {
      const updated = {
        ...prev,
        totalHintsUsed: prev.totalHintsUsed + 1,
      };
      try {
        localStorage.setItem('sliding_puzzle_achievements', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });

    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
    }
    hintTimeoutRef.current = setTimeout(() => {
      setHighlightedHintIndex(null);
    }, 3500);
  };

  // Check and save victory
  const handleVictory = useCallback((finalMoves: number, finalTime: number) => {
    setIsPlaying(false);
    setIsWon(true);
    clearHintHighlight();
    sound.playWin();

    // Check if new record
    let isRecord = false;
    const existing = bestRecords[recordKey];
    if (!existing || finalMoves < existing.moves || (finalMoves === existing.moves && finalTime < existing.timeSeconds)) {
      isRecord = true;
      setIsNewRecord(true);
      const newRecord: BestRecord = {
        moves: finalMoves,
        timeSeconds: finalTime,
        date: new Date().toLocaleDateString('ar-EG'),
      };
      const updatedRecords = { ...bestRecords, [recordKey]: newRecord };
      setBestRecords(updatedRecords);
      try {
        localStorage.setItem('sliding_puzzle_records', JSON.stringify(updatedRecords));
      } catch {
        // Ignore
      }
    } else {
      setIsNewRecord(false);
    }

    // Evaluate Achievements
    setAchievementStats((prev) => {
      const newTotalWins = prev.totalWins + 1;
      const currentUnlocked = new Set(prev.unlockedIds);
      const newlyEarned: Achievement[] = [];

      const tryUnlock = (id: string) => {
        if (!currentUnlocked.has(id)) {
          currentUnlocked.add(id);
          const meta = ALL_ACHIEVEMENTS.find((a) => a.id === id);
          if (meta) newlyEarned.push(meta);
        }
      };

      // 1. First win
      tryUnlock('first_win');

      // 2. Win counts
      if (newTotalWins >= 5) tryUnlock('five_wins');
      if (newTotalWins >= 10) tryUnlock('ten_wins');

      // 3. Time based achievements
      if (finalTime < 30) tryUnlock('speed_demon_30s');
      if (finalTime < 60) tryUnlock('speed_demon_60s');

      // 4. Grid size masteries
      if (size === 4) tryUnlock('grid_4x4_master');
      if (size === 5) tryUnlock('grid_5x5_master');

      // 5. Image mode mastery
      if (mode === 'images') tryUnlock('image_master');

      // 6. No hint victory
      if (hintsUsedInCurrentGame === 0) tryUnlock('no_hint_master');

      // 7. Few moves (3x3 in <35 moves)
      if (size === 3 && finalMoves < 35) tryUnlock('few_moves');

      setNewlyUnlockedAchievements(newlyEarned);

      const updatedStats: UserAchievementStats = {
        ...prev,
        totalWins: newTotalWins,
        unlockedIds: Array.from(currentUnlocked),
      };

      try {
        localStorage.setItem('sliding_puzzle_achievements', JSON.stringify(updatedStats));
      } catch {
        // Ignore
      }

      return updatedStats;
    });

    setIsWinModalOpen(true);
  }, [bestRecords, recordKey, size, mode, hintsUsedInCurrentGame]);

  // Click on tile to slide
  const handleTileClick = (clickedIndex: number) => {
    if (isWon) return;

    const newBoard = tryMoveTile(board, clickedIndex, size);
    if (!newBoard) return; // Invalid move

    // Move succeeded
    sound.playMove();
    const newMoves = moves + 1;
    setMoves(newMoves);
    setBoard(newBoard);

    if (!isPlaying) {
      setIsPlaying(true);
    }

    // Check win condition
    if (isBoardSolved(newBoard)) {
      handleVictory(newMoves, timeSeconds);
    }
  };

  // Keyboard / Swipe Direction Move
  const handleMoveDirection = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (isWon) return;

    const newBoard = tryMoveDirection(board, direction, size);
    if (!newBoard) return;

    sound.playMove();
    const newMoves = moves + 1;
    setMoves(newMoves);
    setBoard(newBoard);

    if (!isPlaying) {
      setIsPlaying(true);
    }

    if (isBoardSolved(newBoard)) {
      handleVictory(newMoves, timeSeconds);
    }
  }, [board, isWon, moves, size, isPlaying, timeSeconds, handleVictory]);

  // Upload Custom Image
  const handleUploadCustomImage = (dataUrl: string) => {
    const customImg: PuzzleImage = {
      id: `custom-${Date.now()}`,
      name: 'صورتك المخصصة',
      url: dataUrl,
      category: 'مخصص',
    };
    setImages((prev) => [customImg, ...prev]);
    setSelectedImage(customImg);
    if (mode !== 'images') {
      setMode('images');
    }
    handleShuffle();
  };

  // Next level from win modal
  const handleNextLevel = () => {
    if (size < 5) {
      handleSizeChange((size + 1) as GridSize);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* 1. Fixed Network Bar */}
      <NetworkBar />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-8 flex flex-col items-center">
        {/* Top Header & Toggles */}
        <div className="w-full flex items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h1
                id="main-app-title"
                className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white"
              >
                لغز ترتيب الصور المقطعة السريع
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                لعبة البازل وألغاز الأرقام والصور السريعة أونلاين
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Achievements button */}
            <button
              id="btn-open-achievements"
              type="button"
              onClick={() => setIsAchievementsModalOpen(true)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-400 transition-all shadow-2xs cursor-pointer flex items-center gap-1"
              title="عرض الإنجازات والأوسمة"
              aria-label="لوحة الإنجازات"
            >
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
              <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400 hidden sm:inline">
                {achievementStats.unlockedIds.length}/{ALL_ACHIEVEMENTS.length}
              </span>
            </button>

            {/* How to play button */}
            <button
              id="btn-how-to-play"
              type="button"
              onClick={() => setIsHowToPlayOpen(true)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-400 transition-all shadow-2xs cursor-pointer"
              title="كيفية اللعب وقواعد اللغز"
              aria-label="كيفية اللعب"
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              id="btn-toggle-theme"
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-400 transition-all shadow-2xs cursor-pointer"
              title={isDarkMode ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
              aria-label="تبديل الوضع الليلي"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Game Selector Tabs */}
        <GameSelectorTabs
          activeGame={activeGame}
          onSelectGame={(game) => setActiveGame(game)}
        />

        {/* ACTIVE GAME 1: Sliding Puzzle */}
        {activeGame === 'sliding' && (
          <div className="w-full flex flex-col items-center">
            {/* Stats Bar */}
            <StatsBar
              moves={moves}
              timeSeconds={timeSeconds}
              bestRecord={currentBest}
              isPlaying={isPlaying}
              achievementStats={achievementStats}
              onOpenAchievementsModal={() => setIsAchievementsModalOpen(true)}
            />

            {/* Interactive Puzzle Board */}
            <PuzzleBoard
              board={board}
              size={size}
              mode={mode}
              imageUrl={selectedImage.url}
              showGuideNumbers={showGuideNumbers}
              onTileClick={handleTileClick}
              onMoveDirection={handleMoveDirection}
              isWon={isWon}
              highlightedTileIndex={highlightedHintIndex}
            />

            {/* Quick Instructions Hint */}
            <div className="mt-3 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
                <span>💡 انقر على القطع أو استخدم الأسهم للتحريك نحو المربع الفارغ، واستعن بالتلميح عند الحاجة.</span>
              </p>
            </div>

            {/* Game Controls */}
            <div className="w-full mt-6">
              <GameControls
                size={size}
                onSizeChange={handleSizeChange}
                mode={mode}
                onModeChange={handleModeChange}
                onShuffle={handleShuffle}
                onRestart={handleRestart}
                onOpenPreview={() => setIsPreviewOpen(true)}
                showGuideNumbers={showGuideNumbers}
                onToggleGuideNumbers={() => setShowGuideNumbers(!showGuideNumbers)}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled(!soundEnabled)}
                images={images}
                selectedImage={selectedImage}
                onSelectImage={(img) => {
                  setSelectedImage(img);
                  handleShuffle();
                }}
                onUploadCustomImage={handleUploadCustomImage}
                onUseHint={handleUseHint}
                hintsRemaining={hintsRemaining}
                maxHints={MAX_HINTS}
                isWon={isWon}
              />
            </div>
          </div>
        )}

        {/* ACTIVE GAME 2: Memory Match Game */}
        {activeGame === 'memory' && (
          <MemoryGame
            soundEnabled={soundEnabled}
            onUpdateAchievements={handleUpdateAchievements}
          />
        )}

        {/* ACTIVE GAME 3: Pipes Flow Game */}
        {activeGame === 'pipes' && (
          <PipesGame
            soundEnabled={soundEnabled}
            onUpdateAchievements={handleUpdateAchievements}
          />
        )}
      </main>

      {/* Victory Modal */}
      <WinModal
        isOpen={isWinModalOpen}
        onClose={() => setIsWinModalOpen(false)}
        onPlayAgain={handleShuffle}
        onNextLevel={size < 5 ? handleNextLevel : undefined}
        moves={moves}
        timeSeconds={timeSeconds}
        isNewRecord={isNewRecord}
        size={size}
        newAchievements={newlyUnlockedAchievements}
      />

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={isAchievementsModalOpen}
        onClose={() => setIsAchievementsModalOpen(false)}
        stats={achievementStats}
      />

      {/* Image Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        image={selectedImage}
      />

      {/* How to Play Modal */}
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      {/* Privacy Policy & Cookies Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        cookiePreferences={cookiePreferences}
        onUpdatePreferences={handleUpdateCookiePreferences}
      />

      {/* Cookie Banner (Google AdSense Readiness) */}
      <CookieBanner
        preferences={cookiePreferences}
        onAcceptAll={() =>
          handleUpdateCookiePreferences({
            essential: true,
            analytics: true,
            advertising: true,
            answered: true,
          })
        }
        onRejectNonEssential={() =>
          handleUpdateCookiePreferences({
            essential: true,
            analytics: false,
            advertising: false,
            answered: true,
          })
        }
        onOpenPolicy={() => setIsPrivacyOpen(true)}
      />

      {/* 4. Footer */}
      <Footer
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
      />
    </div>
  );
}

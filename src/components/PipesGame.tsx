import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Zap, Sparkles, CheckCircle2, Award, Waves, Info } from 'lucide-react';
import { formatTime, sound } from '../utils/puzzle';
import { UserAchievementStats, Achievement } from '../types';
import { ALL_ACHIEVEMENTS } from '../data/achievements';

// Directions: 0 = Up, 1 = Right, 2 = Down, 3 = Left
// Pipe types:
// 'line': connects [0, 2] (vertical) or [1, 3] (horizontal)
// 'corner': connects [0, 1] (up-right), [1, 2] (right-down), [2, 3] (down-left), [3, 0] (left-up)
// 'cross': connects [0, 1, 2, 3] (all 4)
// 't-junction': connects [0, 1, 2], [1, 2, 3], etc.

type PipeType = 'line' | 'corner' | 't-junction';

interface PipeTile {
  id: number;
  row: number;
  col: number;
  type: PipeType;
  rotation: number; // 0, 90, 180, 270 degrees
  isSource?: boolean;
  isDestination?: boolean;
  isConnected: boolean;
}

// 4x4 Grid
const GRID_SIZE = 4;

// Base connections for rotation 0
const BASE_CONNECTIONS: Record<PipeType, number[]> = {
  line: [0, 2], // Up and Down
  corner: [0, 1], // Up and Right
  't-junction': [0, 1, 2], // Up, Right, Down
};

function getActiveConnections(type: PipeType, rotation: number): number[] {
  const base = BASE_CONNECTIONS[type];
  const steps = Math.floor((rotation % 360) / 90);
  return base.map((dir) => (dir + steps) % 4);
}

// Fixed solvable layout design for 4x4 with randomized initial rotations
interface LayoutTile {
  type: PipeType;
  solutionRot: number;
}

const FIXED_SOLUTIONS: LayoutTile[][] = [
  // Row 0
  [
    { type: 'corner', solutionRot: 90 }, // (0,0) Source: connects Right & Down
    { type: 'line', solutionRot: 90 },   // (0,1) Left & Right
    { type: 'corner', solutionRot: 180 },// (0,2) Left & Down
    { type: 'corner', solutionRot: 270 },// (0,3)
  ],
  // Row 1
  [
    { type: 'line', solutionRot: 0 },    // (1,0) Up & Down
    { type: 't-junction', solutionRot: 0 },// (1,1)
    { type: 'line', solutionRot: 0 },    // (1,2) Up & Down
    { type: 'corner', solutionRot: 90 }, // (1,3)
  ],
  // Row 2
  [
    { type: 'corner', solutionRot: 0 },  // (2,0) Up & Right
    { type: 'line', solutionRot: 90 },   // (2,1) Left & Right
    { type: 't-junction', solutionRot: 270 },// (2,2)
    { type: 'line', solutionRot: 0 },    // (2,3)
  ],
  // Row 3
  [
    { type: 'line', solutionRot: 90 },   // (3,0)
    { type: 'corner', solutionRot: 0 },  // (3,1)
    { type: 'corner', solutionRot: 0 },  // (3,2) Up & Right
    { type: 'corner', solutionRot: 270 },// (3,3) Goal: Left & Up
  ],
];

interface PipesGameProps {
  soundEnabled: boolean;
  onUpdateAchievements: (updater: (prev: UserAchievementStats) => { updatedStats: UserAchievementStats; newlyEarned: Achievement[] }) => void;
}

export const PipesGame: React.FC<PipesGameProps> = ({
  soundEnabled,
  onUpdateAchievements,
}) => {
  const [tiles, setTiles] = useState<PipeTile[]>([]);
  const [rotationsCount, setRotationsCount] = useState<number>(0);
  const [timeSeconds, setTimeSeconds] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Trace connectivity from source (0,0) through the grid
  const computeFlow = useCallback((currentTiles: PipeTile[]): { isConnectedMap: boolean[]; reachesGoal: boolean } => {
    const map = currentTiles.map(() => false);
    if (currentTiles.length === 0) return { isConnectedMap: map, reachesGoal: false };

    // Source is (0,0)
    const sourceIdx = 0;
    const destIdx = GRID_SIZE * GRID_SIZE - 1; // (3,3)

    const visited = new Set<number>();
    const queue: number[] = [sourceIdx];
    visited.add(sourceIdx);
    map[sourceIdx] = true;

    // Directions: 0 = Up (-GRID), 1 = Right (+1), 2 = Down (+GRID), 3 = Left (-1)
    const deltas: Record<number, { dr: number; dc: number; opposite: number }> = {
      0: { dr: -1, dc: 0, opposite: 2 },
      1: { dr: 0, dc: 1, opposite: 3 },
      2: { dr: 1, dc: 0, opposite: 0 },
      3: { dr: 0, dc: -1, opposite: 1 },
    };

    while (queue.length > 0) {
      const currIdx = queue.shift()!;
      const currTile = currentTiles[currIdx];
      const currConns = getActiveConnections(currTile.type, currTile.rotation);

      for (const dir of currConns) {
        const { dr, dc, opposite } = deltas[dir];
        const nr = currTile.row + dr;
        const nc = currTile.col + dc;

        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
          const neighborIdx = nr * GRID_SIZE + nc;
          const neighborTile = currentTiles[neighborIdx];
          const neighborConns = getActiveConnections(neighborTile.type, neighborTile.rotation);

          // Check if neighbor connects back
          if (neighborConns.includes(opposite)) {
            if (!visited.has(neighborIdx)) {
              visited.add(neighborIdx);
              map[neighborIdx] = true;
              queue.push(neighborIdx);
            }
          }
        }
      }
    }

    return {
      isConnectedMap: map,
      reachesGoal: visited.has(destIdx),
    };
  }, []);

  // Initialize randomized board
  const initializeBoard = useCallback(() => {
    const list: PipeTile[] = [];
    let id = 0;

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const sol = FIXED_SOLUTIONS[r][c];
        // Random rotation: 0, 90, 180, 270, avoiding accidentally starting fully solved
        const randomRotOffset = (Math.floor(Math.random() * 3) + 1) * 90;
        const rot = (sol.solutionRot + randomRotOffset) % 360;

        list.push({
          id: id++,
          row: r,
          col: c,
          type: sol.type,
          rotation: rot,
          isSource: r === 0 && c === 0,
          isDestination: r === GRID_SIZE - 1 && c === GRID_SIZE - 1,
          isConnected: false,
        });
      }
    }

    const { isConnectedMap } = computeFlow(list);
    const finalized = list.map((t, i) => ({ ...t, isConnected: isConnectedMap[i] }));

    setTiles(finalized);
    setRotationsCount(0);
    setTimeSeconds(0);
    setIsPlaying(false);
    setIsWon(false);
  }, [computeFlow]);

  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

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

  // Rotate tile on click
  const handleRotateTile = (index: number) => {
    if (isWon) return;

    if (!isPlaying) {
      setIsPlaying(true);
    }

    if (soundEnabled) {
      sound.playMove();
    }

    const updated = tiles.map((tile, i) => {
      if (i === index) {
        return {
          ...tile,
          rotation: (tile.rotation + 90) % 360,
        };
      }
      return tile;
    });

    const { isConnectedMap, reachesGoal } = computeFlow(updated);
    const withFlow = updated.map((t, i) => ({ ...t, isConnected: isConnectedMap[i] }));

    setTiles(withFlow);
    setRotationsCount((prev) => prev + 1);

    if (reachesGoal && !isWon) {
      setIsWon(true);
      setIsPlaying(false);
      if (soundEnabled) sound.playWin();

      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b'],
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
        tryUnlock('pipes_master');
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
  };

  // Visual SVG for Pipe Tile based on type
  const renderPipeShape = (type: PipeType, isConnected: boolean) => {
    const strokeColor = isConnected ? '#06b6d4' : '#64748b'; // Cyan neon or slate
    const strokeWidth = 14;

    if (type === 'line') {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <line
            x1="50"
            y1="0"
            x2="50"
            y2="100"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {isConnected && (
            <line
              x1="50"
              y1="0"
              x2="50"
              y2="100"
              stroke="#a5f3fc"
              strokeWidth={strokeWidth / 3}
              strokeLinecap="round"
            />
          )}
        </svg>
      );
    }

    if (type === 'corner') {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M 50 0 L 50 50 L 100 50"
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {isConnected && (
            <path
              d="M 50 0 L 50 50 L 100 50"
              fill="none"
              stroke="#a5f3fc"
              strokeWidth={strokeWidth / 3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      );
    }

    // 't-junction'
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path
          d="M 50 0 L 50 100 M 50 50 L 100 50"
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {isConnected && (
          <path
            d="M 50 0 L 50 100 M 50 50 L 100 50"
            fill="none"
            stroke="#a5f3fc"
            strokeWidth={strokeWidth / 3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    );
  };

  return (
    <div id="pipes-game-container" className="w-full max-w-lg mx-auto space-y-4">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
              توصيل الأنابيب والتدفق الذكي (Pipes Flow)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              قم بتدوير الأنابيب لتوصيل مجرى الطاقة من نقطة البداية إلى الهدف النهائي
            </p>
          </div>
        </div>

        <button
          id="btn-pipes-restart"
          type="button"
          onClick={() => {
            initializeBoard();
            if (soundEnabled) sound.playShuffle();
          }}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
          title="إعادة توزيع الشبكة"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-center">
          <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium">
            عدد التدويرات
          </span>
          <span className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100">
            {rotationsCount}
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
      </div>

      {/* Instructions callout */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
          <span>الأخضر/السماوي: متصل بالتدفق</span>
        </span>
        <span>انقر على أي أنبوب لتدويره 90 درجة</span>
      </div>

      {/* Pipes Board 4x4 */}
      <div
        id="pipes-board-grid"
        className="grid grid-cols-4 gap-2 bg-slate-900 dark:bg-slate-950 p-4 rounded-2xl border-2 border-slate-700 shadow-2xl relative overflow-hidden"
      >
        {tiles.map((tile, index) => {
          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => handleRotateTile(index)}
              className={`aspect-square rounded-xl relative flex items-center justify-center p-2 cursor-pointer transition-all duration-300 hover:scale-102 ${
                tile.isConnected
                  ? 'bg-slate-800/90 border-2 border-cyan-500/70 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-850 border border-slate-700/80 hover:border-slate-500'
              }`}
            >
              {/* Source marker on tile (0,0) */}
              {tile.isSource && (
                <span className="absolute top-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white z-10 shadow-xs">
                  البداية
                </span>
              )}

              {/* Destination marker on tile (3,3) */}
              {tile.isDestination && (
                <span className="absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-900 z-10 shadow-xs">
                  الهدف
                </span>
              )}

              {/* SVG Pipe Icon rotated */}
              <div
                className="w-full h-full transition-transform duration-300 flex items-center justify-center"
                style={{ transform: `rotate(${tile.rotation}deg)` }}
              >
                {renderPipeShape(tile.type, tile.isConnected)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Victory Banner */}
      {isWon && (
        <div className="bg-cyan-50 dark:bg-cyan-950/50 border-2 border-cyan-500 rounded-2xl p-4 text-center space-y-2 animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-cyan-700 dark:text-cyan-300 font-bold text-base">
            <CheckCircle2 className="w-5 h-5 text-cyan-500" />
            <span>رائع جداً! تم توصيل شبكة الطاقة بالكامل ⚡</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            أكملت المجرى في <span className="font-bold font-mono">{rotationsCount}</span> حركة و{' '}
            <span className="font-bold font-mono">{formatTime(timeSeconds)}</span>.
          </p>
          <button
            type="button"
            onClick={initializeBoard}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition-all cursor-pointer shadow-sm"
          >
            تحدي شبكة جديدة
          </button>
        </div>
      )}
    </div>
  );
};

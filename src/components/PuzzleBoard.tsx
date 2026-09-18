import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { GridSize, GameMode } from '../types';
import { Sparkles } from 'lucide-react';

interface PuzzleBoardProps {
  board: number[];
  size: GridSize;
  mode: GameMode;
  imageUrl: string;
  showGuideNumbers: boolean;
  onTileClick: (index: number) => void;
  onMoveDirection: (direction: 'up' | 'down' | 'left' | 'right') => void;
  isWon: boolean;
  highlightedTileIndex?: number | null;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  board,
  size,
  mode,
  imageUrl,
  showGuideNumbers,
  onTileClick,
  onMoveDirection,
  isWon,
  highlightedTileIndex,
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs/modals
      if (['INPUT', 'TEXTAREA', 'BUTTON'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          onMoveDirection('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          onMoveDirection('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          onMoveDirection('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          onMoveDirection('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMoveDirection]);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Minimum swipe threshold
    if (Math.max(absDx, absDy) > 28) {
      if (absDx > absDy) {
        // Horizontal swipe
        // In Arabic RTL context, swiping left moves rightwards visually or tile moves in swipe direction
        if (dx > 0) {
          onMoveDirection('right');
        } else {
          onMoveDirection('left');
        }
      } else {
        // Vertical swipe
        if (dy > 0) {
          onMoveDirection('down');
        } else {
          onMoveDirection('up');
        }
      }
    }
    touchStartRef.current = null;
  };

  // Find 0 (blank) position to see if neighbor
  const zeroIndex = board.indexOf(0);
  const zeroRow = Math.floor(zeroIndex / size);
  const zeroCol = zeroIndex % size;

  return (
    <div
      id="puzzle-board-container"
      className="w-full max-w-[440px] sm:max-w-[480px] aspect-square mx-auto p-2 sm:p-3 bg-slate-200 dark:bg-slate-900/90 rounded-2xl shadow-lg border border-slate-300 dark:border-slate-800 select-none transition-colors"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      ref={boardRef}
    >
      <div
        id="puzzle-grid"
        className="w-full h-full grid gap-1.5 sm:gap-2.5 rounded-xl overflow-hidden bg-slate-300/80 dark:bg-slate-950 p-1 sm:p-2"
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
        }}
      >
        {board.map((tileValue, index) => {
          const row = Math.floor(index / size);
          const col = index % size;
          const isBlank = tileValue === 0;

          // Check if this tile can slide directly (is in same row or col as blank)
          const canMove = !isBlank && (row === zeroRow || col === zeroCol);
          const isHinted = highlightedTileIndex === index;

          if (isBlank) {
            // Empty tile spot
            return (
              <div
                key={`blank-${index}`}
                id={`puzzle-tile-empty`}
                className="w-full h-full rounded-lg sm:rounded-xl border-2 border-dashed border-slate-400/40 dark:border-slate-800 flex items-center justify-center bg-slate-200/50 dark:bg-slate-900/50 transition-all"
              >
                {isWon ? (
                  mode === 'images' ? (
                    <div
                      className="w-full h-full rounded-lg sm:rounded-xl animate-fade-in"
                      style={{
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: `${size * 100}% ${size * 100}%`,
                        backgroundPosition: `100% 100%`,
                      }}
                    />
                  ) : (
                    <Sparkles className="w-6 h-6 text-amber-500 animate-spin" />
                  )
                ) : (
                  <span className="text-slate-400/60 dark:text-slate-600 text-xs font-mono">
                    فارغ
                  </span>
                )}
              </div>
            );
          }

          // Image Mode Slice Calculation
          let bgPosition = '0% 0%';
          if (mode === 'images') {
            const originalRow = Math.floor((tileValue - 1) / size);
            const originalCol = (tileValue - 1) % size;
            const posX = (originalCol / (size - 1)) * 100;
            const posY = (originalRow / (size - 1)) * 100;
            bgPosition = `${posX}% ${posY}%`;
          }

          return (
            <motion.button
              key={`tile-${tileValue}`}
              id={`puzzle-tile-${tileValue}`}
              type="button"
              onClick={() => onTileClick(index)}
              layout
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 32,
              }}
              whileTap={{ scale: 0.96 }}
              className={`puzzle-tile relative w-full h-full rounded-lg sm:rounded-xl font-bold flex items-center justify-center overflow-hidden focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer shadow-sm active:shadow-inner ${
                mode === 'numbers'
                  ? 'bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-850 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700/80 hover:border-amber-400 dark:hover:border-amber-500'
                  : 'border border-black/20 shadow-md hover:brightness-105'
              } ${
                isHinted
                  ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-900 animate-pulse z-10 scale-102 shadow-amber-500/50 shadow-lg'
                  : canMove
                  ? 'ring-1 ring-amber-400/40 hover:ring-amber-400'
                  : 'opacity-95'
              }`}
              style={
                mode === 'images'
                  ? {
                      backgroundImage: `url(${imageUrl})`,
                      backgroundSize: `${size * 100}% ${size * 100}%`,
                      backgroundPosition: bgPosition,
                      backgroundRepeat: 'no-repeat',
                    }
                  : undefined
              }
              aria-label={`القطعة رقم ${tileValue}`}
            >
              {mode === 'numbers' ? (
                <span
                  className={`font-mono drop-shadow-xs select-none ${
                    size === 3
                      ? 'text-3xl sm:text-4xl'
                      : size === 4
                      ? 'text-2xl sm:text-3xl'
                      : 'text-xl sm:text-2xl'
                  }`}
                >
                  {tileValue}
                </span>
              ) : (
                showGuideNumbers && (
                  <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 bg-black/65 text-white backdrop-blur-xs font-mono text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-md border border-white/20 shadow-xs pointer-events-none">
                    {tileValue}
                  </span>
                )
              )}

              {/* Correct position subtle indicator */}
              {tileValue === index + 1 && (
                <span
                  className="absolute bottom-1 left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500/80 shadow-xs pointer-events-none"
                  title="في موضعها الصحيح"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

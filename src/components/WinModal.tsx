import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Timer, Footprints, RotateCcw, ArrowRight, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { formatTime } from '../utils/puzzle';
import { GridSize, Achievement } from '../types';

interface WinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
  onNextLevel?: () => void;
  moves: number;
  timeSeconds: number;
  isNewRecord: boolean;
  size: GridSize;
  newAchievements?: Achievement[];
}

export const WinModal: React.FC<WinModalProps> = ({
  isOpen,
  onClose,
  onPlayAgain,
  onNextLevel,
  moves,
  timeSeconds,
  isNewRecord,
  size,
  newAchievements = [],
}) => {
  useEffect(() => {
    if (isOpen) {
      // Big initial burst of confetti
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'],
      });

      // Raining confetti loop for 2.5 seconds
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#a855f7'];

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.7 },
          colors: colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.7 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      requestAnimationFrame(frame);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="modal-win-celebration"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
        {/* Trophy icon */}
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-600 flex items-center justify-center text-amber-500 animate-bounce">
          <Trophy className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-850 dark:text-white">
            مبارك! لقد حللت اللغز بنجاح!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            أحسنت صنعاً، ذكاؤك وسرعة بديهتك رائعة.
          </p>
        </div>

        {/* Record Badge */}
        {isNewRecord && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-pulse">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>رقم قياسي شخصي جديد! 🏆</span>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Timer className="w-3.5 h-3.5 text-emerald-500" />
              <span>الوقت</span>
            </div>
            <span className="text-lg font-bold font-mono text-slate-850 dark:text-slate-100 mt-0.5">
              {formatTime(timeSeconds)}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Footprints className="w-3.5 h-3.5 text-indigo-500" />
              <span>الحركات</span>
            </div>
            <span className="text-lg font-bold font-mono text-slate-850 dark:text-slate-100 mt-0.5">
              {moves}
            </span>
          </div>
        </div>

        {/* Newly Unlocked Achievements */}
        {newAchievements.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 rounded-xl p-3 text-right space-y-1.5 animate-fade-in">
            <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>إنجازات جديدة تم فتحها في هذه الجولة! 🎖️</span>
            </div>
            <div className="space-y-1">
              {newAchievements.map((ach) => (
                <div key={ach.id} className="flex items-center justify-between text-xs bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-lg border border-amber-200 dark:border-amber-800/60">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-100">{ach.title}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">+{ach.rewardPoints} نقطة</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <button
            id="btn-win-play-again"
            type="button"
            onClick={onPlayAgain}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>العب مجدداً في شبكة {size}x{size}</span>
          </button>

          {size < 5 && onNextLevel && (
            <button
              id="btn-win-next-level"
              type="button"
              onClick={onNextLevel}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <span>التحدي الأصعب: شبكة {size + 1}x{size + 1}</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          )}

          <button
            id="btn-win-close"
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};

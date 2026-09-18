import React, { useState } from 'react';
import { Timer, Footprints, Trophy, Award, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { formatTime } from '../utils/puzzle';
import { BestRecord, UserAchievementStats } from '../types';
import { ALL_ACHIEVEMENTS } from '../data/achievements';

interface StatsBarProps {
  moves: number;
  timeSeconds: number;
  bestRecord?: BestRecord;
  isPlaying: boolean;
  achievementStats: UserAchievementStats;
  onOpenAchievementsModal?: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  moves,
  timeSeconds,
  bestRecord,
  isPlaying,
  achievementStats,
  onOpenAchievementsModal,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements'>('stats');
  const unlockedCount = achievementStats.unlockedIds.length;
  const totalCount = ALL_ACHIEVEMENTS.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div id="game-stats-and-achievements-container" className="w-full max-w-lg mx-auto mb-4 space-y-2">
      {/* Tabs Navigation */}
      <div className="flex items-center justify-between bg-slate-200/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'stats'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Timer className="w-3.5 h-3.5 text-emerald-500" />
          <span>إحصائيات اللعبة الحالية</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('achievements')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'achievements'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>الإنجازات والمكافآت ({unlockedCount}/{totalCount})</span>
        </button>
      </div>

      {/* Tab 1: Standard Game Stats */}
      {activeTab === 'stats' && (
        <div id="game-stats-bar" className="grid grid-cols-3 gap-2 sm:gap-4 transition-all">
          {/* Moves Counter */}
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-2.5 sm:p-3 shadow-xs flex flex-col items-center justify-center transition-all">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-0.5">
              <Footprints className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
              <span>الحركات</span>
            </div>
            <span id="moves-count-display" className="text-xl sm:text-2xl font-bold font-mono text-slate-800 dark:text-slate-100">
              {moves}
            </span>
          </div>

          {/* Timer */}
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-2.5 sm:p-3 shadow-xs flex flex-col items-center justify-center transition-all relative overflow-hidden">
            {isPlaying && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-0.5">
              <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
              <span>الوقت</span>
            </div>
            <span id="timer-display" className="text-xl sm:text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 tracking-wider">
              {formatTime(timeSeconds)}
            </span>
          </div>

          {/* Best Record */}
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-2.5 sm:p-3 shadow-xs flex flex-col items-center justify-center transition-all">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-0.5">
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              <span>أفضل رقم</span>
            </div>
            {bestRecord ? (
              <div className="text-center">
                <span id="best-score-display" className="text-sm sm:text-base font-bold font-mono text-amber-600 dark:text-amber-400">
                  {bestRecord.moves} ح / {formatTime(bestRecord.timeSeconds)}
                </span>
              </div>
            ) : (
              <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-medium">
                -- : --
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Achievements Quick Summary & Carousel */}
      {activeTab === 'achievements' && (
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 shadow-xs transition-all space-y-3">
          {/* Progress bar */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-slate-700 dark:text-slate-200">
                مستوى الإنجاز العام: {completionPercentage}%
              </span>
            </div>
            <span className="text-slate-500 font-medium font-mono">
              حللت {achievementStats.totalWins} ألغاز
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {/* Quick Badges Showcase */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 max-h-[160px] overflow-y-auto scrollbar-thin">
            {ALL_ACHIEVEMENTS.slice(0, 6).map((ach) => {
              const isUnlocked = achievementStats.unlockedIds.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`p-2 rounded-lg border flex items-center gap-2 transition-all ${
                    isUnlocked
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/70 text-slate-800 dark:text-slate-200'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 opacity-60 text-slate-400'
                  }`}
                  title={`${ach.title}: ${ach.description}`}
                >
                  <div className="shrink-0">
                    {isUnlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <span className="block text-xs font-bold truncate">
                      {ach.title}
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {ach.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {onOpenAchievementsModal && (
            <button
              type="button"
              onClick={onOpenAchievementsModal}
              className="w-full text-center py-1.5 text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold cursor-pointer"
            >
              عرض جميع الشارات والأوسمة ({ALL_ACHIEVEMENTS.length} إنجازات) ←
            </button>
          )}
        </div>
      )}
    </div>
  );
};

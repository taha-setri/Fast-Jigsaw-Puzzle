import React from 'react';
import { X, Award, CheckCircle2, Lock, Sparkles, Trophy, Zap, Timer, Medal, Grid, Crown, Image as ImageIcon, Brain, Target } from 'lucide-react';
import { ALL_ACHIEVEMENTS } from '../data/achievements';
import { UserAchievementStats } from '../types';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserAchievementStats;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  stats,
}) => {
  if (!isOpen) return null;

  const unlockedCount = stats.unlockedIds.length;
  const totalCount = ALL_ACHIEVEMENTS.length;
  const totalPoints = ALL_ACHIEVEMENTS.filter((a) => stats.unlockedIds.includes(a.id)).reduce(
    (acc, cur) => acc + cur.rewardPoints,
    0
  );

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'Timer':
        return <Timer className="w-5 h-5 text-blue-500" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-amber-500" />;
      case 'Medal':
        return <Medal className="w-5 h-5 text-indigo-500" />;
      case 'Grid':
        return <Grid className="w-5 h-5 text-purple-500" />;
      case 'Crown':
        return <Crown className="w-5 h-5 text-amber-500" />;
      case 'Image':
        return <ImageIcon className="w-5 h-5 text-emerald-500" />;
      case 'Brain':
        return <Brain className="w-5 h-5 text-pink-500" />;
      case 'Target':
        return <Target className="w-5 h-5 text-red-500" />;
      default:
        return <Award className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div
      id="achievements-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        id="achievements-modal-content"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                لوحة الإنجازات والأوسمة
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                المكافآت التقديرية لسرعة الذكاء ومهارة الحل
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overall summary cards */}
        <div className="grid grid-cols-3 gap-2 my-4">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-center">
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">
              الإنجازات المكتسبة
            </span>
            <span className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100">
              {unlockedCount} / {totalCount}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-center">
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">
              مجموع النقاط
            </span>
            <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
              {totalPoints} نقطة
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-center">
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">
              مجموع الألغاز المحلولة
            </span>
            <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {stats.totalWins}
            </span>
          </div>
        </div>

        {/* List of achievements */}
        <div className="overflow-y-auto space-y-2.5 pr-1 max-h-[420px] scrollbar-thin">
          {ALL_ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = stats.unlockedIds.includes(achievement.id);

            return (
              <div
                key={achievement.id}
                className={`p-3 rounded-xl border transition-all flex items-start gap-3.5 ${
                  isUnlocked
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 opacity-70'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    isUnlocked
                      ? 'bg-white dark:bg-slate-800 shadow-xs border border-amber-200 dark:border-amber-700'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                  }`}
                >
                  {isUnlocked ? getIcon(achievement.icon) : <Lock className="w-5 h-5 text-slate-400" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h4
                      className={`font-bold text-sm ${
                        isUnlocked
                          ? 'text-slate-900 dark:text-slate-100'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {achievement.title}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono shrink-0 ${
                        isUnlocked
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      +{achievement.rewardPoints} نقطة
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {achievement.description}
                  </p>
                </div>

                <div className="shrink-0 self-center">
                  {isUnlocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      مكتمل
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      مغلق
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all cursor-pointer shadow-sm"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

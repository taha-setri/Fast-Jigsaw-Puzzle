import React from 'react';
import { LayoutGrid, Brain, Zap, Sparkles } from 'lucide-react';
import { ActiveGame } from '../types';

interface GameSelectorTabsProps {
  activeGame: ActiveGame;
  onSelectGame: (game: ActiveGame) => void;
}

export const GameSelectorTabs: React.FC<GameSelectorTabsProps> = ({
  activeGame,
  onSelectGame,
}) => {
  const games: { id: ActiveGame; title: string; subtitle: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'sliding',
      title: 'لغز المربعات المنزلقة',
      subtitle: 'أرقام وصور مقطعة (15-Puzzle)',
      icon: <LayoutGrid className="w-4 h-4 text-amber-500" />,
      badge: 'الرئيسية',
    },
    {
      id: 'memory',
      title: 'تطابق الذاكرة الصورية',
      subtitle: 'Memory Matching Pairs',
      icon: <Brain className="w-4 h-4 text-purple-500" />,
      badge: 'جديد',
    },
    {
      id: 'pipes',
      title: 'توصيل الأنابيب والتدفق',
      subtitle: 'Smart Pipes Flow',
      icon: <Zap className="w-4 h-4 text-cyan-500" />,
      badge: 'جديد',
    },
  ];

  return (
    <div id="platform-game-selector" className="w-full max-w-2xl mx-auto mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>اختر لعبة الذكاء من المنصة:</span>
        </span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          3 ألعاب متوفرة مجاناً
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-200/70 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-300 dark:border-slate-700">
        {games.map((g) => {
          const isActive = activeGame === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onSelectGame(g.id)}
              className={`py-2 px-3 rounded-xl transition-all text-right flex flex-col justify-center cursor-pointer relative ${
                isActive
                  ? 'bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-750'
                  : 'hover:bg-white/50 dark:hover:bg-slate-850/60 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                  {g.icon}
                  <span className="truncate">{g.title}</span>
                </div>
                {g.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {g.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {g.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

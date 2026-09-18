import React, { useRef } from 'react';
import { Shuffle, RotateCcw, Eye, Hash, Image as ImageIcon, Volume2, VolumeX, Upload, Check, Lightbulb } from 'lucide-react';
import { GridSize, GameMode, PuzzleImage } from '../types';

interface GameControlsProps {
  size: GridSize;
  onSizeChange: (newSize: GridSize) => void;
  mode: GameMode;
  onModeChange: (newMode: GameMode) => void;
  onShuffle: () => void;
  onRestart: () => void;
  onOpenPreview: () => void;
  showGuideNumbers: boolean;
  onToggleGuideNumbers: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  images: PuzzleImage[];
  selectedImage: PuzzleImage;
  onSelectImage: (image: PuzzleImage) => void;
  onUploadCustomImage: (dataUrl: string) => void;
  onUseHint: () => void;
  hintsRemaining: number;
  maxHints: number;
  isWon: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  size,
  onSizeChange,
  mode,
  onModeChange,
  onShuffle,
  onRestart,
  onOpenPreview,
  showGuideNumbers,
  onToggleGuideNumbers,
  soundEnabled,
  onToggleSound,
  images,
  selectedImage,
  onSelectImage,
  onUploadCustomImage,
  onUseHint,
  hintsRemaining,
  maxHints,
  isWon,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUploadCustomImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id="game-controls-container" className="w-full max-w-lg mx-auto space-y-3.5 mb-6">
      {/* Primary Action Buttons: Shuffle, Restart, Sound */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {/* Shuffle Button */}
        <button
          id="btn-shuffle"
          type="button"
          onClick={onShuffle}
          className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          <Shuffle className="w-4 h-4" />
          <span>خلط القطع</span>
        </button>

        {/* Restart Button */}
        <button
          id="btn-restart"
          type="button"
          onClick={onRestart}
          className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm border border-slate-300 dark:border-slate-700 shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>إعادة البدء</span>
        </button>

        {/* Hint Button */}
        <button
          id="btn-hint"
          type="button"
          onClick={onUseHint}
          disabled={hintsRemaining <= 0 || isWon}
          className={`flex-1 min-w-[110px] inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-all active:scale-95 cursor-pointer border ${
            hintsRemaining > 0 && !isWon
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/80 hover:bg-amber-100 dark:hover:bg-amber-900/60'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-60'
          }`}
          title={
            hintsRemaining > 0
              ? `إضاءة القطعة التالية (متبقي ${hintsRemaining} تلميحات)`
              : 'نفدت التلميحات المتاحة لهذه الجولة'
          }
        >
          <Lightbulb className={`w-4 h-4 ${hintsRemaining > 0 && !isWon ? 'text-amber-500 fill-amber-400' : 'text-slate-400'}`} />
          <span>تلميح</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-amber-200/70 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-mono">
            {hintsRemaining}/{maxHints}
          </span>
        </button>

        {/* Sound Toggle */}
        <button
          id="btn-toggle-sound"
          type="button"
          onClick={onToggleSound}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            soundEnabled
              ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
          }`}
          title={soundEnabled ? 'كتم المؤثرات الصوتية' : 'تشغيل المؤثرات الصوتية'}
          aria-label="تبديل الصوت"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      {/* Grid Size & Mode Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Grid Size (3x3, 4x4, 5x5) */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-1.5 flex items-center justify-between shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2">
            حجم الشبكة:
          </span>
          <div className="flex items-center gap-1">
            {([3, 4, 5] as GridSize[]).map((s) => (
              <button
                key={s}
                id={`grid-size-${s}x${s}`}
                type="button"
                onClick={() => onSizeChange(s)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  size === s
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                {s}x{s}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selector (Numbers vs Images) */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-1.5 flex items-center justify-between shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2">
            النمط:
          </span>
          <div className="flex items-center gap-1">
            <button
              id="mode-numbers"
              type="button"
              onClick={() => onModeChange('numbers')}
              className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'numbers'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>أرقام</span>
            </button>
            <button
              id="mode-images"
              type="button"
              onClick={() => onModeChange('images')}
              className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'images'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>صور</span>
            </button>
          </div>
        </div>
      </div>

      {/* Image-Specific Extra Controls */}
      {mode === 'images' && (
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 shadow-xs space-y-2.5 transition-all">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                اختر صورة اللغز:
              </span>
              <span className="text-[11px] text-slate-400">
                ({selectedImage.name})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Toggle Guide Numbers on Images */}
              <button
                id="btn-toggle-guide-numbers"
                type="button"
                onClick={onToggleGuideNumbers}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  showGuideNumbers
                    ? 'bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                    : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300'
                }`}
                title="إظهار أرقام الدليل التوجيهية فوق قطع الصور"
              >
                <Hash className="w-3 h-3" />
                <span>أرقام المساعدة</span>
              </button>

              {/* View Full Original Image */}
              <button
                id="btn-open-preview"
                type="button"
                onClick={onOpenPreview}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                title="معاينة الصورة الأصلية المكتملة"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>معاينة الأصل</span>
              </button>
            </div>
          </div>

          {/* Image Thumbnails and Custom Upload */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
            {images.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => onSelectImage(img)}
                className={`relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedImage.id === img.id
                    ? 'border-amber-500 scale-105 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 opacity-75 hover:opacity-100'
                }`}
                title={img.name}
              >
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                {selectedImage.id === img.id && (
                  <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white drop-shadow-md" />
                  </div>
                )}
              </button>
            ))}

            {/* Custom Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              id="btn-upload-image"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 w-12 h-12 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-amber-400 dark:hover:border-amber-500 flex flex-col items-center justify-center text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors bg-slate-50 dark:bg-slate-850 cursor-pointer"
              title="رفع صورة خاصة من جهازك"
            >
              <Upload className="w-4 h-4 mb-0.5" />
              <span className="text-[9px] font-bold">رفع</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
